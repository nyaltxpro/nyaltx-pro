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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const collection = await getCollection<Order>('orders');
    
    // Build filter
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Get orders with pagination
    const orders = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Get total count
    const total = await collection.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
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
