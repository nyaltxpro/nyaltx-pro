import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  const c = await cookies();
  const isAuthed = c.get('admin_auth')?.value === '1';
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' as any });
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    return NextResponse.json({
      id: session.id,
      status: session.status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: (session.customer_details && 'email' in session.customer_details) ? (session.customer_details as any).email : null,
      created: session.created,
      metadata: session.metadata || {},
      payment_intent: session.payment_intent,
      payment_status: session.payment_status,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Retrieve error' }, { status: 500 });
  }
}
