import { ethers } from 'ethers';
import { CONTRACT_ABIS } from './config';

export interface Beneficiary {
  totalAllocation: bigint;
  claimed: bigint;
  start: bigint;
  cliff: bigint;
  duration: bigint;
  paused: boolean;
  cancelled: boolean;
}

export interface BeneficiaryInfo {
  totalAllocation: bigint;
  claimed: bigint;
  start: bigint;
  cliff: bigint;
  duration: bigint;
  paused: boolean;
  cancelled: boolean;
}

export interface VestingCalculation {
  vested: bigint;
  claimable: bigint;
  totalAllocation: bigint;
  claimed: bigint;
  isClaimable: boolean;
  cliffReached: boolean;
  fullyVested: boolean;
}

export class FolderEscrowService {
  private contract: ethers.Contract;
  private provider: ethers.BrowserProvider;

  constructor(contractAddress: string, provider: ethers.BrowserProvider) {
    this.provider = provider;
    const abi = CONTRACT_ABIS.folderEscrow;
    
    if (!contractAddress) {
      throw new Error('FolderEscrow contract address is required');
    }
    
    this.contract = new ethers.Contract(contractAddress, abi, provider);
  }

  // Get contract with signer for write operations
  getContractWithSigner(signer: ethers.Signer): ethers.Contract {
    return this.contract.connect(signer) as ethers.Contract;
  }

  // Public constants
  async getFolderAdminRole(): Promise<string> {
    return await this.contract.FOLDER_ADMIN_ROLE();
  }

  async getToken(): Promise<string> {
    return await this.contract.token();
  }

  async getFolderName(): Promise<string> {
    return await this.contract.folderName();
  }

  async getRegistry(): Promise<string> {
    return await this.contract.registry();
  }

  // Beneficiary Management
  async addBeneficiary(
    wallet: string,
    totalAllocation: bigint,
    start: bigint,
    cliff: bigint,
    duration: bigint,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.addBeneficiary(wallet, totalAllocation, start, cliff, duration);
  }

  async pauseBeneficiary(wallet: string, signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.pauseBeneficiary(wallet);
  }

  async resumeBeneficiary(wallet: string, signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.resumeBeneficiary(wallet);
  }

  async cancelBeneficiary(wallet: string, signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.cancelBeneficiary(wallet);
  }

  // Claiming
  async claim(signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.claim();
  }

  // Vesting Calculation
  async getVestedAmount(wallet: string): Promise<bigint> {
    return await this.contract._vestedAmount(wallet);
  }

  async calculateVesting(wallet: string): Promise<VestingCalculation> {
    const [beneficiaryInfo, vestedAmount] = await Promise.all([
      this.getBeneficiaryInfo(wallet),
      this.getVestedAmount(wallet)
    ]);

    const claimable = vestedAmount - beneficiaryInfo.claimed;
    const currentTime = BigInt(Date.now() / 1000);
    const cliffTime = beneficiaryInfo.start + beneficiaryInfo.cliff;
    const endTime = beneficiaryInfo.start + beneficiaryInfo.duration;

    return {
      vested: vestedAmount,
      claimable: claimable > 0 ? claimable : BigInt(0),
      totalAllocation: beneficiaryInfo.totalAllocation,
      claimed: beneficiaryInfo.claimed,
      isClaimable: claimable > 0 && !beneficiaryInfo.paused && !beneficiaryInfo.cancelled && currentTime >= cliffTime,
      cliffReached: currentTime >= cliffTime,
      fullyVested: currentTime >= endTime
    };
  }

  // Views
  async getBeneficiaries(): Promise<string[]> {
    return await this.contract.getBeneficiaries();
  }

  async getBeneficiaryInfo(wallet: string): Promise<BeneficiaryInfo> {
    const result = await this.contract.getBeneficiaryInfo(wallet);
    return {
      totalAllocation: result[0],
      claimed: result[1],
      start: result[2],
      cliff: result[3],
      duration: result[4],
      paused: result[5],
      cancelled: result[6]
    };
  }

  // Mappings
  async getBeneficiary(wallet: string): Promise<Beneficiary> {
    const result = await this.contract.beneficiaries(wallet);
    return {
      totalAllocation: result[0],
      claimed: result[1],
      start: result[2],
      cliff: result[3],
      duration: result[4],
      paused: result[5],
      cancelled: result[6]
    };
  }

  async getBeneficiaryByIndex(index: number): Promise<string> {
    return await this.contract.beneficiaryList(index);
  }

  // Folder Controls
  async pauseFolder(signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.pauseFolder();
  }

  async unpauseFolder(signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.unpauseFolder();
  }

  async isPaused(): Promise<boolean> {
    return await this.contract.paused();
  }

