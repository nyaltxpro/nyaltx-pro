import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create Namecheap email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
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
  });
};

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text }: EmailRequest = await request.json();
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if Namecheap email is configured
    const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('Namecheap email service not configured. Missing:', missingVars.join(', '));
      return NextResponse.json(
        { error: 'Email service not configured. Please set SMTP_USER, SMTP_PASS, and SMTP_HOST environment variables.' },
        { status: 503 }
      );
    }

    const transporter = createTransporter();

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      return NextResponse.json(
        { error: 'Email service configuration error' },
        { status: 500 }
      );
    }

    // Send email
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
