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
    // This table has monthly data with columns: dis_name, upa_name, year, month, pv, pf, population, climate vars
    const result = await pool.query(`
      SELECT
        dis_name as district,
        year,
        month,
        (COALESCE(pv, 0) + COALESCE(pf, 0)) as total_cases,
        pv,
        pf
      FROM malaria_weather
      WHERE year IS NOT NULL AND month IS NOT NULL
      ORDER BY year, month, dis_name
    `);

    console.log(`Malaria API: Returning ${result.rows.length} rows from malaria_weather table`);

    // Transform monthly data to weekly format for consistency with other diseases
    // We'll convert each month to approximately 4 data points (weeks)
    const weeklyData = result.rows.flatMap((row: any) => {
      const weeksInMonth = 4;
      const casesPerWeek = row.total_cases / weeksInMonth;

      // Generate 4 weeks per month
      return Array.from({ length: weeksInMonth }, (_, weekIndex) => {
        // Calculate approximate week number: (month - 1) * 4 + weekIndex + 1
        const epi_week = (row.month - 1) * 4 + weekIndex + 1;

        return {
          district: row.district,
          year: row.year,
          epi_week: epi_week,
          weekly_hospitalised_cases: Math.round(casesPerWeek * 100) / 100, // Round to 2 decimals
        };
      });
    });

    console.log(`Malaria API: Transformed to ${weeklyData.length} weekly data points`);

    return NextResponse.json(weeklyData);
  } catch (error) {
    console.error('Error fetching malaria data from postgres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch malaria data from database', details: (error as Error).message },
      { status: 500 }
    );
  }
}
