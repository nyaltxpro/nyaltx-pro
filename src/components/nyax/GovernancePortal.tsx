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
import { useState } from 'react';
import { useAccount } from 'wagmi';

// Simple UI Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Button = ({ children, className = '', variant = 'default', onClick, disabled, ...props }: {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline';
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: any;
}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
    const variantClasses = variant === 'outline'
        ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
        : 'bg-primary text-primary-foreground hover:bg-primary/90';
    return (
        <button
            className={`${baseClasses} ${variantClasses} h-10 px-4 py-2 ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
const Badge = ({ children, className = '', variant = 'default' }: {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline' | 'secondary';
}) => {
    const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    const variantClasses = variant === 'outline'
        ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
        : variant === 'secondary'
            ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
            : 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80';
    return <div className={`${baseClasses} ${variantClasses} ${className}`}>{children}</div>;
};
const Progress = ({ value, className = '', children }: { value: number; className?: string; children?: React.ReactNode }) => (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
        {children || (
            <div
                className="h-full w-full flex-1 bg-primary transition-all"
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        )}
    </div>
);

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
    isEmergency?: boolean;
}

export function GovernancePortal() {
    const { address, isConnected } = useAccount();
    const { votingPower } = useNYAXToken();

    const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');

    // Mock proposals data
    const proposals: Proposal[] = [
        {
            id: '1',
            title: 'Increase Treasury Allocation for Development',
            description: 'Proposal to increase the development category allocation from 25% to 30% to accelerate platform growth.',
            proposer: '0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
            status: 'active',
            forVotes: '2500000',
            againstVotes: '500000',
            abstainVotes: '100000',
            startTime: new Date(Date.now() - 86400000),
            endTime: new Date(Date.now() + 518400000),
            quorum: '1000000'
        },
        {
            id: '2',
            title: 'Emergency Protocol Upgrade',
            description: 'Critical security upgrade to fix potential vulnerability in the treasury contract.',
            proposer: '0x123d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
            status: 'succeeded',
            forVotes: '5000000',
            againstVotes: '200000',
            abstainVotes: '50000',
            startTime: new Date(Date.now() - 604800000),
            endTime: new Date(Date.now() - 86400000),
            executionTime: new Date(Date.now() + 172800000),
            quorum: '1000000',
            isEmergency: true
        }
    ];

    const activeProposals = proposals.filter(p => p.status === 'active');
    const historicalProposals = proposals.filter(p => p.status !== 'active');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-600';
            case 'succeeded': return 'bg-green-600';
            case 'defeated': return 'bg-red-600';
            case 'queued': return 'bg-yellow-600';
            case 'executed': return 'bg-purple-600';
            default: return 'bg-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Vote className="w-4 h-4" />;
            case 'succeeded': return <CheckCircle className="w-4 h-4" />;
            case 'defeated': return <XCircle className="w-4 h-4" />;
            case 'queued': return <Clock className="w-4 h-4" />;
            case 'executed': return <CheckCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const calculateVotePercentage = (votes: string, total: string) => {
        const voteNum = parseFloat(votes);
        const totalNum = parseFloat(total);
        return totalNum > 0 ? (voteNum / totalNum) * 100 : 0;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white">NYAX Governance</h1>
                    <p className="text-xl text-gray-300">Shape the future of the NYAX Platform</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Your Voting Power</p>
                                    <p className="text-2xl font-bold text-white">{votingPower}</p>
                                </div>
                                <Vote className="w-8 h-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Active Proposals</p>
                                    <p className="text-2xl font-bold text-white">{activeProposals.length}</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Total Proposals</p>
                                    <p className="text-2xl font-bold text-white">{proposals.length}</p>
                                </div>
                                <Users className="w-8 h-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Participation Rate</p>
                                    <p className="text-2xl font-bold text-white">78%</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Create Proposal Button */}
                {isConnected && parseFloat(votingPower) > 0 && (
                    <div className="flex justify-center">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Proposal
                        </Button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-700">
                    <button
                        onClick={() => setSelectedTab('active')}
                        className={`pb-4 px-2 font-medium ${selectedTab === 'active'
                            ? 'text-white border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Active Proposals ({activeProposals.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('history')}
                        className={`pb-4 px-2 font-medium ${selectedTab === 'history'
                            ? 'text-white border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        History ({historicalProposals.length})
                    </button>
                </div>

                {/* Proposals List */}
                <div className="space-y-6">
                    {(selectedTab === 'active' ? activeProposals : historicalProposals).map((proposal) => {
                        const totalVotes = parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes) + parseFloat(proposal.abstainVotes);
                        const forPercentage = calculateVotePercentage(proposal.forVotes, totalVotes.toString());
                        const againstPercentage = calculateVotePercentage(proposal.againstVotes, totalVotes.toString());
                        const quorumReached = totalVotes >= parseFloat(proposal.quorum);

                        return (
                            <Card key={proposal.id} className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-3">
                                                <CardTitle className="text-white">{proposal.title}</CardTitle>
                                                {proposal.isEmergency && (
                                                    <Badge className="bg-red-600">Emergency</Badge>
                                                )}
                                            </div>
                                            <p className="text-gray-300">{proposal.description}</p>
                                            <p className="text-sm text-gray-400">
                                                Proposed by: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                                            </p>
                                        </div>
                                        <Badge className={`${getStatusColor(proposal.status)} text-white`}>
                                            <span className="flex items-center space-x-1">
                                                {getStatusIcon(proposal.status)}
                                                <span className="capitalize">{proposal.status}</span>
                                            </span>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Voting Results */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">For ({forPercentage.toFixed(1)}%)</span>
                                            <span className="text-green-400">{parseFloat(proposal.forVotes).toLocaleString()} NYAX</span>
                                        </div>
                                        <Progress value={forPercentage} className="h-2 bg-gray-700">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${forPercentage}%` }} />
                                        </Progress>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Against ({againstPercentage.toFixed(1)}%)</span>
                                            <span className="text-red-400">{parseFloat(proposal.againstVotes).toLocaleString()} NYAX</span>
                                        </div>
                                        <Progress value={againstPercentage} className="h-2 bg-gray-700">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${againstPercentage}%` }} />
                                        </Progress>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">
                                                Quorum: {parseFloat(proposal.quorum).toLocaleString()} NYAX
                                            </span>
                                            <Badge variant={quorumReached ? 'default' : 'secondary'} className={quorumReached ? 'bg-green-600' : ''}>
                                                {quorumReached ? 'Reached' : 'Not Reached'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Voting Started:</span>
                                            <p className="text-white">{proposal.startTime.toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Voting Ends:</span>
                                            <p className="text-white">{proposal.endTime.toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {proposal.status === 'active' && isConnected && parseFloat(votingPower) > 0 && (
                                        <div className="flex space-x-4">
                                            <Button className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Vote For
                                            </Button>
                                            <Button className="bg-red-600 hover:bg-red-700">
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Vote Against
                                            </Button>
                                            <Button variant="outline" className="border-gray-600 text-gray-300">
                                                Abstain
                                            </Button>
                                        </div>
                                    )}

                                    {proposal.status === 'succeeded' && proposal.executionTime && (
                                        <div className="p-4 bg-yellow-600/20 border border-yellow-600 rounded-lg">
                                            <p className="text-yellow-400 text-sm">
                                                <Clock className="w-4 h-4 inline mr-2" />
                                                Queued for execution on {proposal.executionTime.toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {(selectedTab === 'active' ? activeProposals : historicalProposals).length === 0 && (
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-12 text-center">
                            <Vote className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No {selectedTab} proposals
                            </h3>
                            <p className="text-gray-400">
                                {selectedTab === 'active'
                                    ? 'There are currently no active proposals to vote on.'
                                    : 'No historical proposals found.'
                                }
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
