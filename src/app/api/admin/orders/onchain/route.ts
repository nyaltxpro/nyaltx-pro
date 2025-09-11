import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getCollection } from '@/lib/mongodb';

type OnchainOrder = {
  id: string;
  method: 'ETH' | 'NYAX';
  tierId: 'paddle' | 'motor' | 'helicopter';
  wallet: string;
  txHash: string;
  amount: string;
  chainId: number;
  createdAt: string;
};

export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const col = await getCollection<OnchainOrder>('onchain_orders');
  const data = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { method, tierId, wallet, txHash, amount, chainId } = body || {};
  if (!method || !tierId || !wallet || !txHash || !amount || !chainId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const col = await getCollection<OnchainOrder>('onchain_orders');
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  await col.insertOne({ id, method, tierId, wallet, txHash, amount, chainId, createdAt });
  const data = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ data });
}
