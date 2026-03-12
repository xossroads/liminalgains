import { Router } from 'express';

const router = Router();

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_KEY = process.env.USDA_API_KEY || '';

// Nutrient IDs we care about
const NUTRIENT_IDS = {
  1008: 'calories',  // Energy (kcal)
  1003: 'protein',
  1005: 'carbs',
  1079: 'fiber',
  1004: 'fat',
};

router.get('/food-search', async (req, res) => {
  try {
    const { q, page_size = 8 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const response = await fetch(`${USDA_BASE}/foods/search?api_key=${USDA_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: q.trim(),
        pageSize: Number(page_size),
        dataType: ['Survey (FNDDS)', 'SR Legacy'],
      }),
    });

    if (!response.ok) {
      console.error('USDA API error:', response.status);
      return res.status(502).json({ error: 'Food search failed' });
    }

    const data = await response.json();
    const foods = (data.foods || []).map(f => {
      // Extract nutrients (values are per 100g)
      const per100g = {};
      for (const n of f.foodNutrients || []) {
        const key = NUTRIENT_IDS[n.nutrientId];
        if (key) per100g[key] = n.value ?? null;
      }

      // Find the best serving measure (prefer rank 1, skip "Quantity not specified")
      const measures = (f.foodMeasures || [])
        .filter(m => m.disseminationText && m.disseminationText !== 'Quantity not specified')
        .sort((a, b) => (a.rank || 99) - (b.rank || 99));

      const measure = measures[0] || null;
      const gramWeight = measure?.gramWeight || 100;
      const scale = gramWeight / 100;

      return {
        name: f.description,
        brand: null,
        servingSize: measure?.disseminationText || '100g',
        servingGrams: gramWeight,
        calories: per100g.calories != null ? Math.round(per100g.calories * scale) : null,
        protein: per100g.protein != null ? Math.round(per100g.protein * scale * 10) / 10 : null,
        carbs: per100g.carbs != null ? Math.round(per100g.carbs * scale * 10) / 10 : null,
        fiber: per100g.fiber != null ? Math.round(per100g.fiber * scale * 10) / 10 : null,
        fat: per100g.fat != null ? Math.round(per100g.fat * scale * 10) / 10 : null,
      };
    });

    res.json(foods);
  } catch (err) {
    console.error('Food search error:', err.message);
    res.status(502).json({ error: 'Food search failed' });
  }
});

export default router;
