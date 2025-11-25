# NYAX DAO Smart Contracts Deployment Guide

This guide provides step-by-step instructions for deploying the complete NYAX DAO smart contract system.

## 📋 Contract Overview

The NYAX DAO consists of the following smart contracts:

1. **NYAXToken** - ERC20 governance token with voting capabilities
2. **SimpleMultiSig** - Multi-signature wallet for treasury operations
3. **Treasury** - Token allocation and distribution management
4. **NYAXTimelockController** - Timelock for governance execution
5. **NYAXGovernor** - OpenZeppelin Governor for DAO governance
6. **VestingFactory** - Factory for creating vesting contracts
7. **VestingWalletFlexible** - Flexible vesting with milestones

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Hardhat** development environment
4. **Wallet** with sufficient ETH for deployment

### Installation

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
npm install

# Copy environment template
cp env-template.txt .env

# Edit .env with your configuration
nano .env
```

### Environment Configuration

Edit `.env` file with your deployment settings:

```bash
# Required: Private key for deployment
PRIVATE_KEY=your_private_key_without_0x_prefix

# Required: RPC URL for target network
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Required for verification: Block explorer API keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## 🔧 Deployment Commands

### Local Development

```bash
# Start local Hardhat node
npm run node

# Deploy to local network (in another terminal)
npm run deploy-dao:local
```

### Testnet Deployment

```bash
# Deploy to Sepolia testnet
npm run deploy-dao:sepolia

# Deploy to other testnets
npm run deploy-dao:polygon  # Polygon Mumbai (if configured)
```

### Mainnet Deployment

```bash
# Deploy to Ethereum mainnet
npm run deploy-dao:mainnet

# Deploy to other mainnets
npm run deploy-dao:polygon   # Polygon
npm run deploy-dao:bsc       # BSC
npm run deploy-dao:arbitrum  # Arbitrum
```

## 📊 Deployment Configuration

The deployment script uses the following default configuration:

### Token Configuration
- **Name**: NYAX
- **Symbol**: NYAX
- **Max Supply**: 1,000,000,000 tokens
- **Initial Mint**: 100,000,000 tokens to Treasury

### MultiSig Configuration
- **Default Owners**: Deployer address (update after deployment)
- **Default Threshold**: 1 (update after deployment)
- **Recommended**: 3-5 owners with 60% threshold

### Governance Configuration
- **Voting Delay**: 1 block (~12 seconds)
- **Voting Period**: 50,400 blocks (~1 week)
- **Proposal Threshold**: 1,000,000 tokens
- **Quorum**: 4% of total supply
- **Timelock Delay**: 2 days (172,800 seconds)

### Treasury Categories
- **Development**: 25% allocation
- **Marketing**: 15% allocation
- **Liquidity**: 20% allocation
- **Team**: 10% allocation
- **Advisors**: 5% allocation
- **Community**: 10% allocation
- **Reserve**: 15% allocation

## 📝 Post-Deployment Steps

### 1. Update Frontend Environment Variables

Add the deployed contract addresses to your frontend `.env.local`:

```bash
NEXT_PUBLIC_NYAX_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_MULTISIG_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_ADDRESS=0x...
NEXT_PUBLIC_TIMELOCK_ADDRESS=0x...
NEXT_PUBLIC_GOVERNOR_ADDRESS=0x...
NEXT_PUBLIC_VESTING_FACTORY_ADDRESS=0x...
```

### 2. Verify Contracts on Block Explorer

The deployment script provides verification commands. Run them after deployment:

```bash
# Example for Sepolia
npx hardhat verify --network sepolia 0xTOKEN_ADDRESS "0xTREASURY_ADDRESS" "0xOWNER_ADDRESS"
```

### 3. Configure MultiSig Owners

Update the MultiSig with actual owner addresses:

```solidity
// Submit transaction to add owners
multisig.submitTransaction(
    multisig.address,
    0,
    abi.encodeWithSignature("addOwner(address)", newOwnerAddress)
);

// Update threshold
multisig.submitTransaction(
    multisig.address,
    0,
    abi.encodeWithSignature("changeThreshold(uint256)", newThreshold)
);
```

