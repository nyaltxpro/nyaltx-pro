# NYAX Platform Smart Contracts

A comprehensive smart contract suite for the NYAX platform, including token, governance, treasury, and vesting functionality.

## 📋 Overview

The NYAX Platform consists of several interconnected smart contracts:

- **NYAXToken**: ERC20 token with governance capabilities (ERC20Votes) and permit functionality
- **Treasury**: Manages token allocations and distributions with category-based organization
- **SimpleMultiSig**: Multi-signature wallet for secure treasury operations
- **VestingWalletFlexible**: Flexible vesting contracts with cliff, linear, and milestone support
- **VestingFactory**: Factory for creating and managing multiple vesting contracts

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NYAXToken     │    │    Treasury     │    │ SimpleMultiSig  │
│                 │    │                 │    │                 │
│ • ERC20Votes    │◄───┤ • Minting       │◄───┤ • Multi-sig     │
│ • ERC20Permit   │    │ • Categories    │    │ • Governance    │
│ • Governance    │    │ • Allocations   │    │ • Security      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │ VestingFactory  │
         │              │                 │
         └──────────────┤ • Team Vesting  │
                        │ • Advisor Vest. │
                        │ • Marketing     │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn
- Git

### Installation

1. **Install dependencies:**
   ```bash
   npm run contracts:install
   ```

2. **Compile contracts:**
   ```bash
   npm run contracts:compile
   ```

3. **Run tests:**
   ```bash
   npm run contracts:test
   ```

4. **Start local blockchain:**
   ```bash
   npm run contracts:node
   ```

### Environment Setup

1. **Copy environment file:**
   ```bash
   cp contracts/env.example contracts/.env
   ```

2. **Configure environment variables:**
   ```bash
   # Network RPC URLs
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
   
   # Private Key (DO NOT COMMIT REAL KEYS)
   PRIVATE_KEY=your_private_key_here
   
   # API Keys for Verification
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

## 📦 Deployment

### Local Deployment

```bash
# Start local blockchain
npm run contracts:node

# Deploy to local network
npm run contracts:deploy:local
```

### Testnet Deployment (Sepolia)

```bash
# Deploy to Sepolia
npm run contracts:deploy:sepolia

# Verify contracts
npm run contracts:verify:sepolia
```

### Mainnet Deployment

```bash
# Deploy to mainnet
npm run contracts:deploy:mainnet

# Verify contracts
npm run contracts:verify:mainnet
```

### Post-Deployment Setup

```bash
# Setup governance system
npm run contracts:setup-governance
```

## 🔧 Contract Details

### NYAXToken

**Features:**
- ERC20 standard compliance
- ERC20Permit for gasless approvals
- ERC20Votes for governance voting power
- Controlled minting by Treasury or Owner
- Transfer restrictions and blacklist functionality
- Maximum supply cap of 1 billion tokens

**Key Functions:**
```solidity
function mint(address to, uint256 amount) external onlyTreasuryOrOwner
function burn(address from, uint256 amount) external onlyTreasuryOrOwner
function setTransfersEnabled(bool enabled) external onlyOwner
function setBlacklisted(address account, bool blacklisted) external onlyOwner
```

### Treasury

**Features:**
- Category-based wallet management
- Integration with MultiSig for large transfers
- Token minting and burning capabilities
- Allocation tracking and limits
- Emergency recovery functions

**Categories:**
- Team: 20%
- Advisors: 5%
- Marketing: 15%
- Development: 25%
- Community: 35%

**Key Functions:**
```solidity
function setCategoryWallet(string category, address wallet, uint256 allocation) external onlyOwner
function transferTo(address to, uint256 amount, string reason, string category) external onlyOwner
function multisigTransfer(address to, uint256 amount, string reason, string category) external onlyMultisig
```

### SimpleMultiSig

**Features:**
- Multiple owners with configurable threshold
- Transaction submission, confirmation, and execution
- Support for ETH and ERC20 token transfers
- Owner management functions

**Key Functions:**
```solidity
function submitTransaction(address to, uint256 value, bytes data) external onlyOwner
function confirmTransaction(uint256 txIndex) external onlyOwner
function executeTransaction(uint256 txIndex) external onlyOwner
```

### VestingWalletFlexible

**Features:**
- Cliff period support
- Linear vesting after cliff
- Milestone-based releases
- Revocable vesting (optional)
- Emergency pause functionality

**Key Functions:**
```solidity
function createVestingSchedule(address beneficiary, uint256 totalAmount, uint256 start, uint256 cliffDuration, uint256 duration, bool revocable, string category) external onlyOwner
function release(bytes32 scheduleId) external
function revoke(bytes32 scheduleId) external onlyOwner
```

## 🧪 Testing

### Run All Tests
```bash
npm run contracts:test
```

### Run Specific Test Files
```bash
cd contracts
npx hardhat test test/NYAXToken.test.js
npx hardhat test test/Treasury.test.js
```

### Generate Coverage Report
```bash
cd contracts
npm run test:coverage
```

### Gas Report
```bash
cd contracts
npm run gas-report
```

## 🔍 Verification

After deployment, verify contracts on block explorers:

```bash
# Sepolia
npm run contracts:verify:sepolia

