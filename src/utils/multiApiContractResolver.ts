/**
 * Multi-API Contract Address Resolver
 * Uses multiple APIs as fallbacks for reliable contract address retrieval
 * APIs: DeFiLlama, Moralis, 1inch, CoinGecko (as last resort)
 */

export interface TokenInfo {
  symbol: string;
  name: string;
  contractAddresses: { [chain: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
  decimals?: number;
  logoUrl?: string;
  source: string;
}

export interface SearchResult {
  tokens: TokenInfo[];
  source: string;
  success: boolean;
}

// Chain mappings for different APIs
const CHAIN_MAPPINGS = {
  // DeFiLlama chain names
  defillama: {
    'ethereum': 'ethereum',
    'bsc': 'binance',
    'polygon': 'polygon',
    'arbitrum': 'arbitrum',
    'optimism': 'optimism',
    'base': 'base',
    'avalanche': 'avalanche',
    'fantom': 'fantom'
  },
  // Moralis chain names
  moralis: {
    'eth': 'ethereum',
    'bsc': 'binance',
    'polygon': 'polygon',
    'arbitrum': 'arbitrum',
    'optimism': 'optimism',
    'base': 'base',
    'avalanche': 'avalanche',
    'fantom': 'fantom'
  },
  // 1inch chain IDs
  oneinch: {
    '1': 'ethereum',
    '56': 'binance',
    '137': 'polygon',
    '42161': 'arbitrum',
    '10': 'optimism',
    '8453': 'base',
    '43114': 'avalanche',
    '250': 'fantom'
  } as { [key: string]: string }
};

const CHAIN_PRIORITY = ['ethereum', 'binance', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche', 'fantom'];

/**
 * DeFiLlama API - Very reliable for contract addresses
 */
class DeFiLlamaAPI {
  private baseUrl = 'https://api.llama.fi';
  
  async searchTokens(query: string): Promise<SearchResult> {
    try {
      console.log(`🦙 Searching DeFiLlama for: ${query}`);
      
      // DeFiLlama coins endpoint
      const response = await fetch(`${this.baseUrl}/coins/ethereum:0x0000000000000000000000000000000000000000`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`DeFiLlama API error: ${response.status}`);
      }
      
      // For now, let's use their protocols endpoint to find tokens
      const protocolsResponse = await fetch(`${this.baseUrl}/protocols`);
      if (protocolsResponse.ok) {
        const protocols = await protocolsResponse.json();
        const matchingProtocols = protocols.filter((p: any) => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.symbol?.toLowerCase() === query.toLowerCase()
        ).slice(0, 5);
        
        const tokens: TokenInfo[] = matchingProtocols.map((protocol: any) => ({
          symbol: protocol.symbol || protocol.name.toUpperCase(),
          name: protocol.name,
          contractAddresses: {}, // Will be populated by other APIs
          primaryChain: null,
          primaryAddress: null,
          logoUrl: protocol.logo,
          source: 'defillama'
        }));
        
        return { tokens, source: 'defillama', success: true };
      }
      
      return { tokens: [], source: 'defillama', success: false };
    } catch (error) {
      console.log('❌ DeFiLlama search failed:', error);
      return { tokens: [], source: 'defillama', success: false };
    }
  }
  
  async getTokenInfo(symbol: string): Promise<TokenInfo | null> {
    try {
      // DeFiLlama doesn't have a direct symbol search, but we can try their coins endpoint
      const response = await fetch(`${this.baseUrl}/coins/current`);
      if (response.ok) {
        const data = await response.json();
        // This would need to be implemented based on their actual API structure
        return null;
      }
      return null;
    } catch (error) {
      console.log('❌ DeFiLlama token info failed:', error);
      return null;
    }
  }
}

/**
 * 1inch API - Excellent for contract addresses across multiple chains
 */
class OneInchAPI {
  private baseUrl = 'https://api.1inch.dev/token/v1.2';
  
  async searchTokens(query: string): Promise<SearchResult> {
    try {
      console.log(`🔄 Searching 1inch for: ${query}`);
      
      const tokens: TokenInfo[] = [];
      
      // Search across major chains
      const chains = ['1', '56', '137', '42161', '10', '8453'];
      
      for (const chainId of chains) {
        try {
          const response = await fetch(`${this.baseUrl}/${chainId}/search?query=${encodeURIComponent(query)}`, {
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const chainName = CHAIN_MAPPINGS.oneinch[chainId];
              
              data.slice(0, 3).forEach((token: { symbol: string; name: string; address: string; decimals: number; logoURI?: string }) => {
                const existingToken = tokens.find(t => t.symbol.toLowerCase() === token.symbol.toLowerCase());
                
                if (existingToken) {
                  // Add to existing token's contract addresses
                  existingToken.contractAddresses[chainName] = token.address;
                  if (!existingToken.primaryChain && CHAIN_PRIORITY.includes(chainName)) {
                    existingToken.primaryChain = chainName;
                    existingToken.primaryAddress = token.address;
                  }
                } else {
                  // Create new token
                  tokens.push({
                    symbol: token.symbol,
                    name: token.name,
                    contractAddresses: { [chainName]: token.address },
                    primaryChain: chainName,
                    primaryAddress: token.address,
                    decimals: token.decimals,
                    logoUrl: token.logoURI,
                    source: '1inch'
                  });
                }
              });
            }
          }
        } catch (chainError) {
          console.log(`❌ 1inch chain ${chainId} failed:`, chainError);
        }
        
        // Small delay between chain requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return { tokens, source: '1inch', success: tokens.length > 0 };
    } catch (error) {
      console.log('❌ 1inch search failed:', error);
      return { tokens: [], source: '1inch', success: false };
    }
  }
}

/**
 * Moralis API - Good for contract addresses and metadata
 */
class MoralisAPI {
  private baseUrl = 'https://deep-index.moralis.io/api/v2.2';
  
  async searchTokens(query: string): Promise<SearchResult> {
    try {
      console.log(`🔮 Searching Moralis for: ${query}`);
      
      // Note: Moralis requires API key for most endpoints
      // For now, we'll implement a basic structure
      
      return { tokens: [], source: 'moralis', success: false };
    } catch (error) {
      console.log('❌ Moralis search failed:', error);
      return { tokens: [], source: 'moralis', success: false };
    }
  }
}

/**
 * CoinMarketCap API - Alternative to CoinGecko
 */
class CoinMarketCapAPI {
  private baseUrl = 'https://pro-api.coinmarketcap.com/v1';
  
  async searchTokens(query: string): Promise<SearchResult> {
    try {
      console.log(`💰 Searching CoinMarketCap for: ${query}`);
      
      // Note: CoinMarketCap requires API key
      // For demo purposes, we'll return empty
      
      return { tokens: [], source: 'coinmarketcap', success: false };
    } catch (error) {
      console.log('❌ CoinMarketCap search failed:', error);
      return { tokens: [], source: 'coinmarketcap', success: false };
    }
  }
}

/**
 * Multi-API Contract Resolver
 * Tries multiple APIs in order of reliability
 */
export class MultiApiContractResolver {
  private apis: Array<{ name: string; api: any }>;
  
  constructor() {
    this.apis = [
      { name: '1inch', api: new OneInchAPI() },
      { name: 'defillama', api: new DeFiLlamaAPI() },
      { name: 'moralis', api: new MoralisAPI() },
      { name: 'coinmarketcap', api: new CoinMarketCapAPI() }
    ];
  }
  
  /**
   * Search for tokens across multiple APIs
   */
  async searchTokens(query: string): Promise<TokenInfo[]> {
    console.log(`🔍 Multi-API search for: ${query}`);
    
    const allTokens: TokenInfo[] = [];
    const seenSymbols = new Set<string>();
    
    // Try each API in order
    for (const { name, api } of this.apis) {
      try {
        const result = await api.searchTokens(query);
        
        if (result.success && result.tokens.length > 0) {
          console.log(`✅ ${name} found ${result.tokens.length} tokens`);
          
          // Merge results, avoiding duplicates
          result.tokens.forEach((token: TokenInfo) => {
            const symbolKey = token.symbol.toLowerCase();
            if (!seenSymbols.has(symbolKey)) {
              seenSymbols.add(symbolKey);
              allTokens.push(token);
            } else {
              // Merge contract addresses if token already exists
              const existingToken = allTokens.find(t => t.symbol.toLowerCase() === symbolKey);
              if (existingToken) {
                Object.assign(existingToken.contractAddresses, token.contractAddresses);
                
                // Update primary chain if current token has better chain
                if (token.primaryChain && (!existingToken.primaryChain || 
                    CHAIN_PRIORITY.indexOf(token.primaryChain) < CHAIN_PRIORITY.indexOf(existingToken.primaryChain))) {
                  existingToken.primaryChain = token.primaryChain;
                  existingToken.primaryAddress = token.primaryAddress;
                }
              }
            }
          });
          
          // If we have good results from a reliable API, we can break early
          if (name === '1inch' && allTokens.length >= 3) {
            break;
          }
        }
      } catch (error) {
        console.log(`❌ ${name} API failed:`, error);
      }
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Sort by relevance and chain priority
    return this.sortTokensByRelevance(allTokens, query);
  }
  
  /**
   * Get contract addresses for a specific token
   */
  async getContractAddresses(symbol: string): Promise<TokenInfo | null> {
    const results = await this.searchTokens(symbol);
    
    // Return exact symbol match if found
    const exactMatch = results.find(token => 
      token.symbol.toLowerCase() === symbol.toLowerCase()
    );
    
    return exactMatch || (results.length > 0 ? results[0] : null);
  }
  
  /**
   * Sort tokens by relevance to search query
   */
  private sortTokensByRelevance(tokens: TokenInfo[], query: string): TokenInfo[] {
    return tokens.sort((a: TokenInfo, b: TokenInfo) => {
      const queryLower = query.toLowerCase();
      
      // Exact symbol match gets highest priority
      const aExactSymbol = a.symbol.toLowerCase() === queryLower ? 1 : 0;
      const bExactSymbol = b.symbol.toLowerCase() === queryLower ? 1 : 0;
      if (aExactSymbol !== bExactSymbol) return bExactSymbol - aExactSymbol;
      
      // Symbol starts with query
      const aSymbolStarts = a.symbol.toLowerCase().startsWith(queryLower) ? 1 : 0;
      const bSymbolStarts = b.symbol.toLowerCase().startsWith(queryLower) ? 1 : 0;
      if (aSymbolStarts !== bSymbolStarts) return bSymbolStarts - aSymbolStarts;
      
      // Name contains query
      const aNameContains = a.name.toLowerCase().includes(queryLower) ? 1 : 0;
      const bNameContains = b.name.toLowerCase().includes(queryLower) ? 1 : 0;
      if (aNameContains !== bNameContains) return bNameContains - aNameContains;
      
      // More contract addresses is better
      const aChainCount = Object.keys(a.contractAddresses).length;
      const bChainCount = Object.keys(b.contractAddresses).length;
      if (aChainCount !== bChainCount) return bChainCount - aChainCount;
      
      // Better primary chain
      if (a.primaryChain && b.primaryChain) {
        const aPriority = CHAIN_PRIORITY.indexOf(a.primaryChain);
        const bPriority = CHAIN_PRIORITY.indexOf(b.primaryChain);
        return aPriority - bPriority;
      }
      
      return 0;
    });
  }
}

// Export singleton instance
export const multiApiResolver = new MultiApiContractResolver();
