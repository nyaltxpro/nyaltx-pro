import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Order } from '@/app/api/admin/orders/route';

// Public endpoint for creating orders (no admin auth required)
export async function POST(req: NextRequest) {
  try {
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
      status: orderData.status || 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: orderData.status === 'completed' ? new Date().toISOString() : undefined,
      ...orderData
    };

    await collection.insertOne(order);

    console.log('✅ Order created successfully:', order.id);

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
