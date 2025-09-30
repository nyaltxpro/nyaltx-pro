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

    // Get top 10 coins for detailed info (to avoid too many API calls)
    const topCoins = data.coins?.slice(0, 10) || [];
    
    // Fetch detailed information for each coin to get contract addresses
    const coinsWithDetails = await Promise.all(
      topCoins.map(async (coin: any) => {
        try {
          const detailResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
            {
              headers: {
                'Accept': 'application/json',
              },
              next: { revalidate: 3600 } // Cache for 1 hour since contract addresses don't change often
            }
          );

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            
            // Extract contract addresses for major chains
            const contractAddresses: { [key: string]: string } = {};
            if (detailData.platforms) {
              // Map CoinGecko platform names to our chain names
              const platformMapping: { [key: string]: string } = {
                'ethereum': 'ethereum',
                'binance-smart-chain': 'binance',
                'polygon-pos': 'polygon',
                'avalanche': 'avalanche',
                'arbitrum-one': 'arbitrum',
                'optimistic-ethereum': 'optimism',
                'base': 'base',
                'fantom': 'fantom',
                'solana': 'solana'
              };

              Object.entries(detailData.platforms).forEach(([platform, address]) => {
                const chainName = platformMapping[platform];
                if (chainName && address && address !== '') {
                  contractAddresses[chainName] = address as string;
                }
              });
            }

            // Determine primary chain (prefer Ethereum, then others)
            const primaryChain = contractAddresses.ethereum ? 'ethereum' :
                               contractAddresses.binance ? 'binance' :
                               contractAddresses.polygon ? 'polygon' :
                               contractAddresses.arbitrum ? 'arbitrum' :
                               contractAddresses.base ? 'base' :
                               contractAddresses.solana ? 'solana' :
                               Object.keys(contractAddresses)[0] || null;

            return {
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol,
              market_cap_rank: coin.market_cap_rank,
              thumb: coin.thumb,
              large: coin.large,
              api_symbol: coin.api_symbol,
              contractAddresses,
              primaryChain,
              primaryAddress: primaryChain ? contractAddresses[primaryChain] : null
            };
          }
        } catch (error) {
          console.error(`Error fetching details for ${coin.id}:`, error);
        }

        // Return basic info if detailed fetch fails
        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          market_cap_rank: coin.market_cap_rank,
          thumb: coin.thumb,
          large: coin.large,
          api_symbol: coin.api_symbol,
          contractAddresses: {},
          primaryChain: null,
          primaryAddress: null
        };
      })
    );

    return NextResponse.json({
      coins: coinsWithDetails,
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
