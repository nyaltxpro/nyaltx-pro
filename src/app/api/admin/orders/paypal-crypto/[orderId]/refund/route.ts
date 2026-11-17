import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getCollection } from '@/lib/mongodb';
import {
  getPayPalCryptoAccessToken,
  PayPalCryptoAuthenticationError,
  PayPalCryptoConfigurationError,
} from '@/lib/paypalCryptoApi';
import type { Collection, UpdateFilter } from 'mongodb';

type RefundStatus = 'PROCESSING' | 'PENDING' | 'FAILED';

interface PayPalCryptoRefund {
  refundId: string;
  requestId: string;
  amount: string;
  status: 'COMPLETED';
  createdAt: Date;
}

interface RefundInProgress {
  requestId: string;
  amount: string;
  status: RefundStatus;
  refundId?: string;
  updatedAt: Date;
}

interface PayPalCryptoOrderRecord {
  state: string;
  paypalOrderId: string;
  amount: string;
  currency: 'USD';
  status: 'creating' | 'pending' | 'completed' | 'failed';
  captureId?: string;
  refundedAmount?: string;
  refunds?: PayPalCryptoRefund[];
  refundInProgress?: RefundInProgress;
  updatedAt?: Date;
}

interface PayPalRefundResponse {
  id?: string;
  status?: string;
  amount?: { currency_code?: string; value?: string };
}

function toCents(value: string) {
  return Math.round(Number(value) * 100);
}

