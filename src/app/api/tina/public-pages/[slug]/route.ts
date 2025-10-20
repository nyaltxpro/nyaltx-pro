import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // In development, read from static JSON file
    // In production with Tina Cloud, this would query Tina's GraphQL API
    const contentPath = path.join(process.cwd(), 'content', 'public-pages', `${slug}.json`);
    
    if (!fs.existsSync(contentPath)) {
      return NextResponse.json(
        { error: `Public page content not found for slug: ${slug}` },
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
    console.error('Error fetching public page content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public page content' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    
    // In production, this would update the content via Tina's API
    // For development, we can write to the JSON file
    const contentPath = path.join(process.cwd(), 'content', 'public-pages', `${slug}.json`);
    
    fs.writeFileSync(contentPath, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating public page content:', error);
    return NextResponse.json(
      { error: 'Failed to update public page content' },
      { status: 500 }
    );
  }
}
