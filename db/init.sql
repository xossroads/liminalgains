CREATE TABLE IF NOT EXISTS food_entries (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fiber NUMERIC,
  fat NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_weight (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  weight_value NUMERIC NOT NULL,
  unit VARCHAR(3) NOT NULL DEFAULT 'lbs',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_entries_date ON food_entries(date);
CREATE INDEX IF NOT EXISTS idx_daily_weight_date ON daily_weight(date);
