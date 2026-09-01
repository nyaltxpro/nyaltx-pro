import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300;

const API_KEY = process.env.COINMARKETCAL_API_KEY || 'cmc_live_8ec39a5f0ba4914f5efdd7deeb5b7951';
const BASE_URL = 'https://api.coinmarketcal.com/v2/events';
const COINS_URL = 'https://api.coinmarketcal.com/v2/coins';
const CMC_ICON_BASE = 'https://coinmarketcal-share.s3.eu-west-1.amazonaws.com/coins/icons';
const CACHE_TTL_MS = 5 * 60 * 1000;

type V2Coin = {
  slug?: string;
  symbol?: string;
  name?: string;
};

type V2Event = {
  id?: string | number;
  slug?: string;
  title?: string;
  description?: string | null;
  date?: string;
  dateEnd?: string | null;
  isEstimated?: boolean;
  displayedDate?: string;
  coins?: V2Coin[];
  impact?: unknown;
  impactSummary?: string | null;
  sourceUrl?: string | null;
  snapshotUrl?: string | null;
  createdAt?: string | null;
};

type CoinMeta = {
  iconUrl?: string;
  name?: string;
  rank?: number;
};

type EventsPayload = {
  body: ReturnType<typeof mapEvent>[];
  page: number;
  totalPages: number;
  totalEvents: number;
};

type CacheEntry = {
  expiresAt: number;
  payload: EventsPayload;
};

const eventsCache = new Map<string, CacheEntry>();
const coinMetaCache = new Map<string, { expiresAt: number; meta: Record<string, CoinMeta> }>();

function cacheKey(pageNum: number, limit: number) {
  return `${pageNum}:${limit}`;
}

function getCached(pageNum: number, limit: number): EventsPayload | null {
  const entry = eventsCache.get(cacheKey(pageNum, limit));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) return null;
  return entry.payload;
}

function setCached(pageNum: number, limit: number, payload: EventsPayload) {
  eventsCache.set(cacheKey(pageNum, limit), {
    expiresAt: Date.now() + CACHE_TTL_MS,
    payload,
  });
}

function getStale(pageNum: number, limit: number): EventsPayload | null {
  return eventsCache.get(cacheKey(pageNum, limit))?.payload ?? null;
}

function localIconForSymbol(symbol?: string) {
  const normalized = (symbol || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!normalized) return '/crypto-icons/color/generic.svg';
  return `/crypto-icons/color/${normalized}.svg`;
}

function cmcIconForSlug(slug?: string) {
  if (!slug) return '';
  return `${CMC_ICON_BASE}/${slug}.png`;
}

function buildDescription(event: V2Event, coinLabels: string[]) {
  const direct = event.description?.trim() || event.impactSummary?.trim();
  if (direct) return direct;

  const title = event.title?.trim() || 'Crypto event';
  const datePart = event.displayedDate ? ` Scheduled for ${event.displayedDate}.` : '';
  const coinPart = coinLabels.length ? ` Related assets: ${coinLabels.join(', ')}.` : '';
  return `${title}.${datePart}${coinPart}`.replace(/\.\./g, '.').trim();
}

async function fetchCoinMeta(slugs: string[]): Promise<Record<string, CoinMeta>> {
  const unique = [...new Set(slugs.filter(Boolean))].slice(0, 40);
  if (!unique.length) return {};

  const cacheKeyForSlugs = unique.slice().sort().join(',');
  const cached = coinMetaCache.get(cacheKeyForSlugs);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.meta;
  }

  const meta: Record<string, CoinMeta> = {};
  await Promise.all(
    unique.map(async slug => {
      meta[slug] = { iconUrl: cmcIconForSlug(slug) };
      try {
        const res = await fetch(`${COINS_URL}/${encodeURIComponent(slug)}`, {
          headers: {
            'x-api-key': API_KEY,
            Accept: 'application/json',
          },
          next: { revalidate: 3600 },
        });
        if (!res.ok) return;
        const coin = await res.json();
        if (coin?.slug) {
          meta[slug] = {
            iconUrl: coin.iconUrl || cmcIconForSlug(slug),
            name: coin.name,
            rank: typeof coin.rank === 'number' ? coin.rank : undefined,
          };
        }
      } catch {
        // Keep slug-based icon fallback
      }
    })
  );

  coinMetaCache.set(cacheKeyForSlugs, {
    expiresAt: Date.now() + 60 * 60 * 1000,
    meta,
  });

  return meta;
}

