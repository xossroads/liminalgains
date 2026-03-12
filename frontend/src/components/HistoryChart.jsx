import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const metrics = [
  { key: 'weight', label: 'Weight', color: '#c9a96e', unit: '' },
  { key: 'calories', label: 'Cal', color: '#e06c75', unit: 'kcal' },
  { key: 'protein', label: 'Pro', color: '#61afef', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: '#98c379', unit: 'g' },
  { key: 'fiber', label: 'Fiber', color: '#c678dd', unit: 'g' },
  { key: 'fat', label: 'Fat', color: '#d19a66', unit: 'g' },
];

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function CustomTooltip({ active, payload, label, weightUnit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900 border border-surface-500 rounded px-3 py-2 shadow-lg">
      <div className="text-xs font-mono text-muted mb-1">{formatShortDate(label)}</div>
      {payload.map(p => {
        const m = metrics.find(m => m.key === p.dataKey);
        const unit = m?.key === 'weight' ? weightUnit : m?.unit;
        return (
          <div key={p.dataKey} className="text-sm font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span style={{ color: p.color }}>{m?.label}</span>
            <span className="text-white">{Math.round(p.value)}{unit ? ` ${unit}` : ''}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function HistoryChart({ days, weightUnit }) {
  const [active, setActive] = useState(new Set(['weight']));

  const sorted = useMemo(() => [...days].reverse(), [days]);

  const toggle = (key) => {
    setActive(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const chartData = useMemo(() => {
    return sorted.map(day => {
      const point = { date: day.date };
      for (const m of metrics) {
        if (m.key === 'weight') {
          point[m.key] = day.weight ?? undefined;
        } else {
          const val = day.totals[m.key];
          point[m.key] = val != null ? Number(val) : undefined;
        }
      }
      return point;
    });
  }, [sorted]);

  const activeMetrics = metrics.filter(m => active.has(m.key));

  // Determine which metrics need the left vs right Y-axis
  // First active metric gets left axis, second gets right (if ranges differ significantly)
  const yAxes = useMemo(() => {
    if (activeMetrics.length <= 1) return { left: activeMetrics[0]?.key, right: null };

    // Group metrics by similar range to decide axis assignment
    const ranges = {};
    for (const m of activeMetrics) {
      const values = chartData.map(d => d[m.key]).filter(v => v != null);
      if (values.length === 0) continue;
      ranges[m.key] = { min: Math.min(...values), max: Math.max(...values) };
    }

    const keys = Object.keys(ranges);
    if (keys.length < 2) return { left: keys[0], right: null };

    // If max values differ by more than 3x, use dual axes
    const maxVals = keys.map(k => ranges[k].max);
    const ratio = Math.max(...maxVals) / Math.min(...maxVals);
    if (ratio > 3) {
      // Put the smallest-range metric on the right
      const sortedByMax = [...keys].sort((a, b) => ranges[a].max - ranges[b].max);
      return { left: sortedByMax[sortedByMax.length - 1], right: sortedByMax[0], ranges };
    }

    return { left: keys[0], right: null, ranges };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, [...active].join(',')]);

  if (sorted.length < 2) {
    return (
      <div className="px-4 py-6 text-center text-muted text-sm font-body">
        Need at least 2 days of data to show a chart.
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="bg-surface-700 rounded-lg border border-surface-500 p-3">
        {/* Toggle buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {metrics.map(m => (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              className={`px-2.5 py-1.5 rounded text-xs font-mono transition-colors min-h-[32px] ${
                active.has(m.key)
                  ? 'text-surface-900 font-medium'
                  : 'bg-surface-600 text-muted'
              }`}
              style={active.has(m.key) ? { backgroundColor: m.color } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Recharts Line Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#333333" strokeWidth={0.5} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fill: '#6b6b6b', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={{ stroke: '#333333' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#6b6b6b', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              allowDecimals={false}
            />
            {yAxes.right && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#6b6b6b', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                allowDecimals={false}
              />
            )}
            <Tooltip content={<CustomTooltip weightUnit={weightUnit} />} />
            {activeMetrics.map(m => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                stroke={m.color}
                strokeWidth={2}
                dot={{ r: 3, fill: m.color, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: m.color, strokeWidth: 0 }}
                yAxisId={yAxes.right === m.key ? 'right' : 'left'}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        {activeMetrics.length > 1 && (
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {activeMetrics.map(m => (
              <div key={m.key} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-xs font-mono text-muted">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
