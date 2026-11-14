import { NextRequest, NextResponse } from 'next/server';
import { generateOfficialNewsRss } from '@/lib/officialRss';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag') || undefined;
    const xml = await generateOfficialNewsRss({ feedPath: '/rss/news.xml', tag });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error generating RSS feed (/rss/news.xml):', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
