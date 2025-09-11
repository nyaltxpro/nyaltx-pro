import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'address is required' }, { status: 400 });

  try {
    const col = await getCollection<any>('token_registrations');
    const addrLower = address.toLowerCase();
    const data = await col
      .find({ submittedByAddressLower: addrLower })
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ data });
  } catch (e) {
    console.error('by-user list error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
