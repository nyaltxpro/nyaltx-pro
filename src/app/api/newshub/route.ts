import { NextRequest, NextResponse } from 'next/server';
import {
  getNewshubArticles,
  getNewshubBanners,
  getNewshubCategories,
} from '@/lib/newshubInitialData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const [banners, feed, categories] = await Promise.all([
      getNewshubBanners(),
      getNewshubArticles(category || 'All', page, limit),
      getNewshubCategories(),
    ]);

    return NextResponse.json({
      success: true,
      banners,
      ...feed,
      categories,
    });
  } catch (error: any) {
    console.error('Error fetching newshub data:', error);
    return NextResponse.json({ error: 'Failed to fetch newshub data' }, { status: 500 });
  }
}
