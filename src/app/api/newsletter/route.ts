import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import NewsletterWelcome from '@/emails/NewsletterWelcome';
import NewsletterAdminNotification from '@/emails/NewsletterAdminNotification';

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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nyaltx.io';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@nyaltx.io';

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
    const { email, name } = await request.json();

    // Validate input
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    // Check if required environment variables are set
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST) {
      console.error('❌ Namecheap email credentials not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const transporter = createTransporter();

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      return NextResponse.json({ error: 'Email service unavailable' }, { status: 500 });
    }

    // Render React Email templates
    const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown';
    const timestamp = new Date().toISOString();
    
    const welcomeEmailHtml = await render(NewsletterWelcome({ name, email }));
    const adminNotificationHtml = await render(
      NewsletterAdminNotification({ email, name, ipAddress, timestamp })
    );

    // Send welcome email to subscriber
    await transporter.sendMail({
      from: `"NYALTX Community" <${FROM_EMAIL}>`,
      to: email,
      subject: '🚀 Welcome to NYALTX - Your Crypto Journey Starts Now!',
      html: welcomeEmailHtml,
    });

    // Send notification to admin (optional - uncomment to enable)
    // await transporter.sendMail({
    //   from: `"NYALTX System" <${FROM_EMAIL}>`,
    //   to: ADMIN_EMAIL,
    //   subject: '📧 New Newsletter Subscription - NYALTX',
    //   html: adminNotificationHtml,
    // });

    console.log('✅ Newsletter subscription processed:', email);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    });
  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription. Please try again.' },
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
