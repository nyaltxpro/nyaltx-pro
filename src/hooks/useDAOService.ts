'use client';
import { DAOService, createDAOService } from '@/services/contracts';
import { GovernanceStats, ProposalData, TreasuryStats, VotingPower } from '@/services/contracts/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

let cachedDAOService: DAOService | null = null;
let daoServiceInitPromise: Promise<DAOService> | null = null;
let hasValidatedContracts = false;

export function useDAOService() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [daoService, setDAOService] = useState<DAOService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize DAO service
  useEffect(() => {
    let isMounted = true;

    const initService = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (cachedDAOService) {
          if (isMounted) {
            setDAOService(cachedDAOService);
            setIsLoading(false);
          }
          return;
        }

        if (!daoServiceInitPromise) {
          daoServiceInitPromise = createDAOService()
            .then(service => {
              cachedDAOService = service;
              return service;
            })
            .finally(() => {
              daoServiceInitPromise = null;
            });
        }

        const service = await daoServiceInitPromise;
        if (!isMounted) return;
        setDAOService(service);

        if (!hasValidatedContracts) {
          const validation = await service.validateContracts();
          const hasValidContracts = Object.values(validation).some(Boolean);

          if (!hasValidContracts) {
            setError('No valid contracts found. Please check contract addresses.');
          }

          hasValidatedContracts = true;
        }
      } catch (err) {
        console.error('Failed to initialize DAO service:', err);
        if (isMounted) {
          setError('Failed to initialize DAO service');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initService();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update service when wallet client changes
  useEffect(() => {
    if (daoService && walletClient) {
      // In production, you'd update the service with the new wallet client
      // daoService.updateSigner(walletClient);
    }
  }, [daoService, walletClient]);

  return {
    daoService,
    isLoading,
    error,
    isConnected,
    address,
  };
}

export function useGovernance() {
  const { daoService, isLoading: serviceLoading } = useDAOService();
  const { address } = useAccount();
  
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [votingPower, setVotingPower] = useState<VotingPower | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    if (!daoService) return;
    
    try {
      const allProposals = await daoService.governance.getAllProposals();
      setProposals(allProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  }, [daoService]);

  const fetchStats = useCallback(async () => {
    if (!daoService) return;
    
    try {
      const governanceStats = await daoService.governance.getGovernanceStats();
      setStats(governanceStats);
    } catch (error) {
      console.error('Error fetching governance stats:', error);
    }
  }, [daoService]);

  const fetchVotingPower = useCallback(async () => {
    if (!daoService || !address) return;
    
    try {
      const [balance, votes, delegatedTo] = await Promise.all([
        daoService.treasury.getTokenInfo().then(info => info.totalSupply), // User balance would need separate call
        daoService.governance.getVotingPower(address),
        daoService.governance.getDelegatedTo(address),
      ]);
      
      setVotingPower({
        balance: '0', // Would need to fetch user's actual balance
        votes,
        delegatedTo,
        delegatedFrom: [], // Would need to track delegation events
      });
    } catch (error) {
      console.error('Error fetching voting power:', error);
    }
  }, [daoService, address]);

  useEffect(() => {
    if (!serviceLoading && daoService) {
      setIsLoading(true);
      Promise.all([
        fetchProposals(),
        fetchStats(),
        fetchVotingPower(),
      ]).finally(() => setIsLoading(false));
    }
  }, [serviceLoading, daoService, fetchProposals, fetchStats, fetchVotingPower]);

  const createProposal = useCallback(async (
    targets: string[],
    values: string[],
    calldatas: string[],
    description: string,
    isEmergency = false
  ) => {
    if (!daoService) throw new Error('DAO service not initialized');
    
    const proposalId = await daoService.governance.createProposal(
      targets,
      values,
      calldatas,
      description,
      isEmergency
    );
    
    // Refresh proposals
    await fetchProposals();
    return proposalId;
  }, [daoService, fetchProposals]);

  const castVote = useCallback(async (
    proposalId: string,
    support: 0 | 1 | 2,
    reason?: string
  ) => {
    if (!daoService) throw new Error('DAO service not initialized');
    
    const txHash = await daoService.governance.castVote(proposalId, support, reason);
    
    // Refresh proposals and voting power
    await Promise.all([fetchProposals(), fetchVotingPower()]);
    return txHash;
  }, [daoService, fetchProposals, fetchVotingPower]);

  const delegate = useCallback(async (delegatee: string) => {
    if (!daoService) throw new Error('DAO service not initialized');
    
    const txHash = await daoService.governance.delegate(delegatee);
    
    // Refresh voting power
    await fetchVotingPower();
    return txHash;
  }, [daoService, fetchVotingPower]);

  return {
    proposals,
    stats,
    votingPower,
    isLoading: isLoading || serviceLoading,
    createProposal,
    castVote,
    delegate,
    refetch: () => Promise.all([fetchProposals(), fetchStats(), fetchVotingPower()]),
  };
}

export function useTreasury() {
  const { daoService, isLoading: serviceLoading } = useDAOService();
  
  const [stats, setStats] = useState<TreasuryStats | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!daoService) return;
    
    try {
      const treasuryStats = await daoService.treasury.getTreasuryStats();
      setStats(treasuryStats);
    } catch (error) {
      console.error('Error fetching treasury stats:', error);
    }
  }, [daoService]);

  const fetchCategories = useCallback(async () => {
    if (!daoService) return;
    
    try {
      const allCategories = await daoService.treasury.getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [daoService]);

  useEffect(() => {
    if (!serviceLoading && daoService) {
      setIsLoading(true);
      Promise.all([
        fetchStats(),
        fetchCategories(),
      ]).finally(() => setIsLoading(false));
    }
  }, [serviceLoading, daoService, fetchStats, fetchCategories]);

  const transferTo = useCallback(async (
    to: string,
    amount: string,
    reason: string,
    category: string
  ) => {
    if (!daoService) throw new Error('DAO service not initialized');
    
    const txHash = await daoService.treasury.transferTo(to, amount, reason, category);
    
    // Refresh stats and categories
    await Promise.all([fetchStats(), fetchCategories()]);
    return txHash;
  }, [daoService, fetchStats, fetchCategories]);

  const mintTo = useCallback(async (
    to: string,
    amount: string,
    reason: string,
    category: string
  ) => {
    if (!daoService) throw new Error('DAO service not initialized');
    
    const txHash = await daoService.treasury.mintTo(to, amount, reason, category);
    
    // Refresh stats and categories
    await Promise.all([fetchStats(), fetchCategories()]);
    return txHash;
  }, [daoService, fetchStats, fetchCategories]);

  return {
    stats,
    categories,
    isLoading: isLoading || serviceLoading,
    transferTo,
    mintTo,
    refetch: () => Promise.all([fetchStats(), fetchCategories()]),
  };
}

export function useMultisig() {
  const { daoService, isLoading: serviceLoading } = useDAOService();
  const { address } = useAccount();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [multisigInfo, setMultisigInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!daoService) return;
    
    try {
      const allTransactions = await daoService.multisig.getAllTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching multisig transactions:', error);
    }
  }, [daoService]);

  const fetchMultisigInfo = useCallback(async () => {
    if (!daoService) return;
    
    try {
      const info = await daoService.multisig.getMultisigInfo();
      setMultisigInfo(info);
    } catch (error) {
      console.error('Error fetching multisig info:', error);
    }
  }, [daoService]);

  useEffect(() => {
    if (!serviceLoading && daoService) {
      setIsLoading(true);
      Promise.all([
        fetchTransactions(),
        fetchMultisigInfo(),
      ]).finally(() => setIsLoading(false));
    }
  }, [serviceLoading, daoService, fetchTransactions, fetchMultisigInfo]);

  const submitTransaction = useCallback(async (
    to: string,
    value: string,
    data: string = '0x'
  ) => {
    if (!daoService) throw new Error('DAO service not initialized');
    
    const txIndex = await daoService.multisig.submitTransaction(to, value, data);
    
    // Refresh transactions
    await fetchTransactions();
    return txIndex;
  }, [daoService, fetchTransactions]);

  const confirmTransaction = useCallback(async (txIndex: number) => {
    if (!daoService) throw new Error('DAO service not initialized');
    
    const txHash = await daoService.multisig.confirmTransaction(txIndex);
    
    // Refresh transactions
    await fetchTransactions();
    return txHash;
  }, [daoService, fetchTransactions]);

  const isOwner = useMemo(() => {
    if (!multisigInfo || !address) return false;
    return multisigInfo.owners.includes(address);
  }, [multisigInfo, address]);

  return {
    transactions,
    multisigInfo,
    isOwner,
    isLoading: isLoading || serviceLoading,
    submitTransaction,
    confirmTransaction,
    refetch: () => Promise.all([fetchTransactions(), fetchMultisigInfo()]),
  };
}
