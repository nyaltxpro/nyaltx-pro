import CookiesSettings from '@/page-components/Admin/CookiesSettings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Cookie Settings | NYALTX' },
  description:
    'Manage which cookies NYALTX uses for analytics, preferences, and site performance, and update your consent at any time.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/cookies-settings',
  },
};

export default function CookieSettingsPage() {
  return <CookiesSettings />;
}