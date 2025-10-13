import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const db = await getDb();
    const collection = db.collection('corporate_news');
    
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    
    // Find the news article by slug and ensure it's published
    const newsArticle = await collection.findOne({ 
      slug, 
      status: 'published' 
    });
    
    if (!newsArticle) {
      return NextResponse.json({ error: 'News article not found' }, { status: 404 });
    }
    
    // Increment view count
    await collection.updateOne(
      { _id: newsArticle._id },
      { $inc: { views: 1 } }
    );
    
    return NextResponse.json({ news: newsArticle });
  } catch (error: any) {
    console.error('Error fetching news article:', error);
    return NextResponse.json({ error: 'Failed to fetch news article' }, { status: 500 });
  }
}
