-- SAFE SCHEMA SYNC FOR APP CONSUMPTION
-- We do not drop any existing production table.
-- We only add missing columns if needed, and create/refresh a view.

-- 1. Make sure diseases has a `name` column
ALTER TABLE IF EXISTS diseases
  ADD COLUMN IF NOT EXISTS name TEXT;

-- 2. Make sure locations has expected columns for mapping
ALTER TABLE IF EXISTS locations
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS division TEXT,
  ADD COLUMN IF NOT EXISTS latitude FLOAT,
  ADD COLUMN IF NOT EXISTS longitude FLOAT,
  ADD COLUMN IF NOT EXISTS geom JSONB;

-- 3. Make sure daily_cases has expected columns used by analytics.ts
ALTER TABLE IF EXISTS daily_cases
  ADD COLUMN IF NOT EXISTS disease_id INT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS division TEXT,
  ADD COLUMN IF NOT EXISTS year INT,
  ADD COLUMN IF NOT EXISTS epi_week INT,
  ADD COLUMN IF NOT EXISTS weekly_hospitalised_cases INT,
  ADD COLUMN IF NOT EXISTS population INT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 4. Make sure weather_readings exists with expected columns
CREATE TABLE IF NOT EXISTS weather_readings (
  id SERIAL PRIMARY KEY,
  district TEXT,
  date DATE,
  year INT,
  epi_week INT,
  avg_temperature FLOAT,
  total_rainfall FLOAT,
  avg_humidity FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- If it already exists, ensure required columns exist:
ALTER TABLE IF EXISTS weather_readings
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS year INT,
  ADD COLUMN IF NOT EXISTS epi_week INT,
  ADD COLUMN IF NOT EXISTS avg_temperature FLOAT,
  ADD COLUMN IF NOT EXISTS total_rainfall FLOAT,
  ADD COLUMN IF NOT EXISTS avg_humidity FLOAT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 5. Create or replace the view that your app will query.
--    We assume epidemiological data is in daily_cases,
--    and weather (temp/rain/humidity) is in weather_readings.

CREATE OR REPLACE VIEW vw_epidemic_weather AS
SELECT
  c.district,
  c.division,
  c.year,
  c.epi_week,
  c.weekly_hospitalised_cases,
  c.population,
  w.avg_temperature,
  w.total_rainfall,
  w.avg_humidity
FROM daily_cases c
LEFT JOIN weather_readings w
  ON c.district = w.district
 AND c.epi_week = w.epi_week
 AND c.year = w.year;
