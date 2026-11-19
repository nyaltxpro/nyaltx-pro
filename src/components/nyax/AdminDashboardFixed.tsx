"use client";

import ConnectWalletButton from '@/components/ConnectWalletButton';
import { useDAOService } from '@/hooks/useDAOService';
import { useFolderRegistry } from '@/hooks/useFolderRegistry';
import { PROPOSAL_FUNCTION_PRESETS, encodeProposalPreset } from '@/lib/proposalFunctionPresets';
import { CONTRACT_ADDRESSES } from '@/services/contracts';
import { FolderInfo, MultisigTransaction } from '@/services/contracts/types';
import { useAppKitAccount } from '@reown/appkit/react';
import { Drawer } from '@/components/reui/drawer';
import { Dialog } from '@/components/reui/dialog';
import { Alert } from '@/components/reui/alert';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/reui/button';
import { Card } from '@/components/reui/card';
import { Field } from '@/components/reui/field';
import { Filters } from '@/components/reui/filters';
import { IconTile } from '@/components/reui/icon-tile';
import { Input } from '@/components/reui/input';
import { NativeSelect } from '@/components/reui/native-select';
import { ethers } from 'ethers';
import {
    Activity,
    CircleDollarSign,
    Copy,
    FolderOpen,
    Gavel,
    Loader2,
    Lock,
    Plus,
    RefreshCw,
    Shield,
    UsersRound,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
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

const formatNumber = (value: string | number) => {
    const numeric = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(numeric)) return '0';

    // Show 0 for actual zero
    if (numeric === 0) return '0';

    // Handle very small non-zero numbers with more decimal places
    if (numeric > 0 && numeric < 0.01) {
        // Show up to 18 decimal places for small amounts (to handle wei precision)
        return numeric.toFixed(18).replace(/\.?0+$/, '');
    }

    // Handle very large numbers with scientific notation
    if (numeric >= 1e9) {
        return numeric.toExponential(2);
    }

    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(numeric);
};

