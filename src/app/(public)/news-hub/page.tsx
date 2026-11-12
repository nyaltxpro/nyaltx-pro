import PublicHeader from '@/components/PublicHeader';
import NewsHubComponent from '@/components/NewsHub/NewsHubComponent';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: 'NYALTX News Hub – Where Wall Street Meets Web3',
  description:
    'The latest on NYAX, tokenized securities, and the wider crypto market from trusted sources and our community. Submit news, press releases, and feature in our top banner.',
  keywords: 'NYALTX news, crypto news hub, press releases, tokenized securities, blockchain news, NYAX token, alt assets',
  alternates: {
    canonical: 'https://www.nyaltx.pro/news-hub',
  },
  openGraph: {
    title: 'NYALTX News Hub – Where Wall Street Meets Web3',
    description:
      'The latest on NYAX, tokenized securities, and the wider crypto market from trusted sources and our community. Submit news, press releases, and feature in our top banner.',
    type: 'website',
    url: 'https://www.nyaltx.pro/news-hub',
    siteName: 'NYALTX',
    images: [
      {
        url: 'https://www.nyaltx.pro/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NYALTX News Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nyaltx',
    creator: '@nyaltx',
    title: 'NYALTX News Hub – Where Wall Street Meets Web3',
    description:
      'The latest on NYAX, tokenized securities, and the wider crypto market. Submit your news and press releases.',
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

export const revalidate = 60; // Revalidate every 60 seconds

export default function NewsHubPage() {
  return (
    <div className="flex flex-col min-h-screen text-white bg-[#070b12]">
      <PublicHeader />
      <main className="flex-1">
        <NewsHubComponent />
      </main>
      <Footer />
    </div>
  );
}

