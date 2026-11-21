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
  featuredInBanner?: boolean;
  views?: number;
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
const DEFAULT_NEWSHUB_CATEGORIES = [...PAID_NEWS_CATEGORIES];

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

function displayAuthor(author?: string) {
  const normalized = author?.trim();
  return !normalized || normalized.toLowerCase() === 'you' ? 'NYALTX' : normalized;
}

function isPinnedArticle(article: {
  featuredInBanner?: boolean;
  plan?: string;
  planName?: string;
}) {
  if (typeof article.featuredInBanner === 'boolean') return article.featuredInBanner;
  return (
    article.plan === 'slider' ||
    article.plan === 'prem' ||
    /full service/i.test(article.planName || '')
  );
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

export async function getNewshubCategories() {
  const db = await getDb();
  const settings = await db
    .collection<Document & { _id: string; categories?: unknown }>('newshub_settings')
    .findOne({ _id: 'categories' });
  const categories = Array.isArray(settings?.categories)
    ? settings.categories
    : DEFAULT_NEWSHUB_CATEGORIES;
  const normalized = categories
    .filter(
      (category: unknown): category is string =>
        typeof category === 'string' && category.trim().length > 0
    )
    .map(category => category.trim())
    .filter(category => category.toLowerCase() !== 'all');
  const uniqueCategories = new Map(normalized.map(category => [category.toLowerCase(), category]));
  return ['All', ...uniqueCategories.values()];
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
    const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const categoryFilter = {
      $or: [
        { category: { $regex: new RegExp(`^${escapedCategory}$`, 'i') } },
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
      .sort({ featuredInBanner: -1, publishedAt: -1, createdAt: -1 })
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
        featuredInBanner: 1,
        views: 1,
      })
      .toArray(),
    getNews(),
  ]);

  const paidArticles = documents.map((article: NewsArticleDocument) => ({
    ...article,
    _id: String(article._id),
    author: displayAuthor(article.author),
    publishedAt:
      article.publishedAt instanceof Date ? article.publishedAt.toISOString() : article.publishedAt,
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
          createdAt: item.pubDate?.toISOString(),
          author: item.source,
          category: 'DeFi',
          sourceUrl: safeExternalUrl(item.link),
          featuredInBanner: false,
          isSyndicated: true,
          views: 0,
        }))
      : [];
  const combinedArticles = [...paidArticles, ...syndicatedArticles].sort((left, right) => {
    const pinDifference = Number(isPinnedArticle(right)) - Number(isPinnedArticle(left));
    if (pinDifference !== 0) return pinDifference;
    return (
      timestamp(right.publishedAt || right.createdAt) -
      timestamp(left.publishedAt || left.createdAt)
    );
  });
  const trendingArticles = [...combinedArticles]
    .sort(
      (left, right) =>
        (right.views ?? 0) - (left.views ?? 0) ||
        timestamp(right.publishedAt || right.createdAt) -
          timestamp(left.publishedAt || left.createdAt)
    )
    .slice(0, 4);
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(1, limit), 100) : 12;
  const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
  const total = Math.min(totalPaid, MAX_FEED_ITEMS) + syndicatedArticles.length;

  return {
    articles: combinedArticles.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    trendingArticles,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function getNewshubBanners() {
  const db = await getDb();
  const bannersCollection = db.collection('newshub_banners');
  const newsCollection = db.collection('corporate_news');

  const rawAdminBanners = await bannersCollection
    .find({ isActive: { $ne: false } })
    .sort({ displayOrder: 1, createdAt: -1 })
    .toArray();

  const adminBanners = rawAdminBanners.map(b => ({
    _id: String(b._id),
    title: b.title || '',
    description: b.description || '',
    category: b.category || 'NYAX',
    imageUrl: b.imageUrl || '',
    gradientIndex: typeof b.gradientIndex === 'number' ? b.gradientIndex : 0,
    linkUrl: b.linkUrl || '',
    isSponsored: Boolean(b.isSponsored),
    isActive: Boolean(b.isActive !== false),
    displayOrder: typeof b.displayOrder === 'number' ? b.displayOrder : 0,
  }));

  const featuredPaidArticles = await newsCollection
    .find({
      ...PUBLIC_NEWS_FILTER,
      isPaid: { $ne: false },
      author: { $nin: ['NYALTX Team', 'NYALTX Learn'] },
      $and: [
        { $or: PAID_CRITERIA },
        {
          $or: [
            { featuredInBanner: true },
            {
              featuredInBanner: { $exists: false },
              $or: [
                { plan: { $in: ['slider', 'prem'] } },
                { planName: { $regex: /full service/i } },
              ],
            },
          ],
        },
      ],
    })
    .sort({ featuredInBanner: -1, publishedAt: -1, createdAt: -1 })
    .limit(6)
    .toArray();

  const articleBanners = featuredPaidArticles.map(art => ({
    _id: String(art._id),
    title: art.title,
    description: art.excerpt || '',
    category: art.category || (art.type === 'pr' ? 'Press Release' : 'Featured'),
    imageUrl: art.featuredImage || '',
    gradientIndex: typeof art.coverColor === 'number' ? art.coverColor : 0,
    linkUrl: `/news/${art.slug}`,
    isSponsored: true,
    isActive: true,
    displayOrder: 10,
  }));

  return [...adminBanners, ...articleBanners];
}

export async function getNewshubInitialData() {
  const [feed, banners, categories] = await Promise.all([
    getNewshubArticles(),
    getNewshubBanners(),
    getNewshubCategories(),
  ]);
  return {
    banners,
    ...feed,
    categories,
  };
}
