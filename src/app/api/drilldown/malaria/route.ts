import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a connection pool using the _2 credentials from .env
const pool = new Pool({
  host: process.env.PG_HOST_2,
  port: parseInt(process.env.PG_PORT_2 || '5432'),
  database: process.env.PG_DB_2,
  user: process.env.PG_USER_2,
  password: process.env.PG_PASS_2,
});

export async function GET() {
  try {
    // Query both P. falciparum and P. vivax acceleration alerts and combine them
    const result = await pool.query(`
      SELECT
        district,
        year,
        month,
        SUM(last_week_cases) as last_week_cases,
        SUM(this_week_actual) as this_week_actual,
        SUM(this_week_predicted) as this_week_predicted,
        SUM(next_week_forecast) as next_week_forecast
      FROM (
        SELECT
          district,
          year,
          month,
          SUM(last_week_cases) as last_week_cases,
          SUM(this_week_actual) as this_week_actual,
          SUM(this_week_predicted) as this_week_predicted,
          SUM(next_week_forecast) as next_week_forecast
        FROM malaria_pf_acceleration_alerts
        GROUP BY district, year, month
        UNION ALL
        SELECT
          district,
          year,
          month,
          SUM(last_week_cases) as last_week_cases,
          SUM(this_week_actual) as this_week_actual,
          SUM(this_week_predicted) as this_week_predicted,
          SUM(next_week_forecast) as next_week_forecast
        FROM malaria_pv_acceleration_alerts
        GROUP BY district, year, month
      ) combined
      GROUP BY district, year, month
      ORDER BY year, month, district
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching malaria data from postgres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch malaria data from database' },
      { status: 500 }
    );
  }
}
