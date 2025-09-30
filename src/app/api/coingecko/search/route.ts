import { NextRequest, NextResponse } from 'next/server';

interface CoinGeckoSearchCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
  api_symbol: string;
}

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

    // Get top 8 coins for detailed info (reduced to improve reliability)
    const topCoins = data.coins?.slice(0, 8) || [];
    
    // Helper function to fetch coin details with retry logic
    const fetchCoinDetails = async (coin: CoinGeckoSearchCoin, retries = 2): Promise<any> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
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
                if (chainName && address && address !== '' && address !== '0x0000000000000000000000000000000000000000') {
                  contractAddresses[chainName] = address as string;
                }
              });
            }

            // Determine primary chain (prefer Ethereum, then others by popularity)
            const chainPriority = ['ethereum', 'binance', 'polygon', 'arbitrum', 'base', 'optimism', 'avalanche', 'fantom', 'solana'];
            const primaryChain = chainPriority.find(chain => contractAddresses[chain]) || Object.keys(contractAddresses)[0] || null;

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
          } else if (detailResponse.status === 429) {
            // Rate limited, wait and retry
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
        market_cap_rank: coin.market_cap_rank,
        thumb: coin.thumb,
        large: coin.large,
        api_symbol: coin.api_symbol,
        contractAddresses: {},
        primaryChain: null,
        primaryAddress: null
      };
    };

    // Fetch details with controlled concurrency to avoid overwhelming the API
    const coinsWithDetails = [];
    const batchSize = 3; // Process 3 coins at a time
    
    for (let i = 0; i < topCoins.length; i += batchSize) {
      const batch = topCoins.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((coin: CoinGeckoSearchCoin) => fetchCoinDetails(coin))
      );
      coinsWithDetails.push(...batchResults);
      
      // Small delay between batches to be respectful to the API
      if (i + batchSize < topCoins.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

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
