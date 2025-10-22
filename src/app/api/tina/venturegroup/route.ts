import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // In development, read from static JSON file
    // In production with Tina Cloud, this would query Tina's GraphQL API
    const contentPath = path.join(process.cwd(), 'content', 'venturegroup', 'settings.json');
    
    if (!fs.existsSync(contentPath)) {
      return NextResponse.json(
        { error: 'Venture group content not found' },
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
    console.error('Error fetching venture group content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venture group content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This would be used by Tina CMS to update content
    const body = await request.json();
    
    // In production, this would update the content via Tina's API
    // For development, we can write to the JSON file
    const contentPath = path.join(process.cwd(), 'content', 'venturegroup', 'settings.json');
    
    fs.writeFileSync(contentPath, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating footer content:', error);
    return NextResponse.json(
      { error: 'Failed to update footer content' },
      { status: 500 }
    );
  }
}
