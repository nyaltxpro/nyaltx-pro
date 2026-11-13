import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const db = await getDb();
    const collection = db.collection('corporate_news');
    
    const { slug } = params;
    
    console.log('Individual article API called with slug:', slug);
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    
    // Check all articles with this slug (regardless of status) for debugging
    const allMatchingArticles = await collection.find({ slug }).toArray();
    console.log('All articles with slug:', slug, allMatchingArticles.map(a => ({ 
      title: a.title, 
      status: a.status, 
      publishedAt: a.publishedAt,
      slug: a.slug 
    })));
    
    // Find the news article by slug or ObjectId and ensure it's published
    const query: any = {
      status: 'published',
      $or: [{ slug }]
    };
    if (ObjectId.isValid(slug)) {
      query.$or.push({ _id: new ObjectId(slug) });
    }

    const newsArticle = await collection.findOne(query);
    
    console.log('Published article found:', newsArticle ? 'YES' : 'NO');
    
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
