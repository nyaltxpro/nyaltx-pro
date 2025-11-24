'use client';
import { useMultisig, useTreasury } from '@/hooks/useDAOService';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Coins, Lock, Settings, Shield, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

const COLOR_CLASS_MAP = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500'
} as const;

const BORDER_CLASS_MAP = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500',
    orange: 'border-orange-500',
    cyan: 'border-cyan-500',
    indigo: 'border-indigo-500',
    red: 'border-red-500'
} as const;

type WalletColor = keyof typeof COLOR_CLASS_MAP;
type WalletStatus = 'active' | 'vesting' | 'locked';
type WalletType = 'master' | 'vesting' | 'operational' | 'governance' | 'special';
type TabKey = 'overview' | 'transfers' | 'vesting' | 'activity';

interface Wallet {
    id: string;
    name: string;
    balance: number;
    percentage: number;
    type: WalletType;
    icon: LucideIcon;
    color: WalletColor;
    status: WalletStatus;
    multisig?: string;
    allocated?: number;
    vested?: number;
    vestingEnd?: string;
}

const hasVestingData = (
    wallet: Wallet
): wallet is Wallet & Required<Pick<Wallet, 'allocated' | 'vested'>> =>
    typeof wallet.allocated === 'number' && typeof wallet.vested === 'number';

const isVestingWallet = (
    wallet: Wallet
): wallet is Wallet & Required<Pick<Wallet, 'allocated' | 'vested'>> & { type: 'vesting' } =>
    wallet.type === 'vesting' && hasVestingData(wallet);

const GovernanceDashboard = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isVestingModalOpen, setIsVestingModalOpen] = useState(false);

    // Use real contract data
    const { stats: treasuryStats, categories, isLoading: treasuryLoading } = useTreasury();
    const { transactions, multisigInfo, isOwner, isLoading: multisigLoading } = useMultisig();

    // Mock data enhanced with real contract data
    const totalSupply = treasuryStats ? parseFloat(treasuryStats.totalBalance) : 1000000000;
    const treasuryBalance = treasuryStats ? parseFloat(treasuryStats.totalBalance) : 850000000;

    const wallets: Wallet[] = [
        {
            id: 'treasury',
            name: 'Treasury Master',
            balance: treasuryBalance,
            percentage: 85,
            type: 'master',
            icon: Shield,
            color: 'blue',
            multisig: multisigInfo ? `${multisigInfo.threshold}/${multisigInfo.owners.length}` : '5/7',
            status: 'active'
        },
        {
            id: 'founders',
            name: 'Founders & Team',
            balance: 150000000,
            percentage: 15,
            allocated: 200000000,
            vested: 50000000,
            type: 'vesting',
            icon: Users,
            color: 'purple',
            vestingEnd: '2026-12-31',
            status: 'vesting'
        },
        {
            id: 'investors',
            name: 'Investors (Reg CF/D/A)',
            balance: 100000000,
            percentage: 10,
            allocated: 150000000,
            vested: 50000000,
            type: 'vesting',
            icon: TrendingUp,
            color: 'green',
            vestingEnd: '2025-06-30',
            status: 'vesting'
        },
        {
            id: 'marketing',
            name: 'Marketing & Community',
            balance: 80000000,
            percentage: 8,
            allocated: 120000000,
            type: 'operational',
            icon: Coins,
            color: 'orange',
            status: 'active'
        },
        {
            id: 'liquidity',
            name: 'Liquidity (DEX/CEX)',
            balance: 120000000,
            percentage: 12,
            allocated: 120000000,
            type: 'operational',
            icon: BarChart3,
            color: 'cyan',
            status: 'active'
        },
        {
            id: 'dao',
            name: 'DAO Pool & Governance',
            balance: 50000000,
            percentage: 5,
            allocated: 100000000,
            type: 'governance',
            icon: Users,
            color: 'indigo',
            status: 'active'
        },
        {
            id: 'burn',
            name: 'Burn & Locking',
            balance: 30000000,
            percentage: 3,
            type: 'special',
            icon: Lock,
            color: 'red',
            status: 'locked'
        }
    ];

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const getColorClass = (color?: WalletColor) => {
        if (!color) return 'bg-gray-500';
        return COLOR_CLASS_MAP[color] || 'bg-gray-500';
    };

    const getBorderColor = (color?: WalletColor) => {
        if (!color) return 'border-gray-500';
        return BORDER_CLASS_MAP[color] || 'border-gray-500';
    };

    return (
        <>
            <div className="min-h-screen text-white p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">Treasury Governance</h1>
                                <p className="text-slate-400">Multi-signature token management system</p>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                                <Settings className="w-5 h-5" />
                                Admin Settings
                            </button>
                        </div>

                        {/* Total Supply Card */}
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Total Minted Supply</p>
                                    <p className="text-3xl font-bold">{formatNumber(totalSupply)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Treasury Balance</p>
                                    <p className="text-3xl font-bold text-blue-400">{formatNumber(treasuryBalance)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Circulating Supply</p>
                                    <p className="text-3xl font-bold text-green-400">{formatNumber(totalSupply - treasuryBalance)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-slate-700">
                        {(['overview', 'transfers', 'vesting', 'activity'] as const).map((tab: TabKey) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 font-medium capitalize transition-colors ${activeTab === tab
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Wallet Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {wallets.map((wallet) => {
                                    const Icon = wallet.icon;
                                    return (
                                        <div
                                            key={wallet.id}
                                            onClick={() => setSelectedWallet(wallet)}
                                            className={`bg-slate-800/50 backdrop-blur border ${getBorderColor(wallet.color)} rounded-xl p-6 cursor-pointer hover:bg-slate-800 transition-all hover:scale-105`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`${getColorClass(wallet.color)} p-3 rounded-lg`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${wallet.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                    wallet.status === 'vesting' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {wallet.status}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-semibold mb-2">{wallet.name}</h3>
                                            <p className="text-2xl font-bold mb-1">{formatNumber(wallet.balance)}</p>
                                            <p className="text-slate-400 text-sm mb-3">{wallet.percentage}% of supply</p>

                                            {hasVestingData(wallet) && (
                                                <div className="pt-3 border-t border-slate-700">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-slate-400">Vested</span>
                                                        <span className="font-medium">{formatNumber(wallet.vested)}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                                        <div
                                                            className={`${getColorClass(wallet.color)} h-2 rounded-full`}
                                                            style={{ width: `${(wallet.vested / wallet.allocated) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {wallet.multisig && (
                                                <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                                                    <Shield className="w-4 h-4" />
                                                    <span>Multi-sig: {wallet.multisig}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Distribution Chart */}
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                                <h3 className="text-xl font-semibold mb-4">Token Distribution</h3>
                                <div className="space-y-3">
                                    {wallets.map((wallet) => (
                                        <div key={wallet.id} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{wallet.name}</span>
                                                <span className="font-medium">{wallet.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-3">
                                                <div
                                                    className={`${getColorClass(wallet.color)} h-3 rounded-full transition-all`}
                                                    style={{ width: `${wallet.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other tabs would go here */}
                    {activeTab === 'transfers' && (
                        <div className="text-center py-8 text-slate-400">
                            Transfer management integrated with smart contracts
                        </div>
                    )}
                    {activeTab === 'vesting' && (
                        <div className="text-center py-8 text-slate-400">
                            Vesting schedules integrated with smart contracts
                        </div>
                    )}
                    {activeTab === 'activity' && (
                        <div className="text-center py-8 text-slate-400">
                            Recent activity from blockchain events
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default GovernanceDashboard;
