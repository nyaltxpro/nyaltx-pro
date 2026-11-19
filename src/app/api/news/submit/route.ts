import { NextRequest, NextResponse } from 'next/server';
import { getDb, getCollection } from '@/lib/mongodb';
import { Order } from '@/app/api/admin/orders/route';
import { verifyNewsPayment, sendNewsSubmissionConfirmationEmail } from '@/lib/newsEmailService';
import { findUsablePromoCode } from '@/lib/newsPromoCodes';
import { calculateNewsPrice } from '@/lib/newsPricing';
import { isPaidNewsCategory } from '@/lib/paidNewsCategories';

const NEWS_TEST_PLAN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_NEWS_TEST_PLAN === 'true';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      title,
      type = 'news', // 'news' | 'pr'
      category = 'NYAX',
      summary,
      content,
      sourceUrl,
      featuredImage,
      coverColor = 0,
      author = 'NYALTX',
      email,
      plan = 'feed', // 'feed' | 'slider' | 'prem'
      paymentMethod = 'paypal', // 'paypal' | 'usdc' | 'nyax'
      amount,
      txHash,
      paymentId,
      walletAddress,
      paymentStatus = 'completed',
      planName
    } = data;

    if (!['paypal', 'usdc', 'nyax'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Unsupported payment method. Choose PayPal, USDC, or NYAX.' },
        { status: 400 }
      );
    }

    if (!isPaidNewsCategory(category)) {
      return NextResponse.json(
        { error: 'Choose one of the available news categories.' },
        { status: 400 }
      );
    }

    if (Boolean(data.isTest) || ['test', 'testnet'].includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Test payments are disabled for news submissions.' },
        { status: 400 }
      );
    }

    const planPrice =
      plan === 'feed' ? 99 :
      plan === 'slider' || plan === 'prem' ? 199 :
      plan === 'test' && NEWS_TEST_PLAN_ENABLED ? 1 :
      null;
    if (planPrice === null) {
      return NextResponse.json({ error: 'This news publishing plan is unavailable.' }, { status: 400 });
    }

    const promoCode = typeof data.promoCode === 'string' ? data.promoCode.trim().toUpperCase() : '';
    if (promoCode && plan === 'test') {
      return NextResponse.json({ error: 'Promo codes cannot be applied to the test plan.' }, { status: 400 });
    }

    let promoDiscountPercent = 0;
    if (promoCode) {
      const packageId = plan === 'feed' ? 'news:feed' : 'news:slider';
      const { promo, message } = await findUsablePromoCode(promoCode, packageId);
      if (!promo) {
        return NextResponse.json({ error: message || 'This promo code is invalid.' }, { status: 400 });
      }
      promoDiscountPercent = promo.discountPercent;
    }

    const expectedAmount = calculateNewsPrice(
      planPrice,
      promoDiscountPercent,
      paymentMethod === 'nyax' && plan !== 'test'
    );
    const submissionAmount = amount === undefined ? expectedAmount : Number(amount);
    if (!Number.isFinite(submissionAmount) || Math.abs(submissionAmount - expectedAmount) > 0.001) {
      return NextResponse.json(
        { error: 'Payment amount does not match the selected publishing plan.' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length < 5) {
      return NextResponse.json({ error: 'Headline is required (minimum 5 characters)' }, { status: 400 });
    }

    if (!summary || summary.trim().length < 10) {
      return NextResponse.json({ error: 'Summary is required (minimum 10 characters)' }, { status: 400 });
    }

    if (!content || content.trim().length < 20) {
      return NextResponse.json({ error: 'Story content is required (minimum 20 characters)' }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required to receive payment and status confirmation.' }, { status: 400 });
    }

    // 1. Verify Payment on Backend before proceeding
    const paymentVerification = await verifyNewsPayment({
      paymentMethod,
      paymentId: paymentId || null,
      txHash: txHash || null,
      amount: submissionAmount,
      paymentStatus
    });

    if (!paymentVerification.verified) {
      return NextResponse.json({
        error: paymentVerification.reason || 'Payment verification failed. Please complete payment before submitting.'
      }, { status: 400 });
    }

    const db = await getDb();
    const newsCollection = db.collection('corporate_news');

    // Create unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const finalSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const resolvedPlanName = planName || (
      plan === 'test'
        ? 'Checkout Flow Test ($1)'
        : plan === 'slider' || plan === 'prem'
          ? 'News Publishing & Distribution ($199)'
          : 'News Publishing ($99)'
    );
    const authorName = typeof author === 'string' ? author.trim() : '';
    const orderId = `order_news_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const submissionDoc = {
      title: title.trim(),
      type,
      category,
      excerpt: summary.trim(),
      content: content.trim(),
      sourceUrl: sourceUrl?.trim() || null,
      featuredImage: featuredImage || null,
      coverColor: Number(coverColor) || 0,
      author: authorName.toLowerCase() === 'you'
        ? 'NYALTX'
        : authorName || (type === 'pr' ? 'Press Release' : 'NYALTX'),
      email: email.trim(),
      plan,
      planName: resolvedPlanName,
      orderId,
      paymentMethod,
      amount: submissionAmount,
      originalAmount: String(planPrice),
      promoCode: promoCode || null,
      promoDiscount: promoDiscountPercent / 100,
      txHash: txHash || null,
      paymentId: paymentId || null,
      walletAddress: walletAddress || null,
      paymentStatus: paymentStatus || 'completed',
      paymentVerified: true,
      paymentVerifiedAt: new Date(),
      paymentSource: paymentVerification.providerDetails?.paymentSource || paymentMethod,
      paymentProviderDetails: paymentVerification.providerDetails || null,
      paymentConfirmationEmailSent: false,
      approvalEmailSent: false,
      status: 'pending', // Pending admin review
      isPendingReview: true,
      isPaid: true,
      featuredInBanner: plan === 'slider' || plan === 'prem',
      tags: [category, type === 'pr' ? 'Press Release' : 'Community'],
      slug: finalSlug,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertResult = await newsCollection.insertOne(submissionDoc);

    // 2. Record the verified payment order in 'orders' collection
    let orderRecorded = false;
    try {
      const ordersCollection = await getCollection<Order>('orders');
      
      const newOrder: Order & { promoCode?: string; promoDiscount?: number; originalAmount?: string } = {
        id: orderId,
        type: 'news_submission',
        status: 'completed',
        paymentMethod,
        amount: String(submissionAmount),
        promoCode: promoCode || undefined,
        promoDiscount: promoDiscountPercent / 100,
        originalAmount: String(planPrice),
        currency: paymentMethod === 'usdc' ? 'USDC' : paymentMethod === 'nyax' ? 'NYAX' : 'USD',
        txHash: txHash || undefined,
        paymentId: paymentId || undefined,
        walletAddress: walletAddress || undefined,
        email: email.trim(),
        productName: `NYALTX News Hub - ${type === 'pr' ? 'Press Release' : 'News'} (${resolvedPlanName})`,
        tier: plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        metadata: {
          newsId: insertResult.insertedId.toString(),
          headline: title,
          category,
          submissionType: type,
          plan,
          planName: resolvedPlanName,
          paymentMethod,
          paymentSource: paymentVerification.providerDetails?.paymentSource || paymentMethod,
          promoCode: promoCode || undefined,
          promoDiscount: promoDiscountPercent / 100,
          originalAmount: String(planPrice),
          paymentId,
          txHash,
          walletAddress,
          paymentVerified: true
        }
      };

      await ordersCollection.insertOne(newOrder);
      orderRecorded = true;
    } catch (orderErr) {
      console.error('Could not record news submission order; the admin orders API will recover it from the submission:', orderErr);
    }

    // 3. Send payment & submission confirmation email to client
    let emailSent = false;
    try {
      const emailRes = await sendNewsSubmissionConfirmationEmail({
        to: email.trim(),
        headline: title.trim(),
        category,
        planName: resolvedPlanName,
        amount: submissionAmount,
        paymentMethod,
        paymentId: paymentId || undefined,
        txHash: txHash || undefined,
        author: submissionDoc.author,
        submittedAt: submissionDoc.createdAt.toISOString()
      });

      if (emailRes.success) {
        emailSent = true;
        await newsCollection.updateOne(
          { _id: insertResult.insertedId },
          {
            $set: {
              paymentConfirmationEmailSent: true,
              paymentConfirmationEmailSentAt: new Date(),
              paymentConfirmationMessageId: emailRes.messageId
            }
          }
        );
      }
    } catch (emailError) {
      console.error('Error sending news submission email:', emailError);
    }

    return NextResponse.json({
      success: true,
      id: insertResult.insertedId.toString(),
      slug: finalSlug,
      orderId,
      orderRecorded,
      paymentVerified: true,
      emailSent,
      message: 'Payment verified successfully. Your story has been submitted and is pending admin approval.'
    });

  } catch (error: any) {
    console.error('Error submitting news:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit story' }, { status: 500 });
  }
}
