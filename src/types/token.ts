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

// User registered token for Race to Liberty
export interface RegisteredToken {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  chain: string;
  logo?: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  userId: string;
  walletAddress: string;
  submittedByAddress?: string; // The wallet address that submitted the token
  status: 'pending' | 'approved' | 'rejected';
  boostMultiplier: number; // 1.0 = no boost, 1.5 = 50% boost, etc.
  submittedAt: number;
  approvedAt?: number;
  approvedBy?: string; // admin wallet address
  rejectionReason?: string;
}

// Token boost configuration
export interface TokenBoost {
  tokenId: string;
  multiplier: number;
  maxBoost: number;
  category: 'community' | 'utility' | 'defi' | 'gaming' | 'meme';
}
