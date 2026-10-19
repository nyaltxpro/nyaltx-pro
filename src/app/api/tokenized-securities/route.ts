import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 60;

const XSTOCKS_BASE = 'https://api.xstocks.fi/api/v2';
const CACHE_TTL_MS = 60 * 1000;
const MAX_PRICE_LOOKUPS = 80;

type Deployment = {
  address?: string;
  network?: string;
  supportsAtomicSwaps?: boolean;
};

type XStockAsset = {
  id: string;
  name: string;
  symbol: string;
  isin?: string;
  underlyingSymbol?: string;
  underlyingIsin?: string;
  underlying?: {
    symbol?: string;
    currency?: string;
    exchange?: {
      abbreviation?: string;
      name?: string;
      country?: string;
    };
  };
  description?: string;
  logo?: string;
  isTradingHalted?: boolean;
  trading?: {
    openNow?: boolean;
    currentPeriod?: string;
    currency?: string;
  };
  deployments?: Deployment[];
};

type QuoteRow = {
  id: string;
  name: string;
  symbol: string;
  underlyingSymbol: string;
  underlyingExchange: string;
  logo: string | null;
  isTradingHalted: boolean;
  openNow: boolean;
  tradingPeriod: string | null;
  networks: string[];
  tokenizedPrice: number | null;
  traditionalPrice: number | null;
  spread: number | null;
  spreadBps: number | null;
};

type CacheEntry = {
  expiresAt: number;
  payload: {
    updatedAt: string;
    source: string;
    count: number;
    securities: QuoteRow[];
  };
};

let cache: CacheEntry | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`xStocks request failed (${res.status}) for ${url}`);
  }
  return res.json() as Promise<T>;
}

async function listAllAssets(): Promise<XStockAsset[]> {
  const nodes: XStockAsset[] = [];
  let page = 0;

  for (let i = 0; i < 12; i++) {
    const data = await fetchJson<{
      nodes?: XStockAsset[];
      page?: { currentPage?: number; hasNextPage?: boolean };
    }>(`${XSTOCKS_BASE}/public/assets?pageSize=50&page=${page}`);

    const batch = data.nodes ?? [];
    nodes.push(...batch);

    if (!data.page?.hasNextPage || batch.length === 0) break;
    page += 1;
  }

  return nodes;
}

async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const data = await fetchJson<{ quote?: number }>(
      `${XSTOCKS_BASE}/public/assets/${encodeURIComponent(symbol)}/price-data`,
    );
    return typeof data.quote === 'number' && Number.isFinite(data.quote) ? data.quote : null;
  } catch {
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function toRow(asset: XStockAsset, tokenizedPrice: number | null): QuoteRow {
  const traditionalPrice = tokenizedPrice; // xStocks indicative quote is Nasdaq-linked
  const spread =
    tokenizedPrice !== null && traditionalPrice !== null
      ? tokenizedPrice - traditionalPrice
      : null;
  const spreadBps =
    spread !== null && traditionalPrice
      ? (spread / traditionalPrice) * 10_000
      : null;

  return {
    id: asset.id,
    name: asset.name,
    symbol: asset.symbol,
    underlyingSymbol: asset.underlyingSymbol || asset.underlying?.symbol || '',
    underlyingExchange:
      asset.underlying?.exchange?.abbreviation ||
      asset.underlying?.exchange?.name ||
      '—',
    logo: asset.logo || null,
    isTradingHalted: Boolean(asset.isTradingHalted),
    openNow: Boolean(asset.trading?.openNow),
    tradingPeriod: asset.trading?.currentPeriod || null,
    networks: [...new Set((asset.deployments || []).map(d => d.network).filter(Boolean))] as string[],
    tokenizedPrice,
    traditionalPrice,
    spread,
    spreadBps,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const force = searchParams.get('refresh') === '1';

    if (!force && cache && cache.expiresAt > Date.now()) {
      const filtered = q
        ? cache.payload.securities.filter(
            s =>
              s.symbol.toLowerCase().includes(q) ||
              s.name.toLowerCase().includes(q) ||
              s.underlyingSymbol.toLowerCase().includes(q),
          )
        : cache.payload.securities;

      return NextResponse.json(
        { ...cache.payload, count: filtered.length, securities: filtered },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        },
      );
    }

    const assets = await listAllAssets();
    const priceTargets = assets.slice(0, MAX_PRICE_LOOKUPS);
    const prices = await mapWithConcurrency(priceTargets, 8, asset => fetchPrice(asset.symbol));
    const priceBySymbol = new Map(
      priceTargets.map((asset, i) => [asset.symbol, prices[i]] as const),
    );

    const securities = assets
      .map(asset => toRow(asset, priceBySymbol.get(asset.symbol) ?? null))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    const payload = {
      updatedAt: new Date().toISOString(),
      source: 'xStocks',
      count: securities.length,
      securities,
      note:
        'Tokenized quotes from xStocks public price-data (Nasdaq/on-chain indicative). Traditional column currently mirrors that indicative reference until a licensed equity feed is added.',
    };

    cache = { expiresAt: Date.now() + CACHE_TTL_MS, payload };

    const filtered = q
      ? securities.filter(
          s =>
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.underlyingSymbol.toLowerCase().includes(q),
        )
      : securities;

    return NextResponse.json(
      { ...payload, count: filtered.length, securities: filtered },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      },
    );
  } catch (error) {
    console.error('tokenized-securities API error', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to load tokenized securities',
      },
      { status: 502 },
    );
  }
}
