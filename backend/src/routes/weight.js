const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/weight/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(
      'SELECT * FROM daily_weight WHERE date = $1',
      [date]
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /weight/:date error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/weight/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { weight_value, unit } = req.body;
    if (weight_value == null) {
      return res.status(400).json({ error: 'weight_value is required' });
    }
    const result = await pool.query(
      `INSERT INTO daily_weight (date, weight_value, unit)
       VALUES ($1, $2, $3)
       ON CONFLICT (date) DO UPDATE SET weight_value = $2, unit = $3
       RETURNING *`,
      [date, weight_value, unit || 'lbs']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /weight/:date error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
