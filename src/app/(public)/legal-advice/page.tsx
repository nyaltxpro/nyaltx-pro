import LegalAdviceClient from '@/page-components/LegalAdvice';
import { asTinaPageProps, loadJson } from '@/lib/loadTinaContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Advice | NYALTX',
  description: 'Read the NYALTX legal advice, disclaimers, and terms relating to crypto-asset information services.',
  alternates: { canonical: 'https://www.nyaltx.pro/legal-advice' },
};

export default async function LegalAdvicePage() {
  let res: any;
  try {
    const data = await loadJson('src/content/legaladvice/legaladvice.json');
    res = asTinaPageProps('legalAdvice', data);
  } catch {
    const data = await loadJson('content/legaladvice/settings.json');
    res = asTinaPageProps('legalAdvice', data);
  }
  return <LegalAdviceClient {...(res as any)} />;
}
