import LandingPage from '@/page-components/LandingPage';
import type { Metadata } from 'next';
import homeContent from '../../content/landing/home.json';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'New York Alt Exchange | Digital Asset Discovery & News | NYALTX' },
  description:
    'NYALTX (New York Alt Exchange) links DeFi project discovery with tokenized securities data, market news, and trading tools in one platform.',
  keywords:
    'NYALTX, New York Alt Exchange, NYAX, digital markets, tokenized securities, xStocks, DeFi discovery, capital markets, blockchain, crypto trading, tokenized stocks',
  alternates: {
    canonical: 'https://www.nyaltx.pro',
  },
  openGraph: {
    title: 'New York Alt Exchange | Digital Asset Discovery & News | NYALTX',
    description:
      'NYALTX (New York Alt Exchange) links DeFi project discovery with tokenized securities data, market news, and trading tools in one platform.',
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
    title: 'New York Alt Exchange | Digital Asset Discovery & News | NYALTX',
    description:
      'NYALTX (New York Alt Exchange) links DeFi project discovery with tokenized securities data, market news, and trading tools in one platform.',
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

export default function Page() {
  return <LandingPage initialContent={homeContent} />;
}
