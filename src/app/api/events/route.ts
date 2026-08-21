import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300;

const API_KEY = process.env.COINMARKETCAL_API_KEY || 'cmc_live_8ec39a5f0ba4914f5efdd7deeb5b7951';
const BASE_URL = 'https://api.coinmarketcal.com/v2/events';
const CACHE_TTL_MS = 5 * 60 * 1000;

type V2Coin = {
  slug?: string;
  symbol?: string;
  name?: string;
};

type V2Event = {
  id?: string | number;
  title?: string;
  description?: string | null;
  date?: string;
  dateEnd?: string | null;
  isEstimated?: boolean;
  displayedDate?: string;
  coins?: V2Coin[];
  impact?: unknown;
  sourceUrl?: string | null;
  snapshotUrl?: string | null;
  createdAt?: string | null;
};

function mapEvent(event: V2Event) {
  const numericId = Number(event.id);
  return {
    id: Number.isFinite(numericId) ? numericId : event.id,
    title: { en: event.title || 'Untitled event' },
    coins: (event.coins || []).map(coin => ({
      id: coin.slug || coin.symbol || coin.name || '',
      name: coin.name || coin.symbol || '',
      rank: 0,
      symbol: (coin.symbol || '').toUpperCase(),
      fullname: coin.name || coin.symbol || '',
    })),
    date_event: event.date || '',
    can_occur_before: Boolean(event.isEstimated),
    created_date: event.createdAt || '',
    displayed_date: event.displayedDate || '',
    categories: [],
    proof: event.snapshotUrl || '',
    source: event.sourceUrl || '',
    description: event.description ? { en: event.description } : undefined,
    important: Boolean(event.impact),
  };
}

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
    const events = Array.isArray(payload?.data) ? payload.data : [];
    const totalEvents = Number(payload?.meta?.total) || events.length;
    const totalPages = Math.max(1, Math.ceil(totalEvents / limit));
    const mapped: EventsPayload = {
      body: events.map(mapEvent),
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
