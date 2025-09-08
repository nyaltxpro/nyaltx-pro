import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

export async function GET() {
  const c = await cookies();
  const isAuthed = c.get('admin_auth')?.value === '1';
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return NextResponse.json({ data: [] });

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' as any });
  const sessions = await stripe.checkout.sessions.list({ limit: 50 });
  const data = sessions.data.map((s: Stripe.Checkout.Session) => ({
    id: s.id,
    amount_total: s.amount_total,
    currency: s.currency,
    status: s.status,
    customer_email: (s.customer_details && 'email' in s.customer_details) ? (s.customer_details as any).email : null,
    created: s.created,
    metadata: s.metadata || {},
    url: s.url || null,
  }));
  return NextResponse.json({ data });
}
