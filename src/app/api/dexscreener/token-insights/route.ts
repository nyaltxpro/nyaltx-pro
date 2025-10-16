import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * DexScreener Token Insights API
 * GET /api/dexscreener/token-insights?chain={chainId}&address={tokenAddress}
 * 
 * Fetches detailed token pair data including price, volume, liquidity, and transactions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chain');
    const tokenAddress = searchParams.get('address');

    if (!chainId || !tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: chain and address' },
        { status: 400 }
      );
    }

    // Fetch token insights from DexScreener API
    const dexScreenerUrl = `https://api.dexscreener.com/tokens/v1/${chainId}/${tokenAddress}`;
    
    const response = await fetch(dexScreenerUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ DexScreener API error: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch token insights', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'No trading pairs found for this token' },
        { status: 404 }
      );
    }

    // Return the data
    return NextResponse.json({
      success: true,
      pairs: data,
      mainPair: data[0], // Return the most liquid pair as the main one
    });

  } catch (error) {
    console.error('❌ Error fetching DexScreener token insights:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
