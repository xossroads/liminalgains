const cards = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fiber', label: 'Fiber', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
];

export default function SummaryCards({ totals, weight, weightUnit }) {
  return (
    <div className="px-4 grid grid-cols-3 gap-3">
      {cards.map(({ key, label, unit }) => (
        <div
          key={key}
          className="bg-surface-700 rounded-lg p-3 border border-surface-500"
        >
          <div className="text-xs text-muted uppercase tracking-wider font-display">{label}</div>
          <div className="text-2xl font-mono text-white mt-1">
            {Math.round(totals[key])}
          </div>
          <div className="text-xs font-mono text-muted">{unit}</div>
        </div>
      ))}
      <div className="bg-surface-700 rounded-lg p-3 border border-surface-500">
        <div className="text-xs text-muted uppercase tracking-wider font-display">Weight</div>
        <div className="text-2xl font-mono text-white mt-1">
          {weight != null ? Number(weight).toFixed(1) : '--'}
        </div>
        <div className="text-xs font-mono text-muted">{weightUnit}</div>
      </div>
    </div>
  );
}
