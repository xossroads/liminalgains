import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Returns daily summaries for all dates with data
router.get('/history', async (req, res) => {
  try {
    const entriesResult = await pool.query(
      `SELECT date,
              COALESCE(SUM(calories), 0) AS calories,
              COALESCE(SUM(protein), 0) AS protein,
              COALESCE(SUM(carbs), 0) AS carbs,
              COALESCE(SUM(fiber), 0) AS fiber,
              COALESCE(SUM(fat), 0) AS fat,
              COUNT(*) AS entry_count
       FROM food_entries
       WHERE user_id = $1
       GROUP BY date
       ORDER BY date DESC`,
      [req.userId]
    );

    const weightsResult = await pool.query(
      'SELECT date, weight_value, unit FROM daily_weight WHERE user_id = $1',
      [req.userId]
    );

    const weightMap = {};
    for (const w of weightsResult.rows) {
      const d = typeof w.date === 'string' ? w.date.split('T')[0] : w.date.toISOString().split('T')[0];
      weightMap[d] = { weight_value: w.weight_value, unit: w.unit };
    }

    const dateSet = new Set();
    const entryMap = {};
    for (const row of entriesResult.rows) {
      const d = typeof row.date === 'string' ? row.date.split('T')[0] : row.date.toISOString().split('T')[0];
      dateSet.add(d);
      entryMap[d] = {
        calories: Number(row.calories),
        protein: Number(row.protein),
        carbs: Number(row.carbs),
        fiber: Number(row.fiber),
        fat: Number(row.fat),
        entry_count: Number(row.entry_count),
      };
    }

    // Include dates that only have weight data
    for (const d of Object.keys(weightMap)) {
      dateSet.add(d);
    }

    const days = Array.from(dateSet).sort().reverse().map(date => ({
      date,
      totals: entryMap[date] || { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0 },
      entry_count: entryMap[date]?.entry_count || 0,
      weight: weightMap[date]?.weight_value ?? null,
      unit: weightMap[date]?.unit ?? 'lbs',
    }));

    res.json(days);
  } catch (err) {
    console.error('GET /history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
