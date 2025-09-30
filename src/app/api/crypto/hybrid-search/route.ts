import { NextRequest, NextResponse } from 'next/server';

// Define the structure for search results
interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  rank: number | null;
  price?: number;
  change24h?: number;
  source: 'coingecko';
  contractAddresses: { [key: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
}

// Optimized CoinGecko search with retry logic and contract addresses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const results: SearchResult[] = [];

    // CoinGecko search with retry logic
    const searchCoinGecko = async (retries = 2) => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(
            `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
            {
              signal: controller.signal,
              headers: { 
                'Accept': 'application/json',
                'User-Agent': 'NYALTX-Search/1.0'
              },
              next: { revalidate: 300 }
            }
          );
          
          clearTimeout(timeoutId);
          
          if (response.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          
          if (response.ok) {
            const data = await response.json();
            return data.coins || [];
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log(`CoinGecko search timeout, attempt ${attempt + 1}`);
          } else {
            console.error(`CoinGecko search error, attempt ${attempt + 1}:`, error);
          }
          
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
            continue;
          }
        }
      }
      return [];
    };

    const coins = await searchCoinGecko();
    
    // Process coins in batches to avoid overwhelming the API
    const batchSize = 3;
    const topCoins = coins.slice(0, 8); // Limit to top 8 for better reliability
    
    for (let i = 0; i < topCoins.length; i += batchSize) {
      const batch = topCoins.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (coin: any) => {
        const fetchCoinDetails = async (retries = 2) => {
          for (let attempt = 0; attempt <= retries; attempt++) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              
              const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
                {
                  signal: controller.signal,
                  headers: { 
                    'Accept': 'application/json',
                    'User-Agent': 'NYALTX-Search/1.0'
                  },
                  next: { revalidate: 3600 }
                }
              );
              
              clearTimeout(timeoutId);
              
              if (response.status === 429) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
              }
              
              if (response.ok) {
                return await response.json();
              }
            } catch (error: any) {
              if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
                continue;
              }
            }
          }
          return null;
        };

        const detailData = await fetchCoinDetails();
        
        // Build contract addresses
        const contractAddresses: { [key: string]: string } = {};
        const platformMapping: { [key: string]: string } = {
          'ethereum': 'ethereum',
          'binance-smart-chain': 'binance',
          'polygon-pos': 'polygon',
          'arbitrum-one': 'arbitrum',
          'optimistic-ethereum': 'optimism',
          'base': 'base',
          'fantom': 'fantom',
          'solana': 'solana'
        };

        if (detailData?.platforms) {
          Object.entries(detailData.platforms).forEach(([platform, address]) => {
            const chainName = platformMapping[platform];
            if (chainName && address && address !== '' && address !== '0x0000000000000000000000000000000000000000') {
              contractAddresses[chainName] = address as string;
            }
          });
        }

        // Determine primary chain (prioritize Ethereum)
        const primaryChain = contractAddresses.ethereum ? 'ethereum' :
                           contractAddresses.binance ? 'binance' :
                           contractAddresses.polygon ? 'polygon' :
                           Object.keys(contractAddresses)[0] || null;

        results.push({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          rank: coin.market_cap_rank || null,
          source: 'coingecko',
          contractAddresses,
          primaryChain,
          primaryAddress: primaryChain ? contractAddresses[primaryChain] : null
        });
      }));
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < topCoins.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Sort by relevance
    const sortedResults = results.sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.symbol.toLowerCase() === query.toLowerCase() ? 1 : 0;
      const bExact = b.symbol.toLowerCase() === query.toLowerCase() ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      
      // Then by rank (lower is better)
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.rank) return -1;
      if (b.rank) return 1;
      
      return 0;
    });

    return NextResponse.json({
      coins: sortedResults,
      sources: ['coingecko'],
      total: sortedResults.length
    });

  } catch (error) {
    console.error('CoinGecko search error:', error);
    return NextResponse.json(
      { error: 'Failed to search cryptocurrencies' },
      { status: 500 }
    );
  }
}
