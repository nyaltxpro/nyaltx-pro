import { NextRequest, NextResponse } from 'next/server';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const MORALIS_BASE_URL = 'https://solana-gateway.moralis.io';

interface PumpFunToken {
  tokenAddress: string;
  name: string;
  symbol: string;
  logo: string | null;
  decimals: string;
  priceNative: string;
  priceUsd: string;
  liquidity: string;
  fullyDilutedValuation: string;
  createdAt: string;
}

interface MoralisResponse {
  result: PumpFunToken[];
  cursor?: string;
}

export async function GET(request: NextRequest) {
  if (!MORALIS_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Moralis API key not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';
  const cursor = searchParams.get('cursor');

  try {
    console.log('🟣 Fetching new Pump.fun tokens from Moralis API...');
    
    // Build URL with parameters
    let url = `${MORALIS_BASE_URL}/token/mainnet/exchange/pumpfun/new?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY,
        'User-Agent': 'NYALTX-PumpFun/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ Moralis API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: `Moralis API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: MoralisResponse = await response.json();
    console.log(`✅ Fetched ${data.result?.length || 0} new Pump.fun tokens`);

    // Transform the data to match our expected format
    const transformedTokens = data.result?.map((token: PumpFunToken) => ({
      address: token.tokenAddress,
      name: token.name,
      symbol: token.symbol,
      logo: token.logo,
      decimals: parseInt(token.decimals),
      priceNative: parseFloat(token.priceNative),
      priceUsd: parseFloat(token.priceUsd),
      liquidity: parseFloat(token.liquidity),
      marketCap: parseFloat(token.fullyDilutedValuation),
      createdAt: token.createdAt,
      chain: 'solana',
      platform: 'pumpfun'
    })) || [];

    // Cache headers for 30 seconds
    const headers = {
      'Cache-Control': 'public, max-age=30, s-maxage=30',
      'Content-Type': 'application/json'
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          tokens: transformedTokens,
          cursor: data.cursor,
          count: transformedTokens.length
        }
      },
      { headers }
    );

  } catch (error: any) {
    console.error('❌ Error fetching new Pump.fun tokens:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timeout' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch new tokens' },
      { status: 500 }
    );
  }
}
