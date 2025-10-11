import { NextRequest, NextResponse } from 'next/server';

interface DexScreenerTokenProfile {
  tokenAddress: string;
  chainId: string;
  url: string;
  description?: string;
  icon?: string;
  header?: string;
  openGraph?: string;
  links?: Array<{
    type?: string;
    label?: string;
    url: string;
  }>;
  cto?: boolean;
}

interface TransformedToken {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
  market_cap_rank: number | null;
  contractAddresses: { [key: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
  description?: string;
  links?: Array<{
    type?: string;
    label?: string;
    url: string;
  }>;
  dexscreenerUrl?: string;
}

// Chain ID mapping from DexScreener to our format
const CHAIN_MAPPING: { [key: string]: string } = {
  'ethereum': 'ethereum',
  'bsc': 'binance',
  'polygon': 'polygon',
  'arbitrum': 'arbitrum',
  'optimism': 'optimism',
  'base': 'base',
  'avalanche': 'avalanche',
  'fantom': 'fantom',
  'solana': 'solana',
  'cronos': 'cronos',
  'moonbeam': 'moonbeam',
  'celo': 'celo',
  'aurora': 'aurora',
  'harmony': 'harmony',
  'kcc': 'kcc',
  'heco': 'heco',
  'okexchain': 'okex',
  'xdai': 'xdai',
  'moonriver': 'moonriver',
  'fuse': 'fuse',
  'telos': 'telos',
  'metis': 'metis',
  'syscoin': 'syscoin',
  'milkomeda': 'milkomeda',
  'dogechain': 'dogechain',
  'redlight': 'redlight',
  'astar': 'astar',
  'shiden': 'shiden',
  'tron': 'tron',
  'aptos': 'aptos',
  'sui': 'sui',
  'ton': 'ton',
  'pulsechain': 'pulsechain',
  'flare': 'flare',
  'radix': 'radix',
  'near': 'near',
  'algorand': 'algorand',
  'hedera': 'hedera',
  'cardano': 'cardano',
  'stellar': 'stellar',
  'cosmos': 'cosmos',
  'osmosis': 'osmosis',
  'terra': 'terra',
  'thorchain': 'thorchain',
  'injective': 'injective',
  'sei': 'sei',
  'neutron': 'neutron',
  'stargaze': 'stargaze',
  'juno': 'juno',
  'secret': 'secret',
  'akash': 'akash',
  'regen': 'regen',
  'persistence': 'persistence',
  'comdex': 'comdex',
  'chihuahua': 'chihuahua',
  'lumnetwork': 'lumnetwork',
  'bitsong': 'bitsong',
  'likecoin': 'likecoin',
  'dig': 'dig',
  'sommelier': 'sommelier',
  'umee': 'umee',
  'gravity': 'gravity',
  'stride': 'stride',
  'evmos': 'evmos',
  'kava': 'kava',
  'crypto-org': 'crypto-org',
  'irisnet': 'irisnet',
  'sifchain': 'sifchain',
  'sentinel': 'sentinel',
  'fetchai': 'fetchai',
  'assetmantle': 'assetmantle',
  'cheqd': 'cheqd',
  'lum': 'lum',
  'vidulum': 'vidulum',
  'desmos': 'desmos',
  'bandprotocol': 'bandprotocol',
  'konstellation': 'konstellation',
  'medibloc': 'medibloc',
  'rizon': 'rizon',
  'cerberus': 'cerberus',
  'bostrom': 'bostrom',
  'provenance': 'provenance',
  'galaxy': 'galaxy',
  'meme': 'meme',
  'oraichain': 'oraichain',
  'passage': 'passage',
  'cudos': 'cudos',
  'decentr': 'decentr',
  'carbon': 'carbon',
  'crescent': 'crescent',
  'quicksilver': 'quicksilver',
  'jackal': 'jackal',
  'migaloo': 'migaloo',
  'nolus': 'nolus',
  'composable': 'composable',
  'dydx': 'dydx',
  'noble': 'noble',
  'celestia': 'celestia',
  'dymension': 'dymension',
  'saga': 'saga',
  'initia': 'initia',
  'omniflix': 'omniflix',
  'planq': 'planq',
  'lambda': 'lambda',
  'archway': 'archway',
  'coreum': 'coreum',
  'xpla': 'xpla',
  'kyve': 'kyve',
  'mars': 'mars',
  'teritori': 'teritori',
  'quasar': 'quasar',
  'gitopia': 'gitopia',
  'lava': 'lava',
  'empowerchain': 'empowerchain',
  'chain4energy': 'chain4energy',
  'impacthub': 'impacthub',
  'uptick': 'uptick',
  'source': 'source',
  'aura': 'aura',
  'haqq': 'haqq',
  'kujira': 'kujira',
  'bitcanna': 'bitcanna',
  'kichain': 'kichain',
  'panacea': 'panacea',
  'pylons': 'pylons',
};

// Generate a unique ID from token address and chain
const generateTokenId = (tokenAddress: string, chainId: string): string => {
  return `${chainId}-${tokenAddress}`.toLowerCase();
};

// Extract token symbol from description or URL
const extractTokenSymbol = (profile: DexScreenerTokenProfile): string => {
  // Try to extract from URL path
  if (profile.url) {
    const urlParts = profile.url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.length <= 10) {
      return lastPart.toUpperCase();
    }
  }
  
  // Try to extract from description
  if (profile.description) {
    const symbolMatch = profile.description.match(/\$([A-Z]{2,10})/);
    if (symbolMatch) {
      return symbolMatch[1];
    }
  }
  
  // Fallback to first 6 characters of address
  return profile.tokenAddress.slice(0, 6).toUpperCase();
};

// Extract token name from description
const extractTokenName = (profile: DexScreenerTokenProfile): string => {
  if (profile.description) {
    // Try to extract name before symbol or description
    const lines = profile.description.split('\n');
    const firstLine = lines[0].trim();
    
    // Remove common prefixes and clean up
    const cleanName = firstLine
      .replace(/^\$[A-Z]+\s*[-:]?\s*/, '') // Remove $SYMBOL prefix
      .replace(/^Token\s*[-:]?\s*/i, '') // Remove "Token" prefix
      .replace(/\s*\$[A-Z]+.*$/, '') // Remove trailing symbol
      .trim();
    
    if (cleanName && cleanName.length > 0 && cleanName.length <= 50) {
      return cleanName;
    }
  }
  
  // Fallback to symbol as name
  return extractTokenSymbol(profile);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 tokens

    console.log('🔄 Fetching latest token profiles from DexScreener API...');

    // Fetch latest token profiles from DexScreener
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NYALTX-RecentlyAdded/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ DexScreener API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `DexScreener API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: DexScreenerTokenProfile[] = await response.json();
    console.log(`📥 Received ${data?.length || 0} token profiles from DexScreener`);

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from DexScreener API');
    }

    // Transform DexScreener data to our format
    const transformedTokens: TransformedToken[] = data
      .slice(0, limit) // Limit results
      .map((profile: DexScreenerTokenProfile) => {
        const chainName = CHAIN_MAPPING[profile.chainId] || profile.chainId;
        const tokenSymbol = extractTokenSymbol(profile);
        const tokenName = extractTokenName(profile);
        
        const contractAddresses: { [key: string]: string } = {};
        contractAddresses[chainName] = profile.tokenAddress;

        return {
          id: generateTokenId(profile.tokenAddress, profile.chainId),
          name: tokenName,
          symbol: tokenSymbol,
          image: profile.icon || '/crypto-icons/color/generic.svg',
          current_price: null, // DexScreener profiles don't include price data
          market_cap: null,
          total_volume: null,
          price_change_percentage_24h: null,
          market_cap_rank: null,
          contractAddresses,
          primaryChain: chainName,
          primaryAddress: profile.tokenAddress,
          description: profile.description,
          links: profile.links,
          dexscreenerUrl: profile.url
        };
      });

    console.log(`✅ Transformed ${transformedTokens.length} recently added tokens from DexScreener`);

    // Cache headers for 5 minutes
    const headers = {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Content-Type': 'application/json'
    };

    return NextResponse.json(
      {
        coins: transformedTokens,
        total: transformedTokens.length,
        source: 'dexscreener',
        timestamp: new Date().toISOString()
      },
      { headers }
    );

  } catch (error: any) {
    console.error('❌ Error fetching recently added tokens from DexScreener:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch recently added tokens' },
      { status: 500 }
    );
  }
}
