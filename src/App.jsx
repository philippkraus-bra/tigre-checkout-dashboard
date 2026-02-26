import { useState, useMemo } from 'react';
import './App.css';
import { TRANSACTIONS } from './data/generateTransactions';
import {
  filterTransactions,
  buildFunnelData,
  calcSummaryCards,
  buildDeclineData,
  buildTimeSeriesData,
} from './utils/analytics';
import FilterBar from './components/FilterBar';
import SummaryCards from './components/SummaryCards';
import FunnelChartComponent from './components/FunnelChart';
import DeclineBreakdown from './components/DeclineBreakdown';
import TimeSeriesChart from './components/TimeSeriesChart';

const DEFAULT_FILTERS = {
  paymentMethod: 'all',
  country: 'all',
  dateRange: 'all',
  amountTier: 'all',
};

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => filterTransactions(TRANSACTIONS, filters),
    [filters]
  );

  const funnelData = useMemo(() => buildFunnelData(filtered), [filtered]);
  const metrics = useMemo(() => calcSummaryCards(filtered), [filtered]);
  const declineData = useMemo(() => buildDeclineData(filtered), [filtered]);
  const timeData = useMemo(() => buildTimeSeriesData(filtered), [filtered]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Tigre Fashion
              </h1>
              <p className="text-xs text-slate-500 leading-tight">Checkout Drop-Off Visualizer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            {TRANSACTIONS.length.toLocaleString()} transactions loaded
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filters */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* Summary KPI Cards */}
        <SummaryCards metrics={metrics} />

        {/* Funnel — main visualization */}
        <FunnelChartComponent funnelData={funnelData} />

        {/* Stretch charts: Decline breakdown + Time series */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DeclineBreakdown declineData={declineData} />
          <TimeSeriesChart timeData={timeData} activeMethod={filters.paymentMethod} />
        </div>

        {/* Key Insights */}
        <KeyInsights />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-8 py-4 text-center text-xs text-slate-400">
        Tigre Fashion — Checkout Analytics Dashboard · Prototype · All data synthetic
      </footer>
    </div>
  );
}

function KeyInsights() {
  const insights = [
    {
      icon: '🇵🇪',
      title: 'Peru is the biggest problem',
      body: 'Authorization rate ~13pp below Colombia. Likely a processor routing issue worth investigating with your payment provider.',
      severity: 'high',
    },
    {
      icon: '💳',
      title: 'High-value card transactions need attention',
      body: 'Auth rates drop sharply above $200, suggesting 3DS friction + issuer risk rules. Consider soft-decline retries or PSE as fallback.',
      severity: 'medium',
    },
    {
      icon: '🧾',
      title: 'OXXO has high selection but low completion',
      body: 'Cash-pay voucher abandonment is significant. In-app reminders or SMS follow-ups could recover this segment.',
      severity: 'medium',
    },
  ];

  const severityStyle = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-amber-200 bg-amber-50',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-base font-semibold text-slate-800 mb-4">Key Insights</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {insights.map((ins) => (
          <div
            key={ins.title}
            className={`rounded-lg border p-4 ${severityStyle[ins.severity]}`}
          >
            <div className="text-xl mb-2">{ins.icon}</div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">{ins.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{ins.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
