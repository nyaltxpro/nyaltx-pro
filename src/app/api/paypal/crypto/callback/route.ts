import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

interface CryptoOrderRecord {
  state: string;
  paypalOrderId?: string;
  returnUrl: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const result = searchParams.get('result');
  const returnedOrderId = searchParams.get('token');

  if (!state || !['return', 'cancel'].includes(result || '')) {
    return NextResponse.redirect(new URL('/?paypalCryptoStatus=invalid', request.url));
  }

  try {
    const records = await getCollection<CryptoOrderRecord>('paypal_crypto_orders');
    const record = await records.findOne({ state });
    if (!record) {
      return NextResponse.redirect(new URL('/?paypalCryptoStatus=invalid', request.url));
    }

    const destination = new URL(record.returnUrl);
    if (result === 'return') {
      if (!returnedOrderId || returnedOrderId !== record.paypalOrderId) {
        destination.searchParams.set('paypalCryptoStatus', 'invalid');
      } else {
        destination.searchParams.set('paypalCryptoStatus', 'returned');
        destination.searchParams.set('paypalCryptoOrderId', returnedOrderId);
      }
    } else {
      destination.searchParams.set('paypalCryptoStatus', 'cancelled');
    }

    return NextResponse.redirect(destination);
  } catch (error) {
    console.error('PayPal crypto callback failed:', error);
    return NextResponse.redirect(new URL('/?paypalCryptoStatus=error', request.url));
  }
}
