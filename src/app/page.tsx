import LandingPage from '@/page-components/LandingPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NYALTX.pro – Token Profiles & Project Visibility',
  description:
    'Discover token profiles, project details, and updates in one place. NYALTX.pro helps teams share information and connect with their community in a simple, organized way.',
  keywords:
    'crypto, cryptocurrency, token tracker, DeFi, meme tokens, blockchain, Ethereum, trading, gamification, Race to Liberty, NYAX',
  openGraph: {
    title: 'NYALTX.pro – Token Profiles & Project Visibility',
    description:
      'Discover token profiles, project details, and updates in one place. NYALTX.pro helps teams share information and connect with their community in a simple, organized way.',
    type: 'website',
  },
}

export const revalidate = 300;

export default function Page() {
  return <LandingPage />;
}
