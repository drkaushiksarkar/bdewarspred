import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

// Use the secondary database connection (same as drilldown routes)
const pool = new Pool({
  host: process.env.PG_HOST_2,
  port: parseInt(process.env.PG_PORT_2 || '5432'),
  database: process.env.PG_DB_2,
  user: process.env.PG_USER_2,
  password: process.env.PG_PASS_2,
  connectionTimeoutMillis: 10000,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const disease = searchParams.get('disease');
    const district = searchParams.get('district');

    if (!disease) {
      return NextResponse.json({ error: 'Disease parameter is required' }, { status: 400 });
    }

    // Map disease names to table names
    const tableMap: { [key: string]: string } = {
      dengue: 'dengue_weather',
      malaria: 'malaria_weather',
      diarrhoea: 'awd_weather',
    };

    const tableName = tableMap[disease.toLowerCase()];
    if (!tableName) {
      return NextResponse.json({ error: 'Invalid disease type' }, { status: 400 });
    }

    // Build query based on whether district is provided
    let queryText: string;
    let params: any[];

    if (district) {
      queryText = `
        SELECT *
        FROM ${tableName}
        WHERE LOWER(district) = LOWER($1)
        ORDER BY date DESC
        LIMIT 100
      `;
      params = [district];
    } else {
      queryText = `
        SELECT *
        FROM ${tableName}
        ORDER BY date DESC
        LIMIT 100
      `;
      params = [];
    }

    const result = await pool.query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching simulation weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
