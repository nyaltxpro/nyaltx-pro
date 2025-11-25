import { Address, encodeFunctionData } from 'viem';

// SimpleMultiSig ABI for owner management
const MULTISIG_OWNER_ABI = [
  {
    name: 'addOwner',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'removeOwner',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'changeThreshold',
    type: 'function',
    inputs: [{ name: '_threshold', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'getOwners',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view'
  }
] as const;

/**
 * Generate call data to add a new owner to the multisig
 */
export function generateAddOwnerCallData(newOwner: Address): `0x${string}` {
  return encodeFunctionData({
    abi: MULTISIG_OWNER_ABI,
    functionName: 'addOwner',
    args: [newOwner]
  });
}

/**
 * Generate call data to remove an owner from the multisig
 */
export function generateRemoveOwnerCallData(ownerToRemove: Address): `0x${string}` {
  return encodeFunctionData({
    abi: MULTISIG_OWNER_ABI,
    functionName: 'removeOwner',
    args: [ownerToRemove]
  });
}

/**
 * Generate call data to change the threshold
 */
export function generateChangeThresholdCallData(newThreshold: number): `0x${string}` {
  return encodeFunctionData({
    abi: MULTISIG_OWNER_ABI,
    functionName: 'changeThreshold',
    args: [BigInt(newThreshold)]
  });
}

// Multisig management transaction examples
export const MULTISIG_MANAGEMENT_EXAMPLES = {
  // Add current wallet as owner
  addCurrentWalletAsOwner: (walletAddress: Address) => ({
    to: '0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c', // Multisig address
    value: '0',
    callData: generateAddOwnerCallData(walletAddress),
    description: `Add ${walletAddress} as multisig owner`
  }),

  // Change threshold to 2 (for 2+ owners)
  changeThresholdTo2: () => ({
    to: '0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c', // Multisig address
    value: '0',
    callData: generateChangeThresholdCallData(2),
    description: 'Change multisig threshold to 2'
  }),

  // Remove an owner (example)
  removeOwner: (ownerToRemove: Address) => ({
    to: '0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c', // Multisig address
    value: '0',
    callData: generateRemoveOwnerCallData(ownerToRemove),
    description: `Remove ${ownerToRemove} as multisig owner`
  })
};

/**
 * Instructions for fixing the "Not an owner" error
 */
export const OWNER_SETUP_INSTRUCTIONS = {
  problem: "Current wallet is not a multisig owner",
  solutions: [
    {
      title: "Option 1: Use Deployer Wallet",
      steps: [
        "Find the wallet address that deployed the contracts",
        "Connect with that wallet in your browser",
        "Submit transactions using the deployer wallet"
      ]
    },
    {
      title: "Option 2: Add Current Wallet as Owner",
      steps: [
        "Connect with the deployer wallet first",
        "Use the 'Add Owner' transaction template",
        "Submit transaction to add your current wallet",
        "Wait for confirmation, then switch to your wallet"
      ]
    }
  ],
  currentWallet: "0xda791a424b294a594D81b09A86531CB1Dcf6b932",
  multisigAddress: "0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c"
};
