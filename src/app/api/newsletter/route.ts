import NewsletterAdminNotification from '@/emails/NewsletterAdminNotification';
import NewsletterWelcome from '@/emails/NewsletterWelcome';
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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nyaltx.io';
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
  const startTime = Date.now();
  let email = '';
  
  try {
    console.log('📧 Newsletter subscription request received');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      email = body.email;
      const name = body.name;
      console.log(`📝 Request data - Email: ${email}, Name: ${name || 'Not provided'}`);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Validate input
    if (!email || !isValidEmail(email)) {
      console.error(`❌ Invalid email format: ${email}`);
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    // Check if required environment variables are set
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST) {
      console.error('❌ Namecheap email credentials not configured');
      console.error(`SMTP_HOST: ${process.env.SMTP_HOST ? 'Set' : 'Missing'}`);
      console.error(`SMTP_USER: ${process.env.SMTP_USER ? 'Set' : 'Missing'}`);
      console.error(`SMTP_PASS: ${process.env.SMTP_PASS ? 'Set' : 'Missing'}`);
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    console.log(`🔧 SMTP Config - Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT || '587'}`);
    
    const transporter = createTransporter();

    // Verify SMTP connection
    try {
      console.log('🔍 Verifying SMTP connection...');
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError: any) {
      console.error('❌ SMTP verification failed:');
      console.error('Error name:', verifyError.name);
      console.error('Error message:', verifyError.message);
      console.error('Error code:', verifyError.code);
      console.error('Full error:', verifyError);
      return NextResponse.json({ 
        error: 'Email service unavailable', 
        details: verifyError.message 
      }, { status: 500 });
    }

    // Render React Email templates
    const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown';
    const timestamp = new Date().toISOString();
    
    console.log('📄 Rendering email templates...');
    let welcomeEmailHtml: string;
    let adminNotificationHtml: string;
    
    try {
      welcomeEmailHtml = await render(NewsletterWelcome({ name: body.name, email }));
      adminNotificationHtml = await render(
        NewsletterAdminNotification({ email, name: body.name, ipAddress, timestamp })
      );
      console.log('✅ Email templates rendered successfully');
    } catch (renderError: any) {
      console.error('❌ Failed to render email templates:', renderError);
      return NextResponse.json({ 
        error: 'Failed to generate email', 
        details: renderError.message 
      }, { status: 500 });
    }

    // Send welcome email to subscriber
    try {
      console.log(`📨 Sending welcome email to: ${email}`);
      const mailOptions = {
        from: `"NYALTX Community" <${FROM_EMAIL}>`,
        to: email,
        subject: '🚀 Welcome to NYALTX - Your Crypto Journey Starts Now!',
        html: welcomeEmailHtml,
      };
      console.log(`From: ${mailOptions.from}`);
      console.log(`To: ${mailOptions.to}`);
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
    } catch (sendError: any) {
      console.error('❌ Failed to send welcome email:');
      console.error('Error name:', sendError.name);
      console.error('Error message:', sendError.message);
      console.error('Error code:', sendError.code);
      console.error('Command:', sendError.command);
      console.error('Full error:', sendError);
      return NextResponse.json({ 
        error: 'Failed to send email', 
        details: sendError.message 
      }, { status: 500 });
    }

    // Send notification to admin (optional - uncomment to enable)
    // await transporter.sendMail({
    //   from: `"NYALTX System" <${FROM_EMAIL}>`,
    //   to: ADMIN_EMAIL,
    //   subject: '📧 New Newsletter Subscription - NYALTX',
    //   html: adminNotificationHtml,
    // });

    const duration = Date.now() - startTime;
    console.log(`✅ Newsletter subscription completed for: ${email} (${duration}ms)`);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Newsletter subscription error for ${email || 'unknown'} (${duration}ms):`);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to process subscription. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
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
