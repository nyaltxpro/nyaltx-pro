import AboutClient from '@/page-components/Aboutus';
import { asTinaPageProps, loadJson } from '@/lib/loadTinaContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'About NYALTX: The New York Alt Exchange Story' },
  description:
    'Learn why NYALTX was built, what the New York Alt Exchange stands for, and how it connects DeFi with traditional markets.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/about-us',
  },
  openGraph: {
    title: 'About NYALTX: The New York Alt Exchange Story',
    description:
      'Learn why NYALTX was built, what the New York Alt Exchange stands for, and how it connects DeFi with traditional markets.',
    type: 'website',
    url: 'https://www.nyaltx.pro/about-us',
    siteName: 'NYALTX',
  },
};

export default async function AboutPage() {
  let res: any;
  try {
    const data = await loadJson('src/content/aboutus/aboutus.json');
    res = asTinaPageProps('aboutUs', data);
  } catch {
    const data = await loadJson('content/aboutus/settings.json');
    res = asTinaPageProps('aboutUs', data);
  }
  return <AboutClient {...(res as any)} />;
}
