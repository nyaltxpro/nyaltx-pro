import { getCollection } from '@/lib/mongodb';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

// Must match the collection that /api/admin/news and the public /news page use
const COLLECTION = 'news';

interface NewsDoc {
  _id: unknown;
  title: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: 'published' | 'draft' | 'pending';
  featuredInBanner?: boolean;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
  author?: string;
  slug?: string;
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

/**
 * Every published article from the DB, the same set the public /news page shows.
 * Approving a client submission in the admin panel sets status to 'published',
 * so it appears here automatically.
 */
export async function getPaidNews(limit = 50): Promise<PaidNewsItem[]> {
  const collection = await getCollection<NewsDoc>(COLLECTION);

  const docs = await collection
    .find({ status: 'published' } as any)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((d) => {
    let image: string | undefined = d.featuredImage || undefined;
    if (image) {
      try {
        image = toReliableIpfsUrl(image);
      } catch {
        /* keep original URL */
      }
    }

    const id = String(d._id);

    return {
      id: `paid-${id}`,
      title: d.title,
      description: d.excerpt || stripHtml(d.content).slice(0, 220),
      image,
      source: d.author || 'NYALTX',
      pubDate: d.publishedAt || d.createdAt || undefined,
      href: `/news/${d.slug || id}`,
      isPaid: true as const,
      pinned: Boolean(d.featuredInBanner) || d.plan === 'slider' || d.plan === 'prem',
    };
  });
}