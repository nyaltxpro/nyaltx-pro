import NewsletterWelcome from '@/emails/NewsletterWelcome';
import { getCollection } from '@/lib/mongodb';
import { render } from '@react-email/render';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration (Namecheap)
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'mail.privateemail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
};

// Use SMTP_USER as FROM_EMAIL if FROM_EMAIL is not set or doesn't match SMTP domain
const FROM_EMAIL =  process.env.SMTP_USER || 'noreply@nyaltx.io';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(EMAIL_CONFIG);
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      const parsed = await request.json();
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const email = rawEmail.toLowerCase();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const subscriptions = await getCollection('newsletter_subscriptions');

    const now = new Date();
    const result = await subscriptions.updateOne(
      { email },
      {
        $set: {
          status: 'active',
          updatedAt: now,
          ...(name ? { name } : {}),
        },
        $setOnInsert: {
          email,
          subscribedAt: now,
          createdAt: now,
          source: 'newsletter',
        },
      },
      { upsert: true },
    );
    const isNewSubscription = result.upsertedCount > 0;
    let welcomeEmailSent = false;

    if (
      isNewSubscription &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_HOST
    ) {
      try {
        const welcomeEmailHtml = await render(NewsletterWelcome({ name, email }));
        await createTransporter().sendMail({
          from: `"NYALTX Community" <${FROM_EMAIL}>`,
          to: email,
          subject: 'Welcome to NYALTX - Your Crypto Journey Starts Now!',
          html: welcomeEmailHtml,
        });
        welcomeEmailSent = true;
      } catch (error) {
        console.error('Newsletter welcome email could not be sent:', error);
      }
    }

    return NextResponse.json({
      success: true,
      welcomeEmailSent,
      message: isNewSubscription
        ? welcomeEmailSent
          ? 'Successfully subscribed. Check your inbox for a welcome email.'
          : 'Your subscription was saved. The welcome email could not be sent right now.'
        : 'You are already subscribed.',
    });
  } catch (error) {
    console.error('Newsletter subscription could not be saved:', error);
    return NextResponse.json(
      { error: 'Failed to save your subscription. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    service: 'NYALTX Newsletter API',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
