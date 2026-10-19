import { PricingPage } from '@/components/PrigingPage';
import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NYALTX Pricing – Simple Plans for Project Visibility',
  description:
    'Explore straightforward pricing options for showcasing your project on NYALTX.pro. Choose the plan that fits your team’s visibility goals.',
  openGraph: {
    title: 'NYALTX Pricing – Simple Plans for Project Visibility',
    description:
      'Explore straightforward pricing options for showcasing your project on NYALTX.pro. Choose the plan that fits your team’s visibility goals.',
    type: 'website',
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
