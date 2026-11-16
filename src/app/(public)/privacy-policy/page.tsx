import { asTinaPageProps, loadJson } from '@/lib/loadTinaContent';
import PrivacyPolicy from '@/page-components/PrivacyPolicy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | NYALTX' },
  description:
    'Read how NYALTX collects, uses, and protects your personal data when you visit the site or use the platform, and how to exercise your data rights.',
  alternates: { canonical: 'https://www.nyaltx.pro/privacy-policy' },
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
