import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import {
  getPayPalCryptoAccessToken,
  PayPalCryptoAuthenticationError,
  PayPalCryptoConfigurationError,
} from '@/lib/paypalCryptoApi';

interface CryptoOrderRecord {
  state: string;
  paypalOrderId: string;
  amount: string;
  currency: 'USD';
  status: 'creating' | 'pending' | 'completed' | 'failed';
  captureId?: string;
  updatedAt?: Date;
}

interface PayPalOrderDetails {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: { captures?: Array<{ id?: string; status?: string }> };
  }>;
  payment_source?: { crypto?: Record<string, unknown> };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId || orderId.length > 64) {
      return NextResponse.json({ error: 'Invalid PayPal crypto order ID.' }, { status: 400 });
    }

    const records = await getCollection<CryptoOrderRecord>('paypal_crypto_orders');
    const record = await records.findOne({ paypalOrderId: orderId });
    if (!record) {
      return NextResponse.json({ error: 'PayPal crypto order was not found.' }, { status: 404 });
    }
    if (record.status === 'failed') {
      return NextResponse.json(
        { error: 'PayPal reported that this crypto payment failed.', status: 'FAILED' },
        { status: 402 },
      );
    }
    if (record.status === 'completed') {
      return NextResponse.json({
        success: true,
        order: { id: orderId, status: 'COMPLETED' },
        paymentSource: 'paypal_crypto',
      });
    }

    const { accessToken, apiBaseUrl } = await getPayPalCryptoAccessToken();
    const response = await fetch(
      `${apiBaseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        cache: 'no-store',
      },
    );
    if (!response.ok) {
      console.error('PayPal crypto order verification failed with status:', response.status);
      return NextResponse.json(
        { error: 'Could not verify the PayPal crypto payment. Please try again.' },
        { status: 502 },
      );
    }

    const order: PayPalOrderDetails = await response.json();
    const purchaseUnit = order.purchase_units?.[0];
    if (
      order.id !== record.paypalOrderId ||
      !purchaseUnit ||
      !purchaseUnit.amount ||
      purchaseUnit.custom_id !== record.state ||
      purchaseUnit.amount.currency_code !== record.currency ||
      purchaseUnit.amount.value !== record.amount
    ) {
      console.error('PayPal crypto order verification did not match the stored order.');
      return NextResponse.json({ error: 'PayPal order details did not match this checkout.' }, { status: 400 });
    }

    if (order.status?.toUpperCase() !== 'COMPLETED') {
      return NextResponse.json(
        {
          error: 'PayPal has not confirmed this crypto payment yet.',
          status: order.status || 'UNKNOWN',
        },
        { status: 409 },
      );
    }

    await records.updateOne(
      { state: record.state, status: { $ne: 'completed' } },
      {
        $set: {
          status: 'completed',
          captureId: purchaseUnit?.payments?.captures?.find(
            capture => capture.status?.toUpperCase() === 'COMPLETED',
          )?.id,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({ success: true, order, paymentSource: 'paypal_crypto' });
  } catch (error) {
    if (error instanceof PayPalCryptoConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof PayPalCryptoAuthenticationError) {
      return NextResponse.json(
        {
          error: error.message,
          diagnostic: {
            paypalStatus: error.status,
            paypalError: error.paypalError,
            environment: error.environment,
          },
        },
        { status: 502 },
      );
    }
    console.error('PayPal crypto payment verification error:', error);
    return NextResponse.json(
      { error: 'Could not verify the PayPal crypto payment. Please try again.' },
      { status: 500 },
    );
  }
}
