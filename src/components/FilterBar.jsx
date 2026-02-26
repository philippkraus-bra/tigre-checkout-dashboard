export default function FilterBar({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  const selectClass =
    'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Filters
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Payment Method */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Payment Method
          </label>
          <select className={selectClass} value={filters.paymentMethod} onChange={set('paymentMethod')}>
            <option value="all">All Methods</option>
            <option value="credit_card">Credit Card</option>
            <option value="pse">PSE</option>
            <option value="oxxo">OXXO</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Country</label>
          <select className={selectClass} value={filters.country} onChange={set('country')}>
            <option value="all">All Countries</option>
            <option value="CO">Colombia</option>
            <option value="PE">Peru</option>
            <option value="MX">Mexico</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Date Range</label>
          <select className={selectClass} value={filters.dateRange} onChange={set('dateRange')}>
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>

        {/* Amount Tier */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Amount Tier</label>
          <select className={selectClass} value={filters.amountTier} onChange={set('amountTier')}>
            <option value="all">All Amounts</option>
            <option value="low">&lt; $50</option>
            <option value="mid">$50 – $200</option>
            <option value="high">&gt; $200</option>
          </select>
        </div>
      </div>

      {/* Active filter pills */}
      <ActivePills filters={filters} onChange={onChange} />
    </div>
  );
}

function ActivePills({ filters, onChange }) {
  const active = [];
  if (filters.paymentMethod !== 'all')
    active.push({ key: 'paymentMethod', label: filters.paymentMethod.replace('_', ' ') });
  if (filters.country !== 'all')
    active.push({ key: 'country', label: { CO: 'Colombia', PE: 'Peru', MX: 'Mexico' }[filters.country] });
  if (filters.dateRange !== 'all')
    active.push({ key: 'dateRange', label: `Last ${filters.dateRange}d` });
  if (filters.amountTier !== 'all')
    active.push({
      key: 'amountTier',
      label: { low: '< $50', mid: '$50–$200', high: '> $200' }[filters.amountTier],
    });

  if (active.length === 0) return null;

  const reset = (key) =>
    onChange({ ...filters, [key]: 'all' });

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {active.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200"
        >
          {label}
          <button
            onClick={() => reset(key)}
            className="ml-1 hover:text-indigo-900 font-bold leading-none"
            aria-label={`Remove ${label} filter`}
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={() =>
          onChange({ paymentMethod: 'all', country: 'all', dateRange: 'all', amountTier: 'all' })
        }
        className="text-xs text-slate-400 hover:text-slate-600 underline"
      >
        Clear all
      </button>
    </div>
  );
}
