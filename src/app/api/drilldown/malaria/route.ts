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
    // Query the malaria_weather table
    const result = await pool.query(`
      SELECT
        id,
        district,
        date,
        weekly_cases,
        temperature,
        humidity,
        rainfall
      FROM malaria_weather
      ORDER BY date DESC
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
