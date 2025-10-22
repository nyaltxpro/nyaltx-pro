import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'legaladvice', 'settings.json');

    if (!fs.existsSync(contentPath)) {
      return NextResponse.json(
        { error: 'Legal advice content not found' },
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
    console.error('Error fetching legal advice content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal advice content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contentPath = path.join(process.cwd(), 'content', 'legaladvice', 'settings.json');

    fs.writeFileSync(contentPath, JSON.stringify(body, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating legal advice content:', error);
    return NextResponse.json(
      { error: 'Failed to update legal advice content' },
      { status: 500 }
    );
  }
}
