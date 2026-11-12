import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');

    const db = await getDb();
    const collection = db.collection('corporate_news');

    let query: any = { status: 'published' };
    if (tag) {
      query.tags = { $regex: new RegExp(tag, 'i') };
    }

    const articles = await collection
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(50)
      .toArray();

    const siteUrl = 'https://www.nyaltx.pro';
    const now = new Date().toUTCString();

    const itemsXml = articles.map(art => {
      const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : now;
      const link = art.slug ? `${siteUrl}/news/${art.slug}` : (art.sourceUrl || `${siteUrl}/news-hub`);
      const author = art.author || 'NYALTX News Hub';
      const title = (art.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const description = (art.excerpt || art.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${author}</author>
      <description>${description}</description>
      ${art.category ? `<category>${art.category}</category>` : ''}
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NYALTX News Hub</title>
    <link>${siteUrl}/news-hub</link>
    <description>Where Wall Street meets Web3: news, press releases and market stories for crypto and alt assets.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${siteUrl}/rss/news.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating RSS:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
