import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getCollection } from '@/lib/mongodb';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Counts from MongoDB
  let usersCount = 0;
  let tokensRegisteredCount = 0;

  try {
    const usersCol = await getCollection('users');
    usersCount = await usersCol.countDocuments({});
  } catch {}

  try {
    const tokensCol = await getCollection('token_registrations');
    tokensRegisteredCount = await tokensCol.countDocuments({});
  } catch {}

  // Listings count from local JSON (nyax-tokens-data.json)
  let listingsCount = 0;
  try {
    const file = path.join(process.cwd(), 'nyax-tokens-data.json');
    const content = await fs.readFile(file, 'utf-8');
    const json = JSON.parse(content);
    listingsCount = Array.isArray(json?.tokens) ? json.tokens.length : 0;
  } catch {}

  // Memberships from profiles JSON where paidTier is not null
  let membershipsCount = 0;
  try {
    const profilesFile = path.join(process.cwd(), 'src', 'app', 'data', 'admin-profiles.json');
    const content = await fs.readFile(profilesFile, 'utf-8');
    const profiles = JSON.parse(content);
    if (Array.isArray(profiles)) {
      membershipsCount = profiles.filter((p: any) => p?.paidTier).length;
    }
  } catch {}

  return NextResponse.json({
    data: {
      membershipsCount,
      tokensRegisteredCount,
      usersCount,
      listingsCount,
    },
  });
}
