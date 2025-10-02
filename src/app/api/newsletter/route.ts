import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Check if required environment variables are set
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const transporter = createTransporter();

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Email service unavailable' },
        { status: 500 }
      );
    }

    // Send welcome email to subscriber
    const welcomeEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to NYALTX Community</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to NYALTX!</h1>
              <p>Your gateway to the crypto world</p>
            </div>
            <div class="content">
              <h2>Thank you for joining our community! 🚀</h2>
              <p>Hi ${name || 'Crypto Enthusiast'},</p>
              <p>Welcome to the NYALTX Venture Access Network! You're now part of an exclusive community of crypto traders, investors, and innovators.</p>
              
              <h3>What you can expect:</h3>
              <ul>
                <li>📈 Daily crypto market insights and analysis</li>
                <li>🤝 Networking events and community meetups</li>
                <li>🔥 Early access to new features and tools</li>
                <li>💎 Premium trading signals and strategies</li>
              </ul>
              
              <p>Ready to explore? Check out our platform and start your crypto journey:</p>
              <a href="https://nyaltx.io/dashboard" class="button">Explore Dashboard</a>
              
              <p>Follow us on social media for real-time updates:</p>
              <p>
                <a href="https://x.com/nyaltx">Twitter</a> | 
                <a href="https://t.me/nyaltx">Telegram</a> | 
                <a href="https://www.youtube.com/c/Nyaltx">YouTube</a>
              </p>
              
              <p>Best regards,<br>The NYALTX Team</p>
            </div>
            <div class="footer">
              <p>© 2025 NYALTX. All rights reserved.</p>
              <p>If you no longer wish to receive these emails, you can <a href="https://nyaltx.io/unsubscribe">unsubscribe here</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send welcome email
    await transporter.sendMail({
      from: `"NYALTX Community" <${FROM_EMAIL}>`,
      to: email,
      subject: '🚀 Welcome to NYALTX - Your Crypto Journey Starts Now!',
      html: welcomeEmailHtml,
    });

    // Send notification to admin
    const adminNotificationHtml = `
      <h2>New Newsletter Subscription</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Name:</strong> ${name || 'Not provided'}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>IP:</strong> ${request.headers.get('x-forwarded-for') || 'Unknown'}</p>
    `;

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
