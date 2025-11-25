'use client'
import { useDAO } from '@/hooks/useDAO';
import { GovernanceStats, TokenInfo, TreasuryCategory, TreasuryStats, VotingPower } from '@/services/contracts/types';
import React, { useEffect, useState } from 'react';
import { FaChartBar, FaClock, FaCoins, FaUsers, FaVoteYea, FaWallet } from 'react-icons/fa';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    subtitle?: string;
    loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle, loading }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                {loading ? (
                    <div className="h-8 bg-gray-700 rounded animate-pulse mt-2"></div>
                ) : (
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                )}
                {subtitle && (
                    <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
                )}
            </div>
            <div className="text-cyan-400 text-2xl">
                {icon}
            </div>
        </div>
    </div>
);

interface VotingPowerCardProps {
    votingPower: VotingPower | null;
    loading: boolean;
    onDelegate: (delegatee: string) => void;
}

const VotingPowerCard: React.FC<VotingPowerCardProps> = ({ votingPower, loading, onDelegate }) => {
    const [delegatee, setDelegatee] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelegate = async () => {
        if (!delegatee.trim()) return;
        setIsSubmitting(true);
        try {
            await onDelegate(delegatee);
            setDelegatee('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaVoteYea className="mr-2 text-cyan-400" />
                Your Voting Power
            </h3>

            {loading ? (
                <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
            ) : votingPower ? (
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Token Balance:</span>
                        <span className="text-white font-medium">{parseFloat(votingPower.balance).toFixed(2)} NYAX</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Voting Power:</span>
                        <span className="text-cyan-400 font-medium">{parseFloat(votingPower.votes).toFixed(2)} votes</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Delegated To:</span>
                        <span className="text-white font-mono text-sm">
                            {votingPower.delegatedTo === '0x0000000000000000000000000000000000000000'
                                ? 'Self'
                                : `${votingPower.delegatedTo.slice(0, 6)}...${votingPower.delegatedTo.slice(-4)}`
                            }
                        </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Delegate Votes To:
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={delegatee}
                                onChange={(e) => setDelegatee(e.target.value)}
                                placeholder="0x..."
                                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                            />
                            <button
                                onClick={handleDelegate}
                                disabled={!delegatee.trim() || isSubmitting}
                                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                {isSubmitting ? 'Delegating...' : 'Delegate'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-gray-400">Connect wallet to view voting power</p>
            )}
        </div>
    );
};

interface TreasuryCategoriesProps {
    categories: TreasuryCategory[] | null;
    loading: boolean;
}

const TreasuryCategories: React.FC<TreasuryCategoriesProps> = ({ categories, loading }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaWallet className="mr-2 text-cyan-400" />
            Treasury Categories
        </h3>

        {loading ? (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-700 rounded animate-pulse"></div>
                ))}
            </div>
        ) : categories && categories.length > 0 ? (
            <div className="space-y-3">
                {categories.map((category) => (
                    <div key={category.name} className="bg-gray-700 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-white">{category.name}</h4>
                            <span className="text-cyan-400 text-sm">{(category.allocation / 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                            <div className="flex justify-between">
                                <span>Distributed:</span>
                                <span>{parseFloat(category.distributed).toFixed(2)} NYAX</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Remaining:</span>
                                <span>{parseFloat(category.remaining).toFixed(2)} NYAX</span>
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                                Wallet: {category.wallet.slice(0, 6)}...{category.wallet.slice(-4)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-400">No treasury categories found</p>
        )}
    </div>
);

export const DAODashboard: React.FC = () => {
    const {
        isInitialized,
        isConnected,
        address,
        error,
        getTokenInfo,
        getTokenBalance,
        getVotingPower,
        delegateVotes,
        getGovernanceStats,
        getTreasuryStats,
        getTreasuryCategories,
        clearError
    } = useDAO();

    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [userBalance, setUserBalance] = useState<string | null>(null);
    const [votingPower, setVotingPower] = useState<VotingPower | null>(null);
    const [governanceStats, setGovernanceStats] = useState<GovernanceStats | null>(null);
    const [treasuryStats, setTreasuryStats] = useState<TreasuryStats | null>(null);
    const [treasuryCategories, setTreasuryCategories] = useState<TreasuryCategory[] | null>(null);
    const [loading, setLoading] = useState(true);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            if (!isInitialized) return;

            setLoading(true);
            try {
                // Load token info and governance stats (always available)
                const [tokenData, govStats, treasuryData, categories] = await Promise.all([
                    getTokenInfo(),
                    getGovernanceStats(),
                    getTreasuryStats(),
                    getTreasuryCategories()
                ]);

                setTokenInfo(tokenData);
                setGovernanceStats(govStats);
                setTreasuryStats(treasuryData);
                setTreasuryCategories(categories);

                // Load user-specific data if connected
                if (isConnected && address) {
                    const [balance, voting] = await Promise.all([
                        getTokenBalance(),
                        getVotingPower()
                    ]);

                    setUserBalance(balance);
                    setVotingPower(voting);
                }
            } catch (err) {
                console.error('Failed to load DAO data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isInitialized, isConnected, address, getTokenInfo, getTokenBalance, getVotingPower, getGovernanceStats, getTreasuryStats, getTreasuryCategories]);

    const handleDelegate = async (delegatee: string) => {
        const success = await delegateVotes(delegatee);
        if (success) {
            // Refresh voting power
            const newVotingPower = await getVotingPower();
            setVotingPower(newVotingPower);
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-white">Initializing DAO connection...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-400 text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-white mb-2">Connection Error</h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={clearError}
                        className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">NYAX DAO Dashboard</h1>
                    <p className="text-gray-400">
                        Manage your participation in the NYAX Decentralized Autonomous Organization
                    </p>
                    {isConnected && address && (
                        <p className="text-sm text-cyan-400 mt-2">
                            Connected: {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                    )}
                </div>

                {/* Token Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Token Name"
                        value={tokenInfo?.name || 'NYAX'}
                        icon={<FaCoins />}
                        subtitle={`Symbol: ${tokenInfo?.symbol || 'NYAX'}`}
                        loading={loading}
                    />
                    <StatCard
                        title="Total Supply"
                        value={tokenInfo ? `${parseFloat(tokenInfo.totalSupply).toLocaleString()} NYAX` : '0'}
                        icon={<FaChartBar />}
                        subtitle={`Max: ${tokenInfo ? parseFloat(tokenInfo.maxSupply).toLocaleString() : '0'}`}
                        loading={loading}
                    />
                    <StatCard
                        title="Your Balance"
                        value={userBalance ? `${parseFloat(userBalance).toFixed(2)} NYAX` : isConnected ? '0 NYAX' : 'Not Connected'}
                        icon={<FaCoins />}
                        loading={loading && isConnected}
                    />
                    <StatCard
                        title="Treasury Balance"
                        value={treasuryStats ? `${parseFloat(treasuryStats.totalBalance).toLocaleString()} NYAX` : '0'}
                        icon={<FaWallet />}
                        subtitle={`${treasuryStats?.categoriesCount || 0} categories`}
                        loading={loading}
                    />
                </div>

                {/* Governance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Proposal Threshold"
                        value={governanceStats ? `${parseFloat(governanceStats.proposalThreshold).toLocaleString()}` : '0'}
                        icon={<FaVoteYea />}
                        subtitle="NYAX tokens required"
                        loading={loading}
                    />
                    <StatCard
                        title="Voting Period"
                        value={governanceStats ? `${governanceStats.votingPeriod.toLocaleString()}` : '0'}
                        icon={<FaClock />}
                        subtitle="blocks (~7 days)"
                        loading={loading}
                    />
                    <StatCard
                        title="Quorum Required"
                        value={governanceStats ? `${parseFloat(governanceStats.quorumVotes).toLocaleString()}` : '0'}
                        icon={<FaUsers />}
                        subtitle="votes for proposal to pass"
                        loading={loading}
                    />
                </div>

                {/* User Voting Power & Treasury Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <VotingPowerCard
                        votingPower={votingPower}
                        loading={loading && isConnected}
                        onDelegate={handleDelegate}
                    />
                    <TreasuryCategories
                        categories={treasuryCategories}
                        loading={loading}
                    />
                </div>

                {/* Connection Prompt */}
                {!isConnected && (
                    <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
                        <p className="text-gray-400 mb-4">
                            Connect your wallet to view your NYAX balance, voting power, and participate in governance.
                        </p>
                        <p className="text-sm text-gray-500">
                            Use the wallet connection button in the header to get started.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
