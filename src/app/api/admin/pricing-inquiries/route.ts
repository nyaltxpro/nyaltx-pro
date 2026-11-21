import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getCollection } from '@/lib/mongodb';

type PricingInquiryStatus = 'new' | 'contacted' | 'closed';

export async function GET() {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const inquiries = await (
      await getCollection('pricing_inquiries')
    )
      .find({})
      .sort({ createdAt: -1 })
      .limit(300)
      .toArray();
    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Failed to load pricing inquiries:', error);
    return NextResponse.json({ error: 'Failed to load pricing inquiries.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid inquiry update.' }, { status: 400 });
    }
    const { id, status } = body;
    const allowedStatuses: PricingInquiryStatus[] = ['new', 'contacted', 'closed'];
    if (typeof id !== 'string' || !ObjectId.isValid(id) || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid inquiry update.' }, { status: 400 });
    }

    const result = await (
      await getCollection('pricing_inquiries')
    ).updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
    if (!result.matchedCount) {
      return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update pricing inquiry:', error);
    return NextResponse.json({ error: 'Failed to update pricing inquiry.' }, { status: 500 });
  }
}
