import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 120;

const XSTOCKS_BASE = 'https://api.xstocks.fi/api/v2';
const ASSET_CACHE_TTL_MS = 10 * 60 * 1000; // asset metadata changes rarely
const PRICE_CACHE_TTL_MS = 2 * 60 * 1000; // quotes refresh every 2 minutes
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 50;

type Deployment = {
  address?: string;
  network?: string;
};

type XStockAsset = {
  id: string;
  name: string;
  symbol: string;
  underlyingSymbol?: string;
  underlying?: {
    symbol?: string;
    exchange?: {
      abbreviation?: string;
      name?: string;
    };
  };
  logo?: string;
  isTradingHalted?: boolean;
  trading?: {
    openNow?: boolean;
    currentPeriod?: string;
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

type AssetCache = {
  expiresAt: number;
  assets: XStockAsset[];
};

type PriceCacheEntry = {
  expiresAt: number;
  price: number | null;
};

let assetCache: AssetCache | null = null;
const priceCache = new Map<string, PriceCacheEntry>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    throw new Error(`xStocks request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function listAllAssets(force = false): Promise<XStockAsset[]> {
  if (!force && assetCache && assetCache.expiresAt > Date.now()) {
    return assetCache.assets;
  }

  const nodes: XStockAsset[] = [];
  let page = 0;

  for (let i = 0; i < 20; i++) {
    const data = await fetchJson<{
      nodes?: XStockAsset[];
      page?: { hasNextPage?: boolean };
    }>(`${XSTOCKS_BASE}/public/assets?pageSize=50&page=${page}`);

    const batch = data.nodes ?? [];
    nodes.push(...batch);
    if (!data.page?.hasNextPage || batch.length === 0) break;
    page += 1;
  }

  nodes.sort((a, b) => a.symbol.localeCompare(b.symbol));
  assetCache = { expiresAt: Date.now() + ASSET_CACHE_TTL_MS, assets: nodes };
  return nodes;
}

async function fetchPrice(symbol: string, force = false): Promise<number | null> {
  const cached = priceCache.get(symbol);
  if (!force && cached && cached.expiresAt > Date.now()) {
    return cached.price;
  }

  try {
    const data = await fetchJson<{ quote?: number }>(
      `${XSTOCKS_BASE}/public/assets/${encodeURIComponent(symbol)}/price-data`,
    );
    const price =
      typeof data.quote === 'number' && Number.isFinite(data.quote) ? data.quote : null;
    priceCache.set(symbol, { expiresAt: Date.now() + PRICE_CACHE_TTL_MS, price });
    return price;
  } catch {
    priceCache.set(symbol, { expiresAt: Date.now() + 30_000, price: null });
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

  await Promise.all(
    Array.from({ length: Math.min(limit, Math.max(items.length, 1)) }, () => worker()),
  );
  return results;
}

function toRow(asset: XStockAsset, tokenizedPrice: number | null): QuoteRow {
  const traditionalPrice = tokenizedPrice;
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
    networks: [
      ...new Set((asset.deployments || []).map(d => d.network).filter(Boolean)),
    ] as string[],
    tokenizedPrice,
    traditionalPrice,
    spread,
    spreadBps,
  };
}

function matchesQuery(asset: XStockAsset, q: string) {
  if (!q) return true;
  return (
    asset.symbol.toLowerCase().includes(q) ||
    asset.name.toLowerCase().includes(q) ||
    (asset.underlyingSymbol || '').toLowerCase().includes(q) ||
    (asset.underlying?.symbol || '').toLowerCase().includes(q)
  );
}

function matchesStatus(asset: XStockAsset, status: string) {
  if (status === 'open') return !asset.isTradingHalted && Boolean(asset.trading?.openNow);
  if (status === 'halted') return Boolean(asset.isTradingHalted);
  return true;
}

/** Popular underlyings for the dashboard ticker */
const TICKER_UNDERLYINGS = [
  'AAPL',
  'TSLA',
  'NVDA',
  'MSFT',
  'GOOGL',
  'AMZN',
  'META',
  'NFLX',
  'AMD',
  'COIN',
  'MSTR',
  'SPY',
  'QQQ',
  'BABA',
  'SHOP',
  'PLTR',
  'INTC',
  'CRM',
  'UBER',
  'HOOD',
  'ARM',
  'AVGO',
  'ORCL',
  'JPM',
  'V',
];

function pickTickerAssets(assets: XStockAsset[], limit = 24): XStockAsset[] {
  const picked: XStockAsset[] = [];
  const used = new Set<string>();

  for (const underlying of TICKER_UNDERLYINGS) {
    if (picked.length >= limit) break;
    const match = assets.find(asset => {
      if (used.has(asset.id)) return false;
      const u = (asset.underlyingSymbol || asset.underlying?.symbol || '').toUpperCase();
      const sym = asset.symbol.toUpperCase();
      return (
        u === underlying ||
        sym === `${underlying}X` ||
        sym === underlying ||
        sym.startsWith(`${underlying}X`)
      );
    });
    if (match) {
      used.add(match.id);
      picked.push(match);
    }
  }

  // Fill remaining slots with open (or any) assets that still need pricing
  if (picked.length < limit) {
    const fillers = assets.filter(
      a => !used.has(a.id) && !a.isTradingHalted && Boolean(a.trading?.openNow),
    );
    for (const asset of fillers) {
      if (picked.length >= limit) break;
      used.add(asset.id);
      picked.push(asset);
    }
  }

  return picked;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get('mode') || '').toLowerCase();
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const status = (searchParams.get('status') || 'all').toLowerCase();
    const force = searchParams.get('refresh') === '1';
    const page = Math.max(1, Number(searchParams.get('page') || 1) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE),
    );

    const assets = await listAllAssets(force);

    // Dashboard ticker: curated popular tokenized stocks with live quotes
    if (mode === 'ticker') {
      const tickerLimit = Math.min(30, Math.max(8, Number(searchParams.get('limit') || 24) || 24));
      const pageAssets = pickTickerAssets(assets, tickerLimit);
      const prices = await mapWithConcurrency(pageAssets, 10, asset =>
        fetchPrice(asset.symbol, force),
      );
      const securities = pageAssets
        .map((asset, i) => toRow(asset, prices[i]))
        .filter(row => row.tokenizedPrice !== null);

      // If few priced from curated list, append any other cached-priced open assets
      if (securities.length < 8) {
        const extras = assets
          .filter(a => !pageAssets.some(p => p.id === a.id))
          .slice(0, 40);
        const extraPrices = await mapWithConcurrency(extras, 10, asset =>
          fetchPrice(asset.symbol, false),
        );
        for (let i = 0; i < extras.length && securities.length < tickerLimit; i++) {
          if (extraPrices[i] !== null) {
            securities.push(toRow(extras[i], extraPrices[i]));
          }
        }
      }

      return NextResponse.json(
        {
          updatedAt: new Date().toISOString(),
          source: 'xStocks',
          mode: 'ticker',
          count: securities.length,
          pricedOnPage: securities.length,
          securities,
          syncIntervalSeconds: 120,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        },
      );
    }

    const filtered = assets.filter(
      asset => matchesQuery(asset, q) && matchesStatus(asset, status),
    );

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const pageAssets = filtered.slice(start, start + pageSize);

    const prices = await mapWithConcurrency(pageAssets, 10, asset =>
      fetchPrice(asset.symbol, force),
    );

    const securities = pageAssets.map((asset, i) => toRow(asset, prices[i]));

    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        source: 'xStocks',
        total,
        page: safePage,
        pageSize,
        totalPages,
        count: securities.length,
        pricedOnPage: securities.filter(s => s.tokenizedPrice !== null).length,
        securities,
        syncIntervalSeconds: 120,
      },
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
