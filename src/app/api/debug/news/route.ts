import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('corporate_news');
    
    // Get all articles with basic info
    const allArticles = await collection
      .find({})
      .project({
        title: 1,
        slug: 1,
        status: 1,
        publishedAt: 1,
        createdAt: 1,
        author: 1
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      total: allArticles.length,
      articles: allArticles.map(article => ({
        id: article._id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
        author: article.author
      }))
    });
  } catch (error: any) {
    console.error('Error fetching debug news:', error);
    return NextResponse.json({ error: 'Failed to fetch debug news' }, { status: 500 });
  }
}
