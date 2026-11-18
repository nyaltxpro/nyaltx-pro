import type { Metadata } from 'next';
import NewsPublishingPage from '@/page-components/Newshub/NewsPublishingPage';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: 'Corporate Visibility & Media Solutions | NYALTX',
  description:
    'Reach fintech, digital asset and capital markets audiences through news publishing, project discovery, executive interviews, advertising and investor events.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/newshub/submit',
  },
  openGraph: {
    title: 'Corporate Visibility & Media Solutions | NYALTX',
    description:
      'Explore NYALTX news publishing, project discovery, fintech media and corporate roadshow services.',
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
  const testPlanEnabled = process.env.NEXT_PUBLIC_ENABLE_NEWS_TEST_PLAN === 'true';
  const initialPlan =
    plan === 'slider' ? 'slider' : plan === 'test' && testPlanEnabled ? 'test' : 'feed';

  return (
    <NewsPublishingPage
      openModalOnLoad={modal === 'open'}
      initialPlan={initialPlan}
      enableTestPlan={testPlanEnabled}
    />
  );
}
