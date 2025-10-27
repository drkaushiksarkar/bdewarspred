import { NextResponse } from 'next/server';
import { getTopDistrictsByLastWeekCasesFromDB } from '@/lib/data-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const disease = searchParams.get('disease') || 'dengue';
    const limit = parseInt(searchParams.get('limit') || '6');

    const data = await getTopDistrictsByLastWeekCasesFromDB(disease, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching acceleration alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch acceleration alerts' },
      { status: 500 }
    );
  }
}
