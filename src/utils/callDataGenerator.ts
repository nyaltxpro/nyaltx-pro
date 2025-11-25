import { Address, encodeFunctionData, parseEther } from 'viem';

// NYAX Token ABI (minimal for common functions)
const NYAX_TOKEN_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'mint',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
] as const;

// MultiSig ABI
const MULTISIG_ABI = [
  {
    name: 'submitTransaction',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' }
    ],
    outputs: [{ name: 'txIndex', type: 'uint256' }],
    stateMutability: 'nonpayable'
  }
] as const;

/**
 * Generate call data for NYAX token transfer
 */
export function generateTransferCallData(to: Address, amountInEther: string): `0x${string}` {
  return encodeFunctionData({
    abi: NYAX_TOKEN_ABI,
    functionName: 'transfer',
    args: [to, parseEther(amountInEther)]
  });
}

/**
 * Generate call data for NYAX token approval
 */
export function generateApprovalCallData(spender: Address, amountInEther: string): `0x${string}` {
  return encodeFunctionData({
    abi: NYAX_TOKEN_ABI,
    functionName: 'approve',
    args: [spender, parseEther(amountInEther)]
  });
}

/**
 * Generate call data for NYAX token minting
 */
export function generateMintCallData(to: Address, amountInEther: string): `0x${string}` {
  return encodeFunctionData({
    abi: NYAX_TOKEN_ABI,
    functionName: 'mint',
    args: [to, parseEther(amountInEther)]
  });
}

/**
 * Generate call data for multisig transaction submission
 */
export function generateMultisigSubmitCallData(
  to: Address, 
  valueInEther: string, 
  data: `0x${string}`
): `0x${string}` {
  return encodeFunctionData({
    abi: MULTISIG_ABI,
    functionName: 'submitTransaction',
    args: [to, parseEther(valueInEther), data]
  });
}

// Actual deployed contract addresses (Sepolia Testnet)
export const CONTRACT_ADDRESSES = {
  NYAX_TOKEN: '0x9b3C66f562EA32496bA19D9C7174613c37A91F98' as Address,
  NYAX_GOVERNOR: '0x9188d60532d021EB8E453b6e01Ba2E7717106413' as Address,
  TREASURY: '0x0344cD31a3385830c9Fa4d9d5b0e22288279C231' as Address,
  MULTISIG: '0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c' as Address,
  VESTING_FACTORY: '0xc33Faff420eD8fFe480b6983f57886025405f8eb' as Address,
  TIMELOCK: '0xd414356D7dDb6376eBd58b995ebc6a64EcC7b9d2' as Address
};

/**
 * Common transaction examples using actual deployed contracts
 */
export const TRANSACTION_EXAMPLES = {
  // Transfer 100 NYAX tokens to Treasury
  transferTokens: () => ({
    to: CONTRACT_ADDRESSES.NYAX_TOKEN,
    value: '0',
    callData: generateTransferCallData(CONTRACT_ADDRESSES.TREASURY, '100')
  }),

  // Approve unlimited NYAX tokens to MultiSig
  approveTokens: () => ({
    to: CONTRACT_ADDRESSES.NYAX_TOKEN,
    value: '0',
    callData: generateApprovalCallData(CONTRACT_ADDRESSES.MULTISIG, '1000000')
  }),

  // Mint 1000 NYAX tokens to Treasury
  mintTokens: () => ({
    to: CONTRACT_ADDRESSES.NYAX_TOKEN,
    value: '0',
    callData: generateMintCallData(CONTRACT_ADDRESSES.TREASURY, '1000')
  }),

  // Send 0.1 ETH to Treasury
  sendEth: () => ({
    to: CONTRACT_ADDRESSES.TREASURY,
    value: '0.1',
    callData: '0x'
  })
};
