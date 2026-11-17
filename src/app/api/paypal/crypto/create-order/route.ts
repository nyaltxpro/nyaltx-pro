import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import {
  getPayPalCryptoAccessToken,
  PayPalCryptoConfigurationError,
} from '@/lib/paypalCryptoApi';

interface PayPalLink {
  href: string;
  rel: string;
}

interface PayPalCreateOrderResponse {
  id?: string;
  status?: string;
  links?: PayPalLink[];
}

interface CryptoOrderRecord {
  state: string;
  paypalOrderId?: string;
  amount: string;
  currency: 'USD';
  tier: string;
  email?: string;
  returnUrl: string;
  status: 'creating' | 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const amountText = typeof body.amount === 'string' ? body.amount.trim() : String(body.amount);
    const givenName = typeof body.givenName === 'string' ? body.givenName.trim() : '';
    const surname = typeof body.surname === 'string' ? body.surname.trim() : '';
    const tier = typeof body.tier === 'string' ? body.tier.trim().slice(0, 127) : '';
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : '';

    if (body.usCustomerConfirmed !== true) {
      return NextResponse.json(
        { error: 'PayPal crypto checkout is currently available to eligible US customers only.' },
        { status: 400 },
      );
    }

    if (
      !/^\d+(?:\.\d{1,2})?$/.test(amountText) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 100000
    ) {
      return NextResponse.json({ error: 'Enter a valid payment amount.' }, { status: 400 });
    }
    if (!givenName || givenName.length > 140 || !surname || surname.length > 140) {
      return NextResponse.json(
        { error: 'Enter your first and last name to pay with crypto.' },
        { status: 400 },
      );
    }
    if (!tier) {
      return NextResponse.json({ error: 'The checkout item is missing.' }, { status: 400 });
    }

    if (typeof body.returnUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid checkout return URL.' }, { status: 400 });
    }
    let returnUrl: URL;
    try {
      returnUrl = new URL(body.returnUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid checkout return URL.' }, { status: 400 });
      return;
    }
    if (returnUrl.origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'Invalid checkout return URL.' }, { status: 400 });
    }
    returnUrl.hash = '';
    returnUrl.searchParams.delete('paypalCryptoStatus');
    returnUrl.searchParams.delete('paypalCryptoOrderId');

    const { accessToken, apiBaseUrl } = await getPayPalCryptoAccessToken();
    const state = randomUUID();
    const amountValue = amount.toFixed(2);
    const callbackUrl = new URL('/api/paypal/crypto/callback', request.nextUrl.origin);
    const returnCallbackUrl = new URL(callbackUrl);
    returnCallbackUrl.searchParams.set('state', state);
    returnCallbackUrl.searchParams.set('result', 'return');
    const cancelCallbackUrl = new URL(callbackUrl);
    cancelCallbackUrl.searchParams.set('state', state);
    cancelCallbackUrl.searchParams.set('result', 'cancel');

    const records = await getCollection<CryptoOrderRecord>('paypal_crypto_orders');
    const now = new Date();
    await records.insertOne({
      state,
      amount: amountValue,
      currency: 'USD',
      tier,
      email: email || undefined,
      returnUrl: returnUrl.toString(),
      status: 'creating',
      createdAt: now,
      updatedAt: now,
    });

    const paypalResponse = await fetch(`${apiBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': state,
      },
      body: JSON.stringify({
        processing_instruction: 'ORDER_COMPLETE_ON_PAYMENT_APPROVAL',
        intent: 'CAPTURE',
        purchase_units: [
          {
            custom_id: state,
            invoice_id: state,
            description: `NYALTX ${tier}`.slice(0, 127),
            amount: {
              currency_code: 'USD',
              value: amountValue,
            },
          },
        ],
        payment_source: {
          crypto: {
            country_code: 'US',
            name: { given_name: givenName, surname },
            experience_context: {
              locale: 'en-US',
              return_url: returnCallbackUrl.toString(),
              cancel_url: cancelCallbackUrl.toString(),
            },
          },
        },
      }),
      cache: 'no-store',
    });

    if (!paypalResponse.ok) {
      console.error('PayPal crypto order creation failed with status:', paypalResponse.status);
      await records.updateOne({ state }, { $set: { status: 'failed', updatedAt: new Date() } });
      return NextResponse.json(
        {
          error:
            'PayPal could not start crypto checkout. Confirm Pay with crypto is enabled and approved for your PayPal business account.',
        },
        { status: 502 },
      );
    }

    const order: PayPalCreateOrderResponse = await paypalResponse.json();
    const payerActionUrl = order.links?.find(link => link.rel === 'payer-action')?.href;
    if (!order.id || !payerActionUrl) {
      console.error('PayPal crypto order response is missing its order ID or payer-action link.');
      await records.updateOne({ state }, { $set: { status: 'failed', updatedAt: new Date() } });
      return NextResponse.json(
        { error: 'PayPal did not return a crypto approval link. Please try again.' },
        { status: 502 },
      );
    }

    const payerAction = new URL(payerActionUrl);
    if (
      payerAction.protocol !== 'https:' ||
      !(payerAction.hostname === 'paypal.com' || payerAction.hostname.endsWith('.paypal.com'))
    ) {
      console.error('PayPal returned an unexpected crypto approval URL host.');
      await records.updateOne({ state }, { $set: { status: 'failed', updatedAt: new Date() } });
      return NextResponse.json(
        { error: 'PayPal returned an invalid crypto approval link.' },
        { status: 502 },
      );
    }

    await records.updateOne(
      { state },
      { $set: { paypalOrderId: order.id, status: 'pending', updatedAt: new Date() } },
    );

    return NextResponse.json({ approvalUrl: payerAction.toString() });
  } catch (error) {
    if (error instanceof PayPalCryptoConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('PayPal crypto order creation error:', error);
    return NextResponse.json(
      { error: 'Could not create a PayPal crypto order. Please try again.' },
      { status: 500 },
    );
  }
}
