#!/usr/bin/env node

/**
 * Data Migration Script
 *
 * This script migrates data from JSON and CSV files to PostgreSQL.
 * Run this after running the setup script.
 *
 * Usage: npm run db:migrate
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import Papa from 'papaparse';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Types for data
interface TimeSeriesData {
  date: string;
  district: string;
  actual: number | null;
  predicted: number;
  uncertainty: [number, number];
  is_outbreak: boolean;
}

interface MalariaData {
  UpazilaID: string;
  pv_rate: string;
  pf_rate: string;
  mixed_rate: string;
}

async function migrateData() {
  console.log('Starting data migration...\n');

  const dbName = process.env.DB_NAME || 'ewars';
  const schema = process.env.DB_SCHEMA || 'dashboard';

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: dbName,
  });

  try {
    // Set search path to the dashboard schema
    await pool.query(`SET search_path TO ${schema}`);

    console.log('1. Migrating dengue predictions from model-output.json...');
    await migrateDenguePredictions(pool, schema);

    console.log('2. Migrating diarrhoea predictions from diarrhoea-data.json...');
    await migrateDiarrhoeaPredictions(pool, schema);

    console.log('3. Migrating malaria predictions from malaria_predictions.csv...');
    await migrateMalariaPredictions(pool, schema);

    // Verify data counts
    console.log('\nData verification:');
    const dengueCount = await pool.query(`SELECT COUNT(*) FROM ${schema}.dengue_predictions`);
    console.log(`  - Dengue predictions: ${dengueCount.rows[0].count} records`);

    const diarrhoeaCount = await pool.query(`SELECT COUNT(*) FROM ${schema}.diarrhoea_predictions`);
    console.log(`  - Diarrhoea predictions: ${diarrhoeaCount.rows[0].count} records`);

    const malariaCount = await pool.query(`SELECT COUNT(*) FROM ${schema}.malaria_predictions`);
    console.log(`  - Malaria predictions: ${malariaCount.rows[0].count} records`);

    console.log('\n✓ Data migration completed successfully!');

  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function migrateDenguePredictions(pool: Pool, schema: string) {
  const filePath = join(__dirname, '..', 'src', 'lib', 'model-output.json');
  const data: TimeSeriesData[] = JSON.parse(readFileSync(filePath, 'utf-8'));

  console.log(`  Found ${data.length} dengue prediction records`);

  // Clear existing data
  await pool.query(`TRUNCATE ${schema}.dengue_predictions RESTART IDENTITY`);

  // Batch insert for better performance
  const batchSize = 1000;
  let inserted = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const values = batch.map((row, idx) => {
      const base = i + idx;
      return `($${base * 6 + 1}, $${base * 6 + 2}, $${base * 6 + 3}, $${base * 6 + 4}, $${base * 6 + 5}, $${base * 6 + 6})`;
    }).join(', ');

    const params = batch.flatMap(row => [
      row.date,
      row.district.toLowerCase(),
      row.actual,
      row.predicted,
      row.uncertainty[0],
      row.uncertainty[1],
    ]);

    await pool.query(
      `INSERT INTO ${schema}.dengue_predictions
       (date, district, actual, predicted, uncertainty_lower, uncertainty_upper)
       VALUES ${values}
       ON CONFLICT (date, district) DO UPDATE SET
         actual = EXCLUDED.actual,
         predicted = EXCLUDED.predicted,
         uncertainty_lower = EXCLUDED.uncertainty_lower,
         uncertainty_upper = EXCLUDED.uncertainty_upper`,
      params
    );

    inserted += batch.length;
    process.stdout.write(`  Inserted ${inserted}/${data.length} records\r`);
  }

  console.log(`\n  ✓ Dengue predictions migrated successfully`);
}

async function migrateDiarrhoeaPredictions(pool: Pool, schema: string) {
  const filePath = join(__dirname, '..', 'src', 'lib', 'diarrhoea-data.json');
  const data: TimeSeriesData[] = JSON.parse(readFileSync(filePath, 'utf-8'));

  console.log(`  Found ${data.length} diarrhoea prediction records`);

  // Clear existing data
  await pool.query(`TRUNCATE ${schema}.diarrhoea_predictions RESTART IDENTITY`);

  // Batch insert for better performance
  const batchSize = 1000;
  let inserted = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const values = batch.map((row, idx) => {
      const base = i + idx;
      return `($${base * 6 + 1}, $${base * 6 + 2}, $${base * 6 + 3}, $${base * 6 + 4}, $${base * 6 + 5}, $${base * 6 + 6})`;
    }).join(', ');

    const params = batch.flatMap(row => [
      row.date,
      row.district.toLowerCase(),
      row.actual,
      row.predicted,
      row.uncertainty[0],
      row.uncertainty[1],
    ]);

    await pool.query(
      `INSERT INTO ${schema}.diarrhoea_predictions
       (date, district, actual, predicted, uncertainty_lower, uncertainty_upper)
       VALUES ${values}
       ON CONFLICT (date, district) DO UPDATE SET
         actual = EXCLUDED.actual,
         predicted = EXCLUDED.predicted,
         uncertainty_lower = EXCLUDED.uncertainty_lower,
         uncertainty_upper = EXCLUDED.uncertainty_upper`,
      params
    );

    inserted += batch.length;
    process.stdout.write(`  Inserted ${inserted}/${data.length} records\r`);
  }

  console.log(`\n  ✓ Diarrhoea predictions migrated successfully`);
}

async function migrateMalariaPredictions(pool: Pool, schema: string) {
  const filePath = join(__dirname, '..', 'public', 'geo', 'malaria_predictions.csv');
  const fileContent = readFileSync(filePath, 'utf-8');

  // Parse CSV
  const parseResult = Papa.parse<MalariaData>(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  const data = parseResult.data;
  console.log(`  Found ${data.length} malaria prediction records`);

  // Clear existing data
  await pool.query(`TRUNCATE ${schema}.malaria_predictions RESTART IDENTITY`);

  // Insert all records
  let inserted = 0;
  for (const row of data) {
    await pool.query(
      `INSERT INTO ${schema}.malaria_predictions
       (upazila_id, pv_rate, pf_rate, mixed_rate)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (upazila_id) DO UPDATE SET
         pv_rate = EXCLUDED.pv_rate,
         pf_rate = EXCLUDED.pf_rate,
         mixed_rate = EXCLUDED.mixed_rate`,
      [row.UpazilaID, parseFloat(row.pv_rate), parseFloat(row.pf_rate), parseFloat(row.mixed_rate)]
    );

    inserted++;
    process.stdout.write(`  Inserted ${inserted}/${data.length} records\r`);
  }

  console.log(`\n  ✓ Malaria predictions migrated successfully`);
}

migrateData();
