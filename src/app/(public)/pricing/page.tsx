import { PricingPage } from '@/components/PrigingPage';
import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'NYALTX Pricing: Corporate Visibility & Media' },
  description:
    'Publish company news, build a project profile, and boost visibility with NYALTX news releases, media packages, Race to Liberty, and Boost Packs.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/pricing',
  },
  openGraph: {
    title: 'NYALTX Pricing: Corporate Visibility & Media',
    description:
      'Publish company news, build a project profile, and boost visibility with NYALTX news releases, media packages, Race to Liberty, and Boost Packs.',
    type: 'website',
    url: 'https://www.nyaltx.pro/pricing',
    siteName: 'NYALTX',
  },
};

const Pricing = async () => {
  const tinaData = await tinaQueryOrJson(
    () => tinaClient.queries.pricing({ relativePath: 'pricing.json' }),
    'pricing',
    ['content/pricing/pricing.json', 'src/content/pricing/pricing.json']
  );
  return <PricingPage tinaData={tinaData as any} />;
};

export default Pricing;
