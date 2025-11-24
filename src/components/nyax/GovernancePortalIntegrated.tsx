import { useGovernance } from '@/hooks/useDAOService';
import type { ProposalData } from '@/services/contracts/types';
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
import React, { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

// Type alias for easier use
type Proposal = ProposalData;

// Simple UI Components (replacing missing UI library components)
const Badge = ({ children, className, variant }: { children: ReactNode; className?: string; variant?: string }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {children}
    </span>
);

const Button = ({ children, onClick, className, size, variant, disabled }: {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    size?: string;
    variant?: string;
    disabled?: boolean;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} ${className}`}
    >
        {children}
    </button>
);

const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={`rounded-lg border ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: ReactNode }) => (
    <div className="p-6 pb-4">{children}</div>
);

const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
    <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardContent = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>
);

const Progress = ({ value, className, children }: { value: number; className?: string; children?: ReactNode }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${value}%` }}>
            {children}
        </div>
    </div>
);

const STATUS_COLOR_MAP: Record<ProposalData['status'], string> = {
    active: 'bg-blue-600',
    succeeded: 'bg-green-600',
    defeated: 'bg-red-600',
    queued: 'bg-yellow-600',
    executed: 'bg-purple-600',
    canceled: 'bg-gray-600'
};

const STATUS_ICON_MAP: Record<ProposalData['status'], ReactNode> = {
    active: <Vote className="w-4 h-4" />,
    succeeded: <CheckCircle className="w-4 h-4" />,
    defeated: <XCircle className="w-4 h-4" />,
    queued: <Clock className="w-4 h-4" />,
    executed: <CheckCircle className="w-4 h-4" />,
    canceled: <XCircle className="w-4 h-4" />
};

const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Treasury', value: 'treasury' },
    { label: 'Governance', value: 'governance' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'Vesting', value: 'vesting' }
];

const GovernancePortalIntegrated: React.FC = () => {
    const { address, isConnected } = useAccount();
    const {
        proposals,
        stats,
        votingPower,
        isLoading,
        createProposal,
        castVote,
        delegate
    } = useGovernance();

    const [selectedTab, setSelectedTab] = useState<'active' | 'historical'>('active');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filter proposals based on selected criteria
    const filteredProposals = useMemo(() => {
        let filtered = proposals;

        // Filter by tab
        if (selectedTab === 'active') {
            filtered = filtered.filter(p => p.status === 'active' || p.status === 'queued');
        } else {
            filtered = filtered.filter(p => p.status === 'succeeded' || p.status === 'defeated' || p.status === 'executed');
        }

        // Filter by category
        if (selectedFilter !== 'all') {
            if (selectedFilter === 'emergency') {
                filtered = filtered.filter(p => p.isEmergency);
            } else {
                filtered = filtered.filter(p => p.category === selectedFilter);
            }
        }

        return filtered;
    }, [proposals, selectedTab, selectedFilter]);

    const calculateVotePercentage = (forVotes: string, againstVotes: string, abstainVotes: string) => {
        const total = parseFloat(forVotes) + parseFloat(againstVotes) + parseFloat(abstainVotes);
        if (total === 0) return { for: 0, against: 0, abstain: 0 };

        return {
            for: (parseFloat(forVotes) / total) * 100,
            against: (parseFloat(againstVotes) / total) * 100,
            abstain: (parseFloat(abstainVotes) / total) * 100
        };
    };

    const handleVote = async (proposalId: string, support: 0 | 1 | 2) => {
        try {
            await castVote(proposalId, support);
        } catch (error) {
            console.error('Error casting vote:', error);
        }
    };

    const renderVotingPowerWidget = () => (
        <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white flex items-center">
                    <Vote className="w-5 h-5 mr-2" />
                    Your Voting Power
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isConnected ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400">Current Votes</p>
                            <p className="text-2xl font-bold text-white">
                                {isLoading ? 'Loading...' : `${parseFloat(votingPower?.votes || '0').toLocaleString()} NYAX`}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Delegated To</p>
                            <p className="text-sm text-white font-mono">
                                {votingPower?.delegatedTo === address ? 'Self' : votingPower?.delegatedTo || 'None'}
                            </p>
                        </div>
                        {votingPower?.delegatedTo !== address && (
                            <Button
                                onClick={() => delegate(address!)}
                                size="sm"
                                className="w-full"
                            >
                                Delegate to Self
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-400 mb-4">Connect your wallet to see voting power</p>
                        <Button size="sm">Connect Wallet</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderGovernanceStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-slate-900/70 border-slate-800">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Proposals</p>
                            <p className="text-2xl font-bold text-white">
                                {isLoading ? 'Loading...' : stats?.totalProposals || 0}
                            </p>
                        </div>
                        <Vote className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900/70 border-slate-800">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Active Proposals</p>
                            <p className="text-2xl font-bold text-white">
                                {isLoading ? 'Loading...' : stats?.activeProposals || 0}
                            </p>
                        </div>
                        <Clock className="h-8 w-8 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900/70 border-slate-800">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Quorum Required</p>
                            <p className="text-2xl font-bold text-white">
                                {isLoading ? 'Loading...' : `${parseFloat(stats?.quorumVotes || '0').toLocaleString()}`}
                            </p>
                        </div>
                        <Users className="h-8 w-8 text-purple-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderProposalCard = (proposal: Proposal) => {
        const votePercentages = calculateVotePercentage(proposal.forVotes, proposal.againstVotes, proposal.abstainVotes);
        const totalVotes = parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes) + parseFloat(proposal.abstainVotes);

        return (
            <Card key={proposal.id} className="bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge
                                    className={`${STATUS_COLOR_MAP[proposal.status]} text-white`}
                                >
                                    {STATUS_ICON_MAP[proposal.status]}
                                    <span className="ml-1 capitalize">{proposal.status}</span>
                                </Badge>
                                {proposal.isEmergency && (
                                    <Badge variant="destructive">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Emergency
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-gray-400">
                                    {proposal.category}
                                </Badge>
                            </div>
                            <CardTitle className="text-white text-lg">{proposal.title}</CardTitle>
                            <p className="text-gray-400 text-sm mt-2 line-clamp-2">{proposal.description}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Vote Results */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">For ({votePercentages.for.toFixed(1)}%)</span>
                                <span className="text-white">{parseFloat(proposal.forVotes).toLocaleString()} NYAX</span>
                            </div>
                            <Progress value={votePercentages.for} className="h-2 bg-slate-700">
                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${votePercentages.for}%` }} />
                            </Progress>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Against ({votePercentages.against.toFixed(1)}%)</span>
                                <span className="text-white">{parseFloat(proposal.againstVotes).toLocaleString()} NYAX</span>
                            </div>
                            <Progress value={votePercentages.against} className="h-2 bg-slate-700">
                                <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${votePercentages.against}%` }} />
                            </Progress>

                            {parseFloat(proposal.abstainVotes) > 0 && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Abstain ({votePercentages.abstain.toFixed(1)}%)</span>
                                        <span className="text-white">{parseFloat(proposal.abstainVotes).toLocaleString()} NYAX</span>
                                    </div>
                                    <Progress value={votePercentages.abstain} className="h-2 bg-slate-700">
                                        <div className="h-full bg-gray-500 rounded-full transition-all" style={{ width: `${votePercentages.abstain}%` }} />
                                    </Progress>
                                </>
                            )}
                        </div>

                        {/* Voting Buttons */}
                        {proposal.status === 'active' && isConnected && (
                            <div className="flex space-x-2 pt-2">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleVote(proposal.id, 1)}
                                >
                                    Vote For
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => handleVote(proposal.id, 0)}
                                >
                                    Vote Against
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleVote(proposal.id, 2)}
                                >
                                    Abstain
                                </Button>
                            </div>
                        )}

                        {/* Proposal Info */}
                        <div className="text-xs text-gray-500 pt-2 border-t border-slate-700">
                            <p>Proposed by: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</p>
                            <p>Total Votes: {totalVotes.toLocaleString()} NYAX</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen text-white">
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
                {/* Hero Section */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 md:p-10 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    NYAX Governance
                                </h1>
                                <p className="text-xl text-gray-300 mb-6">
                                    Shape the future of NYAX through decentralized governance. Vote on proposals, delegate your power, and participate in key decisions.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        disabled={!isConnected}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Proposal
                                    </Button>
                                </div>
                            </div>
                            <div>
                                {renderVotingPowerWidget()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Governance Stats */}
                {renderGovernanceStats()}

                {/* Filters and Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
                        <button
                            onClick={() => setSelectedTab('active')}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${selectedTab === 'active'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            Active Proposals
                        </button>
                        <button
                            onClick={() => setSelectedTab('historical')}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${selectedTab === 'historical'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            Historical
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setSelectedFilter(filter.value)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedFilter === filter.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Proposals List */}
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading proposals...</p>
                        </div>
                    ) : filteredProposals.length === 0 ? (
                        <div className="text-center py-12">
                            <Vote className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No proposals found for the selected criteria.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredProposals.map(renderProposalCard)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GovernancePortalIntegrated;
