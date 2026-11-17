import 'server-only';

const INVALID_CLIENT_ID_VALUES = new Set(['', 'test', 'your-paypal-client-id-here']);
let warnedAboutLegacySecret = false;

export class PayPalCryptoConfigurationError extends Error {
  constructor(
    message = 'PayPal crypto checkout is not configured. Set PAYPAL_CLIENT_SECRET on the server.',
  ) {
    super(message);
    this.name = 'PayPalCryptoConfigurationError';
  }
}

export class PayPalCryptoAuthenticationError extends Error {
  constructor() {
    super(
      'PayPal authentication failed. Confirm the client ID and secret are from the same PayPal app and PAYPAL_ENVIRONMENT matches its sandbox or live environment.',
    );
    this.name = 'PayPalCryptoAuthenticationError';
  }
}

export async function getPayPalCryptoAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || '';
  const serverSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() || '';
  const legacySecret = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET?.trim() || '';
  const clientSecret = serverSecret || legacySecret;

  if (!serverSecret && legacySecret && !warnedAboutLegacySecret) {
    console.warn(
      'PayPal crypto checkout is using NEXT_PUBLIC_PAYPAL_CLIENT_SECRET. Move it to PAYPAL_CLIENT_SECRET.',
    );
    warnedAboutLegacySecret = true;
  }

  if (INVALID_CLIENT_ID_VALUES.has(clientId) || !clientSecret || clientSecret === 'test') {
    throw new PayPalCryptoConfigurationError();
  }

  const environment = process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase();
  if (environment && environment !== 'sandbox' && environment !== 'live') {
    throw new PayPalCryptoConfigurationError(
      'Invalid PayPal environment. Set PAYPAL_ENVIRONMENT to sandbox or live.',
    );
  }

  const sandbox = environment
    ? environment === 'sandbox'
    : clientId.toLowerCase().startsWith('sb-') || process.env.NODE_ENV !== 'production';
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

  const tokenData: { access_token?: string; error?: string; error_description?: string } =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('PayPal crypto OAuth failed:', {
      status: response.status,
      error: tokenData.error,
      description: tokenData.error_description,
    });
    throw new PayPalCryptoAuthenticationError();
  }

  if (!tokenData.access_token) {
    throw new Error('PayPal returned no access token for crypto checkout.');
  }

  return { accessToken: tokenData.access_token, apiBaseUrl };
}
