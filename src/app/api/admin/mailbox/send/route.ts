import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getCollection } from '@/lib/mongodb';

export const runtime = 'nodejs';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

export async function POST(request: NextRequest) {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestBody = await request.json();
    const body = typeof requestBody === 'object' && requestBody !== null ? requestBody : {};
    const to = typeof body.to === 'string' ? body.to.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (to.length > 254 || !EMAIL_PATTERN.test(to)) {
      return NextResponse.json({ error: 'Enter a valid recipient email address.' }, { status: 400 });
    }
    if (!subject || subject.length > 200 || /[\r\n]/.test(subject)) {
      return NextResponse.json(
        { error: 'Enter a single-line subject under 200 characters.' },
        { status: 400 }
      );
    }
    if (!message || message.length > 50000) {
      return NextResponse.json({ error: 'Message is required and must be under 50,000 characters.' }, { status: 400 });
    }

    const host = process.env.SMTP_HOST || 'mail.privateemail.com';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) {
      return NextResponse.json({ error: 'Outgoing email is not configured.' }, { status: 503 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || user,
      to,
      subject,
      text: message,
      html: `<div style="white-space:pre-wrap">${escapeHtml(message)}</div>`,
    });

    let historySaved = true;
    try {
      const history = await getCollection('email_history');
      await history.insertOne({
        id: `email_${randomUUID()}`,
        subject,
        message,
        recipients: [to],
        recipientCount: 1,
        sentBy: 'admin',
        sentAt: new Date().toISOString(),
        status: 'sent',
        messageId: info.messageId,
      });
    } catch (error) {
      historySaved = false;
      console.error('Email was sent but could not be added to email history:', error);
    }

    return NextResponse.json({
      success: true,
      historySaved,
      message: historySaved
        ? 'Email sent successfully.'
        : 'Email sent, but it could not be added to email history.',
    });
  } catch (error) {
    console.error('Failed to send admin email:', error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
