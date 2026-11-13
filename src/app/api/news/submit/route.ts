import { NextRequest, NextResponse } from 'next/server';
import { getDb, getCollection } from '@/lib/mongodb';
import { Order } from '@/app/api/admin/orders/route';

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
      amount = 29,
      txHash,
      paymentId,
      walletAddress,
      paymentStatus = 'completed',
      planName
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

    const db = await getDb();
    const newsCollection = db.collection('corporate_news');

    // Create unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const finalSlug = `${baseSlug}-${Date.now().toString(36)}`;

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
      email: email?.trim() || null,
      plan,
      planName: planName || (type === 'pr' ? (plan === 'slider' ? 'Full Service ($499)' : 'Direct Distribution ($199)') : plan),
      paymentMethod,
      amount: Number(amount) || 0,
      txHash: txHash || null,
      paymentId: paymentId || null,
      walletAddress: walletAddress || null,
      paymentStatus: paymentStatus || 'completed',
      status: 'pending', // Pending admin review
      isPendingReview: true,
      featuredInBanner: plan === 'slider' || plan === 'prem',
      tags: [category, type === 'pr' ? 'Press Release' : 'Community'],
      slug: finalSlug,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertResult = await newsCollection.insertOne(submissionDoc);

    // Also record the payment order in 'orders' collection
    let orderRecord: Order | null = null;
    try {
      const ordersCollection = await getCollection<Order>('orders');
      const orderId = `order_news_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      
      const newOrder: Order = {
        id: orderId,
        type: 'news_submission' as any,
        status: (paymentStatus === 'completed' || paymentStatus === 'paid') ? 'completed' : 'pending',
        paymentMethod: paymentMethod as any,
        amount: String(amount),
        currency: (paymentMethod === 'eth' ? 'ETH' : paymentMethod === 'sol' ? 'SOL' : paymentMethod === 'nyax' ? 'NYAX' : 'USD') as any,
        txHash: txHash || undefined,
        paymentId: paymentId || undefined,
        walletAddress: walletAddress || undefined,
        email: email || undefined,
        productName: `NYALTX News Hub - ${type === 'pr' ? 'Press Release' : 'News'} (${submissionDoc.planName})`,
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
          planName: submissionDoc.planName,
          paymentMethod,
          paymentId,
          txHash,
          walletAddress
        }
      };

      await ordersCollection.insertOne(newOrder);
      orderRecord = newOrder;
    } catch (orderErr) {
      console.warn('Could not record order automatically:', orderErr);
    }

    return NextResponse.json({
      success: true,
      id: insertResult.insertedId.toString(),
      slug: finalSlug,
      orderId: orderRecord?.id || null,
      message: 'Your story has been submitted for moderation.'
    });

  } catch (error: any) {
    console.error('Error submitting news:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit story' }, { status: 500 });
  }
}
