import { NextResponse } from 'next/server';
import { query, table } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const disease = searchParams.get('disease') || 'dengue';

    // Map disease names to table names
    const tableMap: { [key: string]: string } = {
      dengue: 'dengue_exec_summary',
      diarrhoea: 'diarrhoea_exec_summary',
      malaria: null, // Malaria doesn't have an exec_summary table yet
    };

    const tableName = tableMap[disease];

    // Return mock data for malaria until table is available
    if (disease === 'malaria' || !tableName) {
      return NextResponse.json({
        r2_score: 0.85,
        smape: 0.925, // As decimal for consistent display
        coverage_90: 0.88,
      });
    }

    // Query the summary column and extract Model Calibration data
    const result = await query<{ summary: any }>(
      `SELECT summary FROM ${table(tableName)} LIMIT 1`
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found' },
        { status: 404 }
      );
    }

    const summary = result.rows[0].summary;
    const modelCalibration = summary?.['Model_calibration'];

    if (!modelCalibration) {
      return NextResponse.json(
        { error: 'Model Calibration data not found' },
        { status: 404 }
      );
    }

    // Normalize the keys to match frontend expectations
    // Note: SMAPE is already a percentage in the DB, R2 and Coverage90 are decimals
    return NextResponse.json({
      r2_score: modelCalibration.R2,
      smape: modelCalibration.SMAPE / 100, // Convert percentage to decimal for consistent display
      coverage_90: modelCalibration.Coverage90,
    });
  } catch (error) {
    console.error('Error fetching model metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model metrics' },
      { status: 500 }
    );
  }
}
