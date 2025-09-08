import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const TIERS: Record<string, { name: string; priceUSD: number; description: string }> = {
  paddle: { name: 'Paddle Boat', description: '1 week on Recently Updated.', priceUSD: 300 },
  motor: { name: 'Motor Boat', description: '1 month placement.', priceUSD: 500 },
  helicopter: { name: 'Helicopter', description: '3 months placement.', priceUSD: 700 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tierId: string | undefined = body?.tierId;
    if (!tierId || !TIERS[tierId]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' as any });

    const origin = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || '';
    const successUrl = `${origin}/pricing?status=success&tier=${tierId}`;
    const cancelUrl = `${origin}/pricing?status=cancelled&tier=${tierId}`;

    const tier = TIERS[tierId];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: tier.description,
            },
            unit_amount: tier.priceUSD * 100, // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        tierId,
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (e: any) {
    console.error('Checkout error', e);
    return NextResponse.json({ error: e?.message || 'Checkout error' }, { status: 500 });
  }
}
