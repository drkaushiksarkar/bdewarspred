import { NextResponse } from 'next/server';
import { getMalariaPredictionsFromDB } from '@/lib/data-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getMalariaPredictionsFromDB();

    // Transform to the format expected by the frontend (similar to CSV format)
    // Convert decimal strings to numbers for proper color mapping
    const csvFormat = data.map(row => ({
      UpazilaID: row.upazila_id,
      pv_rate: Number(row.pv_rate),
      pf_rate: Number(row.pf_rate),
      mixed_rate: Number(row.mixed_rate),
    }));

    return NextResponse.json(csvFormat);
  } catch (error) {
    console.error('Error fetching malaria data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch malaria data' },
      { status: 500 }
    );
  }
}
