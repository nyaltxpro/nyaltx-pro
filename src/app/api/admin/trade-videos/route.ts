import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('trade_videos');

    const videos = await collection
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    const serialized = videos.map(video => ({
      ...video,
      _id: video._id.toString(),
    }));

    return NextResponse.json({ videos: serialized });
  } catch (error) {
    console.error('Error fetching trade videos:', error);
    return NextResponse.json({ error: 'Failed to fetch trade videos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('trade_videos');

    const { title, youtubeUrl, description = '', order = 0, isActive = true } = await request.json();

    if (!title || !youtubeUrl) {
      return NextResponse.json({ error: 'Title and YouTube URL are required' }, { status: 400 });
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const now = new Date();
    const numericOrder = Number.isFinite(Number(order)) ? Number(order) : 0;

    const document = {
      title,
      youtubeUrl,
      videoId,
      description,
      order: numericOrder,
      isActive: Boolean(isActive),
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(document);

    return NextResponse.json({
      success: true,
      video: {
        ...document,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating trade video:', error);
    return NextResponse.json({ error: 'Failed to create trade video' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('trade_videos');

    const { id, title, youtubeUrl, description, order, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (typeof title === 'string') {
      updateData.title = title;
    }

    if (typeof description === 'string') {
      updateData.description = description;
    }

    if (youtubeUrl) {
      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
      }
      updateData.youtubeUrl = youtubeUrl;
      updateData.videoId = videoId;
      updateData.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    if (order !== undefined) {
      const numericOrder = Number.isFinite(Number(order)) ? Number(order) : 0;
      updateData.order = numericOrder;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Trade video not found' }, { status: 404 });
    }

    const updatedVideo = result.value;

    return NextResponse.json({
      success: true,
      video: {
        ...updatedVideo,
        _id: updatedVideo._id.toString(),
      },
    });
  } catch (error) {
    console.error('Error updating trade video:', error);
    return NextResponse.json({ error: 'Failed to update trade video' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('trade_videos');

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Trade video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trade video:', error);
    return NextResponse.json({ error: 'Failed to delete trade video' }, { status: 500 });
  }
}
