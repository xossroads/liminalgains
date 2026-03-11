import { ChevronLeft, ChevronRight } from 'lucide-react';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function DateNav({ date, onDateChange }) {
  const shift = (delta) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    onDateChange(d.toISOString().split('T')[0]);
  };

  return (
    <div className="flex items-center justify-between px-2">
      <button
        onClick={() => shift(-1)}
        className="p-3 rounded-lg active:bg-surface-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <ChevronLeft size={24} className="text-muted-light" />
      </button>
      <div className="text-center">
        <div className="text-sm font-display font-medium text-white">{formatDate(date)}</div>
        <div className="text-xs font-mono text-muted">{date}</div>
      </div>
      <button
        onClick={() => shift(1)}
        className="p-3 rounded-lg active:bg-surface-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <ChevronRight size={24} className="text-muted-light" />
      </button>
    </div>
  );
}
