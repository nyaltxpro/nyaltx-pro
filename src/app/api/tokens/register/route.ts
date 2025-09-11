import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export type TokenRegistration = {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  contractAddress: string;
  contractAddressLower?: string;
  submittedByAddress?: string;
  submittedByAddressLower?: string;
  imageUri?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const required = ['tokenName', 'tokenSymbol', 'blockchain', 'contractAddress'];
    for (const k of required) {
      if (!body[k] || typeof body[k] !== 'string' || !body[k].trim()) {
        return NextResponse.json({ error: `${k} is required` }, { status: 400 });
      }
    }

    const now = new Date().toISOString();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const submittedBy: string | undefined = (body.submittedByAddress && typeof body.submittedByAddress === 'string') ? body.submittedByAddress.trim() : undefined;

    const record: TokenRegistration = {
      id,
      tokenName: body.tokenName.trim(),
      tokenSymbol: body.tokenSymbol.trim(),
      blockchain: body.blockchain.trim(),
      contractAddress: body.contractAddress.trim(),
      contractAddressLower: body.contractAddress.trim().toLowerCase(),
      submittedByAddress: submittedBy,
      submittedByAddressLower: submittedBy ? submittedBy.toLowerCase() : undefined,
      imageUri: body.imageUri?.trim() || undefined,
      website: body.website?.trim() || undefined,
      twitter: body.twitter?.trim() || undefined,
      telegram: body.telegram?.trim() || undefined,
      discord: body.discord?.trim() || undefined,
      github: body.github?.trim() || undefined,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const col = await getCollection<any>('token_registrations');
    // Ensure unique index once (idempotent)
    await col.createIndex({ blockchain: 1, contractAddressLower: 1 }, { unique: true, name: 'uniq_chain_addrLower' });
    // Prevent duplicate per chain by contract address (case-insensitive for EVM)
    const dup = await col.findOne({ blockchain: record.blockchain, contractAddressLower: record.contractAddressLower });
    if (dup) {
      return NextResponse.json({ error: 'A registration for this contract already exists', existing: dup }, { status: 409 });
    }

    await col.insertOne(record);

    return NextResponse.json({ ok: true, record });
  } catch (e) {
    console.error('Register token error', e);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
