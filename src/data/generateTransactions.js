// Synthetic transaction generator with built-in discoverable patterns
// Patterns:
//   - Colombia ~55%, Mexico ~25%, Peru ~20% of volume
//   - Credit 50%, PSE 30%, OXXO 20% of volume
//   - Overall auth rate ~78%
//   - Peru auth rate ~65% (noticeably worse)
//   - OXXO completion rate lower (cash abandon)
//   - Card txns > $200 auth rate drops to ~68%
//   - 3DS failure rate ~12%

const COUNTRIES = ['CO', 'PE', 'MX'];
const METHODS = ['credit_card', 'pse', 'oxxo'];
const DECLINE_REASONS = [
  'insufficient_funds',
  'suspected_fraud',
  'card_expired',
  'bank_timeout',
  'do_not_honor',
  'invalid_card',
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomDeclineReason() {
  return weightedPick(DECLINE_REASONS, [35, 20, 15, 15, 10, 5]);
}

function isoTimestamp(daysAgo, seed) {
  const base = new Date('2026-02-26T00:00:00Z');
  base.setDate(base.getDate() - daysAgo);
  base.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return base.toISOString();
}

function generateTransaction(id) {
  // Country distribution: CO 55%, PE 20%, MX 25%
  const country = weightedPick(COUNTRIES, [55, 20, 25]);

  // Payment method distribution: credit_card 50%, pse 30%, oxxo 20%
  // PSE only available in Colombia, OXXO only in Mexico — enforce routing
  let paymentMethod;
  if (country === 'CO') {
    paymentMethod = weightedPick(['credit_card', 'pse'], [55, 45]);
  } else if (country === 'MX') {
    paymentMethod = weightedPick(['credit_card', 'oxxo'], [65, 35]);
  } else {
    // PE — only credit card
    paymentMethod = 'credit_card';
  }

  const amount = Math.round(randomBetween(10, 500) * 100) / 100;
  const daysAgo = randomInt(0, 29);
  const timestamp = isoTimestamp(daysAgo, id);

  // --- Auth rate logic ---
  // Base auth rate: ~78%
  // Peru penalty: ~13pp lower → ~65%
  // Card > $200 penalty: drops to ~68%
  let authRate = 0.78;
  if (country === 'PE') authRate = 0.65;
  if (paymentMethod === 'credit_card' && amount > 200) {
    authRate = country === 'PE' ? 0.58 : 0.68;
  }
  // PSE slightly better (bank transfer, lower fraud)
  if (paymentMethod === 'pse') authRate = Math.min(authRate + 0.05, 0.92);
  // OXXO doesn't have auth in the same sense — mark all OXXO as "authorized" at start
  if (paymentMethod === 'oxxo') authRate = 0.95;

  // Stage 1 → Stage 2: ~85% attempt auth (15% abandon before auth)
  const attempted_auth = Math.random() < 0.85;
  const reached_authorization = attempted_auth;

  // Stage 2 → Stage 3: authorization approved
  let auth_approved = false;
  let status = 'abandoned';
  let declineReason = null;

  if (reached_authorization) {
    auth_approved = Math.random() < authRate;
    if (!auth_approved) {
      // Declined
      const isSoft = Math.random() < 0.55; // 55% soft declines
      status = isSoft ? 'soft_decline' : 'hard_decline';
      declineReason = randomDeclineReason();
    }
  }

  // Stage 3 → Stage 4: 3DS challenge (credit cards only)
  let reached_3ds = false;
  let passed_3ds = false;
  if (auth_approved && paymentMethod === 'credit_card') {
    // ~40% of auth'd credit cards get a 3DS challenge
    reached_3ds = Math.random() < 0.40;
    if (reached_3ds) {
      // ~12% of 3DS challenges fail
      passed_3ds = Math.random() > 0.12;
      if (!passed_3ds) {
        status = 'hard_decline';
        declineReason = 'suspected_fraud';
        auth_approved = false; // treat as failed
      }
    }
  }

  // Stage 4 → Stage 5: completion
  let completed = false;
  if (auth_approved) {
    if (paymentMethod === 'oxxo') {
      // OXXO cash-pay abandonment: ~35% abandon after voucher
      completed = Math.random() > 0.35;
      if (!completed) status = 'abandoned';
    } else {
      // Small residual drop (2–5%)
      completed = Math.random() > 0.03;
      if (!completed) status = 'abandoned';
    }
    if (completed) status = 'success';
  }

  return {
    id: `txn_${String(id).padStart(4, '0')}`,
    timestamp,
    country,
    paymentMethod,
    amount,
    reached_authorization,
    reached_3ds,
    completed,
    status,
    declineReason,
  };
}

// Generate 650 transactions with a fixed seed pattern for reproducibility
function generateTransactions(count = 650) {
  // Use a deterministic approach for consistent data
  const savedRandom = Math.random;
  let seed = 42;
  Math.random = function () {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  const transactions = [];
  for (let i = 1; i <= count; i++) {
    transactions.push(generateTransaction(i));
  }

  Math.random = savedRandom;
  return transactions;
}

export const TRANSACTIONS = generateTransactions(650);
export default TRANSACTIONS;
