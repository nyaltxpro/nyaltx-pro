import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('corporate_news');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const tag = searchParams.get('tag');
    const featured = searchParams.get('featured');
    const paidParam = searchParams.get('paid'); // 'true' | 'only' | 'false' | 'all'
    
    console.log('News API called with params:', { page, limit, tag, featured, paid: paidParam });
    
    const skip = (page - 1) * limit;
    
    // Criteria defining paid user submissions
    const paidCriteria = [
      { isPaid: true },
      { plan: { $in: ['feed', 'slider', 'prem'] } },
      { plan: { $exists: true, $ne: null } },
      { paymentMethod: { $exists: true, $ne: null } },
      { paymentStatus: { $exists: true, $ne: null } },
      { amount: { $gt: 0 } },
      { type: 'pr' },
    ];

    // Build query - only show published articles
    let query: any = { status: 'published' };
    
    if (featured === 'true') {
      query.featuredInBanner = true;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (paidParam === 'true' || paidParam === 'only') {
      // ONLY paid user submissions (for dashboard or paid feeds)
      query.$or = paidCriteria;
    } else if (paidParam === 'all') {
      // Both corporate and paid news (e.g. for NewsHub)
    } else {
      // DEFAULT and paid === 'false': Exclude paid news (official corporate news only)
      query.$nor = paidCriteria;
    }
    
    console.log('News API query:', JSON.stringify(query));
    
    // Get total count for pagination
    const total = await collection.countDocuments(query);
    console.log('Total published articles found:', total);
    
    // Get published news articles with pagination
    const news = await collection
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
        title: 1,
        excerpt: 1,
        featuredImage: 1,
        publishedAt: 1,
        author: 1,
        slug: 1,
        tags: 1,
        views: 1,
        featuredInBanner: 1,
        category: 1,
        coverColor: 1,
        type: 1,
        sourceUrl: 1,
        status: 1,
        isPaid: 1,
        plan: 1,
        amount: 1
      })
      .toArray();
    
    console.log('Published articles returned:', news.length);
    
    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching published news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
