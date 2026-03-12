import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { getAllDatesWithData, getDaySummary, replaceEntriesForDate, putWeight } from '../db/idb';
import { fetchHistory } from '../api/entries';
import HistoryChart from '../components/HistoryChart';

export default function History({ weightUnit }) {
  const [days, setDays] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    loadDays();
  }, []);

  async function loadDays() {
    // Load from local IndexedDB first (instant)
    const dates = await getAllDatesWithData();
    const summaries = await Promise.all(dates.map(getDaySummary));
    setDays(summaries);

    // Background fetch from server to get latest data
    try {
      const serverDays = await fetchHistory();
      if (serverDays && serverDays.length > 0) {
        // Update IndexedDB with server data
        for (const day of serverDays) {
          // Update weight in IndexedDB
          if (day.weight != null) {
            await putWeight({
              date: day.date,
              weight_value: day.weight,
              unit: day.unit || 'lbs',
              syncStatus: 'synced',
            });
          }
        }

        // Use server summaries directly (they're already aggregated)
        const merged = serverDays.map(d => ({
          date: d.date,
          totals: d.totals,
          weight: d.weight,
          unit: d.unit,
          entryCount: d.entry_count,
        }));
        setDays(merged);
      }
    } catch (err) {
      // Offline or error — local data is already displayed
      console.warn('History server fetch failed:', err);
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  async function toggleExpand(date) {
    if (expanded === date) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(date);
    const summary = await getDaySummary(date);
    setDetail(summary);
  }

  if (days.length === 0) {
    return (
      <div className="py-16 text-center text-muted text-sm font-body">
        No history yet. Start logging to see past days.
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-8">
      <div className="px-4 py-4">
        <h1 className="text-base font-display font-medium text-white">History</h1>
      </div>

      <div className="py-3">
        <HistoryChart days={days} weightUnit={weightUnit} />
      </div>

      <div className="px-4 py-2">
        <h2 className="text-xs text-muted uppercase tracking-wider font-display">Daily Log</h2>
      </div>

      <div className="space-y-1">
        {days.map((day) => (
          <div key={day.date}>
            <button
              onClick={() => toggleExpand(day.date)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-700/50 active:bg-surface-700 transition-colors min-h-[52px]"
            >
              <div className="flex items-center gap-4">
                <div className="text-sm font-body text-white">{formatDate(day.date)}</div>
                <div className="text-xs font-mono text-muted">{day.date}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-mono text-muted-light">{Math.round(day.totals.calories)} cal</span>
                  <span className="text-xs font-mono text-muted mx-2">|</span>
                  <span className="text-xs font-mono text-muted-light">{Math.round(day.totals.protein)}g pro</span>
                  {day.weight != null && (
                    <>
                      <span className="text-xs font-mono text-muted mx-2">|</span>
                      <span className="text-xs font-mono text-accent">{Number(day.weight).toFixed(1)} {weightUnit}</span>
                    </>
                  )}
                </div>
                <ChevronRight
                  size={16}
                  className={`text-muted transition-transform ${expanded === day.date ? 'rotate-90' : ''}`}
                />
              </div>
            </button>
            {expanded === day.date && detail && (
              <div className="px-6 pb-4 bg-surface-700/30 border-t border-surface-600">
                <div className="grid grid-cols-5 gap-3 py-3">
                  {[
                    { label: 'Calories', value: Math.round(detail.totals.calories), unit: 'kcal' },
                    { label: 'Protein', value: Math.round(detail.totals.protein), unit: 'g' },
                    { label: 'Carbs', value: Math.round(detail.totals.carbs), unit: 'g' },
                    { label: 'Fiber', value: Math.round(detail.totals.fiber), unit: 'g' },
                    { label: 'Fat', value: Math.round(detail.totals.fat), unit: 'g' },
                  ].map(({ label, value, unit }) => (
                    <div key={label} className="text-center">
                      <div className="text-[10px] text-muted uppercase tracking-wider font-display">{label}</div>
                      <div className="text-sm font-mono text-white mt-0.5">{value}</div>
                      <div className="text-[10px] font-mono text-muted">{unit}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs font-mono text-muted mt-1">{detail.entryCount} entries logged</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
