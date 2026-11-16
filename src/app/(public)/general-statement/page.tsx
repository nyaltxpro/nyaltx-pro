import GeneralStatementClient from '@/page-components/GeneralStatement';
import { asTinaPageProps, loadJson } from '@/lib/loadTinaContent';
import type { Metadata } from 'next';

const baseUrl = 'https://www.nyaltx.pro';

export const metadata: Metadata = {
  title: { absolute: 'General Statement | NYALTX' },
  description:
    'NYALTX’s general statement on the informational nature of its content, the absence of warranties, and the limits of what the site offers.',
  alternates: { canonical: `${baseUrl}/general-statement` },
  openGraph: {
    title: 'General Statement | NYALTX',
    description:
      'NYALTX’s general statement on the informational nature of its content, the absence of warranties, and the limits of what the site offers.',
    url: `${baseUrl}/general-statement`,
    siteName: 'NYALTX',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default async function GeneralStatementPage() {
  // Load directly from static JSON — no Tina Cloud call in production.
  // This prevents the page from hanging / canceling when TinaCMS Cloud
  // is unreachable, which caused 0 kB "canceled" responses.
  let res: any;
  try {
    const data = await loadJson('src/content/generalstatement/generalstatement.json');
    res = asTinaPageProps('generalStatement', data);
  } catch {
    try {
      const data = await loadJson('content/generalstatement/generalstatement.json');
      res = asTinaPageProps('generalStatement', data);
    } catch (err) {
      console.error('[general-statement] Failed to load JSON:', err);
      // Return minimal fallback so the page never 500s
      res = asTinaPageProps('generalStatement', {
        title: 'General Statement',
        tagline: 'Compliance & Transparency',
        description: 'Please review our general terms and risk warnings.',
        sections: [],
      });
    }
  }

  return <GeneralStatementClient {...(res as any)} />;
}
