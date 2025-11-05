import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.nyaltx.pro';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about-us',
          '/contact',
          '/pricing',
          '/dashboard',
          '/logo.png',
          '/favicon.ico',
          '/apple-touch-icon.png',
          '/android-chrome-*.png',
          '/og-image.png',
          '/_next/*',
          '/images/*',
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
          '/dashboard',
        ],
        disallow: ['/admin/*', '/api/*', '/auth/*',],
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
