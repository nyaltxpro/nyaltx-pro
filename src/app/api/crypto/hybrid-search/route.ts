import { NextRequest, NextResponse } from 'next/server';

// Define the structure for search results
interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  rank: number | null;
  price: number;
  change24h: number;
  volume24h?: number;
  source: 'coincap' | 'binance' | 'coingecko';
  contractAddresses: { [key: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
}

// Hybrid API approach: Use multiple free APIs for better reliability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const results: SearchResult[] = [];

    // 1. Try CoinCap API first (higher rate limits)
    try {
      const coinCapResponse = await fetch(
        `https://api.coincap.io/v2/assets?search=${encodeURIComponent(query)}&limit=10`,
        {
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 300 }
        }
      );

      if (coinCapResponse.ok) {
        const coinCapData = await coinCapResponse.json();
        coinCapData.data?.forEach((coin: any) => {
          results.push({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            rank: coin.rank ? parseInt(coin.rank) : null,
            price: coin.priceUsd ? parseFloat(coin.priceUsd) : 0,
            change24h: coin.changePercent24Hr ? parseFloat(coin.changePercent24Hr) : 0,
            source: 'coincap',
            // No contract addresses from CoinCap
            contractAddresses: {},
            primaryChain: null,
            primaryAddress: null
          });
        });
      }
    } catch (error) {
      console.error('CoinCap API error:', error);
    }

    // 2. Try Binance API for additional data
    try {
      const binanceResponse = await fetch(
        'https://api.binance.com/api/v3/ticker/24hr',
        {
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 300 }
        }
      );

      if (binanceResponse.ok) {
        const binanceData = await binanceResponse.json();
        const matchingCoins = binanceData.filter((ticker: any) => 
          ticker.symbol.toLowerCase().includes(query.toLowerCase()) ||
          ticker.symbol.toLowerCase().startsWith(query.toLowerCase())
        ).slice(0, 5);

        matchingCoins.forEach((ticker: any) => {
          // Extract base symbol (remove USDT, BUSD, etc.)
          const baseSymbol = ticker.symbol.replace(/(USDT|BUSD|BTC|ETH|BNB)$/, '');
          
          results.push({
            id: baseSymbol.toLowerCase(),
            name: baseSymbol,
            symbol: baseSymbol,
            rank: null,
            price: ticker.lastPrice ? parseFloat(ticker.lastPrice) : 0,
            change24h: ticker.priceChangePercent ? parseFloat(ticker.priceChangePercent) : 0,
            volume24h: ticker.volume ? parseFloat(ticker.volume) : 0,
            source: 'binance',
            contractAddresses: {},
            primaryChain: null,
            primaryAddress: null
          });
        });
      }
    } catch (error) {
      console.error('Binance API error:', error);
    }

    // 3. Fallback to CoinGecko for contract addresses (limited usage)
    if (results.length > 0) {
      try {
        // Only use CoinGecko for top 3 results to save API calls
        const topResults = results.slice(0, 3);
        
        for (const coin of topResults) {
          try {
            const geckoResponse = await fetch(
              `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(coin.symbol)}`,
              {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 3600 }
              }
            );

            if (geckoResponse.ok) {
              const geckoData = await geckoResponse.json();
              const matchingCoin = geckoData.coins?.find((c: any) => 
                c.symbol.toLowerCase() === coin.symbol.toLowerCase()
              );

              if (matchingCoin) {
                // Get detailed contract address info
                const detailResponse = await fetch(
                  `https://api.coingecko.com/api/v3/coins/${matchingCoin.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
                  {
                    headers: { 'Accept': 'application/json' },
                    next: { revalidate: 3600 }
                  }
                );

                if (detailResponse.ok) {
                  const detailData = await detailResponse.json();
                  
                  if (detailData.platforms) {
                    const contractAddresses: { [key: string]: string } = {};
                    const platformMapping: { [key: string]: string } = {
                      'ethereum': 'ethereum',
                      'binance-smart-chain': 'binance',
                      'polygon-pos': 'polygon',
                      'arbitrum-one': 'arbitrum',
                      'base': 'base'
                    };

                    Object.entries(detailData.platforms).forEach(([platform, address]) => {
                      const chainName = platformMapping[platform];
                      if (chainName && address && address !== '') {
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
              }
            }
          } catch (error) {
            console.error(`Error fetching contract for ${coin.symbol}:`, error);
          }

          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error('CoinGecko fallback error:', error);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = results.filter((coin, index, self) => 
      index === self.findIndex(c => c.symbol.toLowerCase() === coin.symbol.toLowerCase())
    ).sort((a, b) => {
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

    // If no results found, return an informative response
    if (uniqueResults.length === 0) {
      return NextResponse.json({
        coins: [],
        sources: ['coincap', 'binance', 'coingecko'],
        total: 0,
        message: 'No cryptocurrencies found matching your search'
      });
    }

    return NextResponse.json({
      coins: uniqueResults.slice(0, 15),
      sources: ['coincap', 'binance', 'coingecko'],
      total: uniqueResults.length,
      message: `Found ${uniqueResults.length} cryptocurrencies`
    });

  } catch (error) {
    console.error('Hybrid search error:', error);
    return NextResponse.json(
      { error: 'Failed to search cryptocurrencies' },
      { status: 500 }
    );
  }
}
