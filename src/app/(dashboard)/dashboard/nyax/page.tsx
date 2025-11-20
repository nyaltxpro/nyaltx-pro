import { UserDashboard } from '@/components/nyax/UserDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYAX Dashboard - NYALTX Platform',
    description: 'Manage your NYAX tokens, view vesting schedules, participate in governance, and track your portfolio.',
    keywords: ['NYAX', 'dashboard', 'tokens', 'vesting', 'governance', 'DeFi'],
};

export default function NYAXDashboardPage() {
    return <UserDashboard />;
}
