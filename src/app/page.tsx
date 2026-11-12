import LandingPage from '@/page-components/LandingPage';
import type { Metadata } from 'next';
import { asTinaPageProps, loadJson } from '@/lib/loadTinaContent';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.com'),
  title: 'NYALTX | Digital Markets & Tokenized Securities Discovery Platform',
  description:
    'Discover digital markets, tokenized securities, and project visibility on NYALTX — connecting DeFi discovery with tokenized stock market data.',
  keywords:
    'NYALTX, digital markets, tokenized securities, xStocks, DeFi discovery, capital markets, blockchain, Governa, NYAX',
  alternates: {
    canonical: 'https://www.nyaltx.com',
  },
  openGraph: {
    title: 'NYALTX | Digital Markets & Tokenized Securities Discovery Platform',
    description:
      'Discover digital markets, tokenized securities, and project visibility on NYALTX — connecting DeFi discovery with tokenized stock market data.',
    type: 'website',
    url: 'https://www.nyaltx.com',
    siteName: 'NYALTX',
    images: [
      {
        url: 'https://www.nyaltx.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NYALTX — Digital Markets & Tokenized Securities',
      },
      {
        url: 'https://www.nyaltx.com/logo.png',
        width: 512,
        height: 512,
        alt: 'NYALTX Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nyaltx',
    creator: '@nyaltx',
    title: 'NYALTX | Digital Markets & Tokenized Securities Discovery Platform',
    description:
      'Discover digital markets, tokenized securities, and project visibility on NYALTX.',
    images: ['https://www.nyaltx.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const revalidate = 300;

export default async function Page() {
  let res: any;
  try {
    const data = await loadJson('src/content/landing/home.json');
    res = asTinaPageProps('landing', data);
  } catch {
    // Minimal fallback if JSON missing
    res = asTinaPageProps('landing', { hero: {}, features: {}, stats: {}, testimonials: {} });
  }
  return <LandingPage {...(res as any)} />;
}
