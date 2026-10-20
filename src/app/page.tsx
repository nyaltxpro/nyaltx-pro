import LandingPage from '@/page-components/LandingPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NYALTX | Digital Markets & Tokenized Securities Discovery Platform',
  description:
    'Discover digital markets, tokenized securities, and project visibility on NYALTX — connecting DeFi discovery with tokenized stock market data.',
  keywords:
    'NYALTX, digital markets, tokenized securities, xStocks, DeFi discovery, capital markets, blockchain, Governa, NYAX',
  openGraph: {
    title: 'NYALTX | Digital Markets & Tokenized Securities Discovery Platform',
    description:
      'Discover digital markets, tokenized securities, and project visibility on NYALTX — connecting DeFi discovery with tokenized stock market data.',
    type: 'website',
    url: 'https://www.nyaltx.pro',
    siteName: 'NYALTX',
    images: [
      {
        url: 'https://www.nyaltx.pro/og-image.png',
        width: 512,
        height: 512,
        alt: 'NYALTX Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NYALTX | Digital Markets & Tokenized Securities Discovery Platform',
    description:
      'Discover digital markets, tokenized securities, and project visibility on NYALTX.',
    images: ['https://www.nyaltx.pro/og-image.png'],
  },
};

export const revalidate = 300;

export default function Page() {
  return <LandingPage />;
}
