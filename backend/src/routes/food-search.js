import { Router } from 'express';
import axios from 'axios';

const router = Router();

const off = axios.create({
  baseURL: 'https://us.openfoodfacts.net',
  timeout: 10000,
  headers: {
    'User-Agent': 'LiminalGains/1.0 (liminalgains.fit)',
  },
});

router.get('/food-search', async (req, res) => {
  try {
    const { q, page_size = 10 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const result = await off.get('/cgi/search.pl', {
      params: {
        search_terms: q.trim(),
        json: true,
        page_size,
        sort_by: 'unique_scans_n',
        fields: 'product_name,brands,serving_quantity,serving_size,nutriments',
      },
    });

    const products = result.data?.products || [];

    const foods = products
      .filter(p => p.product_name)
      .map(p => {
        const n = p.nutriments || {};
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

    res.json(foods);
  } catch (err) {
    console.error('Food search error:', err.message);
    res.status(502).json({ error: 'Food search failed' });
  }
});

export default router;
