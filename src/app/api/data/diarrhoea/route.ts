import { NextResponse } from 'next/server';
import { getRealTimeSeriesDataFromDB, getAggregatedDiarrhoeaPredictionsFromDB } from '@/lib/data-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const aggregate = searchParams.get('aggregate');

    if (aggregate === 'true') {
      // Return aggregated predictions
      const data = await getAggregatedDiarrhoeaPredictionsFromDB();
      return NextResponse.json(data);
    } else if (district) {
      // Return time series for specific district
      const data = await getRealTimeSeriesDataFromDB(district, 'diarrhoea');
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching diarrhoea data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diarrhoea data' },
      { status: 500 }
    );
  }
}
