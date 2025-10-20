import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // In development, read from static JSON file
    // In production with Tina Cloud, this would query Tina's GraphQL API
    const contentPath = path.join(process.cwd(), 'content', 'pricing', 'pricing-data.json');
    
    if (!fs.existsSync(contentPath)) {
      return NextResponse.json(
        { error: 'Pricing content not found' },
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
    console.error('Error fetching pricing content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In production, this would update the content via Tina's API
    // For development, we can write to the JSON file
    const contentPath = path.join(process.cwd(), 'content', 'pricing', 'pricing-data.json');
    
    fs.writeFileSync(contentPath, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating pricing content:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing content' },
      { status: 500 }
    );
  }
}
