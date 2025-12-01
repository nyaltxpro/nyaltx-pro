'use client';

import { useFolderRegistry } from '@/hooks/useFolderRegistry';
import { FolderInfo } from '@/services/contracts/types';
import { Filter, Loader2, Lock, Plus, Search, Shield } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

const DAY_IN_SECONDS = 86_400;
const PERMISSION_FLAGS = [
    { bit: 1 << 0, label: 'View' },
    { bit: 1 << 1, label: 'Vote' },
    { bit: 1 << 2, label: 'Propose' },
    { bit: 1 << 3, label: 'Transfer' },
    { bit: 1 << 4, label: 'Admin' },
    { bit: 1 << 5, label: 'Multisig' },
];

const formatNumber = (value: string | number) => {
    const numeric = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(numeric)) return '0';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(numeric);
};

const describePermissions = (mask: number) =>
    PERMISSION_FLAGS.filter(flag => (mask & flag.bit) !== 0).map(flag => flag.label);

export default function AdminDashboardFixed() {
    const {
        folders,
        membersByFolder,
        loading,
        actionPending,
        error,
        summary,
        fetchMembers,
        createFolder,
    } = useFolderRegistry();

    const { isConnected } = useAccount();

    const [searchValue, setSearchValue] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderPermissions, setNewFolderPermissions] = useState('3');
    const [cliffDays, setCliffDays] = useState('30');
    const [durationDays, setDurationDays] = useState('365');
    const [revocable, setRevocable] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

    const filteredFolders = useMemo(() => {
        if (!searchValue.trim()) return folders;
        const query = searchValue.toLowerCase();
        return folders.filter(folder => folder.name.toLowerCase().includes(query));
    }, [folders, searchValue]);

    useEffect(() => {
        if (selectedFolderId !== null && !membersByFolder[selectedFolderId]) {
            fetchMembers(selectedFolderId);
        }
    }, [selectedFolderId, membersByFolder, fetchMembers]);

    const handleCreateFolder = async () => {
        if (!isConnected) {
            setFormError('Connect a wallet before creating folders.');
            return;
        }
        if (!newFolderName.trim()) {
            setFormError('Folder name is required');
            return;
        }
        const mask = Number(newFolderPermissions);
        if (Number.isNaN(mask)) {
            setFormError('Permissions must be numeric');
            return;
        }

        try {
            await createFolder({
                name: newFolderName.trim(),
                permissions: mask,
                template: {
                    cliff: Number(cliffDays || '0') * DAY_IN_SECONDS,
                    duration: Number(durationDays || '0') * DAY_IN_SECONDS,
                    revocable,
                },
            });
            setNewFolderName('');
            setNewFolderPermissions('3');
            setCliffDays('30');
            setDurationDays('365');
            setRevocable(true);
            setFormError(null);
            setShowAddModal(false);
        } catch (createErr) {
            setFormError(createErr instanceof Error ? createErr.message : 'Failed to create folder');
        }
    };

    const renderFolderCard = (folder: FolderInfo) => {
        const memberCount = membersByFolder[folder.id]?.length ?? folder.members.length;
        const permissions = describePermissions(folder.defaultPermissions);

        return (
            <div
                key={folder.id}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border transition-all cursor-pointer ${selectedFolderId === folder.id ? 'border-purple-500 bg-white/20' : 'border-white/20 hover:border-white/40'
                    }`}
                onClick={() => setSelectedFolderId(folder.id === selectedFolderId ? null : folder.id)}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {folder.name}
                            {!folder.template.revocable && <Lock className="w-4 h-4 text-yellow-400" />}
                        </h3>
                        <p className="text-gray-400 text-sm">{memberCount} token holders</p>
                    </div>
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            fetchMembers(folder.id);
                        }}
                        className="px-3 py-1 text-xs rounded-lg bg-purple-500/20 text-purple-200"
                    >
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Total Allocated</p>
                        <p className="text-white font-bold text-lg">{formatNumber(folder.totalAllocated)} NYAX</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Vesting</p>
                        <p className="text-gray-200 text-sm">
                            Cliff {folder.template.cliff / DAY_IN_SECONDS}d · Duration {folder.template.duration / DAY_IN_SECONDS}d
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-gray-400 text-sm mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                        {permissions.length === 0 ? (
                            <span className="px-3 py-1 bg-gray-500/20 text-gray-200 rounded-full text-xs">Default</span>
                        ) : (
                            permissions.map(label => (
                                <span key={label} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                                    {label}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center text-gray-300 py-20">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading on-chain data...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">NYAX Folder Registry</h1>
                        <p className="text-gray-400">Manage allocation groups, vesting templates, and permissions</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        disabled={!isConnected}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/40 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        {isConnected ? 'New Folder' : 'Connect Wallet'}
                    </button>
                </div>

                {!isConnected && (
                    <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 text-sm rounded-lg px-4 py-3">
                        Connect a wallet to create or manage folders.
                    </div>
                )}

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        Registry Tools
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {['Create Folder', 'Refresh', 'Manage Holders', 'Permissions', 'Vesting', 'Analytics'].map(label => (
                            <div
                                key={label}
                                className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg border border-white/10 text-gray-300 text-sm"
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
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
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-white">Token Folders</h2>
                            {error && <span className="text-red-400 text-sm">{error}</span>}
                        </div>
                        {filteredFolders.length === 0 ? (
                            <div className="text-gray-400 bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                                No folders matched your search.
                            </div>
                        ) : (
                            filteredFolders.map(folder => renderFolderCard(folder))
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Total Allocated</span>
                                    <span className="text-white font-bold">{formatNumber(summary.totalAllocated)} NYAX</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Total Members</span>
                                    <span className="text-yellow-400 font-bold">{formatNumber(summary.totalMembers)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Folders</span>
                                    <span className="text-green-400 font-bold">{summary.folderCount}</span>
                                </div>
                            </div>
                        </div>

                        {selectedFolderId && membersByFolder[selectedFolderId] && (
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                <h3 className="text-xl font-bold text-white mb-4">Folder Members</h3>
                                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                                    {membersByFolder[selectedFolderId]!.map(member => (
                                        <div key={member.account} className="flex justify-between text-sm text-gray-300 border-b border-white/10 pb-1">
                                            <span className="font-mono">{member.account.slice(0, 6)}...{member.account.slice(-4)}</span>
                                            <span className="text-purple-300">{formatNumber(member.unlockedAmount)} NYAX</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full mx-4 space-y-4">
                            <h3 className="text-2xl font-bold text-white">Create New Folder</h3>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Folder Name</label>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    placeholder="e.g., Community"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Permissions Mask</label>
                                <input
                                    type="number"
                                    value={newFolderPermissions}
                                    onChange={e => setNewFolderPermissions(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    placeholder="e.g., 3 (View + Vote)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Cliff (days)</label>
                                    <input
                                        type="number"
                                        value={cliffDays}
                                        onChange={e => setCliffDays(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={durationDays}
                                        onChange={e => setDurationDays(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-gray-300 text-sm">
                                <input type="checkbox" checked={revocable} onChange={e => setRevocable(e.target.checked)} className="accent-purple-500" />
                                Revocable schedule
                            </label>
                            {formError && <p className="text-red-400 text-sm">{formError}</p>}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateFolder}
                                    disabled={actionPending || !isConnected}
                                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                                >
                                    {actionPending ? 'Creating...' : !isConnected ? 'Connect Wallet' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}