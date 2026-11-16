import { getDb } from '@/lib/mongodb';
import { PUBLIC_NEWS_FILTER } from '@/lib/publicNewsQuery';
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

const categories = [
  'All',
  'NYAX',
  'Bitcoin',
  'Ethereum',
  'DeFi',
  'Tokenized Stocks',
  'Community',
  'Press Releases',
];

export async function getNewshubInitialData() {
  const db = await getDb();
  const collection = db.collection('corporate_news');
  const feedQuery = {
    ...PUBLIC_NEWS_FILTER,
    isPaid: { $ne: false },
    author: { $nin: ['NYALTX Team', 'NYALTX Learn'] },
    $or: PAID_CRITERIA,
  };
  const limit = 12;

  const [total, documents] = await Promise.all([
    collection.countDocuments(feedQuery),
    collection
      .find<NewsArticleDocument>(feedQuery)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
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
  ]);

  return {
    banners: [],
    articles: documents.map(article => ({
      ...article,
      _id: String(article._id),
      publishedAt:
        article.publishedAt instanceof Date
          ? article.publishedAt.toISOString()
          : article.publishedAt,
      createdAt:
        article.createdAt instanceof Date ? article.createdAt.toISOString() : article.createdAt,
    })),
    categories,
    pagination: {
      total,
      page: 1,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}
