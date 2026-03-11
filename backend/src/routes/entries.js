const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/entries/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(
      'SELECT * FROM food_entries WHERE date = $1 ORDER BY created_at ASC',
      [date]
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
      `INSERT INTO food_entries (date, food_name, calories, protein, carbs, fiber, fat)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [date, food_name, calories || null, protein || null, carbs || null, fiber || null, fat || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /entries error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM food_entries WHERE id = $1 RETURNING *',
      [id]
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

module.exports = router;
