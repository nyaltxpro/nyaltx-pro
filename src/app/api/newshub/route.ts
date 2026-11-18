import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  getNewshubArticles,
  NEWSHUB_CATEGORIES,
  PAID_CRITERIA,
} from '@/lib/newshubInitialData';
import { PUBLIC_NEWS_FILTER } from '@/lib/publicNewsQuery';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const db = await getDb();
    const bannersCollection = db.collection('newshub_banners');
    const newsCollection = db.collection('corporate_news');

    // ── 1. Admin-uploaded slider banners ──────────────────────────────────
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

    // ── 2. Published paid articles marked as featured / Full Service slider ─
    const featuredPaidArticles = await newsCollection
      .find({
        ...PUBLIC_NEWS_FILTER,
        isPaid: { $ne: false },
        author: { $nin: ['NYALTX Team', 'NYALTX Learn'] },
        $or: PAID_CRITERIA,
        $and: [
          {
            $or: [
              { featuredInBanner: true },
              { plan: 'slider' },
              { planName: { $regex: /full service/i } },
            ],
          },
        ],
      })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(6)
      .toArray();

    // Map paid featured articles into slider banner format
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

    // Final slider: admin banners first, then featured paid article banners
    // If NO admin banners and NO featured articles -> empty slider (no fake defaults)
    const combinedBanners = [...adminBanners, ...articleBanners];

    // ── 3. Merge approved paid submissions with the dashboard RSS feed ──
    const feed = await getNewshubArticles(category || 'All', page, limit);

    return NextResponse.json({
      success: true,
      banners: combinedBanners,
      ...feed,
      categories: NEWSHUB_CATEGORIES,
    });
  } catch (error: any) {
    console.error('Error fetching newshub data:', error);
    return NextResponse.json({ error: 'Failed to fetch newshub data' }, { status: 500 });
  }
}
