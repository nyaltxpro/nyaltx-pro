"use client";

import ConnectWalletButton from '@/components/ConnectWalletButton';
import { useDAOService } from '@/hooks/useDAOService';
import { useFolderRegistry } from '@/hooks/useFolderRegistry';
import { FolderInfo, MultisigTransaction } from '@/services/contracts/types';
import { useAppKitAccount } from '@reown/appkit/react';
import { CalendarClock, Filter, Gavel, KeySquare, Loader2, Lock, Plus, Search, Shield, UserPlus2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

type ActiveTab = 'folders' | 'staking';

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
        setFolderLockState,
        refresh,
    } = useFolderRegistry();

    const { daoService } = useDAOService();

    const { isConnected: isEvmConnected } = useAccount();
    const { isConnected: isAppKitConnected } = useAppKitAccount();
    const isConnected = isEvmConnected || isAppKitConnected;

    const [searchValue, setSearchValue] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAllocationModal, setShowAllocationModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showVestingModal, setShowVestingModal] = useState(false);
    const [showFolderEditModal, setShowFolderEditModal] = useState(false);
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
    const [folderEditForm, setFolderEditForm] = useState({ folderId: 0, permissions: '', cliffDays: '0', durationDays: '365', revocable: true });
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [proposalForm, setProposalForm] = useState({
        title: '',
        description: '',
        targets: '',
        values: '',
        calldatas: '',
    });
    const [proposalResult, setProposalResult] = useState<string | null>(null);

    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [transfersEnabled, setTransfersEnabledState] = useState<boolean | null>(null);
    const [transfersLoading, setTransfersLoading] = useState(false);
    const [transfersError, setTransfersError] = useState<string | null>(null);
    const [tokenMetrics, setTokenMetrics] = useState({ paused: null as boolean | null, totalSupply: '0', maxSupply: '0', remainingMintable: '0' });
    const [mintForm, setMintForm] = useState({ to: '', amount: '' });
    const [burnForm, setBurnForm] = useState({ from: '', amount: '' });
    const [tokenActionLoading, setTokenActionLoading] = useState(false);
    const [tokenGovernorMessage, setTokenGovernorMessage] = useState<string | null>(null);
    const [tokenGovernorError, setTokenGovernorError] = useState<string | null>(null);
    const [bridgeForm, setBridgeForm] = useState({
        tokenAddress: '',
        folderAddress: '',
        amount: '',
        referenceId: '',
    });
    const [bridgeStatus, setBridgeStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [bridgeLoading, setBridgeLoading] = useState(false);
    const [multisigForm, setMultisigForm] = useState({ to: '', value: '0', data: '0x' });
    const [multisigTransactions, setMultisigTransactions] = useState<MultisigTransaction[]>([]);
    const [multisigStatus, setMultisigStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [multisigLoading, setMultisigLoading] = useState(false);

    const refreshMultisigTransactions = useCallback(async () => {
        if (!daoService) return;
        try {
            const pending = await daoService.multisig.getPendingTransactions();
            setMultisigTransactions(pending);
        } catch (err) {
            console.error('Failed to load multisig transactions', err);
        }
    }, [daoService]);

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

    const refreshTokenInfo = useCallback(async () => {
        if (!daoService) return;
        try {
            const info = await daoService.treasury.getTokenInfo();
            setTransfersEnabledState(info.transfersEnabled ?? null);
            setTokenMetrics({
                paused: info.paused ?? null,
                totalSupply: info.totalSupply ?? '0',
                maxSupply: info.maxSupply ?? '0',
                remainingMintable: info.remainingMintable ?? '0',
            });
            setTransfersError(null);
            setTokenGovernorError(null);
        } catch (err) {
            console.error('Failed to load token status', err);
            setTransfersError('Unable to load transfer status.');
            setTokenGovernorError('Unable to load NYAX token metrics.');
        }
    }, [daoService]);

    useEffect(() => {
        refreshTokenInfo();
    }, [refreshTokenInfo]);

    useEffect(() => {
        refreshMultisigTransactions();
    }, [refreshMultisigTransactions]);

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

    const handleTransferToggle = async () => {
        if (!isConnected) {
            setFormError('Connect a wallet to manage token transfers.');
            return;
        }
        if (!daoService || transfersEnabled === null) return;
        setTransfersLoading(true);
        setTransfersError(null);
        try {
            await daoService.treasury.setTokenTransfersEnabled(!transfersEnabled);
            await refreshTokenInfo();
            setFormError(null);
        } catch (err) {
            console.error('Failed to toggle transfers', err);
            setTransfersError(err instanceof Error ? err.message : 'Failed to update transfer status');
        } finally {
            setTransfersLoading(false);
        }
    };

    const handleTokenPauseToggle = async () => {
        if (!isConnected) {
            setFormError('Connect a wallet to manage NYAX token state.');
            return;
        }
        if (!daoService || tokenMetrics.paused === null) return;
        setTokenActionLoading(true);
        setTokenGovernorMessage(null);
        setTokenGovernorError(null);
        try {
            if (tokenMetrics.paused) {
                await daoService.treasury.unpauseToken();
            } else {
                await daoService.treasury.pauseToken();
            }
            await refreshTokenInfo();
            setTokenGovernorMessage(tokenMetrics.paused ? 'NYAX transfers resumed.' : 'NYAX token paused.');
        } catch (err) {
            console.error('Failed to toggle pause', err);
            setTokenGovernorError(err instanceof Error ? err.message : 'Failed to toggle token pause');
        } finally {
            setTokenActionLoading(false);
        }
    };

    const handleMintTokens = async () => {
        if (!isConnected) {
            setFormError('Connect a wallet to mint tokens.');
            return;
        }
        if (!daoService) return;
        if (!mintForm.to.trim() || !mintForm.amount.trim()) {
            setTokenGovernorError('Recipient address and amount are required to mint.');
            return;
        }
        const amountValue = Number(mintForm.amount);
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            setTokenGovernorError('Enter a valid mint amount.');
            return;
        }
        setTokenActionLoading(true);
        setTokenGovernorMessage(null);
        setTokenGovernorError(null);
        try {
            await daoService.treasury.mintGovernanceTokens(mintForm.to.trim(), mintForm.amount.trim());
            setMintForm({ to: '', amount: '' });
            await refreshTokenInfo();
            setTokenGovernorMessage('Mint transaction submitted.');
        } catch (err) {
            console.error('Failed to mint tokens', err);
            setTokenGovernorError(err instanceof Error ? err.message : 'Mint transaction failed');
        } finally {
            setTokenActionLoading(false);
        }
    };

    const handleBurnTokens = async () => {
        if (!isConnected) {
            setFormError('Connect a wallet to burn tokens.');
            return;
        }
        if (!daoService) return;
        if (!burnForm.from.trim() || !burnForm.amount.trim()) {
            setTokenGovernorError('Source address and amount are required to burn.');
            return;
        }
        const amountValue = Number(burnForm.amount);
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            setTokenGovernorError('Enter a valid burn amount.');
            return;
        }
        setTokenActionLoading(true);
        setTokenGovernorMessage(null);
        setTokenGovernorError(null);
        try {
            await daoService.treasury.burnGovernanceTokens(burnForm.from.trim(), burnForm.amount.trim());
            setBurnForm({ from: '', amount: '' });
            await refreshTokenInfo();
            setTokenGovernorMessage('Burn transaction submitted.');
        } catch (err) {
            console.error('Failed to burn tokens', err);
            setTokenGovernorError(err instanceof Error ? err.message : 'Burn transaction failed');
        } finally {
            setTokenActionLoading(false);
        }
    };

    const openAllocationModal = (folderOverride?: FolderInfo) => {
        const targetFolder = folderOverride ?? selectedFolder;
        if (!targetFolder) {
            setFormError('Select a folder first');
            return;
        }
        if (!folderOverride) {
            setSelectedFolderId(targetFolder.id);
        }
        setAllocationForm(prev => ({ ...prev, folderId: targetFolder.id }));
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
            await setFolderLockState(selectedFolder.id, mode === 'lock');
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

    const parseCommaOrNewline = (value: string) =>
        value
            .split(/[,\n]/)
            .map(entry => entry.trim())
            .filter(Boolean);

    const handleCreateProposal = async () => {
        if (!isConnected) {
            setFormError('Connect a wallet to submit proposals.');
            return;
        }
        if (!daoService) {
            setFormError('DAO service unavailable. Try reloading.');
            return;
        }
        if (!proposalForm.title.trim() || !proposalForm.description.trim()) {
            setFormError('Title and description are required.');
            return;
        }
        const targets = parseCommaOrNewline(proposalForm.targets);
        const values = parseCommaOrNewline(proposalForm.values);
        const calldatas = parseCommaOrNewline(proposalForm.calldatas);

        if (!(targets.length && targets.length === values.length && values.length === calldatas.length)) {
            setFormError('Targets, values, and calldatas must have the same count.');
            return;
        }

        try {
            setFormError(null);
            setProposalResult(null);
            const description = `${proposalForm.title.trim()}\n\n${proposalForm.description.trim()}`;
            const proposalId = await daoService.governance.createProposal(targets, values, calldatas, description);
            setProposalResult(proposalId);
            setProposalForm({ title: '', description: '', targets: '', values: '', calldatas: '' });
            setShowProposalModal(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create proposal';
            setFormError(message);
        }
    };

    const openFolderEditModal = (folder: FolderInfo) => {
        setFolderEditForm({
            folderId: folder.id,
            permissions: String(folder.defaultPermissions),
            cliffDays: String(Math.floor(folder.template.cliff / DAY_IN_SECONDS)),
            durationDays: String(Math.floor(folder.template.duration / DAY_IN_SECONDS)),
            revocable: folder.template.revocable,
        });
        setFormError(null);
        setShowFolderEditModal(true);
    };

    const handleFolderUpdate = async () => {
        if (!folderEditForm.folderId) {
            setFormError('Folder ID missing.');
            return;
        }
        const permissions = Number(folderEditForm.permissions || '0');
        if (!Number.isFinite(permissions)) {
            setFormError('Enter a numeric permissions mask.');
            return;
        }
        const cliffSeconds = Number(folderEditForm.cliffDays || '0') * DAY_IN_SECONDS;
        const durationSeconds = Number(folderEditForm.durationDays || '0') * DAY_IN_SECONDS;
        if (cliffSeconds < 0 || durationSeconds < 0) {
            setFormError('Cliff and duration must be non-negative.');
            return;
        }
        try {
            setFormError(null);
            await updateFolder(folderEditForm.folderId, {
                permissions,
                template: {
                    cliff: cliffSeconds,
                    duration: durationSeconds,
                    revocable: folderEditForm.revocable,
                },
            });
            setShowFolderEditModal(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to update folder');
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
                            {folder.locked && (
                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-200">
                                    <Lock className="w-3 h-3" /> Locked
                                </span>
                            )}

                            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-semibold flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-orange-300" /> Treasury Multisig Approvals
                                        </h2>
                                        <p className="text-gray-400 text-sm">Submit, approve, and execute multisig transactions controlling treasury flows.</p>
                                    </div>
                                    {multisigStatus && (
                                        <span className={`px-4 py-1.5 rounded-full text-sm border ${multisigStatus.type === 'success' ? 'border-emerald-400/40 text-emerald-200' : 'border-red-400/40 text-red-200'}`}>
                                            {multisigStatus.message}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                    <div className="space-y-3">
                                        <label className="text-sm text-gray-400">Destination</label>
                                        <input
                                            type="text"
                                            value={multisigForm.to}
                                            onChange={e => setMultisigForm(prev => ({ ...prev, to: e.target.value }))}
                                            placeholder="0x..."
                                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm text-gray-400">Value (ETH)</label>
                                        <input
                                            type="text"
                                            value={multisigForm.value}
                                            onChange={e => setMultisigForm(prev => ({ ...prev, value: e.target.value }))}
                                            placeholder="0"
                                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm text-gray-400">Calldata (hex)</label>
                                        <input
                                            type="text"
                                            value={multisigForm.data}
                                            onChange={e => setMultisigForm(prev => ({ ...prev, data: e.target.value }))}
                                            placeholder="0x"
                                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                    <button
                                        onClick={async () => {
                                            if (!daoService) {
                                                setMultisigStatus({ type: 'error', message: 'DAO service unavailable' });
                                                return;
                                            }
                                            if (!multisigForm.to || !multisigForm.data) {
                                                setMultisigStatus({ type: 'error', message: 'Destination and calldata required' });
                                                return;
                                            }
                                            setMultisigLoading(true);
                                            try {
                                                const txIndex = await daoService.multisig.submitTransaction(
                                                    multisigForm.to,
                                                    multisigForm.value || '0',
                                                    multisigForm.data || '0x'
                                                );
                                                setMultisigStatus({ type: 'success', message: `Transaction submitted (#${txIndex})` });
                                                setMultisigForm({ to: '', value: '0', data: '0x' });
                                                await refreshMultisigTransactions();
                                            } catch (err) {
                                                console.error('Submit multisig tx failed', err);
                                                const message = err instanceof Error ? err.message : 'Submit failed';
                                                setMultisigStatus({ type: 'error', message });
                                            } finally {
                                                setMultisigLoading(false);
                                            }
                                        }}
                                        disabled={multisigLoading || !isConnected}
                                        className="px-4 py-3 rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 font-semibold disabled:opacity-40"
                                    >
                                        {multisigLoading ? 'Submitting…' : 'Submit Transaction'}
                                    </button>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Pending Transactions</h3>
                                        <button
                                            onClick={refreshMultisigTransactions}
                                            className="text-sm text-blue-300 hover:text-blue-200"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                    {multisigTransactions.length === 0 ? (
                                        <p className="text-sm text-gray-400">No pending multisig transactions.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {multisigTransactions.map(tx => (
                                                <div key={tx.id} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-200">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <p className="font-semibold">#{tx.id} → {tx.to.slice(0, 6)}…{tx.to.slice(-4)}</p>
                                                            <p className="text-xs text-gray-400">Value: {tx.value} ETH · Confirmations: {tx.confirmations}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="px-3 py-1 rounded-lg border border-emerald-400/40 text-emerald-200 text-xs"
                                                                onClick={async () => {
                                                                    if (!daoService) return;
                                                                    try {
                                                                        setMultisigLoading(true);
                                                                        await daoService.multisig.confirmTransaction(tx.id);
                                                                        setMultisigStatus({ type: 'success', message: `Confirmed #${tx.id}` });
                                                                        await refreshMultisigTransactions();
                                                                    } catch (err) {
                                                                        console.error('Confirm multisig failed', err);
                                                                        const message = err instanceof Error ? err.message : 'Confirm failed';
                                                                        setMultisigStatus({ type: 'error', message });
                                                                    } finally {
                                                                        setMultisigLoading(false);
                                                                    }
                                                                }}
                                                                disabled={multisigLoading}
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                className="px-3 py-1 rounded-lg border border-blue-400/40 text-blue-200 text-xs"
                                                                onClick={async () => {
                                                                    if (!daoService) return;
                                                                    try {
                                                                        setMultisigLoading(true);
                                                                        await daoService.multisig.executeTransaction(tx.id);
                                                                        setMultisigStatus({ type: 'success', message: `Executed #${tx.id}` });
                                                                        await refreshMultisigTransactions();
                                                                    } catch (err) {
                                                                        console.error('Execute multisig failed', err);
                                                                        const message = err instanceof Error ? err.message : 'Execute failed';
                                                                        setMultisigStatus({ type: 'error', message });
                                                                    } finally {
                                                                        setMultisigLoading(false);
                                                                    }
                                                                }}
                                                                disabled={multisigLoading}
                                                            >
                                                                Execute
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {tx.data !== '0x' && (
                                                        <p className="mt-2 text-xs text-gray-400 wrap-break-word">Data: {tx.data}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
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

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            openAllocationModal(folder);
                        }}
                        disabled={!isConnected}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-400/40 text-emerald-200 text-sm hover:bg-emerald-500/10 disabled:opacity-40"
                    >
                        <UserPlus2 className="w-4 h-4" /> Allocate tokens
                    </button>
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            openFolderEditModal(folder);
                        }}
                        disabled={!isConnected}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-400/40 text-blue-200 text-sm hover:bg-blue-500/10 disabled:opacity-40"
                    >
                        <KeySquare className="w-4 h-4" /> Edit folder
                    </button>
                </div>
            </div>
        );
    };



    return (
        <div className="min-h-screen  text-white">
            <div className="max-w-7xl mx-auto space-y-10 px-4 py-10">
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:p-10 shadow-[0_25px_80px_rgba(8,19,44,0.45)]">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-indigo-200/70">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> NYAX Admin
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold">Governance Command Center</h1>
                                <p className="text-gray-300 mt-2 max-w-2xl">
                                    Operate the NYAX folder registry, vesting templates, and proposal tooling with a single, secure console.
                                    Inspired by the nyaltx.pro admin interface, this surface keeps mission critical actions within reach.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                <span className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${isConnected ? 'border-emerald-400/40 text-emerald-200' : 'border-red-400/40 text-red-200'}`}>
                                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    {isConnected ? 'Admin wallet connected' : 'Connect wallet to enable controls'}
                                </span>
                                <span className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-slate-200">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Registry sync {loading ? 'in progress' : 'up to date'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 w-full max-w-sm">
                            {!isConnected && <ConnectWalletButton className="bg-purple-600 hover:bg-purple-700" />}
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    disabled={!isConnected}
                                    className="flex-1 min-w-[140px] px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" /> Create Folder
                                    </div>
                                </button>
                                <button
                                    className="flex-1 min-w-[140px] px-5 py-3 rounded-2xl border border-white/20 text-white/80 hover:bg-white/10 transition"
                                    onClick={() => setShowProposalModal(true)}
                                    disabled={!isConnected || loading}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Gavel className="w-4 h-4" /> Proposal
                                    </div>
                                </button>
                                <button
                                    className="flex-1 min-w-[140px] px-5 py-3 rounded-2xl border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 transition disabled:opacity-40"
                                    onClick={() => openAllocationModal()}
                                    disabled={!selectedFolder || !isConnected || loading}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <UserPlus2 className="w-4 h-4" /> Allocation
                                    </div>
                                </button>
                            </div>
                            <p className="text-xs text-gray-400">{selectedFolder ? `Allocations armed for ${selectedFolder.name}` : 'Select a folder card below to unlock allocation tooling.'}</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: 'Allocated NYAX', value: `${formatNumber(summary.totalAllocated)} NYAX`, accent: 'bg-indigo-500/20 text-indigo-200' },
                            { label: 'Active members', value: formatNumber(summary.totalMembers), accent: 'bg-emerald-500/15 text-emerald-200' },
                            { label: 'Folders live', value: summary.folderCount, accent: 'bg-blue-500/15 text-blue-200' },
                            { label: 'Action queue', value: `${filteredFolders.length} folders`, accent: 'bg-purple-500/15 text-purple-200' },
                        ].map(card => (
                            <div key={card.label} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">{card.label}</p>
                                <p className="text-2xl font-semibold mt-2">{card.value}</p>
                                <span className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs ${card.accent}`}>{card.label === 'Action queue' ? 'Live folders in view' : 'Real-time'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {!isConnected && (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                        Wallet connection is required to create, edit, or revoke allocations.
                    </div>
                )}

                {showFolderEditModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-lg w-full mx-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-white">Update Folder</h3>
                                <button className="text-gray-400 hover:text-white" onClick={() => setShowFolderEditModal(false)}>✕</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Folder ID</label>
                                    <input
                                        type="number"
                                        value={folderEditForm.folderId}
                                        onChange={e => setFolderEditForm(prev => ({ ...prev, folderId: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Permissions Mask</label>
                                    <input
                                        type="number"
                                        value={folderEditForm.permissions}
                                        onChange={e => setFolderEditForm(prev => ({ ...prev, permissions: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Cliff (days)</label>
                                    <input
                                        type="number"
                                        value={folderEditForm.cliffDays}
                                        onChange={e => setFolderEditForm(prev => ({ ...prev, cliffDays: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={folderEditForm.durationDays}
                                        onChange={e => setFolderEditForm(prev => ({ ...prev, durationDays: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-gray-300 text-sm">
                                <input
                                    type="checkbox"
                                    checked={folderEditForm.revocable}
                                    onChange={e => setFolderEditForm(prev => ({ ...prev, revocable: e.target.checked }))}
                                    className="accent-purple-500"
                                />
                                Revocable schedule
                            </label>
                            {formError && <p className="text-red-400 text-sm">{formError}</p>}
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg" onClick={() => setShowFolderEditModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                                    onClick={handleFolderUpdate}
                                    disabled={actionPending || !isConnected}
                                >
                                    {actionPending ? 'Updating…' : 'Update Folder'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold flex items-center gap-3">
                                <Shield className="w-5 h-5 text-purple-300" /> Registry Toolkit
                            </h2>
                            <p className="text-gray-400 text-sm">Quick actions for folder lifecycle management, mirroring the nyaltx admin workflow.</p>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400">
                            <span className="px-3 py-1 rounded-full border border-white/10">Selected folder {selectedFolder ? `#${selectedFolder.id}` : '—'}</span>
                            <span className="px-3 py-1 rounded-full border border-white/10">Tools react to wallet state</span>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <button className={TOOL_BUTTON_CLASSES} onClick={() => setShowAddModal(true)} disabled={!isConnected || loading}>
                            <Plus className="w-5 h-5" />
                            Create Folder
                        </button>
                        <button className={TOOL_BUTTON_CLASSES} onClick={refresh} disabled={loading}>
                            <Loader2 className="w-5 h-5" />
                            Refresh Data
                        </button>
                        <button className={TOOL_BUTTON_CLASSES} onClick={() => openAllocationModal()} disabled={!selectedFolder || !isConnected || loading}>
                            <UserPlus2 className="w-5 h-5" />
                            Allocations
                        </button>
                        <button className={TOOL_BUTTON_CLASSES} onClick={openPermissionsModal} disabled={!selectedFolder || !isConnected || loading}>
                            <KeySquare className="w-5 h-5" />
                            Set Permissions
                        </button>
                        <button className={TOOL_BUTTON_CLASSES} onClick={openVestingModal} disabled={!selectedFolder || !isConnected || loading}>
                            <CalendarClock className="w-5 h-5" />
                            Vesting Template
                        </button>
                        <button
                            className={TOOL_BUTTON_CLASSES}
                            onClick={() => handleLockToggle(selectedFolder?.locked ? 'unlock' : 'lock')}
                            disabled={!selectedFolder || !isConnected || loading}
                        >
                            <Lock className="w-5 h-5" />
                            {selectedFolder?.locked ? 'Unlock Folder' : 'Lock Folder'}
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold flex items-center gap-3">
                                <Shield className="w-5 h-5 text-green-300" /> Treasury → Folder Funding
                            </h2>
                            <p className="text-gray-400 text-sm">Send ERC20 from the governance treasury bridge into a folder escrow.</p>
                        </div>
                        {bridgeStatus && (
                            <span className={`px-4 py-1.5 rounded-full text-sm border ${bridgeStatus.type === 'success' ? 'border-emerald-400/40 text-emerald-200' : 'border-red-400/40 text-red-200'}`}>
                                {bridgeStatus.message}
                            </span>
                        )}
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                            <label className="text-sm text-gray-400">Token Address</label>
                            <input
                                type="text"
                                placeholder="0x..."
                                value={bridgeForm.tokenAddress}
                                onChange={e => setBridgeForm(prev => ({ ...prev, tokenAddress: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm text-gray-400">Folder Address / Receiver</label>
                            <input
                                type="text"
                                placeholder="0x..."
                                value={bridgeForm.folderAddress}
                                onChange={e => setBridgeForm(prev => ({ ...prev, folderAddress: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm text-gray-400">Amount</label>
                            <input
                                type="number"
                                value={bridgeForm.amount}
                                onChange={e => setBridgeForm(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="1000"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm text-gray-400">Reference ID</label>
                            <input
                                type="text"
                                value={bridgeForm.referenceId}
                                onChange={e => setBridgeForm(prev => ({ ...prev, referenceId: e.target.value }))}
                                placeholder="e.g. FOLDER-01"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white"
                            />
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            if (!daoService) {
                                setBridgeStatus({ type: 'error', message: 'DAO service not ready' });
                                return;
                            }
                            if (!bridgeForm.tokenAddress || !bridgeForm.folderAddress || !bridgeForm.amount || !bridgeForm.referenceId) {
                                setBridgeStatus({ type: 'error', message: 'Complete all treasury fields' });
                                return;
                            }
                            setBridgeLoading(true);
                            setBridgeStatus(null);
                            try {
                                const tx = await daoService.treasuryBridge?.transferTreasuryToken(
                                    bridgeForm.tokenAddress,
                                    bridgeForm.folderAddress,
                                    bridgeForm.amount,
                                    bridgeForm.referenceId,
                                );
                                if (tx?.wait) {
                                    await tx.wait();
                                }
                                setBridgeStatus({ type: 'success', message: 'Funding transaction submitted' });
                                setBridgeForm({ tokenAddress: '', folderAddress: '', amount: '', referenceId: '' });
                            } catch (err) {
                                console.error('Bridge transfer failed', err);
                                const message = err instanceof Error ? err.message : 'Bridge transfer failed';
                                setBridgeStatus({ type: 'error', message });
                            } finally {
                                setBridgeLoading(false);
                            }
                        }}
                        disabled={bridgeLoading || !isConnected}
                        className="mt-6 w-full px-4 py-3 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 font-semibold disabled:opacity-40"
                    >
                        {bridgeLoading ? 'Sending…' : 'Fund Folder via Treasury Bridge'}
                    </button>
                </div>
                {/* <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Allocations</p>
                            <h2 className="text-2xl font-semibold mt-2">Folder allocation center</h2>
                            <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                                Review and assign balances to holders just like on nyax-admin. Select a folder, then trigger the allocation workflow to set vesting, cliffs, and permissions in one pane.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 min-w-[240px]">
                            <button
                                className="px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => openAllocationModal()}
                                disabled={!selectedFolder || !isConnected || loading}
                            >
                                Start allocation
                            </button>
                            <div className="text-xs text-gray-400 rounded-2xl border border-white/10 bg-white/5 p-3">
                                {selectedFolder
                                    ? `Ready to assign tokens for ${selectedFolder.name}`
                                    : 'Choose a folder from the list to unlock allocations'}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm text-gray-400">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Step 1</p>
                            <p className="text-white font-semibold mt-1">Select a folder</p>
                            <p className="mt-1">Tap any folder card to focus on that allocation group.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Step 2</p>
                            <p className="text-white font-semibold mt-1">Open allocation modal</p>
                            <p className="mt-1">Press “Start allocation” to configure cliffs, duration, and wallet address.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Step 3</p>
                            <p className="text-white font-semibold mt-1">Save & refresh</p>
                            <p className="mt-1">Confirm the transaction, then sync members to view the latest balances.</p>
                        </div>
                    </div>
                </div> */}

                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Token safety</p>
                            <h2 className="text-2xl font-semibold mt-2">Global transfer lock</h2>
                            <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                                Toggle NYAX ERC20 transferability directly from the admin console to pause or resume token movement at the contract level.
                            </p>
                            {transfersError && <p className="text-sm text-red-400 mt-2">{transfersError}</p>}
                        </div>
                        <div className="flex flex-col gap-3 min-w-[240px]">
                            <span className={`px-4 py-2 rounded-full text-xs border ${transfersEnabled === null
                                ? 'border-white/20 text-gray-300'
                                : transfersEnabled
                                    ? 'border-emerald-400/40 text-emerald-200'
                                    : 'border-red-400/40 text-red-200'
                                }`}>
                                {transfersEnabled === null ? 'Status syncing…' : transfersEnabled ? 'Transfers enabled' : 'Transfers disabled'}
                            </span>
                            <button
                                onClick={handleTransferToggle}
                                disabled={!isConnected || transfersEnabled === null || transfersLoading}
                                className="px-5 py-3 rounded-2xl bg-linear-to-r from-pink-500 to-orange-500 font-semibold disabled:opacity-40"
                            >
                                {transfersLoading ? 'Updating…' : transfersEnabled ? 'Disable Transfers' : 'Enable Transfers'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                            placeholder="Search folders, holders, or metadata"
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/10 bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                        />
                    </div>
                    <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-3 text-sm text-gray-200 hover:bg-white/10 transition">
                        <Filter className="w-5 h-5" /> Advanced filters
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Registry</p>
                                <h2 className="text-2xl font-semibold">Token folders</h2>
                            </div>
                            {error && <span className="text-red-400 text-sm">{error}</span>}
                        </div>
                        {filteredFolders.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-gray-400">
                                No folders matched your search criteria.
                            </div>
                        ) : (
                            filteredFolders.map(folder => renderFolderCard(folder))
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <h3 className="text-lg font-semibold mb-4">Platform telemetry</h3>
                            <div className="space-y-3 text-sm text-gray-300">
                                <div className="flex justify-between"><span>Total allocated</span><span className="text-white font-semibold">{formatNumber(summary.totalAllocated)} NYAX</span></div>
                                <div className="flex justify-between"><span>Total members</span><span className="text-yellow-300 font-semibold">{formatNumber(summary.totalMembers)}</span></div>
                                <div className="flex justify-between"><span>Folders live</span><span className="text-green-300 font-semibold">{summary.folderCount}</span></div>
                            </div>
                        </div>

                        {selectedFolderId && membersByFolder[selectedFolderId] && (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">Folder members</h3>
                                    <span className="text-xs text-gray-400">#{selectedFolderId}</span>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                                    {membersByFolder[selectedFolderId]!.map(member => (
                                        <div key={member.account} className="flex items-center justify-between text-sm text-gray-200 border-b border-white/10 pb-1">
                                            <span className="font-mono text-xs">{member.account.slice(0, 6)}...{member.account.slice(-4)}</span>
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

                {showProposalModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-3xl w-full mx-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Gavel className="w-6 h-6 text-purple-300" />
                                    Submit Governance Proposal
                                </h3>
                                <button className="text-gray-400 hover:text-white" onClick={() => setShowProposalModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Title</label>
                                    <input
                                        type="text"
                                        value={proposalForm.title}
                                        onChange={e => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Targets (comma or newline separated)</label>
                                    <textarea
                                        value={proposalForm.targets}
                                        onChange={e => setProposalForm(prev => ({ ...prev, targets: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white min-h-[110px]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Values (wei, comma/newline separated)</label>
                                    <textarea
                                        value={proposalForm.values}
                                        onChange={e => setProposalForm(prev => ({ ...prev, values: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white min-h-[110px]"
                                        placeholder="0,0,0"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Calldatas (hex, comma/newline separated)</label>
                                    <textarea
                                        value={proposalForm.calldatas}
                                        onChange={e => setProposalForm(prev => ({ ...prev, calldatas: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white min-h-[110px]"
                                        placeholder="0x..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Proposal Description</label>
                                <textarea
                                    value={proposalForm.description}
                                    onChange={e => setProposalForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white min-h-[140px]"
                                    placeholder="Explain the rationale, execution steps, and expected impact."
                                />
                            </div>
                            {formError && <p className="text-red-400 text-sm">{formError}</p>}
                            {proposalResult && (
                                <p className="text-green-400 text-sm">
                                    Proposal submitted! ID: {proposalResult}
                                </p>
                            )}
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg" onClick={() => setShowProposalModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                                    onClick={handleCreateProposal}
                                    disabled={actionPending || !isConnected}
                                >
                                    Submit Proposal
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}