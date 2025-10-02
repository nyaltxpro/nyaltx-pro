import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create transporter for Gmail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Use App Password, not regular password
      },
    });

    // Email content for the admin
    const adminMailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">New Contact Form Submission</h2>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <div style="margin-bottom: 15px;">
              <strong style="color: #1e293b;">Name:</strong>
              <span style="color: #475569; margin-left: 10px;">${name}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #1e293b;">Email:</strong>
              <span style="color: #475569; margin-left: 10px;">${email}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #1e293b;">Subject:</strong>
              <span style="color: #475569; margin-left: 10px;">${subject}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #1e293b;">Message:</strong>
              <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0; margin-top: 10px;">
                <p style="color: #475569; line-height: 1.6; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              <small style="color: #64748b;">
                Submitted on: ${new Date().toLocaleString()}
              </small>
            </div>
          </div>
        </div>
      `,
    };

    // Auto-reply email for the user
    const userMailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting NYALTX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">Thank You for Contacting Us!</h2>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <p style="color: #475569; line-height: 1.6;">Hi ${name},</p>
            <p style="color: #475569; line-height: 1.6;">
              Thank you for reaching out to NYALTX. We have received your message regarding "<strong>${subject}</strong>" and will get back to you as soon as possible.
            </p>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <h4 style="color: #1e293b; margin: 0 0 10px 0;">Your Message:</h4>
              <p style="color: #64748b; line-height: 1.6; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="color: #475569; line-height: 1.6;">
              Our team typically responds within 24-48 hours during business days.
            </p>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              <p style="color: #475569; line-height: 1.6; margin: 0;">
                Best regards,<br>
                <strong>The NYALTX Team</strong>
              </p>
              <p style="color: #64748b; font-size: 14px; margin-top: 10px;">
                Email: info@nyaltx.com<br>
                Website: <a href="https://nyaltx.com" style="color: #0ea5e9;">nyaltx.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully! We will get back to you soon.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Return different error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        return NextResponse.json(
          { error: 'Email configuration error. Please contact support.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
