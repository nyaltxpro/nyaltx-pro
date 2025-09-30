import { NextRequest, NextResponse } from 'next/server';

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
  score: number;
  price_btc: number;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch trending coins from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/search/trending',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NYALTX-Search/1.0'
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const trendingCoins = data.coins?.slice(0, 8) || []; // Limit to 8 for better performance

    // Helper function to fetch coin details with enhanced retry logic
    const fetchCoinDetails = async (coin: any, retries = 3): Promise<any> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout
          
          const detailResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin.item.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
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
              id: coin.item.id,
              name: coin.item.name,
              symbol: coin.item.symbol,
              market_cap_rank: coin.item.market_cap_rank,
              thumb: coin.item.thumb,
              large: coin.item.large,
              score: coin.item.score,
              price_btc: coin.item.price_btc,
              contractAddresses,
              primaryChain,
              primaryAddress: primaryChain ? contractAddresses[primaryChain] : null
            };
          } else if (detailResponse.status === 429) {
            if (attempt < retries) {
              const delay = 2000 * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s
              console.log(`⏳ Trending rate limited, retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          } else {
            console.log(`❌ HTTP ${detailResponse.status} fetching trending ${coin.item.id}`);
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log(`Timeout fetching details for ${coin.item.id}, attempt ${attempt + 1}`);
          } else {
            console.error(`Error fetching details for ${coin.item.id}, attempt ${attempt + 1}:`, error);
          }
          
          if (attempt < retries) {
            const delay = 1000 * (attempt + 1); // Linear backoff: 1s, 2s, 3s
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }

      // Return basic info if all attempts fail
      return {
        id: coin.item.id,
        name: coin.item.name,
        symbol: coin.item.symbol,
        market_cap_rank: coin.item.market_cap_rank,
        thumb: coin.item.thumb,
        large: coin.item.large,
        score: coin.item.score,
        price_btc: coin.item.price_btc,
        contractAddresses: {},
        primaryChain: null,
        primaryAddress: null
      };
    };

    // Fetch details with controlled concurrency and better error handling
    const coinsWithDetails = [];
    const batchSize = 2; // Reduced for better reliability
    
    for (let i = 0; i < trendingCoins.length; i += batchSize) {
      const batch = trendingCoins.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((coin: any) => fetchCoinDetails(coin))
      );
      coinsWithDetails.push(...batchResults);
      
      if (i + batchSize < trendingCoins.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      coins: coinsWithDetails,
      total: coinsWithDetails.length
    });

  } catch (error) {
    console.error('Trending coins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending coins' },
      { status: 500 }
    );
  }
}
