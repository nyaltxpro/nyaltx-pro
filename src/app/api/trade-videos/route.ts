import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('trade_videos');

    const videos = await collection
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    const serialized = videos.map(video => ({
      id: video._id.toString(),
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      videoId: video.videoId,
      description: video.description || '',
      order: video.order ?? 0,
      thumbnailUrl: video.thumbnailUrl,
    }));

    return NextResponse.json({ videos: serialized });
  } catch (error) {
    console.error('Error fetching public trade videos:', error);
    return NextResponse.json({ error: 'Failed to load trade videos' }, { status: 500 });
  }
}
