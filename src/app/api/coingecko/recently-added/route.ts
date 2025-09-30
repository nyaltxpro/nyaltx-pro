import { NextRequest, NextResponse } from 'next/server';

interface RecentlyAddedCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  image: string;
  market_cap_change_percentage_24h: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // First get the complete list of coins to find recently added ones
    const coinsListResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/list?include_platform=false',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NYALTX-Search/1.0'
        },
        next: { revalidate: 3600 } // Cache for 1 hour since coin list doesn't change often
      }
    );

    if (!coinsListResponse.ok) {
      throw new Error(`CoinGecko API error: ${coinsListResponse.status}`);
    }

    const allCoins = await coinsListResponse.json();
    
    // Sort by when they were added to CoinGecko (newest first)
    // Use a combination of ID patterns and length to identify newer coins
    const sortedCoins = [...allCoins].sort((a, b) => {
      // Newer coins often have longer, more specific IDs or contain recent patterns
      const aScore = a.id.length + (a.id.includes('-') ? 10 : 0) + (a.id.includes('2024') || a.id.includes('2023') ? 50 : 0);
      const bScore = b.id.length + (b.id.includes('-') ? 10 : 0) + (b.id.includes('2024') || b.id.includes('2023') ? 50 : 0);
      
      return bScore - aScore;
    });
    
    // Take more coins than needed in case some don't have market data
    const newestCoins = sortedCoins.slice(0, limit * 4);
    const coinIds = newestCoins.map(coin => coin.id).join(',');

    // Get market data for these coins
    const marketResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&per_page=${limit * 4}&page=1&sparkline=false&price_change_percentage=24h`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NYALTX-Search/1.0'
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!marketResponse.ok) {
      throw new Error(`CoinGecko market API error: ${marketResponse.status}`);
    }

    const marketData = await marketResponse.json();
    
    // Filter out coins without proper market data and limit results
    const validCoins = marketData
      .filter((coin: any) => coin.current_price && coin.market_cap && coin.total_volume)
      .slice(0, Math.min(limit, 8)); // Limit to 8 for better performance

    // Helper function to fetch coin details with retry logic
    const fetchCoinDetails = async (coin: any, retries = 2): Promise<any> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const detailResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'NYALTX-Search/1.0'
              },
              signal: controller.signal,
              next: { revalidate: 3600 } // Cache for 1 hour
            }
          );

          clearTimeout(timeoutId);

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            
            // Extract contract addresses for major chains
            const contractAddresses: { [key: string]: string } = {};
            if (detailData.platforms) {
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
                if (chainName && address && address !== '' && address !== '0x0000000000000000000000000000000000000000') {
                  contractAddresses[chainName] = address as string;
                }
              });
            }

            // Determine primary chain
            const chainPriority = ['ethereum', 'binance', 'polygon', 'arbitrum', 'base', 'optimism', 'avalanche', 'fantom', 'solana'];
            const primaryChain = chainPriority.find(chain => contractAddresses[chain]) || Object.keys(contractAddresses)[0] || null;

            return {
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol,
              current_price: coin.current_price,
              market_cap: coin.market_cap,
              market_cap_rank: coin.market_cap_rank,
              total_volume: coin.total_volume,
              image: coin.image,
              market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
              contractAddresses,
              primaryChain,
              primaryAddress: primaryChain ? contractAddresses[primaryChain] : null
            };
          } else if (detailResponse.status === 429) {
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
              continue;
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log(`Timeout fetching details for ${coin.id}, attempt ${attempt + 1}`);
          } else {
            console.error(`Error fetching details for ${coin.id}, attempt ${attempt + 1}:`, error);
          }
          
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
            continue;
          }
        }
      }

      // Return basic info if all attempts fail
      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        total_volume: coin.total_volume,
        image: coin.image,
        market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
        contractAddresses: {},
        primaryChain: null,
        primaryAddress: null
      };
    };

    // Fetch details with controlled concurrency
    const coinsWithDetails = [];
    const batchSize = 3;
    
    for (let i = 0; i < validCoins.length; i += batchSize) {
      const batch = validCoins.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((coin: any) => fetchCoinDetails(coin))
      );
      coinsWithDetails.push(...batchResults);
      
      if (i + batchSize < validCoins.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      coins: coinsWithDetails,
      total: coinsWithDetails.length
    });

  } catch (error) {
    console.error('Recently added coins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recently added coins' },
      { status: 500 }
    );
  }
}
