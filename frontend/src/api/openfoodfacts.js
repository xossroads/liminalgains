import axios from 'axios';

const off = axios.create({
  baseURL: 'https://world.openfoodfacts.org',
  timeout: 8000,
  headers: {
    'User-Agent': 'LiminalGains/1.0 (liminalgains.fit)',
  },
});

export async function searchFoods(query, pageSize = 10) {
  const res = await off.get('/cgi/search.pl', {
    params: {
      search_terms: query,
      json: true,
      page_size: pageSize,
      fields: 'product_name,brands,serving_quantity,serving_size,nutriments',
    },
  });

  const products = res.data?.products || [];

  return products
    .filter(p => p.product_name)
    .map(p => {
      const n = p.nutriments || {};
      // Prefer per-serving values, fall back to per-100g
      const hasSrv = n['energy-kcal_serving'] != null || n['proteins_serving'] != null;
      const suffix = hasSrv ? '_serving' : '_100g';

      return {
        name: p.product_name,
        brand: p.brands || null,
        servingSize: p.serving_size || (hasSrv ? null : '100g'),
        calories: n[`energy-kcal${suffix}`] ?? null,
        protein: n[`proteins${suffix}`] ?? null,
        carbs: n[`carbohydrates${suffix}`] ?? null,
        fiber: n[`fiber${suffix}`] ?? null,
        fat: n[`fat${suffix}`] ?? null,
      };
    });
}
