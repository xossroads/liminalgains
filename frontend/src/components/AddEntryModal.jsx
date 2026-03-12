import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Search, Minus, Plus, Loader2 } from 'lucide-react';
import { searchFoods } from '../api/openfoodfacts';

export default function AddEntryModal({ open, onClose, onAdd, onEdit, editingEntry }) {
  const [mode, setMode] = useState('search'); // 'search' | 'manual'
  const [form, setForm] = useState({ food_name: '', calories: '', protein: '', carbs: '', fiber: '', fat: '' });
  const nameRef = useRef(null);
  const searchRef = useRef(null);
  const isEditing = !!editingEntry;

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState(1);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (open && editingEntry) {
      setMode('manual');
      setForm({
        food_name: editingEntry.food_name || '',
        calories: editingEntry.calories != null ? String(editingEntry.calories) : '',
        protein: editingEntry.protein != null ? String(editingEntry.protein) : '',
        carbs: editingEntry.carbs != null ? String(editingEntry.carbs) : '',
        fiber: editingEntry.fiber != null ? String(editingEntry.fiber) : '',
        fat: editingEntry.fat != null ? String(editingEntry.fat) : '',
      });
      setSelected(null);
      setQuery('');
      setResults([]);
    } else if (open) {
      setMode('search');
      setForm({ food_name: '', calories: '', protein: '', carbs: '', fiber: '', fat: '' });
      setSelected(null);
      setServings(1);
      setQuery('');
      setResults([]);
    }
  }, [open, editingEntry]);

  useEffect(() => {
    if (open && mode === 'search' && searchRef.current) {
      setTimeout(() => searchRef.current.focus(), 100);
    } else if (open && mode === 'manual' && nameRef.current) {
      setTimeout(() => nameRef.current.focus(), 100);
    }
  }, [open, mode]);

  const doSearch = useCallback(async (term) => {
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const foods = await searchFoods(term.trim());
      setResults(foods);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const selectFood = (food) => {
    setSelected(food);
    setServings(1);
    setResults([]);
    setQuery(food.name);
  };

  const adjustServings = (delta) => {
    setServings(prev => Math.max(0.5, +(prev + delta).toFixed(1)));
  };

  const getScaled = (val) => {
    if (val == null) return null;
    return Math.round(val * servings);
  };

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'search' && selected) {
      const data = {
        food_name: selected.name,
        calories: getScaled(selected.calories),
        protein: getScaled(selected.protein),
        carbs: getScaled(selected.carbs),
        fiber: getScaled(selected.fiber),
        fat: getScaled(selected.fat),
      };
      if (isEditing) {
        onEdit(editingEntry.clientId, data);
      } else {
        onAdd(data);
      }
      onClose();
      return;
    }

    if (mode === 'manual') {
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
    }
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
          <div className="flex items-center justify-between mb-4">
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

          {/* Mode toggle */}
          {!isEditing && (
            <div className="flex bg-surface-700 rounded-lg p-1 mb-4">
              <button
                type="button"
                onClick={() => setMode('search')}
                className={`flex-1 py-2 rounded-md text-xs font-display font-medium transition-colors min-h-[36px] ${
                  mode === 'search'
                    ? 'bg-accent text-surface-900'
                    : 'text-muted hover:text-white'
                }`}
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`flex-1 py-2 rounded-md text-xs font-display font-medium transition-colors min-h-[36px] ${
                  mode === 'manual'
                    ? 'bg-accent text-surface-900'
                    : 'text-muted hover:text-white'
                }`}
              >
                Manual
              </button>
            </div>
          )}

          {/* Search mode */}
          {mode === 'search' && !isEditing && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  className="w-full bg-surface-700 border border-surface-500 rounded-lg pl-9 pr-3 py-3 text-white font-body outline-none focus:border-accent/50 min-h-[44px]"
                  placeholder="Search foods..."
                />
                {searching && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin" />
                )}
              </div>

              {/* Search results */}
              {results.length > 0 && !selected && (
                <div className="bg-surface-700 border border-surface-500 rounded-lg max-h-[200px] overflow-y-auto">
                  {results.map((food, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectFood(food)}
                      className="w-full text-left px-3 py-2.5 hover:bg-surface-600 active:bg-surface-600 transition-colors border-b border-surface-600 last:border-b-0 min-h-[44px]"
                    >
                      <div className="text-sm font-body text-white truncate">{food.name}</div>
                      {food.brand && (
                        <div className="text-[11px] font-body text-muted truncate">{food.brand}</div>
                      )}
                      <div className="text-[11px] font-mono text-muted mt-0.5">
                        {food.calories != null ? `${Math.round(food.calories)} cal` : ''}
                        {food.protein != null ? ` · ${Math.round(food.protein)}g pro` : ''}
                        {food.servingSize && <span className="text-muted/50"> / {food.servingSize}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected food details */}
              {selected && (
                <div className="space-y-3">
                  <div className="bg-surface-700 border border-surface-500 rounded-lg p-3">
                    <div className="text-sm font-body text-white mb-1">{selected.name}</div>
                    {selected.brand && (
                      <div className="text-xs font-body text-muted mb-2">{selected.brand}</div>
                    )}
                    {selected.servingSize && (
                      <div className="text-xs font-mono text-muted/70 mb-3">
                        Serving: {selected.servingSize}
                      </div>
                    )}

                    {/* Serving adjuster */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted uppercase tracking-wider font-display">Servings</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => adjustServings(-0.5)}
                          disabled={servings <= 0.5}
                          className="w-9 h-9 rounded-lg bg-surface-600 flex items-center justify-center text-white disabled:opacity-30 active:bg-surface-500 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-lg font-mono text-accent w-10 text-center">{servings}</span>
                        <button
                          type="button"
                          onClick={() => adjustServings(0.5)}
                          className="w-9 h-9 rounded-lg bg-surface-600 flex items-center justify-center text-white active:bg-surface-500 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Scaled nutrition preview */}
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: 'Cal', value: getScaled(selected.calories), unit: '' },
                        { label: 'Pro', value: getScaled(selected.protein), unit: 'g' },
                        { label: 'Carbs', value: getScaled(selected.carbs), unit: 'g' },
                        { label: 'Fiber', value: getScaled(selected.fiber), unit: 'g' },
                        { label: 'Fat', value: getScaled(selected.fat), unit: 'g' },
                      ].map(({ label, value, unit }) => (
                        <div key={label} className="text-center">
                          <div className="text-[10px] text-muted uppercase tracking-wider font-display">{label}</div>
                          <div className="text-sm font-mono text-white mt-0.5">
                            {value != null ? value : '—'}
                          </div>
                          {unit && <div className="text-[10px] font-mono text-muted">{unit}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual mode */}
          {(mode === 'manual' || isEditing) && (
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
          )}

          <button
            type="submit"
            disabled={mode === 'search' && !isEditing && !selected}
            className="mt-6 w-full bg-accent text-surface-900 font-display font-medium py-3.5 rounded-lg active:bg-accent-dim transition-colors min-h-[48px] text-sm disabled:opacity-40"
          >
            {isEditing ? 'Save Changes' : 'Add Entry'}
          </button>
        </form>
      </div>
    </>
  );
}
