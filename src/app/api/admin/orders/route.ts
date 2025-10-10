import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getCollection } from '@/lib/mongodb';

// Comprehensive order interface covering all payment types
export interface Order {
  id: string;
  type: 'race_to_liberty' | 'boost_pack' | 'pro_subscription' | 'token_registration';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Payment details
  paymentMethod: 'eth' | 'sol' | 'nyax' | 'paypal' | 'stripe' | 'free_promo';
  amount: string;
  currency: 'USD' | 'ETH' | 'SOL' | 'NYAX';
  
  // Blockchain details (for crypto payments)
  txHash?: string;
  chainId?: number;
  walletAddress?: string;
  
  // PayPal/Stripe details
  paymentId?: string;
  
  // Customer details
  email?: string;
  userId?: string;
  
  // Product details
  productId?: string;
  productName?: string;
  tier?: string;
  tokenSymbol?: string;
  tokenName?: string;
  
  // Promo code details
  promoCode?: string;
  promoDiscount?: number;
  originalAmount?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get orders from main orders collection
    const ordersCollection = await getCollection<Order>('orders');
    
    // Build filter for main orders
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const mainOrders = await ordersCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Get onchain orders and convert to standard format
    const onchainCollection = await getCollection('onchain_orders');
    const onchainOrders = await onchainCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert onchain orders to standard Order format
    const convertedOnchainOrders: Order[] = onchainOrders.map((order: any) => ({
      id: order.id || `onchain_${order._id}`,
      type: 'race_to_liberty' as const,
      status: 'completed' as const,
      paymentMethod: order.method?.toLowerCase() === 'eth' ? 'eth' : 'nyax',
      amount: order.amount || '0',
      currency: order.method === 'ETH' ? 'ETH' : 'NYAX',
      txHash: order.txHash,
      chainId: order.chainId,
      walletAddress: order.wallet,
      productName: `Race to Liberty - ${order.tierId || 'Unknown Tier'}`,
      tier: order.tierId,
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: order.createdAt || new Date().toISOString(),
      completedAt: order.createdAt || new Date().toISOString(),
      metadata: {
        source: 'onchain_orders',
        originalData: order
      }
    }));

    // Get boost points data
    const boostPointsCollection = await getCollection('boost_points');
    const boostPoints = await boostPointsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert boost points to orders
    const convertedBoostOrders: Order[] = boostPoints.map((boost: any) => ({
      id: `boost_${boost._id}`,
      type: 'boost_pack' as const,
      status: 'completed' as const,
      paymentMethod: boost.paymentMethod || 'unknown',
      amount: boost.amount?.toString() || '0',
      currency: boost.currency || 'USD',
      txHash: boost.txHash,
      walletAddress: boost.walletAddress,
      productName: `Boost Pack - ${boost.packType || 'Unknown'}`,
      tier: boost.packType,
      tokenSymbol: boost.tokenSymbol,
      createdAt: boost.createdAt || new Date().toISOString(),
      updatedAt: boost.createdAt || new Date().toISOString(),
      completedAt: boost.createdAt || new Date().toISOString(),
      metadata: {
        source: 'boost_points',
        points: boost.points,
        decayHours: boost.decayHours,
        originalData: boost
      }
    }));

    // Get token registrations data
    const tokenRegistrationsCollection = await getCollection('token_registrations');
    const tokenRegistrations = await tokenRegistrationsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert token registrations to orders
    const convertedTokenOrders: Order[] = tokenRegistrations.map((token: any) => ({
      id: `token_${token._id || token.id}`,
      type: 'token_registration' as const,
      status: token.status === 'approved' ? 'completed' : token.status === 'rejected' ? 'failed' : 'pending',
      paymentMethod: 'free_promo' as const, // Token registrations are free
      amount: '0',
      currency: 'USD' as const,
      walletAddress: token.submittedByAddress,
      email: token.userEmail,
      productName: `Token Registration - ${token.tokenSymbol}`,
      tokenSymbol: token.tokenSymbol,
      tokenName: token.tokenName,
      createdAt: token.createdAt || new Date().toISOString(),
      updatedAt: token.updatedAt || token.createdAt || new Date().toISOString(),
      completedAt: token.status === 'approved' ? token.updatedAt : undefined,
      metadata: {
        source: 'token_registrations',
        blockchain: token.blockchain,
        contractAddress: token.contractAddress,
        imageUri: token.imageUri,
        website: token.website,
        twitter: token.twitter,
        telegram: token.telegram,
        discord: token.discord,
        github: token.github,
        originalData: token
      }
    }));

    // Combine all orders
    let allOrders = [...mainOrders, ...convertedOnchainOrders, ...convertedBoostOrders, ...convertedTokenOrders];

    // Apply filters to combined data
    if (type) {
      allOrders = allOrders.filter(order => order.type === type);
    }
    if (status) {
      allOrders = allOrders.filter(order => order.status === status);
    }

    // Sort by creation date (newest first)
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const paginatedOrders = allOrders.slice(offset, offset + limit);
    const total = allOrders.length;

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      sources: {
        mainOrders: mainOrders.length,
        onchainOrders: convertedOnchainOrders.length,
        boostOrders: convertedBoostOrders.length,
        tokenOrders: convertedTokenOrders.length,
        total: allOrders.length
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderData = await req.json();
    
    // Validate required fields
    if (!orderData.type || !orderData.paymentMethod || !orderData.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: type, paymentMethod, amount' },
        { status: 400 }
      );
    }

    const collection = await getCollection<Order>('orders');
    
    const order: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      ...orderData
    };

    await collection.insertOne(order);

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
