import { NextRequest, NextResponse } from 'next/server';
import type { Document } from 'mongodb';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getDb } from '@/lib/mongodb';

interface AnnouncementDocument extends Document {
  _id: string;
  enabled?: boolean;
  message?: string;
  updatedAt?: Date;
}

export async function GET() {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const announcement = await db
      .collection<AnnouncementDocument>('site_announcement')
      .findOne({ _id: 'main' });
    return NextResponse.json({
      enabled: announcement?.enabled === true,
      message: typeof announcement?.message === 'string' ? announcement.message : '',
    });
  } catch (error) {
    console.error('Failed to load announcement settings:', error);
    return NextResponse.json({ error: 'Failed to load announcement settings.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid announcement settings.' }, { status: 400 });
    }

    const { enabled, message } = body;
    if (
      typeof enabled !== 'boolean' ||
      typeof message !== 'string' ||
      message.trim().length > 240
    ) {
      return NextResponse.json(
        { error: 'Enter announcement text up to 240 characters and choose whether it is enabled.' },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    if (enabled && !trimmedMessage) {
      return NextResponse.json(
        { error: 'Enter announcement text before enabling the banner.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.collection<AnnouncementDocument>('site_announcement').updateOne(
      { _id: 'main' },
      {
        $set: {
          enabled,
          message: trimmedMessage,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      announcement: { enabled, message: trimmedMessage },
    });
  } catch (error) {
    console.error('Failed to save announcement settings:', error);
    return NextResponse.json({ error: 'Failed to save announcement settings.' }, { status: 500 });
  }
}
