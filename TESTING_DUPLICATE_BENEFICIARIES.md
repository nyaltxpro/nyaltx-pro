# Testing Guide: Duplicate Beneficiaries & Balance Validation

## What Was Fixed

### 1. Frontend Updates
✅ Updated `AdminDashboardFixed.tsx` to use new contract methods:
- Changed `getBeneficiaries()` → `getAllBeneficiaries()`
- Updated to handle new `Beneficiary` object structure (with `id`, `wallet`, etc.)
- Fixed vesting calculations to use beneficiary IDs

### 2. Contract Updates
✅ Updated `FolderFactory.sol` to work with new structure:
- Uses `getBeneficiaryCount()` instead of `getBeneficiaries()`
- Accesses beneficiaries by ID instead of wallet address
- Fixed all stats functions (totalSupply, circulating, stakedValue, totalHolders)

### 3. New Contract Address
✅ Deployed new FolderFactory: `0x97E354A506f22a233AD47C19138Abed1d8934925`
✅ Updated in `config.ts`

## Why Folder Balance Shows 0

The folder balance and allocations are showing 0 because:

### **No Beneficiaries Added Yet**
- `totalAllocated` = sum of all beneficiary allocations
- If no beneficiaries exist, this will be 0
- You need to add beneficiaries through the "Add Wallet" modal

### **Folder Not Funded**
- `folderBalance` = actual NYAX tokens in the folder contract
- Even if you sent 20 NYAX from treasury, they need to be sent to the **folder contract address**, not the factory
- Each folder has its own contract address

## How to Test the New Functionality

### Step 1: Fund the Folder
```typescript
// Get the folder contract address from the admin dashboard
// Example: 0x1234...abcd

// Send NYAX tokens to this specific folder address
// You can do this from the treasury or your wallet
```

**Important:** Send tokens to the **folder contract address**, not the factory address!

### Step 2: Add First Beneficiary
1. Click "Add Wallet" button in the folder card
2. Select the folder from dropdown
3. Enter beneficiary details:
   - **Wallet Address**: Any valid address
   - **Amount**: Less than or equal to folder balance (e.g., 10 NYAX if you sent 20)
   - **Wallet Name**: Unique name (e.g., "John Doe - Founder")
   - **Start Date**: Vesting start time
   - **Cliff**: Cliff period (e.g., 30 days)
   - **Duration**: Total vesting duration (e.g., 365 days)
4. Click "Add Beneficiary"

**Expected Result:**
- ✅ Transaction succeeds
- ✅ Folder shows `totalAllocated = 10 NYAX`
- ✅ Folder shows `folderBalance = 20 NYAX`
- ✅ Beneficiary appears in the wallet section

### Step 3: Add Same Wallet Again (Duplicate Test)
1. Click "Add Wallet" again
2. Select the same folder
3. Enter **SAME wallet address** as before
4. Enter different details:
   - **Amount**: 5 NYAX (different allocation)
   - **Wallet Name**: Different unique name (e.g., "John Doe - Advisor")
   - **Start Date**: Can be different
   - **Cliff**: Can be different
   - **Duration**: Can be different
5. Click "Add Beneficiary"

**Expected Result:**
- ✅ Transaction succeeds (this would have failed before!)
- ✅ Folder shows `totalAllocated = 15 NYAX` (10 + 5)
- ✅ Two separate entries for the same wallet address
- ✅ Each entry has unique ID and name

### Step 4: Test Balance Validation (Over-allocation)
1. Click "Add Wallet" again
2. Try to add a beneficiary with amount = 10 NYAX
3. Click "Add Beneficiary"

**Expected Result:**
- ❌ Transaction fails with error: **"Insufficient folder balance"**
- ❌ Cannot allocate more than available (15 + 10 = 25 > 20)
- ✅ Folder balance remains at 20 NYAX
- ✅ Total allocated remains at 15 NYAX

### Step 5: Test Valid Allocation
1. Try adding with amount = 5 NYAX (exactly the remaining balance)
2. Click "Add Beneficiary"

