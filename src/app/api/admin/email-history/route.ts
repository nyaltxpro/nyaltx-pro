import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

interface EmailRecord {
  id: string;
  subject: string;
  message: string;
  recipients: string[];
  recipientCount: number;
  sentBy: string;
  sentAt: string;
  status: 'sent' | 'failed';
  failedRecipients?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection<EmailRecord>('email_history');
    
    // Fetch all email records, sorted by most recent first
    const history = await collection
      .find({})
      .sort({ sentAt: -1 })
      .limit(100) // Limit to last 100 emails
      .toArray();

    // Transform data for frontend
    const formattedHistory = history.map(record => ({
      id: record.id,
      subject: record.subject,
      message: record.message,
      recipients: record.recipients || [],
      recipientCount: record.recipientCount,
      sentBy: record.sentBy || 'admin',
      sentAt: record.sentAt,
      status: record.status,
      failedRecipients: record.failedRecipients || []
    }));

    return NextResponse.json({ 
      history: formattedHistory,
      total: history.length 
    });
  } catch (error) {
    console.error('Error fetching email history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email history' },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint to clear old history
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection<EmailRecord>('email_history');
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Email record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting email history:', error);
    return NextResponse.json(
      { error: 'Failed to delete email history' },
      { status: 500 }
    );
  }
}
