# NYAX Platform Smart Contract Integration Guide

## 🎯 Overview

This document provides a comprehensive guide for integrating the NYAX Platform smart contracts with your existing frontend application. The smart contract suite includes token management, governance, treasury operations, and vesting functionality.

## 📋 Smart Contract Architecture

### Core Contracts

| Contract | Purpose | Key Features |
|----------|---------|--------------|
| **NYAXToken** | Main platform token | ERC20Votes, ERC20Permit, Governance, Minting/Burning |
| **Treasury** | Token allocation management | Category-based distribution, MultiSig integration |
| **SimpleMultiSig** | Secure operations | Multi-signature approvals, Transaction management |
| **VestingWalletFlexible** | Token vesting | Cliff periods, Linear vesting, Milestones |
| **VestingFactory** | Vesting management | Create/manage multiple vesting contracts |
| **NYAXGovernor** | On-chain governance | Proposals, Voting, Timelock execution |

## 🚀 Quick Start Integration

### 1. Install Smart Contract Dependencies

```bash
# Install smart contract development tools
npm run contracts:install

# Compile contracts
npm run contracts:compile

# Run tests to ensure everything works
npm run contracts:test
```

### 2. Deploy Contracts

#### Local Development
```bash
# Start local blockchain
npm run contracts:node

# Deploy to local network
npm run contracts:deploy:local
```

#### Testnet Deployment (Sepolia)
```bash
# Configure environment variables
cp contracts/env.example contracts/.env
# Edit contracts/.env with your keys

# Deploy to Sepolia
npm run contracts:deploy:sepolia

# Verify contracts
npm run contracts:verify:sepolia
```

#### Production Deployment
```bash
# Deploy to mainnet (use with caution)
npm run contracts:deploy:mainnet

# Verify contracts
npm run contracts:verify:mainnet

# Setup governance
npm run contracts:setup-governance
```

### 3. Frontend Integration

#### Contract ABIs and Addresses

After deployment, contract addresses and ABIs will be saved in:
```
contracts/deployments/[network].json
```

Example deployment file structure:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "network": "sepolia",
  "deployer": "0x...",
  "nyaxToken": "0x...",
  "treasury": "0x...",
  "multisig": "0x...",
  "vestingFactory": "0x...",
  "governor": "0x...",
  "timelock": "0x..."
}
```

#### React Integration Example

```typescript
// hooks/useNYAXContracts.ts
import { useContract, useProvider } from 'wagmi';
import NYAXTokenABI from '../contracts/abis/NYAXToken.json';
import TreasuryABI from '../contracts/abis/Treasury.json';

export function useNYAXContracts() {
  const provider = useProvider();
  
  const nyaxToken = useContract({
    address: process.env.NEXT_PUBLIC_NYAX_TOKEN_ADDRESS,
    abi: NYAXTokenABI,
    signerOrProvider: provider
  });

  const treasury = useContract({
    address: process.env.NEXT_PUBLIC_TREASURY_ADDRESS,
    abi: TreasuryABI,
    signerOrProvider: provider
  });

  return { nyaxToken, treasury };
}
```

## 🔧 Integration Points

### 1. Token Operations

#### Minting Tokens (Treasury/Owner only)
```typescript
// Mint tokens to user
const mintTokens = async (to: string, amount: string) => {
  const tx = await nyaxToken.mint(to, ethers.parseEther(amount));
  await tx.wait();
};

// Mint to treasury
const mintToTreasury = async (amount: string, reason: string) => {
  const tx = await treasury.mintToTreasury(ethers.parseEther(amount), reason);
  await tx.wait();
};
```

#### Token Transfers
```typescript
// Standard transfer
const transferTokens = async (to: string, amount: string) => {
  const tx = await nyaxToken.transfer(to, ethers.parseEther(amount));
  await tx.wait();
};

// Check balance
const getBalance = async (address: string) => {
  const balance = await nyaxToken.balanceOf(address);
  return ethers.formatEther(balance);
};
```

### 2. Governance Integration

#### Delegation and Voting Power
```typescript
// Delegate voting power
const delegateVotes = async (delegatee: string) => {
  const tx = await nyaxToken.delegate(delegatee);
  await tx.wait();
};

