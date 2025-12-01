"use client";

import ConnectWalletButton from '@/components/ConnectWalletButton';
import { useFolderRegistry } from '@/hooks/useFolderRegistry';
import { FolderInfo } from '@/services/contracts/types';
import { useAppKitAccount } from '@reown/appkit/react';
import { CalendarClock, Filter, KeySquare, Loader2, Lock, Plus, Search, Shield, UserPlus2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

const DAY_IN_SECONDS = 86_400;
const PERMISSION_FLAGS = [
    { bit: 1 << 0, label: 'View' },
    { bit: 1 << 1, label: 'Vote' },
    { bit: 1 << 2, label: 'Propose' },
    { bit: 1 << 3, label: 'Transfer' },
    { bit: 1 << 4, label: 'Admin' },
    { bit: 1 << 5, label: 'Multisig Required' },
];

const formatNumber = (value: string | number) => {
    const numeric = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(numeric)) return '0';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(numeric);
};

const describePermissions = (mask: number) =>
    PERMISSION_FLAGS.filter(flag => (mask & flag.bit) !== 0).map(flag => flag.label);

const TOOL_BUTTON_CLASSES =
    'flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg border border-white/10 text-gray-300 text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed';

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
        updateFolder,
        setFolderAllocation,
        revokeAllocation,
        refresh,
    } = useFolderRegistry();

    const { isConnected: isEvmConnected } = useAccount();
    const { isConnected: isAppKitConnected } = useAppKitAccount();
    const isConnected = isEvmConnected || isAppKitConnected;

    const [searchValue, setSearchValue] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAllocationModal, setShowAllocationModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showVestingModal, setShowVestingModal] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderPermissions, setNewFolderPermissions] = useState('3');
    const [cliffDays, setCliffDays] = useState('30');
    const [durationDays, setDurationDays] = useState('365');
    const [newFolderRevocable, setNewFolderRevocable] = useState(true);

    const [allocationForm, setAllocationForm] = useState({
        folderId: 0,
        account: '',
        amount: '',
        startDate: '',
        cliffDays: '0',
        durationDays: '365',
        permissions: '',
    });

    const [permissionsForm, setPermissionsForm] = useState({ folderId: 0, permissions: '' });
    const [vestingForm, setVestingForm] = useState({ folderId: 0, cliff: '0', duration: '365', revocable: true });

    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

    const selectedFolder = useMemo(
        () => folders.find(folder => folder.id === selectedFolderId) ?? null,
        [folders, selectedFolderId]
    );

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

    const handleSelectFolder = (folderId: number) => {
        setSelectedFolderId(prev => (prev === folderId ? null : folderId));
        setFormError(null);
    };

    const handleCreateFolder = async () => {
        if (!isConnected) {
            setFormError('Connect a wallet before creating folders.');
            return;
        }
        if (!newFolderName.trim()) {
            setFormError('Folder name is required');
            return;
        }
        const permissionsMask = Number(newFolderPermissions);
        if (Number.isNaN(permissionsMask)) {
            setFormError('Permissions mask must be numeric');
            return;
        }

        try {
            await createFolder({
                name: newFolderName.trim(),
                permissions: permissionsMask,
                template: {
                    cliff: Number(cliffDays || '0') * DAY_IN_SECONDS,
                    duration: Number(durationDays || '0') * DAY_IN_SECONDS,
                    revocable: newFolderRevocable,
                },
            });
            setNewFolderName('');
            setNewFolderPermissions('3');
            setCliffDays('30');
            setDurationDays('365');
            setNewFolderRevocable(true);
            setFormError(null);
            setShowAddModal(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to create folder');
        }
    };

    const openAllocationModal = () => {
        if (!selectedFolder) {
            setFormError('Select a folder first');
            return;
        }
        setAllocationForm(prev => ({ ...prev, folderId: selectedFolder.id }));
        setFormError(null);
        setShowAllocationModal(true);
    };

    const handleSetAllocation = async () => {
        if (!allocationForm.folderId || !allocationForm.account || !allocationForm.amount) {
            setFormError('Folder, address, and amount are required');
            return;
        }
        const start = allocationForm.startDate
            ? Math.floor(new Date(allocationForm.startDate).getTime() / 1000)
            : Math.floor(Date.now() / 1000);
        const schedule = {
            start,
            cliff: Number(allocationForm.cliffDays || '0') * DAY_IN_SECONDS,
            duration: Number(allocationForm.durationDays || '0') * DAY_IN_SECONDS,
            revocable: true,
        };

        try {
            await setFolderAllocation({
                folderId: allocationForm.folderId,
                account: allocationForm.account,
                amount: allocationForm.amount,
                schedule,
                permissions: allocationForm.permissions ? Number(allocationForm.permissions) : undefined,
            });
            setFormError(null);
            setShowAllocationModal(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to set allocation');
        }
    };

    const openPermissionsModal = () => {
        if (!selectedFolder) {
            setFormError('Select a folder first');
            return;
        }
        setPermissionsForm({ folderId: selectedFolder.id, permissions: String(selectedFolder.defaultPermissions) });
        setFormError(null);
        setShowPermissionsModal(true);
    };

    const handlePermissionsUpdate = async () => {
        if (!permissionsForm.folderId) return;
        try {
            await updateFolder(permissionsForm.folderId, { permissions: Number(permissionsForm.permissions || '0') });
            setShowPermissionsModal(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to update permissions');
        }
    };

    const openVestingModal = () => {
        if (!selectedFolder) {
            setFormError('Select a folder first');
            return;
        }
        setVestingForm({
            folderId: selectedFolder.id,
            cliff: String(selectedFolder.template.cliff / DAY_IN_SECONDS),
            duration: String(selectedFolder.template.duration / DAY_IN_SECONDS),
            revocable: selectedFolder.template.revocable,
        });
        setFormError(null);
        setShowVestingModal(true);
    };

    const handleVestingUpdate = async () => {
        if (!vestingForm.folderId) return;
        try {
            await updateFolder(vestingForm.folderId, {
                template: {
                    cliff: Number(vestingForm.cliff || '0') * DAY_IN_SECONDS,
                    duration: Number(vestingForm.duration || '0') * DAY_IN_SECONDS,
                    revocable: vestingForm.revocable,
                },
            });
            setShowVestingModal(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to update vesting template');
        }
    };

    const handleLockToggle = async (mode: 'lock' | 'unlock') => {
        if (!selectedFolder) {
            setFormError('Select a folder first');
            return;
        }
        try {
            await updateFolder(selectedFolder.id, {
                template: {
                    ...selectedFolder.template,
                    revocable: mode === 'unlock',
                },
            });
            setFormError(null);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to update lock state');
        }
    };

    const handleRevoke = async (folderId: number, account: string) => {
        try {
            await revokeAllocation(folderId, account);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to revoke allocation');
        }
    };

    const renderFolderCard = (folder: FolderInfo) => {
        const memberCount = membersByFolder[folder.id]?.length ?? folder.members.length;
        const permissions = describePermissions(folder.defaultPermissions);

        return (
            <div
                key={folder.id}
                onClick={() => handleSelectFolder(folder.id)}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border transition-all cursor-pointer ${selectedFolderId === folder.id ? 'border-purple-500 bg-white/20' : 'border-white/20 hover:border-white/40'
                    }`}
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

    if (loading && folders.length === 0) {
        return (
            <div className="w-full flex items-center justify-center text-gray-300 py-20">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading on-chain data...
            </div>
        );
    }

    return (
        <div className="min-h-screen  p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">NYAX Folder Registry</h1>
                        <p className="text-gray-400">Manage allocation groups, vesting templates, and permissions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isConnected && <ConnectWalletButton className="bg-purple-600 hover:bg-purple-700" />}
                        <button
                            onClick={() => setShowAddModal(true)}
                            disabled={!isConnected}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/40 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            New Folder
                        </button>
                    </div>
                </div>

                {!isConnected && (
                    <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 text-sm rounded-lg px-4 py-3">
                        Connect a wallet to create or modify registry data.
                    </div>
                )}

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        Registry Tools
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <button className={TOOL_BUTTON_CLASSES} onClick={() => setShowAddModal(true)} disabled={!isConnected || loading}>
                            <Plus className="w-5 h-5" />
                            Create Folder
                        </button>
                        <button className={TOOL_BUTTON_CLASSES} onClick={refresh} disabled={loading}>
                            <Loader2 className="w-5 h-5" />
                            Refresh
                        </button>
                        <button className={TOOL_BUTTON_CLASSES} onClick={openAllocationModal} disabled={!selectedFolder || !isConnected || loading}>
                            <UserPlus2 className="w-5 h-5" />
                            Manage Holders
                        </button>
                        <button className={TOOL_BUTTON_CLASSES} onClick={openPermissionsModal} disabled={!selectedFolder || !isConnected || loading}>
                            <KeySquare className="w-5 h-5" />
                            Set Permissions
                        </button>
                        <button className={TOOL_BUTTON_CLASSES} onClick={openVestingModal} disabled={!selectedFolder || !isConnected || loading}>
                            <CalendarClock className="w-5 h-5" />
                            Vesting Schedule
                        </button>
                        <button
                            className={TOOL_BUTTON_CLASSES}
                            onClick={() => handleLockToggle(selectedFolder?.template.revocable ? 'lock' : 'unlock')}
                            disabled={!selectedFolder || !isConnected || loading}
                        >
                            <Lock className="w-5 h-5" />
                            {selectedFolder?.template.revocable ? 'Lock Tokens' : 'Unlock Tokens'}
                        </button>
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
                                        <div key={member.account} className="flex items-center justify-between text-sm text-gray-300 border-b border-white/10 pb-1">
                                            <span className="font-mono">{member.account.slice(0, 6)}...{member.account.slice(-4)}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-300">{formatNumber(member.unlockedAmount)} NYAX</span>
                                                <button
                                                    className="text-xs text-red-300 hover:text-red-200"
                                                    onClick={() => handleRevoke(selectedFolderId, member.account)}
                                                    disabled={!isConnected}
                                                >
                                                    Revoke
                                                </button>
                                            </div>
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
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Permissions Mask</label>
                                <input
                                    type="number"
                                    value={newFolderPermissions}
                                    onChange={e => setNewFolderPermissions(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
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
                                <input type="checkbox" checked={newFolderRevocable} onChange={e => setNewFolderRevocable(e.target.checked)} className="accent-purple-500" />
                                Revocable schedule
                            </label>
                            {formError && <p className="text-red-400 text-sm">{formError}</p>}
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                                    onClick={handleCreateFolder}
                                    disabled={actionPending || !isConnected}
                                >
                                    {actionPending ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showAllocationModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-lg w-full mx-4 space-y-4">
                            <h3 className="text-2xl font-bold text-white">Manage Holder Allocation</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Folder ID</label>
                                    <input
                                        type="number"
                                        value={allocationForm.folderId}
                                        onChange={e => setAllocationForm(prev => ({ ...prev, folderId: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Amount (NYAX)</label>
                                    <input
                                        type="text"
                                        value={allocationForm.amount}
                                        onChange={e => setAllocationForm(prev => ({ ...prev, amount: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Recipient Address</label>
                                <input
                                    type="text"
                                    value={allocationForm.account}
                                    onChange={e => setAllocationForm(prev => ({ ...prev, account: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Start Date</label>
                                    <input
                                        type="date"
                                        value={allocationForm.startDate}
                                        onChange={e => setAllocationForm(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Cliff (days)</label>
                                    <input
                                        type="number"
                                        value={allocationForm.cliffDays}
                                        onChange={e => setAllocationForm(prev => ({ ...prev, cliffDays: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={allocationForm.durationDays}
                                        onChange={e => setAllocationForm(prev => ({ ...prev, durationDays: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Permissions Mask (optional)</label>
                                <input
                                    type="number"
                                    value={allocationForm.permissions}
                                    onChange={e => setAllocationForm(prev => ({ ...prev, permissions: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                />
                            </div>
                            {formError && <p className="text-red-400 text-sm">{formError}</p>}
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg" onClick={() => setShowAllocationModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                                    onClick={handleSetAllocation}
                                    disabled={actionPending || !isConnected}
                                >
                                    {actionPending ? 'Saving...' : 'Save Allocation'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showPermissionsModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full mx-4 space-y-4">
                            <h3 className="text-2xl font-bold text-white">Set Folder Permissions</h3>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Folder ID</label>
                                <input
                                    type="number"
                                    value={permissionsForm.folderId}
                                    onChange={e => setPermissionsForm(prev => ({ ...prev, folderId: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Permissions Mask</label>
                                <input
                                    type="number"
                                    value={permissionsForm.permissions}
                                    onChange={e => setPermissionsForm(prev => ({ ...prev, permissions: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg" onClick={() => setShowPermissionsModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                                    onClick={handlePermissionsUpdate}
                                    disabled={actionPending || !isConnected}
                                >
                                    {actionPending ? 'Saving...' : 'Update Permissions'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showVestingModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full mx-4 space-y-4">
                            <h3 className="text-2xl font-bold text-white">Update Vesting Template</h3>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Folder ID</label>
                                <input
                                    type="number"
                                    value={vestingForm.folderId}
                                    onChange={e => setVestingForm(prev => ({ ...prev, folderId: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Cliff (days)</label>
                                    <input
                                        type="number"
                                        value={vestingForm.cliff}
                                        onChange={e => setVestingForm(prev => ({ ...prev, cliff: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={vestingForm.duration}
                                        onChange={e => setVestingForm(prev => ({ ...prev, duration: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-gray-300 text-sm">
                                <input
                                    type="checkbox"
                                    checked={vestingForm.revocable}
                                    onChange={e => setVestingForm(prev => ({ ...prev, revocable: e.target.checked }))}
                                    className="accent-purple-500"
                                />
                                Revocable schedule
                            </label>
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg" onClick={() => setShowVestingModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                                    onClick={handleVestingUpdate}
                                    disabled={actionPending || !isConnected}
                                >
                                    {actionPending ? 'Saving...' : 'Update Template'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}