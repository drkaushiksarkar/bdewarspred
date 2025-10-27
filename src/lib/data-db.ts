/**
 * Database-backed data access layer
 *
 * This module provides functions to fetch data from PostgreSQL instead of static JSON files.
 * It replaces the static imports from model-output.json and diarrhoea-data.json
 */

import { query, table } from '@/lib/db';
import type { TimeSeriesDataPoint, AccelerationAlertData } from '@/lib/types';

/**
 * Get time series data for a specific district and disease from database
 */
export async function getRealTimeSeriesDataFromDB(
  districtName: string,
  disease: string
): Promise<TimeSeriesDataPoint[]> {
  const tableName = disease === 'dengue' ? 'dengue_predictions' : 'diarrhoea_predictions';

  if (disease !== 'dengue' && disease !== 'diarrhoea') {
    return [];
  }

  try {
    const result = await query<{
      date: string;
      actual: number | null;
      predicted: number;
      uncertainty_lower: number;
      uncertainty_upper: number;
      is_outbreak: boolean;
    }>(
      `SELECT date::text, actual, predicted, uncertainty_lower, uncertainty_upper, is_outbreak
       FROM ${table(tableName)}
       WHERE LOWER(district) = LOWER($1)
       ORDER BY date ASC`,
      [districtName]
    );

    return result.rows.map((row) => ({
      date: row.date,
      actual: row.actual,
      predicted: row.predicted,
      uncertainty: [row.uncertainty_lower, row.uncertainty_upper],
      is_outbreak: row.is_outbreak,
    }));
  } catch (error) {
    console.error('Error fetching time series data from database:', error);
    return [];
  }
}

/**
 * Get aggregated dengue predictions by district from database
 */
export async function getAggregatedDenguePredictionsFromDB(): Promise<{
  [districtName: string]: number;
}> {
  try {
    const result = await query<{ district: string; total: number }>(
      `SELECT district, SUM(predicted) as total
       FROM ${table('dengue_predictions')}
       GROUP BY district`
    );

    const totals: { [districtName: string]: number } = {};
    result.rows.forEach((row) => {
      // Capitalize first letter to match existing format
      const districtName = row.district.charAt(0).toUpperCase() + row.district.slice(1);
      totals[districtName] = row.total;
    });

    return totals;
  } catch (error) {
    console.error('Error fetching aggregated dengue predictions:', error);
    return {};
  }
}

/**
 * Get aggregated diarrhoea predictions by district from database
 */
export async function getAggregatedDiarrhoeaPredictionsFromDB(): Promise<{
  [districtName: string]: number;
}> {
  try {
    const result = await query<{ district: string; total: number }>(
      `SELECT district, SUM(predicted) as total
       FROM ${table('diarrhoea_predictions')}
       GROUP BY district`
    );

    const totals: { [districtName: string]: number } = {};
    result.rows.forEach((row) => {
      // Capitalize first letter to match existing format
      const districtName = row.district.charAt(0).toUpperCase() + row.district.slice(1);
      totals[districtName] = row.total;
    });

    return totals;
  } catch (error) {
    console.error('Error fetching aggregated diarrhoea predictions:', error);
    return {};
  }
}

/**
 * Get all time series data for a specific disease (used for alert calculations)
 */
export async function getAllTimeSeriesDataFromDB(disease: string): Promise<
  Array<{
    date: string;
    district: string;
    actual: number | null;
    predicted: number;
    uncertainty: [number, number];
    is_outbreak: boolean;
  }>
> {
  const tableName = disease === 'dengue' ? 'dengue_predictions' : 'diarrhoea_predictions';

  if (disease !== 'dengue' && disease !== 'diarrhoea') {
    return [];
  }

  try {
    const result = await query<{
      date: string;
      district: string;
      actual: number | null;
      predicted: number;
      uncertainty_lower: number;
      uncertainty_upper: number;
      is_outbreak: boolean;
    }>(
      `SELECT date::text, district, actual, predicted, uncertainty_lower, uncertainty_upper, is_outbreak
       FROM ${table(tableName)}
       ORDER BY date ASC`
    );

    return result.rows.map((row) => ({
      date: row.date,
      district: row.district,
      actual: row.actual,
      predicted: row.predicted,
      uncertainty: [row.uncertainty_lower, row.uncertainty_upper],
      is_outbreak: row.is_outbreak,
    }));
  } catch (error) {
    console.error('Error fetching all time series data:', error);
    return [];
  }
}

/**
 * Get available districts for a disease from database
 */
export async function getAvailableDistrictsFromDB(disease: string): Promise<string[]> {
  const tableName = disease === 'dengue' ? 'dengue_predictions' : 'diarrhoea_predictions';

  if (disease !== 'dengue' && disease !== 'diarrhoea') {
    return [];
  }

  try {
    const result = await query<{ district: string }>(
      `SELECT DISTINCT district
       FROM ${table(tableName)}
       ORDER BY district`
    );

    return result.rows.map((row) => row.district);
  } catch (error) {
    console.error('Error fetching available districts:', error);
    return [];
  }
}

/**
 * Get malaria predictions from database
 */
export async function getMalariaPredictionsFromDB(): Promise<
  Array<{
    upazila_id: string;
    pv_rate: number;
    pf_rate: number;
    mixed_rate: number;
  }>
> {
  try {
    const result = await query<{
      upazila_id: string;
      pv_rate: number;
      pf_rate: number;
      mixed_rate: number;
    }>(
      `SELECT upazila_id, pv_rate, pf_rate, mixed_rate
       FROM ${table('malaria_predictions')}
       ORDER BY upazila_id`
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching malaria predictions:', error);
    return [];
  }
}

/**
 * Get top districts by last week cases from acceleration alerts table
 */
export async function getTopDistrictsByLastWeekCasesFromDB(
  disease: string,
  limit: number = 6
): Promise<AccelerationAlertData[]> {
  // Map disease to table name
  const tableMap: { [key: string]: string } = {
    dengue: 'dengue_acceleration_alerts',
    diarrhoea: 'diarrhoea_acceleration_alerts',
    malaria: 'malaria_acceleration_alerts',
  };

  const tableName = tableMap[disease];
  if (!tableName) {
    console.warn(`No acceleration alerts table for disease: ${disease}`);
    return [];
  }

  try {
    const result = await query<AccelerationAlertData>(
      `SELECT
        district,
        year,
        epi_week,
        last_week_cases,
        this_week_actual,
        this_week_predicted,
        next_week_forecast,
        growth_rate_wow,
        growth_flag
       FROM ${tableName}
       WHERE year = (SELECT MAX(year) FROM ${tableName})
         AND epi_week = (SELECT MAX(epi_week) FROM ${tableName} WHERE year = (SELECT MAX(year) FROM ${tableName}))
       ORDER BY last_week_cases DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error(`Error fetching acceleration alerts for ${disease}:`, error);
    return [];
  }
}
