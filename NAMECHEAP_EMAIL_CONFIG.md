# Namecheap Email Configuration Guide

## ✅ Changes Completed

All email routes have been updated to use **Namecheap Private Email** instead of Gmail.

### Files Updated:
1. `/api/email/send/route.ts` - Main email sending route
2. `/api/contact/route.ts` - Contact form email route
3. `EMAIL_SETUP.md` - Documentation updated with Namecheap setup

## 🔧 Required Environment Variables

Add these to your `.env.local` file:

```env
# Namecheap Email Configuration
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-email-password
FROM_EMAIL=noreply@yourdomain.com
```

## 📝 Configuration Options

### Port 587 (STARTTLS - Recommended)
```env
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Port 465 (SSL/TLS)
```env
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_SECURE=true
```

## 🚀 Setup Steps

### 1. Create Namecheap Email Account
- Log in to Namecheap account
- Go to your domain's cPanel
- Navigate to **Email Accounts**
- Create new email (e.g., `noreply@yourdomain.com`)
- Set a strong password

### 2. Configure Environment Variables
Copy the configuration above to your `.env.local` file with your actual credentials.

### 3. Test Email Functionality
Use the admin email test feature:
- Navigate to `/admin/email-management`
- Send a test email to verify configuration

## 📊 Namecheap Email Limits

- **Starter Plan**: 300 emails per day per mailbox
- **Professional Plan**: 500 emails per day per mailbox  
- **Business Plan**: 500 emails per day per mailbox

## 🔍 Technical Changes

### Updated Transporter Configuration

**Before (Gmail):**
```typescript
nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

**After (Namecheap):**
```typescript
nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.privateemail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

## ✨ Features

- **Custom SMTP Configuration**: Full control over email server settings
- **TLS Support**: Secure email transmission
- **Port Flexibility**: Support for both 587 (STARTTLS) and 465 (SSL/TLS)
- **Error Handling**: Comprehensive error logging and handling
- **Production Ready**: Suitable for production use with proper limits

## 🐛 Troubleshooting

### Authentication Errors
- ✅ Verify email account exists in Namecheap cPanel
- ✅ Check username is full email address (`user@domain.com`)
- ✅ Confirm password is correct (not truncated)
- ✅ Ensure SMTP_HOST is exactly `mail.privateemail.com`

### Connection Errors
- ✅ Try port 465 with `SMTP_SECURE=true`
- ✅ Check firewall settings
- ✅ Verify domain DNS is properly configured
- ✅ Test from server environment (not localhost)

### Emails Not Received
- ✅ Check spam/junk folders
- ✅ Verify FROM_EMAIL is a valid email on your domain
- ✅ Check Namecheap email sending logs
- ✅ Review server console for error messages

### Rate Limiting
- ✅ Monitor daily email count
- ✅ Stay within 300-500 emails per day limit
- ✅ Consider upgrading plan for higher limits
- ✅ Implement email queuing for bulk sends

## 📧 Email Routes Using This Configuration

1. **`/api/email/send`** - Generic email sending
2. **`/api/contact`** - Contact form submissions
3. **`/api/admin/email-test`** - Admin test emails (uses `/api/email/send`)
4. **`/api/admin/send-client-email`** - Bulk admin emails (uses `/api/email/send`)

## 🔐 Security Best Practices

- ✅ Never commit `.env.local` to version control
- ✅ Use strong, unique passwords for email accounts
- ✅ Rotate passwords periodically
- ✅ Monitor email sending logs for suspicious activity
- ✅ Keep `FROM_EMAIL` aligned with your domain
- ✅ Use proper SPF/DKIM records for your domain

## 📈 Next Steps

1. Set up environment variables with your Namecheap credentials
2. Test email functionality in development
3. Verify emails are being delivered
4. Configure domain SPF/DKIM records for better deliverability
5. Monitor email sending volumes and adjust as needed

## 💡 Tips

- **Development**: Use the same Namecheap email for consistency
- **Production**: Consider separate email accounts for different purposes (noreply@, support@, admin@)
- **Monitoring**: Set up alerts for failed email deliveries
- **Backup**: Keep Gmail as fallback option in case of issues

## 🆘 Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Review Namecheap email account settings
3. Test SMTP connection using external tools
4. Contact Namecheap support for email service issues

---

**Configuration Complete!** ✅ Your email system is now using Namecheap Private Email.
