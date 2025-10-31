import { NextResponse } from 'next/server';
import { getDistrictPredictionsFromAccelerationAlerts } from '@/lib/data-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const disease = searchParams.get('disease') || 'dengue';

    // Validate disease parameter
    if (disease !== 'dengue' && disease !== 'diarrhoea') {
      return NextResponse.json(
        { error: 'Invalid disease parameter. Must be "dengue" or "diarrhoea"' },
        { status: 400 }
      );
    }

    const data = await getDistrictPredictionsFromAccelerationAlerts(disease);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching disease map predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch disease map predictions' },
      { status: 500 }
    );
  }
}
