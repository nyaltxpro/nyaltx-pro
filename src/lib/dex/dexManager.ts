/**
 * DEX Manager - Manages all DEX integrations with dynamic imports
 */
import {
  DexInterface,
  QuoteParams,
  SwapParams,
  PriceQuote,
  DEX_PROTOCOL,
  CHAIN_IDS,
} from './types';

// Dynamic import functions for DEX implementations
const loadUniswapV2 = async () => {
  const { UniswapV2 } = await import('./uniswapV2');
  return UniswapV2;
};

const loadUniswapV3 = async () => {
  const { UniswapV3 } = await import('./uniswapV3');
  return UniswapV3;
};

const loadPancakeSwap = async () => {
  const { PancakeSwap } = await import('./pancakeswap');
  return PancakeSwap;
};

const loadSushiSwap = async () => {
  const { SushiSwap } = await import('./sushiswap');
  return SushiSwap;
};

const loadRaydium = async () => {
  const { Raydium } = await import('./raydium');
  return Raydium;
};

export class DexManager {
  private dexes: Map<DEX_PROTOCOL, DexInterface>;
  private dexConstructors: Map<DEX_PROTOCOL, () => Promise<any>>;

  constructor() {
    this.dexes = new Map();
    this.dexConstructors = new Map();
    this.initializeDexConstructors();
  }

  private initializeDexConstructors(): void {
    this.dexConstructors.set(DEX_PROTOCOL.UNISWAP_V2, loadUniswapV2);
    this.dexConstructors.set(DEX_PROTOCOL.UNISWAP_V3, loadUniswapV3);
    this.dexConstructors.set(DEX_PROTOCOL.PANCAKESWAP, loadPancakeSwap);
    this.dexConstructors.set(DEX_PROTOCOL.SUSHISWAP, loadSushiSwap);
    this.dexConstructors.set(DEX_PROTOCOL.RAYDIUM, loadRaydium);
  }

  private async getDexInstance(protocol: DEX_PROTOCOL): Promise<DexInterface | undefined> {
    // Check if already loaded
    if (this.dexes.has(protocol)) {
      return this.dexes.get(protocol);
    }

    // Load dynamically if available
    const constructor = this.dexConstructors.get(protocol);
    if (constructor) {
      try {
        const DexClass = await constructor();
        const instance = new DexClass();
        this.dexes.set(protocol, instance);
        return instance;
      } catch (error) {
        console.error(`Failed to load DEX ${protocol}:`, error);
        return undefined;
      }
    }

    return undefined;
  }

  public getDexList(): DexInterface[] {
    return Array.from(this.dexes.values());
  }

  public async getDex(protocol: DEX_PROTOCOL): Promise<DexInterface | undefined> {
    return this.getDexInstance(protocol);
  }

  public async getBestQuote(params: QuoteParams): Promise<PriceQuote | null> {
    const { chainId } = params;

    // Get all available DEX protocols and check which ones support the chain
    const availableProtocols: DEX_PROTOCOL[] = [];
    for (const protocol of this.dexConstructors.keys()) {
      const dex = await this.getDexInstance(protocol);
      if (dex?.isChainSupported(chainId)) {
        availableProtocols.push(protocol);
      }
    }

    if (availableProtocols.length === 0) {
      return null;
    }

    try {
      const quotes = await Promise.all(
        availableProtocols.map(async (protocol) => {
          try {
            const dex = await this.getDexInstance(protocol);
            if (dex) {
              return await dex.getQuote(params);
            }
          } catch (error) {
            console.error(`Error getting quote from ${protocol}:`, error);
          }
          return null;
        })
      );

      // Find the quote with the best output amount
      return quotes
        .filter(quote => quote !== null)
        .reduce(
          (best, current) => {
            if (!best || parseFloat(current!.outputAmount) > parseFloat(best.outputAmount)) {
              return current!;
            }
            return best;
          },
          null as PriceQuote | null
        );
    } catch (error) {
      console.error('Error getting best quote:', error);
      return null;
    }
  }

  public async getAllQuotes(params: QuoteParams): Promise<PriceQuote[]> {
    const { chainId } = params;

    // Get all available DEX protocols for this chain
    const availableProtocols = Array.from(this.dexConstructors.keys());

    try {
      const quotes = await Promise.all(
        availableProtocols.map(async (protocol) => {
          try {
            const dex = await this.getDexInstance(protocol);
            if (dex && dex.isChainSupported(chainId)) {
              return await dex.getQuote(params);
            }
          } catch (error) {
            console.error(`Error getting quote from ${protocol}:`, error);
          }
          return null;
        })
      );

      return quotes.filter(quote => quote !== null) as PriceQuote[];
    } catch (error) {
      console.error('Error getting all quotes:', error);
      return [];
    }
  }

  public async executeSwap(protocol: DEX_PROTOCOL, params: SwapParams): Promise<string | null> {
    const dex = await this.getDexInstance(protocol);

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
