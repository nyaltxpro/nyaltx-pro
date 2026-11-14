import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// Default starter banners to ensure high presentation fidelity when db has no banners yet
const DEFAULT_BANNERS = [
  {
    _id: 'default-1',
    title: 'Welcome to the NYALTX News Hub',
    description: 'Your home for NYAX updates, crypto headlines and community stories, all in one place.',
    category: 'NYAX',
    imageUrl: '',
    gradientIndex: 0,
    linkUrl: '/news',
    isSponsored: false,
    isActive: true,
    displayOrder: 1,
  },
  {
    _id: 'default-2',
    title: 'Got a story? Publish it on NYALTX',
    description: 'Reach crypto readers with a feed listing or a spot in the top banner.',
    category: 'Submit news',
    imageUrl: '',
    gradientIndex: 1,
    linkUrl: '#submit-news',
    isSponsored: false,
    isActive: true,
    displayOrder: 2,
  },
  {
    _id: 'default-3',
    title: 'NYAX Community Spotlight: Meet the builders',
    description: 'The people and projects shaping the NYAX ecosystem this month.',
    category: 'Community',
    imageUrl: '',
    gradientIndex: 3,
    linkUrl: '/news',
    isSponsored: false,
    isActive: true,
    displayOrder: 3,
  },
  {
    _id: 'default-4',
    title: 'Crypto Weekly: 5 things to watch',
    description: 'Our quick roundup of the stories moving digital markets.',
    category: 'Bitcoin',
    imageUrl: '',
    gradientIndex: 2,
    linkUrl: '/news',
    isSponsored: false,
    isActive: true,
    displayOrder: 4,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const bannersCollection = db.collection('newshub_banners');
    const newsCollection = db.collection('corporate_news');

    // 1. Fetch active banners uploaded by admin
    const adminBanners = await bannersCollection
      .find({ isActive: { $ne: false } })
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    // 2. Fetch featured published articles (slider plan or marked featuredInBanner)
    const featuredArticles = await newsCollection
      .find({
        status: 'published',
        $or: [
          { featuredInBanner: true },
          { plan: 'slider' },
          { planName: { $regex: /slider|full service/i } },
        ],
      })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(6)
      .toArray();

    // Map featured articles into banner format
    const articleBanners = featuredArticles.map(art => ({
      _id: String(art._id),
      title: art.title,
      description: art.excerpt || '',
      category: art.category || (art.type === 'pr' ? 'Press Release' : 'Featured'),
      imageUrl: art.featuredImage || '',
      gradientIndex: typeof art.coverColor === 'number' ? art.coverColor : 0,
      linkUrl: `/news/${art.slug}`,
      isSponsored: Boolean(art.isPaid || art.plan || art.type === 'pr'),
      isActive: true,
      displayOrder: 10,
    }));

    // Combine admin banners + featured articles
    let combinedBanners = [...adminBanners, ...articleBanners];
    if (combinedBanners.length === 0) {
      combinedBanners = DEFAULT_BANNERS;
    }

    // 3. Build feed query
    const feedQuery: any = {
      status: 'published',
    };

    if (category && category !== 'All') {
      if (category === 'Press Releases') {
        feedQuery.$or = [
          { type: 'pr' },
          { category: 'Press Releases' },
          { tags: { $in: ['Press Releases', 'PR', 'press-release'] } },
        ];
      } else if (category === 'Community') {
        feedQuery.$or = [
          { category: 'Community' },
          { tags: { $in: ['Community'] } },
          { author: { $regex: /community/i } },
          { type: { $ne: 'pr' }, isPaid: true },
        ];
      } else {
        feedQuery.$or = [
          { category: { $regex: new RegExp(`^${category}$`, 'i') } },
          { tags: { $in: [category] } },
        ];
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
