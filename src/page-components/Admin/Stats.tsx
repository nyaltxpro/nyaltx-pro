'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

const AdminStatsClient = dynamic(() => Promise.resolve(AdminStatsComponent), {
    ssr: true,
});

type Stats = {
    profiles: { count: number; active: number };
    orders: { stripe: { count: number; totalUSD: number }; onchain: { count: number } };
    campaigns: { count: number; active: number };
    analytics: {
        onlineUsers: number;
        todayPageViews: number;
        todayUniqueVisitors: number;
        weeklyWalletConnections: number;
    };
};

function AdminStatsComponent() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(async r => {
                if (!r.ok) throw new Error('Failed to load stats');
                const d = await r.json();
                setStats(d?.data || null);
            })
            .catch(e => setError(e?.message || 'Error'));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Stats</h2>
                <Link href="/admin" className="text-sm underline text-gray-300">
                    Back to Dashboard
                </Link>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            {!stats ? (
                <div className="text-gray-400">Loading…</div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-gray-800 p-4">
                            <div className="text-gray-400 text-sm">Profiles</div>
                            <div className="text-3xl font-bold">{stats.profiles.count}</div>
                            <div className="text-xs text-gray-400">Active: {stats.profiles.active}</div>
                        </div>
                        <div className="rounded-xl border border-gray-800 p-4">
                            <div className="text-gray-400 text-sm">Online Users</div>
                            <div className="text-3xl font-bold text-green-400">{stats.analytics.onlineUsers}</div>
                            <div className="text-xs text-gray-400">Currently active</div>
                        </div>
                        <div className="rounded-xl border border-gray-800 p-4">
                            <div className="text-gray-400 text-sm">Page Views Today</div>
                            <div className="text-3xl font-bold text-blue-400">{stats.analytics.todayPageViews}</div>
                            <div className="text-xs text-gray-400">Unique: {stats.analytics.todayUniqueVisitors}</div>
                        </div>
                        <div className="rounded-xl border border-gray-800 p-4">
                            <div className="text-gray-400 text-sm">Wallet Connections</div>
                            <div className="text-3xl font-bold text-purple-400">{stats.analytics.weeklyWalletConnections}</div>
                            <div className="text-xs text-gray-400">This week</div>
                        </div>
                    </div>

                    {/* Legacy Stats Summary */}
                    <div className="rounded-xl border border-gray-800 p-6">
                        <h3 className="font-semibold mb-2">Platform Summary</h3>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{stats.profiles.count}</div>
                                <div className="text-sm text-gray-400">Total Profiles</div>
                                <div className="text-xs text-green-400">{stats.profiles.active} active</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{stats.orders.onchain.count}</div>
                                <div className="text-sm text-gray-400">On-chain Orders</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{stats.campaigns.count}</div>
                                <div className="text-sm text-gray-400">Total Campaigns</div>
                                <div className="text-xs text-green-400">{stats.campaigns.active} active</div>
                            </div>
                        </div>
                    </div>

                    {/* Comprehensive Analytics Dashboard */}
                    <AnalyticsDashboard />
                </>
            )}
        </div>
    );
}

export default function AdminStatsPage() {
    return <AdminStatsClient />;
}
