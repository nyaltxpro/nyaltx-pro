import { Award, Clock, Edit, Filter, Lock, Megaphone, Plus, Search, Shield, Trash2, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

type TokenFolder = {
    id: number;
    name: string;
    icon: typeof TrendingUp;
    color: string;
    totalTokens: string;
    holders: number;
    locked: boolean;
    vestingSchedule: string;
    permissions: string[];
};

export default function GovernancePanel() {
    const [activeTab, setActiveTab] = useState('token-management');
    const [selectedFolder, setSelectedFolder] = useState<TokenFolder | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const tokenFolders: TokenFolder[] = [
        {
            id: 1,
            name: 'Investors',
            icon: TrendingUp,
            color: 'bg-blue-500',
            totalTokens: '45,000,000',
            holders: 234,
            locked: true,
            vestingSchedule: 'Linear 24 months',
            permissions: ['View Proposals', 'Vote on Proposals']
        },
        {
            id: 2,
            name: 'Founders',
            icon: Award,
            color: 'bg-purple-500',
            totalTokens: '20,000,000',
            holders: 5,
            locked: true,
            vestingSchedule: 'Cliff 12mo, Linear 36mo',
            permissions: ['Full Governance Rights', 'Create Proposals', 'Vote']
        },
        {
            id: 3,
            name: 'Marketing',
            icon: Megaphone,
            color: 'bg-pink-500',
            totalTokens: '15,000,000',
            holders: 12,
            locked: false,
            vestingSchedule: 'Unlocked',
            permissions: ['Limited Voting', 'View Only']
        },
        {
            id: 4,
            name: 'Legacy Voting',
            icon: Shield,
            color: 'bg-yellow-500',
            totalTokens: '8,500,000',
            holders: 89,
            locked: false,
            vestingSchedule: 'Fully Vested',
            permissions: ['Vote on Proposals', 'Delegate Votes']
        },
        {
            id: 5,
            name: 'Team',
            icon: Users,
            color: 'bg-green-500',
            totalTokens: '30,000,000',
            holders: 47,
            locked: true,
            vestingSchedule: 'Cliff 6mo, Linear 24mo',
            permissions: ['Vote on Proposals', 'View Proposals']
        },
        {
            id: 6,
            name: 'Treasury Reserve',
            icon: Lock,
            color: 'bg-red-500',
            totalTokens: '75,000,000',
            holders: 1,
            locked: true,
            vestingSchedule: 'Governance Controlled',
            permissions: ['Requires Multi-sig']
        }
    ];

    const adminFunctions = [
        { icon: Plus, label: 'Create Folder', action: 'create' },
        { icon: Edit, label: 'Edit Allocations', action: 'edit' },
        { icon: Lock, label: 'Lock/Unlock Tokens', action: 'lock' },
        { icon: Users, label: 'Manage Holders', action: 'holders' },
        { icon: Shield, label: 'Set Permissions', action: 'permissions' },
        { icon: Clock, label: 'Vesting Schedule', action: 'vesting' }
    ];

    const recentActivity = [
        { action: 'Moved 500,000 tokens', from: 'Marketing', to: 'Investors', time: '2 hours ago' },
        { action: 'Locked folder', folder: 'Team', time: '5 hours ago' },
        { action: 'Added 3 new holders', folder: 'Legacy Voting', time: '1 day ago' },
        { action: 'Updated vesting schedule', folder: 'Founders', time: '2 days ago' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Token Management</h1>
                        <p className="text-gray-400">Organize and control token allocations across groups</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Folder
                    </button>
                </div>

                {/* Admin Functions Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        Admin Functions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {adminFunctions.map((func, idx) => (
                            <button
                                key={idx}
                                className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-purple-500/50 transition-all group"
                            >
                                <func.icon className="w-6 h-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                <span className="text-xs text-gray-300 text-center">{func.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search folders or holders..."
                            className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <button className="px-6 py-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filter
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Token Folders */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-2xl font-bold text-white mb-4">Token Folders</h2>
                        {tokenFolders.map((folder) => (
                            <div
                                key={folder.id}
                                onClick={() => setSelectedFolder(folder)}
                                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border transition-all cursor-pointer ${selectedFolder?.id === folder.id
                                    ? 'border-purple-500 bg-white/20'
                                    : 'border-white/20 hover:border-white/40'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`${folder.color} p-3 rounded-lg`}>
                                            <folder.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                {folder.name}
                                                {folder.locked && <Lock className="w-4 h-4 text-yellow-400" />}
                                            </h3>
                                            <p className="text-gray-400 text-sm">{folder.holders} token holders</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                                            <Edit className="w-4 h-4 text-gray-400" />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Total Tokens</p>
                                        <p className="text-white font-bold text-lg">{folder.totalTokens}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Vesting</p>
                                        <p className="text-white font-semibold text-sm">{folder.vestingSchedule}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Permissions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {folder.permissions.map((perm, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold"
                                            >
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar - Recent Activity */}
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {recentActivity.map((activity, idx) => (
                                    <div key={idx} className="pb-4 border-b border-white/10 last:border-0 last:pb-0">
                                        <p className="text-white font-semibold text-sm mb-1">{activity.action}</p>
                                        {activity.from && activity.to && (
                                            <p className="text-gray-400 text-xs mb-1">
                                                {activity.from} → {activity.to}
                                            </p>
                                        )}
                                        {activity.folder && (
                                            <p className="text-gray-400 text-xs mb-1">{activity.folder}</p>
                                        )}
                                        <p className="text-gray-500 text-xs">{activity.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Total Allocated</span>
                                    <span className="text-white font-bold">193.5M</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Locked Tokens</span>
                                    <span className="text-yellow-400 font-bold">170.5M</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Unlocked Tokens</span>
                                    <span className="text-green-400 font-bold">23M</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Total Folders</span>
                                    <span className="text-white font-bold">6</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Folder Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full mx-4">
                            <h3 className="text-2xl font-bold text-white mb-6">Create New Folder</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Folder Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Community"
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Token Allocation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 10,000,000"
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}