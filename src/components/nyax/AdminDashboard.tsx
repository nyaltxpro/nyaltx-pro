'use client';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, BarChart3, Clock, Coins, Lock, Settings, Shield, TrendingUp, Users } from 'lucide-react';
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

    // Mock data
    const totalSupply = 1000000000;
    const treasuryBalance = 850000000;

    const wallets: Wallet[] = [
        {
            id: 'treasury',
            name: 'Treasury Master',
            balance: 850000000,
            percentage: 85,
            type: 'master',
            icon: Shield,
            color: 'blue',
            multisig: '5/7',
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

    const pendingTransactions = [
        {
            id: 1,
            from: 'Treasury',
            to: 'Liquidity Pool',
            amount: 5000000,
            reason: 'CEX listing liquidity',
            initiated: '2025-11-18',
            approvals: 3,
            required: 5,
            status: 'pending'
        },
        {
            id: 2,
            from: 'Marketing',
            to: 'Partner Wallet',
            amount: 500000,
            reason: 'Q4 campaign payment',
            initiated: '2025-11-19',
            approvals: 2,
            required: 3,
            status: 'pending'
        }
    ];

    const recentActivity = [
        {
            id: 1,
            action: 'Transfer Approved',
            from: 'Treasury',
            to: 'Founders',
            amount: 2000000,
            date: '2025-11-19',
            status: 'completed'
        },
        {
            id: 2,
            action: 'Vesting Release',
            from: 'Investors',
            to: 'Investor Wallets',
            amount: 1500000,
            date: '2025-11-18',
            status: 'completed'
        },
        {
            id: 3,
            action: 'Burn Event',
            from: 'Burn Wallet',
            to: 'Dead Address',
            amount: 1000000,
            date: '2025-11-17',
            status: 'completed'
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
            <div className="min-h-screen  text-white p-6">
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

                    {/* Transfers Tab */}
                    {activeTab === 'transfers' && (
                        <div className="space-y-6">
                            {/* Pending Approvals */}
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-yellow-400" />
                                        Pending Approvals
                                    </h3>
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
                                        onClick={() => setIsTransferModalOpen(true)}
                                    >
                                        New Transfer
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {pendingTransactions.map((tx) => (
                                        <div key={tx.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium">{tx.from}</span>
                                                        <ArrowRight className="w-4 h-4 text-slate-400" />
                                                        <span className="font-medium">{tx.to}</span>
                                                    </div>
                                                    <p className="text-2xl font-bold mb-1">{formatNumber(tx.amount)} tokens</p>
                                                    <p className="text-slate-400 text-sm">{tx.reason}</p>
                                                </div>

                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">
                                                            {tx.approvals}/{tx.required} signatures
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-400 text-xs">Initiated: {tx.initiated}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    Approve
                                                </button>
                                                <button className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    Reject
                                                </button>
                                                <button className="px-4 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Initiate New Transfer</h3>
                                    <p className="text-sm text-slate-400">Launch the transfer wizard to create, review, and submit a multi-sig request.</p>
                                </div>
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                                    onClick={() => setIsTransferModalOpen(true)}
                                >
                                    Open Modal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Vesting Tab */}
                    {activeTab === 'vesting' && (
                        <div className="space-y-6">
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                                <h3 className="text-xl intended font-semibold mb-4">Active Vesting Schedules</h3>
                                <div className="space-y-4">
                                    {wallets.filter(isVestingWallet).map((wallet) => {
                                        const Icon = wallet.icon;
                                        return (
                                            <div key={wallet.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`${getColorClass(wallet.color)} p-2 rounded-lg`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{wallet.name}</h4>
                                                        <p className="text-slate-400 text-sm">Vesting ends: {wallet.vestingEnd}</p>
                                                    </div>
                                                    <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition-colors">
                                                        Manage
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-slate-400 text-xs mb-1">Total Allocated</p>
                                                        <p className="font-semibold">{formatNumber(wallet.allocated)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400 text-xs mb-1">Vested</p>
                                                        <p className="font-semibold text-green-400">{formatNumber(wallet.vested)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400 text-xs mb-1">Remaining</p>
                                                        <p className="font-semibold text-yellow-400">{formatNumber(wallet.allocated - wallet.vested)}</p>
                                                    </div>
                                                </div>

                                                <div className="w-full bg-slate-700 rounded-full h-3">
                                                    <div
                                                        className={`${getColorClass(wallet.color)} h-3 rounded-full`}
                                                        style={{ width: `${(wallet.vested / wallet.allocated) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-right text-sm text-slate-400 mt-1">
                                                    {((wallet.vested / wallet.allocated) * 100).toFixed(1)}% vested
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Create Vesting Schedule</h3>
                                    <p className="text-sm text-slate-400">Configure cliffs, duration, and beneficiaries using the guided modal.</p>
                                </div>
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                                    onClick={() => setIsVestingModalOpen(true)}
                                >
                                    Launch Builder
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isTransferModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setIsTransferModalOpen(false)} />
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500">Transfer Wizard</p>
                                <h3 className="text-2xl font-semibold">Initiate New Transfer</h3>
                                <p className="text-sm text-slate-400">Fill in all details before submitting for multi-sig approval.</p>
                            </div>
                            <button
                                className="text-slate-400 hover:text-white transition-colors"
                                onClick={() => setIsTransferModalOpen(false)}
                                aria-label="Close transfer modal"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">From Wallet</label>
                                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                                    <option>Treasury Master</option>
                                    <option>Marketing & Community</option>
                                    <option>Liquidity Pool</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">To Address</label>
                                <input type="text" placeholder="0x..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Amount</label>
                                <input type="number" placeholder="0.00" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Purpose</label>
                                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                                    <option>Marketing Campaign</option>
                                    <option>Liquidity Provision</option>
                                    <option>Partnership</option>
                                    <option>Development</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Reason / Notes</label>
                                <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 h-24" placeholder="Detailed explanation..."></textarea>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                className="px-5 py-3 rounded-lg border border-slate-600 text-sm font-medium hover:bg-slate-800 transition-colors"
                                onClick={() => setIsTransferModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors">
                                Submit for Approval
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isVestingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setIsVestingModalOpen(false)} />
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative z-10 w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500">Vesting Builder</p>
                                <h3 className="text-2xl font-semibold">Create Vesting Schedule</h3>
                                <p className="text-sm text-slate-400">Define beneficiary, amounts, timing, and release cadence.</p>
                            </div>
                            <button
                                className="text-slate-400 hover:text-white transition-colors"
                                onClick={() => setIsVestingModalOpen(false)}
                                aria-label="Close vesting modal"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Beneficiary Address</label>
                                <input type="text" placeholder="0x..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Beneficiary Name (optional)</label>
                                <input type="text" placeholder="Team Member / Fund" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Total Amount</label>
                                <input type="number" placeholder="0.00" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Token Source</label>
                                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                                    <option>Treasury Master</option>
                                    <option>Founders & Team</option>
                                    <option>Investors Pool</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Start Date</label>
                                <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Cliff Period (months)</label>
                                <input type="number" placeholder="12" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Vesting Duration (months)</label>
                                <input type="number" placeholder="48" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Release Cadence</label>
                                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                                    <option>Linear Release</option>
                                    <option>Monthly Milestones</option>
                                    <option>Quarterly Milestones</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Notes / Instructions</label>
                                <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 h-24" placeholder="Add compliance notes, unlock logic, or approvals..."></textarea>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                className="px-5 py-3 rounded-lg border border-slate-600 text-sm font-medium hover:bg-slate-800 transition-colors"
                                onClick={() => setIsVestingModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors">
                                Create Vesting Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GovernanceDashboard;