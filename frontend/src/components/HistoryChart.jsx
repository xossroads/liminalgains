import { useState, useMemo } from 'react';

const metrics = [
  { key: 'weight', label: 'Weight', color: '#c9a96e', unit: '' },
  { key: 'calories', label: 'Cal', color: '#e06c75', unit: 'kcal' },
  { key: 'protein', label: 'Pro', color: '#61afef', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: '#98c379', unit: 'g' },
  { key: 'fiber', label: 'Fiber', color: '#c678dd', unit: 'g' },
  { key: 'fat', label: 'Fat', color: '#d19a66', unit: 'g' },
];

function getValue(day, key) {
  if (key === 'weight') return day.weight;
  return day.totals[key] ?? null;
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

  if (sorted.length < 2) {
    return (
      <div className="px-4 py-6 text-center text-muted text-sm font-body">
        Need at least 2 days of data to show a chart.
      </div>
    );
  }

  const padding = { top: 20, right: 16, bottom: 32, left: 48 };
  const width = 600;
  const height = 200;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const activeMetrics = metrics.filter(m => active.has(m.key));

  // Compute scales per metric (each gets its own Y axis range)
  const scales = useMemo(() => {
    const s = {};
    for (const m of metrics) {
      if (!active.has(m.key)) continue;
      const values = sorted.map(d => getValue(d, m.key)).filter(v => v != null);
      if (values.length === 0) continue;
      let min = Math.min(...values);
      let max = Math.max(...values);
      if (min === max) { min -= 1; max += 1; }
      const range = max - min;
      s[m.key] = { min: min - range * 0.1, max: max + range * 0.1 };
    }
    return s;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, [...active].join(',')]);

  const xStep = sorted.length > 1 ? chartW / (sorted.length - 1) : 0;

  function getPoints(key) {
    const scale = scales[key];
    if (!scale) return [];
    return sorted.map((d, i) => {
      const val = getValue(d, key);
      if (val == null) return null;
      const x = padding.left + i * xStep;
      const y = padding.top + chartH - ((val - scale.min) / (scale.max - scale.min)) * chartH;
      return { x, y, val, date: d.date };
    }).filter(Boolean);
  }

  // Date labels
  const labelCount = Math.min(sorted.length, 6);
  const labelStep = Math.max(1, Math.floor((sorted.length - 1) / (labelCount - 1)));
  const dateLabels = [];
  for (let i = 0; i < sorted.length; i += labelStep) {
    dateLabels.push({ i, date: sorted[i].date });
  }
  if (dateLabels[dateLabels.length - 1]?.i !== sorted.length - 1) {
    dateLabels.push({ i: sorted.length - 1, date: sorted[sorted.length - 1].date });
  }

  function formatShortDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  // Show Y-axis labels for the single active metric, or for the first if multiple
  const yAxisMetric = activeMetrics.length === 1 ? activeMetrics[0] : activeMetrics[0];
  const yAxisScale = yAxisMetric ? scales[yAxisMetric.key] : null;

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

        {/* SVG Chart */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = padding.top + chartH * (1 - pct);
            return (
              <line
                key={pct}
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke="#333333"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Y-axis labels — color-coded to first active metric */}
          {yAxisScale && [0, 0.5, 1].map(pct => {
            const val = yAxisScale.min + (yAxisScale.max - yAxisScale.min) * pct;
            const y = padding.top + chartH * (1 - pct);
            return (
              <text
                key={pct}
                x={padding.left - 6}
                y={y + 3}
                textAnchor="end"
                fill={activeMetrics.length > 1 ? yAxisMetric.color : '#6b6b6b'}
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {Math.round(val)}
              </text>
            );
          })}

          {/* Date labels */}
          {dateLabels.map(({ i, date }) => (
            <text
              key={i}
              x={padding.left + i * xStep}
              y={height - 4}
              textAnchor="middle"
              fill="#6b6b6b"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              {formatShortDate(date)}
            </text>
          ))}

          {/* Lines and dots */}
          {activeMetrics.map(m => {
            const points = getPoints(m.key);
            if (points.length < 2) return null;
            const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            return (
              <g key={m.key}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={m.color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill={m.color}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Legend with latest values and ranges */}
        {activeMetrics.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {activeMetrics.map(m => {
              const scale = scales[m.key];
              const points = getPoints(m.key);
              const latest = points.length > 0 ? points[points.length - 1].val : null;
              const unit = m.key === 'weight' ? weightUnit : m.unit;
              return (
                <div key={m.key} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-[10px] font-mono" style={{ color: m.color }}>
                    {m.label}
                    {latest != null && (
                      <span className="text-muted">
                        {' '}{Math.round(latest)}{unit ? ` ${unit}` : ''}
                      </span>
                    )}
                    {scale && activeMetrics.length > 1 && (
                      <span className="text-muted">
                        {' '}({Math.round(scale.min + (scale.max - scale.min) * 0.05)}–{Math.round(scale.max - (scale.max - scale.min) * 0.05)})
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
