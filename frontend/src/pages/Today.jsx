import { useState } from 'react';
import { Plus } from 'lucide-react';
import DateNav from '../components/DateNav';
import SummaryCards from '../components/SummaryCards';
import WeightInput from '../components/WeightInput';
import FoodTable from '../components/FoodTable';
import AddEntryModal from '../components/AddEntryModal';
import { useNutritionLog } from '../hooks/useNutritionLog';
import { useWeight } from '../hooks/useWeight';

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Today({ weightUnit }) {
  const [date, setDate] = useState(getToday);
  const [modalOpen, setModalOpen] = useState(false);
  const { entries, totals, addEntry, removeEntry } = useNutritionLog(date);
  const { weight, saveWeight } = useWeight(date, weightUnit);

  return (
    <div className="pb-24 md:pb-8">
      <div className="py-4">
        <DateNav date={date} onDateChange={setDate} />
      </div>

      <div className="py-3">
        <SummaryCards totals={totals} weight={weight} weightUnit={weightUnit} />
      </div>

      <div className="py-3">
        <WeightInput weight={weight} unit={weightUnit} onSave={saveWeight} />
      </div>

      <div className="py-3">
        <div className="px-4 mb-2">
          <h2 className="text-xs text-muted uppercase tracking-wider font-display">Food Log</h2>
        </div>
        <FoodTable entries={entries} totals={totals} onDelete={removeEntry} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="md:hidden fixed bottom-20 right-5 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg active:bg-accent-dim transition-colors z-20"
      >
        <Plus size={24} className="text-surface-900" />
      </button>

      {/* Desktop add button */}
      <div className="hidden md:block px-4 py-2">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-surface-900 px-4 py-2.5 rounded-lg font-display text-sm font-medium hover:bg-accent-dim transition-colors"
        >
          <Plus size={16} />
          Add Food
        </button>
      </div>

      <AddEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addEntry}
      />
    </div>
  );
}
