import GovernancePortal from '@/components/nyax/GovernancePortalIntegrated';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYAX Governance - NYALTX Platform',
    description: 'Participate in NYAX platform governance. Create proposals, vote on decisions, and shape the future of the ecosystem.',
    keywords: ['NYAX', 'governance', 'voting', 'proposals', 'DAO', 'decentralized'],
};

export default function NYAXGovernancePage() {
    return <GovernancePortal />;
}
