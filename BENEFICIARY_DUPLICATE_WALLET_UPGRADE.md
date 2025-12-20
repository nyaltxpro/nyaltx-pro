# FolderEscrow Contract Upgrade - Multiple Beneficiaries Per Wallet

## Overview
The FolderEscrow contract has been upgraded to support adding the same wallet address multiple times as a beneficiary with different allocations and vesting schedules.

## Changes Made

### 1. Smart Contract (`contracts/contracts/FolderEscrow.sol`)

#### Storage Structure Changes:
- **Before**: Used `mapping(address => Beneficiary)` - one beneficiary per wallet
- **After**: Uses `Beneficiary[]` array - multiple beneficiaries per wallet

#### New Beneficiary Structure:
```solidity
struct Beneficiary {
    uint256 id;              // NEW: Unique beneficiary ID
    address wallet;          // NEW: Wallet address (can be duplicated)
    uint256 totalAllocation;
    uint256 claimed;
    uint256 start;
    uint256 cliff;
    uint256 duration;
    bool paused;
    bool cancelled;
    string walletName;
}
```

#### New State Variables:
- `Beneficiary[] public beneficiaries` - Array of all beneficiaries
- `mapping(address => uint256[]) public walletToBeneficiaryIds` - Maps wallet to their beneficiary IDs
- `mapping(bytes32 => uint256) public walletByNameHash` - Maps wallet name hash to beneficiary ID
- `uint256 public nextBeneficiaryId` - Counter for generating unique IDs

#### Updated Functions:
- `addBeneficiary()` - Now creates new entry with unique ID (allows duplicates)
- `pauseBeneficiary(uint256 beneficiaryId)` - Now uses ID instead of wallet address
- `resumeBeneficiary(uint256 beneficiaryId)` - Now uses ID instead of wallet address
- `cancelBeneficiary(uint256 beneficiaryId)` - Now uses ID instead of wallet address
- `updateWalletName(uint256 beneficiaryId, string newName)` - Now uses ID instead of wallet address
- `claim()` - Now claims from ALL beneficiary entries for the caller's wallet
- `_vestedAmount(uint256 beneficiaryId)` - Now calculates vesting for specific beneficiary ID

#### New View Functions:
- `getBeneficiaryCount()` - Returns total number of beneficiary entries
- `getBeneficiaryById(uint256 beneficiaryId)` - Gets beneficiary details by ID
- `getBeneficiaryIdsByWallet(address wallet)` - Gets all beneficiary IDs for a wallet
- `getBeneficiaryInfo(address wallet)` - Returns first beneficiary entry (backward compatibility)

### 2. Contract ABI (`src/services/contracts/config.ts`)
Updated all function signatures to match the new contract structure.

### 3. FolderEscrowService (`src/services/contracts/folderEscrowService.ts`)

#### New Methods:
- `getBeneficiaryCount()` - Get total beneficiary count
- `getBeneficiaryById(beneficiaryId)` - Get beneficiary by ID
- `getBeneficiaryIdsByWallet(wallet)` - Get all IDs for a wallet
- `getAllBeneficiaries()` - Get all beneficiary entries
- `getVestedAmountForWallet(wallet)` - Get total vested amount across all entries for a wallet

#### Updated Methods:
- `pauseBeneficiary(beneficiaryId, signer)` - Now uses ID
- `resumeBeneficiary(beneficiaryId, signer)` - Now uses ID
- `cancelBeneficiary(beneficiaryId, signer)` - Now uses ID
- `updateWalletName(beneficiaryId, newName, signer)` - Now uses ID
- All utility methods updated to work with new structure

### 4. Frontend (`src/components/nyax/AdminDashboardFixed.tsx`)
No changes required! The `addBeneficiary` function still accepts the same parameters:
- wallet address
- totalAllocation
- start
- cliff
- duration
- walletName

The contract now allows the same wallet to be added multiple times automatically.

## Key Features

### ✅ Multiple Entries Per Wallet
- Same wallet address can now be added multiple times
- Each entry has a unique beneficiary ID
- Each entry can have different:
  - Allocation amounts
  - Vesting schedules
  - Start dates
  - Cliff periods
  - Durations

### ✅ Aggregated Claiming
- When a wallet calls `claim()`, it automatically claims from ALL their beneficiary entries
- Skips paused or cancelled entries
- Skips entries where cliff hasn't been reached
- Returns total claimable amount across all entries

### ✅ Individual Management
- Each beneficiary entry can be paused/resumed/cancelled independently using its ID
- Wallet names must still be unique across all entries
- Admin can manage each allocation separately

### ✅ Balance Validation
- **NEW**: Prevents over-allocation beyond folder balance
- Checks total allocated amount before adding new beneficiaries
- Ensures `totalAllocated + newAllocation <= folderBalance`
- Protects against allocating more tokens than available in the folder
- Error message: "Insufficient folder balance"

