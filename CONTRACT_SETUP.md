# NYAX DAO Contract Integration Setup

This document explains how to set up and configure the NYAX DAO smart contract integration.

## Contract Architecture

The NYAX DAO system consists of 6 main smart contracts:

### 1. NYAXToken.sol
- **Purpose**: ERC20 token with governance capabilities (ERC20Votes)
- **Features**: Minting, burning, delegation, permit functionality
- **Max Supply**: 1 billion tokens
- **Key Functions**: `mint()`, `burn()`, `delegate()`, `getVotes()`

### 2. NYAXGovernor.sol
- **Purpose**: OpenZeppelin Governor for proposal creation and voting
- **Features**: Emergency proposals, fast-track execution, timelock integration
- **Key Functions**: `propose()`, `proposeEmergency()`, `castVote()`, `execute()`

### 3. Treasury.sol
- **Purpose**: Manages token allocations and distributions
- **Features**: Category-based allocations, multisig integration
- **Key Functions**: `transferTo()`, `mintTo()`, `setCategoryWallet()`

### 4. SimpleMultiSig.sol
- **Purpose**: Multi-signature wallet for large treasury operations
- **Features**: Transaction submission, confirmation, execution
- **Key Functions**: `submitTransaction()`, `confirmTransaction()`, `executeTransaction()`

### 5. VestingFactory.sol
- **Purpose**: Creates and manages vesting contracts
- **Features**: Category-based vesting, contract tracking
- **Key Functions**: `createVestingContract()`, `getCategoryContracts()`

### 6. VestingWalletFlexible.sol
- **Purpose**: Flexible vesting with cliff periods and milestones
- **Features**: Linear vesting, milestone releases, revocable schedules
- **Key Functions**: `createVestingSchedule()`, `release()`, `addMilestone()`

## Environment Configuration

Create a `.env.local` file with the following contract addresses:

```bash
# Contract Addresses (update with deployed addresses)
NEXT_PUBLIC_NYAX_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_NYAX_GOVERNOR_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_ADDRESS=0x...
NEXT_PUBLIC_MULTISIG_ADDRESS=0x...
NEXT_PUBLIC_VESTING_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_TIMELOCK_ADDRESS=0x...

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_BLOCK_EXPLORER=https://etherscan.io
```

## Service Integration

The DAO services are located in `/src/services/contracts/`:

- **`types.ts`**: TypeScript interfaces for all contract data
- **`config.ts`**: Contract addresses, ABIs, and network configuration
- **`governanceService.ts`**: Governance contract interactions
- **`treasuryService.ts`**: Treasury contract interactions
- **`vestingService.ts`**: Vesting contract interactions
- **`multisigService.ts`**: Multisig contract interactions
- **`index.ts`**: Main DAO service aggregator

## Frontend Integration

### React Hooks

Use the custom hooks in `/src/hooks/useDAOService.ts`:

```typescript
import { useGovernance, useTreasury, useMultisig } from '@/hooks/useDAOService';

// In your component
const { proposals, stats, votingPower, createProposal, castVote } = useGovernance();
const { stats: treasuryStats, categories, transferTo } = useTreasury();
const { transactions, multisigInfo, submitTransaction } = useMultisig();
```

### Integrated Components

Two example integrated components are provided:

1. **`AdminDashboardIntegrated.tsx`**: Treasury management with real contract data
2. **`GovernancePortalIntegrated.tsx`**: Governance interface with real proposals and voting

## Deployment Steps

### 1. Deploy Contracts

Deploy contracts in this order:

```solidity
1. NYAXToken(treasury_address, owner_address)
2. NYAXTimelockController(min_delay, proposers[], executors[], admin)
3. NYAXGovernor(token_address, timelock_address, voting_delay, voting_period, proposal_threshold, quorum_percentage)
4. Treasury(token_address, multisig_address, owner_address)
5. SimpleMultiSig(owners[], threshold)
6. VestingFactory(token_address, owner_address)
```

### 2. Configure Permissions

Set up proper permissions:

```solidity
// Set treasury as token minter
nyaxToken.setTreasury(treasury_address);

// Grant governor roles on timelock
timelock.grantRole(PROPOSER_ROLE, governor_address);
timelock.grantRole(EXECUTOR_ROLE, governor_address);

// Set multisig as treasury operator
treasury.setMultisig(multisig_address);
```

### 3. Update Frontend Configuration

Update contract addresses in environment variables and verify integration.

## Usage Examples

### Creating a Proposal

```typescript
const { createProposal } = useGovernance();

await createProposal(
  [treasuryAddress], // targets
  ['0'], // values
  [transferCalldata], // calldatas
  'Transfer 1M NYAX to Marketing', // description
  false // isEmergency
);
```

### Treasury Transfer

```typescript
const { transferTo } = useTreasury();

await transferTo(
  '0x...', // recipient
  '1000000', // amount in tokens
  'Marketing allocation', // reason
  'marketing' // category
);
```

### Multisig Transaction

```typescript
const { submitTransaction } = useMultisig();

await submitTransaction(
  '0x...', // target
  '0', // ETH value
  '0x...' // calldata
);
```

## Security Considerations

1. **Multisig Setup**: Use hardware wallets for multisig owners
2. **Timelock Delays**: Set appropriate delays for governance actions
3. **Emergency Procedures**: Test emergency proposal and fast-track mechanisms
4. **Access Control**: Verify all role assignments and permissions
5. **Testing**: Thoroughly test on testnet before mainnet deployment

## Monitoring and Maintenance

1. **Event Monitoring**: Set up event listeners for key contract events
2. **Health Checks**: Regular validation of contract states
3. **Upgrade Procedures**: Plan for potential contract upgrades
4. **Backup Plans**: Emergency procedures for critical issues

## Support

For technical support or questions about the DAO integration:

1. Review the contract documentation in `/contracts/contracts/`
2. Check the service implementations in `/src/services/contracts/`
3. Test with the integrated components in `/src/components/nyax/`
4. Refer to the React hooks in `/src/hooks/useDAOService.ts`