// Get voting power
const getVotingPower = async (address: string) => {
  const votes = await nyaxToken.getVotes(address);
  return ethers.formatEther(votes);
};
```

#### Proposal Creation and Voting
```typescript
// Create proposal
const createProposal = async (
  targets: string[],
  values: string[],
  calldatas: string[],
  description: string
) => {
  const tx = await governor.propose(targets, values, calldatas, description);
  const receipt = await tx.wait();
  
  // Extract proposal ID from events
  const proposalId = receipt.events?.find(e => e.event === 'ProposalCreated')?.args?.proposalId;
  return proposalId;
};

// Vote on proposal
const voteOnProposal = async (proposalId: string, support: number) => {
  // support: 0 = Against, 1 = For, 2 = Abstain
  const tx = await governor.castVote(proposalId, support);
  await tx.wait();
};
```

### 3. Treasury Operations

#### Category Management
```typescript
// Set category wallet
const setCategoryWallet = async (category: string, wallet: string, allocation: number) => {
  const tx = await treasury.setCategoryWallet(category, wallet, allocation * 100); // Convert to basis points
  await tx.wait();
};

// Get category info
const getCategoryInfo = async (category: string) => {
  const [wallet, allocation, distributed, remaining] = await treasury.getCategoryInfo(category);
  return {
    wallet,
    allocation: allocation / 100, // Convert from basis points
    distributed: ethers.formatEther(distributed),
    remaining: ethers.formatEther(remaining)
  };
};
```

#### Token Distribution
```typescript
// Small transfer (owner only)
const distributeTokens = async (to: string, amount: string, reason: string, category: string) => {
  const tx = await treasury.transferTo(to, ethers.parseEther(amount), reason, category);
  await tx.wait();
};

// Large transfer (requires multisig)
const createMultisigTransfer = async (to: string, amount: string, reason: string, category: string) => {
  const transferData = treasury.interface.encodeFunctionData(
    'multisigTransfer',
    [to, ethers.parseEther(amount), reason, category]
  );
  
  const tx = await multisig.submitTransaction(treasury.address, 0, transferData);
  await tx.wait();
};
```

### 4. Vesting Integration

#### Create Vesting Schedule
```typescript
// Create vesting contract
const createVestingContract = async (category: string) => {
  const tx = await vestingFactory.createVestingContract(category);
  const receipt = await tx.wait();
  
  // Get contract address from events
  const contractAddress = receipt.events?.find(e => e.event === 'VestingContractCreated')?.args?.vestingContract;
  return contractAddress;
};

// Create vesting schedule
const createVestingSchedule = async (
  vestingContractAddress: string,
  beneficiary: string,
  totalAmount: string,
  start: number,
  cliffDuration: number,
  duration: number,
  revocable: boolean,
  category: string
) => {
  const vestingContract = new ethers.Contract(vestingContractAddress, VestingWalletFlexibleABI, signer);
  
  // Approve tokens first
  await nyaxToken.approve(vestingContractAddress, ethers.parseEther(totalAmount));
  
  // Create schedule
  const tx = await vestingContract.createVestingSchedule(
    beneficiary,
    ethers.parseEther(totalAmount),
    start,
    cliffDuration,
    duration,
    revocable,
    category
  );
  
  const receipt = await tx.wait();
  const scheduleId = receipt.events?.find(e => e.event === 'VestingScheduleCreated')?.args?.scheduleId;
  return scheduleId;
};
```

#### Release Vested Tokens
```typescript
// Release vested tokens
const releaseVestedTokens = async (vestingContractAddress: string, scheduleId: string) => {
  const vestingContract = new ethers.Contract(vestingContractAddress, VestingWalletFlexibleABI, signer);
  const tx = await vestingContract.release(scheduleId);
  await tx.wait();
};

// Check releasable amount
const getReleasableAmount = async (vestingContractAddress: string, scheduleId: string) => {
  const vestingContract = new ethers.Contract(vestingContractAddress, VestingWalletFlexibleABI, provider);
  const amount = await vestingContract.releasableAmount(scheduleId);
  return ethers.formatEther(amount);
};
```

## 🎨 UI Components Integration

### 1. Token Balance Display
```tsx
// components/TokenBalance.tsx
import { useBalance } from 'wagmi';

