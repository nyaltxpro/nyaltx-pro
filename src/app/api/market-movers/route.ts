import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import {
  MarketMoversSnapshot,
  StoredMarketMoverCoin,
} from '@/types/marketMovers';

const SNAPSHOT_COLLECTION = 'market_movers_snapshots';

function selectList(
  snapshot: MarketMoversSnapshot,
  type: 'gainers' | 'losers' | 'volume' | 'all'
) {
  switch (type) {
    case 'gainers':
      return snapshot.topGainers;
    case 'losers':
      return snapshot.topLosers;
    case 'volume':
      return snapshot.topVolume;
    default:
      return [
        ...(snapshot.topGainers ?? []),
        ...(snapshot.topLosers ?? []),
        ...(snapshot.topVolume ?? []),
      ].filter(Boolean);
  }
}

function sanitizeCoins(
  coins: StoredMarketMoverCoin[] = [],
  limit: number
): StoredMarketMoverCoin[] {
  return coins.slice(0, limit).map(coin => ({
    ...coin,
    contractAddresses: coin.contractAddresses ?? {},
    primaryChain: coin.primaryChain ?? null,
    primaryAddress: coin.primaryAddress ?? null,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = (searchParams.get('type') || 'gainers').toLowerCase();
    const limitParam = parseInt(searchParams.get('limit') || '10', 10);

    const type = ['gainers', 'losers', 'volume', 'all'].includes(typeParam)
      ? (typeParam as 'gainers' | 'losers' | 'volume' | 'all')
      : 'gainers';

    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 10;

    const collection = await getCollection<MarketMoversSnapshot>(SNAPSHOT_COLLECTION);

    const snapshot = await collection.find().sort({ createdAt: -1 }).limit(1).next();

    if (!snapshot) {
      return NextResponse.json(
        {
          success: false,
          error: 'No market mover data available yet. Trigger the sync endpoint to populate data.',
        },
        { status: 404 }
      );
    }

    const selectedCoins = sanitizeCoins(selectList(snapshot, type), limit);

    return NextResponse.json({
      success: true,
      snapshot: {
        createdAt: snapshot.createdAt,
        source: snapshot.source,
        coinsFetched: snapshot.coinsFetched,
        gainersCount: snapshot.topGainers?.length ?? 0,
        losersCount: snapshot.topLosers?.length ?? 0,
        volumeCount: snapshot.topVolume?.length ?? 0,
      },
      data:
        type === 'all'
          ? {
              gainers: sanitizeCoins(snapshot.topGainers, limit),
              losers: sanitizeCoins(snapshot.topLosers, limit),
              volume: sanitizeCoins(snapshot.topVolume, limit),
            }
          : selectedCoins,
      type,
      limit,
      total:
        type === 'all'
          ? {
              gainers: snapshot.topGainers?.length ?? 0,
              losers: snapshot.topLosers?.length ?? 0,
              volume: snapshot.topVolume?.length ?? 0,
            }
          : selectedCoins.length,
    });
  } catch (error) {
    console.error('Market movers query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
