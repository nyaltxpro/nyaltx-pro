# Wallet Name and Balance Tracking Feature

## Overview
Added comprehensive wallet name tracking and balance visibility features to the FolderEscrow and Treasury contracts.

## New Features

### 1. Wallet Name Tracking (FolderEscrow)
- **Wallet Names**: Each beneficiary wallet now has an associated name
- **Name-based Lookup**: Find wallet addresses by their assigned names
- **Name Updates**: Admin can update wallet names while preventing duplicates
- **Unique Names**: System ensures no duplicate wallet names within a folder

### 2. Folder Balance Tracking (Treasury)
- **Balance Tracking**: Treasury tracks total amount sent to each folder
- **Cumulative Records**: Running total of all transfers to each folder
- **Balance Queries**: View individual folder balances or all balances at once
- **Transfer History**: Enhanced events include cumulative balance information

### 3. Folder Balance Visibility (FolderEscrow)
- **Current Balance**: View current token balance held by folder contract
- **Funding Tracking**: Track total funding received over time
- **Balance Events**: Emits events when folder receives funding

## Contract Changes

### FolderEscrow.sol

#### New State Variables
```solidity
mapping(bytes32 => address) public walletByNameHash;  // Name hash to wallet address
uint256 public folderBalance;  // Total tokens received from treasury
```

#### Updated Beneficiary Struct
```solidity
struct Beneficiary {
    uint256 totalAllocation;
    uint256 claimed;
    uint256 start;
    uint256 cliff;
    uint256 duration;
    bool paused;
    bool cancelled;
    string walletName;  // NEW: Wallet name
}
```

#### New Functions
- `addBeneficiary(address, uint256, uint256, uint256, uint256, string walletName)` - Now requires wallet name
- `getWalletByName(string walletName) returns (address)` - Find wallet by name
- `updateWalletName(address wallet, string newName)` - Update wallet name
- `getFolderBalance() returns (uint256)` - Get current folder token balance
- `trackFunding(uint256 amount)` - Track funding received

#### Updated Functions
- `getBeneficiaryInfo()` - Now returns wallet name as 8th parameter

#### New Events
```solidity
event BeneficiaryAdded(address wallet, string walletName, uint256 amount, uint256 start, uint256 cliff, uint256 duration);
event FolderFunded(uint256 amount, uint256 newBalance);
event WalletNameUpdated(address wallet, string oldName, string newName);
```

### Treasury.sol

#### New State Variables
```solidity
mapping(address => uint256) public folderBalances;  // Track amount sent to each folder
```

#### Updated Functions
- `sendToFolder(address folder, uint256 amount)` - Now tracks cumulative balance

#### New Functions
- `getFolderBalance(address folder) returns (uint256)` - Get total sent to specific folder
- `getAllFolderBalances() returns (address[], uint256[])` - Get all folder balances

#### Updated Events
```solidity
event TokensSentToFolder(address indexed folder, uint256 amount, uint256 totalSent);
```

## Usage Examples

### Adding a Beneficiary with Name
```typescript
const tx = await folderEscrowContract.addBeneficiary(
  walletAddress,
  ethers.parseEther("1000"),  // totalAllocation
  startTime,
  cliffDuration,
  vestingDuration,
  "John Doe - Founder"  // walletName
);
```

### Finding Wallet by Name
```typescript
const walletAddress = await folderEscrowContract.getWalletByName("John Doe - Founder");
```

### Updating Wallet Name
```typescript
const tx = await folderEscrowContract.updateWalletName(
  walletAddress,
  "John Doe - CEO"  // newName
);
```

### Checking Folder Balance in Treasury
```typescript
const totalSent = await treasuryContract.getFolderBalance(folderAddress);
console.log(`Total sent to folder: ${ethers.formatEther(totalSent)} tokens`);
```

### Checking Current Folder Token Balance
```typescript
const currentBalance = await folderEscrowContract.getFolderBalance();
console.log(`Current folder balance: ${ethers.formatEther(currentBalance)} tokens`);
```

### Getting All Folder Balances
```typescript
const [folders, balances] = await treasuryContract.getAllFolderBalances();
folders.forEach((folder, i) => {
  console.log(`Folder ${folder}: ${ethers.formatEther(balances[i])} tokens sent`);
});
```

## UI Integration

### Updated Services
- `folderRegistryService.ts` - Updated to handle wallet names in beneficiary info
- `treasuryService.ts` - Added methods for balance tracking
- `config.ts` - Updated ABIs with new function signatures

### TypeScript Types
```typescript
interface FolderMemberInfo {
  account: string;
  permissions: number;
  unlockedAmount: string;
  walletName?: string;  // NEW
}
```

## Benefits

### For Admins
1. **Better Organization**: Identify wallets by human-readable names instead of addresses
2. **Easy Lookup**: Find wallet addresses by searching for names
3. **Balance Visibility**: See exactly how much has been transferred to each folder
4. **Audit Trail**: Track total funding sent to folders over time

### For Users
1. **Clarity**: See wallet names instead of just addresses in UI
2. **Transparency**: View folder balances and funding history
3. **Better UX**: More intuitive interface with named wallets

### For Developers
1. **Name-based Queries**: Query wallets by name for easier integration
2. **Balance Tracking**: Built-in balance tracking without external indexing
3. **Event Monitoring**: Enhanced events with balance information

## Migration Notes

### Existing Deployments
- Existing beneficiaries will need wallet names added via `updateWalletName()`
- Old contracts without these features will continue to work
- New deployments will require wallet names when adding beneficiaries

### Breaking Changes
- `addBeneficiary()` now requires a `walletName` parameter
- `getBeneficiaryInfo()` returns an additional `walletName` field
- `TokensSentToFolder` event now includes `totalSent` parameter

## Security Considerations

1. **Name Uniqueness**: System prevents duplicate wallet names within a folder
2. **Admin Only**: Only folder admins can add/update wallet names
3. **Balance Integrity**: Balance tracking is automatic and cannot be manipulated
4. **Event Logging**: All name changes and funding tracked via events

## Testing Checklist

- [ ] Add beneficiary with wallet name
- [ ] Verify wallet name is stored correctly
- [ ] Look up wallet by name
- [ ] Update wallet name
- [ ] Verify duplicate names are rejected
- [ ] Send funds from treasury to folder
- [ ] Verify folder balance is tracked in treasury
- [ ] Verify folder balance is visible in escrow contract
- [ ] Check all folder balances query
- [ ] Verify events are emitted correctly

## Future Enhancements

1. **Wallet Metadata**: Add additional metadata fields (email, role, etc.)
2. **Name History**: Track wallet name change history
3. **Balance Alerts**: Notify when folder balances reach thresholds
4. **Batch Operations**: Add multiple wallets with names in single transaction
5. **Search Functionality**: Advanced search by partial name matching
