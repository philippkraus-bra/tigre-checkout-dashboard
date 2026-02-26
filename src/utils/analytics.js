// Pure analytics functions for the checkout funnel dashboard

/**
 * Filter transactions by the active filter set.
 * Filters: paymentMethod, country, dateRange (days), amountTier
 */
export function filterTransactions(transactions, filters) {
  const { paymentMethod, country, dateRange, amountTier } = filters;
  const now = new Date('2026-02-26T23:59:59Z');

  return transactions.filter((txn) => {
    // Payment method filter
    if (paymentMethod !== 'all' && txn.paymentMethod !== paymentMethod) return false;

    // Country filter
    if (country !== 'all' && txn.country !== country) return false;

    // Date range filter
    if (dateRange !== 'all') {
      const days = Number(dateRange);
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - days);
      if (new Date(txn.timestamp) < cutoff) return false;
    }

    // Amount tier filter
    if (amountTier !== 'all') {
      if (amountTier === 'low' && txn.amount >= 50) return false;
      if (amountTier === 'mid' && (txn.amount < 50 || txn.amount > 200)) return false;
      if (amountTier === 'high' && txn.amount <= 200) return false;
    }

    return true;
  });
}

/**
 * Build funnel stage data for Recharts FunnelChart.
 * Returns array of { name, value, fillPct, dropPct, fill }
 *
 * 4-stage funnel (clean sequential):
 *   Payment Selected → Auth Attempted → Auth Approved → Completed
 *
 * Note: 3DS is a credit-card-only subset step, not a universal stage.
 * It is surfaced as `threeDsInfo` metadata rather than a funnel stage,
 * to avoid the funnel going UP from stage 3 (86) to stage 4 (362).
 */
export function buildFunnelData(transactions) {
  const total = transactions.length;
  if (total === 0) return [];

  const authAttempted = transactions.filter((t) => t.reached_authorization).length;

  // Auth approved = passed auth AND passed 3DS (if applicable).
  // 3DS failures are stored as hard_decline, so excluding declines covers both.
  const authApprovedCount = transactions.filter(
    (t) => t.reached_authorization && t.status !== 'hard_decline' && t.status !== 'soft_decline'
  ).length;

  const completed = transactions.filter((t) => t.completed).length;

  // 3DS metadata (informational, not a funnel stage)
  const threeDsAttempted = transactions.filter((t) => t.reached_3ds).length;
  const threeDsPassed = transactions.filter(
    (t) => t.reached_3ds && t.status !== 'hard_decline'
  ).length;
  const threeDsFailRate =
    threeDsAttempted > 0
      ? (((threeDsAttempted - threeDsPassed) / threeDsAttempted) * 100).toFixed(1)
      : null;

  const stages = [
    { name: 'Payment Selected', value: total },
    { name: 'Auth Attempted', value: authAttempted },
    { name: 'Auth Approved', value: authApprovedCount },
    { name: 'Completed', value: completed },
  ];

  // Annotate with drop-off %
  const result = stages.map((stage, i) => {
    const prev = i === 0 ? stage.value : stages[i - 1].value;
    const dropCount = prev - stage.value;
    const dropPct = prev > 0 ? ((dropCount / prev) * 100).toFixed(1) : '0.0';
    const fillPct = ((stage.value / total) * 100).toFixed(1);
    return {
      ...stage,
      fillPct: Number(fillPct),
      dropPct: i === 0 ? null : Number(dropPct),
      fill: FUNNEL_COLORS[i] || '#6366f1',
    };
  });

  // Attach 3DS info as metadata on the result array
  result.threeDsInfo =
    threeDsAttempted > 0
      ? { attempted: threeDsAttempted, passed: threeDsPassed, failRate: threeDsFailRate }
      : null;

  return result;
}

const FUNNEL_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

/**
 * Calculate 4 summary KPI cards.
 */
