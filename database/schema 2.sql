-- Bangladesh EWARS Database Schema
-- Database: ewars
-- Schema: dashboard

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS dashboard;

-- Set search path to the dashboard schema
SET search_path TO dashboard;

-- Table for dengue predictions (from model-output.json)
CREATE TABLE IF NOT EXISTS dengue_predictions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    actual DECIMAL(10, 2),
    predicted DECIMAL(10, 2) NOT NULL,
    uncertainty_lower DECIMAL(10, 2) NOT NULL,
    uncertainty_upper DECIMAL(10, 2) NOT NULL,
    is_outbreak BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, district)
);

-- Table for diarrhoea predictions (from diarrhoea-data.json)
CREATE TABLE IF NOT EXISTS diarrhoea_predictions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    actual DECIMAL(10, 2),
    predicted DECIMAL(10, 2) NOT NULL,
    uncertainty_lower DECIMAL(10, 2) NOT NULL,
    uncertainty_upper DECIMAL(10, 2) NOT NULL,
    is_outbreak BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, district)
);

-- Table for malaria predictions (from malaria_predictions.csv)
CREATE TABLE IF NOT EXISTS malaria_predictions (
    id SERIAL PRIMARY KEY,
    upazila_id VARCHAR(50) NOT NULL UNIQUE,
    pv_rate DECIMAL(15, 10) NOT NULL,
    pf_rate DECIMAL(15, 10) NOT NULL,
    mixed_rate DECIMAL(15, 10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dengue_date ON dengue_predictions(date);
CREATE INDEX IF NOT EXISTS idx_dengue_district ON dengue_predictions(district);
CREATE INDEX IF NOT EXISTS idx_dengue_date_district ON dengue_predictions(date, district);

CREATE INDEX IF NOT EXISTS idx_diarrhoea_date ON diarrhoea_predictions(date);
CREATE INDEX IF NOT EXISTS idx_diarrhoea_district ON diarrhoea_predictions(district);
CREATE INDEX IF NOT EXISTS idx_diarrhoea_date_district ON diarrhoea_predictions(date, district);

CREATE INDEX IF NOT EXISTS idx_malaria_upazila ON malaria_predictions(upazila_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION dashboard.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_dengue_predictions_updated_at ON dengue_predictions;
CREATE TRIGGER update_dengue_predictions_updated_at
    BEFORE UPDATE ON dengue_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diarrhoea_predictions_updated_at ON diarrhoea_predictions;
CREATE TRIGGER update_diarrhoea_predictions_updated_at
    BEFORE UPDATE ON diarrhoea_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_malaria_predictions_updated_at ON malaria_predictions;
CREATE TRIGGER update_malaria_predictions_updated_at
    BEFORE UPDATE ON malaria_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for easy data access
CREATE OR REPLACE VIEW dashboard.latest_dengue_predictions AS
SELECT
    district,
    MAX(date) as latest_date,
    (SELECT predicted FROM dashboard.dengue_predictions dp
     WHERE dp.district = dengue_predictions.district
     AND dp.date = MAX(dengue_predictions.date)) as latest_prediction,
    (SELECT is_outbreak FROM dashboard.dengue_predictions dp
     WHERE dp.district = dengue_predictions.district
     AND dp.date = MAX(dengue_predictions.date)) as is_outbreak
FROM dashboard.dengue_predictions
GROUP BY district;

CREATE OR REPLACE VIEW dashboard.latest_diarrhoea_predictions AS
SELECT
    district,
    MAX(date) as latest_date,
    (SELECT predicted FROM dashboard.diarrhoea_predictions dp
     WHERE dp.district = diarrhoea_predictions.district
     AND dp.date = MAX(diarrhoea_predictions.date)) as latest_prediction,
    (SELECT is_outbreak FROM dashboard.diarrhoea_predictions dp
     WHERE dp.district = diarrhoea_predictions.district
     AND dp.date = MAX(diarrhoea_predictions.date)) as is_outbreak
FROM dashboard.diarrhoea_predictions
GROUP BY district;
