import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const getContentPath = () =>
  path.join(process.cwd(), 'content', 'navigation', 'public-header.json');

export async function GET(_request: NextRequest) {
  try {
    const contentPath = getContentPath();

    if (!fs.existsSync(contentPath)) {
      return NextResponse.json(
        { error: 'Navigation content not found' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(contentPath, 'utf8');
    const data = JSON.parse(content);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching navigation content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contentPath = getContentPath();

    fs.writeFileSync(contentPath, JSON.stringify(body, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating navigation content:', error);
    return NextResponse.json(
      { error: 'Failed to update navigation content' },
      { status: 500 }
    );
  }
}
