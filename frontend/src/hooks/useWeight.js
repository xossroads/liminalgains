import { useState, useEffect, useCallback } from 'react';
import * as idb from '../db/idb';
import { fetchWeight } from '../api/weight';
import { sync } from '../sync/syncManager';

export function useWeight(date, unit) {
  const [weight, setWeight] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setWeight(null);
    const local = await idb.getWeight(date);
    if (local) setWeight(local.weight_value);
    setLoading(false);

    try {
      const server = await fetchWeight(date);
      if (server) {
        await idb.putWeight({
          date,
          weight_value: server.weight_value,
          unit: server.unit,
          syncStatus: 'synced',
        });
        setWeight(server.weight_value);
      }
    } catch {
      // offline
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const saveWeight = useCallback(async (value) => {
    if (value === '' || value == null) {
      // Clear weight
      setWeight(null);
      await idb.putWeight({
        date,
        weight_value: null,
        unit,
        syncStatus: 'pending_delete',
      });
      sync();
      return;
    }
    const numVal = Number(value);
    if (isNaN(numVal)) return;
    setWeight(numVal);
    await idb.putWeight({
      date,
      weight_value: numVal,
      unit,
      syncStatus: 'pending',
    });
    sync();
  }, [date, unit]);

  return { weight, loading, saveWeight };
}