  // Access Control
  async hasRole(role: string, account: string): Promise<boolean> {
    return await this.contract.hasRole(role, account);
  }

  async getRoleAdmin(role: string): Promise<string> {
    return await this.contract.getRoleAdmin(role);
  }

  async grantRole(role: string, account: string, signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.grantRole(role, account);
  }

  async revokeRole(role: string, account: string, signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.revokeRole(role, account);
  }

  async renounceRole(role: string, account: string, signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.renounceRole(role, account);
  }

  // Event Listeners
  onBeneficiaryAdded(callback: (wallet: string, amount: bigint, start: bigint, cliff: bigint, duration: bigint, event: any) => void) {
    this.contract.on('BeneficiaryAdded', (wallet, amount, start, cliff, duration, event) => {
      callback(wallet, amount, start, cliff, duration, event);
    });
  }

  onClaimed(callback: (wallet: string, amount: bigint, event: any) => void) {
    this.contract.on('Claimed', (wallet, amount, event) => {
      callback(wallet, amount, event);
    });
  }

  onBeneficiaryPaused(callback: (wallet: string, event: any) => void) {
    this.contract.on('BeneficiaryPaused', (wallet, event) => {
      callback(wallet, event);
    });
  }

  onBeneficiaryResumed(callback: (wallet: string, event: any) => void) {
    this.contract.on('BeneficiaryResumed', (wallet, event) => {
      callback(wallet, event);
    });
  }

  onBeneficiaryCancelled(callback: (wallet: string, event: any) => void) {
    this.contract.on('BeneficiaryCancelled', (wallet, event) => {
      callback(wallet, event);
    });
  }

  onPaused(callback: (account: string, event: any) => void) {
    this.contract.on('Paused', (account, event) => {
      callback(account, event);
    });
  }

  onUnpaused(callback: (account: string, event: any) => void) {
    this.contract.on('Unpaused', (account, event) => {
      callback(account, event);
    });
  }

  // Utility Methods
  async getAllBeneficiariesWithVesting(): Promise<Array<{ wallet: string; info: BeneficiaryInfo; vesting: VestingCalculation }>> {
    const beneficiaries = await this.getBeneficiaries();
    const beneficiariesWithVesting = await Promise.all(
      beneficiaries.map(async (wallet) => {
        const [info, vesting] = await Promise.all([
          this.getBeneficiaryInfo(wallet),
          this.calculateVesting(wallet)
        ]);
        return {
          wallet,
          info,
          vesting
        };
      })
    );
    return beneficiariesWithVesting;
  }

  async getTotalAllocated(): Promise<bigint> {
    const beneficiaries = await this.getBeneficiaries();
    let total = BigInt(0);
    
    for (const wallet of beneficiaries) {
      const info = await this.getBeneficiaryInfo(wallet);
      total += info.totalAllocation;
    }
    
    return total;
  }

  async getTotalClaimed(): Promise<bigint> {
    const beneficiaries = await this.getBeneficiaries();
    let total = BigInt(0);
    
    for (const wallet of beneficiaries) {
      const info = await this.getBeneficiaryInfo(wallet);
      total += info.claimed;
    }
    
    return total;
  }

  async getTotalVested(): Promise<bigint> {
    const beneficiaries = await this.getBeneficiaries();
    let total = BigInt(0);
    
    for (const wallet of beneficiaries) {
      const vested = await this.getVestedAmount(wallet);
      total += vested;
    }
    
    return total;
  }

  async canClaim(wallet: string): Promise<boolean> {
    const vesting = await this.calculateVesting(wallet);
    return vesting.isClaimable;
  }

  async getFolderStats(): Promise<{
    totalBeneficiaries: number;
    totalAllocated: bigint;
    totalClaimed: bigint;
    totalVested: bigint;
    isPaused: boolean;
  }> {
    const [beneficiaries, totalAllocated, totalClaimed, totalVested, isPaused] = await Promise.all([
      this.getBeneficiaries(),
      this.getTotalAllocated(),
      this.getTotalClaimed(),
      this.getTotalVested(),
      this.isPaused()
    ]);

    return {
      totalBeneficiaries: beneficiaries.length,
      totalAllocated,
      totalClaimed,
      totalVested,
      isPaused
    };
  }

  // Get contract address
  getContractAddress(): string {
    return this.contract.target as string;
  }

  // Get contract instance
  getContract(): ethers.Contract {
    return this.contract;
  }
}

// Factory function to create service instances
export const createFolderEscrowService = (
  contractAddress: string,
  provider: ethers.BrowserProvider
): FolderEscrowService => {
  return new FolderEscrowService(contractAddress, provider);
};

export default FolderEscrowService;
