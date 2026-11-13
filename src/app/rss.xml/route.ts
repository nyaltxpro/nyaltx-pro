import { NextRequest, NextResponse } from 'next/server';
import { generateOfficialNewsRss } from '@/lib/officialRss';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const xml = await generateOfficialNewsRss({ feedPath: '/rss.xml' });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error generating official RSS feed (/rss.xml):', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
