'use client';

import { useNYAXToken, useTreasury } from '@/hooks/useNYAXContracts';
import {
    Award,
    Clock,
    History,
    Send,
    Shield,
    TrendingUp,
    Vote,
    Wallet
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

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
const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
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
const Progress = ({ value, className = '' }: { value: number; className?: string }) => (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
        <div
            className="h-full w-full flex-1 bg-primary transition-all"
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
);
const Tabs = ({ value, onValueChange, children, className = '' }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={className}>{children}</div>
);
const TabsList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>
);
const TabsTrigger = ({ value, children, className = '', onClick }: {
    value: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) => (
    <button
        onClick={onClick}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);
const TabsContent = ({ value, children, className = '' }: {
    value: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
        {children}
    </div>
);

interface Transaction {
    id: string;
    type: 'transfer' | 'delegate' | 'mint' | 'burn';
    amount: string;
    from?: string;
    to?: string;
    timestamp: Date;
    status: 'pending' | 'confirmed' | 'failed';
}

interface VestingSchedule {
    id: string;
    totalAmount: string;
    vestedAmount: string;
    releasableAmount: string;
    startDate: Date;
    cliffDate: Date;
    endDate: Date;
    category: string;
    status: 'active' | 'completed' | 'revoked';
}

export function UserDashboard() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    const { balance, votingPower, delegateVotes, transferTokens } = useNYAXToken();
    const { treasuryBalance, categories } = useTreasury();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>([]);
    const [selectedTab, setSelectedTab] = useState('overview');

    // Mock data for demonstration
    useEffect(() => {
        if (isConnected) {
            // Mock transaction history
            setTransactions([
                {
                    id: '1',
                    type: 'transfer',
                    amount: '1000',
                    to: '0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
                    timestamp: new Date(Date.now() - 86400000),
                    status: 'confirmed'
                },
                {
                    id: '2',
                    type: 'delegate',
                    amount: '5000',
                    to: '0x123d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
                    timestamp: new Date(Date.now() - 172800000),
                    status: 'confirmed'
                }
            ]);

            // Mock vesting schedules
            setVestingSchedules([
                {
                    id: 'vest-1',
                    totalAmount: '10000',
                    vestedAmount: '2500',
                    releasableAmount: '500',
                    startDate: new Date(Date.now() - 31536000000), // 1 year ago
                    cliffDate: new Date(Date.now() - 15768000000), // 6 months ago
                    endDate: new Date(Date.now() + 94608000000), // 3 years from now
                    category: 'team',
                    status: 'active'
                }
            ]);
        }
    }, [isConnected]);

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-white">Connect Your Wallet</CardTitle>
                        <CardDescription className="text-gray-300">
                            Connect your wallet to access the NYAX Platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {connectors.map((connector) => (
                            <Button
                                key={connector.id}
                                onClick={() => connect({ connector })}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={!connector.ready}
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect {connector.name}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">NYAX Dashboard</h1>
                        <p className="text-gray-300">Welcome back to your NYAX Platform</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-green-400 border-green-400">
                            <Shield className="w-3 h-3 mr-1" />
                            Connected
                        </Badge>
                        <Button
                            onClick={() => disconnect()}
                            variant="outline"
                            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                        >
                            Disconnect
                        </Button>
                    </div>
                </div>

                {/* Wallet Info */}
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Wallet Address</p>
                                <p className="text-white font-mono">{address}</p>
                            </div>
                            <Wallet className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">NYAX Balance</p>
                                    <p className="text-2xl font-bold text-white">{balance}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Voting Power</p>
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
                                    <p className="text-sm text-gray-400">Vesting Schedules</p>
                                    <p className="text-2xl font-bold text-white">{vestingSchedules.length}</p>
                                </div>
                                <Clock className="w-8 h-8 text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Treasury Balance</p>
                                    <p className="text-2xl font-bold text-white">{treasuryBalance}</p>
                                </div>
                                <Award className="w-8 h-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                        <TabsTrigger
                            value="overview"
                            className={`text-white ${selectedTab === 'overview' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSelectedTab('overview')}
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="vesting"
                            className={`text-white ${selectedTab === 'vesting' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSelectedTab('vesting')}
                        >
                            Vesting
                        </TabsTrigger>
                        <TabsTrigger
                            value="governance"
                            className={`text-white ${selectedTab === 'governance' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSelectedTab('governance')}
                        >
                            Governance
                        </TabsTrigger>
                        <TabsTrigger
                            value="transactions"
                            className={`text-white ${selectedTab === 'transactions' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSelectedTab('transactions')}
                        >
                            Transactions
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    {selectedTab === 'overview' && (
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Token Actions */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">Quick Actions</CardTitle>
                                        <CardDescription className="text-gray-300">
                                            Manage your NYAX tokens
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                            <Send className="w-4 h-4 mr-2" />
                                            Transfer Tokens
                                        </Button>
                                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                            <Vote className="w-4 h-4 mr-2" />
                                            Delegate Voting Power
                                        </Button>
                                        <Button className="w-full bg-green-600 hover:bg-green-700">
                                            <Clock className="w-4 h-4 mr-2" />
                                            Release Vested Tokens
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Portfolio Summary */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">Portfolio Summary</CardTitle>
                                        <CardDescription className="text-gray-300">
                                            Your NYAX token distribution
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Available Balance</span>
                                                <span className="text-white">{balance} NYAX</span>
                                            </div>
                                            <Progress value={75} className="h-2" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Vested Tokens</span>
                                                <span className="text-white">2,500 NYAX</span>
                                            </div>
                                            <Progress value={25} className="h-2" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Locked Tokens</span>
                                                <span className="text-white">7,500 NYAX</span>
                                            </div>
                                            <Progress value={75} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    )}

                    {/* Vesting Tab */}
                    {selectedTab === 'vesting' && (
                        <TabsContent value="vesting" className="space-y-6">
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Vesting Schedules</CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Track your token vesting progress
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {vestingSchedules.map((schedule) => (
                                            <div key={schedule.id} className="border border-gray-600 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white capitalize">
                                                            {schedule.category} Vesting
                                                        </h3>
                                                        <p className="text-sm text-gray-400">
                                                            {schedule.totalAmount} NYAX Total
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={schedule.status === 'active' ? 'default' : 'secondary'}
                                                        className={schedule.status === 'active' ? 'bg-green-600' : ''}
                                                    >
                                                        {schedule.status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Vested Amount</span>
                                                        <span className="text-white">{schedule.vestedAmount} NYAX</span>
                                                    </div>
                                                    <Progress
                                                        value={(parseFloat(schedule.vestedAmount) / parseFloat(schedule.totalAmount)) * 100}
                                                        className="h-2"
                                                    />
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Releasable</span>
                                                        <span className="text-green-400">{schedule.releasableAmount} NYAX</span>
                                                    </div>

                                                    {parseFloat(schedule.releasableAmount) > 0 && (
                                                        <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                                                            Release {schedule.releasableAmount} NYAX
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Governance Tab */}
                    {selectedTab === 'governance' && (
                        <TabsContent value="governance" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">Voting Power</CardTitle>
                                        <CardDescription className="text-gray-300">
                                            Your governance participation
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-purple-400">{votingPower}</p>
                                            <p className="text-sm text-gray-400">NYAX Voting Power</p>
                                        </div>
                                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                            <Vote className="w-4 h-4 mr-2" />
                                            Delegate Votes
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">Active Proposals</CardTitle>
                                        <CardDescription className="text-gray-300">
                                            Participate in governance
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <Vote className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                            <p className="text-gray-400">No active proposals</p>
                                            <p className="text-sm text-gray-500">Check back later for governance votes</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    )}

                    {/* Transactions Tab */}
                    {selectedTab === 'transactions' && (
                        <TabsContent value="transactions" className="space-y-6">
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Transaction History</CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Your recent NYAX transactions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {transactions.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <div className="p-2 bg-gray-700 rounded-full">
                                                        {tx.type === 'transfer' && <Send className="w-4 h-4 text-blue-400" />}
                                                        {tx.type === 'delegate' && <Vote className="w-4 h-4 text-purple-400" />}
                                                        {tx.type !== 'transfer' && tx.type !== 'delegate' && <History className="w-4 h-4 text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium capitalize">{tx.type}</p>
                                                        <p className="text-sm text-gray-400">
                                                            {tx.timestamp.toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white">{tx.amount} NYAX</p>
                                                    <Badge
                                                        variant={tx.status === 'confirmed' ? 'default' : 'secondary'}
                                                        className={tx.status === 'confirmed' ? 'bg-green-600' : ''}
                                                    >
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
