import { NextRequest, NextResponse } from 'next/server';

interface MarketMover {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  image: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'gainers'; // gainers, losers, or volume
    const limit = parseInt(searchParams.get('limit') || '10');

    // Determine sorting parameter based on type
    let orderParam = 'market_cap_desc';
    if (type === 'gainers') {
      orderParam = 'price_change_percentage_24h_desc';
    } else if (type === 'losers') {
      orderParam = 'price_change_percentage_24h_asc';
    } else if (type === 'volume') {
      orderParam = 'volume_desc';
    }

    // Fetch market data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=${orderParam}&per_page=${Math.min(limit * 2, 50)}&page=1&sparkline=false&price_change_percentage=24h`,
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

    const marketData = await response.json();
    
    // Filter and limit results based on type
    let filteredCoins = marketData;
    if (type === 'gainers') {
      filteredCoins = marketData.filter((coin: any) => coin.price_change_percentage_24h > 0);
    } else if (type === 'losers') {
      filteredCoins = marketData.filter((coin: any) => coin.price_change_percentage_24h < 0);
    }
    
    const topCoins = filteredCoins.slice(0, Math.min(limit, 8)); // Limit to 8 for better performance

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
              price_change_percentage_24h: coin.price_change_percentage_24h,
              image: coin.image,
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
        price_change_percentage_24h: coin.price_change_percentage_24h,
        image: coin.image,
        contractAddresses: {},
        primaryChain: null,
        primaryAddress: null
      };
    };

    // Fetch details with controlled concurrency
    const coinsWithDetails = [];
    const batchSize = 3;
    
    for (let i = 0; i < topCoins.length; i += batchSize) {
      const batch = topCoins.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((coin: any) => fetchCoinDetails(coin))
      );
      coinsWithDetails.push(...batchResults);
      
      if (i + batchSize < topCoins.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      coins: coinsWithDetails,
      type,
      total: coinsWithDetails.length
    });

  } catch (error) {
    console.error('Market movers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market movers' },
      { status: 500 }
    );
  }
}
