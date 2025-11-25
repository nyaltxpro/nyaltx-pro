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
        batchSetBlacklisted,
        recoverERC20,
        createProposal,
        getMultisigInfo,
        submitMultisigTransaction,
        confirmMultisigTransaction,
        executeMultisigTransaction,
        getMultisigTransaction,
        createVestingContract,
        createVestingSchedule,
        getVestingContracts,
        releaseVestedTokens,
        revokeVesting,
        mintToTreasury,
        setCategoryWallet,
        removeCategory,
        transferTo,
        burnFromTreasury,
        getTreasuryCategories,
        emergencyRecoverERC20,
        emergencyRecoverETH,
        createEmergencyProposal
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
    const [treasuryCategory, setTreasuryCategory] = useState('');
    const [treasuryTo, setTreasuryTo] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [categoryWalletAddress, setCategoryWalletAddress] = useState('');
    const [categoryAllocation, setCategoryAllocation] = useState('');

    // Vesting State Extended
    const [vestingWalletAddress, setVestingWalletAddress] = useState('');
    const [vestingBeneficiary, setVestingBeneficiary] = useState('');
    const [vestingAmount, setVestingAmount] = useState('');
    const [vestingStart, setVestingStart] = useState('');
    const [vestingCliff, setVestingCliff] = useState('');
    const [vestingDuration, setVestingDuration] = useState('');
    const [vestingRevocable, setVestingRevocable] = useState(true);
    const [scheduleId, setScheduleId] = useState('');

    // Multisig State Extended
    const [multisigTxIndex, setMultisigTxIndex] = useState('');

    // Emergency State
    const [emergencyTokenAddress, setEmergencyTokenAddress] = useState('');
    const [emergencyAmount, setEmergencyAmount] = useState('');
    const [emergencyTargets, setEmergencyTargets] = useState('');
    const [emergencyValues, setEmergencyValues] = useState('');
    const [emergencyCalldatas, setEmergencyCalldatas] = useState('');
    const [emergencyDescription, setEmergencyDescription] = useState('');

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

                {activeTab === 'multisig' && (
                    <div className="space-y-6">
                        {/* NYAX Token Transfer Section */}
                        <AdminSection
                            title="NYAX Token Transfer"
                            description="Transfer NYAX tokens through multisig"
                            icon={<Coins className="w-5 h-5" />}
                            color="green"
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Recipient Address
                                        </label>
                                        <input
                                            type="text"
                                            value={multisigTo}
                                            onChange={(e) => setMultisigTo(e.target.value)}
                                            placeholder="0xda791a424b294a594D81b09A86531CB1Dcf6b932"
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400 font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Amount (NYAX tokens)
                                        </label>
                                        <input
                                            type="text"
                                            value={multisigValue}
                                            onChange={(e) => setMultisigValue(e.target.value)}
                                            placeholder="100"
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium text-slate-300 mb-2">📋 Transaction Details:</h5>
                                    <div className="text-xs text-slate-400 space-y-1">
                                        <p><strong>To Address:</strong> 0x9b3C66f562EA32496bA19D9C7174613c37A91F98 (NYAX Token)</p>
                                        <p><strong>Value:</strong> 0 ETH (token transfer)</p>
                                        <p><strong>Function:</strong> transfer(recipient, amount)</p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!multisigTo || !multisigValue) {
                                            setError('Please provide recipient address and amount');
                                            return;
                                        }

                                        // Generate NYAX transfer call data
                                        const nyaxTokenAddress = '0x9b3C66f562EA32496bA19D9C7174613c37A91F98';
                                        const transferCallData = `0xa9059cbb${multisigTo.slice(2).padStart(64, '0')}${(BigInt(multisigValue) * BigInt(10 ** 18)).toString(16).padStart(64, '0')}`;

                                        setLoading('nyax-transfer');
                                        const success = await submitMultisigTransaction(nyaxTokenAddress, '0', transferCallData);
                                        if (success) {
                                            setSuccess(`NYAX transfer submitted: ${multisigValue} tokens to ${multisigTo}`);
                                            setMultisigTo('');
                                            setMultisigValue('');
                                        } else {
                                            setError('Failed to submit NYAX transfer');
                                        }
                                        setLoading(null);
                                    }}
                                    disabled={loading === 'nyax-transfer'}
                                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {loading === 'nyax-transfer' ? 'Submitting NYAX Transfer...' : '🚀 Submit NYAX Transfer'}
                                </button>
                            </div>
                        </AdminSection>

                        <AdminSection
                            title="Advanced Multisig Management"
                            description="Custom multi-signature wallet operations"
                            icon={<Users className="w-5 h-5" />}
                            color="orange"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Submit Transaction */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white">Submit Transaction</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                To Address
                                            </label>
                                            <input
                                                type="text"
                                                value={multisigTo}
                                                onChange={(e) => setMultisigTo(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Value (ETH)
                                            </label>
                                            <input
                                                type="text"
                                                value={multisigValue}
                                                onChange={(e) => setMultisigValue(e.target.value)}
                                                placeholder="0.0"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Call Data
                                            </label>
                                            <input
                                                type="text"
                                                value={multisigData}
                                                onChange={(e) => setMultisigData(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-400"
                                            />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!multisigTo || !multisigValue || !multisigData) {
                                                    setError('Please provide all transaction details');
                                                    return;
                                                }
                                                setLoading('multisig-submit');
                                                const success = await submitMultisigTransaction(multisigTo, multisigValue, multisigData);
                                                if (success) {
                                                    setSuccess('Multisig transaction submitted successfully');
                                                    setMultisigTo('');
                                                    setMultisigValue('');
                                                    setMultisigData('');
                                                } else {
                                                    setError('Failed to submit multisig transaction');
                                                }
                                                setLoading(null);
                                            }}
                                            disabled={loading === 'multisig-submit'}
                                            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                        >
                                            {loading === 'multisig-submit' ? 'Submitting...' : 'Submit Transaction'}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm/Execute Transaction */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white">Manage Transaction</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Transaction Index
                                            </label>
                                            <input
                                                type="number"
                                                value={multisigTxIndex}
                                                onChange={(e) => setMultisigTxIndex(e.target.value)}
                                                placeholder="0"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-400"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={async () => {
                                                    if (!multisigTxIndex) {
                                                        setError('Please provide transaction index');
                                                        return;
                                                    }
                                                    setLoading('multisig-confirm');
                                                    const success = await confirmMultisigTransaction(parseInt(multisigTxIndex));
                                                    if (success) {
                                                        setSuccess('Transaction confirmed successfully');
                                                    } else {
                                                        setError('Failed to confirm transaction');
                                                    }
                                                    setLoading(null);
                                                }}
                                                disabled={loading === 'multisig-confirm'}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                            >
                                                {loading === 'multisig-confirm' ? 'Confirming...' : 'Confirm'}
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!multisigTxIndex) {
                                                        setError('Please provide transaction index');
                                                        return;
                                                    }
                                                    setLoading('multisig-execute');
                                                    const success = await executeMultisigTransaction(parseInt(multisigTxIndex));
                                                    if (success) {
                                                        setSuccess('Transaction executed successfully');
                                                        setMultisigTxIndex('');
                                                    } else {
                                                        setError('Failed to execute transaction');
                                                    }
                                                    setLoading(null);
                                                }}
                                                disabled={loading === 'multisig-execute'}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                            >
                                                {loading === 'multisig-execute' ? 'Executing...' : 'Execute'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                            <div className="space-y-6">
                                {/* Create Vesting Contract */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-white">Create Vesting Contract</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Category
                                                </label>
                                                <input
                                                    type="text"
                                                    value={vestingCategory}
                                                    onChange={(e) => setVestingCategory(e.target.value)}
                                                    placeholder="team, advisors, etc."
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                                                />
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!vestingCategory) {
                                                        setError('Please provide category');
                                                        return;
                                                    }
                                                    setLoading('vesting-contract');
                                                    const success = await createVestingContract(vestingCategory);
                                                    if (success) {
                                                        setSuccess('Vesting contract created successfully');
                                                        setVestingCategory('');
                                                    } else {
                                                        setError('Failed to create vesting contract');
                                                    }
                                                    setLoading(null);
                                                }}
                                                disabled={loading === 'vesting-contract'}
                                                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                            >
                                                {loading === 'vesting-contract' ? 'Creating...' : 'Create Contract'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Release/Revoke Vesting */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-white">Manage Vesting</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Vesting Wallet Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={vestingWalletAddress}
                                                    onChange={(e) => setVestingWalletAddress(e.target.value)}
                                                    placeholder="0x..."
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Schedule ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={scheduleId}
                                                    onChange={(e) => setScheduleId(e.target.value)}
                                                    placeholder="Schedule ID"
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={async () => {
                                                        if (!vestingWalletAddress || !scheduleId) {
                                                            setError('Please provide wallet address and schedule ID');
                                                            return;
                                                        }
                                                        setLoading('vesting-release');
                                                        const success = await releaseVestedTokens(vestingWalletAddress, scheduleId);
                                                        if (success) {
                                                            setSuccess('Vested tokens released successfully');
                                                        } else {
                                                            setError('Failed to release vested tokens');
                                                        }
                                                        setLoading(null);
                                                    }}
                                                    disabled={loading === 'vesting-release'}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                                >
                                                    {loading === 'vesting-release' ? 'Releasing...' : 'Release'}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!vestingWalletAddress || !scheduleId) {
                                                            setError('Please provide wallet address and schedule ID');
                                                            return;
                                                        }
                                                        setLoading('vesting-revoke');
                                                        const success = await revokeVesting(vestingWalletAddress, scheduleId);
                                                        if (success) {
                                                            setSuccess('Vesting revoked successfully');
                                                        } else {
                                                            setError('Failed to revoke vesting');
                                                        }
                                                        setLoading(null);
                                                    }}
                                                    disabled={loading === 'vesting-revoke'}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                                >
                                                    {loading === 'vesting-revoke' ? 'Revoking...' : 'Revoke'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Create Vesting Schedule */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white">Create Vesting Schedule</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Beneficiary Address
                                            </label>
                                            <input
                                                type="text"
                                                value={vestingBeneficiary}
                                                onChange={(e) => setVestingBeneficiary(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Total Amount (NYAX)
                                            </label>
                                            <input
                                                type="text"
                                                value={vestingAmount}
                                                onChange={(e) => setVestingAmount(e.target.value)}
                                                placeholder="1000"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Start Timestamp
                                            </label>
                                            <input
                                                type="number"
                                                value={vestingStart}
                                                onChange={(e) => setVestingStart(e.target.value)}
                                                placeholder="Unix timestamp"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Cliff Duration (seconds)
                                            </label>
                                            <input
                                                type="number"
                                                value={vestingCliff}
                                                onChange={(e) => setVestingCliff(e.target.value)}
                                                placeholder="2592000"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Duration (seconds)
                                            </label>
                                            <input
                                                type="number"
                                                value={vestingDuration}
                                                onChange={(e) => setVestingDuration(e.target.value)}
                                                placeholder="31536000"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="revocable"
                                                checked={vestingRevocable}
                                                onChange={(e) => setVestingRevocable(e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor="revocable" className="text-sm font-medium text-slate-300">
                                                Revocable
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!vestingWalletAddress || !vestingBeneficiary || !vestingAmount || !vestingStart || !vestingCliff || !vestingDuration || !vestingCategory) {
                                                setError('Please provide all vesting schedule details');
                                                return;
                                            }
                                            setLoading('vesting-schedule');
                                            const success = await createVestingSchedule(
                                                vestingWalletAddress,
                                                vestingBeneficiary,
                                                vestingAmount,
                                                parseInt(vestingStart),
                                                parseInt(vestingCliff),
                                                parseInt(vestingDuration),
                                                vestingRevocable,
                                                vestingCategory
                                            );
                                            if (success) {
                                                setSuccess('Vesting schedule created successfully');
                                                setVestingBeneficiary('');
                                                setVestingAmount('');
                                                setVestingStart('');
                                                setVestingCliff('');
                                                setVestingDuration('');
                                            } else {
                                                setError('Failed to create vesting schedule');
                                            }
                                            setLoading(null);
                                        }}
                                        disabled={loading === 'vesting-schedule'}
                                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                    >
                                        {loading === 'vesting-schedule' ? 'Creating...' : 'Create Vesting Schedule'}
                                    </button>
                                </div>
                            </div>
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
                            <div className="space-y-6">
                                {/* Treasury Operations */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-white">Treasury Transfer</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    To Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={treasuryTo}
                                                    onChange={(e) => setTreasuryTo(e.target.value)}
                                                    placeholder="0x..."
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Amount (NYAX)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={treasuryAmount}
                                                    onChange={(e) => setTreasuryAmount(e.target.value)}
                                                    placeholder="1000"
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Category
                                                </label>
                                                <input
                                                    type="text"
                                                    value={treasuryCategory}
                                                    onChange={(e) => setTreasuryCategory(e.target.value)}
                                                    placeholder="development, marketing, etc."
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Reason
                                                </label>
                                                <input
                                                    type="text"
                                                    value={treasuryReason}
                                                    onChange={(e) => setTreasuryReason(e.target.value)}
                                                    placeholder="Payment for services"
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                                />
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!treasuryTo || !treasuryAmount || !treasuryCategory || !treasuryReason) {
                                                        setError('Please provide all transfer details');
                                                        return;
                                                    }
                                                    setLoading('treasury-transfer');
                                                    const success = await transferTo(treasuryTo, treasuryAmount, treasuryReason, treasuryCategory);
                                                    if (success) {
                                                        setSuccess('Treasury transfer completed successfully');
                                                        setTreasuryTo('');
                                                        setTreasuryAmount('');
                                                        setTreasuryCategory('');
                                                        setTreasuryReason('');
                                                    } else {
                                                        setError('Failed to complete treasury transfer');
                                                    }
                                                    setLoading(null);
                                                }}
                                                disabled={loading === 'treasury-transfer'}
                                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                            >
                                                {loading === 'treasury-transfer' ? 'Transferring...' : 'Transfer Funds'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-white">Treasury Mint/Burn</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Amount (NYAX)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={treasuryAmount}
                                                    onChange={(e) => setTreasuryAmount(e.target.value)}
                                                    placeholder="1000"
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Reason
                                                </label>
                                                <input
                                                    type="text"
                                                    value={treasuryReason}
                                                    onChange={(e) => setTreasuryReason(e.target.value)}
                                                    placeholder="Treasury funding"
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={async () => {
                                                        if (!treasuryAmount || !treasuryReason) {
                                                            setError('Please provide amount and reason');
                                                            return;
                                                        }
                                                        setLoading('treasury-mint');
                                                        const success = await mintToTreasury(treasuryAmount, treasuryReason);
                                                        if (success) {
                                                            setSuccess('Tokens minted to treasury successfully');
                                                            setTreasuryAmount('');
                                                            setTreasuryReason('');
                                                        } else {
                                                            setError('Failed to mint to treasury');
                                                        }
                                                        setLoading(null);
                                                    }}
                                                    disabled={loading === 'treasury-mint'}
                                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                                >
                                                    {loading === 'treasury-mint' ? 'Minting...' : 'Mint'}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!treasuryAmount || !treasuryReason) {
                                                            setError('Please provide amount and reason');
                                                            return;
                                                        }
                                                        setLoading('treasury-burn');
                                                        const success = await burnFromTreasury(treasuryAmount, treasuryReason);
                                                        if (success) {
                                                            setSuccess('Tokens burned from treasury successfully');
                                                            setTreasuryAmount('');
                                                            setTreasuryReason('');
                                                        } else {
                                                            setError('Failed to burn from treasury');
                                                        }
                                                        setLoading(null);
                                                    }}
                                                    disabled={loading === 'treasury-burn'}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                                >
                                                    {loading === 'treasury-burn' ? 'Burning...' : 'Burn'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Management */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white">Category Management</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Category Name
                                            </label>
                                            <input
                                                type="text"
                                                value={categoryName}
                                                onChange={(e) => setCategoryName(e.target.value)}
                                                placeholder="development"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Wallet Address
                                            </label>
                                            <input
                                                type="text"
                                                value={categoryWalletAddress}
                                                onChange={(e) => setCategoryWalletAddress(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Allocation %
                                            </label>
                                            <input
                                                type="number"
                                                value={categoryAllocation}
                                                onChange={(e) => setCategoryAllocation(e.target.value)}
                                                placeholder="25"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={async () => {
                                                if (!categoryName || !categoryWalletAddress || !categoryAllocation) {
                                                    setError('Please provide all category details');
                                                    return;
                                                }
                                                setLoading('category-set');
                                                const success = await setCategoryWallet(categoryName, categoryWalletAddress, parseInt(categoryAllocation));
                                                if (success) {
                                                    setSuccess('Category wallet set successfully');
                                                    setCategoryName('');
                                                    setCategoryWalletAddress('');
                                                    setCategoryAllocation('');
                                                } else {
                                                    setError('Failed to set category wallet');
                                                }
                                                setLoading(null);
                                            }}
                                            disabled={loading === 'category-set'}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                        >
                                            {loading === 'category-set' ? 'Setting...' : 'Set Category'}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!categoryName) {
                                                    setError('Please provide category name');
                                                    return;
                                                }
                                                setLoading('category-remove');
                                                const success = await removeCategory(categoryName);
                                                if (success) {
                                                    setSuccess('Category removed successfully');
                                                    setCategoryName('');
                                                } else {
                                                    setError('Failed to remove category');
                                                }
                                                setLoading(null);
                                            }}
                                            disabled={loading === 'category-remove'}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                        >
                                            {loading === 'category-remove' ? 'Removing...' : 'Remove Category'}
                                        </button>
                                    </div>
                                </div>
                            </div>
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
                            <div className="space-y-6">
                                {/* Emergency Recovery */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-red-300">Emergency ERC20 Recovery</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Token Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={emergencyTokenAddress}
                                                    onChange={(e) => setEmergencyTokenAddress(e.target.value)}
                                                    placeholder="0x..."
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Amount
                                                </label>
                                                <input
                                                    type="text"
                                                    value={emergencyAmount}
                                                    onChange={(e) => setEmergencyAmount(e.target.value)}
                                                    placeholder="1000"
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400"
                                                />
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!emergencyTokenAddress || !emergencyAmount) {
                                                        setError('Please provide token address and amount');
                                                        return;
                                                    }
                                                    setLoading('emergency-erc20');
                                                    const success = await emergencyRecoverERC20(emergencyTokenAddress, emergencyAmount);
                                                    if (success) {
                                                        setSuccess('Emergency ERC20 recovery completed successfully');
                                                        setEmergencyTokenAddress('');
                                                        setEmergencyAmount('');
                                                    } else {
                                                        setError('Failed to recover ERC20 tokens');
                                                    }
                                                    setLoading(null);
                                                }}
                                                disabled={loading === 'emergency-erc20'}
                                                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                            >
                                                {loading === 'emergency-erc20' ? 'Recovering...' : 'Emergency Recover ERC20'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-red-300">Emergency ETH Recovery</h4>
                                        <div className="space-y-3">
                                            <p className="text-slate-400 text-sm">
                                                Recover all ETH from treasury contract in case of emergency.
                                            </p>
                                            <button
                                                onClick={async () => {
                                                    setLoading('emergency-eth');
                                                    const success = await emergencyRecoverETH();
                                                    if (success) {
                                                        setSuccess('Emergency ETH recovery completed successfully');
                                                    } else {
                                                        setError('Failed to recover ETH');
                                                    }
                                                    setLoading(null);
                                                }}
                                                disabled={loading === 'emergency-eth'}
                                                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                            >
                                                {loading === 'emergency-eth' ? 'Recovering...' : 'Emergency Recover ETH'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Proposal */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-red-300">Emergency Proposal</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Target Addresses (comma-separated)
                                            </label>
                                            <input
                                                type="text"
                                                value={emergencyTargets}
                                                onChange={(e) => setEmergencyTargets(e.target.value)}
                                                placeholder="0x...,0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Values (comma-separated, in wei)
                                            </label>
                                            <input
                                                type="text"
                                                value={emergencyValues}
                                                onChange={(e) => setEmergencyValues(e.target.value)}
                                                placeholder="0,0"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Call Data (comma-separated)
                                            </label>
                                            <input
                                                type="text"
                                                value={emergencyCalldatas}
                                                onChange={(e) => setEmergencyCalldatas(e.target.value)}
                                                placeholder="0x...,0x..."
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={emergencyDescription}
                                                onChange={(e) => setEmergencyDescription(e.target.value)}
                                                placeholder="Emergency proposal description..."
                                                rows={3}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!emergencyTargets || !emergencyValues || !emergencyCalldatas || !emergencyDescription) {
                                                setError('Please provide all emergency proposal details');
                                                return;
                                            }
                                            setLoading('emergency-proposal');
                                            const targets = emergencyTargets.split(',').map(t => t.trim());
                                            const values = emergencyValues.split(',').map(v => v.trim());
                                            const calldatas = emergencyCalldatas.split(',').map(c => c.trim());

                                            const txHash = await createEmergencyProposal(targets, values, calldatas, emergencyDescription);
                                            if (txHash) {
                                                setSuccess('Emergency proposal created successfully');
                                                setEmergencyTargets('');
                                                setEmergencyValues('');
                                                setEmergencyCalldatas('');
                                                setEmergencyDescription('');
                                            } else {
                                                setError('Failed to create emergency proposal');
                                            }
                                            setLoading(null);
                                        }}
                                        disabled={loading === 'emergency-proposal'}
                                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                    >
                                        {loading === 'emergency-proposal' ? 'Creating...' : 'Create Emergency Proposal'}
                                    </button>
                                </div>

                                {/* Warning */}
                                <div className="bg-red-900/20 backdrop-blur border border-red-500/50 rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-red-400">⚠️ CRITICAL WARNING</h3>
                                            <p className="text-red-300 text-sm mt-1">
                                                Emergency functions bypass normal governance processes and should only be used in critical situations.
                                                These actions are irreversible and require extreme caution.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AdminSection>
                    </div>
                )}
            </div>
        </div>
    );
};
