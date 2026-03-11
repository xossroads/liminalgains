import { useState, useEffect } from 'react';
import { subscribe } from './syncManager';

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState({ status: 'synced', pendingCount: 0 });

  useEffect(() => {
    return subscribe(setSyncStatus);
  }, []);

  return syncStatus;
}
