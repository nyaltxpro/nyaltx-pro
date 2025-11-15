import LandingPage from '@/page-components/LandingPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NYALTX | Crypto Token Tracker & DeFi Platform',
  description:
    'Discover, track, and grow your crypto tokens with NYALTX. Real-time insights, curated listings, and gamified promotion across multiple blockchains.',
  keywords:
    'crypto, cryptocurrency, token tracker, DeFi, meme tokens, blockchain, Ethereum, trading, gamification, Race to Liberty, NYAX',
  openGraph: {
    title: 'NYALTX | Crypto Token Tracker & DeFi Platform',
    description: 'Discover, track, and grow your crypto tokens with NYALTX. Real-time insights, curated listings, and gamified promotion across multiple blockchains.',
    type: 'website',
  },
}

export const revalidate = 300;

export default function Page() {
  return <LandingPage />;
}
