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
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/reui/button';
import { Card, CardContent, CardHeader } from '@/components/reui/card';
import { Progress } from '@/components/reui/progress';

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
            <div className="min-h-screen  flex items-center justify-center">
                <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
                    <CardHeader className="text-center">
                        <h3 className="text-2xl font-semibold text-white">Connect Your Wallet</h3>
                        <p className="text-sm text-slate-300">
                            Connect your wallet to access the NYAX Platform
                        </p>
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
        <div className="min-h-screen p-6">
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
                <div className="space-y-6">
                    <div className="grid w-full grid-cols-4 rounded-lg border border-white/10 bg-white/5 p-1">
                        <Button
                            size="sm"
                            variant={selectedTab === 'overview' ? 'secondary' : 'ghost'}
                            onClick={() => setSelectedTab('overview')}
                        >
                            Overview
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedTab === 'vesting' ? 'secondary' : 'ghost'}
                            onClick={() => setSelectedTab('vesting')}
                        >
                            Vesting
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedTab === 'governance' ? 'secondary' : 'ghost'}
                            onClick={() => setSelectedTab('governance')}
                        >
                            Governance
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedTab === 'transactions' ? 'secondary' : 'ghost'}
                            onClick={() => setSelectedTab('transactions')}
                        >
                            Transactions
                        </Button>
                    </div>

                    {/* Overview Tab */}
                    {selectedTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Token Actions */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                                        <p className="text-sm text-slate-300">
                                            Manage your NYAX tokens
                                        </p>
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
                                        <h3 className="text-lg font-semibold text-white">Portfolio Summary</h3>
                                        <p className="text-sm text-slate-300">
                                            Your NYAX token distribution
                                        </p>
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
                        </div>
                    )}

                    {/* Vesting Tab */}
                    {selectedTab === 'vesting' && (
                        <div className="space-y-6">
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <h3 className="text-lg font-semibold text-white">Vesting Schedules</h3>
                                    <p className="text-sm text-slate-300">
                                        Track your token vesting progress
                                    </p>
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
                        </div>
                    )}

                    {/* Governance Tab */}
                    {selectedTab === 'governance' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <h3 className="text-lg font-semibold text-white">Voting Power</h3>
                                        <p className="text-sm text-slate-300">
                                            Your governance participation
                                        </p>
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
                                        <h3 className="text-lg font-semibold text-white">Active Proposals</h3>
                                        <p className="text-sm text-slate-300">
                                            Participate in governance
                                        </p>
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
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {selectedTab === 'transactions' && (
                        <div className="space-y-6">
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <h3 className="text-lg font-semibold text-white">Transaction History</h3>
                                    <p className="text-sm text-slate-300">
                                        Your recent NYAX transactions
                                    </p>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