const describePermissions = (mask: number) =>
    PERMISSION_FLAGS.filter(flag => (mask & flag.bit) !== 0).map(flag => flag.label);

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

    const { daoService, ensureSigner, hasSigner } = useDAOService();

    const { isConnected: isEvmConnected, address: wagmiAddress } = useAccount();
    const { isConnected: isAppKitConnected, address: appKitAddress } = useAppKitAccount();
    const isConnected = Boolean(
      (isEvmConnected && wagmiAddress) || (isAppKitConnected && appKitAddress)
    );
    const chainId = useChainId();
    const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

    const [searchValue, setSearchValue] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [localActionPending, setLocalActionPending] = useState(false);
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
        vestingStart?: number;
        vestingCliff?: number;
        vestingDuration?: number;
        folderBalance?: string;
    }
    const [factoryFolders, setFactoryFolders] = useState<FactoryFolder[]>([]);
    const [factoryLoading, setFactoryLoading] = useState(false);
    const [permissionsLoading, setPermissionsLoading] = useState(false);

    // Token statistics from FolderFactory
    const [tokenStats, setTokenStats] = useState<{
        totalSupply: string;
        circulating: string;
        stakedValue: string;
        totalHolders: string;
    } | null>(null);
    const [tokenStatsLoading, setTokenStatsLoading] = useState(false);

    // Beneficiary vesting details
    interface BeneficiaryVesting {
        beneficiaryId?: number;
        address: string;
        walletName?: string;
        totalAllocation: string;
        claimed: string;
        vested: string;
        claimable: string;
        isClaimable: boolean;
        cliffReached: boolean;
        fullyVested: boolean;
        paused: boolean;
        cancelled: boolean;
    }
    const [beneficiaryVestings, setBeneficiaryVestings] = useState<Record<string, BeneficiaryVesting[]>>({});
    const [folderBalances, setFolderBalances] = useState<Record<string, string>>({});
    const [folderBalancesLoading, setFolderBalancesLoading] = useState(false);
    const [vestingLoading, setVestingLoading] = useState(false);

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
        folderId: -1,
        account: '',
        walletName: '',
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

    const [showProposalDrawer, setShowProposalDrawer] = useState(false);
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

    // Load treasury balance on mount and when daoService changes
    useEffect(() => {
        if (daoService && !treasuryBalanceLoading) {
            loadTreasuryBalance();
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

        // Comprehensive validation
        if (allocationForm.folderId === -1) {
            setFormError('Please select a folder');
            return;
        }

        if (!allocationForm.account) {
            setFormError('Beneficiary address is required');
            return;
        }

        if (!ethers.isAddress(allocationForm.account)) {
            setFormError('Invalid Ethereum address format');
            return;
        }

        if (!allocationForm.amount || isNaN(Number(allocationForm.amount)) || Number(allocationForm.amount) <= 0) {
            setFormError('Please enter a valid amount greater than 0');
            return;
        }

        if (!allocationForm.walletName || allocationForm.walletName.trim() === '') {
            setFormError('Wallet name is required');
            return;
        }

        const cliffDays = Number(allocationForm.cliffDays || '0');
        const durationDays = Number(allocationForm.durationDays || '365');

        if (isNaN(cliffDays) || cliffDays < 0) {
            setFormError('Cliff period must be a non-negative number');
            return;
        }

        if (isNaN(durationDays) || durationDays <= 0) {
            setFormError('Duration must be greater than 0');
            return;
        }

        setLocalActionPending(true);
        setFormError(null);

        try {
            if (!daoService) {
                throw new Error('DAO service unavailable. Please refresh the page.');
            }

            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Wallet signer not available. Please reconnect your wallet.');
            }

            // Parse amount with error handling
            let amount: bigint;
            try {
                amount = ethers.parseEther(allocationForm.amount);
            } catch (parseErr) {
                throw new Error('Invalid amount format. Please enter a valid number.');
            }

            const start = allocationForm.startDate
                ? BigInt(Math.floor(new Date(allocationForm.startDate).getTime() / 1000))
                : BigInt(Math.floor(Date.now() / 1000));
            const cliff = BigInt(cliffDays * 86400);
            const duration = BigInt(durationDays * 86400);

            // Check if this is a factory folder by looking up the folder address
            const folder = factoryFolders.find(f => f.id === allocationForm.folderId);
            if (!folder) {
                throw new Error('Selected folder not found. Please refresh and try again.');
            }

            // For factory folders, interact directly with the folder contract using FolderEscrowService
            if (folder.address) {
                // Import and create FolderEscrowService for this specific folder
                const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
                const { ethers: ethersLib } = await import('ethers');

                const ethereum = (window as any).ethereum;
                if (!ethereum) {
                    throw new Error('No Ethereum provider found. Please install MetaMask or another Web3 wallet.');
                }

                const browserProvider = new ethersLib.BrowserProvider(ethereum);
                const folderEscrow = new FolderEscrowService(folder.address, browserProvider);

                const tx = await folderEscrow.addBeneficiary(
                    allocationForm.account,
                    amount,
                    start,
                    cliff,
                    duration,
                    allocationForm.walletName.trim(),
                    signer
                );

                // Transaction submitted
                console.log('Transaction submitted:', tx);

                // Refresh folder stats after adding beneficiary
                await loadFactoryFolders();
            } else {
                // Fallback to old service for non-factory folders
                if (!daoService.folderEscrow) {
                    throw new Error('FolderEscrow service not available - contract address not configured');
                }

                const tx = await daoService.folderEscrow.addBeneficiary(
                    allocationForm.account,
                    amount,
                    start,
                    cliff,
                    duration,
                    allocationForm.walletName.trim(),
                    signer
                );

                // Transaction submitted
                console.log('Transaction submitted:', tx);
            }

            // Success - clear form and close modal
            setFormError(null);
            setShowAllocationModal(false);
            setAllocationForm({
                folderId: -1,
                account: '',
                walletName: '',
                amount: '',
                startDate: '',
                cliffDays: '0',
                durationDays: '365',
            });
        } catch (err: any) {
            console.error('Failed to add beneficiary:', err);

            // Detailed error handling
            let errorMessage = 'Failed to add beneficiary';

            if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
                errorMessage = 'Transaction rejected by user';
            } else if (err.code === 'INSUFFICIENT_FUNDS') {
                errorMessage = 'Insufficient funds for gas fees';
            } else if (err.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (err.message?.includes('user rejected')) {
                errorMessage = 'Transaction rejected by user';
            } else if (err.message?.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for gas fees';
            } else if (err.message?.includes('nonce')) {
                errorMessage = 'Transaction nonce error. Please try again.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setFormError(errorMessage);
        } finally {
            setLocalActionPending(false);
        }
    };

    const loadTreasuryBalance = async () => {
        if (!daoService) {
            console.warn('DAO service unavailable for loading treasury balance');
            return;
        }

        setTreasuryBalanceLoading(true);
        setTreasuryBalanceError(null);
        try {
            const balance = await daoService.treasury.getTreasuryBalanceFormatted();
            setTreasuryBalance(balance);
            console.log('Treasury balance loaded:', balance);
        } catch (err) {
            console.error('Failed to load treasury balance:', err);
            setTreasuryBalanceError(err instanceof Error ? err.message : 'Failed to load treasury balance');
        } finally {
            setTreasuryBalanceLoading(false);
        }
    };

    const loadTokenStats = async () => {
        if (!daoService) {
            console.warn('DAO service unavailable for loading token stats');
            return;
        }

        setTokenStatsLoading(true);
        try {
            const stats = await daoService.folderFactory.getAllTokenStats();
            setTokenStats({
                totalSupply: ethers.formatEther(stats.totalSupply),
                circulating: ethers.formatEther(stats.circulating),
                stakedValue: ethers.formatEther(stats.stakedValue),
                totalHolders: stats.totalHolders.toString()
            });
            console.log('Token stats loaded from FolderFactory:', stats);
        } catch (err) {
            console.error('Failed to load token stats from FolderFactory:', err);
        } finally {
            setTokenStatsLoading(false);
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

            // Enhance with escrow stats for each folder using optimized batch method
            const enhancedFolders: FactoryFolder[] = await Promise.all(
                folderDetails.map(async (folder: any, index: number) => {
                    try {
                        // Import FolderEscrowService dynamically
                        const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
                        const { ethers: ethersLib } = await import('ethers');

                        // Create provider for read operations
                        const provider = new ethersLib.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY');
                        const folderEscrow = new FolderEscrowService(folder.address, provider as any);

                        // Use optimized method to get all stats in fewer blockchain calls
                        const stats = await folderEscrow.getFolderStatsOptimized();

                        console.log(`📊 Folder ${folder.name} Stats (optimized):`, {
                            totalAllocated: ethersLib.formatEther(stats.totalAllocated),
                            totalVested: ethersLib.formatEther(stats.totalVested),
                            totalClaimed: ethersLib.formatEther(stats.totalClaimed),
                            beneficiaryCount: stats.totalBeneficiaries,
                            folderBalance: ethersLib.formatEther(stats.folderBalance),
                            vestingPercentage: stats.totalAllocated > 0
                                ? ((Number(stats.totalVested) / Number(stats.totalAllocated)) * 100).toFixed(2) + '%'
                                : '0%',
                            vestingStart: stats.vestingStart,
                            vestingCliff: stats.vestingCliff,
                            vestingDuration: stats.vestingDuration
                        });

                        return {
                            id: index,
                            name: folder.name,
                            address: folder.address,
                            createdAt: Number(folder.createdAt),
                            totalAllocated: ethersLib.formatEther(stats.totalAllocated),
                            totalClaimed: ethersLib.formatEther(stats.totalClaimed),
                            totalVested: ethersLib.formatEther(stats.totalVested),
                            isPaused: stats.isPaused,
                            beneficiaryCount: stats.totalBeneficiaries,
                            vestingStart: stats.vestingStart,
                            vestingCliff: stats.vestingCliff,
                            vestingDuration: stats.vestingDuration,
                            folderBalance: ethersLib.formatEther(stats.folderBalance)
                        };
                    } catch (err) {
                        console.error(`Failed to load stats for folder ${folder.name}:`, err);
                        return {
                            id: index,
                            name: folder.name,
                            address: folder.address,
                            createdAt: Number(folder.createdAt),
                            totalAllocated: '0',
                            totalClaimed: '0',
                            totalVested: '0',
                            isPaused: false,
                            beneficiaryCount: 0,
                            vestingStart: 0,
                            vestingCliff: 0,
                            vestingDuration: 0,
                            folderBalance: '0'
                        };
                    }
                })
            );

            setFactoryFolders(enhancedFolders);
            console.log(`Successfully loaded ${enhancedFolders.length} folders from factory with stats`);

            // Also load token statistics
            await loadTokenStats();
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

        // Comprehensive validation
        if (!approveFolderForm.folderAddress) {
            setFormError('Folder address is required');
            return;
        }

        if (!ethers.isAddress(approveFolderForm.folderAddress)) {
            setFormError('Invalid folder address format');
            return;
        }

        setLocalActionPending(true);
        setFormError(null);

        try {
            if (!daoService) {
                throw new Error('DAO service unavailable. Please refresh the page.');
            }

            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Wallet signer not available. Please reconnect your wallet.');
            }

            // Check if folder is already approved
            const isAlreadyApproved = await daoService.treasury.isFolderApproved(approveFolderForm.folderAddress);
            if (isAlreadyApproved) {
                throw new Error('This folder is already approved');
            }

            const tx = await daoService.treasury.approveFolder(approveFolderForm.folderAddress, signer);

            // Transaction submitted
            console.log('Transaction submitted:', tx);

            // Refresh treasury data
            await loadTreasuryBalance();
            await loadFactoryFolders();

            // Success - clear form and close modal
            setFormError(null);
            setShowApproveFolderModal(false);
            setApproveFolderForm({ folderAddress: '' });
        } catch (err: any) {
            console.error('Failed to approve folder:', err);

            // Detailed error handling
            let errorMessage = 'Failed to approve folder';

            if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
                errorMessage = 'Transaction rejected by user';
            } else if (err.code === 'INSUFFICIENT_FUNDS') {
                errorMessage = 'Insufficient funds for gas fees';
            } else if (err.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (err.message?.includes('user rejected')) {
                errorMessage = 'Transaction rejected by user';
            } else if (err.message?.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for gas fees';
            } else if (err.message?.includes('already approved')) {
                errorMessage = 'This folder is already approved';
            } else if (err.message?.includes('nonce')) {
                errorMessage = 'Transaction nonce error. Please try again.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setFormError(errorMessage);
        } finally {
            setLocalActionPending(false);
        }
    };

    const handleSendToFolder = async () => {
        if (!await ensureSepolia(setFormError)) return;

        // Comprehensive validation
        if (!sendToFolderForm.folderAddress) {
            setFormError('Folder address is required');
            return;
        }

        if (!ethers.isAddress(sendToFolderForm.folderAddress)) {
            setFormError('Invalid folder address format');
            return;
        }

        if (!sendToFolderForm.amount || isNaN(Number(sendToFolderForm.amount)) || Number(sendToFolderForm.amount) <= 0) {
            setFormError('Please enter a valid amount greater than 0');
            return;
        }

        setLocalActionPending(true);
        setFormError(null);

        try {
            if (!daoService) {
                throw new Error('DAO service unavailable. Please refresh the page.');
            }

            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Wallet signer not available. Please reconnect your wallet.');
            }

            // Parse amount with error handling
            let amount: bigint;
            try {
                amount = ethers.parseEther(sendToFolderForm.amount);
            } catch (parseErr) {
                throw new Error('Invalid amount format. Please enter a valid number.');
            }

            // Check if folder is approved
            const isApproved = await daoService.treasury.isFolderApproved(sendToFolderForm.folderAddress);
            if (!isApproved) {
                throw new Error('This folder is not approved. Please approve the folder first.');
            }

            const tx = await daoService.treasury.sendToFolder(sendToFolderForm.folderAddress, amount, signer);

            // Transaction submitted
            console.log('Transaction submitted:', tx);

            // Refresh treasury balance and folder stats
            await loadTreasuryBalance();
            await loadFactoryFolders();

            // Success - clear form and close modal
            setFormError(null);
            setShowSendToFolderModal(false);
            setSendToFolderForm({ folderAddress: '', amount: '' });
        } catch (err: any) {
            console.error('Failed to send to folder:', err);

            // Detailed error handling
            let errorMessage = 'Failed to send funds to folder';

            if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
                errorMessage = 'Transaction rejected by user';
            } else if (err.code === 'INSUFFICIENT_FUNDS') {
                errorMessage = 'Insufficient funds for gas fees';
            } else if (err.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (err.message?.includes('user rejected')) {
                errorMessage = 'Transaction rejected by user';
            } else if (err.message?.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for gas fees';
            } else if (err.message?.includes('not approved')) {
                errorMessage = 'Folder is not approved. Please approve the folder first.';
            } else if (err.message?.includes('nonce')) {
                errorMessage = 'Transaction nonce error. Please try again.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setFormError(errorMessage);
        } finally {
            setLocalActionPending(false);
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
        try {
            const encoded = encodeProposalPreset(key);
            setProposalActions(prev =>
                prev.map((action, i) =>
                    i === index
                        ? {
                            ...action,
                            target: encoded.target,
                            value: encoded.value,
                            calldata: encoded.calldata,
                        }
                        : action,
                ),
            );
            setProposalAlert({ type: 'success', message: `Filled action with: ${encoded.label}` });
        } catch (error) {
            if (error instanceof Error && error.message === 'Cancelled') return;
            console.error('Failed to apply function preset', error);
            setProposalAlert({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to encode proposal calldata.',
            });
        }
    };

    const handlePauseBeneficiary = async (folderAddress: string, beneficiaryId: number) => {
        if (!await ensureSepolia(setFormError)) return;
        if (!daoService) {
            setFormError('DAO service unavailable');
            return;
        }

        try {
            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Signer required');
            }

            const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
            const { ethers: ethersLib } = await import('ethers');

            const ethereum = (window as any).ethereum;
            if (!ethereum) throw new Error('No Ethereum provider found');

            const browserProvider = new ethersLib.BrowserProvider(ethereum);
            const folderEscrow = new FolderEscrowService(folderAddress, browserProvider);

            await folderEscrow.pauseBeneficiary(beneficiaryId, signer);
            await loadFactoryFolders();
            setFormError(null);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to pause beneficiary');
        }
    };

    const handleResumeBeneficiary = async (folderAddress: string, beneficiaryId: number) => {
        if (!await ensureSepolia(setFormError)) return;
        if (!daoService) {
            setFormError('DAO service unavailable');
            return;
        }

        try {
            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Signer required');
            }

            const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
            const { ethers: ethersLib } = await import('ethers');

            const ethereum = (window as any).ethereum;
            if (!ethereum) throw new Error('No Ethereum provider found');

            const browserProvider = new ethersLib.BrowserProvider(ethereum);
            const folderEscrow = new FolderEscrowService(folderAddress, browserProvider);

            await folderEscrow.resumeBeneficiary(beneficiaryId, signer);
            await loadFactoryFolders();
            setFormError(null);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to resume beneficiary');
        }
    };

    const handleCancelBeneficiary = async (folderAddress: string, beneficiaryId: number) => {
        if (!await ensureSepolia(setFormError)) return;
        if (!daoService) {
            setFormError('DAO service unavailable');
            return;
        }

        try {
            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Signer required');
            }

            const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
            const { ethers: ethersLib } = await import('ethers');

            const ethereum = (window as any).ethereum;
            if (!ethereum) throw new Error('No Ethereum provider found');

            const browserProvider = new ethersLib.BrowserProvider(ethereum);
            const folderEscrow = new FolderEscrowService(folderAddress, browserProvider);

            await folderEscrow.cancelBeneficiary(beneficiaryId, signer);
            await loadFactoryFolders();
            setFormError(null);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to cancel beneficiary');
        }
    };

    const handlePauseFolder = async (folderAddress: string) => {
        if (!folderAddress) {
            console.error('❌ No folder address provided for pause');
            setFormError('Folder address is required');
            return;
        }

        console.log('⏸️ Attempting to pause folder:', folderAddress);

        if (!await ensureSepolia(setFormError)) return;
        if (!daoService) {
            setFormError('DAO service unavailable');
            return;
        }

        try {
            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Signer required - please connect your wallet');
            }

            const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
            const { ethers: ethersLib } = await import('ethers');

            const ethereum = (window as any).ethereum;
            if (!ethereum) throw new Error('No Ethereum provider found');

            const browserProvider = new ethersLib.BrowserProvider(ethereum);
            const folderEscrow = new FolderEscrowService(folderAddress, browserProvider);

            console.log('⏸️ Calling pauseFolder on contract...');
            const tx = await folderEscrow.pauseFolder(signer);
            console.log('⏸️ Transaction sent:', tx);

            if (tx && typeof tx === 'object' && 'wait' in tx) {
                await (tx as any).wait();
            }
            console.log('✅ Folder paused successfully');

            await loadFactoryFolders();
            setFormError(null);
            toast.success('Folder paused successfully!');
        } catch (err) {
            console.error('❌ Failed to pause folder:', err);
            setFormError(err instanceof Error ? err.message : 'Failed to pause folder');
        }
    };

    const handleUnpauseFolder = async (folderAddress: string) => {
        if (!folderAddress) {
            console.error('❌ No folder address provided for unpause');
            setFormError('Folder address is required');
            return;
        }

        console.log('▶️ Attempting to unpause folder:', folderAddress);

        if (!await ensureSepolia(setFormError)) return;
        if (!daoService) {
            setFormError('DAO service unavailable');
            return;
        }

        try {
            const signer = daoService.getSigner();
            if (!signer) {
                throw new Error('Signer required - please connect your wallet');
            }

            const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
            const { ethers: ethersLib } = await import('ethers');

            const ethereum = (window as any).ethereum;
            if (!ethereum) throw new Error('No Ethereum provider found');

            const browserProvider = new ethersLib.BrowserProvider(ethereum);
            const folderEscrow = new FolderEscrowService(folderAddress, browserProvider);

            console.log('▶️ Calling unpauseFolder on contract...');
            const tx = await folderEscrow.unpauseFolder(signer);
            console.log('▶️ Transaction sent:', tx);

            if (tx && typeof tx === 'object' && 'wait' in tx) {
                await (tx as any).wait();
            }
            console.log('✅ Folder unpaused successfully');

            await loadFactoryFolders();
            setFormError(null);
            toast.success('Folder unpaused successfully!');
        } catch (err) {
            console.error('❌ Failed to unpause folder:', err);
            setFormError(err instanceof Error ? err.message : 'Failed to unpause folder');
        }
    };

    const calculateVestedAmountById = async (folderAddress: string, beneficiaryId: number): Promise<BeneficiaryVesting | null> => {
        try {
            const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
            const { ethers: ethersLib } = await import('ethers');

            // Create provider for read operations
            const provider = new ethersLib.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY');
            const folderEscrow = new FolderEscrowService(folderAddress, provider as any);

            // Get beneficiary data by ID
            const beneficiary = await folderEscrow.getBeneficiaryById(beneficiaryId);

            // Calculate vested amount for this specific beneficiary entry
            const vestedAmount = await folderEscrow.getVestedAmount(beneficiaryId);

            const currentTime = Math.floor(Date.now() / 1000);
            const cliffTime = Number(beneficiary.start) + Number(beneficiary.cliff);
            const endTime = Number(beneficiary.start) + Number(beneficiary.duration);
            const elapsed = currentTime - Number(beneficiary.start);

            // Calculate claimable amount (vested - claimed)
            const claimable = vestedAmount > beneficiary.claimed ? vestedAmount - beneficiary.claimed : BigInt(0);
            const isClaimable = claimable > 0 && currentTime >= cliffTime && !beneficiary.paused && !beneficiary.cancelled;
            const cliffReached = currentTime >= cliffTime;
            const fullyVested = currentTime >= endTime;

            console.log(`🔍 Beneficiary ID ${beneficiaryId} (${beneficiary.wallet.slice(0, 6)}...${beneficiary.wallet.slice(-4)}) Vesting Details:`, {
                totalAllocation: ethersLib.formatEther(beneficiary.totalAllocation),
                vested: ethersLib.formatEther(vestedAmount),
                claimed: ethersLib.formatEther(beneficiary.claimed),
                claimable: ethersLib.formatEther(claimable),
                cliffReached,
                fullyVested,
                paused: beneficiary.paused,
                cancelled: beneficiary.cancelled
            });

            return {
                beneficiaryId: beneficiaryId,
                address: beneficiary.wallet,
                walletName: beneficiary.walletName,
                totalAllocation: ethersLib.formatEther(beneficiary.totalAllocation),
                claimed: ethersLib.formatEther(beneficiary.claimed),
                vested: ethersLib.formatEther(vestedAmount),
                claimable: ethersLib.formatEther(claimable),
                isClaimable: isClaimable,
                cliffReached: cliffReached,
                fullyVested: fullyVested,
                paused: beneficiary.paused,
                cancelled: beneficiary.cancelled
            };
        } catch (err) {
            console.error(`Failed to calculate vested amount for beneficiary ID ${beneficiaryId}:`, err);
            return null;
        }
    };

    const calculateVestedAmount = async (folderAddress: string, beneficiaryAddress: string): Promise<BeneficiaryVesting | null> => {
        try {
            const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
            const { ethers: ethersLib } = await import('ethers');

            // Create provider for read operations
            const provider = new ethersLib.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY');
            const folderEscrow = new FolderEscrowService(folderAddress, provider as any);

            // Get beneficiary IDs for this wallet
            const beneficiaryIds = await folderEscrow.getBeneficiaryIdsByWallet(beneficiaryAddress);
            if (beneficiaryIds.length === 0) {
                console.warn(`No beneficiary entries found for ${beneficiaryAddress}`);
                return null;
            }

            // Use the first beneficiary ID for this wallet
            const beneficiaryId = Number(beneficiaryIds[0]);

            // Get vesting calculation
            const vestingCalc = await folderEscrow.calculateVesting(beneficiaryAddress);
            const beneficiaryInfo = await folderEscrow.getBeneficiaryInfo(beneficiaryAddress);

            const currentTime = Math.floor(Date.now() / 1000);
            const cliffTime = Number(beneficiaryInfo.start) + Number(beneficiaryInfo.cliff);
            const endTime = Number(beneficiaryInfo.start) + Number(beneficiaryInfo.duration);
            const elapsed = currentTime - Number(beneficiaryInfo.start);
            const vestingProgress = elapsed > 0 ? Math.min((elapsed / Number(beneficiaryInfo.duration)) * 100, 100) : 0;

            console.log(`🔍 Beneficiary ${beneficiaryAddress.slice(0, 6)}...${beneficiaryAddress.slice(-4)} (ID: ${beneficiaryId}) Vesting Details:`, {
                totalAllocation: ethersLib.formatEther(vestingCalc.totalAllocation),
                vested: ethersLib.formatEther(vestingCalc.vested),
                claimed: ethersLib.formatEther(vestingCalc.claimed),
                claimable: ethersLib.formatEther(vestingCalc.claimable),
                cliffReached: vestingCalc.cliffReached,
                fullyVested: vestingCalc.fullyVested,
                vestingProgress: vestingProgress.toFixed(2) + '%',
                timeUntilCliff: cliffTime > currentTime ? `${Math.floor((cliffTime - currentTime) / 86400)} days` : 'Cliff reached',
                timeUntilFullyVested: endTime > currentTime ? `${Math.floor((endTime - currentTime) / 86400)} days` : 'Fully vested'
            });

            return {
                beneficiaryId: beneficiaryId,
                address: beneficiaryAddress,
                walletName: beneficiaryInfo.walletName,
                totalAllocation: ethersLib.formatEther(vestingCalc.totalAllocation),
                claimed: ethersLib.formatEther(vestingCalc.claimed),
                vested: ethersLib.formatEther(vestingCalc.vested),
                claimable: ethersLib.formatEther(vestingCalc.claimable),
                isClaimable: vestingCalc.isClaimable,
                cliffReached: vestingCalc.cliffReached,
                fullyVested: vestingCalc.fullyVested,
                paused: beneficiaryInfo.paused,
                cancelled: beneficiaryInfo.cancelled
            };
        } catch (err) {
            console.error(`Failed to calculate vested amount for ${beneficiaryAddress}:`, err);
            return null;
        }
    };

    const loadBeneficiaryVestings = async (folderAddress: string, folderId: number) => {
        if (!folderAddress) {
            console.error('❌ No folder address provided for loading beneficiaries');
            return;
        }

        console.log(`👥 Loading beneficiaries for folder ${folderId} at address ${folderAddress}`);

        try {
            setVestingLoading(true);
            const { FolderEscrowService } = await import('@/services/contracts/folderEscrowService');
            const { ethers: ethersLib } = await import('ethers');

            // Create provider for read operations
            const provider = new ethersLib.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY');
            const folderEscrow = new FolderEscrowService(folderAddress, provider as any);

            // Get all beneficiaries
            console.log('👥 Fetching beneficiaries from contract...');
            const beneficiaries = await folderEscrow.getAllBeneficiaries();
            console.log(`👥 Found ${beneficiaries.length} beneficiary entries:`, beneficiaries);

            if (beneficiaries.length === 0) {
                console.warn('⚠️ No beneficiaries found in this folder');
                setBeneficiaryVestings(prev => ({
                    ...prev,
                    [folderId]: []
                }));
                return;
            }

            // Calculate vesting for each beneficiary entry by ID
            console.log('👥 Calculating vesting details for each beneficiary entry...');
            const vestings = await Promise.all(
                beneficiaries.map(async (beneficiary) => {
                    console.log(`  → Processing ${beneficiary.wallet} (ID: ${beneficiary.id})`);
                    return await calculateVestedAmountById(folderAddress, Number(beneficiary.id));
                })
            );

            // Filter out nulls and update state
            const validVestings = vestings.filter((v): v is BeneficiaryVesting => v !== null);
            setBeneficiaryVestings(prev => ({
                ...prev,
                [folderId]: validVestings
            }));

            console.log(`✅ Successfully loaded vesting info for ${validVestings.length}/${beneficiaries.length} beneficiaries`);
            console.log('👥 Beneficiary vesting data:', validVestings);
        } catch (err) {
            console.error('❌ Failed to load beneficiary vestings:', err);
            toast.error(`Failed to load beneficiaries: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setVestingLoading(false);
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
            await ensureSigner();
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
            setShowProposalDrawer(false);
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

        // Calculate vesting progress based on time
        const calculateVestingProgress = () => {
            const totalAllocated = parseFloat(folder.totalAllocated || '0') || 0;
            const totalClaimed = parseFloat(folder.totalClaimed || '0') || 0;

            if (totalAllocated === 0) return { percentage: 0, vested: 0, total: 0, timeRemaining: 'N/A', status: 'No allocation' };

            // Time-based vesting progress
            if (folder.vestingStart && folder.vestingDuration && folder.vestingDuration > 0) {
                const currentTime = Math.floor(Date.now() / 1000);
                const vestingStart = folder.vestingStart;
                const vestingDuration = folder.vestingDuration;
                const vestingEnd = vestingStart + vestingDuration;
                const cliffEnd = vestingStart + (folder.vestingCliff || 0);

                // Calculate elapsed time since vesting started
                const elapsed = Math.max(0, currentTime - vestingStart);
                const timeRemaining = Math.max(0, vestingEnd - currentTime);

                // Calculate percentage based on time
                let percentage = 0;
                let status = '';

                if (currentTime < vestingStart) {
                    percentage = 0;
                    status = 'Not started';
                } else if (currentTime < cliffEnd) {
                    percentage = 0;
                    status = 'In cliff period';
                } else if (currentTime >= vestingEnd) {
                    percentage = 100;
                    status = 'Fully vested';
                } else {
                    percentage = Math.min(100, (elapsed / vestingDuration) * 100);
                    status = 'Vesting';
                }

                // Format time remaining
                const daysRemaining = Math.floor(timeRemaining / 86400);
                const hoursRemaining = Math.floor((timeRemaining % 86400) / 3600);
                const timeRemainingStr = timeRemaining > 0
                    ? `${daysRemaining}d ${hoursRemaining}h`
                    : 'Complete';

                return {
                    percentage: Math.min(percentage, 100),
                    vested: totalClaimed,
                    total: totalAllocated,
                    timeRemaining: timeRemainingStr,
                    status
                };
            }

            // Fallback to amount-based calculation if no time info
            const percentage = totalAllocated > 0 ? (totalClaimed / totalAllocated) * 100 : 0;
            return {
                percentage: Math.min(percentage, 100),
                vested: totalClaimed,
                total: totalAllocated,
                timeRemaining: 'N/A',
                status: 'Amount-based'
            };
        };

        const vestingProgress = calculateVestingProgress();

        // Debug: Log folder data to verify totalVested is present
        console.log(`🎴 Rendering Folder Card: ${folder.name}`, {
            id: folder.id,
            totalAllocated: folder.totalAllocated,
            totalVested: folder.totalVested,
            totalVestedType: typeof folder.totalVested,
            totalVestedIsZero: folder.totalVested === '0' || folder.totalVested === '0.0',
            totalClaimed: folder.totalClaimed,
            beneficiaryCount: folder.beneficiaryCount,
            address: folder.address
        });

        // Additional check for vested amount display
        if (!folder.totalVested || folder.totalVested === '0' || folder.totalVested === '0.0') {
            console.warn(`⚠️ Folder ${folder.name} has zero or missing totalVested!`, {
                totalVested: folder.totalVested,
                hasAddress: !!folder.address,
                beneficiaryCount: folder.beneficiaryCount
            });
        }

        return (
            <Card
                key={folder.id}
                onClick={() => handleSelectFolder(folder.id)}
                className={`cursor-pointer p-5 transition-colors ${selectedFolderId === folder.id ? 'border-cyan-400/40 bg-cyan-400/[0.04]' : 'hover:border-white/20'
                    }`}
            >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <IconTile tone="cyan" icon={<FolderOpen className="size-5" aria-hidden="true" />} />
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-base font-semibold text-white">{folder.name}</h3>
                                {folder.isPaused && (
                                    <Badge variant="warning-light" size="sm">
                                        <Lock className="size-3" aria-hidden="true" /> Paused
                                    </Badge>
                                )}
                            </div>
                            {folder.address && (
                                <div className="mt-1 flex items-center gap-1.5">
                                    <p className="truncate font-mono text-xs text-gray-400">
                                        {folder.address.slice(0, 6)}...{folder.address.slice(-4)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={event => {
                                            event.stopPropagation();
                                            navigator.clipboard.writeText(folder.address);
                                        }}
                                        className="rounded p-1 text-gray-500 hover:bg-white/5 hover:text-white"
                                        title="Copy address"
                                        aria-label={`Copy ${folder.name} address`}
                                    >
                                        <Copy className="size-3.5" aria-hidden="true" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Members</p>
                        <p className="text-sm font-semibold text-white">{folder.beneficiaryCount ?? memberCount}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="mb-1 text-xs text-gray-400">Total allocations</div>
                            <div className="text-base font-semibold text-white">{formatNumber(folder.totalAllocated)}</div>
                            <div className="text-xs text-gray-500">NYAX sent to folder</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="mb-1 text-xs text-gray-400">Folder balance</div>
                            <div className="text-base font-semibold text-white">{formatNumber(folder.folderBalance || '0')}</div>
                            <div className="text-xs text-gray-500">NYAX in escrow</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {[
                            { label: 'Vested', value: formatNumber(folder.totalVested || '0') },
                            { label: 'Claimed', value: formatNumber(folder.totalClaimed || '0') },
                            {
                                label: 'Claimable',
                                value: formatNumber(
                                    (parseFloat(folder.totalVested || '0') - parseFloat(folder.totalClaimed || '0')).toString()
                                ),
                            },
                        ].map(metric => (
                            <div key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="mb-1 text-xs text-gray-400">{metric.label}</div>
                                <div className="text-base font-semibold text-white">{metric.value}</div>
                                <div className="text-xs text-gray-500">NYAX</div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-gray-400">Vesting progress</span>
                            <Badge variant="secondary">{vestingProgress.percentage.toFixed(1)}%</Badge>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                                style={{ width: `${vestingProgress.percentage}%` }}
                            ></div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                            <span>{vestingProgress.status}</span>
                            <span>{vestingProgress.timeRemaining} remaining</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <span className="text-sm text-gray-500">Created</span>
                        <span className="text-sm text-gray-300">
                            {folder.createdAt ? new Date(folder.createdAt * 1000).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>

                    {folder.address && (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (folder.isPaused) {
                                            handleUnpauseFolder(folder.address);
                                        } else {
                                            handlePauseFolder(folder.address);
                                        }
                                    }}
                                    className={`h-9 w-full rounded-lg border px-3 text-sm font-medium transition-colors ${folder.isPaused
                                        ? 'border-white/15 bg-transparent text-slate-200 hover:bg-white/5'
                                        : 'border-white/15 bg-transparent text-slate-200 hover:bg-white/5'
                                        }`}
                                >
                                    {folder.isPaused ? (
                                        <span className="flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Unpause
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Pause
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        loadBeneficiaryVestings(folder.address, folder.id);
                                    }}
                                    disabled={vestingLoading}
                                    className="h-9 rounded-lg border border-white/15 bg-transparent px-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5 disabled:opacity-50"
                                >
                                    {vestingLoading ? (
                                        <span className="flex items-center justify-center gap-1">
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Wallets
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {beneficiaryVestings[folder.id] && beneficiaryVestings[folder.id].length > 0 && (
                        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                            <div className="text-sm font-semibold text-gray-300 mb-2">Wallets ({beneficiaryVestings[folder.id].length}):</div>
                            {beneficiaryVestings[folder.id].map((vesting, idx) => (
                                <div key={idx} className="bg-white/5 rounded-lg p-3 space-y-1">
                                    {vesting.walletName && (
                                        <div className="text-sm font-semibold text-white mb-1">
                                            {vesting.walletName}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 font-mono break-all">
                                            {vesting.address}
                                        </span>
                                        <div className="flex gap-1">
                                            {vesting.paused && (
                                                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded">Paused</span>
                                            )}
                                            {vesting.cancelled && (
                                                <span className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-300 rounded">Cancelled</span>
                                            )}
                                            {vesting.fullyVested && (
                                                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded">Fully Vested</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-xs">
                                        <div>
                                            <div className="text-gray-500">Allocated</div>
                                            <div className="text-white font-semibold">{parseFloat(vesting.totalAllocation).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-green-500">Vested</div>
                                            <div className="text-green-300 font-semibold">{parseFloat(vesting.vested).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-blue-500">Claimed</div>
                                            <div className="text-blue-300 font-semibold">{parseFloat(vesting.claimed).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-purple-500">Claimable</div>
                                            <div className="text-purple-300 font-semibold">{parseFloat(vesting.claimable).toFixed(2)}</div>
                                        </div>
                                    </div>
                                    {vesting.isClaimable && (
                                        <div className="text-xs text-green-400 mt-1">✓ Ready to claim</div>
                                    )}
                                    {!vesting.cliffReached && (
                                        <div className="text-xs text-yellow-400 mt-1">⏳ Cliff not reached</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    const factoryTotalAllocated = factoryFolders.reduce(
        (sum, folder) => sum + parseFloat(folder.totalAllocated || '0'),
        0
    );
    const factoryTotalMembers = factoryFolders.reduce(
        (sum, folder) => sum + (folder.beneficiaryCount || 0),
        0
    );

    return (
        <div className="admin-panel-form mx-auto max-w-7xl space-y-6 p-4 md:p-6">
            <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                    <Badge variant="primary-light" size="sm">NYAX administration</Badge>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">NYAX Admin</h1>
                        <p className="mt-1 max-w-2xl text-sm text-gray-400">
                            Manage token folders, treasury funding, vesting, and governance proposals.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={isConnected ? 'success-light' : 'warning-light'}>
                            {isConnected ? 'Wallet connected' : 'Wallet not connected'}
                        </Badge>
                        <Badge variant={isConnected && onRequiredNetwork ? 'success-light' : 'warning-light'}>
                            {!isConnected ? 'Network unavailable' : onRequiredNetwork ? 'Sepolia' : 'Switch to Sepolia'}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!isConnected && <ConnectWalletButton className="h-9 rounded-lg border border-transparent bg-cyan-500 px-4 text-sm font-medium text-white hover:bg-cyan-400" />}
                    <Button onClick={() => setShowAddModal(true)} disabled={!isConnected || loading}>
                        <Plus className="size-4" aria-hidden="true" />
                        Create folder
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowProposalDrawer(true)}
                        disabled={!isConnected || loading}
                    >
                        <Gavel className="size-4" aria-hidden="true" />
                        Create proposal
                    </Button>
                </div>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: 'Treasury balance',
                        value: treasuryBalanceLoading
                            ? 'Loading…'
                            : treasuryBalanceError
                              ? 'Unavailable'
                              : `${formatNumber(treasuryBalance || '0')} NYAX`,
                        note: 'Current balance',
                        icon: CircleDollarSign,
                    },
                    {
                        label: 'Allocated NYAX',
                        value: `${formatNumber(factoryTotalAllocated)} NYAX`,
                        note: 'Across live folders',
                        icon: Shield,
                    },
                    {
                        label: 'Active members',
                        value: formatNumber(factoryTotalMembers),
                        note: 'Folder beneficiaries',
                        icon: UsersRound,
                    },
                    {
                        label: 'Live folders',
                        value: formatNumber(factoryFolders.length),
                        note: 'Factory registry',
                        icon: FolderOpen,
                    },
                    {
                        label: 'Folders in view',
                        value: formatNumber(filteredDisplayFolders.length),
                        note: 'Based on search',
                        icon: Activity,
                    },
                ].map(metric => (
                    <Card key={metric.label} className="flex min-w-0 items-center gap-3 p-4">
                        <IconTile icon={<metric.icon className="size-5" aria-hidden="true" />} />
                        <div className="min-w-0">
                            <p className="truncate text-xs text-gray-400">{metric.label}</p>
                            <p className="mt-1 truncate text-base font-semibold text-white">{metric.value}</p>
                            <p className="mt-1 text-xs text-gray-500">{metric.note}</p>
                        </div>
                    </Card>
                ))}
            </div>


                {!isConnected && (
                    <Alert variant="warning">
                        Wallet connection is required to create, edit, or revoke allocations.
                    </Alert>
                )}
                {isConnected && !onRequiredNetwork && (
                    <Alert variant="warning">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="font-medium">Switch to Ethereum Sepolia</p>
                                <p className="mt-1 text-sm">
                                    Admin actions require the Sepolia network.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleSwitchNetwork}
                                disabled={isSwitchingChain}
                            >
                                {isSwitchingChain ? 'Switching…' : 'Switch to Sepolia'}
                            </Button>
                        </div>
                    </Alert>
                )}

                {showFolderEditModal && (
                    <Dialog
                        open={showFolderEditModal}
                        onClose={() => setShowFolderEditModal(false)}
                        title="Update Folder"
                        maxWidth="max-w-lg"
                    >
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-lg w-full space-y-4">
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
                            {formError && <Alert variant="destructive">{formError}</Alert>}
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
                    </Dialog>
                )}

                <Card className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
                                <IconTile icon={<Shield className="size-5" aria-hidden="true" />} />
                                Registry toolkit
                            </h2>
                            <p className="mt-2 text-sm text-gray-400">
                                Folder lifecycle and treasury actions.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                                Selected folder {selectedFolder ? `#${selectedFolder.id}` : '—'}
                            </Badge>
                            <Badge variant={isConnected ? 'success-light' : 'secondary'}>
                                {isConnected ? 'Wallet actions enabled' : 'Connect wallet to act'}
                            </Badge>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <Button
                            variant="outline"
                            className="h-auto min-h-16 w-full justify-start gap-3 whitespace-normal px-3 py-3 text-left"
                            onClick={() => {
                                refresh();
                                loadFactoryFolders();
                                loadTreasuryBalance();
                            }}
                            disabled={loading || factoryLoading || treasuryBalanceLoading}
                        >
                            <IconTile className="size-9 rounded-lg" icon={<RefreshCw className={`size-4 ${(loading || factoryLoading || treasuryBalanceLoading) ? 'animate-spin' : ''}`} aria-hidden="true" />} />
                            Refresh data
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto min-h-16 w-full justify-start gap-3 whitespace-normal px-3 py-3 text-left"
                            onClick={handleTreasuryPause}
                            disabled={pauseLoading === 'treasury' || treasuryPaused === null || !isConnected}
                        >
                            <IconTile className="size-9 rounded-lg" icon={<Lock className="size-4" aria-hidden="true" />} />
                            {pauseLoading === 'treasury' ? 'Processing…' : treasuryPaused ? 'Unpause treasury' : 'Pause treasury'}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto min-h-16 w-full justify-start gap-3 whitespace-normal px-3 py-3 text-left"
                            onClick={() => setShowAllocationModal(true)}
                            disabled={!isConnected || loading}
                        >
                            <IconTile className="size-9 rounded-lg" icon={<UsersRound className="size-4" aria-hidden="true" />} />
                            Add wallets
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto min-h-16 w-full justify-start gap-3 whitespace-normal px-3 py-3 text-left"
                            onClick={() => setShowApproveFolderModal(true)}
                            disabled={!isConnected || loading}
                        >
                            <IconTile className="size-9 rounded-lg" icon={<Shield className="size-4" aria-hidden="true" />} />
                            Approve folder
                        </Button>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
                                <IconTile icon={<CircleDollarSign className="size-5" aria-hidden="true" />} />
                                Treasury to folder funding
                            </h2>
                            <p className="mt-2 text-sm text-gray-400">
                                Transfer NYAX from the governance treasury into an approved folder.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-gray-400">Treasury balance</span>
                                {treasuryBalanceLoading ? (
                                    <Badge variant="secondary">Loading…</Badge>
                                ) : treasuryBalanceError ? (
                                    <Badge variant="destructive-light">Unavailable</Badge>
                                ) : treasuryBalance ? (
                                    <span className="font-medium text-white">{formatNumber(treasuryBalance)} NYAX</span>
                                ) : (
                                    <span className="font-medium text-white">0 NYAX</span>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowSendToFolderModal(true)}
                            disabled={!isConnected}
                        >
                            Fund folder
                        </Button>
                    </div>
                    {bridgeStatus && (
                        <Alert
                            variant={bridgeStatus.type === 'success' ? 'success' : 'destructive'}
                            className="mt-4"
                        >
                            {bridgeStatus.message}
                        </Alert>
                    )}
                </Card>

                <Filters
                    activeFilters={searchValue.trim()
                        ? [{ id: 'folder-search', label: `Search: ${searchValue}`, onRemove: () => setSearchValue('') }]
                        : []}
                >
                    <Input
                        type="search"
                        value={searchValue}
                        onChange={event => setSearchValue(event.target.value)}
                        placeholder="Search folders"
                        aria-label="Search token folders"
                        className="min-w-[220px] flex-1"
                    />
                </Filters>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Registry</p>
                                <h2 className="mt-1 text-lg font-semibold text-white">Token folders</h2>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={loadFactoryFolders}
                                disabled={factoryLoading}
                            >
                                <RefreshCw className={`size-4 ${factoryLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                                Refresh folders
                            </Button>
                        </div>

                        {error && <Alert variant="destructive" className="mt-4">{error}</Alert>}
                        {filteredDisplayFolders.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-white/15 p-8 text-center text-gray-400">
                                {factoryFolders.length === 0 ? (
                                    <div>
                                        <p className="mb-1 font-medium text-gray-200">No folders loaded</p>
                                        <p className="text-sm">Refresh folders to load the factory registry.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="mb-1 font-medium text-gray-200">No matching folders</p>
                                        <p className="text-sm">Clear the search or try another name.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                {filteredDisplayFolders.map(folder => renderFolderCard(folder))}
                            </div>
                        )}
                        </Card>

                    </div>

                    <div className="space-y-4">
                        <Card className="p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-base font-semibold text-white">Platform telemetry</h3>
                                <Badge variant="success-light" size="sm">Live</Badge>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                                    <span className="text-gray-400">Active members</span>
                                    <span className="font-medium text-white">{formatNumber(summary.totalMembers)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                                    <span className="text-gray-400">Live folders</span>
                                    <span className="font-medium text-white">{factoryFolders.length || summary.folderCount}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-400">Folders in view</span>
                                    <span className="font-medium text-white">{filteredDisplayFolders.length}</span>
                                </div>
                            </div>
                        </Card>

                        {selectedFolderId !== null && membersByFolder[selectedFolderId] && (
                            <Card className="p-5">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h3 className="text-base font-semibold text-white">Folder members</h3>
                                    <Badge variant="secondary">#{selectedFolderId}</Badge>
                                </div>
                                <div className="max-h-64 space-y-2 overflow-auto pr-1">
                                    {membersByFolder[selectedFolderId]!.map(member => (
                                        <div key={member.account} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 text-sm text-gray-200">
                                            <span className="truncate font-mono text-xs">{member.account.slice(0, 6)}...{member.account.slice(-4)}</span>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <span className="text-gray-300">{formatNumber(member.unlockedAmount)} NYAX</span>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRevoke(selectedFolderId, member.account)}
                                                    disabled={!isConnected}
                                                >
                                                    Revoke
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>

                <Drawer
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Create folder"
                    maxWidth="max-w-md"
                >
                    <div className="admin-panel-form flex h-full min-h-full w-full flex-col overflow-hidden border-l border-white/10 bg-[#0d0d0d]">
                        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-cyan-300">Folder registry</p>
                                <h3 className="mt-1 text-base font-semibold text-white">Create folder</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                aria-label="Close create folder"
                                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </header>

                        <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto p-5">
                            <Field
                                id="new-folder-name"
                                label="Folder name"
                                required
                                description="Choose a clear name for this vesting folder."
                            >
                                <Input
                                    id="new-folder-name"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    placeholder="e.g. Investor"
                                    autoComplete="off"
                                />
                            </Field>

                            <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                                <h4 className="text-sm font-semibold text-white">Deployment details</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-slate-400">Token</span>
                                        <span className="text-slate-200">
                                            NYAX <span className="ml-1 font-mono text-xs text-slate-400">{CONTRACT_ADDRESSES.nyaxToken?.slice(0, 6)}...{CONTRACT_ADDRESSES.nyaxToken?.slice(-4)}</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-slate-400">Admin</span>
                                        <span className="text-slate-200">Connected wallet</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-slate-400">Factory</span>
                                        <span className="font-mono text-xs text-slate-300">{CONTRACT_ADDRESSES.folderEscrowFactory?.slice(0, 6)}...{CONTRACT_ADDRESSES.folderEscrowFactory?.slice(-4)}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-slate-400">Network</span>
                                        <Badge variant="info-light" size="sm">Sepolia</Badge>
                                    </div>
                                </div>
                            </section>

                            {!isConnected && (
                                <Alert variant="warning">Connect a wallet to create a folder.</Alert>
                            )}
                            {formError && (
                                <Alert variant="destructive">{formError}</Alert>
                            )}
                        </div>

                        <footer className="flex shrink-0 justify-end gap-3 border-t border-white/10 px-5 py-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateFolder}
                                disabled={actionPending || !isConnected || !newFolderName.trim()}
                            >
                                {actionPending ? 'Creating...' : 'Create Folder'}
                            </Button>
                        </footer>
                    </div>
                </Drawer>


                {showBridgeModal && (
                    <Dialog
                        open={showBridgeModal}
                        onClose={() => setShowBridgeModal(false)}
                        title="Treasury to Folder"
                        maxWidth="max-w-2xl"
                    >
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
                                <Alert
                                    variant={bridgeStatus.type === 'success' ? 'success' : 'destructive'}
                                    className="mb-4"
                                >
                                    {bridgeStatus.message}
                                </Alert>
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
                    </Dialog>
                )}

                {showAllocationModal && (
                    <Dialog
                        open={showAllocationModal}
                        onClose={() => setShowAllocationModal(false)}
                        title="Add Wallet"
                        maxWidth="max-w-2xl"
                    >
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-2xl w-full space-y-6">
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
                                            <option value={-1}>Select a folder</option>
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
                                        <label className="text-gray-400 text-sm mb-2 block">Wallet Name</label>
                                        <input
                                            type="text"
                                            value={allocationForm.walletName}
                                            onChange={e => setAllocationForm(prev => ({ ...prev, walletName: e.target.value }))}
                                            placeholder="John Doe - Founder"
                                            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white"
                                        />
                                        <p className="text-gray-500 text-xs mt-1">Human-readable name for this wallet</p>
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
                                <Alert variant="destructive">{formError}</Alert>
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
                                    disabled={actionPending || !isConnected || allocationForm.folderId === -1 || !allocationForm.account || !allocationForm.amount}
                                >
                                    {actionPending ? 'Adding Beneficiary...' : 'Add Beneficiary'}
                                </button>
                            </div>
                        </div>
                    </Dialog>
                )}

                {showApproveFolderModal && (
                    <Dialog
                        open={showApproveFolderModal}
                        onClose={() => setShowApproveFolderModal(false)}
                        title="Approve Folder"
                        maxWidth="max-w-md"
                    >
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full space-y-4">
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
                            {formError && <Alert variant="destructive">{formError}</Alert>}
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
                    </Dialog>
                )}

                {showSendToFolderModal && (
                    <Dialog
                        open={showSendToFolderModal}
                        onClose={() => setShowSendToFolderModal(false)}
                        title="Fund Folder"
                        maxWidth="max-w-md"
                    >
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full space-y-4">
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
                            {formError && <Alert variant="destructive">{formError}</Alert>}
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
                    </Dialog>
                )}

                {showPermissionsModal && (
                    <Dialog
                        open={showPermissionsModal}
                        onClose={() => setShowPermissionsModal(false)}
                        title="Set Folder Permissions"
                        maxWidth="max-w-md"
                    >
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full space-y-4">
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
                    </Dialog>
                )}

                {showVestingModal && (
                    <Dialog
                        open={showVestingModal}
                        onClose={() => setShowVestingModal(false)}
                        title="Update Vesting Template"
                        maxWidth="max-w-md"
                    >
                        <div className="bg-slate-900 rounded-xl p-8 border border-white/20 max-w-md w-full space-y-4">
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
                    </Dialog>
                )}

                <Drawer
                    open={showProposalDrawer}
                    onClose={() => setShowProposalDrawer(false)}
                    title="Create proposal"
                    maxWidth="max-w-3xl"
                >
                    <div className="admin-panel-form flex h-full min-h-full flex-col overflow-hidden border-l border-white/10 bg-[#0d0d0d]">
                        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-cyan-300">Governance</p>
                                <h3 className="mt-1 flex items-center gap-2 text-base font-semibold text-white">
                                    <Gavel className="size-4 text-cyan-300" aria-hidden="true" />
                                    Create proposal
                                </h3>
                            </div>
                            <button
                                type="button"
                                aria-label="Close proposal drawer"
                                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                                onClick={() => setShowProposalDrawer(false)}
                            >
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </header>

                        <div className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
                            {proposalAlert && (
                                <Alert variant={proposalAlert.type === 'success' ? 'success' : 'destructive'}>
                                    {proposalAlert.message}
                                </Alert>
                            )}

                            <div className="space-y-4">
                                <Field id="proposal-title" label="Proposal title" required>
                                    <Input
                                        id="proposal-title"
                                        value={proposalForm.title}
                                        onChange={e => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enable transfers or upgrade contracts"
                                    />
                                </Field>
                                <Field
                                    id="proposal-description"
                                    label="Description"
                                    required
                                    description="Explain the motivation, execution steps, and expected results. Markdown is supported."
                                >
                                    <textarea
                                        id="proposal-description"
                                        value={proposalForm.description}
                                        onChange={e => setProposalForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={4}
                                        placeholder="Describe the proposal..."
                                        className="min-h-28 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-3 focus:ring-cyan-400/10"
                                    />
                                </Field>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-white">Proposal actions</p>
                                        <p className="mt-1 text-xs text-slate-400">Each action is one contract call in the proposal.</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addProposalAction}>
                                        <Plus className="size-4" aria-hidden="true" /> Add action
                                    </Button>
                                </div>

                                {proposalActions.map((action, index) => (
                                    <section key={`proposal-action-${index}`} className="space-y-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="text-sm font-medium text-slate-200">Action {index + 1}</h4>
                                            {proposalActions.length > 1 && (
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeProposalAction(index)}>
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                        <Field id={`proposal-preset-${index}`} label="Quick preset">
                                            <NativeSelect
                                                id={`proposal-preset-${index}`}
                                                defaultValue=""
                                                onChange={event => {
                                                    const presetKey = event.target.value;
                                                    if (!presetKey) return;
                                                    applyTokenFunctionPreset(index, presetKey);
                                                    event.currentTarget.value = '';
                                                }}
                                            >
                                                <option value="" disabled>
                                                    Select a function
                                                </option>
                                                <optgroup label="NYAX Token">
                                                    {PROPOSAL_FUNCTION_PRESETS.filter(p => p.group === 'NYAX Token').map(preset => (
                                                        <option key={preset.key} value={preset.key}>
                                                            {preset.label}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Treasury">
                                                    {PROPOSAL_FUNCTION_PRESETS.filter(p => p.group === 'Treasury').map(preset => (
                                                        <option key={preset.key} value={preset.key}>
                                                            {preset.label}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </NativeSelect>
                                        </Field>
                                        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(8rem,0.7fr)]">
                                            <Field id={`proposal-target-${index}`} label="Target contract" required>
                                                <Input
                                                    id={`proposal-target-${index}`}
                                                    type="text"
                                                    value={action.target}
                                                    onChange={e => updateProposalAction(index, 'target', e.target.value)}
                                                    placeholder="0x…"
                                                />
                                            </Field>
                                            <Field id={`proposal-value-${index}`} label="ETH value">
                                                <Input
                                                    id={`proposal-value-${index}`}
                                                    type="text"
                                                    value={action.value}
                                                    onChange={e => updateProposalAction(index, 'value', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </Field>
                                        </div>
                                        <Field
                                            id={`proposal-calldata-${index}`}
                                            label="Calldata"
                                            description="Enter encoded contract calldata, or use a preset above."
                                        >
                                            <Input
                                                id={`proposal-calldata-${index}`}
                                                type="text"
                                                value={action.calldata}
                                                onChange={e => updateProposalAction(index, 'calldata', e.target.value)}
                                                placeholder="0x"
                                            />
                                        </Field>
                                    </section>
                                ))}
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs text-slate-400">
                                Governor requires <span className="font-semibold text-white">1,000,000 gNYAX</span> voting power.
                                Hold tokens and <span className="font-semibold text-white">delegate to yourself</span> before creating a proposal.
                            </div>

                            {!isConnected && <Alert variant="warning">Connect your wallet to create proposals.</Alert>}
                            {isConnected && !hasSigner && (
                                <Alert variant="warning">Wallet connected, but signer is not ready. Reconnect your wallet and try again.</Alert>
                            )}
                            {!onRequiredNetwork && isConnected && (
                                <Alert variant="warning">Switch to Ethereum Sepolia (chain ID 11155111) to submit this proposal.</Alert>
                            )}
                        </div>

                        <footer className="flex shrink-0 justify-end gap-3 border-t border-white/10 px-5 py-3">
                            <Button variant="outline" onClick={() => setShowProposalDrawer(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateProposal} disabled={proposalSubmitting || !isConnected}>
                                {proposalSubmitting ? 'Submitting...' : 'Create proposal'}
                            </Button>
                        </footer>
                    </div>
                </Drawer>
        </div>


    );
}