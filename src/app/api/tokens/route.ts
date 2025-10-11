// app/api/tokens/route.ts - Main tokens API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

interface TokenSearchParams {
  query?: string;
  symbol?: string;
  chain?: string;
  limit?: number;
  page?: number;
  source?: 'local' | 'solana' | 'all';
  status?: 'approved' | 'pending' | 'rejected' | 'all';
}

interface NormalizedToken {
  id: string;
  address: string;
  name: string;
  symbol: string;
  logo?: string;
  chain: string;
  price?: number;
  marketCap?: number;
  liquidity?: number;
  createdAt?: string;
  source: 'local' | 'solana';
  status?: string;
  // Additional fields
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
  
  const params: TokenSearchParams = {
    query: searchParams.get('query') || undefined,
    symbol: searchParams.get('symbol') || undefined,
    chain: searchParams.get('chain') || undefined,
    limit: Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '20', 10))),
    page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
    source: (searchParams.get('source') as 'local' | 'solana' | 'all') || 'all',
    status: (searchParams.get('status') as 'approved' | 'pending' | 'rejected' | 'all') || 'approved'
  };

  try {
    let allTokens: NormalizedToken[] = [];
    let totalCount = 0;
    let hasMore = false;

    // Fetch local registered tokens
    if (params.source === 'local' || params.source === 'all') {
      const localTokens = await fetchLocalTokens(params);
      allTokens.push(...localTokens);
    }

    // Fetch Solana tokens if requested
    if (params.source === 'solana' || params.source === 'all') {
      if (params.query || params.symbol) {
        const solanaTokens = await fetchSolanaTokens(params);
        allTokens.push(...solanaTokens.tokens);
        if (params.source === 'solana') {
          totalCount = solanaTokens.total;
          hasMore = solanaTokens.hasMore;
        }
      }
    }

    // Apply additional filtering if needed
    if (params.chain && params.chain !== 'solana') {
      allTokens = allTokens.filter(token => 
        token.chain.toLowerCase() === params.chain!.toLowerCase()
      );
    }

    // Apply search filtering for local tokens
    if (params.query && (params.source === 'local' || params.source === 'all')) {
      const searchTerm = params.query.toLowerCase();
      allTokens = allTokens.filter(token => 
        token.name.toLowerCase().includes(searchTerm) ||
        token.symbol.toLowerCase().includes(searchTerm) ||
        token.address.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by creation date (newest first) and limit results
    allTokens.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Pagination
    const startIndex = (params.page! - 1) * params.limit!;
    const endIndex = startIndex + params.limit!;
    const paginatedTokens = allTokens.slice(startIndex, endIndex);

    // Calculate pagination info
    if (params.source === 'local' || params.source === 'all') {
      totalCount = allTokens.length;
      hasMore = endIndex < allTokens.length;
    }

    const response = {
      tokens: paginatedTokens,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / params.limit!),
        hasMore
      },
      meta: {
        source: params.source,
        chain: params.chain,
        status: params.status,
        query: params.query
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Tokens API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch tokens',
        tokens: [],
        pagination: { page: 1, limit: params.limit || 20, total: 0, pages: 0, hasMore: false }
      },
      { status: 500 }
    );
  }
}

async function fetchLocalTokens(params: TokenSearchParams): Promise<NormalizedToken[]> {
  try {
    const col = await getCollection<any>('token_registrations');
    const query: any = {};

    // Filter by status
    if (params.status && params.status !== 'all') {
      query.status = params.status;
      if (params.status === 'approved') {
        query.paused = { $ne: true }; // Hide paused tokens for approved status
      }
    }

    // Filter by chain
    if (params.chain && params.chain !== 'solana') {
      query.blockchain = params.chain;
    }

    const tokens = await col
      .find(query)
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return tokens.map((token: any) => ({
      id: `local-${token.contractAddress || token.tokenSymbol}`,
      address: token.contractAddress || '',
      name: token.tokenName || token.name || 'Unknown',
      symbol: token.tokenSymbol || token.symbol || '',
      logo: token.imageUri || token.logo,
      chain: token.blockchain || 'ethereum',
      createdAt: token.createdAt || new Date().toISOString(),
      source: 'local' as const,
      status: token.status || 'pending',
      socials: {
        website: token.website,
        twitter: token.twitter,
        telegram: token.telegram
      }
    }));
  } catch (error) {
    console.error('Error fetching local tokens:', error);
    return [];
  }
}

async function fetchSolanaTokens(params: TokenSearchParams): Promise<{ tokens: NormalizedToken[], total: number, hasMore: boolean }> {
  try {
    // Direct API call to Solana Tracker instead of internal API call to fix Vercel issues
    const API_KEY = 'd82b528d-a84d-4008-ac0f-cea123d8203c';
    const API_URL = 'https://data.solanatracker.io/search';
    
    const url = new URL(API_URL);
    if (params.query) url.searchParams.append('q', params.query);
    if (params.symbol) url.searchParams.append('q', params.symbol);
    url.searchParams.append('limit', (params.limit || 20).toString());
    url.searchParams.append('page', (params.page || 1).toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Solana Tracker API error: ${response.status}`);
      return { tokens: [], total: 0, hasMore: false };
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid Solana Tracker response format');
      return { tokens: [], total: 0, hasMore: false };
    }
    
    const normalizedTokens: NormalizedToken[] = data.data.map((token: any) => ({
      id: `solana-${token.mint || token.address}`,
      address: token.mint || token.address || '',
      name: token.name || 'Unknown',
      symbol: token.symbol || '',
      logo: token.image,
      chain: 'solana',
      price: token.priceUsd || token.price,
      marketCap: token.marketCapUsd || token.marketCap,
      liquidity: token.liquidityUsd || token.liquidity,
      createdAt: token.createdAt ? new Date(token.createdAt * 1000).toISOString() : new Date().toISOString(),
      source: 'solana' as const,
      status: 'active',
      volume: token.volume,
      volume24h: token.volume_24h || token.volume24h,
      holders: token.holders,
      transactions: token.totalTransactions || token.transactions,
      socials: token.socials
    }));

    return {
      tokens: normalizedTokens,
      total: data.total || 0,
      hasMore: data.hasMore || false
    };
  } catch (error) {
    console.error('Error fetching Solana tokens:', error);
    return { tokens: [], total: 0, hasMore: false };
  }
}
