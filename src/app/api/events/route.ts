import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.COINMARKETCAL_API_KEY || 'cmc_live_8ec39a5f0ba4914f5efdd7deeb5b7951';
const BASE_URL = 'https://api.coinmarketcal.com/v2/events';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageNum = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('max') || '50', 10) || 50, 1), 50);
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
      cache: 'no-store',
    });

    if (!response.ok) {
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

    return NextResponse.json({
      body: events.map(mapEvent),
      page: pageNum,
      totalPages,
      totalEvents,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
