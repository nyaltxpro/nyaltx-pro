import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    const col = await getCollection<any>('created_tokens');
    
    // Find all tokens created by this address
    const tokens = await col.find({ 
      createdByAddressLower: address.toLowerCase() 
    }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ 
      success: true, 
      data: tokens 
    });

  } catch (error) {
    console.error('Get created tokens error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
