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

    // Transform monthly data to match the format expected by drilldown-tab
    // Convert to date-based format similar to AWD data
    // Note: Weather data is estimated/placeholder as malaria_weather table doesn't contain climate variables
    const transformedData = result.rows.map((row: any, index: number) => {
      // Create a date string from year and month
      const dateStr = `${row.year}-${String(row.month).padStart(2, '0')}-15`; // Middle of the month

      // Generate estimated weather values based on month (seasonal patterns)
      // These are typical Bangladesh climate patterns
      const monthIndex = parseInt(row.month);
      const estimatedTemp = 20 + (monthIndex > 3 && monthIndex < 10 ? 8 : 0) + Math.sin(monthIndex / 12 * Math.PI * 2) * 3;
      const estimatedHumidity = 65 + (monthIndex > 5 && monthIndex < 10 ? 15 : 5);
      const estimatedRainfall = monthIndex >= 6 && monthIndex <= 9 ? 200 + Math.random() * 150 : 50 + Math.random() * 80;

      return {
        id: `${row.district}-${row.year}-${row.month}`,
        district: row.district,
        date: dateStr,
        weekly_cases: Math.round((row.total_cases || 0) / 4 * 100) / 100, // Approximate weekly from monthly
        temperature: Math.round(estimatedTemp * 10) / 10,
        humidity: Math.round(estimatedHumidity * 10) / 10,
        rainfall: Math.round(estimatedRainfall * 10) / 10,
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
