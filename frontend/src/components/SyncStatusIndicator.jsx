import { useSyncStatus } from '../sync/useSyncStatus';

const statusConfig = {
  synced: { label: 'Synced', dotClass: 'bg-green-700' },
  offline: { label: 'Offline', dotClass: 'bg-accent' },
  pending: { label: 'Pending', dotClass: 'bg-accent' },
  syncing: { label: 'Syncing...', dotClass: 'bg-accent animate-pulse' },
};

export default function SyncStatusIndicator() {
  const { status, pendingCount } = useSyncStatus();
  const config = statusConfig[status] || statusConfig.synced;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-700 text-xs font-mono text-muted-light">
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
      {status === 'pending' && pendingCount > 0 && (
        <span className="text-accent">{pendingCount}</span>
      )}
    </div>
  );
}
