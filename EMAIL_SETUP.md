# Email Newsletter Setup Guide

This guide explains how to set up the email newsletter functionality using Nodemailer.

## Features Implemented

✅ **Newsletter Signup Form** in Footer  
✅ **Welcome Email** sent to subscribers  
✅ **Admin Notifications** for new subscriptions  
✅ **Email Validation** and error handling  
✅ **Professional HTML Email Templates**  
✅ **Responsive Form UI** with loading states

## Setup Instructions

### 1. Install Dependencies

The required packages are already installed:

```bash
npm install nodemailer @types/nodemailer
```

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here

# Email addresses
FROM_EMAIL=noreply@nyaltx.io
ADMIN_EMAIL=admin@nyaltx.io
```

### 3. Gmail Setup (Recommended)

For Gmail SMTP:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS` (not your regular password)

### 4. Alternative Email Providers

#### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

#### AWS SES

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## API Endpoints

### POST `/api/newsletter`

Subscribe a user to the newsletter.

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe" // optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter!"
}
```

### GET `/api/newsletter`

Check service status.

**Response:**

```json
{
  "service": "NYALTX Newsletter API",
  "status": "active",
  "timestamp": "2025-01-30T03:55:47.000Z"
}
```

## Email Templates

### Welcome Email Features:

- 🎨 Professional HTML design with NYALTX branding
- 📱 Mobile-responsive layout
- 🔗 Links to dashboard and social media
- 📋 List of community benefits
- 🎯 Call-to-action buttons

### Admin Notification Features:

- 📧 New subscriber details
- 🕒 Timestamp and IP tracking
- 📊 Simple format for easy processing

## Form Features

### User Experience:

- **Name Field**: Optional for personalization
- **Email Validation**: Client and server-side validation
- **Loading States**: "Signing Up..." indicator
- **Success/Error Messages**: Clear feedback
- **Form Reset**: Clears after successful submission

### UI Components:

- **Responsive Design**: Works on mobile and desktop
- **Gradient Styling**: Matches NYALTX brand colors
- **Disabled States**: Prevents double submissions
- **Accessibility**: Proper form labels and ARIA attributes

## Testing

### Test the Newsletter Signup:

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Navigate to any page** with the footer

3. **Fill out the form** in the "Join Our Community" section

4. **Check the console** for success/error messages

5. **Verify emails** are sent (check spam folder)

### Test API Directly:

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

## Troubleshooting

### Common Issues:

1. **"Email service not configured"**
   - Check environment variables are set
   - Verify SMTP credentials

2. **"SMTP verification failed"**
   - Check SMTP host and port
   - Verify username/password
   - Check firewall settings

3. **Emails not received**
   - Check spam folder
   - Verify FROM_EMAIL domain
   - Test with different email providers

4. **Gmail "Less secure app access"**
   - Use App Password instead of regular password
   - Enable 2-factor authentication first

### Debug Mode:

Add this to your `.env.local` for detailed logging:

```bash
DEBUG=nodemailer:*
```

## Security Considerations

- ✅ Environment variables for sensitive data
- ✅ Email validation to prevent spam
- ✅ Rate limiting (can be added)
- ✅ Input sanitization
- ✅ Error handling without exposing internals

## Production Deployment

### Recommended Services:

1. **SendGrid** - Reliable, good free tier
2. **Mailgun** - Developer-friendly
3. **AWS SES** - Cost-effective for high volume
4. **Postmark** - High deliverability

### Environment Setup:

- Use production SMTP credentials
- Set proper FROM_EMAIL domain
- Configure SPF/DKIM records
- Monitor bounce rates

## Future Enhancements

Potential improvements:

- 📊 Subscriber management dashboard
- 📧 Email templates editor
- 📈 Analytics and open rates
- 🔄 Automated email sequences
- 📱 SMS notifications
- 🎯 Segmentation and targeting
- 📋 Unsubscribe functionality
- 🔒 Double opt-in confirmation

## Support

For issues or questions:

- Check the console for error messages
- Verify environment variables
- Test SMTP connection manually
- Review email provider documentation
