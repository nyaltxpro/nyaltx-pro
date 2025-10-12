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
    const convertedOnchainOrders: Order[] = onchainOrders.map((order: any) => {
      // Extract token information from the order or derive from tier
      let tokenSymbol = order.tokenSymbol;
      let tokenName = order.tokenName;
      
      // If no token info, derive from tier or method
      if (!tokenSymbol && order.tierId) {
        tokenSymbol = order.tierId.toUpperCase();
        tokenName = `Race to Liberty - ${order.tierId.charAt(0).toUpperCase() + order.tierId.slice(1)}`;
      } else if (!tokenSymbol && order.method) {
        tokenSymbol = order.method.toUpperCase();
        tokenName = order.method === 'ETH' ? 'Ethereum' : 'NYAX Token';
      }
      
      return {
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
        tokenSymbol: tokenSymbol,
        tokenName: tokenName,
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: order.createdAt || new Date().toISOString(),
        completedAt: order.createdAt || new Date().toISOString(),
        metadata: {
          source: 'onchain_orders',
          originalData: order
        }
      };
    });

    // Get boost points data
    const boostPointsCollection = await getCollection('boost_points');
    const boostPoints = await boostPointsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert boost points to orders
    const convertedBoostOrders: Order[] = boostPoints.map((boost: any) => {
      // Extract token information from boost points
      let tokenSymbol = boost.tokenSymbol;
      let tokenName = boost.tokenName;
      
      // If no token info, derive from pack type or payment method
      if (!tokenSymbol && boost.packType) {
        tokenSymbol = boost.packType.toUpperCase();
        tokenName = `Boost Pack - ${boost.packType.charAt(0).toUpperCase() + boost.packType.slice(1)}`;
      } else if (!tokenSymbol && boost.paymentMethod) {
        tokenSymbol = boost.paymentMethod.toUpperCase();
        tokenName = boost.paymentMethod === 'eth' ? 'Ethereum' : boost.paymentMethod === 'nyax' ? 'NYAX Token' : boost.paymentMethod.toUpperCase();
      }
      
      return {
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
        tokenSymbol: tokenSymbol,
        tokenName: tokenName,
        createdAt: boost.createdAt || new Date().toISOString(),
        updatedAt: boost.createdAt || new Date().toISOString(),
        completedAt: boost.createdAt || new Date().toISOString(),
        metadata: {
          source: 'boost_points',
          points: boost.points,
          decayHours: boost.decayHours,
          originalData: boost
        }
      };
    });

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
      paymentMethod: token.paymentMethod || 'free_promo',
      amount: token.paymentAmount || '0',
      currency: token.paymentCurrency || 'USD',
      walletAddress: token.submittedByAddress,
      email: token.userEmail,
      productName: `Token Registration - ${token.tokenSymbol}`,
      tokenSymbol: token.tokenSymbol,
      tokenName: token.tokenName,
      createdAt: token.createdAt || new Date().toISOString(),
      updatedAt: token.updatedAt || token.createdAt || new Date().toISOString(),
      completedAt: token.status === 'approved' ? token.updatedAt : undefined,
      paymentId: token.paymentId,
      tier: token.tier,
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
        paymentMethod: token.paymentMethod,
        paymentId: token.paymentId,
        tier: token.tier,
        originalData: token
      }
    }));

    // Get subscription orders data
    const subscriptionOrdersCollection = await getCollection('subscription_orders');
    const subscriptionOrders = await subscriptionOrdersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert subscription orders to orders
    const convertedSubscriptionOrders: Order[] = subscriptionOrders.map((sub: any) => {
      // Extract token information from tier or metadata
      let tokenSymbol = sub.tokenSymbol;
      let tokenName = sub.tokenName;
      
      // If no token info in subscription, try to derive from tier or plan
      if (!tokenSymbol && sub.tier && ['paddle', 'motor', 'helicopter', 'kayak'].includes(sub.tier.toLowerCase())) {
        // This is a Race to Liberty subscription
        tokenSymbol = sub.tier.toUpperCase();
        tokenName = `Race to Liberty - ${sub.tier.charAt(0).toUpperCase() + sub.tier.slice(1)}`;
      } else if (!tokenSymbol && sub.plan === 'pro') {
        // This is a NYALTX Pro subscription
        tokenSymbol = 'NYALTXPRO';
        tokenName = 'NYALTX Pro Subscription';
      } else if (!tokenSymbol) {
        // Generic fallback
        tokenSymbol = (sub.plan || sub.tier || 'UNKNOWN').toUpperCase();
        tokenName = `Subscription - ${sub.plan || sub.tier || 'Unknown'}`;
      }
      
      return {
        id: `subscription_${sub._id || sub.id}`,
        type: 'pro_subscription' as const,
        status: sub.status === 'active' ? 'completed' : sub.status === 'inactive' ? 'failed' : 'pending',
        paymentMethod: sub.paymentMethod || 'stripe',
        amount: sub.amount || '0',
        currency: sub.currency || 'USD',
        walletAddress: sub.userId,
        email: sub.email,
        productName: `Pro Subscription - ${sub.plan || 'Pro'}`,
        tokenSymbol: tokenSymbol,
        tokenName: tokenName,
        tier: sub.tier,
        promoCode: sub.promoCode,
        createdAt: sub.createdAt || new Date().toISOString(),
        updatedAt: sub.updatedAt || sub.createdAt || new Date().toISOString(),
        completedAt: sub.status === 'active' ? sub.createdAt : undefined,
        metadata: {
          source: 'subscription_orders',
          plan: sub.plan,
          expiresAt: sub.expiresAt,
          refundStatus: sub.refundStatus,
          refundAmount: sub.refundAmount,
          refundDate: sub.refundDate,
          originalData: sub
        }
      };
    });

    // Combine all orders
    let allOrders = [...mainOrders, ...convertedOnchainOrders, ...convertedBoostOrders, ...convertedTokenOrders, ...convertedSubscriptionOrders];

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
        subscriptionOrders: convertedSubscriptionOrders.length,
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
