import {
  FunnelChart as RechartsFunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#7c3aed', '#9333ea', '#a855f7', '#c084fc'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-800 mb-1">{data.name}</p>
      <p className="text-slate-600">
        <span className="font-medium text-indigo-600">{data.value.toLocaleString()}</span>{' '}
        transactions
      </p>
      <p className="text-slate-500">
        {data.fillPct}% of total
      </p>
      {data.dropPct !== null && (
        <p className="text-red-500 font-medium mt-1">
          -{data.dropPct}% dropped from previous stage
        </p>
      )}
    </div>
  );
}

function DropAnnotation({ funnelData }) {
  if (!funnelData.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2 justify-center">
      {funnelData.slice(1).map((stage) => (
        <span
          key={stage.name}
          className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium"
        >
          <span className="text-slate-500">{stage.name}:</span>
          <span>-{stage.dropPct}% drop</span>
        </span>
      ))}
    </div>
  );
}

export default function FunnelChartComponent({ funnelData }) {
  if (!funnelData || funnelData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Checkout Funnel</h2>
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <p className="text-sm font-medium">No transactions match the current filters</p>
          <p className="text-xs mt-1">Try adjusting your filter criteria</p>
        </div>
      </div>
    );
  }

  // Color each stage
  const coloredData = funnelData.map((stage, i) => ({
    ...stage,
    fill: COLORS[i] || COLORS[COLORS.length - 1],
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800">Checkout Funnel</h2>
        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          {funnelData[0]?.value.toLocaleString()} total transactions
        </span>
      </div>

      {/* Stage legend with counts */}
      <div className="grid gap-2 mb-4">
        {funnelData.map((stage, i) => (
          <div key={stage.name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: COLORS[i] || COLORS[COLORS.length - 1] }}
            />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm text-slate-700 font-medium">{stage.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-800">
                  {stage.value.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 w-12 text-right">
                  {stage.fillPct}%
                </span>
                {stage.dropPct !== null && (
                  <span className="text-xs text-red-500 font-medium w-16 text-right">
                    -{stage.dropPct}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Funnel */}
      <ResponsiveContainer width="100%" height={280}>
        <RechartsFunnelChart>
          <Tooltip content={<CustomTooltip />} />
          <Funnel
            dataKey="value"
            data={coloredData}
            isAnimationActive={true}
            labelLine={false}
          >
            <LabelList
              position="right"
              content={(props) => {
                const { x, y, width, height, value, index } = props;
                const stage = coloredData[index];
                if (!stage) return null;
                return (
                  <text
                    x={x + width + 8}
                    y={y + height / 2}
                    dominantBaseline="middle"
                    fontSize={12}
                    fill="#64748b"
                  >
                    {stage.name}: {value?.toLocaleString()}
                  </text>
                );
              }}
            />
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>

      <DropAnnotation funnelData={funnelData} />

      {/* 3DS callout — credit cards only, shown as informational note */}
      {funnelData.threeDsInfo && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>
            <strong className="text-slate-700">3DS (credit cards):</strong>{' '}
            {funnelData.threeDsInfo.attempted} challenged →{' '}
            {funnelData.threeDsInfo.passed} passed —{' '}
            <span className="text-red-500 font-medium">{funnelData.threeDsInfo.failRate}% fail rate</span>
          </span>
        </div>
      )}
    </div>
  );
}
