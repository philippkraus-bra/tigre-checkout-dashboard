import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const METHOD_COLORS = {
  overall: '#6366f1',
  credit_card: '#0ea5e9',
  pse: '#10b981',
  oxxo: '#f59e0b',
};

const METHOD_LABELS = {
  overall: 'Overall',
  credit_card: 'Credit Card',
  pse: 'PSE',
  oxxo: 'OXXO',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 text-sm min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
            <span className="text-slate-600">{METHOD_LABELS[p.dataKey] || p.dataKey}</span>
          </span>
          <span className="font-semibold" style={{ color: p.color }}>
            {p.value !== null ? `${p.value}%` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TimeSeriesChart({ timeData, activeMethod }) {
  if (!timeData || timeData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-2">Auth Rate Over Time</h2>
        <p className="text-slate-400 text-sm">Not enough data for time series.</p>
      </div>
    );
  }

  // Determine which lines to show
  const showMethod = activeMethod && activeMethod !== 'all';
  const lines = showMethod
    ? [
        { key: 'overall', show: true },
        { key: 'credit_card', show: activeMethod === 'credit_card' },
        { key: 'pse', show: activeMethod === 'pse' },
        { key: 'oxxo', show: activeMethod === 'oxxo' },
      ]
    : [
        { key: 'overall', show: true },
        { key: 'credit_card', show: true },
        { key: 'pse', show: true },
        { key: 'oxxo', show: true },
      ];

  const visibleLines = lines.filter((l) => l.show);

  // Format date labels
  const formatted = timeData.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800">Auth Rate Over Time</h2>
        <span className="text-xs text-slate-400">Daily authorization rate %</span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[40, 100]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-600">{METHOD_LABELS[value] || value}</span>
            )}
          />
          {/* Warning threshold line */}
          <ReferenceLine
            y={75}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: '75% threshold', position: 'right', fontSize: 10, fill: '#ef4444' }}
          />

          {visibleLines.map(({ key }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={METHOD_COLORS[key]}
              strokeWidth={key === 'overall' ? 2.5 : 1.5}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
