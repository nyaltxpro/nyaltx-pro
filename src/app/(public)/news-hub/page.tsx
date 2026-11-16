import PublicHeader from '@/components/PublicHeader';
import NewsHubComponent from '@/components/NewsHub/NewsHubComponent';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import { getNewshubInitialData } from '@/lib/newshubInitialData';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'NYALTX News Hub: Digital Asset Market Updates' },
  description:
    'Browse blockchain developments, exchange listings, and tokenized securities coverage from the New York Alt Exchange team.',
  keywords: 'NYALTX news, crypto news hub, press releases, tokenized securities, blockchain news, NYAX token, alt assets',
  alternates: {
    canonical: 'https://www.nyaltx.pro/news-hub',
  },
  openGraph: {
    title: 'NYALTX News Hub: Digital Asset Market Updates',
    description:
      'Browse blockchain developments, exchange listings, and tokenized securities coverage from the New York Alt Exchange team.',
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
    title: 'NYALTX News Hub: Digital Asset Market Updates',
    description:
      'Browse blockchain developments, exchange listings, and tokenized securities coverage from the New York Alt Exchange team.',
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

export default async function NewsHubPage() {
  let initialData: Awaited<ReturnType<typeof getNewshubInitialData>> | undefined;
  try {
    initialData = await getNewshubInitialData();
  } catch (error) {
    console.error('Failed to load News Hub content for SSR:', error);
  }

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#070b12]">
      <PublicHeader />
      <main className="flex-1">
        <NewsHubComponent initialData={initialData} />
      </main>
      <Footer />
    </div>
  );
}

