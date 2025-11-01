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

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');
    const type = searchParams.get('type'); // 'pf', 'pv', or null for combined

    console.log(`Fetching malaria cases for district: ${district || 'all'}, type: ${type || 'combined'}, dateFrom: ${dateFrom}, dateTo: ${dateTo}`);

    // Determine which column to sum based on type
    let casesColumn = 'SUM(COALESCE(pv, 0) + COALESCE(pf, 0))';
    if (type === 'pf') {
      casesColumn = 'SUM(COALESCE(pf, 0))';
    } else if (type === 'pv') {
      casesColumn = 'SUM(COALESCE(pv, 0))';
    }

    // Base query for malaria cases
    let query = `
      SELECT
        dis_name as district,
        year,
        month,
        ${casesColumn} as total_cases
      FROM malaria_weather
      WHERE year IS NOT NULL AND month IS NOT NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Add district filter if provided
    if (district) {
      query += ` AND LOWER(dis_name) = LOWER($${paramIndex})`;
      params.push(district);
      paramIndex++;
    }

    // Add date range filters if provided
    if (dateFrom) {
      const [year, month] = dateFrom.split('-');
      query += ` AND (year > $${paramIndex} OR (year = $${paramIndex} AND month >= $${paramIndex + 1}))`;
      params.push(parseInt(year), parseInt(month));
      paramIndex += 2;
    }

    if (dateTo) {
      const [year, month] = dateTo.split('-');
      query += ` AND (year < $${paramIndex} OR (year = $${paramIndex} AND month <= $${paramIndex + 1}))`;
      params.push(parseInt(year), parseInt(month));
      paramIndex += 2;
    }

    query += ` GROUP BY dis_name, year, month ORDER BY year DESC, month DESC`;

    const result = await pool.query(query, params);

    // Calculate total cases and trend
    let totalCases = 0;
    let previousMonthCases = 0;
    let currentMonthCases = 0;

    if (result.rows.length > 0) {
      // Most recent month
      currentMonthCases = parseFloat(result.rows[0].total_cases) || 0;

      // Previous month (if exists)
      if (result.rows.length > 1) {
        previousMonthCases = parseFloat(result.rows[1].total_cases) || 0;
      }

      // Sum all cases in the result set
      totalCases = result.rows.reduce((sum: number, row: any) => {
        return sum + (parseFloat(row.total_cases) || 0);
      }, 0);
    }

    // Calculate trend percentage
    let trend = 0;
    if (previousMonthCases > 0) {
      trend = Math.round(((currentMonthCases - previousMonthCases) / previousMonthCases) * 100);
    }

    console.log(`Malaria cases API: Returning ${result.rows.length} rows, total cases: ${totalCases}, trend: ${trend}%`);

    return NextResponse.json({
      totalCases: Math.round(totalCases),
      currentMonthCases: Math.round(currentMonthCases),
      trend,
      dataPoints: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching malaria cases from postgres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch malaria cases from database', details: (error as Error).message },
      { status: 500 }
    );
  }
}
