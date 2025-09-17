# Admin Panel Setup Guide

## Environment Variables Required

To enable wallet authentication for the admin panel, you need to configure these environment variables:

### Required Variables

```bash
# Admin JWT Secret (generate a secure random string)
ADMIN_JWT_SECRET=your-super-secure-jwt-secret-here

# Admin Wallet Addresses (comma-separated, lowercase)
ADMIN_WALLET_ADDRESSES=0x77b6321d2888aa62f2a42620852fee8eedcfa77b,0x81ba7b98e49014bff22f811e9405640bc2b39cc0

# Optional: Admin Password (fallback authentication)
ADMIN_PASSWORD=your-secure-admin-password

# Optional: App Domain (for message signing)
NEXT_PUBLIC_APP_DOMAIN=nyax-admin
```

### Setup Steps

1. **Generate JWT Secret**:
   ```bash
   # Generate a secure random string (32+ characters)
   openssl rand -base64 32
   ```

2. **Configure Admin Wallet Addresses**:
   - Add your wallet address(es) to `ADMIN_WALLET_ADDRESSES`
   - Use lowercase format: `0x1234...`
   - Separate multiple addresses with commas
   - No spaces between addresses

3. **Add to your `.env.local` file**:
   ```bash
   ADMIN_JWT_SECRET=your-generated-secret
   ADMIN_WALLET_ADDRESSES=0x77b6321d2888aa62f2a42620852fee8eedcfa77b,0x81ba7b98e49014bff22f811e9405640bc2b39cc0
   ADMIN_PASSWORD=fallback-password
   NEXT_PUBLIC_APP_DOMAIN=nyax-admin
   ```

### Wallet Authentication Flow

1. User clicks "Connect Wallet" on `/admin/login`
2. Wallet connection modal opens
3. After connection, user clicks "Sign Message to Authenticate"
4. Wallet prompts for message signature
5. Server verifies signature and wallet address
6. If authorized, user is redirected to admin dashboard

### Troubleshooting

**"Address not allowed" error**:
- Check that your wallet address is in `ADMIN_WALLET_ADDRESSES`
- Ensure the address is lowercase
- Verify no extra spaces in the environment variable

**"Failed to get authentication nonce" error**:
- Check that `ADMIN_JWT_SECRET` is set
- Restart your development server after adding env vars

**Wallet connection issues**:
- Ensure you have a Web3 wallet installed (MetaMask, etc.)
- Check that the wallet is connected to the correct network
- Try refreshing the page and reconnecting

### Security Notes

- Never commit `.env.local` to version control
- Use strong, unique values for `ADMIN_JWT_SECRET`
- Only add trusted wallet addresses to `ADMIN_WALLET_ADDRESSES`
- Consider using hardware wallets for admin access in production
