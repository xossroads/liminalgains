import { Trash2 } from 'lucide-react';

export default function FoodTable({ entries, totals, onDelete }) {
  if (entries.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-muted text-sm font-body">
        No entries yet. Tap + to add food.
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="overflow-x-auto rounded-lg border border-surface-500">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-700 text-muted text-xs uppercase tracking-wider font-display">
              <th className="text-left p-3">Name</th>
              <th className="text-right p-3 w-14">Cal</th>
              <th className="text-right p-3 w-14">Pro</th>
              <th className="text-right p-3 w-14 hidden sm:table-cell">Carbs</th>
              <th className="text-right p-3 w-14 hidden sm:table-cell">Fiber</th>
              <th className="text-right p-3 w-14 hidden sm:table-cell">Fat</th>
              <th className="w-10 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.clientId}
                className="border-t border-surface-600 hover:bg-surface-700/50"
              >
                <td className="p-3 font-body text-white truncate max-w-[140px]">{entry.food_name}</td>
                <td className="p-3 text-right font-mono text-muted-light">{entry.calories ?? '-'}</td>
                <td className="p-3 text-right font-mono text-muted-light">{entry.protein ?? '-'}</td>
                <td className="p-3 text-right font-mono text-muted-light hidden sm:table-cell">{entry.carbs ?? '-'}</td>
                <td className="p-3 text-right font-mono text-muted-light hidden sm:table-cell">{entry.fiber ?? '-'}</td>
                <td className="p-3 text-right font-mono text-muted-light hidden sm:table-cell">{entry.fat ?? '-'}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => onDelete(entry.clientId)}
                    className="p-1.5 rounded hover:bg-surface-600 active:bg-surface-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Trash2 size={14} className="text-muted" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-surface-500 bg-surface-700">
              <td className="p-3 font-display text-xs uppercase text-muted">Total</td>
              <td className="p-3 text-right font-mono text-accent font-medium">{Math.round(totals.calories)}</td>
              <td className="p-3 text-right font-mono text-accent font-medium">{Math.round(totals.protein)}</td>
              <td className="p-3 text-right font-mono text-accent font-medium hidden sm:table-cell">{Math.round(totals.carbs)}</td>
              <td className="p-3 text-right font-mono text-accent font-medium hidden sm:table-cell">{Math.round(totals.fiber)}</td>
              <td className="p-3 text-right font-mono text-accent font-medium hidden sm:table-cell">{Math.round(totals.fat)}</td>
              <td className="p-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
