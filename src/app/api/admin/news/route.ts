import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('corporate_news');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all'; // published, draft, all
    
    const skip = (page - 1) * limit;
    
    // Build query based on status
    let query: any = {};
    if (status === 'published') {
      query.status = 'published';
    } else if (status === 'draft') {
      query.status = 'draft';
    }
    
    // Get total count for pagination
    const total = await collection.countDocuments(query);
    
    // Get news articles with pagination
    const news = await collection
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
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
    console.error('Error fetching corporate news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('corporate_news');
    
    const {
      title,
      content,
      excerpt,
      featuredImage,
      status = 'draft',
      publishedAt,
      tags = [],
      author,
      slug
    } = await request.json();
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ 
        error: 'Title and content are required' 
      }, { status: 400 });
    }
    
    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existingNews = await collection.findOne({ slug: finalSlug });
    if (existingNews) {
      return NextResponse.json({ 
        error: 'A news article with this slug already exists' 
      }, { status: 400 });
    }
    
    const newsArticle = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      featuredImage: featuredImage || null,
      status,
      publishedAt: status === 'published' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
      tags,
      author: author || 'NYALTX Team',
      slug: finalSlug,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0
    };
    
    const result = await collection.insertOne(newsArticle);
    
    return NextResponse.json({
      success: true,
      message: 'News article created successfully',
      id: result.insertedId,
      news: newsArticle
    });
  } catch (error: any) {
    console.error('Error creating news article:', error);
    return NextResponse.json({ error: 'Failed to create news article' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('corporate_news');
    
    const {
      id,
      title,
      content,
      excerpt,
      featuredImage,
      status,
      publishedAt,
      tags,
      author,
      slug
    } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (status) {
      updateData.status = status;
      if (status === 'published' && publishedAt) {
        updateData.publishedAt = new Date(publishedAt);
      } else if (status === 'published') {
        updateData.publishedAt = new Date();
      }
    }
    if (tags) updateData.tags = tags;
    if (author) updateData.author = author;
    if (slug) updateData.slug = slug;
    
    const result = await collection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'News article not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'News article updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating news article:', error);
    return NextResponse.json({ error: 'Failed to update news article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('corporate_news');
    
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }
    
    const result = await collection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'News article not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'News article deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting news article:', error);
    return NextResponse.json({ error: 'Failed to delete news article' }, { status: 500 });
  }
}
