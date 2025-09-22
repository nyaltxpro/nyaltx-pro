import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'C6BURIGOKuakyekTy9BT53hTvtE5g2I5NQH3hgwd';
const BASE_URL = 'https://developers.coinmarketcal.com/v1/events';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const max = searchParams.get('max') || '50';
    
    const response = await fetch(`${BASE_URL}?page=${page}&max=${max}`, {
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
