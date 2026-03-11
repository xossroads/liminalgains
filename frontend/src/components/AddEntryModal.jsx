import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddEntryModal({ open, onClose, onAdd, onEdit, editingEntry }) {
  const [form, setForm] = useState({ food_name: '', calories: '', protein: '', carbs: '', fiber: '', fat: '' });
  const nameRef = useRef(null);
  const isEditing = !!editingEntry;

  useEffect(() => {
    if (open && nameRef.current) {
      setTimeout(() => nameRef.current.focus(), 100);
    }
    if (open && editingEntry) {
      setForm({
        food_name: editingEntry.food_name || '',
        calories: editingEntry.calories != null ? String(editingEntry.calories) : '',
        protein: editingEntry.protein != null ? String(editingEntry.protein) : '',
        carbs: editingEntry.carbs != null ? String(editingEntry.carbs) : '',
        fiber: editingEntry.fiber != null ? String(editingEntry.fiber) : '',
        fat: editingEntry.fat != null ? String(editingEntry.fat) : '',
      });
    } else if (open) {
      setForm({ food_name: '', calories: '', protein: '', carbs: '', fiber: '', fat: '' });
    }
  }, [open, editingEntry]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.food_name.trim()) return;
    const hasNutrition = ['calories', 'protein', 'carbs', 'fiber', 'fat'].some(k => form[k] !== '');
    if (!hasNutrition) return;
    const data = {
      food_name: form.food_name.trim(),
      calories: form.calories ? Number(form.calories) : null,
      protein: form.protein ? Number(form.protein) : null,
      carbs: form.carbs ? Number(form.carbs) : null,
      fiber: form.fiber ? Number(form.fiber) : null,
      fat: form.fat ? Number(form.fat) : null,
    };
    if (isEditing) {
      onEdit(editingEntry.clientId, data);
    } else {
      onAdd(data);
    }
    onClose();
  };

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const fields = [
    { key: 'calories', label: 'Calories', unit: 'kcal' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'carbs', label: 'Carbs', unit: 'g' },
    { key: 'fiber', label: 'Fiber', unit: 'g' },
    { key: 'fat', label: 'Fat', unit: 'g' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <form
          onSubmit={handleSubmit}
          className="bg-surface-800 border-t border-surface-500 md:border md:rounded-xl md:max-w-md md:w-full rounded-t-2xl p-5 pb-8 md:pb-5 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-display font-medium text-white">
              {isEditing ? 'Edit Food' : 'Add Food'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider font-display mb-1.5">
                Food Name
              </label>
              <input
                ref={nameRef}
                type="text"
                value={form.food_name}
                onChange={(e) => setField('food_name', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-3 text-white font-body outline-none focus:border-accent/50 min-h-[44px]"
                placeholder="e.g. Chicken breast"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {fields.map(({ key, label, unit }) => (
                <div key={key} className={key === 'calories' ? 'col-span-2' : ''}>
                  <label className="block text-xs text-muted uppercase tracking-wider font-display mb-1.5">
                    {label} <span className="text-muted/50">({unit})</span>
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-3 font-mono text-white outline-none focus:border-accent/50 min-h-[44px]"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-accent text-surface-900 font-display font-medium py-3.5 rounded-lg active:bg-accent-dim transition-colors min-h-[48px] text-sm"
          >
            {isEditing ? 'Save Changes' : 'Add Entry'}
          </button>
        </form>
      </div>
    </>
  );
}
