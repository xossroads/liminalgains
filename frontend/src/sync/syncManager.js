import { checkHealth } from '../api/client';
import { createEntry, deleteEntryAPI } from '../api/entries';
import { updateWeight } from '../api/weight';
import { getPendingEntries, putEntry, removeEntry, getPendingWeights, putWeight } from '../db/idb';

let listeners = new Set();
let currentStatus = { status: 'synced', pendingCount: 0 };
let syncInterval = null;

function notify() {
  listeners.forEach(fn => fn({ ...currentStatus }));
}

function setStatus(status, pendingCount) {
  currentStatus = { status, pendingCount };
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  fn({ ...currentStatus });
  return () => listeners.delete(fn);
}

export async function sync() {
  const online = await checkHealth();
  if (!online) {
    const pendingEntries = await getPendingEntries();
    const pendingWeights = await getPendingWeights();
    const count = pendingEntries.length + pendingWeights.length;
    setStatus(count > 0 ? 'pending' : 'offline', count);
    return;
  }

  const pendingEntries = await getPendingEntries();
  const pendingWeights = await getPendingWeights();
  const totalPending = pendingEntries.length + pendingWeights.length;

  if (totalPending === 0) {
    setStatus('synced', 0);
    return;
  }

  setStatus('syncing', totalPending);

  // Sync food entries
  for (const entry of pendingEntries) {
    try {
      if (entry.syncStatus === 'pending_create') {
        const serverEntry = await createEntry({
          date: entry.date,
          food_name: entry.food_name,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fiber: entry.fiber,
          fat: entry.fat,
        });
        entry.serverId = serverEntry.id;
        entry.syncStatus = 'synced';
        await putEntry(entry);
      } else if (entry.syncStatus === 'pending_delete') {
        if (entry.serverId) {
          await deleteEntryAPI(entry.serverId);
        }
        await removeEntry(entry.clientId);
      }
    } catch (err) {
      console.warn('Sync entry failed:', entry.clientId, err);
    }
  }

  // Sync weights
  for (const w of pendingWeights) {
    try {
      await updateWeight(w.date, w.weight_value, w.unit);
      w.syncStatus = 'synced';
      await putWeight(w);
    } catch (err) {
      console.warn('Sync weight failed:', w.date, err);
    }
  }

  // Recheck pending count
  const remainingEntries = await getPendingEntries();
  const remainingWeights = await getPendingWeights();
  const remaining = remainingEntries.length + remainingWeights.length;
  setStatus(remaining > 0 ? 'pending' : 'synced', remaining);
}

export function startSync() {
  sync();
  syncInterval = setInterval(sync, 30000);
  window.addEventListener('online', sync);
  window.addEventListener('focus', sync);
}

export function stopSync() {
  if (syncInterval) clearInterval(syncInterval);
  window.removeEventListener('online', sync);
  window.removeEventListener('focus', sync);
}
