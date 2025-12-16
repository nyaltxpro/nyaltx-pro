"use client";

import ConnectWalletButton from '@/components/ConnectWalletButton';
import { useDAOService } from '@/hooks/useDAOService';
import { useFolderRegistry } from '@/hooks/useFolderRegistry';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '@/services/contracts';
import { FolderInfo, MultisigTransaction } from '@/services/contracts/types';
import { useAppKitAccount } from '@reown/appkit/react';
import { ethers } from 'ethers';
import { Filter, Gavel, Loader2, Lock, Plus, PlusIcon, Search, Shield, UserPlus2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

const DAY_IN_SECONDS = 86_400;
const PERMISSION_FLAGS = [
    { bit: 1 << 0, label: 'View' },
    { bit: 1 << 1, label: 'Vote' },
    { bit: 1 << 2, label: 'Propose' },
    { bit: 1 << 3, label: 'Transfer' },
    { bit: 1 << 4, label: 'Admin' },
    { bit: 1 << 5, label: 'Multisig Required' },
];

type ProposalAction = {
    target: string;
    value: string;
    calldata: string;
};

const TOKEN_FUNCTION_PRESETS = [
    {
        key: 'enableTransfers',
        label: 'NYAX: Enable transfers',
        functionName: 'setTransfersEnabled',
        args: [true],
    },
    {
        key: 'disableTransfers',
        label: 'NYAX: Disable transfers',
        functionName: 'setTransfersEnabled',
        args: [false],
    },
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
    const chainId = useChainId();
    const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

    const [searchValue, setSearchValue] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAllocationModal, setShowAllocationModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showVestingModal, setShowVestingModal] = useState(false);
    const [showFolderEditModal, setShowFolderEditModal] = useState(false);
    const [showApproveFolderModal, setShowApproveFolderModal] = useState(false);
    const [showSendToFolderModal, setShowSendToFolderModal] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Factory folders state
    interface FactoryFolder {
        id: number;
        name: string;
        address: string;
        createdAt: number;
        totalAllocated: string;
        totalClaimed?: string;
        totalVested?: string;
        isPaused?: boolean;
        beneficiaryCount?: number;
        defaultPermissions?: number;
    }
    const [factoryFolders, setFactoryFolders] = useState<FactoryFolder[]>([]);
    const [factoryLoading, setFactoryLoading] = useState(false);
    const [permissionsLoading, setPermissionsLoading] = useState(false);

    // Treasury balance state
    const [treasuryBalance, setTreasuryBalance] = useState<string | null>(null);
    const [treasuryBalanceLoading, setTreasuryBalanceLoading] = useState(false);
    const [treasuryBalanceError, setTreasuryBalanceError] = useState<string | null>(null);

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
    });

    const [permissionsForm, setPermissionsForm] = useState({ folderId: 0, permissions: '' });
    const [vestingForm, setVestingForm] = useState({ folderId: 0, cliff: '0', duration: '365', revocable: true });
    const [folderEditForm, setFolderEditForm] = useState({ folderId: 0, permissions: '', cliffDays: '0', durationDays: '365', revocable: true });

    // Approve Folder Form
    const [approveFolderForm, setApproveFolderForm] = useState({ folderAddress: '' });

    // Send to Folder Form
    const [sendToFolderForm, setSendToFolderForm] = useState({ folderAddress: '', amount: '' });

    const [showProposalModal, setShowProposalModal] = useState(false);
    const [showBridgeModal, setShowBridgeModal] = useState(false);
    const [proposalForm, setProposalForm] = useState({
        title: '',
        description: '',
    });
    const [proposalActions, setProposalActions] = useState<ProposalAction[]>([{ target: '', value: '0', calldata: '0x' }]);
    const [proposalSubmitting, setProposalSubmitting] = useState(false);
    const [proposalAlert, setProposalAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

    // Pause Controls State
    const [treasuryPaused, setTreasuryPaused] = useState<boolean | null>(null);
    const [folderPaused, setFolderPaused] = useState<boolean | null>(null);
    const [tokenPaused, setTokenPaused] = useState<boolean | null>(null);
    const [pauseLoading, setPauseLoading] = useState<string | null>(null);
    const [pauseError, setPauseError] = useState<string | null>(null);

    const nyaxTokenAddress = CONTRACT_ADDRESSES.nyaxToken ?? '';
    const nyaxTokenInterface = useMemo(() => {
        try {
            return new ethers.Interface(CONTRACT_ABIS.nyaxToken ?? []);
        } catch (error) {
            console.error('Failed to init NYAX token interface', error);
            return null;
        }
    }, []);

    const REQUIRED_CHAIN_ID = 11155111;
    const onRequiredNetwork = chainId === REQUIRED_CHAIN_ID;

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
        () => factoryFolders.find((folder, index) => index === selectedFolderId) ?? null,
        [factoryFolders, selectedFolderId]
    );

    const filteredDisplayFolders = useMemo(() => {
        if (!searchValue.trim()) return factoryFolders;
        const query = searchValue.toLowerCase();
        return factoryFolders.filter(folder => folder.name.toLowerCase().includes(query));
    }, [factoryFolders, searchValue]);








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

    // Load factory folders on mount and when daoService changes
    useEffect(() => {
        if (daoService && !factoryLoading) {
            loadFactoryFolders();
        }
    }, [daoService]);

    useEffect(() => {
        refreshMultisigTransactions();
    }, [refreshMultisigTransactions]);

    const handleSelectFolder = (folderId: number) => {
        setSelectedFolderId(prev => (prev === folderId ? null : folderId));
        setFormError(null);
    };

    const handleSwitchNetwork = useCallback(async () => {
        if (onRequiredNetwork) return true;
        try {
            await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
            return true;
        } catch (error) {
            console.error('Failed to switch to Sepolia', error);
            return false;
        }
    }, [onRequiredNetwork, switchChainAsync]);

    useEffect(() => {
        if (isConnected && !onRequiredNetwork) {
            handleSwitchNetwork();
        }
    }, [isConnected, onRequiredNetwork, handleSwitchNetwork]);

    const ensureSepolia = useCallback(
        async (onFailure?: (message: string) => void) => {
            if (!isConnected) return false;
            if (onRequiredNetwork) return true;

            const switched = await handleSwitchNetwork();
            if (!switched) {
                onFailure?.('Switch to Ethereum Sepolia (chain ID 11155111) to continue.');
                return false;
            }
            return true;
        },
        [handleSwitchNetwork, isConnected, onRequiredNetwork]
    );

    const handleCreateFolder = async () => {
        if (!isConnected) {
            setFormError('Connect a wallet before creating folders.');
            return;
        }
        const onNetwork = await ensureSepolia(setFormError);
        if (!onNetwork) return;
        if (!newFolderName.trim()) {
            setFormError('Folder name is required');
            return;
        }
        if (!daoService) {
            setFormError('DAO service unavailable');
            return;
        }

        try {
            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Signer is required for folder creation');
            }

            // Get the connected wallet address as default folder admin
            const folderAdmin = await signer.getAddress();

            // Use NYAX token address as default (you can make this configurable)
            const tokenAddress = CONTRACT_ADDRESSES.nyaxToken;

            // Use the folderRegistryFactoryService to create folder
            await daoService.folderFactory.createFolder(
                newFolderName.trim(),
                tokenAddress,
                folderAdmin,
                signer
            );

            setNewFolderName('');
            setNewFolderPermissions('3');
            setCliffDays('30');
            setDurationDays('365');
            setNewFolderRevocable(true);
            setFormError(null);
            setShowAddModal(false);

            // Refresh folders after creation
            refresh();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to create folder');
        }
    };

    const handleTransferToggle = async () => {
        if (!isConnected) {
            setFormError('Connect a wallet to manage token transfers.');
            return;
        }
        const onNetwork = await ensureSepolia(setFormError);
        if (!onNetwork) return;
        if (!daoService || transfersEnabled === null) return;
        setTransfersLoading(true);
        setTransfersError(null);
        try {
            const signer = daoService.getSigner();
            await daoService.treasury.setTokenTransfersEnabled(!transfersEnabled, signer);
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
        const onNetwork = await ensureSepolia(setFormError);
        if (!onNetwork) return;
        if (!daoService || tokenMetrics.paused === null) return;
        setTokenActionLoading(true);
        setTokenGovernorMessage(null);
        setTokenGovernorError(null);
        try {
            const signer = daoService.getSigner();
            if (tokenMetrics.paused) {
                await daoService.treasury.unpauseToken(signer);
            } else {
                await daoService.treasury.pauseToken(signer);
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
        const onNetwork = await ensureSepolia(setTokenGovernorError);
        if (!onNetwork) return;
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
            const signer = daoService.getSigner();
            await daoService.treasury.mintGovernanceTokens(mintForm.to.trim(), mintForm.amount.trim(), signer);
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
        const onNetwork = await ensureSepolia(setTokenGovernorError);
        if (!onNetwork) return;
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
            const signer = daoService.getSigner();
            await daoService.treasury.burnGovernanceTokens(burnForm.from.trim(), burnForm.amount.trim(), signer);
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

    // Pause Controls Functions
    const refreshPauseStatus = useCallback(async () => {
        if (!daoService) {
            setPauseError('DAO service not available');
            return;
        }

        try {
            console.log('Refreshing pause status...');

            // Check each service individually for better error handling
            let treasuryStatus = false;
            let folderStatus = false;
            let tokenStatus = false;

            try {
                treasuryStatus = await daoService.treasury.isPaused();
                console.log('Treasury status:', treasuryStatus);
            } catch (err) {
                console.error('Failed to get treasury status:', err);
                treasuryStatus = false;
            }

            try {
                folderStatus = await daoService.folders.isFolderPaused();
                console.log('Folder status:', folderStatus);
            } catch (err) {
                console.error('Failed to get folder status:', err);
                folderStatus = false;
            }

            try {
                tokenStatus = await daoService.governance.isTokenPaused();
                console.log('Token status:', tokenStatus);
            } catch (err) {
                console.error('Failed to get token status:', err);
                tokenStatus = false;
            }

            setTreasuryPaused(treasuryStatus);
            setFolderPaused(folderStatus);
            setTokenPaused(tokenStatus);
            setPauseError(null);
            console.log('Pause status updated successfully');
        } catch (err) {
            console.error('Failed to load pause status', err);
            setPauseError('Unable to load pause status: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [daoService]);

    useEffect(() => {
        refreshPauseStatus();
    }, [refreshPauseStatus]);

    const handleTreasuryPause = async () => {
        if (!isConnected) {
            setPauseError('Connect wallet to manage treasury pause state');
            return;
        }
        const onNetwork = await ensureSepolia(setPauseError);
        if (!onNetwork) return;
        if (!daoService || treasuryPaused === null) return;

        const signer = daoService.getSigner();
        if (!signer) {
            setPauseError('No signer available');
            return;
        }

        setPauseLoading('treasury');
        setPauseError(null);
        try {
            if (treasuryPaused) {
                await daoService.treasury.unpauseTreasury(signer);
            } else {
                await daoService.treasury.pauseTreasury(signer);
            }
            await refreshPauseStatus();
        } catch (err) {
            console.error('Failed to toggle treasury pause', err);
            setPauseError(err instanceof Error ? err.message : 'Failed to toggle treasury pause');
        } finally {
            setPauseLoading(null);
        }
    };

    const handleFolderPause = async () => {
        if (!isConnected) {
            setPauseError('Connect wallet to manage folder pause state');
            return;
        }
        const onNetwork = await ensureSepolia(setPauseError);
        if (!onNetwork) return;
        if (!daoService || folderPaused === null) return;

        const signer = daoService.getSigner();
        if (!signer) {
            setPauseError('No signer available');
            return;
        }

        setPauseLoading('folder');
        setPauseError(null);
        try {
            if (folderPaused) {
                await daoService.folders.unpauseFolder(signer);
            } else {
                await daoService.folders.pauseFolder(signer);
            }
            await refreshPauseStatus();
        } catch (err) {
            console.error('Failed to toggle folder pause', err);
            setPauseError(err instanceof Error ? err.message : 'Failed to toggle folder pause');
        } finally {
            setPauseLoading(null);
        }
    };

    const handleTokenPause = async () => {
        if (!isConnected) {
            setPauseError('Connect wallet to manage token pause state');
            return;
        }
        const onNetwork = await ensureSepolia(setPauseError);
        if (!onNetwork) return;
        if (!daoService || tokenPaused === null) return;

        const signer = daoService.getSigner();
        if (!signer) {
            setPauseError('No signer available');
            return;
        }

        setPauseLoading('token');
        setPauseError(null);
        try {
            // The pauseToken method internally calls togglePause(), so we use it for both pause and unpause
            await daoService.governance.pauseToken(signer);
            await refreshPauseStatus();
        } catch (err) {
            console.error('Failed to toggle token pause', err);
            setPauseError(err instanceof Error ? err.message : 'Failed to toggle token pause');
        } finally {
            setPauseLoading(null);
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
        if (!await ensureSepolia(setFormError)) return;
        if (!allocationForm.folderId || !allocationForm.account || !allocationForm.amount) {
            setFormError('Folder, address, and amount are required');
            return;
        }

        try {
            if (!daoService) {
                throw new Error('DAO service unavailable');
            }

            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Signer is required for beneficiary operations');
            }

            const amount = ethers.parseEther(allocationForm.amount);
            const start = allocationForm.startDate
                ? BigInt(Math.floor(new Date(allocationForm.startDate).getTime() / 1000))
                : BigInt(Math.floor(Date.now() / 1000));
            const cliff = BigInt(Number(allocationForm.cliffDays || '0') * 86400);
            const duration = BigInt(Number(allocationForm.durationDays || '365') * 86400);

            // Check if this is a factory folder by looking up the folder address
            const folder = factoryFolders.find(f => f.id === allocationForm.folderId);
            if (!folder) {
                throw new Error('Folder not found');
            }

            // For factory folders, interact directly with the folder contract using FolderEscrowService
            if (folder.address) {
                // Import and create FolderEscrowService for this specific folder
                const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
                const { ethers: ethersLib } = await import('ethers');

                const ethereum = (window as any).ethereum;
                if (!ethereum) {
                    throw new Error('No Ethereum provider found');
                }

                const browserProvider = new ethersLib.BrowserProvider(ethereum);
                const folderEscrow = new FolderEscrowService(folder.address, browserProvider);

                await folderEscrow.addBeneficiary(
                    allocationForm.account,
                    amount,
                    start,
                    cliff,
                    duration,
                    signer
                );

                // Refresh folder stats after adding beneficiary
                await loadFactoryFolders();
            } else {
                // Fallback to old service for non-factory folders
                if (!daoService.folderEscrow) {
                    throw new Error('FolderEscrow service not available - contract address not configured');
                }

                await daoService.folderEscrow.addBeneficiary(
                    allocationForm.account,
                    amount,
                    start,
                    cliff,
                    duration,
                    signer
                );
            }
            setFormError(null);
            setShowAllocationModal(false);
            setAllocationForm({
                folderId: 0,
                account: '',
                amount: '',
                startDate: '',
                cliffDays: '0',
                durationDays: '365',
            });
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to add beneficiary');
        }
    };

    const loadFactoryFolders = async () => {
        if (!daoService) {
            console.warn('DAO service unavailable for loading factory folders');
            return;
        }

        setFactoryLoading(true);
        try {
            // Get folders from factory service
            const factoryFoldersList = await daoService.folderFactory.getAllFolders();
            console.log('Loading folders from factory service:', factoryFoldersList);

            // Get detailed folder information
            const folderDetails = await daoService.folderFactory.getFoldersWithDetails();
            console.log('Factory folder details:', folderDetails);

            // Map to FactoryFolder format with basic info
            const enhancedFolders: FactoryFolder[] = folderDetails.map((folder: any, index: number) => ({
                id: index,
                name: folder.name,
                address: folder.address,
                createdAt: Number(folder.createdAt),
                totalAllocated: '0',
                totalClaimed: '0',
                totalVested: '0',
                isPaused: false,
                beneficiaryCount: 0
            }));

            setFactoryFolders(enhancedFolders);
            console.log(`Successfully loaded ${enhancedFolders.length} folders from factory`);
        } catch (err) {
            console.error('Failed to load factory folders:', err);
            setFormError(err instanceof Error ? err.message : 'Failed to load factory folders');
        } finally {
            setFactoryLoading(false);
        }
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

    const handleRevoke = async (folderId: number, account: string) => {
        if (!await ensureSepolia(setFormError)) return;
        try {
            await revokeAllocation(folderId, account);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to revoke allocation');
        }
    };

    const handleApproveFolder = async () => {
        if (!await ensureSepolia(setFormError)) return;
        if (!approveFolderForm.folderAddress) {
            setFormError('Folder address is required');
            return;
        }

        try {
            if (!daoService) {
                throw new Error('DAO service unavailable');
            }

            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Signer is required for approve folder');
            }

            await daoService.treasury.approveFolder(approveFolderForm.folderAddress, signer);
            setFormError(null);
            setShowApproveFolderModal(false);
            setApproveFolderForm({ folderAddress: '' });
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to approve folder');
        }
    };

    const handleSendToFolder = async () => {
        if (!await ensureSepolia(setFormError)) return;
        if (!sendToFolderForm.folderAddress || !sendToFolderForm.amount) {
            setFormError('Folder address and amount are required');
            return;
        }

        try {
            if (!daoService) {
                throw new Error('DAO service unavailable');
            }

            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Signer is required for send to folder');
            }

            const amount = ethers.parseEther(sendToFolderForm.amount);
            await daoService.treasury.sendToFolder(sendToFolderForm.folderAddress, amount, signer);
            setFormError(null);
            setShowSendToFolderModal(false);
            setSendToFolderForm({ folderAddress: '', amount: '' });
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to send to folder');
        }
    };

    const handlePermissionsUpdate = async () => {
        if (!daoService) {
            setFormError('DAO service unavailable');
            return;
        }

        try {
            setPermissionsLoading(true);
            setFormError(null);

            await updateFolder(permissionsForm.folderId, {
                permissions: Number(permissionsForm.permissions)
            });

            setShowPermissionsModal(false);
            setPermissionsForm({ folderId: 0, permissions: '' });
            refresh();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to update permissions');
        } finally {
            setPermissionsLoading(false);
        }
    };

    const handleVestingUpdate = async () => {
        if (!vestingForm.folderId) return;
        if (!await ensureSepolia(setFormError)) return;
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

    const addProposalAction = () => {
        setProposalActions(prev => [...prev, { target: '', value: '0', calldata: '0x' }]);
    };

    const removeProposalAction = (index: number) => {
        setProposalActions(prev => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
    };

    const updateProposalAction = (index: number, field: keyof ProposalAction, value: string) => {
        setProposalActions(prev => prev.map((action, i) => (i === index ? { ...action, [field]: value } : action)));
    };

    const applyTokenFunctionPreset = (index: number, key: string) => {
        const preset = TOKEN_FUNCTION_PRESETS.find(entry => entry.key === key);
        if (!preset) return;
        if (!nyaxTokenAddress) {
            setProposalAlert({ type: 'error', message: 'NYAX token address not configured.' });
            return;
        }
        if (!nyaxTokenInterface) {
            setProposalAlert({ type: 'error', message: 'Unable to encode NYAX token function.' });
            return;
        }
        try {
            const data = nyaxTokenInterface.encodeFunctionData(preset.functionName, preset.args);
            setProposalActions(prev =>
                prev.map((action, i) =>
                    i === index
                        ? {
                            ...action,
                            target: nyaxTokenAddress,
                            value: '0',
                            calldata: data,
                        }
                        : action,
                ),
            );
            setProposalAlert(null);
        } catch (error) {
            console.error('Failed to apply token preset', error);
            setProposalAlert({ type: 'error', message: 'Failed to encode NYAX token calldata.' });
        }
    };

    const handleCreateProposal = async () => {
        if (!isConnected) {
            setProposalAlert({ type: 'error', message: 'Connect a wallet to submit proposals.' });
            return;
        }
        if (!daoService) {
            setProposalAlert({ type: 'error', message: 'DAO service unavailable. Try reloading.' });
            return;
        }
        if (!await ensureSepolia((msg) => setProposalAlert({ type: 'error', message: msg }))) {
            return;
        }
        if (!proposalForm.title.trim() || !proposalForm.description.trim()) {
            setProposalAlert({ type: 'error', message: 'Title and description are required.' });
            return;
        }
        if (proposalActions.some(action => !action.target.trim())) {
            setProposalAlert({ type: 'error', message: 'Each action needs a target contract address.' });
            return;
        }

        setProposalSubmitting(true);
        setProposalAlert(null);

        try {
            const targets = proposalActions.map(action => action.target.trim());
            const values = proposalActions.map(action => (action.value.trim() ? action.value.trim() : '0'));
            const calldatas = proposalActions.map(action => {
                const data = action.calldata.trim();
                if (!data) return '0x';
                return data.startsWith('0x') ? data : `0x${data}`;
            });
            const description = `# ${proposalForm.title.trim()}\n\n${proposalForm.description.trim()}`;
            const proposalId = await daoService.governance.createProposal(targets, values, calldatas, description);
            setProposalAlert({ type: 'success', message: proposalId ? `Proposal submitted (ID: ${proposalId})` : 'Proposal submitted successfully.' });
            setProposalForm({ title: '', description: '' });
            setProposalActions([{ target: '', value: '0', calldata: '0x' }]);
            setShowProposalModal(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create proposal';
            setProposalAlert({ type: 'error', message });
        } finally {
            setProposalSubmitting(false);
        }
    };

    const renderFolderCard = (folder: FactoryFolder) => {
        const memberCount = membersByFolder[folder.id]?.length ?? 0;
        const permissions = describePermissions(folder.defaultPermissions || 0);

        // Calculate vesting progress
        const calculateVestingProgress = () => {
            const totalAllocated = parseFloat(folder.totalAllocated || '0') || 0;
            const totalClaimed = parseFloat(folder.totalClaimed || '0') || 0;

            if (totalAllocated === 0) return { percentage: 0, vested: 0, total: 0 };

            const percentage = totalAllocated > 0 ? (totalClaimed / totalAllocated) * 100 : 0;

            return {
                percentage: Math.min(percentage, 100),
                vested: totalClaimed,
                total: totalAllocated
            };
        };

        const vestingProgress = calculateVestingProgress();

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
                            {folder.isPaused && (
                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-200">
                                    <Lock className="w-3 h-3" /> Locked
                                </span>
                            )}
                            {folder.address && (
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-gray-400 text-sm font-mono">
                                        {folder.address.slice(0, 6)}...{folder.address.slice(-4)}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(folder.address);
                                        }}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        title="Copy address"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </h3>
                        <div className="text-right">
                            <div className="text-sm text-gray-400">Members</div>
                            <div className="text-lg font-semibold text-white">{folder.beneficiaryCount}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Allocated</span>
                        <span className="text-white font-semibold">{formatNumber(folder.totalAllocated)} NYAX</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Vesting Progress</span>
                            <span className="text-gray-300 text-sm">{vestingProgress.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${vestingProgress.percentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>{formatNumber(vestingProgress.vested.toString())} NYAX vested</span>
                            <span>{formatNumber(vestingProgress.total.toString())} NYAX total</span>
                        </div>
                    </div>
                    {folder.createdAt && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Created</span>
                            <span className="text-gray-300 text-sm">
                                {new Date(folder.createdAt * 1000).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen  text-white">
            <div className="max-w-7xl mx-auto space-y-10 px-4 py-10">
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-8 sm:px-8 sm:py-10 shadow-[0_25px_70px_rgba(7,13,30,0.55)]">
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
                            <div className="flex flex-wrap gap-3 text-xs">
                                <span className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${isConnected ? 'border-emerald-400/40 text-emerald-200' : 'border-red-400/30 text-red-200'}`}>
                                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    {isConnected ? 'Wallet connected' : 'Connect wallet to act'}
                                </span>
                                <span className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${onRequiredNetwork ? 'border-indigo-400/40 text-indigo-100' : 'border-amber-400/40 text-amber-100'}`}>
                                    <span className={`h-2 w-2 rounded-full ${onRequiredNetwork ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                                    {onRequiredNetwork ? 'Sepolia network detected' : 'Switch to Sepolia to transact'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 w-full max-w-sm">

                            <div className="flex gap-3 flex-wrap">
                                {!isConnected && <ConnectWalletButton className="flex-1 min-w-[140px] px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" />}
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
                                        <Gavel className="w-4 h-4" /> Create Proposal
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
                            { label: 'Folders live', value: factoryFolders.length > 0 ? factoryFolders.length : summary.folderCount, accent: 'bg-blue-500/15 text-blue-200' },
                            { label: 'Action queue', value: `${filteredDisplayFolders.length} folders`, accent: 'bg-purple-500/15 text-purple-200' },
                        ].map(card => (
                            <div key={card.label} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">{card.label}</p>
                                <p className="text-2xl font-semibold mt-2">{card.value}</p>
                                <span className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs ${card.accent}`}>
                                    {card.label === 'Action queue' ? 'Live folders in view' : card.label === 'Folders live' && factoryFolders.length > 0 ? 'Factory service' : 'Real-time'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>


                {!isConnected && (
                    <div className={`rounded-2xl border border-yellow-500 /30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200`}>
                        Wallet connection is required to create, edit, or revoke allocations.
                    </div>
                )}
                {isConnected && !onRequiredNetwork && (
                    <div className="rounded-2xl border border-amber-300/40 bg-amber-400/10 px-4 py-4 text-sm text-amber-100 flex flex-col gap-3">
                        <div className="font-semibold text-amber-200">Action required: switch to Ethereum Sepolia</div>
                        <p>Admin tools execute against Sepolia contracts. Please switch your wallet network before changing folders, minting, or submitting proposals.</p>
                        <div>
                            <button
                                onClick={handleSwitchNetwork}
                                disabled={isSwitchingChain}
                                className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSwitchingChain ? 'Switching…' : 'Switch to Sepolia'}
                            </button>
                        </div>
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
                        <button
                            className={TOOL_BUTTON_CLASSES}
                            onClick={() => {
                                refresh();
                                loadFactoryFolders();
                            }}
                            disabled={loading || factoryLoading}
                        >
                            <Loader2 className={`w-5 h-5 ${(loading || factoryLoading) ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </button>


                        <button
                            onClick={handleTreasuryPause}
                            disabled={pauseLoading === 'treasury' || treasuryPaused === null || !isConnected}
                            className={`w-full px-4 py-2 rounded-lg border font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${treasuryPaused
                                ? 'border-green-400/40 text-green-200 hover:bg-green-500/10'
                                : 'border-red-400/40 text-red-200 hover:bg-red-500/10'
                                }`}
                        >
                            {pauseLoading === 'treasury' ? 'Processing...' :
                                treasuryPaused ? 'Unpause Treasury' : 'Pause Treasury'}
                        </button>

                        <button
                            className="flex-1 min-w-[140px] px-5 py-3 rounded-2xl border border-white/20 text-white/80 hover:bg-white/10 transition"
                            onClick={() => setShowSendToFolderModal(true)}
                            disabled={!isConnected || loading}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <PlusIcon className="w-4 h-4" /> Fund Folder
                            </div>
                        </button>
                        <button
                            className="flex-1 min-w-[140px] px-5 py-3 rounded-2xl border border-white/20 text-white/80 hover:bg-white/10 transition"
                            onClick={() => setShowAllocationModal(true)}
                            disabled={!isConnected || loading}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <UserPlus2 className="w-4 h-4" /> Add Wallets to Folder
                            </div>
                        </button>
                        <button
                            className="flex-1 min-w-[140px] px-5 py-3 rounded-2xl border border-white/20 text-white/80 hover:bg-white/10 transition"
                            onClick={() => setShowApproveFolderModal(true)}
                            disabled={!isConnected || loading}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Approve Folder
                            </div>
                        </button>
                        <button
                            className="flex-1 min-w-[140px] px-5 py-3 rounded-2xl border border-white/20 text-white/80 hover:bg-white/10 transition"
                            onClick={() => setShowSendToFolderModal(true)}
                            disabled={!isConnected || loading}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4" /> Send to Folder
                            </div>
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
                            {treasuryBalance && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-gray-400 text-sm">Treasury Balance:</span>
                                    <span className="text-white font-semibold">{formatNumber(treasuryBalance)} NYAX</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowSendToFolderModal(true)}
                            disabled={!isConnected}
                            className="px-6 py-3 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 font-semibold text-white disabled:opacity-40 hover:from-green-600 hover:to-emerald-700 transition-all"
                        >
                            Fund Folders
                        </button>
                    </div>
                    {bridgeStatus && (
                        <div className={`mt-4 px-4 py-3 rounded-xl border ${bridgeStatus.type === 'success' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-red-400/40 bg-red-400/10 text-red-200'}`}>
                            {bridgeStatus.message}
                        </div>
                    )}
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
                                <h2 className="text-2xl font-semibold">Token folders (Factory Service)</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                {error && <span className="text-red-400 text-sm">{error}</span>}
                                <button
                                    onClick={loadFactoryFolders}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition"
                                >
                                    <Loader2 className="w-4 h-4" /> Load Factory Folders
                                </button>
                            </div>
                        </div>

                        {filteredDisplayFolders.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-gray-400">
                                {factoryFolders.length === 0 ? (
                                    <div>
                                        <p className="mb-2">No folders loaded yet</p>
                                        <p className="text-sm">Click "Load Factory Folders" to fetch folders from the factory service</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="mb-2">No folders matched your search criteria</p>
                                        <p className="text-sm">Try adjusting your search filters</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {factoryFolders.map(folder => renderFolderCard(folder))}
                            </div>
                        )}

                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <h3 className="text-lg font-semibold mb-4">Platform telemetry</h3>
                            <div className="space-y-3 text-sm text-gray-300">
                                <div className="flex justify-between">
                                    <span>Allocated NYAX</span>
                                    <div className="text-right">
                                        <span className="text-white font-semibold">{formatNumber(summary.totalAllocated)} NYAX</span>
                                        <div className="text-xs text-green-400">Real-time</div>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span>Active members</span>
                                    <div className="text-right">
                                        <span className="text-yellow-300 font-semibold">{formatNumber(summary.totalMembers)}</span>
                                        <div className="text-xs text-green-400">Real-time</div>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span>Folders live</span>
                                    <div className="text-right">
                                        <span className="text-green-300 font-semibold">{factoryFolders.length || summary.folderCount}</span>
                                        <div className="text-xs text-green-400">Real-time</div>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span>Action queue</span>
                                    <div className="text-right">
                                        <span className="text-blue-300 font-semibold">{factoryFolders.length || summary.folderCount} folders</span>
                                        <div className="text-xs text-green-400">Real-time</div>
                                    </div>
                                </div>
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
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full mx-4 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Create New Folder</h3>
                                <p className="text-gray-400 text-sm">Create a new folder using the FolderFactory contract</p>
                            </div>

                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Folder Name *</label>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        placeholder="Enter folder name..."
                                        className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-500"
                                    />
                                    <p className="text-gray-500 text-xs mt-1">Descriptive name for the folder</p>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Token Contract *</label>
                                    <div className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white">
                                        <span className="text-gray-300">NYAX Token</span>
                                        <span className="text-gray-500 text-xs ml-2 font-mono">{CONTRACT_ADDRESSES.nyaxToken?.slice(0, 6)}...{CONTRACT_ADDRESSES.nyaxToken?.slice(-4)}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">Token used for folder allocations</p>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Folder Admin *</label>
                                    <div className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white">
                                        <span className="text-gray-300">Connected Wallet</span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">Your wallet will be set as folder administrator</p>
                                </div>
                            </div>

                            {/* Contract Information */}
                            <div className="space-y-4">
                                <h4 className="text-white font-medium mb-3">Contract Information</h4>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-sm">Factory Contract</span>
                                        <span className="text-gray-400 text-xs font-mono">{CONTRACT_ADDRESSES.folderEscrowFactory?.slice(0, 6)}...{CONTRACT_ADDRESSES.folderEscrowFactory?.slice(-4)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-sm">Network</span>
                                        <span className="text-blue-400 text-xs">Sepolia Testnet</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-sm">Governance Required</span>
                                        <span className="text-yellow-400 text-xs">Yes</span>
                                    </div>
                                </div>
                            </div>

                            {formError && (
                                <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {formError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleCreateFolder}
                                    disabled={actionPending || !isConnected || !newFolderName.trim()}
                                >
                                    {actionPending ? 'Creating...' : 'Create Folder'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {showBridgeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 shadow-2xl">
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Treasury Operations</p>
                                    <h2 className="mt-1 text-2xl font-bold text-white">Treasury → Folder</h2>
                                </div>
                                <button onClick={() => setShowBridgeModal(false)} className="text-gray-400 hover:text-white">
                                    ✕
                                </button>
                            </div>

                            {bridgeStatus && (
                                <div className={`mb-4 rounded-xl border p-4 ${bridgeStatus.type === 'success'
                                    ? 'border-green-400/40 bg-green-400/10 text-green-200'
                                    : 'border-red-400/40 bg-red-400/10 text-red-200'
                                    }`}>
                                    {bridgeStatus.message}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs text-gray-400">Token Address</label>
                                    <input
                                        type="text"
                                        value={bridgeForm.tokenAddress}
                                        onChange={e => setBridgeForm(prev => ({ ...prev, tokenAddress: e.target.value }))}
                                        placeholder="0x... (ERC20 token contract)"
                                        className="mt-1 w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">Folder Address</label>
                                    <input
                                        type="text"
                                        value={bridgeForm.folderAddress}
                                        onChange={e => setBridgeForm(prev => ({ ...prev, folderAddress: e.target.value }))}
                                        placeholder="0x... (destination folder contract)"
                                        className="mt-1 w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">Amount</label>
                                    <input
                                        type="text"
                                        value={bridgeForm.amount}
                                        onChange={e => setBridgeForm(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="Token amount to bridge"
                                        className="mt-1 w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">Reference ID (optional)</label>
                                    <input
                                        type="text"
                                        value={bridgeForm.referenceId}
                                        onChange={e => setBridgeForm(prev => ({ ...prev, referenceId: e.target.value }))}
                                        placeholder="Transaction reference or memo"
                                        className="mt-1 w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowBridgeModal(false)}
                                        className="flex-1 px-4 py-3 rounded-2xl border border-white/20 text-white hover:bg-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!isConnected) {
                                                setBridgeStatus({ type: 'error', message: 'Connect wallet to bridge tokens' });
                                                return;
                                            }

                                            if (!await ensureSepolia((msg) => setBridgeStatus({ type: 'error', message: msg }))) {
                                                return;
                                            }

                                            if (!bridgeForm.tokenAddress || !bridgeForm.folderAddress || !bridgeForm.amount) {
                                                setBridgeStatus({ type: 'error', message: 'Token address, folder address, and amount required' });
                                                return;
                                            }

                                            setBridgeLoading(true);
                                            setBridgeStatus(null);

                                            try {
                                                if (!daoService) {
                                                    throw new Error('DAO service unavailable');
                                                }



                                                setBridgeStatus({
                                                    type: 'success',
                                                    message: `Successfully bridged ${bridgeForm.amount} tokens to folder`
                                                });

                                                setBridgeForm({ tokenAddress: '', folderAddress: '', amount: '', referenceId: '' });

                                                setTimeout(() => {
                                                    setShowBridgeModal(false);
                                                    refresh();
                                                }, 2000);
                                            } catch (err) {
                                                console.error('Bridge failed', err);
                                                setBridgeStatus({
                                                    type: 'error',
                                                    message: err instanceof Error ? err.message : 'Bridge transaction failed'
                                                });
                                            } finally {
                                                setBridgeLoading(false);
                                            }
                                        }}
                                        disabled={bridgeLoading || !isConnected}
                                        className="flex-1 px-4 py-3 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 font-semibold disabled:opacity-40"
                                    >
                                        {bridgeLoading ? 'Bridging...' : 'Execute Bridge'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showAllocationModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-2xl w-full mx-4 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Add Wallet</h3>
                                <p className="text-gray-400 text-sm mt-2">Add a new Wallet to a folder with vesting schedule</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block">Folder</label>
                                        <select
                                            value={allocationForm.folderId}
                                            onChange={e => setAllocationForm(prev => ({ ...prev, folderId: Number(e.target.value) }))}
                                            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                        >
                                            <option value={0}>Select a folder</option>
                                            {factoryFolders.map(folder => (
                                                <option key={folder.id} value={folder.id}>
                                                    {folder.name || 'Unnamed Folder'} (ID: {folder.address})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-gray-500 text-xs mt-1">Target folder for beneficiary</p>
                                    </div>

                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block">Beneficiary Address</label>
                                        <input
                                            type="text"
                                            value={allocationForm.account}
                                            onChange={e => setAllocationForm(prev => ({ ...prev, account: e.target.value }))}
                                            placeholder="0x..."
                                            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                        />
                                        <p className="text-gray-500 text-xs mt-1">Wallet address of the beneficiary</p>
                                    </div>

                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block">Amount (NYAX)</label>
                                        <input
                                            type="text"
                                            value={allocationForm.amount}
                                            onChange={e => setAllocationForm(prev => ({ ...prev, amount: e.target.value }))}
                                            placeholder="1000"
                                            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                        />
                                        <p className="text-gray-500 text-xs mt-1">Token allocation amount</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block">Start Date</label>
                                        <input
                                            type="date"
                                            value={allocationForm.startDate}
                                            onChange={e => setAllocationForm(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                        />
                                        <p className="text-gray-500 text-xs mt-1">Vesting start date (optional)</p>
                                    </div>

                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block">Cliff Period (days)</label>
                                        <input
                                            type="number"
                                            value={allocationForm.cliffDays}
                                            onChange={e => setAllocationForm(prev => ({ ...prev, cliffDays: e.target.value }))}
                                            placeholder="0"
                                            min="0"
                                            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                        />
                                        <p className="text-gray-500 text-xs mt-1">Days before vesting begins</p>
                                    </div>

                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block">Duration (days)</label>
                                        <input
                                            type="number"
                                            value={allocationForm.durationDays}
                                            onChange={e => setAllocationForm(prev => ({ ...prev, durationDays: e.target.value }))}
                                            placeholder="365"
                                            min="1"
                                            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                        />
                                        <p className="text-gray-500 text-xs mt-1">Total vesting duration</p>
                                    </div>
                                </div>
                            </div>

                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-red-400 text-sm">{formError}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                    onClick={() => setShowAllocationModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleSetAllocation}
                                    disabled={actionPending || !isConnected || !allocationForm.folderId || !allocationForm.account || !allocationForm.amount}
                                >
                                    {actionPending ? 'Adding Beneficiary...' : 'Add Beneficiary'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showApproveFolderModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full mx-4 space-y-4">
                            <h3 className="text-2xl font-bold text-white">Approve Folder</h3>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Folder Address</label>
                                <input
                                    type="text"
                                    value={approveFolderForm.folderAddress}
                                    onChange={e => setApproveFolderForm(prev => ({ ...prev, folderAddress: e.target.value }))}
                                    placeholder="0x..."
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                />
                            </div>
                            {formError && <p className="text-red-400 text-sm">{formError}</p>}
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg" onClick={() => setShowApproveFolderModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
                                    onClick={handleApproveFolder}
                                    disabled={actionPending || !isConnected}
                                >
                                    {actionPending ? 'Approving...' : 'Approve Folder'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showSendToFolderModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full mx-4 space-y-4">
                            <h3 className="text-2xl font-bold text-white">Fund Folder</h3>
                            <p className="text-gray-400 text-sm">Send NYAX tokens from treasury to an approved folder</p>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Folder Address</label>
                                <input
                                    type="text"
                                    value={sendToFolderForm.folderAddress}
                                    onChange={e => setSendToFolderForm(prev => ({ ...prev, folderAddress: e.target.value }))}
                                    placeholder="0x..."
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                />
                                <p className="text-gray-500 text-xs mt-1">Enter the approved folder contract address</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Amount (NYAX)</label>
                                <input
                                    type="text"
                                    value={sendToFolderForm.amount}
                                    onChange={e => setSendToFolderForm(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="Amount to send"
                                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                />
                                <p className="text-gray-500 text-xs mt-1">Amount of NYAX tokens to transfer</p>
                            </div>
                            {formError && <p className="text-red-400 text-sm">{formError}</p>}
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg" onClick={() => setShowSendToFolderModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
                                    onClick={handleSendToFolder}
                                    disabled={actionPending || !isConnected}
                                >
                                    {actionPending ? 'Funding...' : 'Fund Folder'}
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
                                    disabled={permissionsLoading || !isConnected}
                                >
                                    {permissionsLoading ? 'Saving...' : 'Update Permissions'}
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
                        <div className="bg-slate-900 rounded-2xl p-8 border border-white/20 max-w-4xl w-full mx-4 space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-purple-300/70">Governance</p>
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
                                        <Gavel className="w-6 h-6 text-purple-300" />
                                        Draft proposal payload
                                    </h3>
                                </div>
                                <button className="text-gray-400 hover:text-white" onClick={() => setShowProposalModal(false)}>
                                    ✕
                                </button>
                            </div>

                            {proposalAlert && (
                                <div
                                    className={`rounded-2xl border px-4 py-3 text-sm ${proposalAlert.type === 'success'
                                        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                                        : 'border-red-400/40 bg-red-400/10 text-red-200'
                                        }`}
                                >
                                    {proposalAlert.message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Proposal title</label>
                                    <input
                                        type="text"
                                        value={proposalForm.title}
                                        onChange={e => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enable transfers, upgrade contracts…"
                                        className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Description</label>
                                    <textarea
                                        value={proposalForm.description}
                                        onChange={e => setProposalForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={4}
                                        placeholder="Explain motivation, execution steps, and expected results. Markdown supported."
                                        className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Actions</p>
                                        <p className="text-sm text-gray-500">Each action represents one contract call bundled inside the proposal.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addProposalAction}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                                    >
                                        <Plus size={14} /> Add action
                                    </button>
                                </div>

                                {proposalActions.map((action, index) => (
                                    <div key={`proposal-action-${index}`} className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-4">
                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                            <span>Action {index + 1}</span>
                                            {proposalActions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeProposalAction(index)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">Quick presets</label>
                                            <select
                                                defaultValue=""
                                                onChange={event => {
                                                    const presetKey = event.target.value;
                                                    if (!presetKey) return;
                                                    applyTokenFunctionPreset(index, presetKey);
                                                    event.currentTarget.value = '';
                                                }}
                                                className="mt-1 w-full rounded-xl border border-white/10 bg-gray-900/40 px-3 py-2 text-sm text-white"
                                            >
                                                <option value="" disabled>
                                                    Use NYAX token function…
                                                </option>
                                                {TOKEN_FUNCTION_PRESETS.map(preset => (
                                                    <option key={preset.key} value={preset.key}>
                                                        {preset.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">Target contract</label>
                                                <input
                                                    type="text"
                                                    value={action.target}
                                                    onChange={e => updateProposalAction(index, 'target', e.target.value)}
                                                    placeholder="0x…"
                                                    className="w-full rounded-xl border border-white/10 bg-gray-900/40 px-3 py-2 text-sm text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">ETH value</label>
                                                <input
                                                    type="text"
                                                    value={action.value}
                                                    onChange={e => updateProposalAction(index, 'value', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full rounded-xl border border-white/10 bg-gray-900/40 px-3 py-2 text-sm text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">Calldata</label>
                                                <input
                                                    type="text"
                                                    value={action.calldata}
                                                    onChange={e => updateProposalAction(index, 'calldata', e.target.value)}
                                                    placeholder="0x"
                                                    className="w-full rounded-xl border border-white/10 bg-gray-900/40 px-3 py-2 text-sm text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    className="w-full px-4 py-3 rounded-2xl bg-linear-to-r from-indigo-500 via-blue-500 to-purple-500 font-semibold disabled:opacity-50"
                                    onClick={handleCreateProposal}
                                    disabled={proposalSubmitting || !isConnected}
                                >
                                    {proposalSubmitting ? 'Submitting…' : 'Create proposal'}
                                </button>
                                {!isConnected && (
                                    <div className="rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-200">
                                        Connect your wallet to create proposals.
                                    </div>
                                )}
                                {!onRequiredNetwork && isConnected && (
                                    <div className="rounded-2xl border border-orange-400/40 bg-orange-400/10 p-4 text-sm text-orange-200">
                                        Switch to Ethereum Sepolia (chain ID 11155111) to submit this proposal.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>


    );
}