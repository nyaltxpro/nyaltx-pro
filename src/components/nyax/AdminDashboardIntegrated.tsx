import { useMultisig, useTreasury } from '@/hooks/useDAOService';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Coins,
    Plus,
    Send,
    Shield,
    Wallet,
    X
} from 'lucide-react';
import type { ReactNode } from 'react';
import React, { useState } from 'react';

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

// Keep existing types and helper functions
type TabKey = 'overview' | 'transfers' | 'vesting' | 'activity';
type WalletColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';

interface Wallet {
    id: string;
    name: string;
    balance: number;
    percentage: number;
    type: 'master' | 'operational' | 'vesting' | 'reserve';
    icon: React.ComponentType<any>;
    color: WalletColor;
    multisig?: string;
    status: 'active' | 'inactive' | 'pending';
    allocated?: number;
    vested?: number;
    vestingEnd?: string;
}

const COLOR_CLASS_MAP = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
} as const;

const BORDER_CLASS_MAP = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    orange: 'border-orange-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500'
} as const;

const AdminDashboardIntegrated: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isVestingModalOpen, setIsVestingModalOpen] = useState(false);

    // Use real contract data
    const { stats: treasuryStats, categories, isLoading: treasuryLoading, transferTo, mintTo } = useTreasury();
    const { transactions, multisigInfo, isOwner, isLoading: multisigLoading } = useMultisig();

    // Helper functions
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const getColorClass = (color?: WalletColor) => {
        if (!color) return 'bg-gray-500';
        return COLOR_CLASS_MAP[color] || 'bg-gray-500';
    };

    const getBorderColor = (color?: WalletColor) => {
        if (!color) return 'border-gray-500';
        return BORDER_CLASS_MAP[color] || 'border-gray-500';
    };

    // Mock data for wallets (in production, this would come from contract data)
    const wallets: Wallet[] = [
        {
            id: 'treasury',
            name: 'Treasury Master',
            balance: treasuryStats ? parseFloat(treasuryStats.totalBalance) : 850000000,
            percentage: 85,
            type: 'master',
            icon: Shield,
            color: 'blue',
            multisig: multisigInfo ? `${multisigInfo.threshold}/${multisigInfo.owners.length}` : '5/7',
            status: 'active'
        },
        // Add more wallets based on categories
        ...categories.map((category, index) => ({
            id: category.name.toLowerCase(),
            name: category.name,
            balance: parseFloat(category.distributed) || 0,
            percentage: category.allocation / 100,
            type: 'operational' as const,
            icon: Wallet,
            color: (['green', 'purple', 'orange', 'red', 'yellow'] as WalletColor[])[index % 5],
            status: 'active' as const
        }))
    ];

    // Mock data for pending transactions (would come from multisig)
    const pendingTransactions = transactions.filter(tx => !tx.executed).slice(0, 5).map(tx => ({
        id: tx.id.toString(),
        type: 'transfer',
        from: 'Treasury Master',
        to: tx.to,
        amount: parseFloat(tx.value),
        token: 'NYAX',
        status: tx.confirmations >= (multisigInfo?.threshold || 1) ? 'ready' : 'pending',
        confirmations: tx.confirmations,
        required: multisigInfo?.threshold || 1,
        timestamp: new Date().toISOString()
    }));

    // Mock recent activity (would come from contract events)
    const recentActivity = [
        {
            id: '1',
            type: 'mint',
            description: `Minted ${formatNumber(50000000)} NYAX to Treasury`,
            timestamp: '2024-01-15T10:30:00Z',
            status: 'completed',
            txHash: '0x1234...5678'
        },
        {
            id: '2',
            type: 'transfer',
            description: `Transferred ${formatNumber(10000000)} NYAX to Marketing Wallet`,
            timestamp: '2024-01-15T09:15:00Z',
            status: 'completed',
            txHash: '0x2345...6789'
        },
        {
            id: '3',
            type: 'vesting',
            description: 'Created vesting schedule for Team allocation',
            timestamp: '2024-01-15T08:45:00Z',
            status: 'completed',
            txHash: '0x3456...7890'
        }
    ];

    const renderOverviewTab = () => (
        <div className="space-y-6">
            {/* Real Treasury Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total Balance</p>
                                <p className="text-2xl font-bold text-white">
                                    {treasuryLoading ? 'Loading...' : `${formatNumber(parseFloat(treasuryStats?.totalBalance || '0'))} NYAX`}
                                </p>
                            </div>
                            <Coins className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Categories</p>
                                <p className="text-2xl font-bold text-white">
                                    {treasuryLoading ? 'Loading...' : treasuryStats?.categoriesCount || 0}
                                </p>
                            </div>
                            <Wallet className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Multisig Threshold</p>
                                <p className="text-2xl font-bold text-white">
                                    {multisigLoading ? 'Loading...' : `${multisigInfo?.threshold || 0}/${multisigInfo?.owners.length || 0}`}
                                </p>
                            </div>
                            <Shield className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Pending Transactions</p>
                                <p className="text-2xl font-bold text-white">{pendingTransactions.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Wallet Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-white">Wallet Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {wallets.map((wallet) => (
                            <div key={wallet.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${getColorClass(wallet.color)}`}>
                                        <wallet.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">{wallet.name}</h3>
                                        <p className="text-sm text-gray-400">{wallet.type} • {wallet.status}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-white">{formatNumber(wallet.balance)} NYAX</p>
                                    <p className="text-sm text-gray-400">{wallet.percentage}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
                <Button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!isOwner}
                >
                    <Send className="h-4 w-4 mr-2" />
                    Initiate Transfer
                </Button>
                <Button
                    onClick={() => setIsVestingModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!isOwner}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Vesting Schedule
                </Button>
            </div>

            {!isOwner && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                        <p className="text-yellow-200">You are not a multisig owner. Some actions are restricted.</p>
                    </div>
                </div>
            )}
        </div>
    );

    const renderTransfersTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-white">Pending Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pendingTransactions.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No pending transactions</p>
                        ) : (
                            pendingTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 rounded-lg bg-blue-600">
                                            <Send className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">Transfer to {tx.to}</h3>
                                            <p className="text-sm text-gray-400">{formatNumber(tx.amount)} {tx.token}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={tx.status === 'ready' ? 'default' : 'secondary'}>
                                            {tx.confirmations}/{tx.required} confirmations
                                        </Badge>
                                        <p className="text-sm text-gray-400 mt-1">{tx.status}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderActivityTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 rounded-lg bg-green-600">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">{activity.description}</h3>
                                        <p className="text-sm text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="default">{activity.status}</Badge>
                                    <p className="text-sm text-gray-400 mt-1">{activity.txHash}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Transfer Modal (simplified)
    const TransferModal = () => (
        isTransferModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Initiate Transfer</h2>
                        <Button variant="ghost" size="sm" onClick={() => setIsTransferModalOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-gray-400 mb-4">
                        Transfer functionality would integrate with the treasury service here.
                    </p>
                    <div className="flex space-x-2">
                        <Button onClick={() => setIsTransferModalOpen(false)} variant="outline" className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={() => setIsTransferModalOpen(false)} className="flex-1">
                            Submit to Multisig
                        </Button>
                    </div>
                </div>
            </div>
        )
    );

    // Vesting Modal (simplified)
    const VestingModal = () => (
        isVestingModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Create Vesting Schedule</h2>
                        <Button variant="ghost" size="sm" onClick={() => setIsVestingModalOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-gray-400 mb-4">
                        Vesting functionality would integrate with the vesting service here.
                    </p>
                    <div className="flex space-x-2">
                        <Button onClick={() => setIsVestingModalOpen(false)} variant="outline" className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={() => setIsVestingModalOpen(false)} className="flex-1">
                            Create Schedule
                        </Button>
                    </div>
                </div>
            </div>
        )
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">NYAX Treasury Dashboard</h1>
                    <p className="text-gray-400">Integrated with Smart Contracts</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-lg">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'transfers', label: 'Transfers' },
                        { key: 'vesting', label: 'Vesting' },
                        { key: 'activity', label: 'Activity' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as TabKey)}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === tab.key
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'transfers' && renderTransfersTab()}
                {activeTab === 'vesting' && <div className="text-center py-8 text-gray-400">Vesting management coming soon</div>}
                {activeTab === 'activity' && renderActivityTab()}

                {/* Modals */}
                <TransferModal />
                <VestingModal />
            </div>
        </div>
    );
};

export default AdminDashboardIntegrated;
