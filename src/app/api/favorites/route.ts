import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface Favorite {
  _id?: ObjectId;
  walletAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chainId: number;
  imageUri?: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const collection = await getCollection<Favorite>('favorites');
    const rawFavorites = await collection
      .find({ walletAddress: walletAddress.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    // Transform the data to match frontend interface
    const favorites = rawFavorites.map(fav => ({
      id: fav._id?.toString() || '',
      wallet_address: fav.walletAddress,
      token_address: fav.tokenAddress,
      token_symbol: fav.tokenSymbol,
      token_name: fav.tokenName,
      chain_id: fav.chainId,
      image_uri: fav.imageUri || null,
      created_at: fav.createdAt.toISOString()
    }));

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error in GET /api/favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, tokenAddress, tokenSymbol, tokenName, chainId, imageUri } = body;

    if (!walletAddress || !tokenAddress || !tokenSymbol || !tokenName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const collection = await getCollection<Favorite>('favorites');

    // Check if already favorited
    const existing = await collection.findOne({
      walletAddress: walletAddress.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
      chainId: chainId || 1
    });

    if (existing) {
      return NextResponse.json({ error: 'Token already favorited' }, { status: 409 });
    }

    const favorite: Favorite = {
      walletAddress: walletAddress.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
      tokenSymbol: tokenSymbol.toUpperCase(),
      tokenName: tokenName,
      chainId: chainId || 1,
      imageUri: imageUri || null,
      createdAt: new Date()
    };

    const result = await collection.insertOne(favorite);
    const insertedFavorite = await collection.findOne({ _id: result.insertedId });

    // Transform the data to match frontend interface
    const transformedFavorite = insertedFavorite ? {
      id: insertedFavorite._id?.toString() || '',
      wallet_address: insertedFavorite.walletAddress,
      token_address: insertedFavorite.tokenAddress,
      token_symbol: insertedFavorite.tokenSymbol,
      token_name: insertedFavorite.tokenName,
      chain_id: insertedFavorite.chainId,
      image_uri: insertedFavorite.imageUri || null,
      created_at: insertedFavorite.createdAt.toISOString()
    } : null;

    return NextResponse.json({ favorite: transformedFavorite });
  } catch (error) {
    console.error('Error in POST /api/favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const tokenAddress = searchParams.get('token');
    const chainId = searchParams.get('chain') || '1';

    if (!walletAddress || !tokenAddress) {
      return NextResponse.json({ error: 'Wallet address and token address are required' }, { status: 400 });
    }

    const collection = await getCollection<Favorite>('favorites');
    
    const result = await collection.deleteOne({
      walletAddress: walletAddress.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
      chainId: parseInt(chainId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
