import { NextRequest, NextResponse } from 'next/server';
import { multiApiResolver } from '@/utils/multiApiContractResolver';

// Enhanced search result interface
interface EnhancedSearchResult {
  id: string;
  name: string;
  symbol: string;
  rank?: number | null;
  source: string;
  contractAddresses: { [key: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
  logoUrl?: string;
  decimals?: number;
  confidence: number; // 0-100 confidence score
}

/**
 * Dexscreener API - Great for real-time token data
 */
async function searchDexscreener(query: string): Promise<EnhancedSearchResult[]> {
  try {
    console.log(`🔍 Searching Dexscreener for: ${query}`);
    
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NYALTX-Search/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Dexscreener API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results: EnhancedSearchResult[] = [];
    
    if (data.pairs && data.pairs.length > 0) {
      // Group by token symbol to avoid duplicates
      const tokenMap = new Map<string, EnhancedSearchResult>();
      
      data.pairs.slice(0, 20).forEach((pair: any) => {
        const token = pair.baseToken;
        if (token && token.symbol && token.address) {
          const symbolKey = token.symbol.toLowerCase();
          
          // Determine chain from pair info
          let chainName = 'ethereum'; // default
          if (pair.chainId === 'bsc') chainName = 'binance';
          else if (pair.chainId === 'polygon') chainName = 'polygon';
          else if (pair.chainId === 'arbitrum') chainName = 'arbitrum';
          else if (pair.chainId === 'optimism') chainName = 'optimism';
          else if (pair.chainId === 'base') chainName = 'base';
          else if (pair.chainId === 'avalanche') chainName = 'avalanche';
          else if (pair.chainId === 'fantom') chainName = 'fantom';
          
          // Calculate confidence based on liquidity and volume
          let confidence = 50; // base confidence
          if (pair.liquidity?.usd > 100000) confidence += 20;
          if (pair.volume?.h24 > 50000) confidence += 15;
          if (pair.txns?.h24?.buys > 100) confidence += 10;
          if (token.symbol.toLowerCase() === query.toLowerCase()) confidence += 20;
          
          const existing = tokenMap.get(symbolKey);
          if (existing) {
            // Add contract address for this chain
            existing.contractAddresses[chainName] = token.address;
            existing.confidence = Math.max(existing.confidence, confidence);
            
            // Update primary chain if this one has higher priority
            const chainPriority = ['ethereum', 'binance', 'polygon', 'arbitrum', 'optimism', 'base'];
            if (!existing.primaryChain || 
                chainPriority.indexOf(chainName) < chainPriority.indexOf(existing.primaryChain)) {
              existing.primaryChain = chainName;
              existing.primaryAddress = token.address;
            }
          } else {
            tokenMap.set(symbolKey, {
              id: `dexscreener-${token.symbol.toLowerCase()}`,
              name: token.name || token.symbol,
              symbol: token.symbol,
              source: 'dexscreener',
              contractAddresses: { [chainName]: token.address },
              primaryChain: chainName,
              primaryAddress: token.address,
              confidence,
              rank: null
            });
          }
        }
      });
      
      results.push(...Array.from(tokenMap.values()));
    }
    
    console.log(`✅ Dexscreener found ${results.length} unique tokens`);
    return results;
  } catch (error) {
    console.log('❌ Dexscreener search failed:', error);
    return [];
  }
}

/**
 * CoinPaprika API - Alternative to CoinGecko with good reliability
 */
async function searchCoinPaprika(query: string): Promise<EnhancedSearchResult[]> {
  try {
    console.log(`🪙 Searching CoinPaprika for: ${query}`);
    
    const response = await fetch(`https://api.coinpaprika.com/v1/search/?q=${encodeURIComponent(query)}&c=currencies&limit=10`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NYALTX-Search/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`CoinPaprika API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results: EnhancedSearchResult[] = [];
    
    if (data.currencies && data.currencies.length > 0) {
      for (const coin of data.currencies.slice(0, 8)) {
        try {
          // Get detailed info for contract addresses
          const detailResponse = await fetch(`https://api.coinpaprika.com/v1/coins/${coin.id}`, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'NYALTX-Search/1.0'
            }
          });
          
          if (detailResponse.ok) {
            const detail = await detailResponse.json();
            
            // Calculate confidence
            let confidence = 60; // base confidence for CoinPaprika
            if (coin.rank && coin.rank <= 100) confidence += 25;
            else if (coin.rank && coin.rank <= 500) confidence += 15;
            if (coin.symbol.toLowerCase() === query.toLowerCase()) confidence += 20;
            
            const contractAddresses: { [key: string]: string } = {};
            
            // Extract contract addresses from platforms
            if (detail.contracts && detail.contracts.length > 0) {
              detail.contracts.forEach((contract: any) => {
                let chainName = 'ethereum'; // default
                if (contract.platform === 'binance-smart-chain') chainName = 'binance';
                else if (contract.platform === 'polygon-pos') chainName = 'polygon';
                else if (contract.platform === 'arbitrum-one') chainName = 'arbitrum';
                else if (contract.platform === 'optimistic-ethereum') chainName = 'optimism';
                else if (contract.platform === 'base') chainName = 'base';
                
                if (contract.contract_address && contract.contract_address !== '0x0000000000000000000000000000000000000000') {
                  contractAddresses[chainName] = contract.contract_address;
                }
              });
            }
            
            // Determine primary chain
            const chainPriority = ['ethereum', 'binance', 'polygon', 'arbitrum', 'optimism', 'base'];
            const primaryChain = chainPriority.find(chain => contractAddresses[chain]) || 
                              Object.keys(contractAddresses)[0] || null;
            
            results.push({
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol,
              rank: coin.rank,
              source: 'coinpaprika',
              contractAddresses,
              primaryChain,
              primaryAddress: primaryChain ? contractAddresses[primaryChain] : null,
              confidence
            });
          }
        } catch (detailError) {
          console.log(`❌ CoinPaprika detail fetch failed for ${coin.symbol}:`, detailError);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ CoinPaprika found ${results.length} tokens with details`);
    return results;
  } catch (error) {
    console.log('❌ CoinPaprika search failed:', error);
    return [];
  }
}

/**
 * Fallback CoinGecko search (improved version)
 */
async function searchCoinGeckoFallback(query: string): Promise<EnhancedSearchResult[]> {
  try {
    console.log(`🦎 CoinGecko fallback search for: ${query}`);
    
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NYALTX-Search/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results: EnhancedSearchResult[] = [];
    
    if (data.coins && data.coins.length > 0) {
      // Process only top 5 coins to avoid rate limits
      for (const coin of data.coins.slice(0, 5)) {
        let confidence = 40; // lower confidence for CoinGecko due to reliability issues
        if (coin.market_cap_rank && coin.market_cap_rank <= 100) confidence += 20;
        if (coin.symbol.toLowerCase() === query.toLowerCase()) confidence += 15;
        
        results.push({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          rank: coin.market_cap_rank,
          source: 'coingecko',
          contractAddresses: {}, // Will be empty for fallback
          primaryChain: null,
          primaryAddress: null,
          confidence
        });
      }
    }
    
    console.log(`✅ CoinGecko fallback found ${results.length} basic results`);
    return results;
  } catch (error) {
    console.log('❌ CoinGecko fallback failed:', error);
    return [];
  }
}

/**
 * Multi-source search endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }
    
    console.log(`🚀 Multi-source search for: "${query}"`);
    
    const allResults: EnhancedSearchResult[] = [];
    const seenSymbols = new Set<string>();
    
    // Search multiple sources in parallel for speed
    const searchPromises = [
      searchDexscreener(query),
      searchCoinPaprika(query),
      // Add 1inch search from our multi-API resolver
      multiApiResolver.searchTokens(query).then(tokens => 
        tokens.map(token => ({
          id: `multiapi-${token.symbol.toLowerCase()}`,
          name: token.name,
          symbol: token.symbol,
          source: token.source,
          contractAddresses: token.contractAddresses,
          primaryChain: token.primaryChain,
          primaryAddress: token.primaryAddress,
          logoUrl: token.logoUrl,
          decimals: token.decimals,
          confidence: 70, // Good confidence for multi-API results
          rank: null
        }))
      )
    ];
    
    // Execute searches in parallel
    const searchResults = await Promise.allSettled(searchPromises);
    
    // Merge results from all sources
    searchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        const sourceName = ['dexscreener', 'coinpaprika', 'multiapi'][index];
        console.log(`✅ ${sourceName} contributed ${result.value.length} results`);
        
        result.value.forEach((token: EnhancedSearchResult) => {
          const symbolKey = token.symbol.toLowerCase();
          
          if (!seenSymbols.has(symbolKey)) {
            seenSymbols.add(symbolKey);
            allResults.push(token);
          } else {
            // Merge with existing token
            const existing = allResults.find(t => t.symbol.toLowerCase() === symbolKey);
            if (existing) {
              // Merge contract addresses
              Object.assign(existing.contractAddresses, token.contractAddresses);
              
              // Use higher confidence source for primary data
              if (token.confidence > existing.confidence) {
                existing.primaryChain = token.primaryChain || existing.primaryChain;
                existing.primaryAddress = token.primaryAddress || existing.primaryAddress;
                existing.confidence = token.confidence;
                existing.source = token.source;
              }
              
              // Keep logo if available
              if (token.logoUrl && !existing.logoUrl) {
                existing.logoUrl = token.logoUrl;
              }
            }
          }
        });
      }
    });
    
    // If no results from primary sources, try CoinGecko as fallback
    if (allResults.length === 0) {
      console.log('⚠️ No results from primary sources, trying CoinGecko fallback...');
      const fallbackResults = await searchCoinGeckoFallback(query);
      allResults.push(...fallbackResults);
    }
    
    // Sort by confidence and relevance
    const sortedResults = allResults.sort((a, b) => {
      // Exact symbol match gets highest priority
      const aExact = a.symbol.toLowerCase() === query.toLowerCase() ? 1 : 0;
      const bExact = b.symbol.toLowerCase() === query.toLowerCase() ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      
      // Then by confidence
      if (a.confidence !== b.confidence) return b.confidence - a.confidence;
      
      // Then by rank (lower is better)
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.rank) return -1;
      if (b.rank) return 1;
      
      // Finally by number of contract addresses
      const aChains = Object.keys(a.contractAddresses).length;
      const bChains = Object.keys(b.contractAddresses).length;
      return bChains - aChains;
    });
    
    // Limit to top 10 results
    const finalResults = sortedResults.slice(0, 10);
    
    console.log(`📊 Final results: ${finalResults.length} tokens from ${new Set(finalResults.map(r => r.source)).size} sources`);
    
    // Log success rate for monitoring
    const tokensWithAddresses = finalResults.filter(token => 
      token.contractAddresses && Object.keys(token.contractAddresses).length > 0
    );
    console.log(`📈 Contract address success rate: ${tokensWithAddresses.length}/${finalResults.length} (${Math.round(tokensWithAddresses.length/finalResults.length*100)}%)`);
    
    return NextResponse.json({
      coins: finalResults,
      sources: Array.from(new Set(finalResults.map(r => r.source))),
      total: finalResults.length,
      success_rate: tokensWithAddresses.length / finalResults.length
    });
    
  } catch (error) {
    console.error('❌ Multi-source search error:', error);
    return NextResponse.json(
      { error: 'Failed to search cryptocurrencies' },
      { status: 500 }
    );
  }
}
