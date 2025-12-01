// Main service aggregator for DAO contracts
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from './config';
import { FolderRegistryService } from './folderRegistryService';
import { GovernanceService } from './governanceService';
import { MigrationVaultService } from './migrationVaultService';
import { MultisigService } from './multisigService';
import { StakingService } from './stakingService';
import { TreasuryService } from './treasuryService';
import { VestingService } from './vestingService';

const FALLBACK_RPC_URLS = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_RPC_URL,
      NETWORK_CONFIG.rpcUrl,
      'https://rpc.sepolia.org',
      'https://sepolia.infura.io/v3/24570cf454c147f5b44d10966ae49915',
    ].filter(Boolean)
  )
) as string[];

async function createReadOnlyProvider(): Promise<ethers.JsonRpcProvider> {
  let lastError: unknown = null;
  for (const url of FALLBACK_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      await provider.getBlockNumber();
      return provider;
    } catch (err) {
      console.error(`[DAOService] Failed to connect to RPC ${url}`, err);
      lastError = err;
    }
  }
  throw lastError ?? new Error('Unable to connect to any configured RPC endpoint.');
}

export class DAOService {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  
  public governance: GovernanceService;
  public treasury: TreasuryService;
  public vesting: VestingService;
  public multisig: MultisigService;
  public folders: FolderRegistryService;
  public staking: StakingService;
  public migrationVault: MigrationVaultService;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    // Initialize all services
    this.governance = new GovernanceService(provider, signer);
    this.treasury = new TreasuryService(provider, signer);
    this.vesting = new VestingService(provider, signer);
    this.multisig = new MultisigService(provider, signer);
    this.folders = new FolderRegistryService(provider, signer);
    this.staking = new StakingService(provider, signer);
    this.migrationVault = new MigrationVaultService(provider, signer);
  }

  // Factory method to create DAO service with Web3 provider
  static async create(web3Provider?: any): Promise<DAOService> {
    let provider: ethers.Provider;
    let signer: ethers.Signer | undefined;

    if (web3Provider) {
      // Use injected provider (MetaMask, etc.)
      const browserProvider = new ethers.BrowserProvider(web3Provider);
      provider = browserProvider;
      signer = await browserProvider.getSigner();
    } else {
      // Use read-only provider with fallbacks
      provider = await createReadOnlyProvider();
    }

    return new DAOService(provider, signer);
  }

  // Update signer (when user connects/disconnects wallet)
  async updateSigner(web3Provider?: any): Promise<void> {
    if (web3Provider) {
      const browserProvider = new ethers.BrowserProvider(web3Provider);
      this.provider = browserProvider;
      this.signer = await browserProvider.getSigner();
    } else {
      this.provider = await createReadOnlyProvider();
      this.signer = undefined;
    }

    // Update all services
    this.governance = new GovernanceService(this.provider, this.signer);
    this.treasury = new TreasuryService(this.provider, this.signer);
    this.vesting = new VestingService(this.provider, this.signer);
    this.multisig = new MultisigService(this.provider, this.signer);
    this.folders = new FolderRegistryService(this.provider, this.signer);
    this.staking = new StakingService(this.provider, this.signer);
    this.migrationVault = new MigrationVaultService(this.provider, this.signer);
  }

  // Utility methods
  async getConnectedAddress(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Error getting connected address:', error);
      return null;
    }
  }

  async getNetwork(): Promise<ethers.Network | null> {
    try {
      return await this.provider.getNetwork();
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  }

  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Error getting block number:', error);
      return 0;
    }
  }

  // Check if contracts are deployed and accessible
  async validateContracts(): Promise<{
    nyaxToken: boolean;
    nyaxGovernor: boolean;
    treasury: boolean;
    multisig: boolean;
    vestingFactory: boolean;
  }> {
    const results = {
      nyaxToken: false,
      nyaxGovernor: false,
      treasury: false,
      multisig: false,
      vestingFactory: false,
    };

    try {
      // Check if contract addresses are set
      if (!CONTRACT_ADDRESSES.nyaxToken) return results;

      // Try to call a simple view function on each contract
      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.nyaxToken,
        ['function name() view returns (string)'],
        this.provider
      );
      
      await tokenContract.name();
      results.nyaxToken = true;

      if (CONTRACT_ADDRESSES.nyaxGovernor) {
        const governorContract = new ethers.Contract(
          CONTRACT_ADDRESSES.nyaxGovernor,
          ['function name() view returns (string)'],
          this.provider
        );
        await governorContract.name();
        results.nyaxGovernor = true;
      }

      if (CONTRACT_ADDRESSES.treasury) {
        const treasuryContract = new ethers.Contract(
          CONTRACT_ADDRESSES.treasury,
          ['function nyax() view returns (address)'],
          this.provider
        );
        await treasuryContract.nyax();
        results.treasury = true;
      }

      if (CONTRACT_ADDRESSES.multisig) {
        const multisigContract = new ethers.Contract(
          CONTRACT_ADDRESSES.multisig,
          ['function threshold() view returns (uint256)'],
          this.provider
        );
        await multisigContract.threshold();
        results.multisig = true;
      }

      if (CONTRACT_ADDRESSES.vestingFactory) {
        const factoryContract = new ethers.Contract(
          CONTRACT_ADDRESSES.vestingFactory,
          ['function nyaxToken() view returns (address)'],
          this.provider
        );
        await factoryContract.nyaxToken();
        results.vestingFactory = true;
      }
    } catch (error) {
      console.error('Error validating contracts:', error);
    }

    return results;
  }

  // Cleanup all event listeners
  removeAllListeners(): void {
    this.governance.removeAllListeners();
    this.treasury.removeAllListeners();
    this.vesting.removeAllListeners();
    this.multisig.removeAllListeners();
  }
}

// Export individual services and types
export * from './config';
export { FolderRegistryService } from './folderRegistryService';
export { GovernanceService } from './governanceService';
export { MigrationVaultService } from './migrationVaultService';
export { MultisigService } from './multisigService';
export { StakingService } from './stakingService';
export { TreasuryService } from './treasuryService';
export * from './types';
export { VestingService } from './vestingService';

// Export default instance creator
export const createDAOService = DAOService.create;
