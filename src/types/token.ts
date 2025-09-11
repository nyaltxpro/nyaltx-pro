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
  // Live fields (from trades or metadata augmentation)
  price?: number; // latest trade price (quote in SOL or USD if provided)
  marketCap?: number; // derived or provided market cap
}

export interface TokenPair {
  baseToken: string;
  quoteToken: string;
  baseName?: string;
  quoteName?: string;
}

export interface SearchResult {
  type: 'pair' | 'pumpfun' | 'nyax' | 'catalog';
  data: TokenPair | PumpFunToken | any;
}

// Live trade message (Pump.fun subscribeTokenTrade)
export interface PumpFunTrade {
  mint?: string; // token mint
  price?: number; // trade price (unit depends on feed)
  amount?: number; // trade amount
  ts?: number; // timestamp
  buyer?: string;
  seller?: string;
  name?: string;
  symbol?: string;
  image?: string;
  marketCap?: number; // if provided by feed
}
