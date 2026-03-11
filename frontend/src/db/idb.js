import { openDB } from 'idb';

const DB_NAME = 'liminalgains';
const DB_VERSION = 1;

let dbPromise;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('food_entries')) {
          const entryStore = db.createObjectStore('food_entries', { keyPath: 'clientId' });
          entryStore.createIndex('date', 'date');
          entryStore.createIndex('syncStatus', 'syncStatus');
        }
        if (!db.objectStoreNames.contains('daily_weight')) {
          const weightStore = db.createObjectStore('daily_weight', { keyPath: 'date' });
          weightStore.createIndex('syncStatus', 'syncStatus');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// Food entries
export async function getAllEntriesByDate(date) {
  const db = await getDB();
  const all = await db.getAllFromIndex('food_entries', 'date', date);
  return all.filter(e => e.syncStatus !== 'pending_delete');
}

export async function addEntry(entry) {
  const db = await getDB();
  await db.put('food_entries', entry);
  return entry;
}

export async function deleteEntry(clientId) {
  const db = await getDB();
  const entry = await db.get('food_entries', clientId);
  if (!entry) return;
  if (entry.syncStatus === 'pending_create') {
    await db.delete('food_entries', clientId);
  } else {
    entry.syncStatus = 'pending_delete';
    await db.put('food_entries', entry);
  }
}

export async function getEntryByClientId(clientId) {
  const db = await getDB();
  return db.get('food_entries', clientId);
}

export async function putEntry(entry) {
  const db = await getDB();
  await db.put('food_entries', entry);
}

export async function removeEntry(clientId) {
  const db = await getDB();
  await db.delete('food_entries', clientId);
}

export async function getPendingEntries() {
  const db = await getDB();
  const all = await db.getAll('food_entries');
  return all.filter(e => e.syncStatus !== 'synced');
}

// Weight
export async function getWeight(date) {
  const db = await getDB();
  return db.get('daily_weight', date);
}

export async function putWeight(record) {
  const db = await getDB();
  await db.put('daily_weight', record);
}

export async function getPendingWeights() {
  const db = await getDB();
  const all = await db.getAll('daily_weight');
  return all.filter(w => w.syncStatus !== 'synced');
}

// Bulk replace entries for a date (after server fetch)
export async function replaceEntriesForDate(date, serverEntries) {
  const db = await getDB();
  const tx = db.transaction('food_entries', 'readwrite');
  const store = tx.objectStore('food_entries');
  const existing = await store.index('date').getAll(date);

  // Remove synced entries for this date
  for (const entry of existing) {
    if (entry.syncStatus === 'synced') {
      await store.delete(entry.clientId);
    }
  }

  // Add server entries
  for (const se of serverEntries) {
    const normalizedDate = typeof se.date === 'string' ? se.date.split('T')[0] : date;
    await store.put({
      clientId: se.clientId || `server-${se.id}`,
      serverId: se.id,
      date: normalizedDate,
      food_name: se.food_name,
      calories: se.calories,
      protein: se.protein,
      carbs: se.carbs,
      fiber: se.fiber,
      fat: se.fat,
      syncStatus: 'synced',
    });
  }

  await tx.done;
}

// Settings
export async function getSetting(key) {
  const db = await getDB();
  const record = await db.get('settings', key);
  return record?.value;
}

export async function putSetting(key, value) {
  const db = await getDB();
  await db.put('settings', { key, value });
}

// History: get all unique dates with entries or weight
export async function getAllDatesWithData() {
  const db = await getDB();
  const entries = await db.getAll('food_entries');
  const weights = await db.getAll('daily_weight');
  const dateSet = new Set();
  entries.forEach(e => { if (e.syncStatus !== 'pending_delete') dateSet.add(e.date); });
  weights.forEach(w => dateSet.add(w.date));
  return Array.from(dateSet).sort().reverse();
}

export async function getDaySummary(date) {
  const entries = await getAllEntriesByDate(date);
  const weight = await getWeight(date);
  const totals = { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0 };
  entries.forEach(e => {
    totals.calories += Number(e.calories) || 0;
    totals.protein += Number(e.protein) || 0;
    totals.carbs += Number(e.carbs) || 0;
    totals.fiber += Number(e.fiber) || 0;
    totals.fat += Number(e.fat) || 0;
  });
  return { date, totals, weight: weight?.weight_value ?? null, unit: weight?.unit ?? 'lbs', entryCount: entries.length };
}