### ✅ Backward Compatibility
- `getBeneficiaryInfo(wallet)` still works (returns first entry)
- Existing frontend code continues to work
- `addBeneficiary()` has same signature

## Deployment Steps

### 1. Compile the Contract
```bash
cd contracts
npx hardhat compile
```

### 2. Deploy New Contract
```bash
npx hardhat run scripts/deploy-folder-escrow.js --network sepolia
```

### 3. Update Contract Address
Update the deployed contract address in your configuration files.

### 4. Verify on Etherscan (Optional)
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Balance Validation

The contract now includes **automatic balance validation** to prevent over-allocation:

### How It Works:
1. When adding a beneficiary, the contract calculates the current total allocated amount
2. It checks the folder's token balance
3. It ensures: `currentTotalAllocated + newAllocation <= folderBalance`
4. If the check fails, the transaction reverts with "Insufficient folder balance"

### Example Scenario:
```
Folder Balance: 100,000 NYAX
Already Allocated: 80,000 NYAX
Attempting to Add: 30,000 NYAX
Result: ❌ REJECTED - Would exceed balance (110,000 > 100,000)

Attempting to Add: 20,000 NYAX
Result: ✅ APPROVED - Within balance (100,000 <= 100,000)
```

### Checking Available Balance:
```typescript
// Get folder balance
const folderBalance = await folderEscrow.getFolderBalance();

// Get total allocated
const totalAllocated = await folderEscrow.getTotalAllocated();

// Calculate available for allocation
const available = folderBalance - totalAllocated;
console.log(`Available to allocate: ${ethers.formatEther(available)} NYAX`);
```

## Usage Examples

### Adding Same Wallet Multiple Times
```typescript
// First allocation - Founder vesting
await folderEscrow.addBeneficiary(
  "0x123...",
  ethers.parseEther("100000"),
  startTime,
  cliff30Days,
  duration1Year,
  "John Doe - Founder Allocation"
);

// Second allocation - Advisor vesting (SAME WALLET!)
await folderEscrow.addBeneficiary(
  "0x123...",  // Same wallet address
  ethers.parseEther("50000"),
  startTime,
  cliff90Days,
  duration2Years,
  "John Doe - Advisor Allocation"
);
```

### Querying Beneficiary Entries
```typescript
// Get all beneficiary IDs for a wallet
const beneficiaryIds = await folderEscrow.getBeneficiaryIdsByWallet("0x123...");
// Returns: [0, 1] (two entries)

// Get details for each entry
for (const id of beneficiaryIds) {
  const beneficiary = await folderEscrow.getBeneficiaryById(id);
  console.log(`ID: ${beneficiary.id}, Allocation: ${beneficiary.totalAllocation}`);
}
```

### Managing Individual Entries
```typescript
// Pause specific beneficiary entry by ID
await folderEscrow.pauseBeneficiary(0);  // Pauses first entry

// Resume specific beneficiary entry
await folderEscrow.resumeBeneficiary(0);

// Cancel specific beneficiary entry
await folderEscrow.cancelBeneficiary(1);  // Cancels second entry
```

### Claiming
```typescript
// Beneficiary claims from ALL their entries at once
await folderEscrow.claim();
// Automatically aggregates claimable amounts from all entries
```

## Migration Notes

### For Existing Deployments:
⚠️ **This is a breaking change that requires contract redeployment**

If you have existing FolderEscrow contracts with beneficiaries:
1. Deploy the new contract version
2. Migrate existing beneficiary data to the new contract
3. Update all references to use the new contract address

### Data Migration Script Needed:
You'll need to create a migration script to:
1. Read all beneficiaries from old contract
2. Add them to new contract with `addBeneficiary()`
3. Verify all data migrated correctly

## Testing Checklist

- [ ] Deploy new contract to testnet
- [ ] Add same wallet multiple times
- [ ] Verify each entry has unique ID
- [ ] Test claiming from multiple entries
- [ ] Test pausing individual entries
- [ ] Test cancelling individual entries
- [ ] Verify aggregated vesting calculations
- [ ] Test frontend integration
- [ ] Verify backward compatibility

## Benefits

1. **Flexibility**: Same wallet can receive multiple allocations with different vesting schedules
2. **Transparency**: Each allocation is tracked separately with unique ID
3. **Simplicity**: Beneficiaries still claim with single transaction
4. **Management**: Admins can manage each allocation independently
5. **Compatibility**: Existing frontend code works without changes

## Support

For questions or issues, refer to:
- Smart Contract: `/contracts/contracts/FolderEscrow.sol`
- Service Layer: `/src/services/contracts/folderEscrowService.ts`
- Frontend: `/src/components/nyax/AdminDashboardFixed.tsx`
