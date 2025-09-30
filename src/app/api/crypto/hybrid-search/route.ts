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

    // Enhanced CoinGecko search with retry logic and better error handling
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
                'User-Agent': 'NYALTX-Search/1.0',
                'Cache-Control': 'public, max-age=300' // 5 minute cache
              },
              next: { revalidate: 300 }
            }
          );
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ CoinGecko search results: ${data.coins?.length || 0} coins found for "${query}"`);
            return data.coins || [];
          } else if (response.status === 429) {
            // Rate limited, wait and retry with exponential backoff
            if (attempt < retries) {
              const delay = 1500 * Math.pow(2, attempt); // 1.5s, 3s, 6s
              console.log(`⏳ CoinGecko rate limited, retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          } else {
            console.error(`❌ CoinGecko API error: ${response.status} ${response.statusText}`);
            return [];
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log(`⏱️ CoinGecko search timeout, attempt ${attempt + 1}/${retries + 1}`);
          } else {
            console.error(`❌ CoinGecko search error, attempt ${attempt + 1}/${retries + 1}:`, error.message);
          }
          
          if (attempt < retries) {
            const delay = 750 * (attempt + 1); // 750ms, 1.5s, 2.25s
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            console.log('❌ All CoinGecko search attempts failed');
            return [];
          }
        }
      }
      return [];
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
    const topCoins = coins.slice(0, 8); // Reduced from 10 to 8 for better reliability
    
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

    // Enhanced contract address fetching with retry logic for ALL results
    const fetchCoinDetails = async (coin: SearchResult, retries = 3) => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout
          
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
          
          if (response.ok) {
            const detailData = await response.json();
            
            if (detailData?.platforms) {
              const contractAddresses: { [key: string]: string } = {};
              // Enhanced platform mapping with more chains
              const platformMapping: { [key: string]: string } = {
                'ethereum': 'ethereum',
                'binance-smart-chain': 'binance',
                'polygon-pos': 'polygon',
                'arbitrum-one': 'arbitrum',
                'optimistic-ethereum': 'optimism',
                'base': 'base',
                'fantom': 'fantom',
                'avalanche': 'avalanche',
                'solana': 'solana',
                'xdai': 'gnosis',
                'harmony-shard-0': 'harmony',
                'moonbeam': 'moonbeam',
                'cronos': 'cronos'
              };

              Object.entries(detailData.platforms).forEach(([platform, address]) => {
                const chainName = platformMapping[platform];
                if (chainName && address && address !== '' && address !== '0x0000000000000000000000000000000000000000') {
                  contractAddresses[chainName] = address as string;
                }
              });

              // Smart primary chain selection with priority order
              const chainPriority = ['ethereum', 'binance', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche', 'fantom', 'solana'];
              const primaryChain = chainPriority.find(chain => contractAddresses[chain]) || 
                                 Object.keys(contractAddresses)[0] || null;

              coin.contractAddresses = contractAddresses;
              coin.primaryChain = primaryChain;
              coin.primaryAddress = primaryChain ? contractAddresses[primaryChain] : null;
            }
            return; // Success, exit retry loop
          } else if (response.status === 429) {
            // Rate limited, wait and retry with exponential backoff
            if (attempt < retries) {
              const delay = 2000 * Math.pow(2, attempt); // 2s, 4s, 8s
              console.log(`⏳ Rate limited fetching ${coin.symbol}, retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          } else {
            console.log(`❌ HTTP ${response.status} fetching ${coin.symbol} details`);
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log(`Contract fetch timeout for ${coin.symbol}, attempt ${attempt + 1}`);
          } else {
            console.log(`Contract fetch error for ${coin.symbol}, attempt ${attempt + 1}:`, error.message);
          }
          
          if (attempt < retries) {
            const delay = 1000 * (attempt + 1); // 1s, 2s, 3s
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }
    };

    // Process coins in smaller batches with better error handling
    try {
      const batchSize = 2; // Reduced batch size for better reliability
      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        
        // Process batch with individual error handling
        await Promise.allSettled(batch.map(coin => fetchCoinDetails(coin)));
        
        // Longer delay between batches to respect rate limits
        if (i + batchSize < results.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.log('Contract enhancement failed, returning basic results:', error);
    }

    // Log contract address success rate for monitoring
    const coinsWithAddresses = results.filter(coin => 
      coin.contractAddresses && Object.keys(coin.contractAddresses).length > 0
    );
    console.log(`📊 Contract addresses retrieved for ${coinsWithAddresses.length}/${results.length} coins`);

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
