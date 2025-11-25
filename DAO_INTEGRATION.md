# NYAX DAO Frontend Integration

This document outlines the complete integration of the NYAX DAO contracts into the frontend application.

## 🚀 Deployed Contracts (Sepolia Testnet)

| Contract | Address | Description |
|----------|---------|-------------|
| **NYAXToken** | `0x9b3C66f562EA32496bA19D9C7174613c37A91F98` | ERC20 governance token with voting capabilities |
| **NYAXGovernor** | `0x9188d60532d021EB8E453b6e01Ba2E7717106413` | Main governance contract for proposals and voting |
| **Treasury** | `0x0344cD31a3385830c9Fa4d9d5b0e22288279C231` | Treasury management with category-based allocations |
| **SimpleMultiSig** | `0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c` | Multi-signature wallet for secure operations |
| **NYAXTimelockController** | `0xd414356D7dDb6376eBd58b995ebc6a64EcC7b9d2` | Timelock for governance execution delays |
| **VestingFactory** | `0xc33Faff420eD8fFe480b6983f57886025405f8eb` | Factory for creating token vesting contracts |
| **VestingWalletFlexible** | `0x80dA49f79125d1c1428776b75B5164C21B72aA89` | Flexible vesting wallet with milestone support |

## 📁 Frontend Integration Structure

### Core Services
```
src/services/contracts/
├── config.ts          # Contract addresses, ABIs, and constants
├── types.ts           # TypeScript interfaces for DAO data
└── dao.ts             # Main DAO service class with all contract interactions
```

### React Integration
```
src/hooks/
└── useDAO.ts          # React hook for easy DAO integration

src/components/DAO/
├── DAODashboard.tsx   # Main DAO dashboard component
└── ProposalCreator.tsx # Component for creating governance proposals

src/app/(dashboard)/
└── dao/page.tsx       # DAO page route
```

## 🔧 Environment Variables

Add these to your `.env` file:

```bash
# NYAX DAO Contract Addresses (Sepolia Testnet)
NEXT_PUBLIC_NYAX_TOKEN_ADDRESS=0x9b3C66f562EA32496bA19D9C7174613c37A91F98
NEXT_PUBLIC_NYAX_GOVERNOR_ADDRESS=0x9188d60532d021EB8E453b6e01Ba2E7717106413
NEXT_PUBLIC_TREASURY_ADDRESS=0x0344cD31a3385830c9Fa4d9d5b0e22288279C231
NEXT_PUBLIC_MULTISIG_ADDRESS=0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c
NEXT_PUBLIC_VESTING_FACTORY_ADDRESS=0xc33Faff420eD8fFe480b6983f57886025405f8eb
NEXT_PUBLIC_TIMELOCK_ADDRESS=0xd414356D7dDb6376eBd58b995ebc6a64EcC7b9d2

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
NEXT_PUBLIC_BLOCK_EXPLORER=https://sepolia.etherscan.io
```

## 🎯 Features Implemented

### 1. Token Management
- **Balance Display**: Shows user's NYAX token balance
- **Voting Power**: Displays current voting power and delegation status
- **Delegation**: Allows users to delegate voting power to other addresses
- **Token Info**: Shows total supply, max supply, and remaining mintable tokens

### 2. Governance System
- **Proposal Creation**: Create new governance proposals with multiple actions
- **Voting**: Cast votes on active proposals (For, Against, Abstain)
- **Proposal Tracking**: View proposal states and vote counts
- **Governance Stats**: Display voting parameters and quorum requirements

### 3. Treasury Management
- **Balance Tracking**: Monitor treasury token balance
- **Category Management**: View treasury allocation categories
- **Minting**: Mint new tokens to treasury (admin function)
- **Distribution Tracking**: Monitor distributed vs remaining allocations

### 4. Multi-signature Operations
- **Transaction Submission**: Submit transactions requiring multiple signatures
- **Confirmation**: Confirm pending multisig transactions
- **Execution**: Execute approved transactions
- **Owner Management**: View multisig owners and threshold

### 5. Vesting System
- **Contract Creation**: Create new vesting contracts by category
- **Schedule Management**: View and manage vesting schedules
- **Token Release**: Release vested tokens when eligible
- **Category Tracking**: Organize vesting contracts by purpose

## 🔗 Usage Examples

### Basic DAO Hook Usage
```typescript
import { useDAO } from '@/hooks/useDAO';

function MyComponent() {
  const {
    isInitialized,
    isConnected,
    getTokenBalance,
    delegateVotes,
    createProposal,
    castVote
  } = useDAO();

  // Get user's token balance
  const balance = await getTokenBalance();
  
  // Delegate voting power
  await delegateVotes('0x...');
  
  // Create a proposal
  await createProposal(
    ['0x...'], // targets
    ['0'],     // values
    ['0x'],    // calldatas
    'My Proposal Description'
  );
  
  // Cast a vote (0=Against, 1=For, 2=Abstain)
  await castVote('proposalId', 1, 'I support this proposal');
}
```

