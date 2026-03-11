import { useState, useEffect } from 'react';

export default function WeightInput({ weight, unit, onSave }) {
  const [value, setValue] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (weight != null) setValue(String(weight));
    else setValue('');
  }, [weight]);

  const handleBlur = () => {
    setEditing(false);
    if (value && !isNaN(Number(value))) {
      onSave(value);
    }
  };

  return (
    <div className="px-4">
      <div className="bg-surface-700 rounded-lg p-4 border border-surface-500">
        <div className="text-xs text-muted uppercase tracking-wider font-display mb-2">
          Today's Weight
        </div>
        <div className="flex items-baseline gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={value}
            onChange={(e) => { setValue(e.target.value); setEditing(true); }}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            placeholder="--"
            className="bg-transparent text-4xl font-mono text-accent w-32 outline-none placeholder:text-surface-500"
          />
          <span className="text-lg font-mono text-muted">{unit}</span>
        </div>
      </div>
    </div>
  );
}
