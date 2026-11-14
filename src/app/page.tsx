import LandingPage from '@/page-components/LandingPage';
import type { Metadata } from 'next';
import { loadJson } from '@/lib/loadTinaContent';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: 'NYALTX | New York Alt Exchange — Digital Markets & Tokenized Securities',
  description:
    'NYALTX (New York Alt Exchange) is the premier digital markets and tokenized securities discovery platform — connecting DeFi discovery with institutional tokenized stock market intelligence.',
  keywords:
    'NYALTX, New York Alt Exchange, NYAX, digital markets, tokenized securities, xStocks, DeFi discovery, capital markets, blockchain, crypto trading, tokenized stocks',
  alternates: {
    canonical: 'https://www.nyaltx.pro',
  },
  openGraph: {
    title: 'NYALTX | New York Alt Exchange — Digital Markets & Tokenized Securities',
    description:
      'Discover digital markets, tokenized securities, and project visibility on NYALTX (New York Alt Exchange) — connecting DeFi discovery with tokenized stock market data.',
    type: 'website',
    url: 'https://www.nyaltx.pro',
    siteName: 'NYALTX',
    images: [
      {
        url: 'https://www.nyaltx.pro/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NYALTX — Digital Markets & Tokenized Securities',
      },
      {
        url: 'https://www.nyaltx.pro/logo.png',
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
    title: 'NYALTX | New York Alt Exchange — Digital Markets & Tokenized Securities',
    description:
      'Discover digital markets, tokenized securities, and project visibility on NYALTX (New York Alt Exchange).',
    images: ['https://www.nyaltx.pro/og-image.png'],
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
  let initialContent: any = null;
  try {
    initialContent = await loadJson('content/landing/home.json');
  } catch (err) {
    console.error('Failed to load home.json for SSR:', err);
  }
  return <LandingPage initialContent={initialContent} />;
}