function responseForRefund(
  status: number,
  body: Record<string, unknown>,
) {
  return NextResponse.json(body, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId } = await params;
  if (!orderId || orderId.length > 64) {
    return NextResponse.json({ error: 'Invalid PayPal order ID.' }, { status: 400 });
  }

  let body: { amount?: string | number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid refund request.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid refund request.' }, { status: 400 });
  }

  const hasRequestedAmount = body.amount !== undefined && body.amount !== '';
  const requestedAmountText =
    !hasRequestedAmount
      ? undefined
      : typeof body.amount === 'string'
        ? body.amount.trim()
        : String(body.amount);
  if (
    hasRequestedAmount &&
    (!requestedAmountText || !/^\d+(?:\.\d{1,2})?$/.test(requestedAmountText))
  ) {
    return NextResponse.json({ error: 'Enter a valid USD refund amount.' }, { status: 400 });
  }

  try {
    const records = await getCollection<PayPalCryptoOrderRecord>('paypal_crypto_orders');
    let record = await records.findOne({ paypalOrderId: orderId });
    if (!record) {
      return NextResponse.json({ error: 'PayPal crypto order was not found.' }, { status: 404 });
    }
    if (record.status !== 'completed') {
      return NextResponse.json({ error: 'Only completed crypto payments can be refunded.' }, { status: 409 });
    }

    const { accessToken, apiBaseUrl } = await getPayPalCryptoAccessToken();
    if (!record.captureId) {
      const orderResponse = await fetch(
        `${apiBaseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          cache: 'no-store',
        },
      );
      if (!orderResponse.ok) {
        return NextResponse.json({ error: 'Could not retrieve the PayPal capture for this order.' }, { status: 502 });
      }

      const orderDetails = await orderResponse.json();
      const purchaseUnit = orderDetails.purchase_units?.[0];
      const capture = purchaseUnit?.payments?.captures?.find(
        (item: { status?: string }) => item.status?.toUpperCase() === 'COMPLETED',
      );
      if (
        orderDetails.id !== orderId ||
        orderDetails.status?.toUpperCase() !== 'COMPLETED' ||
        purchaseUnit?.custom_id !== record.state ||
        purchaseUnit?.amount?.currency_code !== record.currency ||
        Number(purchaseUnit?.amount?.value).toFixed(2) !== Number(record.amount).toFixed(2) ||
        !capture?.id
      ) {
        return NextResponse.json({ error: 'PayPal capture details did not match this order.' }, { status: 409 });
      }
      await records.updateOne({ state: record.state }, { $set: { captureId: capture.id } });
      record = { ...record, captureId: capture.id };
    }
    if (!record.captureId) {
      return NextResponse.json({ error: 'PayPal capture ID is unavailable for this order.' }, { status: 409 });
    }

    const completedRefunds = record.refunds || [];
    const completedRefundCents = completedRefunds.reduce(
      (total: number, refund: PayPalCryptoRefund) => total + toCents(refund.amount),
      0,
    );
    const originalAmountCents = toCents(record.amount);
    let refundAmountCents: number;
    let requestId: string;
    let refundInProgress = record.refundInProgress;

    if (refundInProgress) {
      refundAmountCents = toCents(refundInProgress.amount);
      if (
        requestedAmountText !== undefined &&
        toCents(requestedAmountText) !== refundAmountCents
      ) {
        return NextResponse.json(
          { error: 'A refund is already in progress. Retry it with the same amount.' },
          { status: 409 },
        );
      }
      requestId = refundInProgress.requestId;

      if (refundInProgress.status === 'PENDING' && refundInProgress.refundId) {
        const statusResponse = await fetch(
          `${apiBaseUrl}/v2/payments/refunds/${encodeURIComponent(refundInProgress.refundId)}`,
          { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' },
        );
        if (!statusResponse.ok) {
          return NextResponse.json({ error: 'PayPal refund is still processing.' }, { status: 202 });
        }
        const refundStatus: PayPalRefundResponse = await statusResponse.json();
        if (refundStatus.status?.toUpperCase() === 'COMPLETED') {
          if (
            refundStatus.id !== refundInProgress.refundId ||
            refundStatus.amount?.currency_code !== 'USD' ||
            Number(refundStatus.amount.value).toFixed(2) !==
              (refundAmountCents / 100).toFixed(2)
          ) {
            return NextResponse.json(
              { error: 'PayPal refund details did not match the pending refund.' },
              { status: 502 },
            );
          }
          return await finalizeRefund({
            records,
            record,
            refund: refundStatus,
            requestId,
            amount: refundAmountCents,
          });
        }
        if (refundStatus.status?.toUpperCase() === 'PENDING') {
          return NextResponse.json(
            { error: 'PayPal refund is still processing.', refundStatus: 'PENDING' },
            { status: 202 },
          );
        }

        await records.updateOne(
          { state: record.state, 'refundInProgress.requestId': requestId },
          { $unset: { refundInProgress: '' }, $set: { updatedAt: new Date() } },
        );
        return NextResponse.json(
          { error: 'PayPal did not complete the pending refund.', refundStatus: 'FAILED' },
          { status: 409 },
        );
      }
    } else {
      const remainingCents = originalAmountCents - completedRefundCents;
      refundAmountCents = requestedAmountText
        ? toCents(requestedAmountText)
        : remainingCents;
      if (refundAmountCents < 1 || refundAmountCents > remainingCents) {
        return NextResponse.json(
          { error: `Refund amount must be between $0.01 and $${(remainingCents / 100).toFixed(2)}.` },
          { status: 400 },
        );
      }
      requestId = randomUUID();
      refundInProgress = {
        requestId,
        amount: (refundAmountCents / 100).toFixed(2),
        status: 'PROCESSING',
        updatedAt: new Date(),
      };
      const claim = await records.updateOne(
        { state: record.state, status: 'completed', refundInProgress: { $exists: false } },
        { $set: { refundInProgress, updatedAt: new Date() } },
      );
      if (claim.matchedCount !== 1) {
        return NextResponse.json(
          { error: 'Another refund request is already being processed.' },
          { status: 409 },
        );
      }
    }

    const isFullRefund = refundAmountCents === originalAmountCents && completedRefundCents === 0;
    const refundResponse = await fetch(
      `${apiBaseUrl}/v2/payments/captures/${encodeURIComponent(record.captureId)}/refund`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': requestId,
        },
        body: JSON.stringify(
          isFullRefund
            ? {}
            : {
                amount: {
                  currency_code: 'USD',
                  value: (refundAmountCents / 100).toFixed(2),
                },
              },
        ),
        cache: 'no-store',
      },
    );

    if (!refundResponse.ok) {
      const paypalError = await refundResponse.json().catch(() => ({}));
      console.error('PayPal crypto refund failed:', {
        status: refundResponse.status,
        name: paypalError.name,
        message: paypalError.message,
        debugId: paypalError.debug_id,
      });
      if (refundResponse.status < 500) {
        await records.updateOne(
          { state: record.state, 'refundInProgress.requestId': requestId },
          { $unset: { refundInProgress: '' }, $set: { updatedAt: new Date() } },
        );
      } else {
        await records.updateOne(
          { state: record.state, 'refundInProgress.requestId': requestId },
          { $set: { 'refundInProgress.status': 'FAILED', updatedAt: new Date() } },
        );
      }
      return NextResponse.json({ error: 'PayPal could not process the crypto refund.' }, { status: 502 });
    }

    const refund: PayPalRefundResponse = await refundResponse.json();
    if (
      !refund.id ||
      refund.amount?.currency_code !== 'USD' ||
      Number(refund.amount.value).toFixed(2) !== (refundAmountCents / 100).toFixed(2)
    ) {
      await records.updateOne(
        { state: record.state, 'refundInProgress.requestId': requestId },
        {
          $set: { 'refundInProgress.status': 'FAILED', updatedAt: new Date() },
        },
      );
      return NextResponse.json(
        { error: 'PayPal returned refund details that did not match the request.' },
        { status: 502 },
      );
    }

    if (refund.status?.toUpperCase() === 'COMPLETED') {
      return await finalizeRefund({
        records,
        record,
        refund,
        requestId,
        amount: refundAmountCents,
      });
    }
    if (refund.status?.toUpperCase() === 'PENDING') {
      await records.updateOne(
        { state: record.state, 'refundInProgress.requestId': requestId },
        {
          $set: {
            'refundInProgress.status': 'PENDING',
            'refundInProgress.refundId': refund.id,
            updatedAt: new Date(),
          },
        },
      );
      return NextResponse.json(
        { error: 'PayPal refund is still processing.', refundStatus: 'PENDING' },
        { status: 202 },
      );
    }

    await records.updateOne(
      { state: record.state, 'refundInProgress.requestId': requestId },
      { $unset: { refundInProgress: '' }, $set: { updatedAt: new Date() } },
    );
    return NextResponse.json(
      { error: 'PayPal did not complete the refund.', refundStatus: refund.status || 'UNKNOWN' },
      { status: 502 },
    );
  } catch (error) {
    if (error instanceof PayPalCryptoConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof PayPalCryptoAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    console.error('PayPal crypto refund processing error:', error);
    return NextResponse.json({ error: 'Could not process the PayPal crypto refund.' }, { status: 500 });
  }
}

async function finalizeRefund({
  records,
  record,
  refund,
  requestId,
  amount,
}: {
  records: Collection<PayPalCryptoOrderRecord>;
  record: PayPalCryptoOrderRecord;
  refund: PayPalRefundResponse;
  requestId: string;
  amount: number;
}) {
  if (!refund.id) {
    return NextResponse.json({ error: 'PayPal did not return a refund ID.' }, { status: 502 });
  }

  const alreadyRecorded = (record.refunds || []).some(item => item.refundId === refund.id);
  const completedRefundCents = (record.refunds || []).reduce(
    (total, item) => total + toCents(item.amount),
    0,
  );
  const totalRefundedCents = completedRefundCents + (alreadyRecorded ? 0 : amount);
  const fullRefund = totalRefundedCents >= toCents(record.amount);
  const now = new Date();
  const updateOperation: UpdateFilter<PayPalCryptoOrderRecord> = {
    $unset: { refundInProgress: '' },
    $set: { refundedAmount: (totalRefundedCents / 100).toFixed(2), updatedAt: now },
  };
  if (!alreadyRecorded) {
    updateOperation.$push = {
      refunds: {
        refundId: refund.id,
        requestId,
        amount: (amount / 100).toFixed(2),
        status: 'COMPLETED',
        createdAt: now,
      },
    };
  }
  const orders = await getCollection('orders');
  await orders.updateMany(
    { paymentId: record.paypalOrderId, 'metadata.paymentSource': 'paypal_crypto' },
    {
      $set: {
        status: fullRefund ? 'refunded' : 'completed',
        updatedAt: now.toISOString(),
        'metadata.cryptoRefundedAmount': (totalRefundedCents / 100).toFixed(2),
        'metadata.cryptoRefunds': [
          ...(record.refunds || []),
          ...(alreadyRecorded
            ? []
            : [
                {
                  refundId: refund.id,
                  amount: (amount / 100).toFixed(2),
                  status: 'COMPLETED',
                },
              ]),
        ],
      },
    },
  );
  const update = await records.updateOne(
    { state: record.state, 'refundInProgress.requestId': requestId },
    updateOperation,
  );

  if (update.matchedCount !== 1) {
    return NextResponse.json({ error: 'Could not record the PayPal refund.' }, { status: 500 });
  }

  return responseForRefund(200, {
    success: true,
    refundId: refund.id,
    refundAmount: (amount / 100).toFixed(2),
    refundedAmount: (totalRefundedCents / 100).toFixed(2),
    remainingAmount: (Math.max(0, toCents(record.amount) - totalRefundedCents) / 100).toFixed(2),
    orderStatus: fullRefund ? 'refunded' : 'completed',
    refunds: [
      ...(record.refunds || []),
      ...(alreadyRecorded
        ? []
        : [
            {
              refundId: refund.id,
              requestId,
              amount: (amount / 100).toFixed(2),
              status: 'COMPLETED',
            },
          ]),
    ],
  });
}
