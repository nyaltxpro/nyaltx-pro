# PayPal Integration Setup

This document explains how to set up PayPal payments for the NYALTX pricing page.

## Prerequisites

1. A PayPal Business account
2. Access to PayPal Developer Dashboard

## Setup Instructions

### 1. Create PayPal Application

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal Business account
3. Click "Create App"
4. Fill in the application details:
   - **App Name**: NYALTX Payments
   - **Merchant**: Select your business account
   - **Features**: Check "Accept payments"
   - **Products**: Select "Checkout"

### 2. Get API Credentials

After creating the app, you'll get:
- **Client ID**: Used for authentication
- **Client Secret**: Used for server-side authentication

### 3. Environment Variables

Add the following variables to your `.env.local` file:

```bash
# PayPal Configuration (React SDK)
# Only the client ID needs to be public for the React SDK
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id-here

# Base URL for your application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

For production, update `NEXT_PUBLIC_BASE_URL` to your live domain.

### 4. Sandbox vs Live Environment

- **Sandbox (Development)**: Uses `https://api.sandbox.paypal.com`
- **Live (Production)**: Uses `https://api.paypal.com`

The environment is automatically determined by `NODE_ENV`:
- `development` = Sandbox
- `production` = Live

### 5. Testing

For testing in sandbox mode:
1. Create sandbox accounts in PayPal Developer Dashboard
2. Use sandbox credentials in your `.env.local`
3. Test payments with sandbox buyer accounts

## Payment Flow

1. User clicks "Pay with PayPal" button
2. PayPal SDK creates order directly in the browser
3. User completes payment in PayPal popup/redirect
4. PayPal SDK captures the payment automatically
5. System activates subscription and sets pro cookie
6. User is redirected to dashboard or success page

## Subscription Validity

- **NyaltxPro**: Valid for 1 year from purchase date
- **Race to Liberty tiers**: Campaign duration as specified

## Security Notes

- Never expose PayPal credentials in client-side code
- Always validate payments on the server side
- Use HTTPS in production
- Store sensitive data in environment variables

## Troubleshooting

### Common Issues

1. **"PayPal SDK not loading"**
   - Ensure `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set correctly
   - Check browser console for script loading errors

2. **"PayPal buttons not appearing"**
   - Verify PayPal client ID is valid
   - Check sandbox vs live environment settings

3. **Payment fails to complete**
   - Ensure PayPal account has sufficient funds (sandbox)
   - Check browser console for JavaScript errors

### Support

For PayPal-specific issues, refer to:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal API Reference](https://developer.paypal.com/api/rest/)
