'use client'

import { useDAOService } from '@/hooks/useDAOService';
import { useMigrationVault } from '@/hooks/useMigrationVault';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '@/services/contracts';
import { getFolderRegistryFactoryService } from '@/services/contracts/folderRegistryFactoryService';
import { getTreasuryService } from '@/services/contracts/treasuryService';
import { GovernanceStats, ProposalData, StakingStats, TreasuryTransfer } from '@/services/contracts/types';
import { ethers } from 'ethers';
import { Activity, ArrowUpRight, CheckCircle, Clock, Coins, Layers, Shield, TrendingUp, Users, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

type TabId = 'overview' | 'proposals' | 'transfers' | 'deposit';

type TokenMetrics = {
    totalSupply: string;
    maxSupply: string;
};

type ProposalAction = {
    target: string;
    value: string;
    calldata: string;
};

const TOKEN_FUNCTION_PRESETS = [
    {
        key: 'enableTransfers',
        label: 'NYAX: Enable transfers',
        functionName: 'setTransfersEnabled',
        args: [true],
    },
    {
        key: 'disableTransfers',
        label: 'NYAX: Disable transfers',
        functionName: 'setTransfersEnabled',
        args: [false],
    },
];

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

const formatBlocksToTime = (blocks?: number) => {
    if (!blocks) return '—';
    const seconds = blocks * 12; // assuming 12s block time
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
    return `${(seconds / 86400).toFixed(1)}d`;
};

export default function NYALTXGovernance() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
    const { daoService, isLoading: daoLoading, error: daoError } = useDAOService();
    const { stats: vaultStats, depositLegacy, loading: vaultLoading, actionPending: vaultPending, error: vaultError, recentDeposits } = useMigrationVault();

    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [legacyDeposit, setLegacyDeposit] = useState({ amount: '', beneficiary: address ?? '', status: null as 'success' | 'error' | null, txHash: '', message: '' });
    const [proposals, setProposals] = useState<ProposalData[]>([]);
    const [governanceStats, setGovernanceStats] = useState<GovernanceStats | null>(null);
    const [stakingStats, setStakingStats] = useState<StakingStats | null>(null);
    const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics | null>(null);
    const [governanceParameters, setGovernanceParameters] = useState<{
        votingDelay: number;
        votingPeriod: number;
        proposalThreshold: string;
        quorumVotes: string;
    } | null>(null);
    const [transfers, setTransfers] = useState<TreasuryTransfer[]>([]);
    const [transfersLoading, setTransfersLoading] = useState(false);
    const [transfersError, setTransfersError] = useState<string | null>(null);
    const [treasuryBalance, setTreasuryBalance] = useState<string>('0');
    const [treasuryBalanceLoading, setTreasuryBalanceLoading] = useState(false);
    const [factoryStats, setFactoryStats] = useState<{
        totalSupply: bigint;
        circulating: bigint;
        stakedValue: bigint;
        totalHolders: bigint;
    } | null>(null);
    const [factoryStatsLoading, setFactoryStatsLoading] = useState(false);
    const [showProposalForm, setShowProposalForm] = useState(false);
    const [proposalTitle, setProposalTitle] = useState('');
    const [proposalDescription, setProposalDescription] = useState('');
    const [proposalActions, setProposalActions] = useState<ProposalAction[]>([{ target: '', value: '0', calldata: '0x' }]);
    const [proposalSubmitting, setProposalSubmitting] = useState(false);
    const [proposalAlert, setProposalAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [votingProposalId, setVotingProposalId] = useState<string | null>(null);
    const [voteFeedback, setVoteFeedback] = useState<Record<string, { type: 'success' | 'error'; message: string } | null>>({});
    const nyaxTokenAddress = CONTRACT_ADDRESSES.nyaxToken ?? '';
    const nyaxTokenInterface = useMemo(() => {
        try {
            return new ethers.Interface(CONTRACT_ABIS.nyaxToken ?? []);
        } catch (error) {
            console.error('Failed to init NYAX token interface', error);
            return null;
        }
    }, []);

    const refreshGovernanceData = useCallback(async () => {
        if (!daoService) return;
        try {
            const [stats, proposalList, votingDelay, votingPeriod, proposalThreshold, quorumVotes] = await Promise.all([
                daoService.governance.getGovernanceStats(),
                daoService.governance.getAllProposals(),
                daoService.governance.getVotingDelay(),
                daoService.governance.getVotingPeriod(),
                daoService.governance.getProposalThreshold(),
                daoService.governance.getQuorumVotes(),
            ]);
            setGovernanceStats(stats);
            setProposals(proposalList);
            setGovernanceParameters({
                votingDelay,
                votingPeriod,
                proposalThreshold,
                quorumVotes,
            });
        } catch (error) {
            console.error('Failed to load governance data', error);
        }
    }, [daoService]);

    useEffect(() => {
        if (!daoService) return;
        refreshGovernanceData();
    }, [daoService, refreshGovernanceData]);

    // useEffect(() => {
    //     if (!daoService) return;
    //     let cancelled = false;
    //     const loadStaking = async () => {
    //         try {
    //             const stats = await daoService.staking.getStats();
    //             if (!cancelled) setStakingStats(stats);
    //         } catch (error) {
    //             console.error('Failed to load staking stats', error);
    //         }
    //     };
    //     const loadTokenInfo = async () => {
    //         try {
    //             const info = await daoService.treasury.getTokenInfo();
    //             if (!cancelled) {
    //                 setTokenMetrics({ totalSupply: info.totalSupply, maxSupply: info.maxSupply });
    //             }
    //         } catch (error) {
    //             console.error('Failed to fetch token info', error);
    //         }
    //     };
    //     loadStaking();
    //     loadTokenInfo();
    //     return () => {
    //         cancelled = true;
    //     };
    // }, [daoService]);

    // useEffect(() => {
    //     if (!daoService) return;
    //     let cancelled = false;
    //     const loadTransfers = async () => {
    //         setTransfersLoading(true);
    //         setTransfersError(null);
    //         try {
    //             const recent = await daoService.treasury.getRecentTransfers(15, 75_000);
    //             if (!cancelled) setTransfers(recent);
    //         } catch (error) {
    //             console.error('Failed to load transfers', error);
    //             if (!cancelled) setTransfersError('Unable to load recent transfers.');
    //         } finally {
    //             if (!cancelled) setTransfersLoading(false);
    //         }
    //     };
    //     loadTransfers();
    //     return () => {
    //         cancelled = true;
    //     };
    // }, [daoService]);

    useEffect(() => {
        let cancelled = false;
        const loadTreasuryBalance = async () => {
            setTreasuryBalanceLoading(true);
            try {
                if (!window.ethereum) {
                    console.warn('MetaMask not detected');
                    if (!cancelled) setTreasuryBalance('0');
                    return;
                }
                const provider = new ethers.BrowserProvider(window.ethereum as any);
                const treasuryService = getTreasuryService(provider);
                const balance = await treasuryService.getTreasuryBalanceFormatted();
                if (!cancelled) setTreasuryBalance(balance);
            } catch (error) {
                console.error('Failed to load treasury balance', error);
                if (!cancelled) setTreasuryBalance('0');
            } finally {
                if (!cancelled) setTreasuryBalanceLoading(false);
            }
        };
        loadTreasuryBalance();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const loadFactoryStats = async () => {
            setFactoryStatsLoading(true);
            try {
                console.log('Loading factory stats...');
                if (!window.ethereum) {
                    console.warn('MetaMask not detected');
                    if (!cancelled) setFactoryStats(null);
                    return;
                }
                const provider = new ethers.BrowserProvider(window.ethereum as any);
                console.log('Provider created');

                const factoryService = getFolderRegistryFactoryService(provider);
                console.log('Factory service created');

                const stats = await factoryService.getAllTokenStats();
                console.log('Factory stats fetched:', stats);

                if (!cancelled) setFactoryStats(stats);
            } catch (error) {
                console.error('Failed to load factory stats', error);
                if (!cancelled) setFactoryStats(null);
            } finally {
                if (!cancelled) setFactoryStatsLoading(false);
            }
        };
        loadFactoryStats();
        return () => {
            cancelled = true;
        };
    }, []);

    const overview = useMemo(() => {
        const totalSupply = factoryStats ? Number(ethers.formatEther(factoryStats.totalSupply)) : parseFloat(tokenMetrics?.totalSupply ?? '0');
        const stakedTokens = factoryStats ? Number(ethers.formatEther(factoryStats.stakedValue)) : parseFloat(stakingStats?.totalStaked ?? '0');
        const circulatingSupply = factoryStats ? Number(ethers.formatEther(factoryStats.circulating)) : Math.max(totalSupply - stakedTokens, 0);
        const holders = factoryStats ? Number(factoryStats.totalHolders) : (governanceStats?.totalVoters ?? 0);
        return { totalSupply, stakedTokens, circulatingSupply, holders };
    }, [factoryStats, tokenMetrics, stakingStats, governanceStats]);

    const participationStats = useMemo(() => {
        const stakingRate = overview.totalSupply ? (overview.stakedTokens / overview.totalSupply) * 100 : 0;
        const circulationRate = overview.totalSupply ? (overview.circulatingSupply / overview.totalSupply) * 100 : 0;
        const quorumVotes = Number(governanceStats?.quorumVotes ?? 0);
        const thresholdVotes = Number(governanceStats?.proposalThreshold ?? 0);

        return [
            {
                label: 'Staking participation',
                value: stakingRate,
                suffix: '% of supply',
                accent: 'from-blue-500 to-cyan-400',
                max: 100,
            },
            {
                label: 'Circulating release',
                value: circulationRate,
                suffix: '% unlocked',
                accent: 'from-purple-500 to-pink-500',
                max: 100,
            },
            {
                label: 'Quorum requirement',
                value: quorumVotes,
                suffix: 'votes needed',
                accent: 'from-emerald-500 to-lime-400',
                max: Math.max(quorumVotes * 1.5, quorumVotes || 1),
            },
            {
                label: 'Proposal threshold',
                value: thresholdVotes,
                suffix: 'votes to submit',
                accent: 'from-orange-500 to-amber-400',
                max: Math.max(thresholdVotes * 1.5, thresholdVotes || 1),
            },
        ];
    }, [overview, governanceStats]);

    const proposalPreview = useMemo(() => proposals.slice(0, 3), [proposals]);
    const transferPreview = useMemo(() => transfers.slice(0, 3), [transfers]);

    const tokenDistribution = useMemo(() => {
        const total = overview.totalSupply || 1;
        const staked = overview.stakedTokens;
        const circulating = overview.circulatingSupply;
        const treasury = Math.max(total - staked - circulating, 0);
        return [
            { label: 'Circulating', value: circulating, color: '#a855f7' },
            { label: 'Staked', value: staked, color: '#22d3ee' },
            { label: 'Treasury', value: treasury, color: '#34d399' },
        ];
    }, [overview]);

    const activitySparkline = useMemo(() => {
        return proposals.slice(0, 7).map((proposal, index) => ({
            label: `#${proposal.id}`,
            votes: Number(proposal.forVotes) + Number(proposal.againstVotes),
            order: proposals.length - index,
        })).reverse();
    }, [proposals]);

    const REQUIRED_CHAIN_ID = 11155111; // Ethereum Sepolia
    const onRequiredNetwork = chainId === REQUIRED_CHAIN_ID;
    const tabs: TabId[] = ['overview', 'proposals', 'transfers', 'deposit'];

    useEffect(() => {
        setLegacyDeposit(prev => ({ ...prev, beneficiary: address ?? '' }));
    }, [address]);

    const addProposalAction = useCallback(() => {
        setProposalActions((prev) => [...prev, { target: '', value: '0', calldata: '0x' }]);
    }, []);

    const removeProposalAction = useCallback((index: number) => {
        setProposalActions((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
    }, []);

    const updateProposalAction = useCallback((index: number, field: keyof ProposalAction, value: string) => {
        setProposalActions((prev) => prev.map((action, i) => (i === index ? { ...action, [field]: value } : action)));
    }, []);

    const applyTokenFunctionPreset = useCallback(
        (index: number, key: string) => {
            const preset = TOKEN_FUNCTION_PRESETS.find((entry) => entry.key === key);
            if (!preset) return;
            if (!nyaxTokenAddress) {
                setProposalAlert({ type: 'error', message: 'NYAX token address not configured.' });
                return;
            }
            if (!nyaxTokenInterface) {
                setProposalAlert({ type: 'error', message: 'Unable to encode NYAX token function.' });
                return;
            }
            try {
                const data = nyaxTokenInterface.encodeFunctionData(preset.functionName, preset.args);
                setProposalActions((prev) =>
                    prev.map((action, i) =>
                        i === index
                            ? {
                                ...action,
                                target: nyaxTokenAddress,
                                value: '0',
                                calldata: data,
                            }
                            : action
                    )
                );
            } catch (error) {
                console.error('Failed to apply token preset', error);
                setProposalAlert({ type: 'error', message: 'Failed to encode NYAX token calldata.' });
            }
        },
        [nyaxTokenAddress, nyaxTokenInterface]
    );

    const getDepositErrorMessage = (error: unknown) => {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            const err = error as { code?: string | number; message?: string };
            if (err.code === 'ACTION_REJECTED') return 'Transaction rejected in wallet.';
            if (err.code === 'CALL_EXCEPTION') return 'Deposit reverted. Check allowance and amount, then try again.';
        }
        return 'Deposit failed. Please try again.';
    };

    const handleSwitchNetwork = useCallback(async () => {
        if (onRequiredNetwork) return true;
        try {
            await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
            return true;
        } catch (error) {
            console.error('Failed to switch to Sepolia', error);
            return false;
        }
    }, [onRequiredNetwork, switchChainAsync]);

    useEffect(() => {
        if (isConnected && !onRequiredNetwork) {
            handleSwitchNetwork();
        }
    }, [isConnected, onRequiredNetwork, handleSwitchNetwork]);

    const handleCreateProposal = useCallback(async () => {
        if (!daoService) {
            setProposalAlert({ type: 'error', message: 'DAO service not initialized yet.' });
            return;
        }
        if (!isConnected) {
            setProposalAlert({ type: 'error', message: 'Connect your wallet to submit proposals.' });
            return;
        }
        if (!onRequiredNetwork) {
            const switched = await handleSwitchNetwork();
            if (!switched) {
                setProposalAlert({ type: 'error', message: 'Switch to Ethereum Sepolia (chain ID 11155111) to submit proposals.' });
                return;
            }
        }
        if (!proposalTitle.trim() || !proposalDescription.trim()) {
            setProposalAlert({ type: 'error', message: 'Title and description are required.' });
            return;
        }
        if (proposalActions.some((action) => !action.target.trim())) {
            setProposalAlert({ type: 'error', message: 'Each action needs a target contract address.' });
            return;
        }

        setProposalSubmitting(true);
        setProposalAlert(null);

        try {
            const targets = proposalActions.map((action) => action.target.trim());
            const values = proposalActions.map((action) => (action.value.trim() ? action.value.trim() : '0'));
            const calldatas = proposalActions.map((action) => {
                const data = action.calldata.trim();
                if (!data) return '0x';
                return data.startsWith('0x') ? data : `0x${data}`;
            });
            const formattedDescription = `# ${proposalTitle.trim()}\n\n${proposalDescription.trim()}`;

            const proposalId = await daoService.governance.createProposal(targets, values, calldatas, formattedDescription);
            setProposalAlert({ type: 'success', message: proposalId ? `Proposal submitted (ID: ${proposalId})` : 'Proposal submitted successfully.' });
            setProposalTitle('');
            setProposalDescription('');
            setProposalActions([{ target: '', value: '0', calldata: '0x' }]);
            await refreshGovernanceData();
        } catch (error) {
            console.error('Failed to create proposal', error);
            const message = error instanceof Error ? error.message : 'Failed to create proposal. Please try again.';
            setProposalAlert({ type: 'error', message });
        } finally {
            setProposalSubmitting(false);
        }
    }, [daoService, isConnected, onRequiredNetwork, proposalTitle, proposalDescription, proposalActions, refreshGovernanceData]);

    const handleVote = useCallback(
        async (proposalId: string, support: 0 | 1 | 2) => {
            if (!daoService) {
                setVoteFeedback((prev) => ({ ...prev, [proposalId]: { type: 'error', message: 'DAO service not initialized yet.' } }));
                return;
            }
            if (!isConnected) {
                setVoteFeedback((prev) => ({ ...prev, [proposalId]: { type: 'error', message: 'Connect your wallet to vote.' } }));
                return;
            }
            if (!onRequiredNetwork) {
                const switched = await handleSwitchNetwork();
                if (!switched) {
                    setVoteFeedback((prev) => ({ ...prev, [proposalId]: { type: 'error', message: 'Switch to Ethereum Sepolia (chain ID 11155111) to vote.' } }));
                    return;
                }
            }

            setVotingProposalId(proposalId);
            setVoteFeedback((prev) => ({ ...prev, [proposalId]: null }));

            try {
                await daoService.governance.castVote(proposalId, support);
                setVoteFeedback((prev) => ({ ...prev, [proposalId]: { type: 'success', message: 'Vote submitted successfully.' } }));
                await refreshGovernanceData();
            } catch (error) {
                console.error('Failed to cast vote', error);
                const message = error instanceof Error ? error.message : 'Failed to cast vote. Please try again.';
                setVoteFeedback((prev) => ({ ...prev, [proposalId]: { type: 'error', message } }));
            } finally {
                setVotingProposalId(null);
            }
        },
        [daoService, isConnected, onRequiredNetwork, refreshGovernanceData]
    );

    const handleLegacyDeposit = async () => {
        if (!isConnected) {
            setLegacyDeposit(prev => ({ ...prev, status: 'error', message: 'Connect your wallet to deposit legacy NYAX.' }));
            return;
        }
        if (!onRequiredNetwork) {
            const switched = await handleSwitchNetwork();
            if (!switched) {
                setLegacyDeposit(prev => ({ ...prev, status: 'error', message: 'Switch to Ethereum Sepolia (chain ID 11155111) to deposit.' }));
                return;
            }
        }
        const amountValue = Number(legacyDeposit.amount);
        if (!legacyDeposit.amount || !Number.isFinite(amountValue) || amountValue <= 0) {
            setLegacyDeposit(prev => ({ ...prev, status: 'error', message: 'Enter an amount greater than zero.' }));
            return;
        }
        try {
            const result = await depositLegacy(legacyDeposit.amount, legacyDeposit.beneficiary || address || undefined);
            setLegacyDeposit({ amount: '', beneficiary: address ?? '', status: 'success', txHash: result.txHash, message: '' });
        } catch (error) {
            console.error('Deposit failed', error);
            setLegacyDeposit(prev => ({ ...prev, status: 'error', message: getDepositErrorMessage(error) }));
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
        <div className="min-h-screen  text-white px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-8 sm:px-8 sm:py-10 shadow-[0_25px_70px_rgba(7,13,30,0.55)]">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-indigo-200/80">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> NYAX DAO
                                {!onRequiredNetwork && isConnected && (
                                    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-300/40 bg-amber-400/10 p-4 text-sm text-amber-100">
                                        <div className="font-semibold text-amber-200">Action required: switch to Ethereum Sepolia</div>
                                        <p className="text-amber-100/90">
                                            Governa contracts are deployed on Sepolia. Please switch your wallet network before submitting proposals, voting, or executing transactions.
                                        </p>
                                        <div>
                                            <button
                                                onClick={handleSwitchNetwork}
                                                disabled={isSwitching}
                                                className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {isSwitching ? 'Switching…' : 'Switch to Sepolia'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold">NYALTX Governance Command Surface</h1>
                                <p className="text-gray-300 mt-2 max-w-2xl">
                                    Monitor protocol health, orchestrate proposals, and stream treasury activity from a single dashboard aligned with the nyaltx.pro admin aesthetic.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                                <span className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${isConnected ? 'border-emerald-400/40 text-emerald-200' : 'border-red-400/30 text-red-200'}`}>
                                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    {isConnected ? 'Wallet connected' : 'Connect wallet to act'}
                                </span>
                                <span className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${onRequiredNetwork ? 'border-indigo-400/40 text-indigo-100' : 'border-amber-400/40 text-amber-100'}`}>
                                    <span className={`h-2 w-2 rounded-full ${onRequiredNetwork ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                                    {onRequiredNetwork ? 'Sepolia network detected' : 'Switch to Sepolia to transact'}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 min-w-[260px]">
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-400">
                                <p className="uppercase tracking-[0.3em] text-[10px] text-gray-500">Total supply</p>
                                <p className="text-2xl font-semibold text-white mt-1">{formatNumber(overview.totalSupply)}</p>
                                <p className="text-xs">Max {formatNumber(tokenMetrics?.maxSupply)}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-400">
                                <p className="uppercase tracking-[0.3em] text-[10px] text-gray-500">Staked</p>
                                <p className="text-2xl font-semibold text-white mt-1">{formatNumber(overview.stakedTokens)}</p>
                                <p className="text-xs">{formatNumber((overview.stakedTokens / (overview.totalSupply || 1)) * 100)}% locked</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-wrap gap-3 border border-white/10 rounded-full px-2 py-2 bg-black/30 backdrop-blur">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="rounded-3xl bg-linear-to-br from-indigo-600/30 via-purple-600/20 to-blue-500/20 border border-white/10 p-6 sm:p-8">
                            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/80 mb-2">Governance Overview</p>
                                    <h2 className="text-3xl sm:text-4xl font-semibold">A living, breathing treasury directed by its holders.</h2>
                                    <p className="text-gray-200/70 mt-2 max-w-2xl">
                                        Monitor protocol health, track treasury movements, and jump into active proposals
                                        without leaving this command surface.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full md:w-auto md:min-w-[260px]">
                                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                                        <p className="text-xs text-gray-300">Active proposals</p>
                                        <p className="text-3xl font-semibold mt-1">{proposalPreview.length ?? 0}</p>
                                        <span className="text-xs text-emerald-300 inline-flex items-center gap-1 mt-2">
                                            <Activity size={14} /> Live voting
                                        </span>
                                    </div>
                                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                                        <p className="text-xs text-gray-300">Treasury streams</p>
                                        <p className="text-3xl font-semibold mt-1">
                                            {treasuryBalanceLoading ? '...' : formatNumber(treasuryBalance)}
                                        </p>
                                        <span className="text-xs text-blue-300 inline-flex items-center gap-1 mt-2">
                                            <Coins size={14} /> NYAX tokens
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-2xl bg-gray-900/50 border border-gray-800/60 p-5">
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span>Total supply</span>
                                    <Coins className="text-blue-300" size={18} />
                                </div>
                                <p className="text-3xl font-semibold mt-2">
                                    {factoryStatsLoading ? '...' : formatNumber(overview.totalSupply)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Max {formatNumber(tokenMetrics?.maxSupply)}</p>
                            </div>
                            <div className="rounded-2xl bg-gray-900/50 border border-gray-800/60 p-5">
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span>Circulating</span>
                                    <Shield className="text-purple-300" size={18} />
                                </div>
                                <p className="text-3xl font-semibold mt-2">
                                    {factoryStatsLoading ? '...' : formatNumber(overview.circulatingSupply)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {factoryStatsLoading ? '...' : formatNumber((overview.circulatingSupply / (overview.totalSupply || 1)) * 100)}% released
                                </p>
                            </div>
                            <div className="rounded-2xl bg-gray-900/50 border border-gray-800/60 p-5">
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span>Staked value</span>
                                    <TrendingUp className="text-emerald-300" size={18} />
                                </div>
                                <p className="text-3xl font-semibold mt-2">
                                    {factoryStatsLoading ? '...' : formatNumber(overview.stakedTokens)}
                                </p>
                                <p className="text-xs text-emerald-400 mt-1">
                                    {factoryStatsLoading ? '...' : formatNumber((overview.stakedTokens / (overview.totalSupply || 1)) * 100)}% of supply
                                </p>
                            </div>
                            <div className="rounded-2xl bg-gray-900/50 border border-gray-800/60 p-5">
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span>Token holders</span>
                                    <Users className="text-pink-300" size={18} />
                                </div>
                                <p className="text-3xl font-semibold mt-2">
                                    {factoryStatsLoading ? '...' : formatNumber(overview.holders, 0)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">wallets with voting power</p>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-gray-900/60 border border-gray-800/80 p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Participation snapshot</p>
                                    <h3 className="text-xl font-semibold">How the community is positioned right now</h3>
                                </div>
                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                    <Layers size={16} /> Updated {formatTimeFromTimestamp(Math.floor(Date.now() / 1000))}
                                </span>
                            </div>
                            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                                {participationStats.map((stat) => {
                                    const progress = stat.max ? Math.min((stat.value / stat.max) * 100, 100) : 0;
                                    return (
                                        <div key={stat.label} className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <div>
                                                    <p className="text-gray-300">{stat.label}</p>
                                                    <span className="text-xs text-gray-500">{stat.suffix}</span>
                                                </div>
                                                <span className="text-lg font-semibold">{formatNumber(stat.value)}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-linear ${stat.accent}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl bg-gray-900/60 border border-gray-800/80 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Supply allocation</p>
                                        <h3 className="text-xl font-semibold">Token distribution</h3>
                                    </div>
                                    <span className="text-xs text-gray-500">Real-time</span>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={tokenDistribution}
                                                dataKey="value"
                                                nameKey="label"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={6}
                                                stroke="none"
                                            >
                                                {tokenDistribution.map((entry) => (
                                                    <Cell key={entry.label} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    borderRadius: '0.75rem',
                                                }}
                                                formatter={(value: number, name: string) => [
                                                    `${formatNumber(value)} NYAX`,
                                                    name,
                                                ]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm text-gray-400">
                                    {tokenDistribution.map((segment) => (
                                        <div key={segment.label} className="rounded-xl border border-white/5 bg-white/5 p-3">
                                            <p className="text-xs uppercase tracking-wide text-gray-500">{segment.label}</p>
                                            <p className="text-lg font-semibold text-white">{formatNumber(segment.value)}</p>
                                            <p className="text-xs text-gray-500">{formatNumber((segment.value / (overview.totalSupply || 1)) * 100)}%</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-3xl bg-gray-900/60 border border-gray-800/80 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Proposal energy</p>
                                        <h3 className="text-xl font-semibold">Recent voting volume</h3>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('proposals')}
                                        className="text-xs text-indigo-300 hover:text-white"
                                    >
                                        View details
                                    </button>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer>
                                        <AreaChart data={activitySparkline} margin={{ left: -10, right: 0, top: 10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="proposalVotes" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                            <XAxis dataKey="label" stroke="#6b7280" tickLine={false} axisLine={false} fontSize={12} />
                                            <YAxis stroke="#6b7280" tickLine={false} axisLine={false} fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    borderRadius: '0.75rem',
                                                }}
                                                formatter={(value: number) => `${formatNumber(value)} votes`}
                                            />
                                            <Area type="monotone" dataKey="votes" stroke="#818cf8" fill="url(#proposalVotes)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Peak turnout</p>
                                        <p className="text-white text-lg font-semibold">
                                            {formatNumber(Math.max(...activitySparkline.map((d) => d.votes), 0))} votes
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Sample window</p>
                                        <p className="text-white text-lg font-semibold">{activitySparkline.length} latest props</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl bg-gray-900/60 border border-gray-800/80 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Governance pulse</p>
                                        <h3 className="text-xl font-semibold">Latest proposals</h3>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('proposals')}
                                        className="text-sm text-indigo-300 hover:text-white inline-flex items-center gap-2"
                                    >
                                        View all <ArrowUpRight size={16} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {proposalPreview.length === 0 ? (
                                        <p className="text-sm text-gray-500">No proposals found yet.</p>
                                    ) : (
                                        proposalPreview.map((proposal) => (
                                            <div key={proposal.id} className="p-4 rounded-2xl bg-black/30 border border-white/5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/5`}>{proposal.status}</span>
                                                    <span className="text-xs text-gray-400">Ends block {proposal.endBlock}</span>
                                                </div>
                                                <h4 className="font-semibold text-lg mb-2">{proposal.title}</h4>
                                                <div className="flex items-center justify-between text-sm text-gray-400">
                                                    <span className="text-emerald-300">For {formatNumber(parseFloat(proposal.forVotes) || 0)}</span>
                                                    <span className="text-rose-300">Against {formatNumber(parseFloat(proposal.againstVotes) || 0)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl bg-gray-900/60 border border-gray-800/80 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Treasury moments</p>
                                        <h3 className="text-xl font-semibold">Recent transfers</h3>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('transfers')}
                                        className="text-sm text-indigo-300 hover:text-white inline-flex items-center gap-2"
                                    >
                                        View ledger <ArrowUpRight size={16} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {transferPreview.length === 0 ? (
                                        <p className="text-sm text-gray-500">No treasury activity recorded.</p>
                                    ) : (
                                        transferPreview.map((transfer) => (
                                            <div key={`${transfer.txHash}-${transfer.blockNumber}`} className="p-4 rounded-2xl bg-black/30 border border-white/5">
                                                <div className="flex items-center justify-between text-sm text-gray-400">
                                                    <span>{transfer.category || 'General'}</span>
                                                    <span className="font-mono text-xs">{transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}</span>
                                                </div>
                                                <p className="text-2xl font-semibold mt-2">{formatNumber(transfer.amount)} NYAX</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatTimeFromTimestamp(transfer.timestamp)}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-gray-900/60 border border-gray-800/80 p-6">
                            <div className="flex flex-col gap-2 mb-6">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Protocol constants</p>
                                <h3 className="text-xl font-semibold">Key governance parameters</h3>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
                                    <Clock size={18} className="text-indigo-300 mb-3" />
                                    <p className="text-sm text-gray-400">Voting delay</p>
                                    <p className="text-xl font-semibold">{governanceParameters?.votingDelay ?? 0} blocks</p>
                                    <p className="text-xs text-gray-500">~{formatBlocksToTime(governanceParameters?.votingDelay)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
                                    <Activity size={18} className="text-emerald-300 mb-3" />
                                    <p className="text-sm text-gray-400">Voting period</p>
                                    <p className="text-xl font-semibold">{governanceParameters?.votingPeriod ?? 0} blocks</p>
                                    <p className="text-xs text-gray-500">~{formatBlocksToTime(governanceParameters?.votingPeriod)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
                                    <Coins size={18} className="text-amber-300 mb-3" />
                                    <p className="text-sm text-gray-400">Proposal threshold</p>
                                    <p className="text-xl font-semibold">{formatNumber(governanceParameters?.proposalThreshold ?? '0')}</p>
                                    <p className="text-xs text-gray-500">votes required to submit</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
                                    <Shield size={18} className="text-blue-300 mb-3" />
                                    <p className="text-sm text-gray-400">Quorum</p>
                                    <p className="text-xl font-semibold">{formatNumber(governanceParameters?.quorumVotes ?? '0')}</p>
                                    <p className="text-xs text-gray-500">votes to ratify</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Proposals Tab */}
                {activeTab === 'proposals' && (
                    <div className="space-y-4">


                        {/* <div className="rounded-3xl bg-gray-900/60 border border-white/10 p-6 shadow-2xl shadow-indigo-900/10">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-indigo-200/70">
                                        <FilePlus2 size={14} /> Create Proposal
                                    </div>
                                    <h3 className="text-2xl font-semibold mt-2">Push a new governance action on-chain</h3>
                                    <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                                        Draft callable payloads, bundle multiple targets, and broadcast through the NYALTX governor contract.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowProposalForm((prev) => !prev)}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${showProposalForm ? 'bg-white text-indigo-600 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    <Plus size={16} /> {showProposalForm ? 'Hide builder' : 'Open builder'}
                                </button>
                            </div>

                            {proposalAlert && (
                                <div
                                    className={`mt-6 rounded-2xl border p-4 text-sm ${proposalAlert.type === 'success'
                                        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                                        : 'border-red-400/40 bg-red-400/10 text-red-200'
                                        }`}
                                >
                                    {proposalAlert.message}
                                </div>
                            )}

                            {showProposalForm && (
                                <div className="mt-6 space-y-6">
                                    <div>
                                        <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Proposal title</label>
                                        <input
                                            type="text"
                                            value={proposalTitle}
                                            onChange={(e) => setProposalTitle(e.target.value)}
                                            placeholder="Add a descriptive title"
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-indigo-400/70 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Description</label>
                                        <textarea
                                            value={proposalDescription}
                                            onChange={(e) => setProposalDescription(e.target.value)}
                                            placeholder="Explain the motivation, execution steps, and impact. Markdown encouraged."
                                            rows={4}
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-indigo-400/70 focus:outline-none"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Actions</p>
                                                <p className="text-sm text-gray-500">Each action is a single contract call.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addProposalAction}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                                            >
                                                <Plus size={14} /> Add action
                                            </button>
                                        </div>

                                        {proposalActions.map((action, index) => (
                                            <div key={`proposal-action-${index}`} className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
                                                <div className="flex items-center justify-between text-sm text-gray-400">
                                                    <span>Action {index + 1}</span>
                                                    {proposalActions.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProposalAction(index)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Quick presets</label>
                                                    <select
                                                        defaultValue=""
                                                        onChange={(event) => {
                                                            const presetKey = event.target.value;
                                                            if (!presetKey) return;
                                                            applyTokenFunctionPreset(index, presetKey);
                                                            event.currentTarget.value = '';
                                                        }}
                                                        className="mt-1 w-full rounded-xl border border-white/10 bg-gray-900/40 px-3 py-2 text-sm text-white"
                                                    >
                                                        <option value="" disabled>
                                                            Use NYAX token function…
                                                        </option>
                                                        {TOKEN_FUNCTION_PRESETS.map((preset) => (
                                                            <option key={preset.key} value={preset.key}>
                                                                {preset.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-gray-400">Target contract</label>
                                                        <input
                                                            type="text"
                                                            value={action.target}
                                                            onChange={(e) => updateProposalAction(index, 'target', e.target.value)}
                                                            placeholder="0x..."
                                                            className="w-full rounded-xl border border-white/10 bg-gray-900/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-400/70 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-gray-400">ETH value</label>
                                                        <input
                                                            type="text"
                                                            value={action.value}
                                                            onChange={(e) => updateProposalAction(index, 'value', e.target.value)}
                                                            placeholder="0"
                                                            className="w-full rounded-xl border border-white/10 bg-gray-900/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-400/70 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-gray-400">Calldata</label>
                                                        <input
                                                            type="text"
                                                            value={action.calldata}
                                                            onChange={(e) => updateProposalAction(index, 'calldata', e.target.value)}
                                                            placeholder="0x"
                                                            className="w-full rounded-xl border border-white/10 bg-gray-900/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-400/70 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCreateProposal}
                                        disabled={proposalSubmitting}
                                        className="w-full rounded-2xl bg-linear-to-r from-indigo-500 via-blue-500 to-purple-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide transition disabled:opacity-60"
                                    >
                                        {proposalSubmitting ? 'Submitting...' : 'Create proposal'}
                                    </button>

                                    {!isConnected && (
                                        <div className="rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-200">
                                            Connect your wallet to create proposals.
                                        </div>
                                    )}
                                    {!onRequiredNetwork && isConnected && (
                                        <div className="rounded-2xl border border-orange-400/40 bg-orange-400/10 p-4 text-sm text-orange-200">
                                            Switch to Ethereum Sepolia (chain ID 11155111) to submit this proposal.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div> */}

                        {proposals.map((proposal) => (
                            <div key={proposal.id} className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(proposal.status)} bg-opacity-20 ${getStatusColor(proposal.status).replace('bg-', 'text-')}`}>
                                                {proposal.status.toUpperCase()}
                                            </span> */}
                                            <h3 className="text-xl font-semibold">
                                                {proposal.description}</h3>
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
                                                <button
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                                                    onClick={() => handleVote(proposal.id, 1)}
                                                    disabled={votingProposalId === proposal.id}
                                                >
                                                    {votingProposalId === proposal.id ? 'Voting…' : 'Vote For'}
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                                                    onClick={() => handleVote(proposal.id, 0)}
                                                    disabled={votingProposalId === proposal.id}
                                                >
                                                    {votingProposalId === proposal.id ? 'Voting…' : 'Vote Against'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {voteFeedback[proposal.id] && (
                                        <p
                                            className={`text-xs mt-2 ${voteFeedback[proposal.id]?.type === 'success'
                                                ? 'text-emerald-300'
                                                : 'text-red-300'
                                                }`}
                                        >
                                            {voteFeedback[proposal.id]?.message}
                                        </p>
                                    )}
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

                        <div className="border-t border-gray-700 bg-gray-900/40">
                            <div className="flex items-center justify-between px-6 py-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Legacy vault</p>
                                    <h3 className="text-lg font-semibold text-white">Recent migration deposits</h3>
                                </div>
                                <span className="text-xs text-gray-400">Showing {recentDeposits.length || 0} entries</span>
                            </div>

                            {recentDeposits.length === 0 ? (
                                <div className="px-6 pb-6 text-sm text-gray-400">No legacy deposits recorded in the selected window.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-900/60">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Legacy amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">NYAX minted</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Block</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Explorer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {recentDeposits.map((deposit) => (
                                                <tr key={deposit.txHash} className="hover:bg-gray-800/40 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-mono text-gray-200">{deposit.account.slice(0, 6)}...{deposit.account.slice(-4)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-100">{formatNumber(deposit.legacyAmount)} LEGACY</td>
                                                    <td className="px-6 py-4 text-sm text-emerald-300">{formatNumber(deposit.governanceMinted)} NYAX</td>
                                                    <td className="px-6 py-4 text-sm text-gray-400">#{deposit.blockNumber}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-400">{formatTimeFromTimestamp(deposit.timestamp)}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <a
                                                            href={`https://sepolia.etherscan.io/tx/${deposit.txHash}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-indigo-300 hover:text-white"
                                                        >
                                                            View
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Legacy Deposit Tab */}
                {activeTab === 'deposit' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-3xl border border-white/10 bg-gray-900/60 p-8 shadow-2xl shadow-indigo-900/20">
                                <div className="flex flex-col gap-3 mb-8">
                                    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-indigo-200/70">
                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Legacy vault
                                    </div>
                                    <h2 className="text-3xl font-semibold">Deposit legacy NYAX into the on-chain vault</h2>
                                    <p className="text-gray-400">
                                        Seamlessly migrate historical balances into the upgraded governance system. Deposits
                                        settle instantly and unlock voting weight using the conversion rate shown.
                                    </p>
                                    <div className="flex flex-wrap gap-3 text-xs">
                                        <span className={`px-3 py-1 rounded-full border ${isConnected ? 'border-emerald-400/40 text-emerald-300' : 'border-red-400/40 text-red-300'}`}>
                                            {isConnected ? 'Wallet connected' : 'Connect wallet to deposit'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full border border-indigo-300/40 text-indigo-200">
                                            Conversion ratio: {vaultStats?.conversionRatio ?? '1.0'}x
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white/80">Beneficiary address</label>
                                        <div className="rounded-2xl border border-white/10 bg-black/40 focus-within:border-indigo-400/70">
                                            <input
                                                type="text"
                                                placeholder="0x0000..."
                                                value={legacyDeposit.beneficiary}
                                                onChange={(e) => setLegacyDeposit(prev => ({ ...prev, beneficiary: e.target.value }))}
                                                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Defaults to your connected wallet if left blank.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white/80">Deposit amount</label>
                                        <div className="rounded-2xl border border-white/10 bg-black/40 focus-within:border-indigo-400/70">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Enter NYAX to deposit"
                                                value={legacyDeposit.amount}
                                                onChange={(e) => setLegacyDeposit(prev => ({ ...prev, amount: e.target.value }))}
                                                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Legacy vault allowance is unlimited.</span>
                                            <button
                                                type="button"
                                                className="text-indigo-300 hover:text-white"
                                                onClick={() => setLegacyDeposit(prev => ({ ...prev, amount: '0' }))}
                                            >
                                                Reset amount
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full rounded-2xl bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-4 text-sm font-semibold uppercase tracking-wide transition-all duration-150 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-50"
                                        onClick={handleLegacyDeposit}
                                        disabled={!isConnected || vaultPending}
                                    >
                                        {vaultPending ? 'Processing deposit…' : 'Confirm deposit'}
                                    </button>

                                    {legacyDeposit.status === 'success' && (
                                        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                                            <div className="flex items-center gap-2 font-semibold text-emerald-300">
                                                <CheckCircle size={18} /> Deposit successful
                                            </div>
                                            {legacyDeposit.txHash && (
                                                <a
                                                    href={`https://sepolia.etherscan.io/tx/${legacyDeposit.txHash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-2 inline-flex items-center text-xs text-emerald-200/80 underline"
                                                >
                                                    View transaction
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {legacyDeposit.status === 'error' && (
                                        <div className="rounded-2xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-200">
                                            <div className="flex items-center gap-2 font-semibold text-red-300">
                                                <XCircle size={18} /> {vaultError || 'Please fill in all required fields'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-indigo-900/40 via-slate-900/60 to-black/80 p-8 text-sm text-gray-300">
                                <div className="mb-6">
                                    <p className="text-xs uppercase tracking-[0.25em] text-indigo-200/80">How it works</p>
                                    <h3 className="text-2xl font-semibold text-white mt-2">Migration safety checklist</h3>
                                    <p className="text-gray-400 mt-2">Protect governance continuity while moving legacy balances on-chain.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                                        <p className="text-xs text-gray-400 mb-1">Step 1</p>
                                        <h4 className="font-semibold text-white mb-1">Connect the original wallet</h4>
                                        <p className="text-gray-400">Only the owner of legacy tokens can authorize the deposit.</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                                        <p className="text-xs text-gray-400 mb-1">Step 2</p>
                                        <h4 className="font-semibold text-white mb-1">Set beneficiary + amount</h4>
                                        <p className="text-gray-400">Send to yourself or delegate governance power to another address.</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                                        <p className="text-xs text-gray-400 mb-1">Step 3</p>
                                        <h4 className="font-semibold text-white mb-1">Confirm onchain & monitor TX</h4>
                                        <p className="text-gray-400">Deposits finalize immediately. Voting weight updates after confirmation.</p>
                                    </div>
                                    <div className="rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-4">
                                        <p className="text-xs text-indigo-200 mb-1">Vault status</p>
                                        <h4 className="text-lg font-semibold text-white">Ready for deposits</h4>
                                        <p className="text-indigo-100/80">Last sync {formatTimeFromTimestamp(Math.floor(Date.now() / 1000))}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}