import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

interface EmailRecipient {
  id: string;
  email: string;
  name?: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET - Fetch all email recipients
export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection<EmailRecipient>('email_recipients');
    const recipients = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ recipients });
  } catch (error) {
    console.error('Error fetching email recipients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email recipients' },
      { status: 500 }
    );
  }
}

// POST - Add new email recipient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role = 'admin' } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection<EmailRecipient>('email_recipients');

    // Check if email already exists
    const existing = await collection.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'Email address already exists' },
        { status: 409 }
      );
    }

    const newRecipient: EmailRecipient = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      name: name || undefined,
      role,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await collection.insertOne(newRecipient as any);

    return NextResponse.json({ 
      success: true, 
      recipient: newRecipient 
    });
  } catch (error) {
    console.error('Error adding email recipient:', error);
    return NextResponse.json(
      { error: 'Failed to add email recipient' },
      { status: 500 }
    );
  }
}

// PUT - Update email recipient
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection<EmailRecipient>('email_recipients');

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const result = await collection.updateOne(
      { id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email recipient:', error);
    return NextResponse.json(
      { error: 'Failed to update email recipient' },
      { status: 500 }
    );
  }
}

// DELETE - Remove email recipient
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection<EmailRecipient>('email_recipients');
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting email recipient:', error);
    return NextResponse.json(
      { error: 'Failed to delete email recipient' },
      { status: 500 }
    );
  }
}
