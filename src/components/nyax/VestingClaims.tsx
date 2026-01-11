'use client'

import { createFolderEscrowService } from '@/services/contracts/folderEscrowService';
import { getFolderRegistryFactoryService } from '@/services/contracts/folderRegistryFactoryService';
import { ethers } from 'ethers';
import { Calendar, CheckCircle, Clock, Coins, Lock, TrendingUp, Unlock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

interface VestingAllocation {
    folderId: number;
    folderName: string;
    totalAmount: string;
    claimedAmount: string;
    unlockedAmount: string;
    vestingStart: number;
    vestingCliff: number;
    vestingDuration: number;
    revocable: boolean;
    revoked: boolean;
    permissions: number;
    contractType: 'registry' | 'escrow';
    contractAddress?: string;
    paused?: boolean;
    cancelled?: boolean;
}

const formatNumber = (value: string | number, decimals = 2) => {
    const numeric = typeof value === 'string' ? parseFloat(value) : value;
    if (!Number.isFinite(numeric)) return '0';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(numeric);
};

const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatDuration = (seconds: number) => {
    if (!seconds) return 'Instant';
    const days = Math.floor(seconds / 86400);
    if (days > 0) return `${days} days`;
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours} hours`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
};

export default function VestingClaims() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

    const [allocations, setAllocations] = useState<VestingAllocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [claimingFolderId, setClaimingFolderId] = useState<number | null>(null);
    const [claimSuccess, setClaimSuccess] = useState<{ folderId: number; amount: string } | null>(null);

    const REQUIRED_CHAIN_ID = 11155111; // Ethereum Sepolia
    const onRequiredNetwork = chainId === REQUIRED_CHAIN_ID;

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

    const loadVestingAllocations = useCallback(async () => {
        if (!address || !isConnected) return;

        setLoading(true);
        setError(null);

        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not detected');
            }

            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const factoryService = getFolderRegistryFactoryService(provider);

            const userAllocations: VestingAllocation[] = [];

            // 1. Load allocations from FolderRegistry
            try {
                const folderCount = await factoryService.getFolderCount();
                console.log('Total FolderRegistry folders:', folderCount);

                for (let folderId = 1; folderId <= folderCount; folderId++) {
                    try {
                        const folder = await factoryService.getFolder(folderId);
                        if (!folder || !folder.exists) continue;

                        const members = folder.members || [];
                        if (!members.includes(address)) continue;

                        const allocation = await factoryService.getAllocation(folderId, address);

                        if (allocation && allocation.exists) {
                            const unlockedAmount = await factoryService.getUnlockedTokens(folderId, address);

                            userAllocations.push({
                                folderId,
                                folderName: folder.name,
                                totalAmount: allocation.amount,
                                claimedAmount: allocation.claimed,
                                unlockedAmount: ethers.formatEther(unlockedAmount),
                                vestingStart: allocation.vesting.start,
                                vestingCliff: allocation.vesting.cliff,
                                vestingDuration: allocation.vesting.duration,
                                revocable: allocation.vesting.revocable,
                                revoked: allocation.vesting.revoked,
                                permissions: allocation.permissions,
                                contractType: 'registry',
                            });
                        }
                    } catch (err) {
                        console.error(`Error loading FolderRegistry folder ${folderId}:`, err);
                    }
                }
            } catch (err) {
                console.error('Error loading FolderRegistry allocations:', err);
            }

            // 2. Load allocations from FolderEscrow contracts
            try {
                // Get all folder escrow contracts from the factory
                const allFolders = await factoryService.getAllFolders();
                console.log('Total FolderEscrow folders:', allFolders.length);

                for (const folderAddress of allFolders) {
                    try {
                        const escrowService = createFolderEscrowService(folderAddress, provider);

                        // Check if user is a beneficiary by checking their beneficiary IDs
                        const beneficiaryIds = await escrowService.getBeneficiaryIdsByWallet(address);
                        if (beneficiaryIds.length === 0) continue;

                        // Get beneficiary info and vesting calculation
                        const [beneficiaryInfo, vestingCalc, folderName] = await Promise.all([
                            escrowService.getBeneficiaryInfo(address),
                            escrowService.calculateVesting(address),
                            escrowService.getFolderName()
                        ]);

                        userAllocations.push({
                            folderId: userAllocations.length + 1, // Use index as ID for escrow
                            folderName: folderName || 'Escrow Folder',
                            totalAmount: ethers.formatEther(beneficiaryInfo.totalAllocation),
                            claimedAmount: ethers.formatEther(beneficiaryInfo.claimed),
                            unlockedAmount: ethers.formatEther(vestingCalc.vested),
                            vestingStart: Number(beneficiaryInfo.start),
                            vestingCliff: Number(beneficiaryInfo.cliff),
                            vestingDuration: Number(beneficiaryInfo.duration),
                            revocable: false,
                            revoked: beneficiaryInfo.cancelled,
                            permissions: 0,
                            contractType: 'escrow',
                            contractAddress: folderAddress,
                            paused: beneficiaryInfo.paused,
                            cancelled: beneficiaryInfo.cancelled,
                        });
                    } catch (err) {
                        console.error(`Error loading FolderEscrow ${folderAddress}:`, err);
                    }
                }
            } catch (err) {
                console.error('Error loading FolderEscrow allocations:', err);
            }

            setAllocations(userAllocations);
        } catch (err) {
            console.error('Failed to load vesting allocations:', err);
            setError(err instanceof Error ? err.message : 'Failed to load vesting data');
        } finally {
            setLoading(false);
        }
    }, [address, isConnected]);

    useEffect(() => {
        if (isConnected && onRequiredNetwork) {
            loadVestingAllocations();
        }
    }, [isConnected, onRequiredNetwork, loadVestingAllocations]);

    const handleClaim = async (allocation: VestingAllocation) => {
        if (!isConnected) {
            setError('Connect your wallet to claim tokens');
            return;
        }

        if (!onRequiredNetwork) {
            const switched = await handleSwitchNetwork();
            if (!switched) {
                setError('Switch to Ethereum Sepolia to claim tokens');
                return;
            }
        }

        const claimableAmount = parseFloat(allocation.unlockedAmount) - parseFloat(allocation.claimedAmount);
        if (claimableAmount <= 0) {
            setError('No tokens available to claim');
            return;
        }

        setClaimingFolderId(allocation.folderId);
        setError(null);
        setClaimSuccess(null);

        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not detected');
            }

            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();

            let txHash: string;

            if (allocation.contractType === 'escrow') {
                // Claim from FolderEscrow contract
                if (!allocation.contractAddress) {
                    throw new Error('Escrow contract address not found');
                }

                const escrowService = createFolderEscrowService(allocation.contractAddress, provider);
                const tx = await escrowService.claim(signer);
                console.log('Escrow claim transaction submitted:', tx);
                txHash = 'Transaction submitted successfully';
            } else {
                // Claim from FolderRegistry contract
                const factoryService = getFolderRegistryFactoryService(provider);
                txHash = await factoryService.claimAllocation(
                    allocation.folderId,
                    address!,
                    claimableAmount.toString()
                );
            }

            console.log('Claim transaction:', txHash);
            setClaimSuccess({ folderId: allocation.folderId, amount: claimableAmount.toString() });

            // Reload allocations after successful claim
            setTimeout(() => {
                loadVestingAllocations();
            }, 2000);
        } catch (err) {
            console.error('Failed to claim tokens:', err);
            setError(err instanceof Error ? err.message : 'Failed to claim tokens');
        } finally {
            setClaimingFolderId(null);
        }
    };

    const getVestingProgress = (allocation: VestingAllocation) => {
        const now = Math.floor(Date.now() / 1000);
        const start = allocation.vestingStart;
        const end = start + allocation.vestingDuration;

        if (now < start) return 0;
        if (now >= end) return 100;

        return ((now - start) / allocation.vestingDuration) * 100;
    };

    const getClaimableAmount = (allocation: VestingAllocation) => {
        const unlocked = parseFloat(allocation.unlockedAmount);
        const claimed = parseFloat(allocation.claimedAmount);
        return Math.max(0, unlocked - claimed);
    };

    if (!isConnected) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
                <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-gray-400">Connect your wallet to view and claim your vested tokens</p>
            </div>
        );
    }

    if (!onRequiredNetwork) {
        return (
            <div className="rounded-3xl border border-amber-300/40 bg-amber-400/10 p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/20 mb-4">
                    <TrendingUp className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-amber-200 mb-2">Switch Network</h3>
                <p className="text-amber-100/90 mb-4">
                    Vesting contracts are deployed on Sepolia. Please switch your wallet network.
                </p>
                <button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitching}
                    className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSwitching ? 'Switching…' : 'Switch to Sepolia'}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20">
                        <Coins className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Your Vesting Allocations</h2>
                </div>
                <p className="text-gray-400">
                    View and claim your vested gNYAX tokens from folder allocations
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="rounded-2xl border border-red-400/40 bg-red-400/10 p-4 text-red-200">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Success Display */}
            {claimSuccess && (
                <div className="rounded-2xl border border-green-400/40 bg-green-400/10 p-4 text-green-200">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-semibold">Claim Successful!</p>
                    </div>
                    <p className="text-sm mt-1">
                        Successfully claimed {formatNumber(claimSuccess.amount)} gNYAX tokens
                    </p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mb-4" />
                    <p className="text-gray-400">Loading your vesting allocations...</p>
                </div>
            )}

            {/* Allocations List */}
            {!loading && allocations.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">
                    <Unlock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Vesting Allocations</h3>
                    <p className="text-gray-400">You don't have any vesting allocations yet</p>
                </div>
            )}

            {!loading && allocations.length > 0 && (
                <div className="grid gap-6">
                    {allocations.map((allocation) => {
                        const progress = getVestingProgress(allocation);
                        const claimableAmount = getClaimableAmount(allocation);
                        const isClaiming = claimingFolderId === allocation.folderId;

                        return (
                            <div
                                key={allocation.folderId}
                                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-cyan-400/40 transition-colors"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-1">
                                            {allocation.folderName}
                                        </h3>
                                        <p className="text-sm text-gray-400">Folder ID: {allocation.folderId}</p>
                                    </div>
                                    {allocation.revoked && (
                                        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium">
                                            Revoked
                                        </span>
                                    )}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Allocated</p>
                                        <p className="text-lg font-semibold text-white">{formatNumber(allocation.totalAmount)}</p>
                                        <p className="text-xs text-gray-400">gNYAX</p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unlocked</p>
                                        <p className="text-lg font-semibold text-cyan-400">{formatNumber(allocation.unlockedAmount)}</p>
                                        <p className="text-xs text-gray-400">gNYAX</p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Claimed</p>
                                        <p className="text-lg font-semibold text-green-400">{formatNumber(allocation.claimedAmount)}</p>
                                        <p className="text-xs text-gray-400">gNYAX</p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Claimable</p>
                                        <p className="text-lg font-semibold text-yellow-400">{formatNumber(claimableAmount)}</p>
                                        <p className="text-xs text-gray-400">gNYAX</p>
                                    </div>
                                </div>

                                {/* Vesting Progress */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">Vesting Progress</span>
                                        <span className="text-sm font-semibold text-cyan-400">{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-black/50 overflow-hidden">
                                        <div
                                            className="h-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Vesting Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-500">Start Date</p>
                                            <p className="text-white font-medium">{formatDate(allocation.vestingStart)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-500">Cliff Period</p>
                                            <p className="text-white font-medium">{formatDuration(allocation.vestingCliff)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm">
                                        <TrendingUp className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-500">Duration</p>
                                            <p className="text-white font-medium">{formatDuration(allocation.vestingDuration)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Claim Button */}
                                <button
                                    onClick={() => handleClaim(allocation)}
                                    disabled={claimableAmount <= 0 || isClaiming || allocation.revoked}
                                    className="w-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-cyan-500 disabled:hover:to-blue-500"
                                >
                                    {isClaiming ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            Claiming...
                                        </span>
                                    ) : claimableAmount <= 0 ? (
                                        'No Tokens to Claim'
                                    ) : allocation.revoked ? (
                                        'Allocation Revoked'
                                    ) : (
                                        `Claim ${formatNumber(claimableAmount)} gNYAX`
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
