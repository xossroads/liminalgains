import { LogOut } from 'lucide-react';

export default function Settings({ weightUnit, onWeightUnitChange, username, onLogout }) {
  return (
    <div className="pb-24 md:pb-8">
      <div className="px-4 py-4">
        <h1 className="text-base font-display font-medium text-white">Settings</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Account */}
        <div className="bg-surface-700 rounded-lg p-4 border border-surface-500">
          <div className="text-xs text-muted uppercase tracking-wider font-display mb-3">
            Account
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-mono text-white">{username}</div>
              <div className="text-xs font-body text-muted mt-0.5">Signed in</div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-600 text-muted hover:text-white transition-colors min-h-[44px] text-sm font-display"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Weight unit toggle */}
        <div className="bg-surface-700 rounded-lg p-4 border border-surface-500">
          <div className="text-xs text-muted uppercase tracking-wider font-display mb-3">
            Weight Unit
          </div>
          <div className="flex gap-2">
            {['lbs', 'kg'].map((unit) => (
              <button
                key={unit}
                onClick={() => onWeightUnitChange(unit)}
                className={`flex-1 py-3 rounded-lg font-mono text-sm transition-colors min-h-[44px] ${
                  weightUnit === unit
                    ? 'bg-accent text-surface-900 font-medium'
                    : 'bg-surface-600 text-muted hover:text-white'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-surface-700 rounded-lg p-4 border border-surface-500">
          <div className="text-xs text-muted uppercase tracking-wider font-display mb-3">
            About
          </div>
          <div className="text-center py-4">
            <div className="font-display font-bold text-xl tracking-wide text-white">
              LIMINAL GAINS
            </div>
            <div className="font-mono text-xs text-muted mt-1">liminalgains.fit</div>
            <p className="text-xs text-muted font-body mt-4 max-w-xs mx-auto leading-relaxed">
              The threshold state of fitness progress — the in-between space where daily
              effort accumulates before results become visible.
            </p>
            <div className="font-mono text-xs text-muted/50 mt-4">v2.0.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
