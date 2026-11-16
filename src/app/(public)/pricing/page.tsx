import { PricingPage } from '@/components/PrigingPage';
import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'NYALTX Pricing: Plans for Project Visibility' },
  description:
    'Compare NYALTX plans for crypto projects that want exposure, listing support, and placement across the platform.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/pricing',
  },
  openGraph: {
    title: 'NYALTX Pricing: Plans for Project Visibility',
    description:
      'Compare NYALTX plans for crypto projects that want exposure, listing support, and placement across the platform.',
    type: 'website',
    url: 'https://www.nyaltx.pro/pricing',
    siteName: 'NYALTX',
  },
};

const Pricing = async () => {
  const tinaData = await tinaQueryOrJson(
    () => tinaClient.queries.pricing({ relativePath: 'pricing.json' }),
    'pricing',
    ['content/pricing/pricing.json', 'src/content/pricing/pricing.json'],
  );
  return <PricingPage tinaData={tinaData as any} />;
};

export default Pricing;
