import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://nyaltx.pro';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about-us',
          '/contact',
          '/pricing',
          '/pro-signup',
          '/race-to-liberty',
          '/dashboard',
          '/dashboard/trade',
          '/dashboard/trading',
          '/dashboard/trending',
          '/dashboard/market-data',
          '/dashboard/favorites',
          '/dashboard/pairs',
          '/dashboard/pools',
          '/dashboard/add-new',
          '/dashboard/register-token',
          '/dashboard/create-token',
          '/dashboard/nyax-listings',
          '/dashboard/nfts',
          '/dashboard/gamification',
          '/dashboard/race-to-liberty',
          '/dashboard/events',
          '/dashboard/live-stream',
          '/dashboard/tools',
          '/dashboard/airdrops',
          '/pricing/race-to-liberty',
          '/pricing/boost-pack',
        ],
        disallow: [
          // Admin routes - keep private
          '/admin/*',
          '/dashboard/admin/*',

          // API routes - no indexing needed
          '/api/*',

          // Authentication and callback routes
          '/auth/*',

          // Success pages - no SEO value
          '/pricing/success',
          '/pricing/race-to-liberty/success',
          '/pricing/boost-pack/success',

          // Test and development routes
          '/test-email',
          '/websockets',

          // Private user data
          '/dashboard/settings',
          '/dashboard/connect',

          // Dynamic routes that might contain sensitive data
          '/dashboard/ad/*',
          '/dashboard/nfts/*',
          '/nyax-token-details/*',

          // Checkout pages - no indexing needed
          '/pricing/checkout/*',
          '/pricing/race-to-liberty/*/checkout',
          '/pricing/boost-pack/*/checkout',
        ],
      },
      // Special rules for search engine bots
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about-us',
          '/contact',
          '/pricing',
          '/race-to-liberty',
          '/dashboard',
          '/dashboard/trade',
          '/dashboard/trending',
          '/dashboard/market-data',
        ],
        disallow: ['/admin/*', '/api/*', '/auth/*', '/dashboard/settings', '/dashboard/connect'],
      },
      // Block admin access for all bots
      {
        userAgent: '*',
        disallow: ['/admin', '/admin/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