**Expected Result:**
- ✅ Transaction succeeds
- ✅ Folder shows `totalAllocated = 20 NYAX` (fully allocated)
- ✅ Folder shows `folderBalance = 20 NYAX`
- ✅ Cannot add more beneficiaries (balance fully allocated)

## Checking Folder Contract Address

To find your folder's contract address:

1. Open Admin Dashboard
2. Look at the folder card
3. The address is shown in the folder details
4. Or check the browser console logs when loading folders

## Verifying on Etherscan

You can verify the folder balance on Sepolia Etherscan:

1. Go to: `https://sepolia.etherscan.io/address/[FOLDER_ADDRESS]`
2. Check the "Token" tab
3. Look for NYAX token balance
4. Should match the "Folder Balance" shown in the dashboard

## Expected Dashboard Display After Testing

After completing all steps, you should see:

```
Total Allocations
20
NYAX sent to folder

Folder Balance
20
NYAX in escrow

Vested Amount
[varies based on time]
NYAX allocated

Claimed
0
NYAX claimed
```

**Wallet Section:**
- Entry 1: John Doe - Founder (10 NYAX)
- Entry 2: John Doe - Advisor (5 NYAX)
- Entry 3: [Another beneficiary] (5 NYAX)

All three entries can have the same wallet address!

## Troubleshooting

### "Insufficient folder balance" Error
- **Cause**: Trying to allocate more than available
- **Solution**: Reduce allocation amount or fund the folder with more tokens

### "Wallet name already used" Error
- **Cause**: Each beneficiary entry must have a unique name
- **Solution**: Use different names even for the same wallet (e.g., "John - Founder" vs "John - Advisor")

### Balance Still Shows 0
- **Cause**: Tokens not sent to folder contract address
- **Solution**: Send NYAX tokens to the specific folder contract address (not factory)

### "getBeneficiaries is not a function" Error
- **Cause**: Using old contract or frontend not updated
- **Solution**: Refresh the page, clear cache, ensure using latest code

## Key Features to Verify

✅ **Multiple Entries Per Wallet**: Same wallet can be added multiple times
✅ **Unique IDs**: Each entry gets a unique beneficiary ID
✅ **Balance Validation**: Cannot over-allocate beyond folder balance
✅ **Unique Names**: Each entry must have a unique wallet name
✅ **Independent Management**: Each entry can be paused/cancelled separately
✅ **Aggregated Claiming**: Wallet claims from all their entries at once

## API Endpoints for Manual Testing

If you want to test via API/contract directly:

```javascript
// Get folder balance
await folderEscrow.getFolderBalance()

// Get total allocated
await folderEscrow.getTotalAllocated()

// Get beneficiary count
await folderEscrow.getBeneficiaryCount()

// Get all beneficiaries
await folderEscrow.getAllBeneficiaries()

// Get beneficiary by ID
await folderEscrow.getBeneficiaryById(0)

// Get all IDs for a wallet
await folderEscrow.getBeneficiaryIdsByWallet("0x...")
```

## Success Criteria

Your testing is successful when:

1. ✅ Can add same wallet address multiple times
2. ✅ Each entry has unique ID and name
3. ✅ Cannot allocate more than folder balance
4. ✅ Dashboard shows correct balances and allocations
5. ✅ All beneficiary entries display correctly
6. ✅ No "getBeneficiaries is not a function" errors

## Next Steps After Testing

Once testing is complete:

1. **Deploy to Production**: Deploy updated contracts to mainnet
2. **Migrate Data**: If you have existing folders, migrate beneficiary data
3. **Update Documentation**: Update user-facing documentation
4. **Monitor**: Watch for any issues in production
5. **Announce**: Inform users about the new duplicate beneficiary feature

## Support

If you encounter issues:
- Check browser console for detailed error messages
- Verify contract addresses in `config.ts`
- Ensure you're connected to Sepolia network
- Check that you have enough ETH for gas fees
- Verify NYAX token balance in the folder contract
