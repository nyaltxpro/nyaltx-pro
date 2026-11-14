import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// Criteria that marks a submission as a paid user submission (not platform editorial)
const PAID_CRITERIA = [
  { isPaid: true },
  { plan: { $in: ['feed', 'slider', 'prem'] } },
  { paymentMethod: { $exists: true, $ne: null } },
  { paymentStatus: { $exists: true, $ne: null } },
  { amount: { $gt: 0 } },
  { type: 'pr' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const bannersCollection = db.collection('newshub_banners');
    const newsCollection = db.collection('corporate_news');

    // ── 1. Admin-uploaded slider banners ──────────────────────────────────
    const adminBanners = await bannersCollection
      .find({ isActive: { $ne: false } })
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    // ── 2. Published PAID articles marked as featured / Full Service slider ─
    // These auto-appear in the slider alongside admin banners
    const featuredPaidArticles = await newsCollection
      .find({
        status: 'published',
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
    // If NO admin banners and NO featured articles → empty slider (no fake defaults)
    const combinedBanners = [...adminBanners, ...articleBanners];

    // ── 3. Feed: ONLY published PAID submissions ──────────────────────────
    const feedQuery: any = {
      status: 'published',
      $or: PAID_CRITERIA,
    };

    // Category filter on top of paid filter
    if (category && category !== 'All') {
      if (category === 'Press Releases') {
        feedQuery.$and = [
          { $or: PAID_CRITERIA },
          {
            $or: [
              { type: 'pr' },
              { category: 'Press Releases' },
              { tags: { $in: ['Press Releases', 'PR', 'press-release'] } },
            ],
          },
        ];
        delete feedQuery.$or; // replaced by $and above
      } else {
        feedQuery.$and = [
          { $or: PAID_CRITERIA },
          {
            $or: [
              { category: { $regex: new RegExp(`^${category}$`, 'i') } },
              { tags: { $in: [category] } },
            ],
          },
        ];
        delete feedQuery.$or;
      }
    }

    const totalArticles = await newsCollection.countDocuments(feedQuery);

    const articles = await newsCollection
      .find(feedQuery)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
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
      .toArray();

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

    return NextResponse.json({
      success: true,
      banners: combinedBanners,
      articles,
      pagination: {
        total: totalArticles,
        page,
        limit,
        pages: Math.ceil(totalArticles / limit),
      },
      categories,
    });
  } catch (error: any) {
    console.error('Error fetching newshub data:', error);
    return NextResponse.json({ error: 'Failed to fetch newshub data' }, { status: 500 });
  }
}
