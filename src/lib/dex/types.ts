/**
 * Common types for DEX integrations
 */

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

export interface SwapRoute {
  protocol: string;
  routerAddress: string;
  path: Token[];
  amountIn: string;
  amountOut: string;
  priceImpact: string;
  fee: string;
}

export interface PriceQuote {
  protocol: string;
  inputAmount: string;
  outputAmount: string;
  executionPrice: string;
  priceImpact: string;
  fee: string;
  route: SwapRoute;
}

export interface DexConfig {
  id: string;
  name: string;
  logoURI: string;
  supportedChains: number[];
  routerAddress?: Record<number, string>;
  factoryAddress?: Record<number, string>;
  version?: string;
}

export interface DexInterface {
  config: DexConfig;
  getQuote(params: QuoteParams): Promise<PriceQuote>;
  executeSwap(params: SwapParams): Promise<string>;
  isChainSupported(chainId: number): boolean;
}

export interface QuoteParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  slippageTolerance: string;
  chainId: number;
}

export interface SwapParams extends QuoteParams {
  recipient: string;
  deadline: number;
  route: SwapRoute;
}

export enum DEX_PROTOCOL {
  UNISWAP_V2 = 'Uniswap V2',
  UNISWAP_V3 = 'Uniswap V3',
  PANCAKESWAP = 'PancakeSwap',
  SUSHISWAP = 'SushiSwap',
  RAYDIUM = 'Raydium'
}

export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BSC: 56,
  AVALANCHE: 43114,
  SOLANA: 101
};
