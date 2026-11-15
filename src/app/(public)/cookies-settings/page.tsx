import CookiesSettings from '@/page-components/Admin/CookiesSettings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Settings | NYALTX',
  description:
    'Manage your cookie preferences and learn how NYALTX uses cookies to improve your browsing experience.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/cookies-settings',
  },
};

export default function CookieSettingsPage() {
  return <CookiesSettings />;
}