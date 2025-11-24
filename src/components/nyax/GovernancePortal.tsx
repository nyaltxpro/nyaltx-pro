'use client';

import { useNYAXToken } from '@/hooks/useNYAXContracts';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Plus,
    Users,
    Vote,
    XCircle
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

interface Proposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    status: 'active' | 'succeeded' | 'defeated' | 'queued' | 'executed';
    forVotes: string;
    againstVotes: string;
    abstainVotes: string;
    startTime: Date;
    endTime: Date;
    executionTime?: Date;
    quorum: string;
    category: 'treasury' | 'protocol' | 'ecosystem';
    isEmergency?: boolean;
}

const STATUS_COLOR_MAP: Record<Proposal['status'], string> = {
    active: 'bg-blue-600',
    succeeded: 'bg-green-600',
    defeated: 'bg-red-600',
    queued: 'bg-yellow-600',
    executed: 'bg-purple-600'
};

const STATUS_ICON_MAP: Record<Proposal['status'], ReactNode> = {
    active: <Vote className="w-4 h-4" />,
    succeeded: <CheckCircle className="w-4 h-4" />,
    defeated: <XCircle className="w-4 h-4" />,
    queued: <Clock className="w-4 h-4" />,
    executed: <CheckCircle className="w-4 h-4" />
};

const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Treasury', value: 'treasury' },
    { label: 'Protocol', value: 'protocol' },
    { label: 'Ecosystem', value: 'ecosystem' },
    { label: 'Emergency', value: 'emergency' }
] as const;

