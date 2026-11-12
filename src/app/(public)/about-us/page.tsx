import AboutClient from '@/page-components/Aboutus';
import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.com'),
  title: 'About NYALTX – The Project Visibility Platform',
  description:
    'Learn who we are and how NYALTX helps Web3 projects share their story, showcase their work, and reach a wider audience across digital markets.',
  alternates: {
    canonical: 'https://www.nyaltx.com/about-us',
  },
  openGraph: {
    title: 'About NYALTX – The Project Visibility Platform',
    description:
      'Learn who we are and how NYALTX helps Web3 projects share their story, showcase their work, and reach a wider audience across digital markets.',
    type: 'website',
    url: 'https://www.nyaltx.com/about-us',
    siteName: 'NYALTX',
  },
};

export default async function AboutPage() {
  const res = await tinaQueryOrJson(
    () => tinaClient.queries.aboutUs({ relativePath: 'aboutus.json' }),
    'aboutUs',
    ['src/content/aboutus/aboutus.json', 'content/aboutus/settings.json'],
  );
  return <AboutClient {...(res as any)} />;
}
