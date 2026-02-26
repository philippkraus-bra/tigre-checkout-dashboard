// Generates public/transactions.json from the deterministic synthetic dataset.
// Run: node scripts/export-data.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Inline the generator (avoids Vite-specific import issues in plain Node)
const COUNTRIES = ['CO', 'PE', 'MX'];
const METHODS = ['credit_card', 'pse', 'oxxo'];
const DECLINE_REASONS = [
  'insufficient_funds','suspected_fraud','card_expired',
  'bank_timeout','do_not_honor','invalid_card',
];

function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function isoTimestamp(daysAgo) {
  const base = new Date('2026-02-26T00:00:00Z');
  base.setDate(base.getDate() - daysAgo);
  base.setHours(randomInt(0,23), randomInt(0,59), randomInt(0,59));
  return base.toISOString();
}

function generate(count = 650) {
  let seed = 42;
  const rng = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  const savedRandom = Math.random;
  Math.random = rng;

  const txns = [];
  for (let i = 1; i <= count; i++) {
    const country = weightedPick(COUNTRIES, [55, 20, 25]);
    let paymentMethod;
    if (country === 'CO') paymentMethod = weightedPick(['credit_card','pse'],[55,45]);
    else if (country === 'MX') paymentMethod = weightedPick(['credit_card','oxxo'],[65,35]);
    else paymentMethod = 'credit_card';

    const amount = Math.round((Math.random() * 490 + 10) * 100) / 100;
    const daysAgo = randomInt(0, 29);
    const timestamp = isoTimestamp(daysAgo);

    let authRate = 0.78;
    if (country === 'PE') authRate = 0.65;
    if (paymentMethod === 'credit_card' && amount > 200) authRate = country === 'PE' ? 0.58 : 0.68;
    if (paymentMethod === 'pse') authRate = Math.min(authRate + 0.05, 0.92);
    if (paymentMethod === 'oxxo') authRate = 0.95;

    const reached_authorization = Math.random() < 0.85;
    let auth_approved = false;
    let status = 'abandoned';
    let declineReason = null;

    if (reached_authorization) {
      auth_approved = Math.random() < authRate;
      if (!auth_approved) {
        status = Math.random() < 0.55 ? 'soft_decline' : 'hard_decline';
        declineReason = weightedPick(DECLINE_REASONS, [35,20,15,15,10,5]);
      }
    }

    let reached_3ds = false;
    if (auth_approved && paymentMethod === 'credit_card') {
      reached_3ds = Math.random() < 0.40;
      if (reached_3ds && Math.random() < 0.12) {
        status = 'hard_decline'; declineReason = 'suspected_fraud'; auth_approved = false;
      }
    }

    let completed = false;
    if (auth_approved) {
      completed = paymentMethod === 'oxxo' ? Math.random() > 0.35 : Math.random() > 0.03;
      status = completed ? 'success' : 'abandoned';
    }

    txns.push({
      id: `txn_${String(i).padStart(4,'0')}`, timestamp, country, paymentMethod,
      amount, reached_authorization, reached_3ds, completed, status, declineReason,
    });
  }

  Math.random = savedRandom;
  return txns;
}

const transactions = generate(650);
const outPath = resolve(__dirname, '../public/transactions.json');
writeFileSync(outPath, JSON.stringify(transactions, null, 2));
console.log(`✓ Exported ${transactions.length} transactions → public/transactions.json`);
