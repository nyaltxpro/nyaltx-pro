import { ethers } from 'ethers';
import { CONSTANTS, CONTRACT_ABIS, CONTRACT_ADDRESSES } from './config';
import { ContractError, GovernanceStats, ProposalData, VoteSupport } from './types';

export class GovernanceService {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private governorContract: ethers.Contract;
  private tokenContract: ethers.Contract;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    this.governorContract = new ethers.Contract(
      CONTRACT_ADDRESSES.nyaxGovernor,
      CONTRACT_ABIS.nyaxGovernor,
      signer || provider
    );
    
    this.tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.nyaxToken,
      CONTRACT_ABIS.nyaxToken,
      signer || provider
    );
  }

  // Proposal Management
  async createProposal(
    targets: string[],
    values: string[],
    calldatas: string[],
    description: string,
    _isEmergency = false
  ): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for creating proposals');
      const tx = await this.governorContract.propose(targets, values, calldatas, description);
      
      const receipt = await tx.wait();
      const event = receipt.logs.find((log: ethers.Log) => 
        log.topics && log.topics[0] === ethers.id('ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)')
      );
      
      return event && event.topics ? event.topics[1] : '';
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProposal(proposalId: string): Promise<ProposalData | null> {
    try {
      const details = await this.governorContract.getFullProposalDetails(BigInt(proposalId));
      const description = await this.fetchProposalDescription(proposalId);
      return await this.buildProposalData(proposalId, description, details);
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  }

  async getAllProposals(limit = 50): Promise<ProposalData[]> {
    try {
      const ids: bigint[] = await this.governorContract.getAllProposalIds();
      if (!ids.length) return [];

      const selected = [...ids.slice(-limit)].reverse();
      const proposals = await Promise.all(
        selected.map(async (id) => {
          const proposalId = id.toString();
          try {
            const details = await this.governorContract.getFullProposalDetails(id);
            const description = await this.fetchProposalDescription(proposalId);
            return await this.buildProposalData(proposalId, description, details);
          } catch (err) {
            console.error('Error decoding proposal', err);
            return null;
          }
        })
      );

      return proposals.filter((p): p is ProposalData => p !== null);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      return [];
    }
  }

  async getActiveProposals(): Promise<ProposalData[]> {
    const allProposals = await this.getAllProposals();
    return allProposals.filter(p => p.status === 'active');
  }

  // Voting
  async castVote(proposalId: string, support: VoteSupport, reason?: string): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for voting');
      
      const tx = reason 
        ? await this.governorContract.castVoteWithReason(proposalId, support, reason)
        : await this.governorContract.castVote(proposalId, support);
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async hasVoted(proposalId: string, account: string): Promise<boolean> {
    try {
      return await this.governorContract.hasVoted(proposalId, account);
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  }

  // Execution
  async executeProposal(
    targets: string[],
    values: string[],
    calldatas: string[],
    descriptionHash: string
  ): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for execution');
      
      const tx = await this.governorContract.execute(targets, values, calldatas, descriptionHash);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async enableFastTrack(proposalId: string): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for fast-track');
      
      const tx = await this.governorContract.enableFastTrack(proposalId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Voting Power & Delegation
  async getVotingPower(account: string): Promise<string> {
    try {
      const votes = await this.tokenContract.getVotes(account);
      return ethers.formatEther(votes);
    } catch (error) {
      console.error('Error fetching voting power:', error);
      return '0';
    }
  }

  async delegate(delegatee: string): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for delegation');
      
      const tx = await this.tokenContract.delegate(delegatee);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDelegatedTo(account: string): Promise<string> {
    try {
      return await this.tokenContract.delegates(account);
    } catch (error) {
      console.error('Error fetching delegation:', error);
      return CONSTANTS.ZERO_ADDRESS;
    }
  }

  // Governance Stats
  async getGovernanceStats(): Promise<GovernanceStats> {
    try {
      const [
        proposalThreshold,
        votingDelay,
        votingPeriod,
        currentBlock,
        totalSupply
      ] = await Promise.all([
        this.governorContract.proposalThreshold(),
        this.governorContract.votingDelay(),
        this.governorContract.votingPeriod(),
        this.provider.getBlockNumber(),
        this.tokenContract.totalSupply()
      ]);

      const quorumVotes = await this.governorContract.quorumVotes();
      const allProposals = await this.getAllProposals();
      const activeProposals = allProposals.filter(p => p.status === 'active');

      return {
        totalProposals: allProposals.length,
        activeProposals: activeProposals.length,
        totalVoters: 0, // Would need to track from events
        quorumVotes: ethers.formatEther(quorumVotes),
        proposalThreshold: ethers.formatEther(proposalThreshold),
        votingDelay: Number(votingDelay),
        votingPeriod: Number(votingPeriod),
      };
    } catch (error) {
      console.error('Error fetching governance stats:', error);
      return {
        totalProposals: 0,
        activeProposals: 0,
        totalVoters: 0,
        quorumVotes: '0',
        proposalThreshold: '0',
        votingDelay: 0,
        votingPeriod: 0,
      };
    }
  }

  // Utility Methods
  private extractTitle(description: string): string {
    const lines = description.split('\n');
    return lines[0] || 'Untitled Proposal';
  }

  private extractCategory(description: string): string {
    const categoryMatch = description.match(/Category:\s*(\w+)/i);
    return categoryMatch ? categoryMatch[1] : 'general';
  }

  private async fetchProposalDescription(proposalId: string): Promise<string> {
    try {
      const filter = this.governorContract.filters.ProposalCreated(BigInt(proposalId));
      const events = await this.governorContract.queryFilter(filter);
      if (events.length === 0) return 'Proposal description unavailable';
      const event = events[0] as ethers.EventLog;
      const args = event.args as unknown as { description: string };
      return args?.description ?? 'Proposal description unavailable';
    } catch (error) {
      console.error('Failed to fetch proposal description', error);
      return 'Proposal description unavailable';
    }
  }

  private async buildProposalData(
    proposalId: string,
    description: string,
    details: [
      string,
      string[],
      bigint[],
      string[],
      string,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      number
    ]
  ): Promise<ProposalData> {
    const [
      proposer,
      targets,
      values,
      calldatas,
      descriptionHash,
      snapshotBlock,
      deadlineBlock,
      forVotes,
      againstVotes,
      abstainVotes,
      stateOrdinal
    ] = details;

    const eta = await this.governorContract
      .proposalEta(BigInt(proposalId))
      .catch(() => BigInt(0));

    return {
      id: proposalId,
      title: this.extractTitle(description),
      description,
      proposer,
      status: this.mapProposalState(Number(stateOrdinal)),
      forVotes: ethers.formatEther(forVotes),
      againstVotes: ethers.formatEther(againstVotes),
      abstainVotes: ethers.formatEther(abstainVotes),
      startBlock: Number(snapshotBlock),
      endBlock: Number(deadlineBlock),
      eta: Number(eta),
      isEmergency: false,
      isFastTrack: false,
      category: this.extractCategory(description),
      targets,
      values: values.map((v) => v.toString()),
      calldatas,
    };
  }

  private mapProposalState(state: number): ProposalData['status'] {
    const stateMap: Record<number, ProposalData['status']> = {
      0: 'active', // Pending -> Active for UI
      1: 'active',
      2: 'defeated', // Canceled -> Defeated for UI
      3: 'defeated',
      4: 'succeeded',
      5: 'queued',
      6: 'defeated', // Expired -> Defeated for UI
      7: 'executed',
    };
    return stateMap[state] || 'active';
  }

  private handleError(error: any): ContractError {
    if (error.code === 'CALL_EXCEPTION') {
      return {
        code: 'CALL_EXCEPTION',
        message: error.reason || 'Contract call failed',
        data: error.data,
      };
    }
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient funds for transaction',
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      data: error,
    };
  }

  // Event Listeners
  onProposalCreated(callback: (proposalId: string, proposer: string) => void) {
    this.governorContract.on('ProposalCreated', (proposalId, proposer) => {
      callback(proposalId.toString(), proposer);
    });
  }

  onVoteCast(callback: (voter: string, proposalId: string, support: number, weight: string) => void) {
    this.governorContract.on('VoteCast', (voter, proposalId, support, weight) => {
      callback(voter, proposalId.toString(), support, ethers.formatEther(weight));
    });
  }

  onProposalExecuted(callback: (proposalId: string) => void) {
    this.governorContract.on('ProposalExecuted', (proposalId) => {
      callback(proposalId.toString());
    });
  }

  // Cleanup
  removeAllListeners() {
    this.governorContract.removeAllListeners();
  }
}
