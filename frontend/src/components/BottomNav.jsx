import { CalendarDays, Clock, Settings } from 'lucide-react';
import logo from '../assets/logo.png';

const tabs = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav({ active, onChange }) {
  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface-800 border-t border-surface-600 z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 min-h-[56px] transition-colors ${
                active === id ? 'text-accent' : 'text-muted'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-display uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-surface-800 border-r border-surface-600 flex-col z-30">
        <div className="p-5 border-b border-surface-600 flex items-center gap-3">
          <img src={logo} alt="LG" className="w-8 h-8 rounded" />
          <div className="font-display font-bold text-lg tracking-wide text-white">LIMINAL GAINS</div>
        </div>
        <div className="flex-1 py-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-display transition-colors ${
                active === id
                  ? 'text-accent bg-surface-700 border-r-2 border-accent'
                  : 'text-muted hover:text-white hover:bg-surface-700/50'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
