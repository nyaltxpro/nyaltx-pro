import { NextResponse } from 'next/server';
import type { Document } from 'mongodb';
import { getDb } from '@/lib/mongodb';

interface AnnouncementDocument extends Document {
  _id: string;
  enabled?: boolean;
  message?: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const announcement = await db
      .collection<AnnouncementDocument>('site_announcement')
      .findOne({ _id: 'main' });
    return NextResponse.json(
      {
        enabled: announcement?.enabled === true && typeof announcement?.message === 'string',
        message: typeof announcement?.message === 'string' ? announcement.message : '',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Failed to load site announcement:', error);
    return NextResponse.json(
      { error: 'Failed to load announcement.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
