import { TokenSalePage } from '@/components/nyax/TokenSalePage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYAX Token Sale - NYALTX Platform',
    description: 'Purchase NYAX tokens directly on-chain with ETH, USDT, or credit card. Join the future of decentralized finance.',
    keywords: ['NYAX', 'token sale', 'purchase', 'crypto', 'DeFi', 'blockchain'],
};

export default function NYAXTokenSalePage() {
    return <TokenSalePage />;
}
