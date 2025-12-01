import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from './config';
import { ContractError, LegacyDepositResult, MigrationVaultStats } from './types';

export class MigrationVaultService {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private contract: ethers.Contract;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    if (!CONTRACT_ADDRESSES.legacyMigrationVault) {
      throw new Error('Legacy migration vault address not configured.');
    }

    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.legacyMigrationVault,
      CONTRACT_ABIS.legacyMigrationVault,
      signer || provider
    );
  }

  async getStats(): Promise<MigrationVaultStats> {
    const [ratio, enabled, legacyToken, governanceToken] = await Promise.all([
      this.contract.conversionRatio(),
      this.contract.depositsEnabled(),
      this.contract.legacyToken(),
      this.contract.governanceToken(),
    ]);

    return {
      conversionRatio: ethers.formatUnits(ratio, 18),
      depositsEnabled: Boolean(enabled),
      legacyToken,
      governanceToken,
    };
  }

  async depositLegacy(amount: string, beneficiary?: string): Promise<LegacyDepositResult> {
    this.ensureSigner('deposit legacy tokens');

    const amountWei = ethers.parseEther(amount);
    const tx = await this.contract.depositLegacy(amountWei, beneficiary ?? ethers.ZeroAddress);
    const receipt = await tx.wait();

    const minted = await this.estimateMintedAmount(amount);

    return {
      txHash: receipt.hash,
      mintedAmount: minted,
    };
  }

  private async estimateMintedAmount(amount: string): Promise<string> {
    const ratio = await this.contract.conversionRatio();
    const amountWei = ethers.parseEther(amount);
    const minted = (amountWei * ratio) / ethers.parseUnits('1', 18);
    return ethers.formatEther(minted);
  }

  private ensureSigner(action: string) {
    if (!this.signer) {
      throw new Error(`Signer required to ${action}. Connect a wallet first.`);
    }
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
}
