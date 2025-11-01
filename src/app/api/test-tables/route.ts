import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    if (action === 'list') {
      // List all tables
      const result = await query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      return NextResponse.json({ tables: result.rows });
    }

    if (action === 'describe') {
      const tableName = searchParams.get('table');
      if (!tableName) {
        return NextResponse.json({ error: 'table parameter required' }, { status: 400 });
      }

      // Describe table structure
      const result = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Get sample row
      const sampleResult = await query(`
        SELECT * FROM ${tableName} LIMIT 1
      `);

      return NextResponse.json({
        table: tableName,
        columns: result.rows,
        sample: sampleResult.rows[0] || null,
      });
    }

    if (action === 'test-query') {
      const disease = searchParams.get('disease') || 'malaria';
      const district = searchParams.get('district') || 'Bandarban';

      const weatherTable = disease === 'malaria' ? 'malaria_weather' :
                          disease === 'dengue' ? 'dengue_weather' : 'awd_weather';

      // Try to query the weather table
      try {
        const result = await query(`
          SELECT * FROM ${weatherTable} LIMIT 5
        `);
        return NextResponse.json({
          table: weatherTable,
          rows: result.rows,
          rowCount: result.rowCount,
        });
      } catch (error) {
        return NextResponse.json({
          table: weatherTable,
          error: (error as Error).message,
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in test-tables:', error);
    return NextResponse.json(
      { error: 'Failed to query database', details: (error as Error).message },
      { status: 500 }
    );
  }
}
