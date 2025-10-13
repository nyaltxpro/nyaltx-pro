import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('banner_metadata');
    
    const bannerMetadata = await collection.find({}).toArray();
    
    return NextResponse.json({ bannerMetadata });
  } catch (error: any) {
    console.error('Error fetching banner metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch banner metadata' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('banner_metadata');
    
    const { bannerName, hyperlink, title, description } = await request.json();
    
    if (!bannerName) {
      return NextResponse.json({ error: 'Banner name is required' }, { status: 400 });
    }
    
    const bannerMetadata = {
      bannerName,
      hyperlink: hyperlink || '',
      title: title || '',
      description: description || '',
      updatedAt: new Date(),
    };
    
    await collection.updateOne(
      { bannerName },
      { $set: bannerMetadata },
      { upsert: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Banner metadata updated successfully',
      bannerMetadata 
    });
  } catch (error: any) {
    console.error('Error updating banner metadata:', error);
    return NextResponse.json({ error: 'Failed to update banner metadata' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('banner_metadata');
    
    const { bannerName } = await request.json();
    
    if (!bannerName) {
      return NextResponse.json({ error: 'Banner name is required' }, { status: 400 });
    }
    
    await collection.deleteOne({ bannerName });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Banner metadata deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting banner metadata:', error);
    return NextResponse.json({ error: 'Failed to delete banner metadata' }, { status: 500 });
  }
}
