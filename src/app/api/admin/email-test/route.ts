import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to } = body;

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Prepare test email
    const emailPayload = {
      to,
      subject: 'NYALTX Admin Test Email',
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
            }
            .header {
              background: linear-gradient(135deg, #00b8d8 0%, #0099b8 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .info-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #00b8d8;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              margin-top: 30px;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #00b8d8 0%, #0099b8 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">NYALTX</div>
            <p>Admin Email System Test</p>
          </div>
          
          <div class="content">
            <h2>✅ Email System Working!</h2>
            
            <p>This is a test email from the NYALTX admin email management system.</p>
            
            <div class="info-box">
              <h3>📧 Email Configuration Status</h3>
              <ul>
                <li><strong>Status:</strong> Active</li>
                <li><strong>Sent At:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Recipient:</strong> ${to}</li>
                <li><strong>Service:</strong> NYALTX Admin Panel</li>
              </ul>
            </div>
            
            <p>If you received this email, it means your email notification system is configured correctly and working as expected.</p>
            
            <p><strong>What you can do with the email system:</strong></p>
            <ul>
              <li>Manage email recipients for admin notifications</li>
              <li>Send automated token registration alerts</li>
              <li>Configure notification preferences</li>
              <li>Monitor email delivery status</li>
            </ul>
            
            <center>
              <a href="https://nyaltx-pro-5hqd.vercel.app/admin/email-management" class="button">
                Manage Email Settings
              </a>
            </center>
            
            <div class="footer">
              <p>This is an automated test email from NYALTX Admin Panel</p>
              <p>&copy; ${new Date().getFullYear()} NYALTX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Call email sending API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx-pro-5hqd.vercel.app';
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email send failed:', response.status, errorText);
      throw new Error(`Email service error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Test email sent successfully to:', to);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      recipient: to,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
