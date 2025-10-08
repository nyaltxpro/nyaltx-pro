import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address: addressParam } = await params;
    const address = addressParam?.toLowerCase();
    const { searchParams } = new URL(req.url);
    const blockchain = searchParams.get('blockchain');
    const checkExists = searchParams.get('checkExists') === 'true';

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    // Try to fetch from MongoDB first
    try {
      const col = await getCollection<any>('token_registrations');

      // If checking for existence (for duplicate prevention), check all statuses
      const query: any = { contractAddressLower: address };
      if (blockchain) {
        query.blockchain = blockchain;
      }
      if (!checkExists) {
        // For normal lookups, only return approved and non-paused tokens
        query.status = 'approved';
        query.paused = { $ne: true };
      }

      // Search by contract address (case-insensitive)
      const token = await col.findOne(query);

      if (token) {
        // If just checking for existence, return simple response
        if (checkExists) {
          return NextResponse.json({
            exists: true,
            status: token.status,
            tokenName: token.tokenName,
            tokenSymbol: token.tokenSymbol,
          });
        }

        // Return full token data for normal lookups
        return NextResponse.json({
          id: token.id,
          tokenName: token.tokenName,
          tokenSymbol: token.tokenSymbol,
          blockchain: token.blockchain,
          contractAddress: token.contractAddress,
          imageUri: token.imageUri,
          // Only include social links if admin has enabled them (default to true if not set)
          website: token.showWebsite !== false ? token.website : undefined,
          twitter: token.showTwitter !== false ? token.twitter : undefined,
          telegram: token.showTelegram !== false ? token.telegram : undefined,
          discord: token.showDiscord !== false ? token.discord : undefined,
          github: token.showGithub !== false ? token.github : undefined,
          youtube: token.youtube, // YouTube doesn't have admin toggle yet
          status: token.status,
          createdAt: token.createdAt,
        });
      }
    } catch (dbError) {
      console.error('Database error in by-address:', dbError);
    }

    // Fallback: search in nyax-tokens-data.json
    try {
      const file = path.join(process.cwd(), 'nyax-tokens-data.json');
      const raw = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(raw);
      const tokens = Array.isArray(json?.tokens) ? json.tokens : [];

      const token = tokens.find((t: any) => t?.contractAddress?.toLowerCase() === address);

      if (token) {
        return NextResponse.json({
          id: `nyax-${token.logoId || token.contractAddress}`,
          tokenName: token.name || token.symbol || 'Unknown',
          tokenSymbol: (token.symbol || '').toUpperCase(),
          blockchain: token.network?.toLowerCase() || 'ethereum',
          contractAddress: token.contractAddress,
          imageUri: token.logo,
          website: token.website,
          twitter: token.twitter,
          telegram: token.telegram,
          discord: token.discord,
          github: token.github,
          youtube: token.youtube,
          status: 'approved',
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error in by-address:', fallbackError);
    }

    // If checking for existence and not found, return exists: false
    if (checkExists) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  } catch (error) {
    console.error('Error in by-address API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
