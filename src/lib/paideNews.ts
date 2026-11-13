import { getCollection } from '@/lib/mongodb';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

// Must match the collection used by /api/admin/news and /api/news
const COLLECTION = 'news';

interface NewsDoc {
  _id: unknown;
  title: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
  author?: string;
  slug?: string;
  featuredInBanner?: boolean;
  plan?: string;
}

export interface PaidNewsItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  source: string;
  pubDate?: Date | string;
  href: string;
  isPaid: true;
  pinned: boolean;
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

function fixImage(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return toReliableIpfsUrl(url);
  } catch {
    return url;
  }
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// Primary: read published articles straight from MongoDB
async function fromDb(limit: number): Promise<PaidNewsItem[]> {
  const collection = await getCollection<NewsDoc>(COLLECTION);

  const docs = await collection
    .find({ status: 'published' } as any)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((d) => {
    const id = String(d._id);
    return {
      id: `paid-${id}`,
      title: d.title,
      description: d.excerpt || stripHtml(d.content).slice(0, 220),
      image: fixImage(d.featuredImage),
      source: d.author || 'NYALTX',
      pubDate: d.publishedAt || d.createdAt || undefined,
      href: `/news/${d.slug || id}`,
      isPaid: true as const,
      pinned: Boolean(d.featuredInBanner) || d.plan === 'slider' || d.plan === 'prem',
    };
  });
}

// Fallback: same endpoint the public /news page uses
async function fromApi(limit: number): Promise<PaidNewsItem[]> {
  const res = await fetch(`${getBaseUrl()}/api/news?page=1&limit=${limit}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`News API failed: ${res.status}`);

  const data = await res.json();

  return (data.news || []).map((d: any) => ({
    id: `paid-${d._id}`,
    title: d.title,
    description: d.excerpt || '',
    image: fixImage(d.featuredImage),
    source: d.author || 'NYALTX',
    pubDate: d.publishedAt || d.createdAt,
    href: `/news/${d.slug || d._id}`,
    isPaid: true as const,
    pinned: Boolean(d.featuredInBanner) || d.plan === 'slider' || d.plan === 'prem',
  }));
}

export async function getPaidNews(limit = 100): Promise<PaidNewsItem[]> {
  try {
    return await fromDb(limit);
  } catch (dbErr) {
    console.error('[paidNews] DB failed, trying API fallback:', dbErr);
    return await fromApi(Math.min(limit, 50));
  }
}