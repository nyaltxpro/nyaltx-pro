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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, message, recipients } = body;

    // Validation
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx-pro-5hqd.vercel.app';
    
    // Send emails to all recipients
    const emailPromises = recipients.map(async (recipientEmail) => {
      try {
        const emailPayload = {
          to: recipientEmail,
          subject: subject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #f5f5f5;
                }
                .container {
                  background: white;
                  border-radius: 10px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                  background: linear-gradient(135deg, #00b8d8 0%, #0099b8 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                }
                .logo {
                  font-size: 32px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  letter-spacing: 2px;
                }
                .content {
                  padding: 30px;
                }
                .message {
                  background: #f8f9fa;
                  padding: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #00b8d8;
                  margin: 20px 0;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
                .footer {
                  background: #f8f9fa;
                  padding: 20px;
                  text-align: center;
                  color: #666;
                  font-size: 14px;
                  border-top: 1px solid #e0e0e0;
                }
                .button {
                  display: inline-block;
                  padding: 12px 30px;
                  background: linear-gradient(135deg, #00b8d8 0%, #0099b8 100%);
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  margin: 20px 0;
                  font-weight: bold;
                }
                .button:hover {
                  background: linear-gradient(135deg, #0099b8 0%, #007a98 100%);
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">NYALTX</div>
                  <p style="margin: 0; opacity: 0.9;">Important Update</p>
                </div>
                
                <div class="content">
                  <h2 style="color: #333; margin-top: 0;">${subject}</h2>
                  
                  <div class="message">
                    ${message}
                  </div>
                  
                  <center>
                    <a href="${baseUrl}/dashboard" class="button">
                      Visit Dashboard
                    </a>
                  </center>
                  
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    This email was sent from the NYALTX admin panel. If you have any questions, 
                    please contact our support team.
                  </p>
                </div>
                
                <div class="footer">
                  <p style="margin: 0 0 10px 0;">
                    <strong>NYALTX</strong> - Your Crypto Trading Platform
                  </p>
                  <p style="margin: 0;">
                    &copy; ${new Date().getFullYear()} NYALTX. All rights reserved.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `
        };

        const response = await fetch(`${baseUrl}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload),
        });

        if (response.ok) {
          return { email: recipientEmail, success: true };
        } else {
          console.error(`Failed to send email to ${recipientEmail}`);
          return { email: recipientEmail, success: false };
        }
      } catch (error) {
        console.error(`Error sending email to ${recipientEmail}:`, error);
        return { email: recipientEmail, success: false };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failedRecipients = results.filter(r => !r.success).map(r => r.email);

    // Store email record in database
    const emailRecord: EmailRecord = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subject,
      message,
      recipients,
      recipientCount: recipients.length,
      sentBy: 'admin',
      sentAt: new Date().toISOString(),
      status: failedRecipients.length === 0 ? 'sent' : 'failed',
      failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined
    };

    try {
      const collection = await getCollection<EmailRecord>('email_history');
      await collection.insertOne(emailRecord as any);
      console.log('✅ Email record saved to database');
    } catch (dbError) {
      console.error('Failed to save email record:', dbError);
      // Don't fail the request if database save fails
    }

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      totalCount: recipients.length,
      failedCount: failedRecipients.length,
      failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined,
      message: failedRecipients.length === 0
        ? 'All emails sent successfully'
        : `${successCount} of ${recipients.length} emails sent successfully`
    });
  } catch (error) {
    console.error('Error sending client emails:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