function mapEvent(event: V2Event, coinMeta: Record<string, CoinMeta>) {
  const numericId = Number(event.id);
  const coins = (event.coins || []).map(coin => {
    const slug = coin.slug || '';
    const details = slug ? coinMeta[slug] : undefined;
    return {
      id: slug || coin.symbol || coin.name || '',
      name: details?.name || coin.name || coin.symbol || '',
      rank: details?.rank || 0,
      symbol: (coin.symbol || '').toUpperCase(),
      fullname: details?.name || coin.name || coin.symbol || '',
      image: details?.iconUrl || cmcIconForSlug(slug) || localIconForSymbol(coin.symbol),
    };
  });

  const primaryCoin = coins[0];
  const proof =
    event.snapshotUrl ||
    primaryCoin?.image ||
    cmcIconForSlug(event.coins?.[0]?.slug) ||
    localIconForSymbol(primaryCoin?.symbol) ||
    '/crypto-icons/color/generic.svg';

  const coinLabels = coins.map(coin => coin.name || coin.symbol).filter(Boolean);
  const description = buildDescription(event, coinLabels);

  return {
    id: Number.isFinite(numericId) ? numericId : event.id,
    slug: event.slug || '',
    title: { en: event.title?.trim() || 'Untitled event' },
    coins,
    date_event: event.date || '',
    can_occur_before: Boolean(event.isEstimated),
    created_date: event.createdAt || '',
    displayed_date: event.displayedDate || '',
    categories: [],
    proof,
    source: event.sourceUrl || (event.slug ? `https://coinmarketcal.com/en/event/${event.slug}` : ''),
    description: { en: description },
    important: Boolean(event.impact),
  };
}

function jsonResponse(payload: EventsPayload, cacheStatus: 'HIT' | 'MISS' | 'STALE') {
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      'X-Events-Cache': cacheStatus,
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageNum = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('max') || '50', 10) || 50, 1), 50);

  const cached = getCached(pageNum, limit);
  if (cached) {
    return jsonResponse(cached, 'HIT');
  }

  try {
    const offset = (pageNum - 1) * limit;
    const upstreamParams = new URLSearchParams({ limit: String(limit) });
    if (offset > 0) {
      upstreamParams.set('cursor', Buffer.from(JSON.stringify({ offset })).toString('base64'));
    }

    const response = await fetch(`${BASE_URL}?${upstreamParams.toString()}`, {
      headers: {
        'x-api-key': API_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const stale = getStale(pageNum, limit);
      if (stale) return jsonResponse(stale, 'STALE');

      const details = await response.text().catch(() => '');
      console.error('CoinMarketCal request failed:', response.status, details);
      return NextResponse.json(
        { error: 'Failed to fetch events', status: response.status },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const events: V2Event[] = Array.isArray(payload?.data) ? payload.data : [];
    const slugs = events.flatMap(event => (event.coins || []).map(coin => coin.slug || '')).filter(Boolean);
    const coinMeta = await fetchCoinMeta(slugs);

    const totalEvents = Number(payload?.meta?.total) || events.length;
    const totalPages = Math.max(1, Math.ceil(totalEvents / limit));
    const mapped: EventsPayload = {
      body: events.map(event => mapEvent(event, coinMeta)),
      page: pageNum,
      totalPages,
      totalEvents,
    };

    setCached(pageNum, limit, mapped);
    return jsonResponse(mapped, 'MISS');
  } catch (error) {
    const stale = getStale(pageNum, limit);
    if (stale) return jsonResponse(stale, 'STALE');

    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
