'use client';

import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaBullhorn, FaChartBar, FaEye, FaGlobe, FaServer, FaShoppingCart, FaUsers, FaWallet } from 'react-icons/fa';

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
                <div>
                    <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Platform Statistics
                    </h2>
                    <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Real-time analytics and platform metrics
                    </p>
                </div>
                <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Back to Dashboard
                </Link>
            </div>

            {error && (
                <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {error}
                        </span>
                    </div>
                </div>
            )}

            {!stats ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaChartBar className="w-8 h-8 text-gray-400 animate-pulse" />
                    </div>
                    <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Loading statistics...
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                                    <FaUsers className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {stats.profiles.count}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Total Profiles
                                </div>
                                <div className="text-xs text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    {stats.profiles.active} active users
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                                    <FaGlobe className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {stats.analytics.onlineUsers}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Online Users
                                </div>
                                <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Currently active
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                                    <FaEye className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {stats.analytics.todayPageViews}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Page Views Today
                                </div>
                                <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    {stats.analytics.todayUniqueVisitors} unique visitors
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                                    <FaWallet className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {stats.analytics.weeklyWalletConnections}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Wallet Connections
                                </div>
                                <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    This week
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Platform Summary */}
                    <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg shadow-xl">
                        <div className="p-6 border-b border-gray-700/20">
                            <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                <FaServer className="w-5 h-5 text-blue-400" />
                                Platform Summary
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-6 sm:grid-cols-3">
                                <div className="text-center bg-gray-700/30 border border-gray-600/30 rounded-lg p-6 hover:bg-gray-700/40 transition-all duration-200">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 mx-auto mb-4">
                                        <FaUsers className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {stats.profiles.count}
                                    </div>
                                    <div className="text-sm text-gray-300 font-medium mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Total Profiles
                                    </div>
                                    <div className="text-xs text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {stats.profiles.active} active
                                    </div>
                                </div>

                                <div className="text-center bg-gray-700/30 border border-gray-600/30 rounded-lg p-6 hover:bg-gray-700/40 transition-all duration-200">
                                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/30 mx-auto mb-4">
                                        <FaShoppingCart className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {stats.orders.onchain.count}
                                    </div>
                                    <div className="text-sm text-gray-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        On-chain Orders
                                    </div>
                                </div>

                                <div className="text-center bg-gray-700/30 border border-gray-600/30 rounded-lg p-6 hover:bg-gray-700/40 transition-all duration-200">
                                    <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center border border-pink-500/30 mx-auto mb-4">
                                        <FaBullhorn className="w-6 h-6 text-pink-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {stats.campaigns.count}
                                    </div>
                                    <div className="text-sm text-gray-300 font-medium mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Total Campaigns
                                    </div>
                                    <div className="text-xs text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {stats.campaigns.active} active
                                    </div>
                                </div>
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
