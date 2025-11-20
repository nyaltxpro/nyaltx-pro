import { formatEther, parseEther } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

// Contract addresses (these would come from environment variables)
const CONTRACT_ADDRESSES = {
  NYAX_TOKEN: (process.env.NEXT_PUBLIC_NYAX_TOKEN_ADDRESS || '') as `0x${string}`,
  TREASURY: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '') as `0x${string}`,
  MULTISIG: (process.env.NEXT_PUBLIC_MULTISIG_ADDRESS || '') as `0x${string}`,
  VESTING_FACTORY: (process.env.NEXT_PUBLIC_VESTING_FACTORY_ADDRESS || '') as `0x${string}`,
  GOVERNOR: (process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS || '') as `0x${string}`,
  TIMELOCK: (process.env.NEXT_PUBLIC_TIMELOCK_ADDRESS || '') as `0x${string}`
};

// Simplified ABI for key functions
const NYAX_TOKEN_ABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "getVotes",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "delegatee", "type": "address"}],
    "name": "delegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const TREASURY_ABI = [
  {
    "inputs": [],
    "name": "getTreasuryBalance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCategories",
    "outputs": [{"name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "category", "type": "string"}],
    "name": "getCategoryInfo",
    "outputs": [
      {"name": "wallet", "type": "address"},
      {"name": "allocation", "type": "uint256"},
      {"name": "distributed", "type": "uint256"},
      {"name": "remaining", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Hook for NYAX token operations
export function useNYAXToken() {
  const { address } = useAccount();
  
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.NYAX_TOKEN,
    abi: NYAX_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: votingPower } = useReadContract({
    address: CONTRACT_ADDRESSES.NYAX_TOKEN,
    abi: NYAX_TOKEN_ABI,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
  });

  const { writeContract: delegate } = useWriteContract();
  const { writeContract: transfer } = useWriteContract();

  const delegateVotes = async (delegatee: `0x${string}`) => {
    delegate({
      address: CONTRACT_ADDRESSES.NYAX_TOKEN,
      abi: NYAX_TOKEN_ABI,
      functionName: 'delegate',
      args: [delegatee],
    });
  };

  const transferTokens = async (to: `0x${string}`, amount: string) => {
    transfer({
      address: CONTRACT_ADDRESSES.NYAX_TOKEN,
      abi: NYAX_TOKEN_ABI,
      functionName: 'transfer',
      args: [to, parseEther(amount)],
    });
  };

  return {
    balance: balance ? formatEther(balance) : '0',
    votingPower: votingPower ? formatEther(votingPower) : '0',
    delegateVotes,
    transferTokens,
  };
}

// Hook for Treasury operations
export function useTreasury() {
  const { data: treasuryBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TREASURY,
    abi: TREASURY_ABI,
    functionName: 'getTreasuryBalance',
  });

  const { data: categories } = useReadContract({
    address: CONTRACT_ADDRESSES.TREASURY,
    abi: TREASURY_ABI,
    functionName: 'getCategories',
  });

  const getCategoryInfo = (category: string) => {
    const { data } = useReadContract({
      address: CONTRACT_ADDRESSES.TREASURY,
      abi: TREASURY_ABI,
      functionName: 'getCategoryInfo',
      args: [category],
    });

    if (!data) return null;
    const [wallet, allocation, distributed, remaining] = data;
    return {
      wallet,
      allocation: Number(allocation) / 100, // Convert from basis points
      distributed: formatEther(distributed),
      remaining: formatEther(remaining)
    };
  };

  return {
    treasuryBalance: treasuryBalance ? formatEther(treasuryBalance) : '0',
    categories: categories || [],
    getCategoryInfo,
  };
}

// Hook for contract addresses
export function useContractAddresses() {
  return CONTRACT_ADDRESSES;
}

// Utility functions for contract interactions
export function formatTokenAmount(amount: bigint | undefined): string {
  return amount ? formatEther(amount) : '0';
}

export function parseTokenAmount(amount: string): bigint {
  return parseEther(amount);
}

export { CONTRACT_ADDRESSES };
