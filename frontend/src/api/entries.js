import client from './client';

export async function fetchEntries(date) {
  const res = await client.get(`/entries/${date}`);
  return res.data;
}

export async function createEntry(entry) {
  const res = await client.post('/entries', entry);
  return res.data;
}

export async function updateEntryAPI(id, entry) {
  const res = await client.put(`/entries/${id}`, entry);
  return res.data;
}

export async function deleteEntryAPI(id) {
  const res = await client.delete(`/entries/${id}`);
  return res.data;
}

export async function fetchHistory() {
  const res = await client.get('/history');
  return res.data;
}
