import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const c = await cookies();
  const isAuthed = c.get('admin_auth')?.value === '1';
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ error: 'Stripe endpoint removed' }, { status: 410 });
}
