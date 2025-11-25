import { ethers } from 'ethers';
import { CONSTANTS, CONTRACT_ABIS, CONTRACT_ADDRESSES } from './config';
import {
    GovernanceStats,
    TokenInfo,
    TreasuryCategory,
    TreasuryStats,
    VotingPower
} from './types';

export class DAOService {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  // Contract instances
  private getNYAXTokenContract(withSigner = false) {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.nyaxToken,
      CONTRACT_ABIS.nyaxToken,
      withSigner && this.signer ? this.signer : this.provider
    );
    return contract;
  }

  private getGovernorContract(withSigner = false) {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.nyaxGovernor,
      CONTRACT_ABIS.nyaxGovernor,
      withSigner && this.signer ? this.signer : this.provider
    );
    return contract;
  }

  private getTreasuryContract(withSigner = false) {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.treasury,
      CONTRACT_ABIS.treasury,
      withSigner && this.signer ? this.signer : this.provider
    );
    return contract;
  }

  private getMultisigContract(withSigner = false) {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.multisig,
      CONTRACT_ABIS.multisig,
      withSigner && this.signer ? this.signer : this.provider
    );
    return contract;
  }

  private getVestingFactoryContract(withSigner = false) {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.vestingFactory,
      CONTRACT_ABIS.vestingFactory,
      withSigner && this.signer ? this.signer : this.provider
    );
    return contract;
  }

  // Token functions
  async getTokenInfo(): Promise<TokenInfo> {
    const contract = this.getNYAXTokenContract();
    
    const [name, symbol, decimals, totalSupply, maxSupply, remainingMintable] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
      contract.MAX_SUPPLY(),
      contract.remainingMintableSupply()
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatEther(totalSupply),
      maxSupply: ethers.formatEther(maxSupply),
      remainingMintable: ethers.formatEther(remainingMintable)
    };
  }

  async getTokenBalance(address: string): Promise<string> {
    const contract = this.getNYAXTokenContract();
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  async getVotingPower(address: string): Promise<VotingPower> {
    const contract = this.getNYAXTokenContract();
    
    const [balance, votes, delegatedTo] = await Promise.all([
      contract.balanceOf(address),
      contract.getVotes(address),
      contract.delegates(address)
    ]);

    return {
      balance: ethers.formatEther(balance),
      votes: ethers.formatEther(votes),
      delegatedTo,
      delegatedFrom: [] // Would need to query events for this
    };
  }

  async delegateVotes(delegatee: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for delegation');
    const contract = this.getNYAXTokenContract(true);
    return await contract.delegate(delegatee);
  }

  // Governance functions
  async getGovernanceStats(): Promise<GovernanceStats> {
    const contract = this.getGovernorContract();
    
    const [proposalThreshold, votingDelay, votingPeriod] = await Promise.all([
      contract.proposalThreshold(),
      contract.votingDelay(),
      contract.votingPeriod()
    ]);

    // Get current block for quorum calculation
    const currentBlock = await this.provider.getBlockNumber();
    const quorumVotes = await contract.quorum(currentBlock);

    return {
      totalProposals: 0, // Would need to query events
      activeProposals: 0, // Would need to query events
      totalVoters: 0, // Would need to query events
      quorumVotes: ethers.formatEther(quorumVotes),
      proposalThreshold: ethers.formatEther(proposalThreshold),
      votingDelay: Number(votingDelay),
      votingPeriod: Number(votingPeriod)
    };
  }

  async createProposal(
    targets: string[],
    values: string[],
    calldatas: string[],
    description: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for proposal creation');
    const contract = this.getGovernorContract(true);
    return await contract.propose(targets, values, calldatas, description);
  }

  async castVote(
    proposalId: string,
    support: 0 | 1 | 2,
    reason?: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for voting');
    const contract = this.getGovernorContract(true);
    
    if (reason) {
      return await contract.castVoteWithReason(proposalId, support, reason);
    } else {
      return await contract.castVote(proposalId, support);
    }
  }

  async getProposalState(proposalId: string): Promise<string> {
    const contract = this.getGovernorContract();
    const state = await contract.state(proposalId);
    return CONSTANTS.PROPOSAL_STATES[state as keyof typeof CONSTANTS.PROPOSAL_STATES] || 'Unknown';
  }

  async getProposalVotes(proposalId: string): Promise<{ against: string; for: string; abstain: string }> {
    const contract = this.getGovernorContract();
    const [againstVotes, forVotes, abstainVotes] = await contract.proposalVotes(proposalId);
    
    return {
      against: ethers.formatEther(againstVotes),
      for: ethers.formatEther(forVotes),
      abstain: ethers.formatEther(abstainVotes)
    };
  }

  // Treasury functions
  async getTreasuryStats(): Promise<TreasuryStats> {
    const contract = this.getTreasuryContract();
    
    const [balance, categories, multisigThreshold] = await Promise.all([
      contract.getTreasuryBalance(),
      contract.getCategories(),
      contract.MULTISIG_THRESHOLD()
    ]);

    const totalAllocation = await contract.getTotalAllocation();

    return {
      totalBalance: ethers.formatEther(balance),
      totalAllocated: Number(totalAllocation),
      categoriesCount: categories.length,
      multisigThreshold: ethers.formatEther(multisigThreshold)
    };
  }

  async getTreasuryCategories(): Promise<TreasuryCategory[]> {
    const contract = this.getTreasuryContract();
    const categories = await contract.getCategories();
    
    const categoryData = await Promise.all(
      categories.map(async (category: string) => {
        const info = await contract.getCategoryInfo(category);
        return {
          name: category,
          wallet: info.wallet,
          allocation: Number(info.allocation),
          distributed: ethers.formatEther(info.distributed),
          remaining: ethers.formatEther(info.remaining)
        };
      })
    );

    return categoryData;
  }

  async mintToTreasury(amount: string, reason: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for minting');
    const contract = this.getTreasuryContract(true);
    const amountWei = ethers.parseEther(amount);
    return await contract.mintToTreasury(amountWei, reason);
  }

  // Multisig functions
  async getMultisigInfo(): Promise<{ threshold: number; owners: string[]; transactionCount: number }> {
    const contract = this.getMultisigContract();
    
    const [threshold, owners, transactionCount] = await Promise.all([
      contract.threshold(),
      contract.getOwners(),
      contract.getTransactionCount()
    ]);

    return {
      threshold: Number(threshold),
      owners,
      transactionCount: Number(transactionCount)
    };
  }

  async submitMultisigTransaction(
    to: string,
    value: string,
    data: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for multisig transaction');
    const contract = this.getMultisigContract(true);
    const valueWei = ethers.parseEther(value);
    return await contract.submitTransaction(to, valueWei, data);
  }

  async confirmMultisigTransaction(txIndex: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for confirmation');
    const contract = this.getMultisigContract(true);
    return await contract.confirmTransaction(txIndex);
  }

  async executeMultisigTransaction(txIndex: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for execution');
    const contract = this.getMultisigContract(true);
    return await contract.executeTransaction(txIndex);
  }

  // Vesting functions
  async createVestingContract(category: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for vesting contract creation');
    const contract = this.getVestingFactoryContract(true);
    return await contract.createVestingContract(category);
  }

  async getVestingContracts(category?: string): Promise<string[]> {
    const contract = this.getVestingFactoryContract();
    
    if (category) {
      return await contract.getCategoryContracts(category);
    } else {
      return await contract.getAllContracts();
    }
  }

  async getVestingCategories(): Promise<string[]> {
    const contract = this.getVestingFactoryContract();
    return await contract.getCategories();
  }

  // Utility functions
  async isValidAddress(address: string): Promise<boolean> {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  async getCurrentBlock(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.getTransactionReceipt(txHash);
  }

  // Event listeners
  onProposalCreated(callback: (event: any) => void) {
    const contract = this.getGovernorContract();
    contract.on('ProposalCreated', callback);
    return () => contract.off('ProposalCreated', callback);
  }

  onVoteCast(callback: (event: any) => void) {
    const contract = this.getGovernorContract();
    contract.on('VoteCast', callback);
    return () => contract.off('VoteCast', callback);
  }

  onTokenTransfer(callback: (event: any) => void) {
    const contract = this.getNYAXTokenContract();
    contract.on('Transfer', callback);
    return () => contract.off('Transfer', callback);
  }
}

// Singleton instance
let daoServiceInstance: DAOService | null = null;

export const initializeDAOService = (provider: ethers.Provider, signer?: ethers.Signer) => {
  daoServiceInstance = new DAOService(provider, signer);
  return daoServiceInstance;
};

export const getDAOService = (): DAOService => {
  if (!daoServiceInstance) {
    throw new Error('DAO Service not initialized. Call initializeDAOService first.');
  }
  return daoServiceInstance;
};