### Direct Service Usage
```typescript
import { getDAOService } from '@/services/contracts/dao';

// Get the DAO service instance
const daoService = getDAOService();

// Get token information
const tokenInfo = await daoService.getTokenInfo();

// Get governance statistics
const govStats = await daoService.getGovernanceStats();

// Get treasury categories
const categories = await daoService.getTreasuryCategories();
```

## 🎨 UI Components

### DAO Dashboard
The main dashboard (`/dashboard/dao`) provides:
- **Token Overview**: Balance, supply, and voting power cards
- **Governance Stats**: Proposal threshold, voting period, quorum
- **Voting Power Management**: Delegation interface
- **Treasury Categories**: Allocation breakdown and status
- **Real-time Updates**: Automatic data refresh

### Proposal Creator
Interactive form for creating governance proposals:
- **Title & Description**: Rich text proposal details
- **Multiple Actions**: Support for complex multi-action proposals
- **Target Validation**: Ensures valid contract addresses
- **Transaction Tracking**: Shows creation status and transaction hash

## 🔐 Security Features

### Wallet Integration
- **wagmi Integration**: Seamless wallet connection via wagmi
- **Signer Management**: Automatic signer detection for transactions
- **Network Validation**: Ensures correct network connection
- **Error Handling**: Comprehensive error management and user feedback

### Transaction Safety
- **Input Validation**: Validates all user inputs before submission
- **Gas Estimation**: Provides gas estimates for transactions
- **Confirmation Dialogs**: Clear transaction confirmation flows
- **Error Recovery**: Graceful handling of failed transactions

## 📊 Data Flow

1. **Initialization**: DAO service initializes with provider and signer
2. **Contract Connection**: Connects to deployed contracts using addresses from config
3. **Data Fetching**: Retrieves contract data using view functions
4. **User Interactions**: Executes transactions through connected wallet
5. **State Updates**: Updates UI state based on transaction results
6. **Event Listening**: Monitors contract events for real-time updates

## 🚀 Getting Started

1. **Install Dependencies**: Ensure ethers.js and wagmi are installed
2. **Set Environment Variables**: Add contract addresses to `.env`
3. **Connect Wallet**: Use the wallet connection in the header
4. **Navigate to DAO**: Visit `/dashboard/dao` to access the dashboard
5. **Interact**: View stats, delegate votes, create proposals, and participate in governance

## 🔄 Future Enhancements

### Planned Features
- **Proposal History**: Complete proposal browsing and filtering
- **Vote History**: User's voting history and participation stats
- **Advanced Analytics**: Governance participation metrics
- **Mobile Optimization**: Enhanced mobile experience
- **Notification System**: Real-time notifications for governance events
- **Proposal Templates**: Pre-built proposal templates for common actions

### Technical Improvements
- **Event Indexing**: Efficient event querying and caching
- **Offline Support**: Basic functionality without wallet connection
- **Performance Optimization**: Lazy loading and data caching
- **Error Reporting**: Enhanced error tracking and reporting
- **Testing Suite**: Comprehensive unit and integration tests

## 📝 Contract Verification

All contracts are deployed and can be verified on Sepolia Etherscan:

```bash
# Verify NYAXGovernor
npx hardhat verify --network sepolia 0x9188d60532d021EB8E453b6e01Ba2E7717106413 "0x9b3C66f562EA32496bA19D9C7174613c37A91F98" "0xd414356D7dDb6376eBd58b995ebc6a64EcC7b9d2" "1" "50400" "1000000000000000000000000" "4"

# Verify VestingFactory
npx hardhat verify --network sepolia 0xc33Faff420eD8fFe480b6983f57886025405f8eb "0x9b3C66f562EA32496bA19D9C7174613c37A91F98" "0xda791a424b294a594D81b09A86531CB1Dcf6b932"

# Verify VestingWalletFlexible
npx hardhat verify --network sepolia 0x80dA49f79125d1c1428776b75B5164C21B72aA89 "0x9b3C66f562EA32496bA19D9C7174613c37A91F98" "0xda791a424b294a594D81b09A86531CB1Dcf6b932"
```

## 🎉 Success!

The NYAX DAO is now fully integrated into the frontend with:
- ✅ Complete contract integration
- ✅ React hooks for easy usage
- ✅ Comprehensive UI components
- ✅ Real-time data updates
- ✅ Secure transaction handling
- ✅ Mobile-responsive design
- ✅ Error handling and validation
- ✅ TypeScript support throughout

Visit `/dashboard/dao` to explore the full DAO functionality!
