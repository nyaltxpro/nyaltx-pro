// app/api/tokens/route.ts - Main tokens API endpoint
import { getCollection } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

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

  console.log('🔍 API Request params:', params);
  console.log('🌍 Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    HAS_MONGODB_URI: !!process.env.MONGODB_URI
  });

  try {
    let allTokens: NormalizedToken[] = [];
    let totalCount = 0;
    let hasMore = false;

    // Fetch local registered tokens
    if (params.source === 'local' || params.source === 'all') {
      console.log('📊 Fetching local tokens...');
      const localTokens = await fetchLocalTokens(params);
      console.log('✅ Local tokens found:', localTokens.length);
      allTokens.push(...localTokens);
    }

    // Fetch Solana tokens if requested
    if (params.source === 'solana' || params.source === 'all') {
      if (params.query || params.symbol) {
        console.log('🚀 Fetching Solana tokens...');
        const solanaTokens = await fetchSolanaTokens(params);
        console.log('✅ Solana tokens found:', solanaTokens);
        console.log('✅ Solana tokens found:', solanaTokens.tokens.length);

        allTokens.push(...solanaTokens.tokens);
        if (params.source === 'solana') {
          totalCount = solanaTokens.total;
          hasMore = solanaTokens.hasMore;
        }
      } else {
        console.log('⚠️ Skipping Solana tokens - no query provided');
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
      const beforeFilter = allTokens.length;
      allTokens = allTokens.filter(token => 
        (token.name && token.name.toLowerCase().includes(searchTerm)) ||
        (token.symbol && token.symbol.toLowerCase().includes(searchTerm)) ||
        (token.address && token.address.toLowerCase().includes(searchTerm))
      );
      console.log(`🔍 Local token filtering: ${beforeFilter} → ${allTokens.length} tokens after filtering for "${searchTerm}"`);
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

    console.log('📤 Final response:', {
      tokensCount: paginatedTokens.length,
      totalCount,
      source: params.source,
      query: params.query
    });

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

    const mappedTokens = tokens.map((token: any) => ({
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

    console.log('🏪 Local tokens mapped:', mappedTokens.map(t => ({ name: t.name, symbol: t.symbol, address: t.address })));
    return mappedTokens;
  } catch (error) {
    console.error('Error fetching local tokens:', error);
    return [];
  }
}

async function fetchSolanaTokens(params: TokenSearchParams): Promise<{ tokens: NormalizedToken[], total: number, hasMore: boolean }> {
  try {
    // Try direct external API call first, fallback to internal API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('🌐 Solana API strategy:', { baseUrl, isProduction });
    
    if (isProduction) {
      // In production, call Solana Tracker directly to avoid internal API issues
      return await fetchSolanaTokensDirect(params);
    }
    
    // In development, use internal API
    const url = new URL(`${baseUrl}/api/solanatokens`);
    
    // Use the correct parameter names that the solanatokens endpoint expects
    if (params.query) url.searchParams.append('query', params.query);
    if (params.symbol) url.searchParams.append('symbol', params.symbol);
    if (params.page) url.searchParams.append('page', params.page.toString());
    if (params.limit) url.searchParams.append('limit', params.limit.toString());

    console.log('🌐 Calling internal Solana API:', url.toString());

    const response = await fetch(url.toString());
    
    console.log('📡 Internal Solana API Response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Internal Solana API error: ${response.status} - ${errorText}`);
      return { tokens: [], total: 0, hasMore: false };
    }

    const data = await response.json();
    console.log('📊 Solana API data structure:', { 
      hasTokens: !!data.tokens, 
      tokensLength: data.tokens?.length || 0,
      hasPagination: !!data.pagination 
    });
    
    // The solanatokens endpoint returns { tokens: [...], pagination: {...} }
    const normalizedTokens: NormalizedToken[] = (data.tokens || []).map((token: any) => ({
      id: `solana-${token.address}`,
      address: token.address || '',
      name: token.name || 'Unknown',
      symbol: token.symbol || '',
      logo: token.logo,
      chain: 'solana',
      price: token.price,
      marketCap: token.marketCap,
      liquidity: token.liquidity,
      createdAt: token.createdAt,
      source: 'solana' as const,
      status: 'active',
      volume: token.volume,
      volume24h: token.volume24h,
      holders: token.holders,
      transactions: token.transactions,
      socials: token.socials
    }));

    return {
      tokens: normalizedTokens,
      total: data.pagination?.total || 0,
      hasMore: data.pagination?.hasMore || false
    };
  } catch (error) {
    console.error('Error fetching Solana tokens:', error);
    return { tokens: [], total: 0, hasMore: false };
  }
}

// Direct Solana Tracker API call for production to avoid internal API issues
async function fetchSolanaTokensDirect(params: TokenSearchParams): Promise<{ tokens: NormalizedToken[], total: number, hasMore: boolean }> {
  try {
    const API_KEY = 'd82b528d-a84d-4008-ac0f-cea123d8203c';
    const API_URL = 'https://data.solanatracker.io/search';
    
    const url = new URL(API_URL);
    if (params.query) url.searchParams.append('query', params.query);
    if (params.symbol) url.searchParams.append('symbol', params.symbol);
    url.searchParams.append('page', (params.page || 1).toString());
    url.searchParams.append('limit', (params.limit || 20).toString());
    url.searchParams.append('sortBy', 'createdAt');
    url.searchParams.append('sortOrder', 'desc');
    url.searchParams.append('showAllPools', 'false');

    console.log('🌐 Direct Solana Tracker API URL:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    console.log('📡 Direct Solana Tracker Response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Direct Solana Tracker API error: ${response.status} - ${errorText}`);
      return { tokens: [], total: 0, hasMore: false };
    }

    const apiData = await response.json();
    console.log('📊 Direct Solana API data structure:', { 
      hasData: !!apiData.data, 
      dataLength: apiData.data?.length || 0,
      status: apiData.status 
    });

    // Normalize the data to match our expected format
    const normalizedTokens: NormalizedToken[] = (apiData.data || []).map((token: any) => ({
      id: `solana-${token.mint || token.poolAddress}`,
      address: token.mint || token.poolAddress || '',
      name: token.name || 'Unknown',
      symbol: token.symbol || '',
      logo: token.image,
      chain: 'solana',
      price: token.priceUsd,
      marketCap: token.marketCapUsd,
      liquidity: token.liquidityUsd,
      createdAt: token.createdAt ? new Date(token.createdAt).toISOString() : new Date().toISOString(),
      source: 'solana' as const,
      status: 'active',
      volume: token.volume,
      volume24h: token.volume_24h,
      holders: token.holders,
      transactions: token.totalTransactions,
      socials: token.socials
    }));

    return {
      tokens: normalizedTokens,
      total: apiData.total || 0,
      hasMore: apiData.hasMore || false
    };
  } catch (error) {
    console.error('Error in direct Solana Tracker API call:', error);
    return { tokens: [], total: 0, hasMore: false };
  }
}
