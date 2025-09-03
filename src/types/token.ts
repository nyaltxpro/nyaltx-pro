// Shared token data interfaces
export interface PumpFunToken {
  name?: string;
  symbol?: string;
  mint?: string;
  creator?: string;
  ts?: number;
  image?: string;
  uri?: string;
  metadataFetched?: boolean;
  poolAddress?: string;
  launched?: boolean;
}

export interface TokenPair {
  baseToken: string;
  quoteToken: string;
  baseName?: string;
  quoteName?: string;
}

export interface SearchResult {
  type: 'pair' | 'pumpfun' | 'nyax';
  data: TokenPair | PumpFunToken | any;
}
