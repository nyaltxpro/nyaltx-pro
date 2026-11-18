import { getDb } from '@/lib/mongodb';
import { PUBLIC_NEWS_FILTER } from '@/lib/publicNewsQuery';
import { getNews, type RssItem } from '@/lib/rss';
import { PAID_NEWS_CATEGORIES } from '@/lib/paidNewsCategories';
import type { Document, ObjectId } from 'mongodb';

interface NewsArticleDocument extends Document {
  _id: ObjectId;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: Date | string;
  createdAt?: Date | string;
  author?: string;
  slug?: string;
  tags?: string[];
  category?: string;
  coverColor?: number;
  type?: string;
  isPaid?: boolean;
  plan?: string;
  planName?: string;
  sourceUrl?: string;
}

export const PAID_CRITERIA = [
  { isPaid: true },
  {
    isPaid: { $ne: false },
    $or: [
      { plan: { $in: ['feed', 'slider', 'prem'] } },
      { amount: { $gt: 0 } },
      { paymentMethod: { $exists: true, $ne: null } },
      { paymentStatus: { $in: ['completed', 'paid', 'success'] } },
      { type: 'pr' },
    ],
  },
];

export const NEWSHUB_CATEGORIES = ['All', ...PAID_NEWS_CATEGORIES];

const MAX_FEED_ITEMS = 100;

function stripHtml(value?: string) {
  return value
    ?.replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function timestamp(value?: Date | string) {
  const parsed = value ? new Date(value).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
}

function safeExternalUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export async function getNewshubArticles(category = 'All', page = 1, limit = 12) {
  const db = await getDb();
  const collection = db.collection('corporate_news');
  const feedQuery: Record<string, any> = {
    ...PUBLIC_NEWS_FILTER,
    isPaid: { $ne: false },
    author: { $nin: ['NYALTX Team', 'NYALTX Learn'] },
    $or: PAID_CRITERIA,
  };
  if (category !== 'All') {
    const categoryFilter = {
      $or: [
        { category: { $regex: new RegExp(`^${category}$`, 'i') } },
        { tags: { $in: [category] } },
      ],
    };
    feedQuery.$and = [{ $or: PAID_CRITERIA }, categoryFilter];
    delete feedQuery.$or;
  }

  const [totalPaid, documents, rssItems] = await Promise.all([
    collection.countDocuments(feedQuery),
    collection
      .find<NewsArticleDocument>(feedQuery)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(MAX_FEED_ITEMS)
      .project<NewsArticleDocument>({
        _id: 1,
        title: 1,
        excerpt: 1,
        featuredImage: 1,
        publishedAt: 1,
        createdAt: 1,
        author: 1,
        slug: 1,
        tags: 1,
        category: 1,
        coverColor: 1,
        type: 1,
        isPaid: 1,
        plan: 1,
        planName: 1,
        sourceUrl: 1,
      })
      .toArray(),
    getNews(),
  ]);

  const paidArticles = documents.map((article: NewsArticleDocument) => ({
    ...article,
    _id: String(article._id),
    publishedAt:
      article.publishedAt instanceof Date
        ? article.publishedAt.toISOString()
        : article.publishedAt,
    createdAt:
      article.createdAt instanceof Date ? article.createdAt.toISOString() : article.createdAt,
    isSyndicated: false,
  }));
  const syndicatedArticles =
    category === 'All' || category === 'DeFi'
      ? rssItems.map((item: RssItem) => ({
          _id: `rss-${item.id}`,
          title: item.title,
          excerpt: stripHtml(item.description),
          featuredImage: item.image,
          publishedAt: item.pubDate?.toISOString(),
          author: item.source,
          category: 'DeFi',
          sourceUrl: safeExternalUrl(item.link),
          isSyndicated: true,
        }))
      : [];
  const combinedArticles = [...paidArticles, ...syndicatedArticles].sort(
    (left, right) =>
      timestamp(right.publishedAt || right.createdAt) -
      timestamp(left.publishedAt || left.createdAt),
  );
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(1, limit), 100) : 12;
  const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
  const total = Math.min(totalPaid, MAX_FEED_ITEMS) + syndicatedArticles.length;

  return {
    articles: combinedArticles.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function getNewshubInitialData() {
  const feed = await getNewshubArticles();
  return {
    banners: [],
    ...feed,
    categories: NEWSHUB_CATEGORIES,
  };
}
