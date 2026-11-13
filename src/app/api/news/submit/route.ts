import { NextRequest, NextResponse } from 'next/server';
import { getDb, getCollection } from '@/lib/mongodb';
import { Order } from '@/app/api/admin/orders/route';
import { verifyNewsPayment, sendNewsSubmissionConfirmationEmail } from '@/lib/newsEmailService';

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
      author = 'Community Submission',
      email,
      plan = 'feed', // 'feed' | 'slider' | 'prem'
      paymentMethod = 'card', // 'paypal' | 'eth' | 'sol' | 'card' | 'usdc' | 'nyax'
      amount = 199,
      txHash,
      paymentId,
      walletAddress,
      paymentStatus = 'completed',
      planName,
      isTest = false
    } = data;

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
      amount,
      paymentStatus,
      isTest: Boolean(isTest)
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

    const resolvedPlanName = planName || (plan === 'slider'
      ? 'Full Service ($499)'
      : 'Direct Distribution ($199)');

    const submissionDoc = {
      title: title.trim(),
      type,
      category,
      excerpt: summary.trim(),
      content: content.trim(),
      sourceUrl: sourceUrl?.trim() || null,
      featuredImage: featuredImage || null,
      coverColor: Number(coverColor) || 0,
      author: author.trim() || (type === 'pr' ? 'Press Release' : 'Community Submission'),
      email: email.trim(),
      plan,
      planName: resolvedPlanName,
      paymentMethod,
      amount: Number(amount) || 0,
      txHash: txHash || null,
      paymentId: paymentId || null,
      walletAddress: walletAddress || null,
      paymentStatus: paymentStatus || 'completed',
      paymentVerified: true,
      paymentVerifiedAt: new Date(),
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
    let orderRecord: Order | null = null;
    try {
      const ordersCollection = await getCollection<Order>('orders');
      const orderId = `order_news_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      
      const newOrder: Order = {
        id: orderId,
        type: 'news_submission' as any,
        status: 'completed',
        paymentMethod: paymentMethod as any,
        amount: String(amount),
        currency: (paymentMethod === 'eth' ? 'ETH' : paymentMethod === 'sol' ? 'SOL' : paymentMethod === 'nyax' ? 'NYAX' : 'USD') as any,
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
          paymentId,
          txHash,
          walletAddress,
          paymentVerified: true
        }
      };

      await ordersCollection.insertOne(newOrder);
      orderRecord = newOrder;
    } catch (orderErr) {
      console.warn('Could not record order automatically:', orderErr);
    }

    // 3. Send payment & submission confirmation email to client
    let emailSent = false;
    try {
      const emailRes = await sendNewsSubmissionConfirmationEmail({
        to: email.trim(),
        headline: title.trim(),
        category,
        planName: resolvedPlanName,
        amount: Number(amount) || 0,
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
      orderId: orderRecord?.id || null,
      paymentVerified: true,
      emailSent,
      message: 'Payment verified successfully. Your story has been submitted and is pending admin approval.'
    });

  } catch (error: any) {
    console.error('Error submitting news:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit story' }, { status: 500 });
  }
}
