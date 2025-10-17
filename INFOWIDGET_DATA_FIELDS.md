# InfoWidget Data Fields Documentation

## Complete List of Available Data Fields

### Basic Token Information
```typescript
name: string;                    // Token name (e.g., "xSpace Token")
symbol: string;                  // Token symbol (e.g., "xSPACE")
baseToken: string;               // Base trading pair (e.g., "WPOL", "ETH")
chain: string;                   // Blockchain network (e.g., "Polygon", "Ethereum")
dex: string;                     // DEX name (e.g., "Uniswap", "PancakeSwap")
logoUri?: string;                // Token logo image URL
description?: string;            // Token description
```

### Price Data
```typescript
priceUsd: string;                // Current USD price (e.g., "$0.003139")
priceNative: string;             // Price in native token (e.g., "0.01586 WPOL")
priceChange?: string;            // Overall price change percentage
high24h?: string;                // 24h high price
low24h?: string;                 // 24h low price
```

### Market Data
```typescript
liquidity: string;               // Total liquidity (e.g., "$43K")
fdv: string;                     // Fully diluted valuation (e.g., "$78K")
marketCap: string;               // Market capitalization (e.g., "$268K")
totalSupply?: string;            // Total token supply (e.g., "250M")
circulatingSupply?: string;      // Circulating supply (e.g., "85M")
maxSupply?: string;              // Maximum supply cap
```

### Price Changes (Multiple Time Intervals)
```typescript
change5m?: string;               // 5 minute price change (e.g., "0.05%")
change1h?: string;               // 1 hour price change
change6h?: string;               // 6 hour price change
change24h?: string;              // 24 hour price change (e.g., "2.21%")
change7d?: string;               // 7 day price change (e.g., "5.40%")
change30d?: string;              // 30 day price change (e.g., "-12.30%")
```

### Trading Statistics (24h Period)
```typescript
txns: number;                    // Total transactions (e.g., 28)
buys: number;                    // Buy transactions (e.g., 13)
sells: number;                   // Sell transactions (e.g., 15)
volume: string;                  // Total trading volume (e.g., "$489")
volume24h?: string;              // 24h volume (e.g., "$12.5K")
buyVolume: string;               // Buy volume (e.g., "$287")
sellVolume: string;              // Sell volume (e.g., "$202")
volumeChange24h?: string;        // 24h volume change (e.g., "+15.2%")
```

### Maker Statistics
```typescript
makers: number;                  // Total makers (e.g., 20)
buyers: number;                  // Number of buyers (e.g., 11)
sellers: number;                 // Number of sellers (e.g., 13)
uniqueWallets24h?: number;       // Unique wallets in 24h (e.g., 45)
```

### Liquidity Pool Data
```typescript
pairCreated?: string;            // When pair was created (e.g., "1y 11d ago")
pooledToken: string;             // Token name in pool (e.g., "xSPACE")
pooledTokenAmount: string;       // Token amount in pool (e.g., "6,821,431")
pooledTokenValue: string;        // Token value in pool (e.g., "$21K")
pooledBase: string;              // Base token in pool (e.g., "WPOL")
pooledBaseAmount: string;        // Base token amount (e.g., "111,232")
pooledBaseValue: string;         // Base token value (e.g., "$22K")
```

### Contract Addresses
```typescript
pairAddress?: string;            // Trading pair address (e.g., "0xDF6...cD37")
tokenAddress?: string;           // Token contract address (e.g., "0x1D1...056f")
baseAddress?: string;            // Base token address (e.g., "0x0d5...1270")
```

### Social & External Links
```typescript
website?: string;                // Official website URL
twitter?: string;                // Twitter profile URL
telegram?: string;               // Telegram group URL
discord?: string;                // Discord server URL
github?: string;                 // GitHub repository URL
coingeckoId?: string;            // CoinGecko ID
coinmarketcapId?: string;        // CoinMarketCap ID
```

