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
  completedAt?: Date;
  failureEventType?: string;
  updatedAt?: Date;
}

interface PayPalWebhookEvent {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: { currency_code?: string; value?: string };
    supplementary_data?: { related_ids?: { order_id?: string } };
    purchase_units?: Array<{ custom_id?: string }>;
    links?: Array<{ rel?: string; href?: string }>;
  };
}

function getOrderId(event: PayPalWebhookEvent) {
  const resource = event.resource;
  const relatedOrderId = resource?.supplementary_data?.related_ids?.order_id;
  if (relatedOrderId) return relatedOrderId;
  if (event.event_type === 'CHECKOUT.ORDER.DECLINED' && resource?.id) return resource.id;

  const orderLink = resource?.links?.find(link => link.rel === 'up')?.href;
  if (orderLink) {
    try {
      const pathParts = new URL(orderLink).pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1];
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) {
    return NextResponse.json({ error: 'PayPal webhook is not configured.' }, { status: 503 });
  }

  const transmission = {
    auth_algo: request.headers.get('paypal-auth-algo'),
    cert_url: request.headers.get('paypal-cert-url'),
    transmission_id: request.headers.get('paypal-transmission-id'),
    transmission_sig: request.headers.get('paypal-transmission-sig'),
    transmission_time: request.headers.get('paypal-transmission-time'),
  };
  if (Object.values(transmission).some(value => !value)) {
    return NextResponse.json({ error: 'Missing PayPal webhook signature headers.' }, { status: 400 });
  }

  let event: PayPalWebhookEvent;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid PayPal webhook payload.' }, { status: 400 });
  }
  if (!event || typeof event !== 'object' || !event.id || !event.event_type || !event.resource) {
    return NextResponse.json({ error: 'Invalid PayPal webhook payload.' }, { status: 400 });
  }

  try {
    const { accessToken, apiBaseUrl } = await getPayPalCryptoAccessToken();
    const verificationResponse = await fetch(
      `${apiBaseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transmission,
          webhook_id: webhookId,
          webhook_event: event,
        }),
        cache: 'no-store',
      },
    );
    if (!verificationResponse.ok) {
      console.error('PayPal webhook signature verification failed with status:', verificationResponse.status);
      return NextResponse.json({ error: 'Could not verify PayPal webhook.' }, { status: 502 });
    }

    const verification: { verification_status?: string } = await verificationResponse.json();
    if (verification.verification_status !== 'SUCCESS') {
      console.warn('PayPal webhook signature was not valid.', { eventId: event.id });
      return NextResponse.json({ error: 'Invalid PayPal webhook signature.' }, { status: 400 });
    }

    const completed = event.event_type === 'PAYMENT.CAPTURE.COMPLETED';
    const failed = ['PAYMENT.CAPTURE.DENIED', 'CHECKOUT.ORDER.DECLINED'].includes(
      event.event_type,
    );
    if (!completed && !failed) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const records = await getCollection<CryptoOrderRecord>('paypal_crypto_orders');
    const orderId = getOrderId(event);
    const customId = event.resource.purchase_units?.[0]?.custom_id;
    const record = orderId
      ? await records.findOne({ paypalOrderId: orderId })
      : customId
        ? await records.findOne({ state: customId })
        : null;

    if (!record) {
      console.warn('Verified PayPal crypto webhook did not match a stored order.', {
        eventId: event.id,
        eventType: event.event_type,
      });
      return NextResponse.json({ received: true, matched: false });
    }

    if (completed) {
      const eventAmount = event.resource.amount;
      if (
        !eventAmount ||
        eventAmount.currency_code !== record.currency ||
        Number(eventAmount.value).toFixed(2) !== Number(record.amount).toFixed(2)
      ) {
        console.error('PayPal crypto webhook amount did not match the stored order.', {
          eventId: event.id,
          paypalOrderId: record.paypalOrderId,
        });
        return NextResponse.json({ received: true, matched: false });
      }

      await records.updateOne(
        { state: record.state },
        {
          $set: {
            status: 'completed',
            captureId: event.resource.id,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );
    } else {
      await records.updateOne(
        { state: record.state, status: { $ne: 'completed' } },
        {
          $set: {
            status: 'failed',
            failureEventType: event.event_type,
            updatedAt: new Date(),
          },
        },
      );
    }

    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    if (error instanceof PayPalCryptoConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof PayPalCryptoAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    console.error('PayPal crypto webhook processing failed:', error);
    return NextResponse.json({ error: 'Could not process PayPal webhook.' }, { status: 500 });
  }
}