# Mainnet
npm run contracts:verify:mainnet
```

## 📊 Governance

### Token Distribution

| Category | Allocation | Purpose |
|----------|------------|---------|
| Team | 20% | Core team incentives |
| Advisors | 5% | Advisory board compensation |
| Marketing | 15% | Marketing and partnerships |
| Development | 25% | Platform development |
| Community | 35% | Community rewards and ecosystem |

### Voting Power

- Token holders can delegate voting power
- Voting power is based on token balance
- Delegation is required to participate in governance
- Historical voting power is tracked for proposals

### MultiSig Operations

- 2-of-2 multisig for large treasury operations
- Threshold: 1,000,000 NYAX tokens
- All large transfers require multisig approval
- Emergency functions available to multisig owners

## 🔐 Security

### Access Control

- **Owner**: Can mint, burn, set treasury, manage categories
- **Treasury**: Can mint and burn tokens
- **MultiSig**: Required for large treasury transfers
- **Beneficiaries**: Can release their vested tokens

### Security Features

- Reentrancy protection on all state-changing functions
- Transfer restrictions and blacklist functionality
- Emergency pause capabilities
- Maximum supply cap enforcement
- Comprehensive input validation

### Audit Recommendations

1. **Smart Contract Audit**: Professional audit before mainnet deployment
2. **Multisig Security**: Use hardware wallets for multisig owners
3. **Key Management**: Secure private key storage and rotation
4. **Monitoring**: Set up monitoring for large transactions
5. **Emergency Procedures**: Document and test emergency response

## 📁 File Structure

```
contracts/
├── contracts/
│   ├── NYAXToken.sol              # Main NYAX token contract
│   ├── Treasury.sol               # Treasury management
│   ├── SimpleMultiSig.sol         # Multi-signature wallet
│   ├── VestingWalletFlexible.sol  # Flexible vesting contract
│   └── VestingFactory.sol         # Vesting contract factory
├── scripts/
│   ├── deploy.js                  # Main deployment script
│   ├── verify.js                  # Contract verification
│   └── setup-governance.js       # Governance setup
├── test/
│   ├── NYAXToken.test.js         # Token contract tests
│   └── Treasury.test.js          # Treasury contract tests
├── deployments/                   # Deployment artifacts
├── hardhat.config.js             # Hardhat configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔗 Links

- [NYALTX Platform](https://nyaltx.com)
- [Documentation](https://docs.nyaltx.com)
- [GitHub Repository](https://github.com/nyaltx/platform)

---

**⚠️ Important Security Notice**

These smart contracts handle financial assets. Always:
- Use testnet for development and testing
- Conduct thorough security audits before mainnet deployment
- Use hardware wallets for production keys
- Implement proper monitoring and alerting
- Have emergency response procedures ready
