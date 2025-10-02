# Gmail Contact Form Setup Guide

This guide will help you configure Gmail to send emails from the NYALTX contact form.

## Prerequisites

- A Gmail account
- Two-factor authentication enabled on your Gmail account
- Access to your `.env` file in the project root

## Step 1: Enable Two-Factor Authentication

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the instructions to enable 2FA if not already enabled

## Step 2: Generate App Password

1. In your Google Account settings, go to "Security"
2. Under "Signing in to Google", click on "App passwords"
3. You may need to sign in again
4. Select "Mail" as the app and "Other (Custom name)" as the device
5. Enter "NYALTX Contact Form" as the custom name
6. Click "Generate"
7. **Copy the 16-character password** - you'll need this for the `.env` file

## Step 3: Configure Environment Variables

Add or update these variables in your `.env` file:

```bash
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# Email addresses
FROM_EMAIL=noreply@nyaltx.com
ADMIN_EMAIL=admin@nyaltx.com
```

### Variable Explanations:

- **SMTP_USER**: Your Gmail email address
- **SMTP_PASS**: The 16-character App Password you generated (NOT your regular Gmail password)
- **FROM_EMAIL**: The "From" address that appears in emails (can be different from SMTP_USER)
- **ADMIN_EMAIL**: Where contact form submissions will be sent

## Step 4: Test the Configuration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the contact page: `http://localhost:3000/contact`

3. Fill out and submit the contact form

4. Check both:
   - Your admin email (ADMIN_EMAIL) for the contact form submission
   - The email address you used in the form for the auto-reply

## Email Features

The contact form sends two emails:

### 1. Admin Notification Email
- **To**: ADMIN_EMAIL
- **Subject**: "Contact Form: [Subject]"
- **Content**: Formatted contact form details with sender information

### 2. Auto-Reply Email
- **To**: User's email address
- **Subject**: "Thank you for contacting NYALTX"
- **Content**: Professional thank you message with copy of their submission

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**:
   - Ensure 2FA is enabled on your Gmail account
   - Double-check that you're using the App Password, not your regular password
   - Verify the SMTP_USER email address is correct

2. **"Connection timeout" error**:
   - Check your internet connection
   - Verify SMTP_HOST and SMTP_PORT are correct
   - Some networks block SMTP ports - try a different network

3. **Emails not being received**:
   - Check spam/junk folders
   - Verify ADMIN_EMAIL is correct
   - Test with a different email address

4. **"Authentication failed" error**:
   - Regenerate the App Password
   - Make sure there are no extra spaces in the SMTP_PASS value
   - Ensure the Gmail account has 2FA enabled

### Testing Commands:

You can test the API directly using curl:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message from the API."
  }'
```

## Security Notes

- Never commit your `.env` file to version control
- The App Password is specific to this application - don't reuse it elsewhere
- If you suspect the App Password is compromised, revoke it and generate a new one
- Consider using a dedicated Gmail account for sending emails rather than your personal account

## Production Considerations

For production deployment:

1. **Use a dedicated email account** for sending emails
2. **Set up proper DNS records** (SPF, DKIM, DMARC) for better deliverability
3. **Consider using a professional email service** like SendGrid, Mailgun, or AWS SES for higher volume
4. **Monitor email delivery** and bounce rates
5. **Implement rate limiting** to prevent spam abuse

## Alternative Email Services

If you prefer not to use Gmail, you can configure other SMTP services by updating these variables:

### Outlook/Hotmail:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo Mail:
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server:
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
```

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple email client to ensure SMTP credentials work
4. Refer to the [Nodemailer documentation](https://nodemailer.com/) for advanced configuration options

---

**Important**: Keep your App Password secure and never share it publicly. If you need to regenerate it, update your `.env` file with the new password.
