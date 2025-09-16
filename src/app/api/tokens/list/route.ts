import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  // Parse query params first so both primary and fallback paths can use them
  const limit = Math.min(1000, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || '20', 10)));
  const statusRaw = req.nextUrl.searchParams.get('status');
  const status = (statusRaw ? statusRaw : 'approved').toLowerCase();
  const all = req.nextUrl.searchParams.get('all') === '1';

  try {

    const col = await getCollection<any>('token_registrations');
    const query: any = {};
    if (!all && ['approved', 'pending', 'rejected'].includes(status)) {
      query.status = status;
      // Hide paused tokens by default on public feeds
      query.paused = { $ne: true };
    }

    const data = await col
      .find(query)
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ data });
  } catch (e) {
    console.error('tokens/list error', e);
    // Fallback: read from nyax-tokens-data.json to keep UI populated when DB is down
    try {
      const file = path.join(process.cwd(), 'nyax-tokens-data.json');
      const raw = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(raw);
      const tokens = Array.isArray(json?.tokens) ? json.tokens : [];
      // Map NYAX entries to listing shape and filter entries missing contract
      const mapNetworkToChain = (network?: string) => {
        if (!network) return undefined;
        const key = String(network).toLowerCase();
        const mapping: Record<string, string> = {
          'ethereum': 'ethereum',
          'eth': 'ethereum',
          'erc20': 'ethereum',
          'bsc': 'binance',
          'binance': 'binance',
          'binance smart chain': 'binance',
          'polygon': 'polygon',
          'matic': 'polygon',
          'avalanche': 'avalanche',
          'avax': 'avalanche',
          'fantom': 'fantom',
          'base': 'base',
          'arbitrum': 'arbitrum',
          'arbitrum one': 'arbitrum',
          'optimism': 'optimism',
          'solana': 'solana',
        };
        return mapping[key] || key;
      };

      const mapped = tokens
        .filter((t: any) => t?.contractAddress)
        .map((t: any) => ({
          id: `nyax-${t.logoId || t.contractAddress}`,
          tokenName: t.name || t.symbol || 'Unknown',
          tokenSymbol: (t.symbol || '').toUpperCase(),
          blockchain: mapNetworkToChain(t.network) || 'ethereum',
          contractAddress: t.contractAddress,
          imageUri: t.logo || undefined,
          website: t.website || undefined,
          status: 'approved',
          createdAt: json?.scrapedAt || new Date().toISOString(),
        }))
        .slice(0, limit);

      return NextResponse.json({ data: mapped });
    } catch (fallbackError) {
      console.error('tokens/list fallback error', fallbackError);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  }
}
