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

    // Simple CoinGecko search with basic retry
    const searchCoinGecko = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
          {
            headers: { 
              'Accept': 'application/json',
              'User-Agent': 'NYALTX-Search/1.0'
            },
            next: { revalidate: 300 }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('CoinGecko search results:', data.coins?.length || 0, 'coins found');
          return data.coins || [];
        } else {
          console.error('CoinGecko API error:', response.status, response.statusText);
          return [];
        }
      } catch (error) {
        console.error('CoinGecko search error:', error);
        return [];
      }
    };

    const coins = await searchCoinGecko();
    
    if (!coins || coins.length === 0) {
      return NextResponse.json({
        coins: [],
        sources: ['coingecko'],
        total: 0
      });
    }

    // Process top coins with basic info first, then enhance with contract addresses
    const topCoins = coins.slice(0, 10);
    
    // Add basic coin info first
    topCoins.forEach((coin: any) => {
      results.push({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        rank: coin.market_cap_rank || null,
        source: 'coingecko',
        contractAddresses: {},
        primaryChain: null,
        primaryAddress: null
      });
    });

    // Try to enhance top 3 results with contract addresses (optional)
    try {
      const topResults = results.slice(0, 3);
      
      for (const coin of topResults) {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
            {
              headers: { 
                'Accept': 'application/json',
                'User-Agent': 'NYALTX-Search/1.0'
              },
              next: { revalidate: 3600 }
            }
          );
          
          if (response.ok) {
            const detailData = await response.json();
            
            if (detailData?.platforms) {
              const contractAddresses: { [key: string]: string } = {};
              const platformMapping: { [key: string]: string } = {
                'ethereum': 'ethereum',
                'binance-smart-chain': 'binance',
                'polygon-pos': 'polygon',
                'arbitrum-one': 'arbitrum',
                'optimistic-ethereum': 'optimism',
                'base': 'base'
              };

              Object.entries(detailData.platforms).forEach(([platform, address]) => {
                const chainName = platformMapping[platform];
                if (chainName && address && address !== '' && address !== '0x0000000000000000000000000000000000000000') {
                  contractAddresses[chainName] = address as string;
                }
              });

              const primaryChain = contractAddresses.ethereum ? 'ethereum' :
                                 contractAddresses.binance ? 'binance' :
                                 Object.keys(contractAddresses)[0] || null;

              coin.contractAddresses = contractAddresses;
              coin.primaryChain = primaryChain;
              coin.primaryAddress = primaryChain ? contractAddresses[primaryChain] : null;
            }
          }
        } catch (error) {
          // Ignore contract fetch errors - basic search still works
          console.log(`Could not fetch contract for ${coin.symbol}`);
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      // Contract enhancement failed, but basic search still works
      console.log('Contract enhancement failed, returning basic results');
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
