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
    // Query malaria_weather table
    // Note: This table contains case data (pv, pf) but may not have weather variables
    // We'll use placeholder values for weather data if not available
    const result = await pool.query(`
      SELECT
        dis_name as district,
        year,
        month,
        SUM(COALESCE(pv, 0) + COALESCE(pf, 0)) as total_cases
      FROM malaria_weather
      WHERE year IS NOT NULL AND month IS NOT NULL
      GROUP BY dis_name, year, month
      ORDER BY year, month, dis_name
    `);

    console.log(`Malaria API: Returning ${result.rows.length} rows from malaria_weather table`);

    // Transform monthly data to match the format expected by Alert chart
    // Format needs: epi_week, year, weekly_hospitalised_cases (or daily_cases), district
    const transformedData = result.rows.map((row: any) => {
      // Calculate approximate epidemiological week from month
      // Each month has ~4.33 weeks, so we calculate the week number
      const monthIndex = parseInt(row.month);
      const year = parseInt(row.year);

      // Approximate epi week: (month - 1) * 4.33 + 2 (middle of month)
      // This gives us week numbers from 1-52
      const epi_week = Math.round((monthIndex - 1) * 4.33 + 2);

      // Convert monthly cases to approximate weekly cases
      const weekly_cases = (row.total_cases || 0) / 4.33;

      return {
        district: row.district,
        year: year,
        epi_week: epi_week,
        weekly_hospitalised_cases: Math.round(weekly_cases * 100) / 100,
        // Keep additional fields for compatibility with drilldown-tab
        month: monthIndex,
      };
    });

    console.log(`Malaria API: Transformed to ${transformedData.length} data points`);
    if (transformedData.length > 0) {
      console.log('Sample transformed data:', transformedData[0]);
    }

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching malaria data from postgres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch malaria data from database', details: (error as Error).message },
      { status: 500 }
    );
  }
}