export function TokenBalance({ address }: { address: string }) {
  const { data: balance } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_NYAX_TOKEN_ADDRESS,
  });

  return (
    <div className="token-balance">
      <span>{balance?.formatted} NYAX</span>
    </div>
  );
}
```

### 2. Governance Dashboard
```tsx
// components/GovernanceDashboard.tsx
export function GovernanceDashboard() {
  const [proposals, setProposals] = useState([]);
  const [votingPower, setVotingPower] = useState('0');

  // Load proposals and voting power
  useEffect(() => {
    loadGovernanceData();
  }, []);

  return (
    <div className="governance-dashboard">
      <div className="voting-power">
        <h3>Your Voting Power: {votingPower} NYAX</h3>
      </div>
      
      <div className="proposals">
        {proposals.map(proposal => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}
```

### 3. Treasury Dashboard
```tsx
// components/TreasuryDashboard.tsx
export function TreasuryDashboard() {
  const [categories, setCategories] = useState([]);
  const [treasuryBalance, setTreasuryBalance] = useState('0');

  return (
    <div className="treasury-dashboard">
      <div className="treasury-balance">
        <h3>Treasury Balance: {treasuryBalance} NYAX</h3>
      </div>
      
      <div className="categories">
        {categories.map(category => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
```

## 🔐 Security Considerations

### 1. Access Control
- Ensure proper role-based access control in your frontend
- Validate user permissions before showing admin functions
- Use secure wallet connections (WalletConnect, MetaMask)

### 2. Transaction Safety
- Always validate transaction parameters
- Show transaction previews before execution
- Implement transaction status tracking
- Handle failed transactions gracefully

### 3. Error Handling
```typescript
// utils/contractHelpers.ts
export const handleContractError = (error: any) => {
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Transaction may fail. Please check parameters.';
  }
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for transaction.';
  }
  return error.message || 'Transaction failed';
};
```

## 📊 Monitoring and Analytics

### 1. Event Listening
```typescript
// hooks/useContractEvents.ts
export function useContractEvents() {
  useEffect(() => {
    // Listen for token transfers
    nyaxToken.on('Transfer', (from, to, amount) => {
      console.log(`Transfer: ${from} -> ${to}: ${ethers.formatEther(amount)} NYAX`);
    });

    // Listen for governance events
    governor.on('ProposalCreated', (proposalId, proposer, description) => {
      console.log(`New proposal ${proposalId} by ${proposer}`);
    });

    return () => {
      nyaxToken.removeAllListeners();
      governor.removeAllListeners();
    };
  }, []);
}
```

### 2. Transaction Tracking
```typescript
// utils/transactionTracker.ts
export const trackTransaction = async (txHash: string) => {
  const provider = new ethers.providers.JsonRpcProvider();
  
  try {
    const receipt = await provider.waitForTransaction(txHash);
    
    if (receipt.status === 1) {
      console.log('Transaction successful:', txHash);
      return { success: true, receipt };
    } else {
      console.log('Transaction failed:', txHash);
      return { success: false, receipt };
    }
  } catch (error) {
    console.error('Transaction error:', error);
    return { success: false, error };
  }
};
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Network configuration verified
- [ ] Gas prices checked
- [ ] Deployment wallet funded

### Deployment
- [ ] Contracts deployed successfully
- [ ] Contract addresses saved
- [ ] Contracts verified on block explorer
- [ ] Initial governance setup completed
- [ ] Treasury categories configured

### Post-Deployment
- [ ] Frontend environment variables updated
- [ ] Contract integration tested
- [ ] Admin functions verified
- [ ] User functions tested
- [ ] Documentation updated

## 📞 Support and Resources

### Documentation
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Documentation](https://docs.ethers.io/)

### Community
- GitHub Issues for bug reports
- Discord for community support
- Documentation for guides and tutorials

### Emergency Contacts
- Development Team: dev@nyaltx.com
- Security Issues: security@nyaltx.com
- General Support: support@nyaltx.com

---

**🎉 Congratulations!** You now have a complete NYAX Platform smart contract suite integrated with your application. The contracts provide enterprise-grade token management, governance, treasury operations, and vesting functionality.

Remember to always test thoroughly on testnets before mainnet deployment and consider professional security audits for production use.
