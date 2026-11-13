import { getDb } from '@/lib/mongodb';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateOfficialNewsRss(options?: { feedPath?: string; siteUrl?: string }): Promise<string> {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nyaltx.pro';
  const feedPath = options?.feedPath || '/rss.xml';
  const feedUrl = `${siteUrl}${feedPath}`;
  const now = new Date().toUTCString();

  const db = await getDb();
  const collection = db.collection('corporate_news');

  // ONLY approved and publicly published news published on our platform
  // Excludes drafts, pending reviews, rejected news, and unpaid submissions
  const query: any = {
    status: 'published',
    isPendingReview: { $ne: true },
    $or: [
      // Official platform news (created by admin/team)
      { plan: { $exists: false } },
      { plan: null },
      { plan: '' },
      // Paid user submissions that have completed verified payment
      { paymentStatus: { $in: ['completed', 'paid'] } },
      { paymentVerified: true },
      { isPaid: true }
    ]
  };

  const articles = await collection
    .find(query)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(100)
    .toArray();

  const itemsXml = articles.map(art => {
    const rawDate = art.publishedAt || art.createdAt || new Date();
    const pubDate = new Date(rawDate).toUTCString();
    const slug = art.slug || String(art._id);
    const link = `${siteUrl}/news/${slug}`;
    const author = art.author || 'NYALTX News Desk';
    const title = art.title ? art.title.trim() : 'NYALTX News Update';
    const rawText = art.excerpt || stripHtml(art.content);
    const description = rawText ? rawText.slice(0, 500) : title;
    const category = art.category || art.tags?.[0] || 'Blockchain';

    let imageTag = '';
    if (art.featuredImage) {
      try {
        const imageUrl = toReliableIpfsUrl(art.featuredImage);
        if (imageUrl && imageUrl.startsWith('http')) {
          imageTag = `      <enclosure url="${escapeXml(imageUrl)}" length="0" type="image/jpeg" />
      <media:content url="${escapeXml(imageUrl)}" medium="image" />`;
        }
      } catch {
        // Skip image if invalid URL
      }
    }

    return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${author}]]></dc:creator>
      <author>${escapeXml(author)}</author>
      <description><![CDATA[${description}]]></description>
      <category><![CDATA[${category}]]></category>
${imageTag ? `${imageTag}\n` : ''}    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom" 
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>NYALTX Official News</title>
    <link>${siteUrl}/news</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <description>Official news, market updates, tokenized securities announcements, and partner stories published by NYALTX.</description>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} NYALTX. All rights reserved.</copyright>
    <lastBuildDate>${now}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;
}
