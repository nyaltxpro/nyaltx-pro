import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from './config';
import { ContractError, TreasuryCategory, TreasuryStats, TreasuryTransfer } from './types';

export class TreasuryService {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private treasuryContract: ethers.Contract;
  private tokenContract: ethers.Contract;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    this.treasuryContract = new ethers.Contract(
      CONTRACT_ADDRESSES.treasury,
      CONTRACT_ABIS.treasury,
      signer || provider
    );
    
    this.tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.nyaxToken,
      CONTRACT_ABIS.nyaxToken,
      signer || provider
    );
  }

  // Category Management
  async setCategoryWallet(
    category: string,
    wallet: string,
    allocation: number
  ): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for setting category wallet');
      
      const tx = await this.treasuryContract.setCategoryWallet(category, wallet, allocation);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecentTransfers(limit = 10, lookbackBlocks = 50_000): Promise<TreasuryTransfer[]> {
    try {
      const latestBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(latestBlock - lookbackBlocks, 0);
      const topic = ethers.id('TransferExecuted(address,uint256,string,string)');

      const logs = await this.provider.getLogs({
        address: CONTRACT_ADDRESSES.treasury,
        topics: [topic],
        fromBlock,
        toBlock: latestBlock,
      });

      const recentLogs = logs.slice(-limit);

      const transfers = await Promise.all(
        recentLogs
          .reverse()
          .map(async (log) => {
            const parsed = this.treasuryContract.interface.parseLog(log);
            const block = await this.provider.getBlock(log.blockNumber);
            if (!parsed) return null;
            const { to, amount, reason, category } = parsed.args as unknown as {
              to: string;
              amount: bigint;
              reason: string;
              category: string;
            };

            return {
              txHash: log.transactionHash,
              to,
              amount: ethers.formatEther(amount),
              reason,
              category,
              blockNumber: log.blockNumber,
              timestamp: Number(block?.timestamp ?? 0),
            } satisfies TreasuryTransfer;
          })
      );

      return transfers.filter((entry): entry is TreasuryTransfer => Boolean(entry));
    } catch (error) {
      console.error('Error fetching recent transfers:', error);
      return [];
    }
  }

  async removeCategory(category: string): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for removing category');
      
      const tx = await this.treasuryContract.removeCategory(category);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCategory(category: string): Promise<TreasuryCategory | null> {
    try {
      const exists = await this.treasuryContract.categoryExists(category);
      if (!exists) return null;

      const [wallet, allocation, distributed, remaining] = await this.treasuryContract.getCategoryInfo(category);
      
      return {
        name: category,
        wallet,
        allocation: Number(allocation),
        distributed: ethers.formatEther(distributed),
        remaining: ethers.formatEther(remaining),
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  async getAllCategories(): Promise<TreasuryCategory[]> {
    try {
      const categoryNames = await this.treasuryContract.getCategories();
      
      const categories = await Promise.all(
        categoryNames.map(async (name: string) => this.getCategory(name))
      );
      
      return categories.filter((c): c is TreasuryCategory => c !== null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Token Operations
  async transferTo(
    to: string,
    amount: string,
    reason: string,
    category: string
  ): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for transfers');
      
      const amountWei = ethers.parseEther(amount);
      const tx = await this.treasuryContract.transferTo(to, amountWei, reason, category);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async mintToTreasury(amount: string, reason: string): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for minting');
      
      const amountWei = ethers.parseEther(amount);
      const tx = await this.treasuryContract.mintToTreasury(amountWei, reason);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async mintTo(
    to: string,
    amount: string,
    reason: string,
    category: string
  ): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for minting');
      
      const amountWei = ethers.parseEther(amount);
      const tx = await this.treasuryContract.mintTo(to, amountWei, reason, category);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async burnFromTreasury(amount: string, reason: string): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer required for burning');
      
      const amountWei = ethers.parseEther(amount);
      const tx = await this.treasuryContract.burnFromTreasury(amountWei, reason);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Treasury Stats
  async getTreasuryStats(): Promise<TreasuryStats> {
    try {
      const [
        balance,
        totalAllocation,
        categories,
        multisigThreshold
      ] = await Promise.all([
        this.treasuryContract.getTreasuryBalance(),
        this.treasuryContract.getTotalAllocation(),
        this.treasuryContract.getCategories(),
        this.treasuryContract.MULTISIG_THRESHOLD()
      ]);

      return {
        totalBalance: ethers.formatEther(balance),
        totalAllocated: Number(totalAllocation),
        categoriesCount: categories.length,
        multisigThreshold: ethers.formatEther(multisigThreshold),
      };
    } catch (error) {
      console.error('Error fetching treasury stats:', error);
      return {
        totalBalance: '0',
        totalAllocated: 0,
        categoriesCount: 0,
        multisigThreshold: '0',
      };
    }
  }

  async getTreasuryBalance(): Promise<string> {
    try {
      const balance = await this.treasuryContract.getTreasuryBalance();
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching treasury balance:', error);
      return '0';
    }
  }

  async requiresMultisig(amount: string): Promise<boolean> {
    try {
      const amountWei = ethers.parseEther(amount);
      return await this.treasuryContract.requiresMultisig(amountWei);
    } catch (error) {
      console.error('Error checking multisig requirement:', error);
      return false;
    }
  }

  // Token Info
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    maxSupply: string;
    remainingMintable: string;
  }> {
    try {
      const [
        name,
        symbol,
        decimals,
        totalSupply,
        maxSupply,
        remainingMintable
      ] = await Promise.all([
        this.tokenContract.name(),
        this.tokenContract.symbol(),
        this.tokenContract.decimals(),
        this.tokenContract.totalSupply(),
        this.tokenContract.MAX_SUPPLY(),
        this.tokenContract.remainingMintableSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply),
        maxSupply: ethers.formatEther(maxSupply),
        remainingMintable: ethers.formatEther(remainingMintable),
      };
    } catch (error) {
      console.error('Error fetching token info:', error);
      return {
        name: 'NYAX',
        symbol: 'NYAX',
        decimals: 18,
        totalSupply: '0',
        maxSupply: '0',
        remainingMintable: '0',
      };
    }
  }

  // Utility Methods
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
  onCategorySet(callback: (category: string, wallet: string, allocation: number) => void) {
    this.treasuryContract.on('CategorySet', (category, wallet, allocation) => {
      callback(category, wallet, Number(allocation));
    });
  }

  onTransferExecuted(callback: (to: string, amount: string, reason: string, category: string) => void) {
    this.treasuryContract.on('TransferExecuted', (to, amount, reason, category) => {
      callback(to, ethers.formatEther(amount), reason, category);
    });
  }

  onTokensMinted(callback: (to: string, amount: string, reason: string) => void) {
    this.treasuryContract.on('TokensMinted', (to, amount, reason) => {
      callback(to, ethers.formatEther(amount), reason);
    });
  }

  onTokensBurned(callback: (amount: string, reason: string) => void) {
    this.treasuryContract.on('TokensBurned', (amount, reason) => {
      callback(ethers.formatEther(amount), reason);
    });
  }

  // Cleanup
  removeAllListeners() {
    this.treasuryContract.removeAllListeners();
  }
}