export function GovernancePortal() {
    const { address, isConnected } = useAccount();
    const { votingPower } = useNYAXToken();

    const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');
    const [proposalFilter, setProposalFilter] = useState<typeof FILTERS[number]['value']>('all');

    const proposals: Proposal[] = [
        {
            id: '1',
            title: 'Increase Treasury Allocation for Development',
            description: 'Increase the development category allocation from 25% to 30% to accelerate platform growth.',
            proposer: '0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
            status: 'active',
            forVotes: '2500000',
            againstVotes: '500000',
            abstainVotes: '100000',
            startTime: new Date(Date.now() - 86400000),
            endTime: new Date(Date.now() + 518400000),
            quorum: '1000000',
            category: 'treasury'
        },
        {
            id: '2',
            title: 'Emergency Protocol Upgrade',
            description: 'Critical security upgrade to fix a potential vulnerability in the treasury contract.',
            proposer: '0x123d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
            status: 'succeeded',
            forVotes: '5000000',
            againstVotes: '200000',
            abstainVotes: '50000',
            startTime: new Date(Date.now() - 604800000),
            endTime: new Date(Date.now() - 86400000),
            executionTime: new Date(Date.now() + 172800000),
            quorum: '1000000',
            category: 'protocol',
            isEmergency: true
        },
        {
            id: '3',
            title: 'Community Accelerator Grants',
            description: 'Allocate 2% of the ecosystem fund to sponsor NYAX community hackathons and accelerators.',
            proposer: '0x98ab35aa6634C0532925a3b8D4C2C4e4C4C4BEEF',
            status: 'active',
            forVotes: '1200000',
            againstVotes: '150000',
            abstainVotes: '20000',
            startTime: new Date(Date.now() - 43200000),
            endTime: new Date(Date.now() + 259200000),
            quorum: '800000',
            category: 'ecosystem'
        }
    ];

    const activeProposals = useMemo(() => proposals.filter((p) => p.status === 'active'), [proposals]);
    const historicalProposals = useMemo(() => proposals.filter((p) => p.status !== 'active'), [proposals]);

    const filteredProposals = useMemo(() => {
        const dataset = selectedTab === 'active' ? activeProposals : historicalProposals;
        if (proposalFilter === 'all') return dataset;
        if (proposalFilter === 'emergency') return dataset.filter((p) => p.isEmergency);
        return dataset.filter((p) => p.category === proposalFilter);
    }, [activeProposals, historicalProposals, proposalFilter, selectedTab]);

    const governanceHighlights = [
        {
            title: 'Emergency Bridge Upgrade',
            description: 'Executed 24h after quorum with 92% approval.',
            status: 'executed' as const
        },
        {
            title: 'Treasury Streaming Pilot',
            description: 'Queued for execution pending on-chain audit.',
            status: 'queued' as const
        },
        {
            title: 'Community Accelerator Grants',
            description: 'Live vote gathering ecosystem delegates.',
            status: 'active' as const
        }
    ];

    const governanceTimeline = [
        { label: 'Proposal Draft', value: 'Nov 12, 2025' },
        { label: 'Forum Review', value: 'Nov 14, 2025' },
        { label: 'On-chain Vote', value: 'Nov 18, 2025' },
        { label: 'Execution ETA', value: 'Nov 27, 2025' }
    ];

    const activityFeed = [
        { id: 1, action: 'You delegated 250,000 NYAX to 0x42...BEEF', meta: '3 hours ago' },
        { id: 2, action: 'Protocol Upgrade #12 moved to queue', meta: 'Yesterday • 6:12 PM' },
        { id: 3, action: '5 new delegates joined the council', meta: 'Nov 20, 2025' }
    ];

    const calculateVotePercentage = (votes: string, total: string) => {
        const voteNum = parseFloat(votes);
        const totalNum = parseFloat(total);
        return totalNum > 0 ? (voteNum / totalNum) * 100 : 0;
    };

    const getHighlightBadge = (status: 'active' | 'queued' | 'executed') => {
        if (status === 'active') return 'bg-blue-500/20 text-blue-200 border border-blue-500/30';
        if (status === 'queued') return 'bg-yellow-500/20 text-yellow-100 border border-yellow-500/30';
        return 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
                {/* Hero */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -right-10 h-64 w-64 bg-purple-600/30 blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 h-56 w-56 bg-cyan-500/20 blur-3xl" />
                    </div>

                    <div className="relative flex flex-col lg:flex-row gap-10 items-start justify-between">
                        <div className="space-y-5 max-w-2xl">
                            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">NYAX Governance</p>
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Shape the treasury. Guide the roadmap.</h1>
                            <p className="text-lg text-slate-300">Vote on live proposals, review progress, and monitor every on-chain decision from a unified dashboard.</p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-100">Delegated Model</span>
                                <span className="px-4 py-1 rounded-full text-xs font-semibold bg-blue-500/20 border border-blue-400/30 text-blue-100">Transparent Treasury</span>
                                <span className="px-4 py-1 rounded-full text-xs font-semibold bg-purple-500/20 border border-purple-400/30 text-purple-100">Emergency 24h Path</span>
                            </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 w-full max-w-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Your voting power</span>
                                <Vote className="w-5 h-5 text-purple-300" />
                            </div>
                            <p className="text-4xl font-extrabold mt-2">{parseFloat(votingPower || '0').toLocaleString()}</p>
                            <div className="mt-4 space-y-3 text-sm text-slate-300">
                                <div className="flex justify-between">
                                    <span>Delegated</span>
                                    <span>82%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Available</span>
                                    <span>18%</span>
                                </div>
                            </div>
                            {isConnected ? (
                                <button className="mt-6 w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Submit Proposal
                                </button>
                            ) : (
                                <button className="mt-6 w-full bg-slate-800 px-4 py-3 rounded-xl font-semibold text-slate-400" disabled>
                                    Connect wallet to participate
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Metrics & Highlights */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:col-span-2">
                        {[
                            { label: 'Active Proposals', value: activeProposals.length, icon: AlertCircle, accent: 'text-cyan-200' },
                            { label: 'Total Proposals', value: proposals.length, icon: Users, accent: 'text-emerald-200' },
                            { label: 'Avg Participation', value: '78%', icon: CheckCircle, accent: 'text-amber-200' },
                            { label: 'Emergency Ready', value: '24h SLA', icon: Clock, accent: 'text-rose-200' }
                        ].map((metric) => (
                            <div key={metric.label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">{metric.label}</p>
                                    <p className="text-3xl font-semibold mt-2">{metric.value}</p>
                                </div>
                                <metric.icon className={`w-8 h-8 ${metric.accent}`} />
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400">Governance Highlights</p>
                            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">live</span>
                        </div>
                        <div className="space-y-4">
                            {governanceHighlights.map((item) => (
                                <div key={item.title} className="p-4 rounded-xl border border-slate-800 bg-slate-950/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-semibold">{item.title}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getHighlightBadge(item.status)}`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Proposal column */}
                    <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Proposal Center</p>
                                <h2 className="text-2xl font-semibold">{selectedTab === 'active' ? 'Active Proposals' : 'Historical Proposals'}</h2>
                            </div>
                            <div className="flex gap-2">
                                {(['active', 'history'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSelectedTab(tab)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedTab === tab
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {tab === 'active' ? `Active (${activeProposals.length})` : `History (${historicalProposals.length})`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setProposalFilter(filter.value)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${proposalFilter === filter.value
                                        ? 'bg-white text-slate-900'
                                        : 'bg-slate-800/70 text-slate-300 hover:text-white'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-5">
                            {filteredProposals.map((proposal) => {
                                const totalVotes = parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes) + parseFloat(proposal.abstainVotes);
                                const forPercentage = calculateVotePercentage(proposal.forVotes, totalVotes.toString());
                                const againstPercentage = calculateVotePercentage(proposal.againstVotes, totalVotes.toString());
                                const quorumReached = totalVotes >= parseFloat(proposal.quorum);

                                return (
                                    <div key={proposal.id} className="border border-slate-800 rounded-2xl p-5 bg-slate-950/50 space-y-4">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-xl font-semibold">{proposal.title}</h3>
                                                    <span className="px-3 py-0.5 rounded-full text-xs bg-slate-800 text-slate-200">
                                                        {proposal.category.charAt(0).toUpperCase() + proposal.category.slice(1)}
                                                    </span>
                                                    {proposal.isEmergency && (
                                                        <span className="px-3 py-0.5 rounded-full text-xs bg-rose-600 text-white">Emergency</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-300">{proposal.description}</p>
                                                <p className="text-xs text-slate-500">
                                                    Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)} · Ends {proposal.endTime.toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${STATUS_COLOR_MAP[proposal.status]}`}>
                                                <span className="flex items-center gap-1">
                                                    {STATUS_ICON_MAP[proposal.status]}
                                                    <span className="capitalize">{proposal.status}</span>
                                                </span>
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs text-slate-400">
                                                    <span>For ({forPercentage.toFixed(1)}%)</span>
                                                    <span className="text-green-300">{parseFloat(proposal.forVotes).toLocaleString()} NYAX</span>
                                                </div>
                                                <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                                                    <div className="h-full bg-green-500" style={{ width: `${forPercentage}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-slate-400">
                                                    <span>Against ({againstPercentage.toFixed(1)}%)</span>
                                                    <span className="text-red-300">{parseFloat(proposal.againstVotes).toLocaleString()} NYAX</span>
                                                </div>
                                                <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                                                    <div className="h-full bg-red-500" style={{ width: `${againstPercentage}%` }} />
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>Quorum: {parseFloat(proposal.quorum).toLocaleString()} NYAX</span>
                                                <span className={`px-3 py-0.5 rounded-full ${quorumReached ? 'bg-emerald-500/20 text-emerald-100' : 'bg-slate-800 text-slate-300'}`}>
                                                    {quorumReached ? 'Quorum reached' : 'Needs votes'}
                                                </span>
                                            </div>
                                        </div>

                                        {proposal.status === 'active' && isConnected && parseFloat(votingPower) > 0 && (
                                            <div className="flex flex-wrap gap-3">
                                                <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Vote For
                                                </button>
                                                <button className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 font-semibold flex items-center gap-2">
                                                    <XCircle className="w-4 h-4" /> Vote Against
                                                </button>
                                                <button className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200">Abstain</button>
                                            </div>
                                        )}

                                        {proposal.status === 'succeeded' && proposal.executionTime && (
                                            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-sm text-amber-100">
                                                <Clock className="w-4 h-4 inline-block mr-2" />
                                                Queued for execution on {proposal.executionTime.toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {filteredProposals.length === 0 && (
                            <div className="border border-dashed border-slate-700 rounded-2xl p-10 text-center text-slate-500">
                                <Vote className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                                No proposals match this filter yet.
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Governance Timeline</p>
                                    <h3 className="text-xl font-semibold">Next Vote Journey</h3>
                                </div>
                                <Clock className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="space-y-4">
                                {governanceTimeline.map((item, index) => (
                                    <div key={item.label} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                                            {index < governanceTimeline.length - 1 && <div className="flex-1 w-px bg-slate-700" />}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400">{item.label}</p>
                                            <p className="font-semibold">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">Activity Feed</p>
                                <span className="text-xs text-slate-500">live</span>
                            </div>
                            <div className="space-y-4">
                                {activityFeed.map((event) => (
                                    <div key={event.id} className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40">
                                        <p className="text-sm text-slate-200">{event.action}</p>
                                        <p className="text-xs text-slate-500 mt-1">{event.meta}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-400/10 border border-emerald-500/30 rounded-3xl p-6 space-y-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Delegation</p>
                            <h3 className="text-2xl font-semibold">Become a council delegate</h3>
                            <p className="text-sm text-emerald-100">
                                Publish your voting thesis, receive community delegations, and earn incentives for consistent participation.
                            </p>
                            <button className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100">
                                Publish Delegate Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
