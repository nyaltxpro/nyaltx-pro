import type { Metadata } from 'next';

const SITE_URL = 'https://www.nyaltx.pro';

export function pageMetadata(title: string, description: string, pathname: string): Metadata {
  const url = new URL(pathname, SITE_URL).toString();

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'NYALTX',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}
