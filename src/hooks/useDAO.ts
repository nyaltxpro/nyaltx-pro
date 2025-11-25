'use client'
import { DAOService, initializeDAOService } from '@/services/contracts/dao';
import {
  GovernanceStats,
  TokenInfo,
  TreasuryCategory,
  TreasuryStats,
  VotingPower
} from '@/services/contracts/types';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

export const useDAO = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [daoService, setDaoService] = useState<DAOService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize DAO service
  useEffect(() => {
    const initService = async () => {
      try {
        // Use window.ethereum as provider
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          let signer = undefined;
          
          if (walletClient && isConnected) {
            signer = await provider.getSigner();
          }
          
          const service = initializeDAOService(provider, signer);
          setDaoService(service);
          setIsInitialized(true);
          setError(null);
        } else {
          throw new Error('No Ethereum provider found');
        }
      } catch (err) {
        console.error('Failed to initialize DAO service:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize DAO service');
        setIsInitialized(false);
      }
    };

    initService();
  }, [walletClient, isConnected]);

  // Token functions
  const getTokenInfo = useCallback(async (): Promise<TokenInfo | null> => {
    if (!daoService) return null;
    try {
      return await daoService.getTokenInfo();
    } catch (err) {
      console.error('Failed to get token info:', err);
      setError(err instanceof Error ? err.message : 'Failed to get token info');
      return null;
    }
  }, [daoService]);

  const getTokenBalance = useCallback(async (userAddress?: string): Promise<string | null> => {
    if (!daoService) return null;
    const targetAddress = userAddress || address;
    if (!targetAddress) return null;
    
    try {
      return await daoService.getTokenBalance(targetAddress);
    } catch (err) {
      console.error('Failed to get token balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to get token balance');
      return null;
    }
  }, [daoService, address]);

  const getVotingPower = useCallback(async (userAddress?: string): Promise<VotingPower | null> => {
    if (!daoService) return null;
    const targetAddress = userAddress || address;
    if (!targetAddress) return null;
    
    try {
      return await daoService.getVotingPower(targetAddress);
    } catch (err) {
      console.error('Failed to get voting power:', err);
      setError(err instanceof Error ? err.message : 'Failed to get voting power');
      return null;
    }
  }, [daoService, address]);

  const delegateVotes = useCallback(async (delegatee: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.delegateVotes(delegatee);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to delegate votes:', err);
      setError(err instanceof Error ? err.message : 'Failed to delegate votes');
      return false;
    }
  }, [daoService, isConnected]);

  // Admin token functions
  const mintTokens = useCallback(async (to: string, amount: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.mintTokens(to, amount);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to mint tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint tokens');
      return false;
    }
  }, [daoService, isConnected]);

  const burnTokens = useCallback(async (from: string, amount: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.burnTokens(from, amount);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to burn tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to burn tokens');
      return false;
    }
  }, [daoService, isConnected]);

  const setBlacklisted = useCallback(async (account: string, isBlacklisted: boolean): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.setBlacklisted(account, isBlacklisted);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to set blacklist:', err);
      setError(err instanceof Error ? err.message : 'Failed to set blacklist');
      return false;
    }
  }, [daoService, isConnected]);

  const setTransfersEnabled = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.setTransfersEnabled(enabled);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to set transfers enabled:', err);
      setError(err instanceof Error ? err.message : 'Failed to set transfers enabled');
      return false;
    }
  }, [daoService, isConnected]);

  const recoverETH = useCallback(async (): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.recoverETH();
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to recover ETH:', err);
      setError(err instanceof Error ? err.message : 'Failed to recover ETH');
      return false;
    }
  }, [daoService, isConnected]);

  const batchSetBlacklisted = useCallback(async (accounts: string[], isBlacklisted: boolean): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.batchSetBlacklisted(accounts, isBlacklisted);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to batch set blacklist:', err);
      setError(err instanceof Error ? err.message : 'Failed to batch set blacklist');
      return false;
    }
  }, [daoService, isConnected]);

  const recoverERC20 = useCallback(async (tokenAddress: string, amount: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.recoverERC20(tokenAddress, amount);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to recover ERC20:', err);
      setError(err instanceof Error ? err.message : 'Failed to recover ERC20');
      return false;
    }
  }, [daoService, isConnected]);

  const isBlacklisted = useCallback(async (address: string): Promise<boolean | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.isBlacklisted(address);
    } catch (err) {
      console.error('Failed to check blacklist status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check blacklist status');
      return null;
    }
  }, [daoService]);

  // Governance functions
  const getGovernanceStats = useCallback(async (): Promise<GovernanceStats | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.getGovernanceStats();
    } catch (err) {
      console.error('Failed to get governance stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to get governance stats');
      return null;
    }
  }, [daoService]);

  const createProposal = useCallback(async (
    targets: string[],
    values: string[],
    calldatas: string[],
    description: string
  ): Promise<string | null> => {
    if (!daoService || !isConnected) return null;
    
    try {
      const tx = await daoService.createProposal(targets, values, calldatas, description);
      const receipt = await tx.wait();
      return receipt?.hash || null;
    } catch (err) {
      console.error('Failed to create proposal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
      return null;
    }
  }, [daoService, isConnected]);

  const castVote = useCallback(async (
    proposalId: string,
    support: 0 | 1 | 2,
    reason?: string
  ): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.castVote(proposalId, support, reason);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to cast vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to cast vote');
      return false;
    }
  }, [daoService, isConnected]);

  const getProposalState = useCallback(async (proposalId: string): Promise<string | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.getProposalState(proposalId);
    } catch (err) {
      console.error('Failed to get proposal state:', err);
      setError(err instanceof Error ? err.message : 'Failed to get proposal state');
      return null;
    }
  }, [daoService]);

  const getProposalVotes = useCallback(async (proposalId: string) => {
    if (!daoService) return null;
    
    try {
      return await daoService.getProposalVotes(proposalId);
    } catch (err) {
      console.error('Failed to get proposal votes:', err);
      setError(err instanceof Error ? err.message : 'Failed to get proposal votes');
      return null;
    }
  }, [daoService]);

  // Treasury functions
  const getTreasuryStats = useCallback(async (): Promise<TreasuryStats | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.getTreasuryStats();
    } catch (err) {
      console.error('Failed to get treasury stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to get treasury stats');
      return null;
    }
  }, [daoService]);

  const getTreasuryCategories = useCallback(async (): Promise<TreasuryCategory[] | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.getTreasuryCategories();
    } catch (err) {
      console.error('Failed to get treasury categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to get treasury categories');
      return null;
    }
  }, [daoService]);

  const mintToTreasury = useCallback(async (amount: string, reason: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.mintToTreasury(amount, reason);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to mint to treasury:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint to treasury');
      return false;
    }
  }, [daoService, isConnected]);

  const setCategoryWallet = useCallback(async (category: string, wallet: string, allocation: number): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.setCategoryWallet(category, wallet, allocation);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to set category wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to set category wallet');
      return false;
    }
  }, [daoService, isConnected]);

  const removeCategory = useCallback(async (category: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.removeCategory(category);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to remove category:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove category');
      return false;
    }
  }, [daoService, isConnected]);

  const transferTo = useCallback(async (to: string, amount: string, reason: string, category: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.transferTo(to, amount, reason, category);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to transfer:', err);
      setError(err instanceof Error ? err.message : 'Failed to transfer');
      return false;
    }
  }, [daoService, isConnected]);

  const multisigTransfer = useCallback(async (to: string, amount: string, reason: string, category: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.multisigTransfer(to, amount, reason, category);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to multisig transfer:', err);
      setError(err instanceof Error ? err.message : 'Failed to multisig transfer');
      return false;
    }
  }, [daoService, isConnected]);

  const mintTo = useCallback(async (to: string, amount: string, reason: string, category: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.mintTo(to, amount, reason, category);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to mint to address:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint to address');
      return false;
    }
  }, [daoService, isConnected]);

  const burnFromTreasury = useCallback(async (amount: string, reason: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.burnFromTreasury(amount, reason);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to burn from treasury:', err);
      setError(err instanceof Error ? err.message : 'Failed to burn from treasury');
      return false;
    }
  }, [daoService, isConnected]);

  const requiresMultisig = useCallback(async (amount: string): Promise<boolean | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.requiresMultisig(amount);
    } catch (err) {
      console.error('Failed to check multisig requirement:', err);
      setError(err instanceof Error ? err.message : 'Failed to check multisig requirement');
      return null;
    }
  }, [daoService]);

  // Multisig functions
  const getMultisigInfo = useCallback(async () => {
    if (!daoService) return null;
    
    try {
      return await daoService.getMultisigInfo();
    } catch (err) {
      console.error('Failed to get multisig info:', err);
      setError(err instanceof Error ? err.message : 'Failed to get multisig info');
      return null;
    }
  }, [daoService]);

  const submitMultisigTransaction = useCallback(async (
    to: string,
    value: string,
    data: string
  ): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.submitMultisigTransaction(to, value, data);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to submit multisig transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit multisig transaction');
      return false;
    }
  }, [daoService, isConnected]);

  const confirmMultisigTransaction = useCallback(async (txIndex: number): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.confirmMultisigTransaction(txIndex);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to confirm multisig transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to confirm multisig transaction');
      return false;
    }
  }, [daoService, isConnected]);

  const executeMultisigTransaction = useCallback(async (txIndex: number): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.executeMultisigTransaction(txIndex);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to execute multisig transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute multisig transaction');
      return false;
    }
  }, [daoService, isConnected]);

  const revokeConfirmation = useCallback(async (txIndex: number): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.revokeConfirmation(txIndex);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to revoke confirmation:', err);
      setError(err instanceof Error ? err.message : 'Failed to revoke confirmation');
      return false;
    }
  }, [daoService, isConnected]);

  const getMultisigTransaction = useCallback(async (txIndex: number) => {
    if (!daoService) return null;
    
    try {
      return await daoService.getMultisigTransaction(txIndex);
    } catch (err) {
      console.error('Failed to get multisig transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to get multisig transaction');
      return null;
    }
  }, [daoService]);

  const isConfirmed = useCallback(async (txIndex: number, owner: string): Promise<boolean | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.isConfirmed(txIndex, owner);
    } catch (err) {
      console.error('Failed to check confirmation:', err);
      setError(err instanceof Error ? err.message : 'Failed to check confirmation');
      return null;
    }
  }, [daoService]);

  const isOwner = useCallback(async (address: string): Promise<boolean | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.isOwner(address);
    } catch (err) {
      console.error('Failed to check owner status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check owner status');
      return null;
    }
  }, [daoService]);

  // Vesting functions
  const createVestingContract = useCallback(async (category: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.createVestingContract(category);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to create vesting contract:', err);
      setError(err instanceof Error ? err.message : 'Failed to create vesting contract');
      return false;
    }
  }, [daoService, isConnected]);

  const getVestingContracts = useCallback(async (category?: string): Promise<string[] | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.getVestingContracts(category);
    } catch (err) {
      console.error('Failed to get vesting contracts:', err);
      setError(err instanceof Error ? err.message : 'Failed to get vesting contracts');
      return null;
    }
  }, [daoService]);

  const getVestingCategories = useCallback(async (): Promise<string[] | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.getVestingCategories();
    } catch (err) {
      console.error('Failed to get vesting categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to get vesting categories');
      return null;
    }
  }, [daoService]);

  const createVestingSchedule = useCallback(async (
    vestingWalletAddress: string,
    beneficiary: string,
    totalAmount: string,
    start: number,
    cliffDuration: number,
    duration: number,
    revocable: boolean,
    category: string
  ): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.createVestingSchedule(
        vestingWalletAddress,
        beneficiary,
        totalAmount,
        start,
        cliffDuration,
        duration,
        revocable,
        category
      );
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to create vesting schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to create vesting schedule');
      return false;
    }
  }, [daoService, isConnected]);

  const releaseVestedTokens = useCallback(async (vestingWalletAddress: string, scheduleId: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.releaseVestedTokens(vestingWalletAddress, scheduleId);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to release vested tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to release vested tokens');
      return false;
    }
  }, [daoService, isConnected]);

  const revokeVesting = useCallback(async (vestingWalletAddress: string, scheduleId: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.revokeVesting(vestingWalletAddress, scheduleId);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to revoke vesting:', err);
      setError(err instanceof Error ? err.message : 'Failed to revoke vesting');
      return false;
    }
  }, [daoService, isConnected]);

  const getVestingSchedule = useCallback(async (vestingWalletAddress: string, scheduleId: string) => {
    if (!daoService) return null;
    
    try {
      return await daoService.getVestingSchedule(vestingWalletAddress, scheduleId);
    } catch (err) {
      console.error('Failed to get vesting schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to get vesting schedule');
      return null;
    }
  }, [daoService]);

  const getReleasableAmount = useCallback(async (vestingWalletAddress: string, scheduleId: string): Promise<string | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.getReleasableAmount(vestingWalletAddress, scheduleId);
    } catch (err) {
      console.error('Failed to get releasable amount:', err);
      setError(err instanceof Error ? err.message : 'Failed to get releasable amount');
      return null;
    }
  }, [daoService]);

  const getBeneficiarySchedules = useCallback(async (vestingWalletAddress: string, beneficiary: string): Promise<string[] | null> => {
    if (!daoService) return null;
    
    try {
      return await daoService.getBeneficiarySchedules(vestingWalletAddress, beneficiary);
    } catch (err) {
      console.error('Failed to get beneficiary schedules:', err);
      setError(err instanceof Error ? err.message : 'Failed to get beneficiary schedules');
      return null;
    }
  }, [daoService]);

  const toggleVestingPause = useCallback(async (vestingWalletAddress: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.toggleVestingPause(vestingWalletAddress);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to toggle vesting pause:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle vesting pause');
      return false;
    }
  }, [daoService, isConnected]);

  // Emergency functions
  const emergencyRecoverERC20 = useCallback(async (tokenAddress: string, amount: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.emergencyRecoverERC20(tokenAddress, amount);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to emergency recover ERC20:', err);
      setError(err instanceof Error ? err.message : 'Failed to emergency recover ERC20');
      return false;
    }
  }, [daoService, isConnected]);

  const emergencyRecoverETH = useCallback(async (): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.emergencyRecoverETH();
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to emergency recover ETH:', err);
      setError(err instanceof Error ? err.message : 'Failed to emergency recover ETH');
      return false;
    }
  }, [daoService, isConnected]);

  const createEmergencyProposal = useCallback(async (
    targets: string[],
    values: string[],
    calldatas: string[],
    description: string
  ): Promise<string | null> => {
    if (!daoService || !isConnected) return null;
    
    try {
      const tx = await daoService.createEmergencyProposal(targets, values, calldatas, description);
      const receipt = await tx.wait();
      return receipt?.hash || null;
    } catch (err) {
      console.error('Failed to create emergency proposal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create emergency proposal');
      return null;
    }
  }, [daoService, isConnected]);

  const enableFastTrack = useCallback(async (proposalId: string): Promise<boolean> => {
    if (!daoService || !isConnected) return false;
    
    try {
      const tx = await daoService.enableFastTrack(proposalId);
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Failed to enable fast track:', err);
      setError(err instanceof Error ? err.message : 'Failed to enable fast track');
      return false;
    }
  }, [daoService, isConnected]);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isInitialized,
    isConnected,
    address,
    error,
    
    // Token functions
    getTokenInfo,
    getTokenBalance,
    getVotingPower,
    delegateVotes,
    
    // Admin token functions
    mintTokens,
    burnTokens,
    setBlacklisted,
    setTransfersEnabled,
    recoverETH,
    batchSetBlacklisted,
    recoverERC20,
    isBlacklisted,
    
    // Governance functions
    getGovernanceStats,
    createProposal,
    castVote,
    getProposalState,
    getProposalVotes,
    
    // Treasury functions
    getTreasuryStats,
    getTreasuryCategories,
    mintToTreasury,
    setCategoryWallet,
    removeCategory,
    transferTo,
    multisigTransfer,
    mintTo,
    burnFromTreasury,
    requiresMultisig,
    
    // Multisig functions
    getMultisigInfo,
    submitMultisigTransaction,
    confirmMultisigTransaction,
    executeMultisigTransaction,
    revokeConfirmation,
    getMultisigTransaction,
    isConfirmed,
    isOwner,
    
    // Vesting functions
    createVestingContract,
    getVestingContracts,
    getVestingCategories,
    createVestingSchedule,
    releaseVestedTokens,
    revokeVesting,
    getVestingSchedule,
    getReleasableAmount,
    getBeneficiarySchedules,
    toggleVestingPause,
    
    // Emergency functions
    emergencyRecoverERC20,
    emergencyRecoverETH,
    createEmergencyProposal,
    enableFastTrack,
    
    // Utilities
    clearError,
  };
};
