'use client'
import { useDAOService } from '@/hooks/useDAOService';
import { useMigrationVault } from '@/hooks/useMigrationVault';
import { GovernanceStats, ProposalData, StakingStats, TreasuryTransfer } from '@/services/contracts/types';
import { CheckCircle, Coins, Shield, TrendingUp, Users, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useAccount } from 'wagmi';

type TabId = 'overview' | 'proposals' | 'transfers' | 'deposit';

type TokenMetrics = {
    totalSupply: string;
    maxSupply: string;
};

const formatNumber = (value: number | string | null | undefined, decimals = 2) => {
    if (value === null || value === undefined) return '0';
    const numeric = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(numeric)) return '0';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(numeric);
};

const formatTimeFromTimestamp = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const now = Date.now();
    const diffMs = now - timestamp * 1000;
    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

export default function NYALTXGovernance() {
    const { address, isConnected } = useAccount();
    const { daoService, isLoading: daoLoading, error: daoError } = useDAOService();
    const { stats: vaultStats, depositLegacy, loading: vaultLoading, actionPending: vaultPending, error: vaultError } = useMigrationVault();

    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [legacyDeposit, setLegacyDeposit] = useState({ amount: '', beneficiary: address ?? '', status: null as 'success' | 'error' | null, txHash: '' });
    const [proposals, setProposals] = useState<ProposalData[]>([]);
    const [governanceStats, setGovernanceStats] = useState<GovernanceStats | null>(null);
    const [stakingStats, setStakingStats] = useState<StakingStats | null>(null);
    const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics | null>(null);
    const [transfers, setTransfers] = useState<TreasuryTransfer[]>([]);
    const [transfersLoading, setTransfersLoading] = useState(false);
    const [transfersError, setTransfersError] = useState<string | null>(null);

    useEffect(() => {
        if (!daoService) return;
        let cancelled = false;
        const loadGovernance = async () => {
            try {
                const [stats, proposalList] = await Promise.all([
                    daoService.governance.getGovernanceStats(),
                    daoService.governance.getAllProposals(),
                ]);
                if (!cancelled) {
                    setGovernanceStats(stats);
                    setProposals(proposalList);
                }
            } catch (error) {
                console.error('Failed to load governance data', error);
            }
        };
        loadGovernance();
        return () => {
            cancelled = true;
        };
    }, [daoService]);

    useEffect(() => {
        if (!daoService) return;
        let cancelled = false;
        const loadStaking = async () => {
            try {
                const stats = await daoService.staking.getStats();
                if (!cancelled) setStakingStats(stats);
            } catch (error) {
                console.error('Failed to load staking stats', error);
            }
        };
        const loadTokenInfo = async () => {
            try {
                const info = await daoService.treasury.getTokenInfo();
                if (!cancelled) {
                    setTokenMetrics({ totalSupply: info.totalSupply, maxSupply: info.maxSupply });
                }
            } catch (error) {
                console.error('Failed to fetch token info', error);
            }
        };
        loadStaking();
        loadTokenInfo();
        return () => {
            cancelled = true;
        };
    }, [daoService]);

    useEffect(() => {
        if (!daoService) return;
        let cancelled = false;
        const loadTransfers = async () => {
            setTransfersLoading(true);
            setTransfersError(null);
            try {
                const recent = await daoService.treasury.getRecentTransfers(15, 75_000);
                if (!cancelled) setTransfers(recent);
            } catch (error) {
                console.error('Failed to load transfers', error);
                if (!cancelled) setTransfersError('Unable to load recent transfers.');
            } finally {
                if (!cancelled) setTransfersLoading(false);
            }
        };
        loadTransfers();
        return () => {
            cancelled = true;
        };
    }, [daoService]);

    const overview = useMemo(() => {
        const totalSupply = parseFloat(tokenMetrics?.totalSupply ?? '0');
        const stakedTokens = parseFloat(stakingStats?.totalStaked ?? '0');
        const circulatingSupply = Math.max(totalSupply - stakedTokens, 0);
        const holders = governanceStats?.totalVoters ?? 0;
        return { totalSupply, stakedTokens, circulatingSupply, holders };
    }, [tokenMetrics, stakingStats, governanceStats]);

    const tokenDistribution = useMemo(() => {
        const total = overview.totalSupply || 1;
        const staked = overview.stakedTokens;
        const circulating = overview.circulatingSupply;
        const treasury = Math.max(total - staked - circulating, 0);
        const locked = Math.max(total - (staked + circulating + treasury), 0);
        return [
            { name: 'Staked', value: (staked / total) * 100, color: '#3b82f6' },
            { name: 'Circulating', value: (circulating / total) * 100, color: '#8b5cf6' },
            { name: 'Treasury', value: (treasury / total) * 100, color: '#10b981' },
            { name: 'Locked', value: (locked / total) * 100, color: '#f59e0b' },
        ];
    }, [overview]);

    const votingPowerData = [
        { range: '0-100', holders: 8240 },
        { range: '100-1K', holders: 3120 },
        { range: '1K-10K', holders: 1180 },
        { range: '10K-100K', holders: 267 },
        { range: '100K+', holders: 40 },
    ];

    const volumeData = [
        { day: 'Mon', volume: 45000 },
        { day: 'Tue', volume: 52000 },
        { day: 'Wed', volume: 48000 },
        { day: 'Thu', volume: 61000 },
        { day: 'Fri', volume: 58000 },
        { day: 'Sat', volume: 43000 },
        { day: 'Sun', volume: 39000 },
    ];

    const tabs: TabId[] = ['overview', 'proposals', 'transfers', 'deposit'];

    useEffect(() => {
        setLegacyDeposit(prev => ({ ...prev, beneficiary: address ?? '' }));
    }, [address]);

    const handleLegacyDeposit = async () => {
        if (!legacyDeposit.amount) {
            setLegacyDeposit(prev => ({ ...prev, status: 'error' }));
            return;
        }
        try {
            const result = await depositLegacy(legacyDeposit.amount, legacyDeposit.beneficiary || address || undefined);
            setLegacyDeposit({ amount: '', beneficiary: address ?? '', status: 'success', txHash: result.txHash });
        } catch (error) {
            console.error('Deposit failed', error);
            setLegacyDeposit(prev => ({ ...prev, status: 'error' }));
        }
    };

    const getStatusColor = (status: any) => {
        switch (status) {
            case 'active': return 'bg-blue-500';
            case 'passed': return 'bg-green-500';
            case 'rejected': return 'bg-red-500';
            case 'pending': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen  text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2  text-white">
                        NYALTX Governance
                    </h1>
                    <p className="text-gray-400">Decentralized governance for token holders</p>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 mb-6 border-b border-gray-700 pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full transition-all ${activeTab === tab
                                ? 'bg-white text-blue-600'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">Total Supply</span>
                                    <Coins className="text-blue-400" size={20} />
                                </div>
                                <p className="text-3xl font-bold">{formatNumber(overview.totalSupply)}</p>
                                <p className="text-sm text-gray-400 mt-1">Max supply: {formatNumber(tokenMetrics?.maxSupply)}</p>
                            </div>

                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">Circulating</span>
                                    <Shield className="text-slate-300" size={20} />
                                </div>
                                <p className="text-3xl font-bold">{formatNumber(overview.circulatingSupply)}</p>
                                <p className="text-sm text-gray-400 mt-1">{formatNumber((overview.circulatingSupply / (overview.totalSupply || 1)) * 100)}% released</p>
                            </div>

                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">Staked Tokens</span>
                                    <TrendingUp className="text-green-400" size={20} />
                                </div>
                                <p className="text-3xl font-bold">{formatNumber(overview.stakedTokens)}</p>
                                <p className="text-sm text-green-400 mt-1">
                                    {formatNumber((overview.stakedTokens / (overview.totalSupply || 1)) * 100)}% of supply
                                </p>
                            </div>

                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">Token Holders</span>
                                    <Users className="text-purple-400" size={20} />
                                </div>
                                <p className="text-3xl font-bold">{formatNumber(overview.holders, 0)}</p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <h3 className="text-xl font-semibold mb-4">Token Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={tokenDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }: any) => `${name}: ${value}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {tokenDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <h3 className="text-xl font-semibold mb-4">7-Day Transfer Volume</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={volumeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="day" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                        <Line type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Voting Power Distribution */}
                        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4">Voting Power Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={votingPowerData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="range" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                    <Bar dataKey="holders" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Proposals Tab */}
                {activeTab === 'proposals' && (
                    <div className="space-y-4">
                        {proposals.map((proposal) => (
                            <div key={proposal.id} className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(proposal.status)} bg-opacity-20 ${getStatusColor(proposal.status).replace('bg-', 'text-')}`}>
                                                {proposal.status.toUpperCase()}
                                            </span>
                                            <h3 className="text-xl font-semibold">{proposal.title}</h3>
                                        </div>
                                        <p className="text-gray-400 text-sm">Proposal #{proposal.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Ends at block</p>
                                        <p className="font-semibold">{proposal.endBlock}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-green-400">For: {formatNumber(parseFloat(proposal.forVotes))}</span>
                                            <span className="text-red-400">Against: {formatNumber(parseFloat(proposal.againstVotes))}</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-linear-to-r from-green-500 to-red-500"
                                                style={{
                                                    width: '100%',
                                                    background: `linear-gradient(to right, #10b981 ${(() => {
                                                        const forVotes = parseFloat(proposal.forVotes);
                                                        const againstVotes = parseFloat(proposal.againstVotes);
                                                        const total = forVotes + againstVotes || 1;
                                                        return (forVotes / total) * 100;
                                                    })()}%, #ef4444 ${(() => {
                                                        const forVotes = parseFloat(proposal.forVotes);
                                                        const againstVotes = parseFloat(proposal.againstVotes);
                                                        const total = forVotes + againstVotes || 1;
                                                        return (forVotes / total) * 100;
                                                    })()}%)`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">
                                            Quorum target: {formatNumber(governanceStats?.quorumVotes ?? '0')} votes
                                        </span>
                                        {proposal.status === 'active' && (
                                            <div className="flex gap-2">
                                                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors">
                                                    Vote For
                                                </button>
                                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-colors">
                                                    Vote Against
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transfers Tab */}
                {activeTab === 'transfers' && (
                    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            {transfersLoading ? (
                                <div className="p-6 text-sm text-gray-300">Loading transfers...</div>
                            ) : transfersError ? (
                                <div className="p-6 text-sm text-red-400">{transfersError}</div>
                            ) : transfers.length === 0 ? (
                                <div className="p-6 text-sm text-gray-300">No treasury transfers found in the recent history.</div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-900/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">From</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">To</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Reason</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Time</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Explorer</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {transfers.map((transfer) => (
                                            <tr key={`${transfer.txHash}-${transfer.blockNumber}`} className="hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-mono text-gray-300">Treasury</td>
                                                <td className="px-6 py-4 text-sm font-mono text-gray-300">
                                                    {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold">{formatNumber(transfer.amount)} NYAX</td>
                                                <td className="px-6 py-4 text-sm text-gray-300">{transfer.reason || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                                                        {transfer.category || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400">{formatTimeFromTimestamp(transfer.timestamp)}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${transfer.txHash}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-400 hover:text-blue-200 text-xs"
                                                    >
                                                        View
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Legacy Deposit Tab */}
                {activeTab === 'deposit' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 border border-gray-700">
                            <h2 className="text-2xl font-bold mb-2">Legacy Token Deposit</h2>
                            <p className="text-gray-400 mb-6">
                                Deposit your legacy NYALTX tokens into the new governance system. No restrictions apply.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Beneficiary Address</label>
                                    <input
                                        type="text"
                                        placeholder="0x..."
                                        value={legacyDeposit.beneficiary}
                                        onChange={(e) => setLegacyDeposit(prev => ({ ...prev, beneficiary: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={legacyDeposit.amount}
                                        onChange={(e) => setLegacyDeposit(prev => ({ ...prev, amount: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                    />
                                </div>

                                <button
                                    className="w-full px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50"
                                    onClick={handleLegacyDeposit}
                                    disabled={!isConnected || vaultPending}
                                >
                                    {vaultPending ? 'Processing...' : 'Deposit Legacy Tokens'}
                                </button>

                                {legacyDeposit.status === 'success' && (
                                    <div className="flex flex-col gap-2 p-4 bg-green-500/20 border border-green-500 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="text-green-400" size={20} />
                                            <span className="text-green-400 font-semibold">Deposit successful!</span>
                                        </div>
                                        {legacyDeposit.txHash && (
                                            <a
                                                href={`https://sepolia.etherscan.io/tx/${legacyDeposit.txHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-green-300 underline"
                                            >
                                                View transaction
                                            </a>
                                        )}
                                    </div>
                                )}

                                {legacyDeposit.status === 'error' && (
                                    <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                                        <XCircle className="text-red-400" size={20} />
                                        <span className="text-red-400 font-semibold">{vaultError || 'Please fill in all fields'}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-300">
                                    <strong>Note:</strong> Legacy deposits are processed immediately with no restrictions.
                                    Once deposited, your tokens will be eligible for governance participation at a {vaultStats?.conversionRatio ?? '1'}x ratio.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}