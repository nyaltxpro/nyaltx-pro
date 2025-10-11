// app/api/solanatokens/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'd82b528d-a84d-4008-ac0f-cea123d8203c';
const API_URL = 'https://data.solanatracker.io/search';

interface SolanaTrackerToken {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  mint: string;
  poolAddress: string;
  priceUsd: number;
  marketCapUsd: number;
  liquidityUsd: number;
  createdAt: number;
  socials?: {
    twitter?: string;
    website?: string;
    telegram?: string;
  };
  volume?: number;
  volume_24h?: number;
  holders?: number;
  buys?: number;
  sells?: number;
  totalTransactions?: number;
}

interface SolanaTrackerResponse {
  status: string;
  data: SolanaTrackerToken[];
  hasMore: boolean;
  nextCursor?: string;
  page: number;
  pages: number;
  total: number;
}

interface NormalizedToken {
  address: string;
  name?: string;
  symbol?: string;
  logo?: string;
  price?: number;
  marketCap?: number;
  liquidity?: number;
  createdAt?: string;
  pools?: any[];
  // Additional fields for compatibility
  volume?: number;
  volume24h?: number;
  holders?: number;
  transactions?: number;
  socials?: {
    twitter?: string;
    website?: string;
    telegram?: string;
  };
}

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

    const apiData: SolanaTrackerResponse = await response.json();

    // Normalize the data to match frontend expectations
    const normalizedTokens: NormalizedToken[] = apiData.data.map((token: SolanaTrackerToken) => ({
      address: token.mint || token.poolAddress,
      name: token.name,
      symbol: token.symbol,
      logo: token.image,
      price: token.priceUsd,
      marketCap: token.marketCapUsd,
      liquidity: token.liquidityUsd,
      createdAt: token.createdAt ? new Date(token.createdAt).toISOString() : undefined,
      pools: [{ address: token.poolAddress }], // Create pools array for compatibility
      // Additional fields
      volume: token.volume,
      volume24h: token.volume_24h,
      holders: token.holders,
      transactions: token.totalTransactions,
      socials: token.socials
    }));

    // Return normalized response matching frontend expectations
    const normalizedResponse = {
      tokens: normalizedTokens,
      pagination: {
        page: apiData.page,
        limit: parseInt(limit),
        total: apiData.total,
        pages: apiData.pages,
        hasMore: apiData.hasMore,
        nextCursor: apiData.nextCursor
      },
      // Include original metadata for advanced usage
      meta: {
        status: apiData.status,
        total: apiData.total,
        pages: apiData.pages,
        hasMore: apiData.hasMore
      }
    };

    return NextResponse.json(normalizedResponse);
  } catch (error) {
    console.error('Solana tokens API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        tokens: [] // Return empty tokens array for graceful fallback
      },
      { status: 500 }
    );
  }
}