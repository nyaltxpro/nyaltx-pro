import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'tradevideos');

interface TradeVideo {
  title?: string;
  videoId: string;
  description?: string;
  featured?: boolean;
  order?: number;
  publishedAt?: string;
}

const sortVideos = (videos: TradeVideo[]) => {
  return videos.sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;

    return dateB - dateA;
  });
};

export async function GET() {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      return NextResponse.json({ videos: [] });
    }

    const entries = fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith('.json'));

    const videos: TradeVideo[] = entries
      .map((fileName) => {
        const filePath = path.join(CONTENT_DIR, fileName);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(content);

          if (parsed && typeof parsed.videoId === 'string' && parsed.videoId.trim().length > 0) {
            return parsed as TradeVideo;
          }
        } catch (error) {
          console.error(`Error reading trade video file ${fileName}:`, error);
        }
        return null;
      })
      .filter((item): item is TradeVideo => item !== null);

    const sortedVideos = sortVideos(videos);

    return NextResponse.json({ videos: sortedVideos });
  } catch (error) {
    console.error('Error fetching trade videos:', error);
    return NextResponse.json({ error: 'Failed to fetch trade videos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, data } = body ?? {};

    if (!fileName || !data) {
      return NextResponse.json({ error: 'Missing fileName or data payload' }, { status: 400 });
    }

    if (!fs.existsSync(CONTENT_DIR)) {
      fs.mkdirSync(CONTENT_DIR, { recursive: true });
    }

    const targetPath = path.join(CONTENT_DIR, `${fileName.replace(/\.json$/, '')}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating trade videos:', error);
    return NextResponse.json({ error: 'Failed to update trade videos' }, { status: 500 });
  }
}
