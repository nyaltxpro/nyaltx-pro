const INVALID_CLIENT_ID_VALUES = new Set(['', 'test', 'your-paypal-client-id-here']);

export class PayPalCryptoConfigurationError extends Error {
  constructor() {
    super('PayPal crypto checkout is not configured. Set PAYPAL_CLIENT_SECRET on the server.');
    this.name = 'PayPalCryptoConfigurationError';
  }
}

export async function getPayPalCryptoAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() || '';

  if (INVALID_CLIENT_ID_VALUES.has(clientId) || !clientSecret || clientSecret === 'test') {
    throw new PayPalCryptoConfigurationError();
  }

  const sandbox =
    process.env.PAYPAL_ENVIRONMENT?.toLowerCase() === 'sandbox' ||
    (process.env.PAYPAL_ENVIRONMENT?.toLowerCase() !== 'live' &&
      (process.env.NODE_ENV !== 'production' || clientId.startsWith('sb-')));
  const apiBaseUrl = sandbox
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  const response = await fetch(`${apiBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('PayPal crypto OAuth failed with status:', response.status);
    throw new Error('PayPal could not authenticate the crypto checkout request.');
  }

  const tokenData: { access_token?: string } = await response.json();
  if (!tokenData.access_token) {
    throw new Error('PayPal returned no access token for crypto checkout.');
  }

  return { accessToken: tokenData.access_token, apiBaseUrl };
}
