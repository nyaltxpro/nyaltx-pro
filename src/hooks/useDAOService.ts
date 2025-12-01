"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

import { DAOService, createDAOService } from "@/services/contracts";
import {
  GovernanceStats,
  ProposalData,
  TreasuryStats,
  VotingPower,
} from "@/services/contracts/types";

type DaoHookState = {
  daoService: DAOService | null;
  isLoading: boolean;
  error: string | null;
};

const INITIAL_STATE: DaoHookState = {
  daoService: null,
  isLoading: true,
  error: null,
};

let cachedDAOService: DAOService | null = null;
let daoServiceInitPromise: Promise<DAOService> | null = null;
let hasValidatedContracts = false;

export function useDAOService() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<DaoHookState>(INITIAL_STATE);

  const initialize = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      let service = cachedDAOService;

      if (!service) {
        if (!daoServiceInitPromise) {
          daoServiceInitPromise = createDAOService()
            .then((instance) => {
              cachedDAOService = instance;
              return instance;
            })
            .finally(() => {
              daoServiceInitPromise = null;
            });
        }
        service = await daoServiceInitPromise;
      }

      if (!service) {
        throw new Error("DAO service could not be created.");
      }

      if (!hasValidatedContracts) {
        try {
          const validation = await service.validateContracts();
          if (!Object.values(validation).some(Boolean)) {
            throw new Error("No valid DAO contracts detected on the connected network.");
          }
          hasValidatedContracts = true;
        } catch (err) {
          console.error("Contract validation failed:", err);
          throw err instanceof Error ? err : new Error("Contract validation failed");
        }
      }

      setState({ daoService: service, isLoading: false, error: null });
    } catch (err) {
      console.error("Failed to initialize DAO service:", err);
      const message = err instanceof Error ? err.message : "Unable to connect to DAO service";
      setState({ daoService: null, isLoading: false, error: message });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const service = state.daoService;
    if (!service) return;

    const syncSigner = async () => {
      try {
        if (walletClient?.transport) {
          await service.updateSigner(walletClient.transport);
        } else {
          await service.updateSigner();
        }
      } catch (err) {
        console.error("Failed to sync DAO signer", err);
      }
    };

    syncSigner();
  }, [state.daoService, walletClient]);

  return {
    daoService: state.daoService,
    isLoading: state.isLoading,
    error: state.error,
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
      console.error("Error fetching proposals:", error);
    }
  }, [daoService]);

  const fetchStats = useCallback(async () => {
    if (!daoService) return;
    try {
      const governanceStats = await daoService.governance.getGovernanceStats();
      setStats(governanceStats);
    } catch (error) {
      console.error("Error fetching governance stats:", error);
    }
  }, [daoService]);

  const fetchVotingPower = useCallback(async () => {
    if (!daoService || !address) return;
    try {
      const [balance, votes, delegatedTo] = await Promise.all([
        daoService.treasury.getTokenInfo().then((info) => info.totalSupply ?? "0"),
        daoService.governance.getVotingPower(address),
        daoService.governance.getDelegatedTo(address),
      ]);

      setVotingPower({
        balance,
        votes,
        delegatedTo,
        delegatedFrom: [],
      });
    } catch (error) {
      console.error("Error fetching voting power:", error);
    }
  }, [daoService, address]);

  useEffect(() => {
    if (!serviceLoading && daoService) {
      setIsLoading(true);
      Promise.all([fetchProposals(), fetchStats(), fetchVotingPower()]).finally(() => setIsLoading(false));
    }
  }, [serviceLoading, daoService, fetchProposals, fetchStats, fetchVotingPower]);

  const createProposal = useCallback(
    async (targets: string[], values: string[], calldatas: string[], description: string, isEmergency = false) => {
      if (!daoService) throw new Error("DAO service not initialized");
      const proposalId = await daoService.governance.createProposal(targets, values, calldatas, description, isEmergency);
      await fetchProposals();
      return proposalId;
    },
    [daoService, fetchProposals]
  );

  const castVote = useCallback(
    async (proposalId: string, support: 0 | 1 | 2, reason?: string) => {
      if (!daoService) throw new Error("DAO service not initialized");
      const txHash = await daoService.governance.castVote(proposalId, support, reason);
      await Promise.all([fetchProposals(), fetchVotingPower()]);
      return txHash;
    },
    [daoService, fetchProposals, fetchVotingPower]
  );

  const delegate = useCallback(
    async (delegatee: string) => {
      if (!daoService) throw new Error("DAO service not initialized");
      const txHash = await daoService.governance.delegate(delegatee);
      await fetchVotingPower();
      return txHash;
    },
    [daoService, fetchVotingPower]
  );

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
      console.error("Error fetching treasury stats:", error);
    }
  }, [daoService]);

  const fetchCategories = useCallback(async () => {
    if (!daoService) return;
    try {
      const allCategories = await daoService.treasury.getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [daoService]);

  useEffect(() => {
    if (!serviceLoading && daoService) {
      setIsLoading(true);
      Promise.all([fetchStats(), fetchCategories()]).finally(() => setIsLoading(false));
    }
  }, [serviceLoading, daoService, fetchStats, fetchCategories]);

  return {
    stats,
    categories,
    isLoading: isLoading || serviceLoading,
    refetch: () => Promise.all([fetchStats(), fetchCategories()]),
  };
}
