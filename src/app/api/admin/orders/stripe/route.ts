import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';

export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ error: 'Stripe endpoint removed' }, { status: 410 });
}
