import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import {
  MarketMoversSnapshot,
  StoredMarketMoverCoin,
} from '@/types/marketMovers';

const COINGECKO_MARKET_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&price_change_percentage=24h';

const PLATFORM_MAPPING: Record<string, string> = {
  ethereum: 'ethereum',
  'binance-smart-chain': 'binance',
  'polygon-pos': 'polygon',
  'arbitrum-one': 'arbitrum',
  'optimistic-ethereum': 'optimism',
  base: 'base',
  avalanche: 'avalanche',
  fantom: 'fantom',
  solana: 'solana',
  tron: 'tron',
};

const CHAIN_PRIORITY = [
  'ethereum',
  'binance',
  'polygon',
  'arbitrum',
  'base',
  'optimism',
  'avalanche',
  'fantom',
  'solana',
  'tron',
];

const DETAIL_ENDPOINT_BASE =
  'https://api.coingecko.com/api/v3/coins';

const SNAPSHOT_COLLECTION = 'market_movers_snapshots';

const MAX_RESULTS = 50;

async function fetchCoinDetailContracts(coinId: string): Promise<{
  contractAddresses: Record<string, string>;
  primaryChain: string | null;
  primaryAddress: string | null;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `${DETAIL_ENDPOINT_BASE}/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NYALTX-MarketMovers/1.0',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Detail request failed with status ${response.status}`);
    }

    const data = await response.json();

    const contractAddresses: Record<string, string> = {};

    const platforms = data?.platforms ?? {};
    Object.entries<string | null | undefined>(platforms).forEach(
      ([platformKey, address]) => {
        const chainName = PLATFORM_MAPPING[platformKey];
        if (
          chainName &&
          address &&
          address !== '' &&
          address !== '0x0000000000000000000000000000000000000000'
        ) {
          contractAddresses[chainName] = address;
        }
      }
    );

    const primaryChain =
      CHAIN_PRIORITY.find(chain => contractAddresses[chain]) ||
      Object.keys(contractAddresses)[0] ||
      null;

    return {
      contractAddresses,
      primaryChain,
      primaryAddress: primaryChain ? contractAddresses[primaryChain] : null,
    };
  } catch (error) {
    console.error(`Failed to fetch contract data for ${coinId}:`, error);
    return {
      contractAddresses: {},
      primaryChain: null,
      primaryAddress: null,
    };
  }
}

function mapToStoredCoin(coin: any): StoredMarketMoverCoin {
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    image: coin.image,
    current_price: coin.current_price ?? null,
    market_cap: coin.market_cap ?? null,
    market_cap_rank: coin.market_cap_rank ?? null,
    fully_diluted_valuation: coin.fully_diluted_valuation ?? null,
    total_volume: coin.total_volume ?? null,
    high_24h: coin.high_24h ?? null,
    low_24h: coin.low_24h ?? null,
    price_change_24h: coin.price_change_24h ?? null,
    price_change_percentage_24h: coin.price_change_percentage_24h ?? null,
    market_cap_change_24h: coin.market_cap_change_24h ?? null,
    market_cap_change_percentage_24h:
      coin.market_cap_change_percentage_24h ?? null,
    circulating_supply: coin.circulating_supply ?? null,
    total_supply: coin.total_supply ?? null,
    max_supply: coin.max_supply ?? null,
    ath: coin.ath ?? null,
    ath_change_percentage: coin.ath_change_percentage ?? null,
    ath_date: coin.ath_date ?? null,
    atl: coin.atl ?? null,
    atl_change_percentage: coin.atl_change_percentage ?? null,
    atl_date: coin.atl_date ?? null,
    roi: coin.roi ?? null,
    last_updated: coin.last_updated ?? null,
    price_change_percentage_24h_in_currency:
      coin.price_change_percentage_24h_in_currency ?? null,
  };
}

function selectTopCoins(
  coins: any[],
  sorter: (a: any, b: any) => number,
  predicate: (coin: any) => boolean = () => true,
  limit: number = 20
) {
  return coins
    .filter(predicate)
    .sort(sorter)
    .slice(0, limit);
}

