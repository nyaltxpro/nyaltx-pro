import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getCollection } from '@/lib/mongodb';

type SubscriptionOrder = {
  id: string;
  type: 'pro_subscription';
  userId?: string;
  email?: string;
  plan: 'pro';
  status: 'active' | 'inactive' | 'pending';
  paymentMethod: 'stripe' | 'demo' | 'other';
  amount?: string;
  currency?: string;
  createdAt: string;
  expiresAt?: string;
  refundStatus?: 'none' | 'requested' | 'processing' | 'completed' | 'failed';
  refundAmount?: string;
  refundDate?: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { amount } = body || {};

  if (!id) {
    return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
  }

  try {
    const col = await getCollection<SubscriptionOrder>('subscription_orders');
    
    // Find the subscription
    const subscription = await col.findOne({ id });
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Check if already refunded
    if (subscription.refundStatus === 'completed') {
      return NextResponse.json({ error: 'Subscription already refunded' }, { status: 400 });
    }

    // Check if it's a stripe payment (only stripe payments can be refunded automatically)
    if (subscription.paymentMethod !== 'stripe') {
      return NextResponse.json({ 
        error: 'Only Stripe payments can be refunded through this system' 
      }, { status: 400 });
    }

    // For demo purposes, we'll simulate the refund process
    // In a real implementation, you would integrate with Stripe's refund API
    const refundAmount = amount || subscription.amount;
    const refundDate = new Date().toISOString();

    // Update the subscription with refund information
    const updateResult = await col.updateOne(
      { id },
      {
        $set: {
          refundStatus: 'completed',
          refundAmount,
          refundDate,
          status: 'inactive' // Mark subscription as inactive after refund
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    // In a real implementation, you would call Stripe API here:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const refund = await stripe.refunds.create({
    //   payment_intent: subscription.stripePaymentIntentId,
    //   amount: Math.round(parseFloat(refundAmount) * 100), // Convert to cents
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'Refund processed successfully',
      refundAmount,
      refundDate
    });

  } catch (error: any) {
    console.error('Refund processing error:', error);
    
    // If there was an error, mark the refund as failed
    try {
      const col = await getCollection<SubscriptionOrder>('subscription_orders');
      await col.updateOne(
        { id },
        {
          $set: {
            refundStatus: 'failed',
            refundDate: new Date().toISOString()
          }
        }
      );
    } catch (updateError) {
      console.error('Failed to update refund status to failed:', updateError);
    }

    return NextResponse.json({ 
      error: 'Failed to process refund: ' + error.message 
    }, { status: 500 });
  }
}