### Security & Audit Information
```typescript
securityIssues?: Array<{         // Security concerns array
  title: string;                 // Issue title
  description: string;           // Issue description
}>;
intelIssues?: Array<{            // Intelligence issues array
  title: string;                 // Issue title
  description: string;           // Issue description
}>;
snifferScore?: number;           // Token sniffer score (0-100)
isVerified?: boolean;            // Verification status
isAudited?: boolean;             // Audit status
auditBy?: string;                // Auditor name
```

### Holder Information
```typescript
holders?: string;                // Total holders (e.g., "1,234")
top10HoldersPercent?: string;    // Top 10 holders % (e.g., "45%")
```

### Additional Market Metrics
```typescript
ath?: string;                    // All-time high price (e.g., "$0.015")
atl?: string;                    // All-time low price (e.g., "$0.001")
athDate?: string;                // When ATH occurred (e.g., "3 months ago")
atlDate?: string;                // When ATL occurred (e.g., "1 year ago")
rank?: number;                   // Market rank (e.g., 1250)
```

### DEX Specific
```typescript
dexUrl?: string;                 // Direct DEX trading URL
chartUrl?: string;               // Chart/analytics URL
```

## Usage Example

```typescript
import InfoWidget, { TokenData } from '@/components/InfoWidget';

const myTokenData: TokenData = {
  // Basic Info (Required)
  name: "My Token",
  symbol: "MTK",
  baseToken: "ETH",
  chain: "Ethereum",
  dex: "Uniswap",
  
  // Prices (Required)
  priceUsd: "$1.234",
  priceNative: "0.0005 ETH",
  liquidity: "$500K",
  fdv: "$10M",
  marketCap: "$5M",
  
  // Trading Stats (Required)
  txns: 150,
  buys: 90,
  sells: 60,
  volume: "$50K",
  buyVolume: "$32K",
  sellVolume: "$18K",
  makers: 45,
  buyers: 28,
  sellers: 17,
  
  // Pool Data (Required)
  pooledToken: "MTK",
  pooledTokenAmount: "5,000,000",
  pooledTokenValue: "$250K",
  pooledBase: "ETH",
  pooledBaseAmount: "100",
  pooledBaseValue: "$250K",
  
  // Optional Fields
  logoUri: "https://example.com/logo.png",
  description: "My awesome token description",
  change24h: "+5.23%",
  high24h: "$1.50",
  low24h: "$1.10",
  totalSupply: "1B",
  circulatingSupply: "400M",
  holders: "5,678",
  website: "https://mytoken.com",
  twitter: "https://twitter.com/mytoken",
  telegram: "https://t.me/mytoken",
  ath: "$5.00",
  atl: "$0.10",
  athDate: "6 months ago",
  rank: 500,
  isVerified: true,
  snifferScore: 85,
};

<InfoWidget data={myTokenData} />
```

## Visual Features

### Main View
- Token logo and name in header
- Token symbol / base pair display
- Chain and DEX badges
- Price cards (USD & Native)
- Market stats (Liquidity, FDV, Market Cap)
- Time-based price changes (5m, 1h, 6h, 24h) with color coding
- Transaction stats with visual progress bars
- Volume breakdown with progress bars
- Maker statistics with progress bars

### Details View
- Pair creation date
- Pooled token information
- Contract addresses with copy/explorer buttons
- Supply information (total, circulating, holders)
- ATH/ATL cards with dates
- Clickable social links section
- Trade and Chart buttons (with URLs if provided)
- Security issues (expandable)
- Intelligence issues (expandable)
- Token sniffer score with color coding

## Color Coding

- **Price Changes**: Green for positive, Red for negative
- **Sniffer Score**: Red (<50), Yellow (50-69), Green (≥70)
- **Progress Bars**: Green for buys, Red for sells
- **ATH**: Green highlight
- **ATL**: Red highlight

## Notes

- All optional fields will be conditionally rendered (hidden if not provided)
- Percentages are automatically parsed for color coding
- Progress bars are dynamically calculated from the data
- Social links are clickable and open in new tabs
- Component is fully responsive with mobile/tablet/desktop support
