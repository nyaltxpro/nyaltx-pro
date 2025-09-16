import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getAdminFromRequest } from '@/lib/adminAuth';

type Status = 'pending' | 'approved' | 'rejected';

export type TokenRegistration = {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  contractAddress: string;
  imageUri?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  // moderation
  status: Status;
  paused?: boolean;
  // social visibility flags (default true unless explicitly set false)
  showWebsite?: boolean;
  showTwitter?: boolean;
  showTelegram?: boolean;
  showDiscord?: boolean;
  showGithub?: boolean;
  createdAt: string;
  updatedAt: string;
};

async function requireAdmin() {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const status = (req.nextUrl.searchParams.get('status') as Status | null) || null;
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;

  const col = await getCollection<TokenRegistration>('token_registrations');
  const query = status ? { status } : {};
  const [total, data] = await Promise.all([
    col.countDocuments(query),
    col.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
  ]);
  return NextResponse.json({ data, page, limit, total });
}

export async function PUT(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id, status }: { id?: string; status?: Status } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'valid status required' }, { status: 400 });
  }

  const col = await getCollection<TokenRegistration>('token_registrations');
  const now = new Date().toISOString();
  const upd = await col.updateOne({ id }, { $set: { status, updatedAt: now } });
  if (upd.matchedCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const updated = await col.findOne({ id });
  const all = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ data: all, record: updated });
}

export async function DELETE(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const col = await getCollection<TokenRegistration>('token_registrations');
  await col.deleteOne({ id });
  const data = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ data });
}

// Partial updates: pause/unpause, social visibility toggles
export async function PATCH(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json().catch(() => ({} as any));
  const { id } = body as { id?: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const set: Record<string, any> = {};
  const now = new Date().toISOString();
  set.updatedAt = now;

  if (typeof body.paused === 'boolean') set.paused = body.paused;
  if (body.socials && typeof body.socials === 'object') {
    const s = body.socials as Record<string, any>;
    if (typeof s.website === 'boolean') set.showWebsite = s.website;
    if (typeof s.twitter === 'boolean') set.showTwitter = s.twitter;
    if (typeof s.telegram === 'boolean') set.showTelegram = s.telegram;
    if (typeof s.discord === 'boolean') set.showDiscord = s.discord;
    if (typeof s.github === 'boolean') set.showGithub = s.github;
  }

  if (Object.keys(set).length <= 1) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const col = await getCollection<TokenRegistration>('token_registrations');
  const upd = await col.updateOne({ id }, { $set: set });
  if (upd.matchedCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const record = await col.findOne({ id });
  return NextResponse.json({ record });
}
