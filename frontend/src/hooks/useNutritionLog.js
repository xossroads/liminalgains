import { useState, useEffect, useCallback } from 'react';
import * as idb from '../db/idb';
import { fetchEntries } from '../api/entries';
import { sync } from '../sync/syncManager';

export function useNutritionLog(date) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // Read from local first
    const local = await idb.getAllEntriesByDate(date);
    setEntries(local);
    setLoading(false);

    // Background fetch from server
    try {
      const server = await fetchEntries(date);
      if (server && server.length > 0) {
        await idb.replaceEntriesForDate(date, server);
        const merged = await idb.getAllEntriesByDate(date);
        setEntries(merged);
      }
    } catch {
      // offline, local data is fine
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = useCallback(async (data) => {
    const entry = {
      clientId: crypto.randomUUID(),
      date,
      food_name: data.food_name,
      calories: data.calories || null,
      protein: data.protein || null,
      carbs: data.carbs || null,
      fiber: data.fiber || null,
      fat: data.fat || null,
      syncStatus: 'pending_create',
    };
    await idb.addEntry(entry);
    setEntries(prev => [...prev, entry]);
    sync();
  }, [date]);

  const removeEntry = useCallback(async (clientId) => {
    await idb.deleteEntry(clientId);
    setEntries(prev => prev.filter(e => e.clientId !== clientId));
    sync();
  }, []);

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (Number(e.calories) || 0),
      protein: acc.protein + (Number(e.protein) || 0),
      carbs: acc.carbs + (Number(e.carbs) || 0),
      fiber: acc.fiber + (Number(e.fiber) || 0),
      fat: acc.fat + (Number(e.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0 }
  );

  return { entries, totals, loading, addEntry, removeEntry, reload: load };
}
