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
    
    console.log('News API called with params:', { page, limit, tag });
    
    const skip = (page - 1) * limit;
    
    // Build query - only show published articles
    let query: any = { status: 'published' };
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    console.log('News API query:', query);
    
    // Get total count for pagination
    const total = await collection.countDocuments(query);
    console.log('Total published articles found:', total);
    
    // Check all articles in collection for debugging
    const allArticles = await collection.find({}).toArray();
    console.log('All articles in collection:', allArticles.length);
    console.log('Article statuses:', allArticles.map(a => ({ title: a.title, status: a.status, publishedAt: a.publishedAt })));
    
    // Get published news articles with pagination
    const news = await collection
      .find(query)
      .sort({ publishedAt: -1 })
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
        views: 1
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