### 4. Update Treasury Category Wallets

Replace temporary deployer addresses with actual category wallets:

```solidity
treasury.setCategoryWallet("development", devWalletAddress, 2500);
treasury.setCategoryWallet("marketing", marketingWalletAddress, 1500);
// ... etc for all categories
```

### 5. Transfer Ownership

Transfer contract ownership to MultiSig where appropriate:

```solidity
// Transfer Treasury ownership to MultiSig
treasury.transferOwnership(multisigAddress);

// Transfer VestingFactory ownership to MultiSig
vestingFactory.transferOwnership(multisigAddress);
```

### 6. Renounce Timelock Admin Role

After testing governance, renounce the timelock admin role:

```solidity
timelock.renounceRole(TIMELOCK_ADMIN_ROLE, deployerAddress);
```

## 🔍 Contract Verification

### Automatic Verification

The deployment script **automatically verifies all contracts** on supported networks (non-local). Verification happens immediately after each contract deployment with proper error handling and fallback commands.

**Features:**
- ✅ **Automatic verification** after each contract deployment
- ✅ **Error handling** with fallback manual commands
- ✅ **Network detection** (skips verification for local networks)
- ✅ **Already verified** detection to avoid duplicate attempts

### Manual Verification

If automatic verification fails, use the dedicated verification script:

```bash
# Update contract addresses in scripts/verify-contracts.js first
npm run verify-contracts:sepolia   # For Sepolia testnet
npm run verify-contracts:mainnet   # For Ethereum mainnet
npm run verify-contracts:polygon   # For Polygon
npm run verify-contracts:bsc       # For BSC
npm run verify-contracts:arbitrum  # For Arbitrum
```

**Alternative manual verification:**
1. **Flatten contracts**: `npx hardhat flatten contracts/NYAXToken.sol > NYAXToken_flat.sol`
2. **Upload to block explorer** with constructor parameters
3. **Verify each contract** individually

## 🧪 Testing

### Run Tests

```bash
# Compile contracts
npm run compile

# Run all tests
npm run test

# Run tests with gas reporting
npm run gas-report

# Run coverage analysis
npm run test:coverage
```

### Test Deployment Locally

```bash
# Start local node
npm run node

# Deploy to local network
npm run deploy-dao:local

# Interact with contracts using Hardhat console
npm run console --network localhost
```

## 🚨 Security Considerations

### Before Mainnet Deployment

1. **Audit Contracts**: Get professional security audit
2. **Test Thoroughly**: Deploy and test on testnets first
3. **Verify Configuration**: Double-check all parameters
4. **Backup Keys**: Secure backup of deployment keys
5. **MultiSig Setup**: Configure proper MultiSig owners and threshold

### After Deployment

1. **Monitor Contracts**: Set up monitoring and alerts
2. **Emergency Procedures**: Document emergency response procedures
3. **Upgrade Paths**: Plan for potential upgrades (if using upgradeable contracts)
4. **Key Management**: Secure storage of admin keys

## 📚 Additional Resources

### Documentation
- [OpenZeppelin Governor](https://docs.openzeppelin.com/contracts/4.x/governance)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.io/v6/)

### Tools
- [Hardhat](https://hardhat.org/) - Development environment
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/) - Secure contract library
- [Remix IDE](https://remix.ethereum.org/) - Online Solidity IDE

### Block Explorers
- [Etherscan](https://etherscan.io/) - Ethereum
- [PolygonScan](https://polygonscan.com/) - Polygon
- [BscScan](https://bscscan.com/) - BSC
- [Arbiscan](https://arbiscan.io/) - Arbitrum

## 🆘 Troubleshooting

### Common Issues

1. **Insufficient Gas**: Increase gas limit in network configuration
2. **Nonce Issues**: Reset account nonce in MetaMask
3. **RPC Errors**: Try different RPC endpoints
4. **Verification Fails**: Check constructor parameters and compiler version

### Getting Help

1. **GitHub Issues**: Report bugs and issues
2. **Discord Community**: Join for real-time support
3. **Documentation**: Check official docs first
4. **Stack Overflow**: Search for similar issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
