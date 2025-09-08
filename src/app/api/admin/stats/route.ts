import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import Stripe from 'stripe';

const dataPath = (file: string) => path.join(process.cwd(), 'src', 'app', 'data', file);

export async function GET() {
  const c = await cookies();
  if (c.get('admin_auth')?.value !== '1') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Load local JSON resources (best-effort)
  const readJson = async (file: string) => {
    try {
      const content = await fs.readFile(dataPath(file), 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  };

  const [profiles, onchainOrders, campaigns] = await Promise.all([
    readJson('admin-profiles.json'),
    readJson('admin-onchain-orders.json'),
    readJson('admin-campaigns.json'),
  ]);

  // Stripe totals (best-effort)
  let stripeTotalCents = 0;
  let stripeCount = 0;
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (stripeSecret) {
      const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' as any });
      // You can use created and limit filters as needed
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      stripeCount = sessions.data.length;
      stripeTotalCents = sessions.data.reduce((sum, s) => sum + (s.amount_total || 0), 0);
    }
  } catch {
    // ignore stripe errors in stats to avoid breaking the dashboard
  }

  const result = {
    profiles: {
      count: Array.isArray(profiles) ? profiles.length : 0,
      active: Array.isArray(profiles) ? profiles.filter((p: any) => p.status === 'active').length : 0,
    },
    orders: {
      stripe: {
        count: stripeCount,
        totalUSD: +(stripeTotalCents / 100).toFixed(2),
      },
      onchain: {
        count: Array.isArray(onchainOrders) ? onchainOrders.length : 0,
      },
    },
    campaigns: {
      count: Array.isArray(campaigns) ? campaigns.length : 0,
      active: Array.isArray(campaigns)
        ? campaigns.filter((c: any) => new Date(c.startDate) <= new Date() && new Date(c.endDate) >= new Date()).length
        : 0,
    },
  };

  return NextResponse.json({ data: result });
}
