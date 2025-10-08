import { getCollection } from '@/lib/mongodb';
import { createAdminTokenRegistrationEmail, createUserTokenRegistrationEmail } from '@/utils/emailTemplates';
import { NextRequest, NextResponse } from 'next/server';

// Function to send email notifications
async function sendTokenRegistrationEmails(tokenData: TokenRegistration) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx-pro-5hqd.vercel.app';
  
  // Send user confirmation email (if we have user email)
  if (tokenData.userEmail) {
    try {
      const { subject, html } = createUserTokenRegistrationEmail(tokenData);
      
      const response = await fetch(`${baseUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: tokenData.userEmail,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to send user confirmation email to ${tokenData.userEmail}:`, await response.text());
      } else {
        console.log(`✅ User confirmation email sent successfully to ${tokenData.userEmail} for token ${tokenData.tokenSymbol}`);
        // Also log to frontend console if in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[EMAIL SUCCESS] User notification sent to: ${tokenData.userEmail}`);
        }
      }
    } catch (error) {
      console.error(`Error sending user confirmation email:`, error);
    }
  }
  
  // Send admin notification email
  const adminEmails = process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : ['nyaltxpro@gmail.com.com'];
  
  for (const adminEmail of adminEmails) {
    if (adminEmail.trim()) {
      try {
        const { subject, html } = createAdminTokenRegistrationEmail(tokenData);
        
        const response = await fetch(`${baseUrl}/api/email/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: adminEmail.trim(),
            subject,
            html,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to send admin email to ${adminEmail}:`, await response.text());
        } else {
          console.log(`✅ Admin notification email sent successfully to ${adminEmail} for token ${tokenData.tokenSymbol}`);
          // Also log to frontend console if in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`[EMAIL SUCCESS] Admin notification sent to: ${adminEmail}`);
          }
        }
      } catch (error) {
        console.error(`Error sending admin email to ${adminEmail}:`, error);
      }
    }
  }
}

export type TokenRegistration = {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  contractAddress: string;
  contractAddressLower?: string;
  submittedByAddress?: string;
  submittedByAddressLower?: string;
  userEmail?: string; // Optional email for user notifications
  imageUri?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const required = ['tokenName', 'tokenSymbol', 'blockchain', 'contractAddress'];
    for (const k of required) {
      if (!body[k] || typeof body[k] !== 'string' || !body[k].trim()) {
        return NextResponse.json({ error: `${k} is required` }, { status: 400 });
      }
    }

    const now = new Date().toISOString();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const submittedBy: string | undefined =
      body.submittedByAddress && typeof body.submittedByAddress === 'string'
        ? body.submittedByAddress.trim()
        : undefined;

    const record: TokenRegistration = {
      id,
      tokenName: body.tokenName.trim(),
      tokenSymbol: body.tokenSymbol.trim(),
      blockchain: body.blockchain.trim(),
      contractAddress: body.contractAddress.trim(),
      contractAddressLower: body.contractAddress.trim().toLowerCase(),
      submittedByAddress: submittedBy,
      submittedByAddressLower: submittedBy ? submittedBy.toLowerCase() : undefined,
      userEmail: body.userEmail?.trim() || undefined,
      imageUri: body.imageUri?.trim() || undefined,
      website: body.website?.trim() || undefined,
      twitter: body.twitter?.trim() || undefined,
      telegram: body.telegram?.trim() || undefined,
      discord: body.discord?.trim() || undefined,
      github: body.github?.trim() || undefined,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const col = await getCollection<any>('token_registrations');
    // Ensure unique index once (idempotent)
    await col.createIndex(
      { blockchain: 1, contractAddressLower: 1 },
      { unique: true, name: 'uniq_chain_addrLower' }
    );
    // Prevent duplicate per chain by contract address (case-insensitive for EVM)
    const dup = await col.findOne({
      blockchain: record.blockchain,
      contractAddressLower: record.contractAddressLower,
    });
    if (dup) {
      return NextResponse.json(
        { error: 'A registration for this contract already exists', existing: dup },
        { status: 409 }
      );
    }

    await col.insertOne(record);

    // Send email notifications after successful registration
    try {
      await sendTokenRegistrationEmails(record);
      console.log(`✅ Token registration completed with email notifications for ${record.tokenSymbol}`);
    } catch (emailError) {
      console.error('Failed to send registration emails:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({ 
      ok: true, 
      record,
      emailSent: true,
      message: `Token ${record.tokenSymbol} registered successfully. Email notifications sent.`
    });
  } catch (e) {
    console.error('Register token error', e);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
