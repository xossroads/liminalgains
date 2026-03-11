import client from './client';

export async function fetchWeight(date) {
  const res = await client.get(`/weight/${date}`);
  return res.data;
}

export async function updateWeight(date, weight_value, unit) {
  const res = await client.put(`/weight/${date}`, { weight_value, unit });
  return res.data;
}
