import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { TokenRegistration } from '../register/route';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('address');
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    console.log('Fetching tokens for wallet:', walletAddress);

    const col = await getCollection<TokenRegistration>('token_registrations');
    
    // Find tokens submitted by this wallet address (case-insensitive)
    const tokens = await col.find({
      submittedByAddressLower: walletAddress.toLowerCase()
    }).toArray();

    console.log(`Found ${tokens.length} tokens for wallet ${walletAddress}`);

    // Transform the database format to match the frontend RegisteredToken interface
    const transformedTokens = tokens.map(token => ({
      id: token.id,
      name: token.tokenName,
      symbol: token.tokenSymbol,
      contractAddress: token.contractAddress,
      chain: token.blockchain,
      logo: token.imageUri,
      description: '', // Not stored in current schema
      website: token.website,
      twitter: token.twitter,
      telegram: token.telegram,
      userId: token.submittedByAddress || '',
      walletAddress: token.submittedByAddress || '',
      submittedByAddress: token.submittedByAddress,
      status: token.status,
      boostMultiplier: getBoostMultiplierByStatus(token.status), // Calculate based on status
      submittedAt: new Date(token.createdAt).getTime(),
      approvedAt: token.status === 'approved' ? new Date(token.updatedAt).getTime() : undefined,
      approvedBy: undefined, // Not stored in current schema
      rejectionReason: undefined // Not stored in current schema
    }));

    return NextResponse.json({
      success: true,
      tokens: transformedTokens,
      count: transformedTokens.length
    });

  } catch (error) {
    console.error('Error fetching tokens by wallet:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tokens: []
    }, { status: 500 });
  }
}

// Helper function to determine boost multiplier based on token status
function getBoostMultiplierByStatus(status: string): number {
  switch (status) {
    case 'approved':
      return 1.2; // 20% boost for approved tokens
    case 'pending':
      return 1.0; // No boost for pending tokens
    case 'rejected':
      return 1.0; // No boost for rejected tokens
    default:
      return 1.0;
  }
}
