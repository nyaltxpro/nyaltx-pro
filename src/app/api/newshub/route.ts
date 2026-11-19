import { NextRequest, NextResponse } from 'next/server';
import {
  getNewshubArticles,
  getNewshubBanners,
  NEWSHUB_CATEGORIES,
} from '@/lib/newshubInitialData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const [banners, feed] = await Promise.all([
      getNewshubBanners(),
      getNewshubArticles(category || 'All', page, limit),
    ]);

    return NextResponse.json({
      success: true,
      banners,
      ...feed,
      categories: NEWSHUB_CATEGORIES,
    });
  } catch (error: any) {
    console.error('Error fetching newshub data:', error);
    return NextResponse.json({ error: 'Failed to fetch newshub data' }, { status: 500 });
  }
}
