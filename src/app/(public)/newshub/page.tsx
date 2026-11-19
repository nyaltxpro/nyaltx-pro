import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import NewshubPage from '@/page-components/Newshub/NewshubPage';
import { Metadata } from 'next';
import { getNewshubInitialData } from '@/lib/newshubInitialData';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'Digital Asset & Tokenization News Hub' },
  description:
    'Stay informed with the latest digital asset news, market developments, token launches, DeFi innovations, and tokenized securities. Discover industry headlines, company announcements, and press releases—all in one place.',
  keywords:
    'NYALTX news, crypto news hub, press releases, tokenized securities, blockchain news, NYAX token, alt assets',
  alternates: {
    canonical: 'https://www.nyaltx.pro/newshub',
  },
  openGraph: {
    title: 'Digital Asset & Tokenization News Hub',
    description:
      'Stay informed with the latest digital asset news, market developments, token launches, DeFi innovations, and tokenized securities. Discover industry headlines, company announcements, and press releases—all in one place.',
    type: 'website',
    url: 'https://www.nyaltx.pro/newshub',
    siteName: 'NYALTX | New York Alt Exchange',
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
    title: 'Digital Asset & Tokenization News Hub',
    description:
      'Stay informed with the latest digital asset news, market developments, token launches, DeFi innovations, and tokenized securities. Discover industry headlines, company announcements, and press releases—all in one place.',
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

export const revalidate = 60;

export default async function NewshubRoute() {
  let initialData: Awaited<ReturnType<typeof getNewshubInitialData>> | undefined;
  try {
    initialData = await getNewshubInitialData();
  } catch (error) {
    console.error('Failed to load Newshub content for SSR:', error);
  }

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#070b12]">
      <PublicHeader />
      <main className="flex-1">
        <NewshubPage initialData={initialData} />
      </main>
      <Footer />
    </div>
  );
}