async function enrichCoins(
  coins: StoredMarketMoverCoin[]
): Promise<StoredMarketMoverCoin[]> {
  const enriched: StoredMarketMoverCoin[] = [];
  const batchSize = 3;

  for (let i = 0; i < coins.length; i += batchSize) {
    const batch = coins.slice(i, i + batchSize);
    const details = await Promise.all(
      batch.map(async coin => {
        const detail = await fetchCoinDetailContracts(coin.id);
        return {
          ...coin,
          contractAddresses: detail.contractAddresses,
          primaryChain: detail.primaryChain,
          primaryAddress: detail.primaryAddress,
        } satisfies StoredMarketMoverCoin;
      })
    );

    enriched.push(...details);

    if (i + batchSize < coins.length) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  return enriched;
}

function uniqueCoinsById(coins: StoredMarketMoverCoin[]): StoredMarketMoverCoin[] {
  const seen = new Map<string, StoredMarketMoverCoin>();
  coins.forEach(coin => {
    if (!seen.has(coin.id)) {
      seen.set(coin.id, coin);
    }
  });
  return Array.from(seen.values());
}

export async function POST() {
  try {
    const response = await fetch(COINGECKO_MARKET_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'NYALTX-MarketMovers/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch market data:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch market data from CoinGecko' },
        { status: 502 }
      );
    }

    const marketData: any[] = await response.json();

    if (!Array.isArray(marketData) || marketData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Empty market data received from CoinGecko' },
        { status: 502 }
      );
    }

    const topGainersRaw = selectTopCoins(
      marketData,
      (a, b) => (b.price_change_percentage_24h ?? -Infinity) - (a.price_change_percentage_24h ?? -Infinity),
      coin => (coin.price_change_percentage_24h ?? null) !== null && coin.price_change_percentage_24h > 0,
      MAX_RESULTS
    ).map(mapToStoredCoin);

    const topLosersRaw = selectTopCoins(
      marketData,
      (a, b) => (a.price_change_percentage_24h ?? Infinity) - (b.price_change_percentage_24h ?? Infinity),
      coin => (coin.price_change_percentage_24h ?? null) !== null && coin.price_change_percentage_24h < 0,
      MAX_RESULTS
    ).map(mapToStoredCoin);

    const topVolumeRaw = selectTopCoins(
      marketData,
      (a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0),
      () => true,
      MAX_RESULTS
    ).map(mapToStoredCoin);

    const coinsNeedingDetails = uniqueCoinsById([
      ...topGainersRaw,
      ...topLosersRaw,
      ...topVolumeRaw,
    ]);

    const enrichedCoins = await enrichCoins(coinsNeedingDetails);
    const enrichedMap = new Map(enrichedCoins.map(coin => [coin.id, coin]));

    const enrichCoinList = (coins: StoredMarketMoverCoin[]) =>
      coins.map(coin => enrichedMap.get(coin.id) ?? coin);

    const rawCoinsCombined: StoredMarketMoverCoin[] = [
      ...topGainersRaw,
      ...topLosersRaw,
      ...topVolumeRaw,
    ];

    const snapshot: MarketMoversSnapshot = {
      createdAt: new Date(),
      source: 'coingecko',
      coinsFetched: marketData.length,
      topGainers: enrichCoinList(topGainersRaw),
      topLosers: enrichCoinList(topLosersRaw),
      topVolume: enrichCoinList(topVolumeRaw),
      rawCoins: rawCoinsCombined.slice(0, MAX_RESULTS * 3),
    };

    const collection = await getCollection<MarketMoversSnapshot>(SNAPSHOT_COLLECTION);

    await collection.createIndex({ createdAt: -1 }, { name: 'createdAt_desc' });
    await collection.insertOne(snapshot);

    // Optional cleanup: keep last 168 hours (~7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await collection.deleteMany({ createdAt: { $lt: sevenDaysAgo } });

    return NextResponse.json({
      success: true,
      snapshot: {
        createdAt: snapshot.createdAt,
        source: snapshot.source,
        coinsFetched: snapshot.coinsFetched,
        gainersCount: snapshot.topGainers.length,
        losersCount: snapshot.topLosers.length,
        volumeCount: snapshot.topVolume.length,
      },
    });
  } catch (error) {
    console.error('Market movers sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
