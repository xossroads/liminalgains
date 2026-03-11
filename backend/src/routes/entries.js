import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/entries/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(
      'SELECT * FROM food_entries WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC',
      [req.userId, date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /entries/:date error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/entries', async (req, res) => {
  try {
    const { date, food_name, calories, protein, carbs, fiber, fat } = req.body;
    if (!date || !food_name) {
      return res.status(400).json({ error: 'date and food_name are required' });
    }
    const hasNutrition = [calories, protein, carbs, fiber, fat].some(v => v != null);
    if (!hasNutrition) {
      return res.status(400).json({ error: 'At least one nutrition field is required' });
    }
    const result = await pool.query(
      `INSERT INTO food_entries (user_id, date, food_name, calories, protein, carbs, fiber, fat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.userId, date, food_name, calories || null, protein || null, carbs || null, fiber || null, fat || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /entries error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { food_name, calories, protein, carbs, fiber, fat } = req.body;
    if (!food_name) {
      return res.status(400).json({ error: 'food_name is required' });
    }
    const result = await pool.query(
      `UPDATE food_entries
       SET food_name = $1, calories = $2, protein = $3, carbs = $4, fiber = $5, fat = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [food_name, calories || null, protein || null, carbs || null, fiber || null, fat || null, id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /entries/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM food_entries WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /entries/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
