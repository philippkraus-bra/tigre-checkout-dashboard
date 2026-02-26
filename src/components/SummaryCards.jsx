import { METHOD_LABELS } from '../utils/analytics';

function authRateColor(rate) {
  if (rate === null) return 'text-slate-400';
  if (rate < 75) return 'text-red-600';
  if (rate <= 82) return 'text-amber-500';
  return 'text-emerald-600';
}

function authRateBg(rate) {
  if (rate === null) return 'bg-slate-50 border-slate-200';
  if (rate < 75) return 'bg-red-50 border-red-200';
  if (rate <= 82) return 'bg-amber-50 border-amber-200';
  return 'bg-emerald-50 border-emerald-200';
}

function AuthRateBadge({ rate }) {
  if (rate === null) return <span className="text-slate-400 text-sm">No data</span>;
  const color = rate < 75 ? 'bg-red-100 text-red-700' : rate <= 82 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
  const label = rate < 75 ? 'Critical' : rate <= 82 ? 'Warning' : 'Good';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
  );
}

export default function SummaryCards({ metrics }) {
  const { authRate, totalVolume, worstMethod, biggestDropStage } = metrics;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Card 1: Auth Rate */}
      <div className={`rounded-xl border p-4 shadow-sm ${authRateBg(authRate)}`}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Auth Rate
        </p>
        <p className={`text-3xl font-bold ${authRateColor(authRate)}`}>
          {authRate !== null ? `${authRate.toFixed(1)}%` : '—'}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">approved / attempted</span>
          <AuthRateBadge rate={authRate} />
        </div>
      </div>

      {/* Card 2: Total Volume */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Total Volume
        </p>
        <p className="text-3xl font-bold text-slate-800">
          {totalVolume.toLocaleString()}
        </p>
        <p className="text-xs text-slate-500 mt-2">transactions in view</p>
      </div>

      {/* Card 3: Worst Payment Method */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Worst Method
        </p>
        {worstMethod ? (
          <>
            <p className="text-2xl font-bold text-slate-800">
              {METHOD_LABELS[worstMethod.method] || worstMethod.method}
            </p>
            <p className="text-sm text-red-500 font-medium mt-1">
              {worstMethod.rate.toFixed(1)}% auth rate
            </p>
          </>
        ) : (
          <p className="text-slate-400 text-sm mt-2">No data</p>
        )}
      </div>

      {/* Card 4: Biggest Drop-off Stage */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Biggest Drop-off
        </p>
        {biggestDropStage ? (
          <>
            <p className="text-xl font-bold text-slate-800 leading-tight">
              {biggestDropStage.name}
            </p>
            <p className="text-sm text-red-500 font-medium mt-1">
              -{biggestDropStage.dropPct}% lost here
            </p>
          </>
        ) : (
          <p className="text-slate-400 text-sm mt-2">No data</p>
        )}
      </div>
    </div>
  );
}
