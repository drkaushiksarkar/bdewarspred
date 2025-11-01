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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'pf', 'pv', or null for combined

    // Determine which column to sum based on type
    let casesColumn = 'SUM(COALESCE(pv, 0) + COALESCE(pf, 0))';
    if (type === 'pf') {
      casesColumn = 'SUM(COALESCE(pf, 0))';
    } else if (type === 'pv') {
      casesColumn = 'SUM(COALESCE(pv, 0))';
    }

    // Query malaria_weather table with weather data
    const result = await pool.query(`
      SELECT
        dis_name as district,
        year,
        month,
        ${casesColumn} as total_cases,
        AVG(COALESCE(average_temperature, 0)) as temperature,
        AVG(COALESCE(relative_humidity, 0)) as humidity,
        AVG(COALESCE(total_rainfall, 0)) as rainfall
      FROM malaria_weather
      WHERE year IS NOT NULL AND month IS NOT NULL
      GROUP BY dis_name, year, month
      ORDER BY year, month, dis_name
    `);

    console.log(`Malaria API: Returning ${result.rows.length} rows from malaria_weather table`);

    // Transform monthly data to match the format expected by both drilldown-tab AND alert-tab
    // Alert tab needs: epi_week, year, weekly_hospitalised_cases
    // Drilldown tab needs: id, district, date, weekly_cases, temperature, humidity, rainfall
    const transformedData = result.rows.map((row: any, index: number) => {
      const monthIndex = parseInt(row.month);
      const year = parseInt(row.year);

      // Create date string (first day of month)
      const date = `${year}-${String(monthIndex).padStart(2, '0')}-01T00:00:00.000Z`;

      // Approximate epi week: (month - 1) * 4.33 + 2 (middle of month)
      // This gives us week numbers from 1-52
      const epi_week = Math.round((monthIndex - 1) * 4.33 + 2);

      // Convert monthly cases to approximate weekly cases (month / 4.33)
      const weekly_cases = (row.total_cases || 0) / 4.33;

      return {
        // Common fields
        id: index + 1,
        district: row.district,
        year: year,

        // For Alert tab
        epi_week: epi_week,
        weekly_hospitalised_cases: Math.round(weekly_cases * 100) / 100,

        // For Drilldown/Climate Impact tab
        date: date,
        weekly_cases: Math.round(weekly_cases * 100) / 100,
        temperature: Math.round((row.temperature || 0) * 100) / 100,
        humidity: Math.round((row.humidity || 0) * 100) / 100,
        rainfall: Math.round((row.rainfall || 0) * 100) / 100,
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
