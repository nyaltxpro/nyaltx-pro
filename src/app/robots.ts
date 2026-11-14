import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.nyaltx.pro';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/adminpanel',
          '/adminpanel/*',
          '/api/admin/*',
          '/api/auth/*',
          '/pricing/success',
          '/pricing/*/success',
          '/pricing/checkout/*',
          '/pricing/*/*/checkout',
          '/dashboard/create-token',
          '/test-email',
          '/websockets',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
