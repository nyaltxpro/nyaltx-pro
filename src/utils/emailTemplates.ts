import { TokenRegistration } from '@/app/api/tokens/register/route';

// Email template for user confirmation
export const createUserTokenRegistrationEmail = (tokenData: TokenRegistration) => {
  const subject = `Token Registration Submitted: ${tokenData.tokenName} (${tokenData.tokenSymbol})`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Token Registration Confirmation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #00b8d8;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #00b8d8;
          margin-bottom: 10px;
        }
        .title {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .token-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #495057;
        }
        .value {
          color: #6c757d;
          word-break: break-all;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          background: #fff3cd;
          color: #856404;
        }
        .next-steps {
          background: #e7f3ff;
          border-left: 4px solid #00b8d8;
          padding: 20px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #00b8d8;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 10px 0;
        }
        @media (max-width: 600px) {
          .info-row {
            flex-direction: column;
          }
          .value {
            margin-top: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🚀 NYALTX</div>
          <h1 class="title">Token Registration Confirmation</h1>
        </div>

        <p>Thank you for registering your token with NYALTX! Your submission has been received and is now under review.</p>

        <div class="token-info">
          <h3 style="margin-top: 0; color: #2c3e50;">Token Details</h3>
          <div class="info-row">
            <span class="label">Token Name:</span>
            <span class="value">${tokenData.tokenName}</span>
          </div>
          <div class="info-row">
            <span class="label">Symbol:</span>
            <span class="value">${tokenData.tokenSymbol}</span>
          </div>
          <div class="info-row">
            <span class="label">Blockchain:</span>
            <span class="value">${tokenData.blockchain}</span>
          </div>
          <div class="info-row">
            <span class="label">Contract Address:</span>
            <span class="value">${tokenData.contractAddress}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="status-badge">${tokenData.status}</span>
          </div>
          <div class="info-row">
            <span class="label">Registration ID:</span>
            <span class="value">${tokenData.id}</span>
          </div>
          <div class="info-row">
            <span class="label">Submitted:</span>
            <span class="value">${new Date(tokenData.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div class="next-steps">
          <h3 style="margin-top: 0; color: #0c5460;">What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Our team will review your token registration within 24-48 hours</li>
            <li>We'll verify the contract address and token details</li>
            <li>You'll receive an email notification once the review is complete</li>
            <li>Approved tokens will appear in search results and analytics</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.com'}/dashboard/tokens" class="button">
            View Your Tokens
          </a>
        </div>

        <div class="footer">
          <p>Need help? Contact us at <a href="mailto:support@nyaltx.com">support@nyaltx.com</a></p>
          <p>© ${new Date().getFullYear()} NYALTX. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

// Email template for admin notification
export const createAdminTokenRegistrationEmail = (tokenData: TokenRegistration) => {
  const subject = `New Token Registration: ${tokenData.tokenName} (${tokenData.tokenSymbol})`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Token Registration</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #dc3545;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #dc3545;
          margin-bottom: 10px;
        }
        .title {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .alert {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
        .token-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #495057;
        }
        .value {
          color: #6c757d;
          word-break: break-all;
        }
        .actions {
          background: #e7f3ff;
          border-left: 4px solid #007bff;
          padding: 20px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 5px 10px 5px 0;
        }
        .btn-approve {
          background: #28a745;
        }
        .btn-review {
          background: #007bff;
        }
        .btn-reject {
          background: #dc3545;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 14px;
        }
        @media (max-width: 600px) {
          .info-row {
            flex-direction: column;
          }
          .value {
            margin-top: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔔 NYALTX Admin</div>
          <h1 class="title">New Token Registration</h1>
        </div>

        <div class="alert">
          <strong>Action Required:</strong> A new token registration requires admin review and approval.
        </div>

        <div class="token-info">
          <h3 style="margin-top: 0; color: #2c3e50;">Token Details</h3>
          <div class="info-row">
            <span class="label">Token Name:</span>
            <span class="value">${tokenData.tokenName}</span>
          </div>
          <div class="info-row">
            <span class="label">Symbol:</span>
            <span class="value">${tokenData.tokenSymbol}</span>
          </div>
          <div class="info-row">
            <span class="label">Blockchain:</span>
            <span class="value">${tokenData.blockchain}</span>
          </div>
          <div class="info-row">
            <span class="label">Contract Address:</span>
            <span class="value">${tokenData.contractAddress}</span>
          </div>
          <div class="info-row">
            <span class="label">Submitted By:</span>
            <span class="value">${tokenData.submittedByAddress || 'Unknown'}</span>
          </div>
          <div class="info-row">
            <span class="label">Registration ID:</span>
            <span class="value">${tokenData.id}</span>
          </div>
          <div class="info-row">
            <span class="label">Submitted:</span>
            <span class="value">${new Date(tokenData.createdAt).toLocaleString()}</span>
          </div>
          ${tokenData.website ? `
          <div class="info-row">
            <span class="label">Website:</span>
            <span class="value"><a href="${tokenData.website}" target="_blank">${tokenData.website}</a></span>
          </div>
          ` : ''}
          ${tokenData.twitter ? `
          <div class="info-row">
            <span class="label">Twitter:</span>
            <span class="value"><a href="${tokenData.twitter}" target="_blank">${tokenData.twitter}</a></span>
          </div>
          ` : ''}
        </div>

        <div class="actions">
          <h3 style="margin-top: 0; color: #0c5460;">Quick Actions</h3>
          <p>Review this token registration and take appropriate action:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.com'}/admin/tokens?id=${tokenData.id}" class="button btn-review">
              Review Details
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.com'}/admin/tokens?id=${tokenData.id}&action=approve" class="button btn-approve">
              Quick Approve
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.com'}/admin/tokens?id=${tokenData.id}&action=reject" class="button btn-reject">
              Reject
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #495057;">Verification Checklist:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #6c757d;">
            <li>Verify contract address exists on the specified blockchain</li>
            <li>Check token name and symbol match the contract</li>
            <li>Review website and social media links for legitimacy</li>
            <li>Ensure token is not a duplicate or scam</li>
            <li>Confirm compliance with platform guidelines</li>
          </ul>
        </div>

        <div class="footer">
          <p>This is an automated notification from the NYALTX token registration system.</p>
          <p>© ${new Date().getFullYear()} NYALTX. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

// Email template for token approval notification
export const createTokenApprovalEmail = (tokenData: TokenRegistration, approved: boolean) => {
  const subject = `Token ${approved ? 'Approved' : 'Rejected'}: ${tokenData.tokenName} (${tokenData.tokenSymbol})`;
  
  const statusColor = approved ? '#28a745' : '#dc3545';
  const statusText = approved ? 'Approved' : 'Rejected';
  const statusIcon = approved ? '✅' : '❌';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Token Registration ${statusText}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid ${statusColor};
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: ${statusColor};
          margin-bottom: 10px;
        }
        .title {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .status-banner {
          background: ${approved ? '#d4edda' : '#f8d7da'};
          border: 1px solid ${approved ? '#c3e6cb' : '#f5c6cb'};
          color: ${approved ? '#155724' : '#721c24'};
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          font-size: 18px;
          font-weight: 600;
        }
        .token-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #495057;
        }
        .value {
          color: #6c757d;
          word-break: break-all;
        }
        .next-steps {
          background: ${approved ? '#e7f3ff' : '#fff3cd'};
          border-left: 4px solid ${approved ? '#007bff' : '#ffc107'};
          padding: 20px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: ${statusColor};
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${statusIcon} NYALTX</div>
          <h1 class="title">Token Registration ${statusText}</h1>
        </div>

        <div class="status-banner">
          ${statusIcon} Your token registration has been ${statusText.toLowerCase()}!
        </div>

        <div class="token-info">
          <h3 style="margin-top: 0; color: #2c3e50;">Token Details</h3>
          <div class="info-row">
            <span class="label">Token Name:</span>
            <span class="value">${tokenData.tokenName}</span>
          </div>
          <div class="info-row">
            <span class="label">Symbol:</span>
            <span class="value">${tokenData.tokenSymbol}</span>
          </div>
          <div class="info-row">
            <span class="label">Blockchain:</span>
            <span class="value">${tokenData.blockchain}</span>
          </div>
          <div class="info-row">
            <span class="label">Contract Address:</span>
            <span class="value">${tokenData.contractAddress}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value" style="color: ${statusColor}; font-weight: 600;">${statusText}</span>
          </div>
        </div>

        <div class="next-steps">
          <h3 style="margin-top: 0; color: #0c5460;">
            ${approved ? "What's Next?" : "Next Steps"}
          </h3>
          ${approved ? `
            <ul style="margin: 0; padding-left: 20px;">
              <li>Your token is now live on NYALTX platform</li>
              <li>Users can discover it in search results</li>
              <li>Analytics and charts are being generated</li>
              <li>Your token may be eligible for boost multipliers in Race to Liberty</li>
            </ul>
          ` : `
            <ul style="margin: 0; padding-left: 20px;">
              <li>Your token registration did not meet our current criteria</li>
              <li>You can submit a new registration with updated information</li>
              <li>Contact support if you believe this was an error</li>
              <li>Review our token listing guidelines for requirements</li>
            </ul>
          `}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.com'}/dashboard/tokens" class="button">
            ${approved ? 'View Your Token' : 'Submit New Registration'}
          </a>
        </div>

        <div class="footer">
          <p>Need help? Contact us at <a href="mailto:support@nyaltx.com">support@nyaltx.com</a></p>
          <p>© ${new Date().getFullYear()} NYALTX. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};
