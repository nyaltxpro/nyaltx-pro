import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'src', 'app', 'data', 'admin-onchain-orders.json');

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

async function readAll(): Promise<OnchainOrder[]> {
  try {
    const content = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

async function writeAll(data: OnchainOrder[]) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const c = await cookies();
  const isAuthed = c.get('admin_auth')?.value === '1';
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await readAll();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const c = await cookies();
  const isAuthed = c.get('admin_auth')?.value === '1';
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { method, tierId, wallet, txHash, amount, chainId } = body || {};
  if (!method || !tierId || !wallet || !txHash || !amount || !chainId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const all = await readAll();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  all.unshift({ id, method, tierId, wallet, txHash, amount, chainId, createdAt });
  await writeAll(all);
  return NextResponse.json({ data: all });
}
