'use client'
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { useDAO } from '@/hooks/useDAO';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Coins,
    Settings,
    TrendingUp,
    Users,
    Vote,
    Wallet,
    XCircle
} from 'lucide-react';
import React, { useState } from 'react';

type TabKey = 'overview' | 'token' | 'governance' | 'multisig' | 'vesting' | 'treasury' | 'emergency';

interface AdminSectionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    color?: 'blue' | 'purple' | 'green' | 'orange' | 'cyan' | 'indigo' | 'red';
}

const AdminSection: React.FC<AdminSectionProps> = ({
    title,
    description,
    icon,
    children,
    color = 'blue'
}) => {
    const colorClasses = {
        blue: 'border-blue-500 text-blue-400',
        purple: 'border-purple-500 text-purple-400',
        green: 'border-green-500 text-green-400',
        orange: 'border-orange-500 text-orange-400',
        cyan: 'border-cyan-500 text-cyan-400',
        indigo: 'border-indigo-500 text-indigo-400',
        red: 'border-red-500 text-red-400'
    };

    return (
        <div className={`bg-slate-800/50 backdrop-blur border ${colorClasses[color].split(' ')[0]} rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`${colorClasses[color].split(' ')[1]} p-2 rounded-lg bg-slate-700/50`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <p className="text-slate-400 text-sm">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
};

export const AdminPanel: React.FC = () => {
    const {
        isConnected,
        isInitialized,
        mintTokens,
        burnTokens,
        setBlacklisted,
        setTransfersEnabled,
        recoverETH,
        createProposal,
        submitMultisigTransaction,
        createVestingContract,
        mintToTreasury
    } = useDAO();

    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    // Token Management State
    const [mintAmount, setMintAmount] = useState('');
    const [mintTo, setMintTo] = useState('');
    const [burnAmount, setBurnAmount] = useState('');
    const [burnFrom, setBurnFrom] = useState('');
    const [blacklistAddress, setBlacklistAddress] = useState('');
    const [transfersEnabled, setTransfersEnabledState] = useState(true);

    // Governance State
    const [proposalTargets, setProposalTargets] = useState('');
    const [proposalValues, setProposalValues] = useState('');
    const [proposalCalldatas, setProposalCalldatas] = useState('');
    const [proposalDescription, setProposalDescription] = useState('');
    const [proposalId, setProposalId] = useState('');

    // Multisig State
    const [multisigTo, setMultisigTo] = useState('');
    const [multisigValue, setMultisigValue] = useState('');
    const [multisigData, setMultisigData] = useState('');

    // Vesting State
    const [vestingCategory, setVestingCategory] = useState('');

    // Treasury State
    const [treasuryAmount, setTreasuryAmount] = useState('');
    const [treasuryReason, setTreasuryReason] = useState('');

    const [loading, setLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Handler functions
    const handleMintTokens = async () => {
        if (!mintTo || !mintAmount) {
            setError('Please provide recipient address and amount');
            return;
        }

        setLoading('mint');
        setError(null);
        setSuccess(null);

        try {
            const success = await mintTokens(mintTo, mintAmount);
            if (success) {
                setSuccess(`Successfully minted ${mintAmount} NYAX to ${mintTo}`);
                setMintAmount('');
                setMintTo('');
            } else {
                setError('Failed to mint tokens');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mint tokens');
        } finally {
            setLoading(null);
        }
    };

    const handleBurnTokens = async () => {
        if (!burnFrom || !burnAmount) {
            setError('Please provide address and amount to burn');
            return;
        }

        setLoading('burn');
        setError(null);
        setSuccess(null);

        try {
            const success = await burnTokens(burnFrom, burnAmount);
            if (success) {
                setSuccess(`Successfully burned ${burnAmount} NYAX from ${burnFrom}`);
                setBurnAmount('');
                setBurnFrom('');
            } else {
                setError('Failed to burn tokens');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to burn tokens');
        } finally {
            setLoading(null);
        }
    };

    const handleCreateProposal = async () => {
        if (!proposalTargets || !proposalValues || !proposalCalldatas || !proposalDescription) {
            setError('Please provide all proposal details');
            return;
        }

        setLoading('proposal');
        setError(null);
        setSuccess(null);

        try {
            const targets = proposalTargets.split(',').map(t => t.trim());
            const values = proposalValues.split(',').map(v => v.trim());
            const calldatas = proposalCalldatas.split(',').map(c => c.trim());

            const txHash = await createProposal(targets, values, calldatas, proposalDescription);
            if (txHash) {
                setSuccess('Proposal created successfully');
                setProposalTargets('');
                setProposalValues('');
                setProposalCalldatas('');
                setProposalDescription('');
            } else {
                setError('Failed to create proposal');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create proposal');
        } finally {
            setLoading(null);
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-300">Initializing DAO admin panel...</p>
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-blue-400 text-6xl mb-6">
                        <Wallet className="mx-auto w-16 h-16" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-3">Admin Access Required</h2>
                    <p className="text-slate-400 mb-6">
                        Connect your admin wallet to access the DAO administration panel.
                    </p>
                    <div className="space-y-4">
                        <ConnectWalletButton
                            className="w-full py-3 px-6 text-base font-semibold"
                        />
                        <div className="text-xs text-slate-400 bg-slate-800/50 backdrop-blur rounded-lg p-3 border border-slate-700">
                            <p className="flex items-center justify-center mb-1">
                                <AlertTriangle className="mr-2 text-yellow-400 w-4 h-4" />
                                <strong>Note:</strong>
                            </p>
                            <p>Only pre-approved admin wallet addresses can access this panel.</p>
                            <p className="mt-1">Configure via <code className="text-cyan-400">ADMIN_WALLET_ADDRESSES</code> environment variable.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">DAO Administration</h1>
                            <p className="text-slate-400">Multi-signature governance and treasury management</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                            <Settings className="w-5 h-5" />
                            Settings
                        </button>
                    </div>

                    {/* Warning Card */}
                    <div className="bg-slate-800/50 backdrop-blur border border-yellow-500/50 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-yellow-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-400">Administrative Access</h3>
                                <p className="text-slate-300 text-sm">These are powerful functions that directly interact with DAO contracts. Use with extreme caution.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 bg-red-900/20 backdrop-blur border border-red-500/50 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-900/20 backdrop-blur border border-green-500/50 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <p className="text-green-300">{success}</p>
                        </div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-700">
                    {(['overview', 'token', 'governance', 'multisig', 'vesting', 'treasury', 'emergency'] as const).map((tab: TabKey) => (
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

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-slate-800/50 backdrop-blur border border-blue-500 rounded-xl p-6 cursor-pointer hover:bg-slate-800 transition-all hover:scale-105">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-blue-500/20 p-3 rounded-lg">
                                        <Coins className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Token Management</h3>
                                        <p className="text-slate-400 text-sm">Mint, burn, and control token supply</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur border border-purple-500 rounded-xl p-6 cursor-pointer hover:bg-slate-800 transition-all hover:scale-105">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-purple-500/20 p-3 rounded-lg">
                                        <Vote className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Governance</h3>
                                        <p className="text-slate-400 text-sm">Create and execute proposals</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur border border-orange-500 rounded-xl p-6 cursor-pointer hover:bg-slate-800 transition-all hover:scale-105">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-orange-500/20 p-3 rounded-lg">
                                        <Users className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Multisig</h3>
                                        <p className="text-slate-400 text-sm">Multi-signature transactions</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur border border-indigo-500 rounded-xl p-6 cursor-pointer hover:bg-slate-800 transition-all hover:scale-105">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-indigo-500/20 p-3 rounded-lg">
                                        <Clock className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Vesting</h3>
                                        <p className="text-slate-400 text-sm">Token vesting schedules</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur border border-green-500 rounded-xl p-6 cursor-pointer hover:bg-slate-800 transition-all hover:scale-105">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-green-500/20 p-3 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Treasury</h3>
                                        <p className="text-slate-400 text-sm">Treasury management</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur border border-red-500 rounded-xl p-6 cursor-pointer hover:bg-slate-800 transition-all hover:scale-105">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-red-500/20 p-3 rounded-lg">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Emergency</h3>
                                        <p className="text-slate-400 text-sm">Emergency functions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'token' && (
                    <div className="space-y-6">
                        <AdminSection
                            title="Token Management"
                            description="Mint, burn, and control NYAX token supply"
                            icon={<Coins className="w-5 h-5" />}
                            color="cyan"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Mint Tokens */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white">Mint Tokens</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Recipient Address
                                            </label>
                                            <input
                                                type="text"
                                                value={mintTo}
                                                onChange={(e) => setMintTo(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Amount (NYAX)
                                            </label>
                                            <input
                                                type="text"
                                                value={mintAmount}
                                                onChange={(e) => setMintAmount(e.target.value)}
                                                placeholder="1000"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                                            />
                                        </div>
                                        <button
                                            onClick={handleMintTokens}
                                            disabled={loading === 'mint'}
                                            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                        >
                                            {loading === 'mint' ? 'Minting...' : 'Mint Tokens'}
                                        </button>
                                    </div>
                                </div>

                                {/* Burn Tokens */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-red-300">Burn Tokens</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                From Address
                                            </label>
                                            <input
                                                type="text"
                                                value={burnFrom}
                                                onChange={(e) => setBurnFrom(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Amount (NYAX)
                                            </label>
                                            <input
                                                type="text"
                                                value={burnAmount}
                                                onChange={(e) => setBurnAmount(e.target.value)}
                                                placeholder="1000"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400"
                                            />
                                        </div>
                                        <button
                                            onClick={handleBurnTokens}
                                            disabled={loading === 'burn'}
                                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                        >
                                            {loading === 'burn' ? 'Burning...' : 'Burn Tokens'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </AdminSection>
                    </div>
                )}

                {activeTab === 'governance' && (
                    <div className="space-y-6">
                        <AdminSection
                            title="Governance Management"
                            description="Create and manage DAO proposals"
                            icon={<Vote className="w-5 h-5" />}
                            color="purple"
                        >
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4">Create Proposal</h4>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Target Addresses (comma-separated)
                                            </label>
                                            <input
                                                type="text"
                                                value={proposalTargets}
                                                onChange={(e) => setProposalTargets(e.target.value)}
                                                placeholder="0x...,0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Values (comma-separated, in wei)
                                            </label>
                                            <input
                                                type="text"
                                                value={proposalValues}
                                                onChange={(e) => setProposalValues(e.target.value)}
                                                placeholder="0,0"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Call Data (comma-separated)
                                            </label>
                                            <input
                                                type="text"
                                                value={proposalCalldatas}
                                                onChange={(e) => setProposalCalldatas(e.target.value)}
                                                placeholder="0x...,0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={proposalDescription}
                                                onChange={(e) => setProposalDescription(e.target.value)}
                                                placeholder="Proposal description..."
                                                rows={3}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCreateProposal}
                                        disabled={loading === 'proposal'}
                                        className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                    >
                                        {loading === 'proposal' ? 'Creating...' : 'Create Proposal'}
                                    </button>
                                </div>
                            </div>
                        </AdminSection>
                    </div>
                )}

                {/* Placeholder tabs for other sections */}
                {activeTab === 'multisig' && (
                    <div className="space-y-6">
                        <AdminSection
                            title="Multisig Management"
                            description="Multi-signature wallet operations"
                            icon={<Users className="w-5 h-5" />}
                            color="orange"
                        >
                            <p className="text-slate-400">Multisig functionality coming soon...</p>
                        </AdminSection>
                    </div>
                )}

                {activeTab === 'vesting' && (
                    <div className="space-y-6">
                        <AdminSection
                            title="Vesting Management"
                            description="Token vesting schedules"
                            icon={<Clock className="w-5 h-5" />}
                            color="indigo"
                        >
                            <p className="text-slate-400">Vesting functionality coming soon...</p>
                        </AdminSection>
                    </div>
                )}

                {activeTab === 'treasury' && (
                    <div className="space-y-6">
                        <AdminSection
                            title="Treasury Management"
                            description="Treasury operations and funding"
                            icon={<TrendingUp className="w-5 h-5" />}
                            color="green"
                        >
                            <p className="text-slate-400">Treasury functionality coming soon...</p>
                        </AdminSection>
                    </div>
                )}

                {activeTab === 'emergency' && (
                    <div className="space-y-6">
                        <AdminSection
                            title="Emergency Functions"
                            description="Critical emergency operations"
                            icon={<AlertTriangle className="w-5 h-5" />}
                            color="red"
                        >
                            <p className="text-slate-400">Emergency functions coming soon...</p>
                        </AdminSection>
                    </div>
                )}
            </div>
        </div>
    );
};
