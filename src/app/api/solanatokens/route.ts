// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'd82b528d-a84d-4008-ac0f-cea123d8203c';
const API_URL = 'https://data.solanatracker.io/search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const symbol = searchParams.get('symbol');
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '100';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const showAllPools = searchParams.get('showAllPools') || 'false';

  if (!query && !symbol) {
    return NextResponse.json(
      { error: 'Query or symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    const url = new URL(API_URL);
    if (query) url.searchParams.append('query', query);
    if (symbol) url.searchParams.append('symbol', symbol);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('sortOrder', sortOrder);
    url.searchParams.append('showAllPools', showAllPools);

    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    );
  }
}