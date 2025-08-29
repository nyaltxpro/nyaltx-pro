export interface Blockchain {
  id: string;
  name: string;
  symbol: string;
  logoURI: string;
  chainId?: number;
  explorerURL?: string;
}

export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  type?: string;
  asset?: string;
  isMeme?: boolean;
  marketCap?: number;
  volume?: number;
  holders?: number;
  listingTime?: string;
  percentChange?: number;
  pairs?: TokenPair[];
}

export interface TokenPair {
  base?: string;
  quote?: string;
}

export interface BlockchainTokens {
  blockchain: Blockchain;
  tokens: Token[];
}

// Categories for token display
export enum TokenCategory {
  NEW = "NEW",
  PRE_LAUNCHED = "PRE LAUNCHED",
  LAUNCHED = "LAUNCHED"
}

// Token display filters
export interface TokenFilter {
  category?: TokenCategory;
  blockchain?: string;
  isMeme?: boolean;
  search?: string;
}
