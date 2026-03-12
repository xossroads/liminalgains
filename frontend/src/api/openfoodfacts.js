import client from './client';

export async function searchFoods(query, pageSize = 10) {
  const res = await client.get('/food-search', {
    params: { q: query, page_size: pageSize },
  });
  return res.data;
}
