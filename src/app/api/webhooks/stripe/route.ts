import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Stripe webhook removed' }, { status: 410 });
}
