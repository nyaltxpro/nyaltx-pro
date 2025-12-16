import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from './config';

export interface FolderInfo {
  name: string;
  folder: string;
  createdAt: bigint;
}

export interface TokenStats {
  totalSupply: bigint;
  circulating: bigint;
  stakedValue: bigint;
  totalHolders: bigint;
}

export class FolderRegistryFactoryService {
  private contract: ethers.Contract;
  private provider: ethers.BrowserProvider;

  constructor(provider: ethers.BrowserProvider) {
    this.provider = provider;
    const address = CONTRACT_ADDRESSES.folderEscrowFactory;
    const abi = CONTRACT_ABIS.folderRegisteryFactory;
    
    if (!address) {
      throw new Error('FolderRegistryFactory address not configured');
    }
    
    this.contract = new ethers.Contract(address, abi, provider);
  }

  // Get contract with signer for write operations
  getContractWithSigner(signer: ethers.Signer): ethers.Contract {
    return this.contract.connect(signer) as ethers.Contract;
  }

  // Folder Creation
  async createFolder(
    name: string,
    token: string,
    folderAdmin: string,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.getContractWithSigner(signer);
    return await contractWithSigner.createFolder(name, token, folderAdmin);
  }

  // Token Statistics
  async getTotalSupply(): Promise<bigint> {
    try {
      const result = await this.contract.totalSupply();
      console.log('getTotalSupply result:', result);
      return result;
    } catch (error) {
      console.error('Error in getTotalSupply:', error);
      throw error;
    }
  }

  async getCirculating(): Promise<bigint> {
    try {
      const result = await this.contract.circulating();
      console.log('getCirculating result:', result);
      return result;
    } catch (error) {
      console.error('Error in getCirculating:', error);
      throw error;
    }
  }

  async getStakedValue(): Promise<bigint> {
    try {
      const result = await this.contract.stakedValue();
      console.log('getStakedValue result:', result);
      return result;
    } catch (error) {
      console.error('Error in getStakedValue:', error);
      throw error;
    }
  }

  async getTotalHolders(): Promise<bigint> {
    try {
      const result = await this.contract.totalHolders();
      console.log('getTotalHolders result:', result);
      return result;
    } catch (error) {
      console.error('Error in getTotalHolders:', error);
      throw error;
    }
  }

  async getAllTokenStats(): Promise<TokenStats> {
    const [totalSupply, circulating, stakedValue, totalHolders] = await Promise.all([
      this.getTotalSupply(),
      this.getCirculating(),
      this.getStakedValue(),
      this.getTotalHolders()
    ]);

    return {
      totalSupply,
      circulating,
      stakedValue,
      totalHolders
    };
  }

  // Views
  async getFolderByName(name: string): Promise<string> {
    return await this.contract.getFolderByName(name);
  }

  async getAllFolders(): Promise<string[]> {
    return await this.contract.getAllFolders();
  }

  async getTotalFolders(): Promise<bigint> {
    return await this.contract.totalFolders();
  }

  // Mappings
  async getFolderByNameHash(nameHash: string): Promise<string> {
    return await this.contract.folderByNameHash(nameHash);
  }

  async getFolderInfo(folderAddress: string): Promise<FolderInfo> {
    const result = await this.contract.folderInfo(folderAddress);
    // Contract returns a tuple: [name, folder, createdAt]
    return {
      name: result[0] || result.name || '',
      folder: result[1] || result.folder || folderAddress,
      createdAt: result[2] || result.createdAt || BigInt(0)
    };
  }

  async getFolderByIndex(index: number): Promise<string> {
    return await this.contract.allFolders(index);
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

  // Constants
  async getGovernanceRole(): Promise<string> {
    return await this.contract.GOVERNANCE_ROLE();
  }

  // Event Listeners
  onFolderCreated(callback: (name: string, folder: string, token: string, event: any) => void) {
    this.contract.on('FolderCreated', (name, folder, token, event) => {
      callback(name, folder, token, event);
    });
  }

  onRoleGranted(callback: (role: string, account: string, sender: string, event: any) => void) {
    this.contract.on('RoleGranted', (role, account, sender, event) => {
      callback(role, account, sender, event);
    });
  }

  onRoleRevoked(callback: (role: string, account: string, sender: string, event: any) => void) {
    this.contract.on('RoleRevoked', (role, account, sender, event) => {
      callback(role, account, sender, event);
    });
  }

  // Utility Methods
  async getFoldersWithDetails(): Promise<Array<FolderInfo & { address: string }>> {
    const allFolders = await this.getAllFolders();
    console.log('getAllFolders returned:', allFolders);
    
    const foldersWithDetails = await Promise.all(
      allFolders.map(async (address) => {
        const info = await this.getFolderInfo(address);
        console.log(`Folder ${address} info:`, info);
        return {
          name: info.name,
          folder: info.folder,
          createdAt: info.createdAt,
          address
        };
      })
    );
    
    console.log('getFoldersWithDetails final result:', foldersWithDetails);
    return foldersWithDetails;
  }

  async checkFolderExists(name: string): Promise<boolean> {
    try {
      const folderAddress = await this.getFolderByName(name);
      console.log('getFolderByName returned:', folderAddress);
      return folderAddress !== ethers.ZeroAddress;
    } catch (error) {
      return false;
    }
  }

  // Get contract address
  getContractAddress(): string {
    return CONTRACT_ADDRESSES.folderRegistry;
  }

  // Get contract instance
  getContract(): ethers.Contract {
    return this.contract;
  }
}

// Singleton instance
let folderRegistryFactoryService: FolderRegistryFactoryService | null = null;

export const getFolderRegistryFactoryService = (provider: ethers.BrowserProvider): FolderRegistryFactoryService => {
  if (!folderRegistryFactoryService) {
    folderRegistryFactoryService = new FolderRegistryFactoryService(provider);
  }
  return folderRegistryFactoryService;
};

export default FolderRegistryFactoryService;
