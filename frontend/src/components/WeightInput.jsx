import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

export default function WeightInput({ weight, unit, onSave }) {
  const [value, setValue] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (weight != null) setValue(String(weight));
    else setValue('');
    setDirty(false);
  }, [weight]);

  const handleChange = (e) => {
    setValue(e.target.value);
    setDirty(true);
  };

  const handleSave = () => {
    if (value && !isNaN(Number(value))) {
      onSave(value);
      setDirty(false);
    }
  };

  return (
    <div className="px-4">
      <div className="bg-surface-700 rounded-lg p-4 border border-surface-500">
        <div className="text-xs text-muted uppercase tracking-wider font-display mb-2">
          Today's Weight
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={value}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Tap to log"
            className="bg-surface-600 border border-surface-500 rounded-lg px-3 py-2 text-4xl font-mono text-accent w-40 outline-none focus:border-accent/50 placeholder:text-muted/40 placeholder:text-lg"
          />
          <span className="text-lg font-mono text-muted">{unit}</span>
          {dirty && value && (
            <button
              onClick={handleSave}
              className="ml-auto bg-accent text-surface-900 rounded-lg p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center active:bg-accent-dim transition-colors"
            >
              <Check size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
