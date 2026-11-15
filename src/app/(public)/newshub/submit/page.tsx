import type { Metadata } from 'next';
import NewsPublishingPage from '@/page-components/Newshub/NewsPublishingPage';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: 'Publish Your News | NYALTX News Hub',
  description:
    'Publish your company announcements and press releases on the NYALTX News Hub with Direct Distribution or Full Service packages.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/newshub/submit',
  },
  openGraph: {
    title: 'Publish Your News | NYALTX News Hub',
    description:
      'Choose a publishing package and share your company news with the NYALTX community.',
    type: 'website',
    url: 'https://www.nyaltx.pro/newshub/submit',
    siteName: 'NYALTX',
  },
};

interface NewsPublishingRouteProps {
  searchParams: Promise<{ modal?: string; plan?: string }>;
}

export default async function NewsPublishingRoute({ searchParams }: NewsPublishingRouteProps) {
  const { modal, plan } = await searchParams;
  const initialPlan = plan === 'slider' ? 'slider' : 'feed';

  return <NewsPublishingPage openModalOnLoad={modal === 'open'} initialPlan={initialPlan} />;
}
