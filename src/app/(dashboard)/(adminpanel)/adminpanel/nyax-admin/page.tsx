import AdminDashboard from '@/components/nyax/AdminDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYAX Admin Dashboard - NYALTX Platform',
    description: 'Administrative controls for NYAX token management, treasury operations, vesting schedules, and platform governance.',
    keywords: ['NYAX', 'admin', 'dashboard', 'treasury', 'minting', 'vesting', 'governance'],
};

export default function NYAXAdminDashboardPage() {
    return <AdminDashboard />;
}
