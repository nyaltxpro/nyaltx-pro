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
};

export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const col = await getCollection<SubscriptionOrder>('subscription_orders');
  const data = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { userId, email, plan, status, paymentMethod, amount, currency, expiresAt } = body || {};
  
  if (!plan || !status || !paymentMethod) {
    return NextResponse.json({ error: 'Missing required fields: plan, status, paymentMethod' }, { status: 400 });
  }

  const col = await getCollection<SubscriptionOrder>('subscription_orders');
  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  
  const order: SubscriptionOrder = {
    id,
    type: 'pro_subscription',
    userId,
    email,
    plan,
    status,
    paymentMethod,
    amount,
    currency,
    createdAt,
    expiresAt
  };

  await col.insertOne(order);
  const data = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ data });
}
