# Email Notification Setup Guide

This guide explains how to set up email notifications for token registration in the NYALTX platform.

## Overview

The email system sends notifications for:
- **User Confirmations**: When users register tokens (if email provided)
- **Admin Notifications**: When new tokens are submitted for review
- **Approval/Rejection**: When admin approves or rejects tokens

## Required Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Service Configuration
EMAIL_PROVIDER=smtp  # Options: smtp, gmail, sendgrid
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@nyaltx.com

# Admin Email Addresses (comma-separated)
ADMIN_EMAIL_ADDRESSES=admin@nyaltx.com,support@nyaltx.com

# Base URL for email links
NEXT_PUBLIC_BASE_URL=https://nyaltx.com
```

## Email Provider Setup

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Configure Environment Variables**:
   ```env
   EMAIL_PROVIDER=gmail
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Create SendGrid Account** at [sendgrid.com](https://sendgrid.com)
2. **Generate API Key**:
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
3. **Configure Environment Variables**:
   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

### Option 3: Custom SMTP

1. **Get SMTP Credentials** from your email provider
2. **Configure Environment Variables**:
   ```env
   EMAIL_PROVIDER=smtp
   SMTP_HOST=mail.your-domain.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=noreply@your-domain.com
   SMTP_PASSWORD=your-smtp-password
   ```

## Email Templates

The system includes three professional email templates:

### 1. User Registration Confirmation
- **Sent to**: User (if email provided)
- **When**: Immediately after token registration
- **Content**: Registration details, next steps, tracking info

### 2. Admin Notification
- **Sent to**: Admin team
- **When**: New token registration submitted
- **Content**: Token details, quick action buttons, verification checklist

### 3. Approval/Rejection Notification
- **Sent to**: User (if email provided)
- **When**: Admin approves or rejects token
- **Content**: Status update, next steps, support links

## API Endpoints

### Email Sending API
- **Endpoint**: `POST /api/email/send`
- **Purpose**: Send emails with HTML templates
- **Authentication**: Server-side only

**Request Body**:
```json
{
  "to": "user@example.com",
  "subject": "Token Registration Confirmation",
  "html": "<html>...</html>",
  "text": "Plain text version (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "email-message-id"
}
```

## Integration Points

### Token Registration Flow

1. **User submits form** → Includes optional email field
2. **Token saved to database** → Registration record created
3. **Email notifications sent**:
   - User confirmation (if email provided)
   - Admin notification (always sent)
4. **Admin reviews token** → Uses email links for quick actions
5. **Status update** → User notified of approval/rejection

### Email Triggers

**Registration API** (`/api/tokens/register/route.ts`):
```typescript
// After successful registration
await sendTokenRegistrationEmails(record);
```

**Admin Actions** (future implementation):
```typescript
// After approval/rejection
await sendTokenApprovalEmail(tokenData, approved);
```

## Email Content Features

### Professional Design
- **Responsive HTML**: Works on desktop and mobile
- **Brand Consistent**: NYALTX colors and styling
- **Clear CTAs**: Action buttons for admin and users

### Dynamic Content
- **Token Details**: Name, symbol, blockchain, contract address
- **Status Badges**: Visual status indicators
- **Quick Actions**: Direct links to admin panel
- **Verification Links**: Contract explorer links

### Accessibility
- **Plain Text Fallback**: Automatic HTML to text conversion
- **High Contrast**: Readable colors and fonts
- **Clear Structure**: Logical information hierarchy

## Testing

### Development Testing

1. **Set up Gmail App Password** (easiest for testing)
2. **Configure environment variables**
3. **Test registration flow**:
   ```bash
   # Register a test token with email
   curl -X POST http://localhost:3000/api/tokens/register \
     -H "Content-Type: application/json" \
     -d '{
       "tokenName": "Test Token",
       "tokenSymbol": "TEST",
       "blockchain": "ethereum",
       "contractAddress": "0x1234...",
       "userEmail": "test@example.com"
     }'
   ```

### Production Testing

1. **Use SendGrid or production SMTP**
2. **Test with real admin emails**
3. **Verify email deliverability**
4. **Check spam folder placement**

## Error Handling

### Email Failures
- **Registration continues** even if emails fail
- **Errors logged** to console for debugging
- **Graceful degradation** - no user-facing errors

### Common Issues

1. **Authentication Failed**:
   - Check SMTP credentials
   - Verify app password for Gmail
   - Ensure 2FA is enabled

2. **Emails in Spam**:
   - Set up SPF/DKIM records
   - Use reputable email service
   - Include unsubscribe links

3. **Rate Limiting**:
   - Implement email queuing for high volume
   - Use professional email service
   - Monitor sending limits

## Monitoring

### Email Logs
```typescript
// Success logs
console.log(`User confirmation sent to ${email} for token ${symbol}`);
console.log(`Admin notification sent to ${adminEmail} for token ${symbol}`);

// Error logs
console.error(`Failed to send email to ${email}:`, error);
```

### Metrics to Track
- **Email delivery rate**
- **Open rates** (if using service with tracking)
- **Click-through rates** on admin actions
- **Failed delivery attempts**

## Security Considerations

### Email Security
- **Server-side only**: API keys never exposed to client
- **Input validation**: Email addresses validated
- **Rate limiting**: Prevent email spam
- **Secure credentials**: Use environment variables

### Content Security
- **No sensitive data**: Avoid private keys or passwords
- **Public information only**: Contract addresses are public
- **Secure links**: Use HTTPS for all email links

## Future Enhancements

### Planned Features
- **Email preferences**: User opt-in/opt-out settings
- **Email templates editor**: Admin customizable templates
- **Bulk notifications**: Mass email capabilities
- **Email analytics**: Detailed delivery and engagement metrics

### Advanced Features
- **Email queuing**: Background job processing
- **Template versioning**: A/B testing capabilities
- **Internationalization**: Multi-language email support
- **Rich notifications**: Include token logos and charts

## Troubleshooting

### Common Solutions

1. **No emails received**:
   - Check spam/junk folders
   - Verify email configuration
   - Check server logs for errors

2. **Gmail authentication issues**:
   - Enable 2-Factor Authentication
   - Generate new App Password
   - Use exact 16-character password

3. **SendGrid delivery issues**:
   - Verify domain authentication
   - Check sender reputation
   - Review SendGrid activity logs

4. **Template rendering issues**:
   - Test HTML in email clients
   - Validate HTML structure
   - Check CSS compatibility

For additional support, contact the development team or check the server logs for detailed error messages.
