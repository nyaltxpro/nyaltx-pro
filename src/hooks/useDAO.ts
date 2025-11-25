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
    
    // Multisig functions
    getMultisigInfo,
    submitMultisigTransaction,
    
    // Vesting functions
    createVestingContract,
    getVestingContracts,
    getVestingCategories,
    
    // Utilities
    clearError,
  };
};
