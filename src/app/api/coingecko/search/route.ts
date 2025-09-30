import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    // Search CoinGecko for cryptocurrencies
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Format the response to include relevant coin data
    const formattedCoins = data.coins?.slice(0, 20).map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      market_cap_rank: coin.market_cap_rank,
      thumb: coin.thumb,
      large: coin.large,
      api_symbol: coin.api_symbol
    })) || [];

    return NextResponse.json({
      coins: formattedCoins,
      total: data.coins?.length || 0
    });

  } catch (error) {
    console.error('CoinGecko search error:', error);
    return NextResponse.json(
      { error: 'Failed to search cryptocurrencies' },
      { status: 500 }
    );
  }
}
