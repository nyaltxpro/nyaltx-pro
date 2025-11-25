const { ethers } = require("hardhat");

/**
 * Multisig Owner Management Script
 * 
 * This script allows you to:
 * 1. Get current multisig owners
 * 2. Add new owners to the multisig
 * 3. Remove owners from the multisig
 * 4. Change the threshold
 */

// Contract addresses from your deployment
const MULTISIG_ADDRESS = "0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c";

// Multisig ABI - only the functions we need
const MULTISIG_ABI = [
    "function getOwners() view returns (address[])",
    "function isOwner(address) view returns (bool)",
    "function threshold() view returns (uint256)",
    "function transactionCount() view returns (uint256)",
    "function submitTransaction(address to, uint256 value, bytes data) returns (uint256)",
    "function confirmTransaction(uint256 txIndex)",
    "function executeTransaction(uint256 txIndex)",
    "function addOwner(address owner)",
    "function removeOwner(address owner)", 
    "function changeThreshold(uint256 _threshold)"
];

async function main() {
    console.log("🔧 Multisig Owner Management Script\n");

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("📋 Using account:", signer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH");
    console.log("🏛️ Multisig address:", MULTISIG_ADDRESS);
    console.log();

    // Connect to multisig contract
    const multisig = new ethers.Contract(MULTISIG_ADDRESS, MULTISIG_ABI, signer);

    try {
        // Get current multisig info
        await getMultisigInfo(multisig, signer.address);

        // Parse command line arguments
        const action = process.argv[2];
        const address = process.argv[3];
        const threshold = process.argv[4];

        switch (action) {
            case "get-owners":
                // Already displayed above
                break;
                
            case "add-owner":
                if (!address) {
                    console.log("❌ Please provide an address to add");
                    console.log("Usage: npm run manage-owners add-owner 0xAddress");
                    return;
                }
                await addOwner(multisig, address);
                break;
                
            case "remove-owner":
                if (!address) {
                    console.log("❌ Please provide an address to remove");
                    console.log("Usage: npm run manage-owners remove-owner 0xAddress");
                    return;
                }
                await removeOwner(multisig, address);
                break;
                
            case "change-threshold":
                if (!threshold) {
                    console.log("❌ Please provide a threshold number");
                    console.log("Usage: npm run manage-owners change-threshold 2");
                    return;
                }
                await changeThreshold(multisig, parseInt(threshold));
                break;
                
            case "add-current":
                await addOwner(multisig, signer.address);
                break;
                
            default:
                console.log("📖 Available commands:");
                console.log("  get-owners           - Get current owners");
                console.log("  add-owner <address>  - Add new owner");
                console.log("  remove-owner <addr>  - Remove owner");
                console.log("  change-threshold <n> - Change threshold");
                console.log("  add-current          - Add current wallet as owner");
                console.log();
                console.log("Examples:");
                console.log("  npm run manage-owners get-owners");
                console.log("  npm run manage-owners add-owner 0xda791a424b294a594D81b09A86531CB1Dcf6b932");
                console.log("  npm run manage-owners add-current");
                console.log("  npm run manage-owners change-threshold 2");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
        
        if (error.message.includes("Not an owner")) {
            console.log("\n💡 Solution:");
            console.log("1. Make sure you're using the deployer wallet");
            console.log("2. Or ask an existing owner to add you first");
            console.log("3. Current wallet:", signer.address);
        }
    }
}

async function getMultisigInfo(multisig, currentAddress) {
    console.log("📊 Current Multisig Status:");
    
    try {
        const owners = await multisig.getOwners();
        const threshold = await multisig.threshold();
        const txCount = await multisig.transactionCount();
        const isCurrentOwner = await multisig.isOwner(currentAddress);
        
        console.log("👥 Owners:", owners.length);
        owners.forEach((owner, index) => {
            const isCurrent = owner.toLowerCase() === currentAddress.toLowerCase();
            console.log(`   ${index + 1}. ${owner} ${isCurrent ? '(YOU)' : ''}`);
        });
        
        console.log("🎯 Threshold:", threshold.toString());
        console.log("📝 Total Transactions:", txCount.toString());
        console.log("✅ You are owner:", isCurrentOwner ? "YES" : "NO");
        console.log();
        
        return { owners, threshold, txCount, isCurrentOwner };
    } catch (error) {
        console.log("❌ Failed to get multisig info:", error.message);
        throw error;
    }
}

async function addOwner(multisig, newOwner) {
    console.log(`➕ Adding owner: ${newOwner}`);
    
    try {
        // Check if already owner
        const isAlreadyOwner = await multisig.isOwner(newOwner);
        if (isAlreadyOwner) {
            console.log("⚠️  Address is already an owner");
            return;
        }
        
        // For single-owner multisig, we can call addOwner directly
        const currentOwners = await multisig.getOwners();
        const threshold = await multisig.threshold();
        
        if (currentOwners.length === 1 && threshold.toString() === "1") {
            console.log("🔄 Adding owner directly (single owner multisig)...");
            const tx = await multisig.addOwner(newOwner);
            console.log("📤 Transaction sent:", tx.hash);
            
            const receipt = await tx.wait();
            console.log("✅ Owner added successfully!");
            console.log("⛽ Gas used:", receipt.gasUsed.toString());
            
        } else {
            // For multi-owner multisig, need to submit transaction
            console.log("🔄 Submitting add owner transaction...");
            const addOwnerData = multisig.interface.encodeFunctionData("addOwner", [newOwner]);
            
            const tx = await multisig.submitTransaction(
                multisig.target,
                0,
                addOwnerData
            );
            
            console.log("📤 Transaction submitted:", tx.hash);
            const receipt = await tx.wait();
            console.log("✅ Add owner transaction submitted successfully!");
            console.log("📝 Transaction ID:", receipt.logs.length > 0 ? "Check logs for TX ID" : "N/A");
            console.log("⚠️  Note: Other owners need to confirm this transaction");
        }
        
        // Show updated owners
        console.log("\n📊 Updated Multisig Status:");
        await getMultisigInfo(multisig, newOwner);
        
    } catch (error) {
        console.error("❌ Failed to add owner:", error.message);
        throw error;
    }
}

async function removeOwner(multisig, ownerToRemove) {
    console.log(`➖ Removing owner: ${ownerToRemove}`);
    
    try {
        // Check if is owner
        const isOwner = await multisig.isOwner(ownerToRemove);
        if (!isOwner) {
            console.log("⚠️  Address is not an owner");
            return;
        }
        
        const removeOwnerData = multisig.interface.encodeFunctionData("removeOwner", [ownerToRemove]);
        
        const tx = await multisig.submitTransaction(
            multisig.target,
            0,
            removeOwnerData
        );
        
        console.log("📤 Transaction submitted:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ Remove owner transaction submitted successfully!");
        console.log("⚠️  Note: Other owners need to confirm this transaction");
        
    } catch (error) {
        console.error("❌ Failed to remove owner:", error.message);
        throw error;
    }
}

async function changeThreshold(multisig, newThreshold) {
    console.log(`🎯 Changing threshold to: ${newThreshold}`);
    
    try {
        const owners = await multisig.getOwners();
        
        if (newThreshold > owners.length) {
            console.log("❌ Threshold cannot be greater than number of owners");
            return;
        }
        
        if (newThreshold < 1) {
            console.log("❌ Threshold must be at least 1");
            return;
        }
        
        const changeThresholdData = multisig.interface.encodeFunctionData("changeThreshold", [newThreshold]);
        
        const tx = await multisig.submitTransaction(
            multisig.target,
            0,
            changeThresholdData
        );
        
        console.log("📤 Transaction submitted:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ Change threshold transaction submitted successfully!");
        console.log("⚠️  Note: Other owners need to confirm this transaction");
        
    } catch (error) {
        console.error("❌ Failed to change threshold:", error.message);
        throw error;
    }
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Script failed:", error);
        process.exit(1);
    });
