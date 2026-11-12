import { asTinaPageProps, loadJson } from '@/lib/loadTinaContent';
import PrivacyPolicy from '@/page-components/PrivacyPolicy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | NYALTX',
  description: 'Read the NYALTX Privacy Policy to understand how we collect, use, and protect your personal data.',
  alternates: { canonical: 'https://www.nyaltx.com/privacy-policy' },
};

const PrivacyPolicyPage = async () => {
  let tinaData: any;
  try {
    const data = await loadJson('src/content/privacypolicy/privacypolicy.json');
    tinaData = asTinaPageProps('privacyPolicy', data);
  } catch {
    const data = await loadJson('content/privacypolicy/settings.json');
    tinaData = asTinaPageProps('privacyPolicy', data);
  }

  return <PrivacyPolicy tinaData={tinaData as any} />;
};

export default PrivacyPolicyPage;
