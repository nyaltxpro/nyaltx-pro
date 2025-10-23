import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'src', 'content', 'podcast', 'podcast.json');

export async function GET() {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      return NextResponse.json({ error: 'Podcast content not found' }, { status: 404 });
    }

    const content = fs.readFileSync(FILE_PATH, 'utf8');
    const data = JSON.parse(content);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching podcast content:', error);
    return NextResponse.json({ error: 'Failed to fetch podcast content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    fs.writeFileSync(FILE_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating podcast content:', error);
    return NextResponse.json({ error: 'Failed to update podcast content' }, { status: 500 });
  }
}
