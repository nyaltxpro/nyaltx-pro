/**
 * DEX Manager - Manages all DEX integrations
 */
import { DexInterface, QuoteParams, SwapParams, PriceQuote, DEX_PROTOCOL, CHAIN_IDS } from './types';
import { UniswapV2 } from './uniswapV2';
import { UniswapV3 } from './uniswapV3';
import { PancakeSwap } from './pancakeswap';
import { SushiSwap } from './sushiswap';
import { Raydium } from './raydium';

export class DexManager {
  private dexes: Map<DEX_PROTOCOL, DexInterface>;
  
  constructor() {
    this.dexes = new Map();
    this.initializeDexes();
  }
  
  private initializeDexes(): void {
    this.dexes.set(DEX_PROTOCOL.UNISWAP_V2, new UniswapV2());
    this.dexes.set(DEX_PROTOCOL.UNISWAP_V3, new UniswapV3());
    this.dexes.set(DEX_PROTOCOL.PANCAKESWAP, new PancakeSwap());
    this.dexes.set(DEX_PROTOCOL.SUSHISWAP, new SushiSwap());
    this.dexes.set(DEX_PROTOCOL.RAYDIUM, new Raydium());
  }
  
  public getDexList(): DexInterface[] {
    return Array.from(this.dexes.values());
  }
  
  public getDex(protocol: DEX_PROTOCOL): DexInterface | undefined {
    return this.dexes.get(protocol);
  }
  
  public async getBestQuote(params: QuoteParams): Promise<PriceQuote | null> {
    const { chainId } = params;
    const compatibleDexes = this.getDexList().filter(dex => dex.isChainSupported(chainId));
    
    if (compatibleDexes.length === 0) {
      return null;
    }
    
    try {
      const quotes = await Promise.all(
        compatibleDexes.map(dex => dex.getQuote(params))
      );
      
      // Find the quote with the best output amount
      return quotes.reduce((best, current) => {
        if (!best || parseFloat(current.outputAmount) > parseFloat(best.outputAmount)) {
          return current;
        }
        return best;
      }, null as PriceQuote | null);
    } catch (error) {
      console.error('Error getting best quote:', error);
      return null;
    }
  }
  
  public async getAllQuotes(params: QuoteParams): Promise<PriceQuote[]> {
    const { chainId } = params;
    const compatibleDexes = this.getDexList().filter(dex => dex.isChainSupported(chainId));
    
    try {
      const quotes = await Promise.all(
        compatibleDexes.map(async dex => {
          try {
            return await dex.getQuote(params);
          } catch (error) {
            console.error(`Error getting quote from ${dex.config.name}:`, error);
            return null;
          }
        })
      );
      
      return quotes.filter(quote => quote !== null) as PriceQuote[];
    } catch (error) {
      console.error('Error getting all quotes:', error);
      return [];
    }
  }
  
  public async executeSwap(protocol: DEX_PROTOCOL, params: SwapParams): Promise<string | null> {
    const dex = this.getDex(protocol);
    
    if (!dex) {
      console.error(`DEX protocol ${protocol} not found`);
      return null;
    }
    
    if (!dex.isChainSupported(params.chainId)) {
      console.error(`Chain ID ${params.chainId} not supported by ${protocol}`);
      return null;
    }
    
    try {
      return await dex.executeSwap(params);
    } catch (error) {
      console.error(`Error executing swap on ${protocol}:`, error);
      return null;
    }
  }
}

// Export a singleton instance
export const dexManager = new DexManager();
