import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { hashPassword } from '@/lib/passwords';

// POST /api/admin/users/seed
// Body: { username?: string, email?: string, password?: string, token?: string }
// Requires ADMIN_SEED_TOKEN env to authorize seeding.
export async function POST(req: NextRequest) {
  const { username, email, password, token } = await req.json().catch(() => ({}));

  const seedToken = process.env.ADMIN_SEED_TOKEN;
  if (!seedToken || token !== seedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await getCollection<any>('users');

  const uname = (username && typeof username === 'string' ? username : 'admin').trim();
  const mail = (email && typeof email === 'string' ? email : 'admin@example.com').trim();
  const pass = (password && typeof password === 'string' ? password : (process.env.ADMIN_PASSWORD || 'admin123')).trim();

  const usernameLower = uname.toLowerCase();
  const emailLower = mail.toLowerCase();

  // Ensure indexes (idempotent)
  await users.createIndex({ usernameLower: 1 }, { unique: true, sparse: true, name: 'uniq_usernameLower' });
  await users.createIndex({ emailLower: 1 }, { unique: true, sparse: true, name: 'uniq_emailLower' });

  const existing = await users.findOne({ $or: [ { usernameLower }, { emailLower } ], role: 'admin' });
  if (existing) {
    return NextResponse.json({ ok: true, message: 'Admin already exists', user: { username: existing.username, email: existing.email } });
  }

  const passwordHash = await hashPassword(pass);
  const now = new Date().toISOString();
  const user = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    role: 'admin' as const,
    username: uname,
    usernameLower,
    email: mail,
    emailLower,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  await users.insertOne(user);
  return NextResponse.json({ ok: true, user: { username: user.username, email: user.email } });
}
