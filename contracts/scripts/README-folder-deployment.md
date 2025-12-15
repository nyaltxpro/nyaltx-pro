# Folder System Deployment Guide

This guide covers the deployment of the FolderEscrow and FolderRegistryFactory contracts for the NYALTX governance system.

## Contracts Overview

### FolderEscrow
- **Purpose**: Manages token vesting and distribution for beneficiary folders
- **Key Features**: 
  - Beneficiary management with vesting schedules
  - Claim functionality with cliff and duration periods
  - Pause/resume capabilities for individual beneficiaries
  - Admin controls for folder management

### FolderRegistryFactory
- **Purpose**: Factory contract for creating and managing FolderEscrow instances
- **Key Features**:
  - Creates new folders with unique names
  - Tracks all deployed folders
  - Provides aggregate statistics across all folders
  - Governance-controlled deployment

## Environment Variables

Create or update your `.env` file with the following variables:

```bash
# Required for FolderFactory
GOVERNANCE_ADDRESS=0x...  # Address with governance role

# Required for FolderEscrow
TOKEN_ADDRESS=0x...       # ERC20 token address for vesting
FOLDER_ADMIN_ADDRESS=0x... # Admin address for folder management
FOLDER_NAME="My Folder"   # Default folder name
FOLDER_REGISTRY_ADDRESS=0x... # Factory contract address

# Optional
DEPLOYER_PRIVATE_KEY=...   # Private key for deployment (if using hardhat node)
```

## Deployment Scripts

### 1. Individual Contract Deployments

#### Deploy FolderFactory
```bash
npx hardhat run scripts/deploy-folder-factory.js --network <network>
```

#### Deploy FolderEscrow
```bash
npx hardhat run scripts/deploy-folder-escrow.js --network <network>
```

### 2. Complete System Deployment

#### Deploy Both Contracts (Recommended)
```bash
npx hardhat run scripts/deploy-folder-system.js --network <network>
```

This script deploys the factory first, then optionally deploys a sample escrow contract.

## Deployment Examples

### Example 1: Development Deployment
```bash
# Deploy to local hardhat network
npx hardhat run scripts/deploy-folder-system.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy-folder-system.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy-folder-system.js --network mainnet
```

### Example 2: Custom Parameters
```bash
# Deploy with custom governance address
GOVERNANCE_ADDRESS=0x1234... npx hardhat run scripts/deploy-folder-factory.js --network mainnet

# Deploy escrow with custom parameters
TOKEN_ADDRESS=0x5678... \
FOLDER_NAME="Team Vesting" \
FOLDER_ADMIN_ADDRESS=0x9abc... \
npx hardhat run scripts/deploy-folder-escrow.js --network mainnet
```

## Deployment Verification

After deployment, verify the contracts are working correctly:

### 1. Check Factory Deployment
```javascript
const factory = await ethers.getContractAt("FolderRegistryFactory", FACTORY_ADDRESS);
const totalFolders = await factory.totalFolders();
console.log(`Total folders: ${totalFolders}`);
```

### 2. Check Escrow Deployment
```javascript
const escrow = await ethers.getContractAt("FolderEscrow", ESCROW_ADDRESS);
const token = await escrow.token();
const folderName = await escrow.folderName();
console.log(`Token: ${token}, Folder: ${folderName}`);
```

## Contract Interaction Examples

### Create a New Folder (via Factory)
```javascript
const factory = await ethers.getContractAt("FolderRegistryFactory", FACTORY_ADDRESS);
const tx = await factory.createFolder(
    "Team Vesting",
    TOKEN_ADDRESS,
    FOLDER_ADMIN_ADDRESS
);
await tx.wait();
```

### Add Beneficiary (to FolderEscrow)
```javascript
const escrow = await ethers.getContractAt("FolderEscrow", ESCROW_ADDRESS);
const tx = await escrow.addBeneficiary(
    BENEFICIARY_ADDRESS,
    TOTAL_ALLOCATION,
    START_TIME,
    CLIFF_PERIOD,
    VESTING_DURATION
);
await tx.wait();
```

## Deployment Files

Deployment information is automatically saved to:
- `deployments/<network>-deployment.json`

This file contains:
- Contract addresses
- Deployment parameters
- Transaction hashes
- Deployment timestamp

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```
   Error: Missing required environment variable: GOVERNANCE_ADDRESS
   ```
   Solution: Set the required environment variables in your `.env` file.

2. **Insufficient Gas**
   ```
   Error: insufficient funds for gas
   ```
   Solution: Ensure the deployer wallet has sufficient ETH for gas fees.

3. **Network Connection Issues**
   ```
   Error: network connection timeout
   ```
   Solution: Check your network configuration and RPC endpoint.

### Gas Estimates

- **FolderFactory**: ~2,500,000 gas
- **FolderEscrow**: ~1,800,000 gas
- **Complete System**: ~4,300,000 gas

## Security Considerations

1. **Admin Security**: Ensure admin addresses are secure and use multi-sig when possible
2. **Token Approval**: The FolderEscrow contract needs token approval for transfers
3. **Access Control**: Verify role assignments are correct after deployment
4. **Testing**: Always test on testnets before mainnet deployment

## Post-Deployment Setup

1. **Verify Contracts** on Etherscan (if on public network)
2. **Update Frontend** with new contract addresses
3. **Set up Token Approvals** for the escrow contracts
4. **Configure Admin Roles** and permissions
5. **Test Functionality** with small amounts first

## Support

For deployment issues:
1. Check the deployment logs in `deployments/` directory
2. Verify environment variables are correctly set
3. Ensure network configuration is correct in `hardhat.config.js`
4. Test with small amounts on testnets first
