import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold" style={{ color: d.payload.fill }}>{d.name}</p>
      <p className="text-slate-600">{d.value.toLocaleString()} declines</p>
    </div>
  );
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-slate-800 capitalize">{d.payload.reason}</p>
      <p className="text-slate-600">{d.value} declines ({d.payload.pct}%)</p>
    </div>
  );
}

export default function DeclineBreakdown({ declineData }) {
  if (!declineData || declineData.total === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-2">Decline Breakdown</h2>
        <p className="text-slate-400 text-sm">No declines in current filter set.</p>
      </div>
    );
  }

  const { donut, topReasons, total, soft, hard } = declineData;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800">Decline Breakdown</h2>
        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          {total.toLocaleString()} total declines
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Donut: Soft vs Hard */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Soft vs Hard Declines
          </h3>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donut}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donut.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{total}</span>
              <span className="text-xs text-slate-400">declines</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-2">
            {donut.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.fill }} />
                <span className="text-xs text-slate-600">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal bar: Top 5 reasons */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Top Decline Reasons
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={topReasons}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis
                type="category"
                dataKey="reason"
                width={110}
                tick={{ fontSize: 11, fill: '#475569' }}
                tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