export function calcSummaryCards(transactions) {
  const total = transactions.length;
  if (total === 0) {
    return {
      authRate: null,
      totalVolume: 0,
      worstMethod: null,
      biggestDropStage: null,
    };
  }

  // 1. Overall auth rate: approved / attempted
  const attempted = transactions.filter((t) => t.reached_authorization).length;
  const approved = transactions.filter(
    (t) => t.reached_authorization && t.status !== 'hard_decline' && t.status !== 'soft_decline'
  ).length;
  const authRate = attempted > 0 ? (approved / attempted) * 100 : null;

  // 2. Total volume
  const totalVolume = total;

  // 3. Worst payment method by auth rate
  const methods = ['credit_card', 'pse', 'oxxo'];
  const methodRates = methods.map((m) => {
    const mTxns = transactions.filter((t) => t.paymentMethod === m);
    const mAttempted = mTxns.filter((t) => t.reached_authorization).length;
    const mApproved = mTxns.filter(
      (t) => t.reached_authorization && t.status !== 'hard_decline' && t.status !== 'soft_decline'
    ).length;
    const rate = mAttempted > 0 ? (mApproved / mAttempted) * 100 : null;
    return { method: m, rate, count: mTxns.length };
  }).filter((m) => m.count > 0 && m.rate !== null);

  const worstMethod = methodRates.length > 0
    ? methodRates.reduce((worst, cur) => (cur.rate < worst.rate ? cur : worst))
    : null;

  // 4. Biggest drop-off stage
  const funnelData = buildFunnelData(transactions);
  let biggestDropStage = null;
  if (funnelData.length > 1) {
    const drops = funnelData.slice(1);
    const maxDrop = drops.reduce((max, s) => (s.dropPct > max.dropPct ? s : max), drops[0]);
    biggestDropStage = maxDrop;
  }

  return { authRate, totalVolume, worstMethod, biggestDropStage };
}

/**
 * Build decline breakdown data.
 */
export function buildDeclineData(transactions) {
  const declined = transactions.filter(
    (t) => t.status === 'soft_decline' || t.status === 'hard_decline'
  );

  const softCount = declined.filter((t) => t.status === 'soft_decline').length;
  const hardCount = declined.filter((t) => t.status === 'hard_decline').length;

  // Top 5 decline reasons
  const reasonCounts = {};
  declined.forEach((t) => {
    if (t.declineReason) {
      reasonCounts[t.declineReason] = (reasonCounts[t.declineReason] || 0) + 1;
    }
  });

  const topReasons = Object.entries(reasonCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([reason, count]) => ({
      reason: reason.replace(/_/g, ' '),
      count,
      pct: declined.length > 0 ? ((count / declined.length) * 100).toFixed(1) : '0',
    }));

  return {
    total: declined.length,
    soft: softCount,
    hard: hardCount,
    donut: [
      { name: 'Soft Decline', value: softCount, fill: '#f59e0b' },
      { name: 'Hard Decline', value: hardCount, fill: '#ef4444' },
    ],
    topReasons,
  };
}

/**
 * Build daily time series data for auth rate line chart.
 * Returns array of { date, authRate, [method]: authRate }
 */
export function buildTimeSeriesData(transactions) {
  // Group by date
  const byDate = {};
  transactions.forEach((t) => {
    const date = t.timestamp.slice(0, 10);
    if (!byDate[date]) {
      byDate[date] = { credit_card: [], pse: [], oxxo: [], all: [] };
    }
    byDate[date][t.paymentMethod].push(t);
    byDate[date].all.push(t);
  });

  const calcRate = (txns) => {
    const attempted = txns.filter((t) => t.reached_authorization).length;
    const approved = txns.filter(
      (t) => t.reached_authorization && t.status !== 'hard_decline' && t.status !== 'soft_decline'
    ).length;
    return attempted > 0 ? Math.round((approved / attempted) * 100) : null;
  };

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, groups]) => ({
      date,
      overall: calcRate(groups.all),
      credit_card: calcRate(groups.credit_card),
      pse: calcRate(groups.pse),
      oxxo: calcRate(groups.oxxo),
    }));
}

export const METHOD_LABELS = {
  credit_card: 'Credit Card',
  pse: 'PSE',
  oxxo: 'OXXO',
};

export const COUNTRY_LABELS = {
  CO: 'Colombia',
  PE: 'Peru',
  MX: 'Mexico',
};
