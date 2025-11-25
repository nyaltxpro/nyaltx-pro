const { ethers } = require("hardhat");

/**
 * Add Owner Script
 * Adds your wallet 0xda791a424b294a594D81b09A86531CB1Dcf6b932 as multisig owner
 */

const MULTISIG_ADDRESS = "0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c";
const NEW_OWNER = "0xda791a424b294a594D81b09A86531CB1Dcf6b932"; // Your wallet

const MULTISIG_ABI = [
    "function getOwners() view returns (address[])",
    "function isOwner(address) view returns (bool)",
    "function threshold() view returns (uint256)",
    "function addOwner(address owner)",
    "function submitTransaction(address to, uint256 value, bytes data) returns (uint256)"
];

async function main() {
    console.log("➕ Adding Owner to Multisig...\n");

    const [signer] = await ethers.getSigners();
    console.log("📋 Deployer/Current account:", signer.address);
    console.log("🏛️ Multisig address:", MULTISIG_ADDRESS);
    console.log("👤 Adding owner:", NEW_OWNER);
    console.log();

    const multisig = new ethers.Contract(MULTISIG_ADDRESS, MULTISIG_ABI, signer);

    try {
        // Check current status
        const isCurrentOwner = await multisig.isOwner(signer.address);
        const isAlreadyOwner = await multisig.isOwner(NEW_OWNER);
        const owners = await multisig.getOwners();
        const threshold = await multisig.threshold();
        
        console.log("📊 Current Status:");
        console.log("   Your address is owner:", isCurrentOwner ? "✅ YES" : "❌ NO");
        console.log("   Target address is owner:", isAlreadyOwner ? "✅ YES" : "❌ NO");
        console.log("   Current owners:", owners.length);
        console.log("   Current threshold:", threshold.toString());
        console.log();
        
        if (!isCurrentOwner) {
            console.log("❌ Error: You are not an owner of this multisig");
            console.log("💡 Only existing owners can add new owners");
            console.log("🔑 Make sure you're using the deployer wallet");
            return;
        }
        
        if (isAlreadyOwner) {
            console.log("⚠️  Target address is already an owner");
            return;
        }
        
        console.log("🔄 Adding owner...");
        
        // For single-owner multisig with threshold 1, we can add directly
        if (owners.length === 1 && threshold.toString() === "1") {
            console.log("📝 Single owner multisig detected - adding directly");
            
            const tx = await multisig.addOwner(NEW_OWNER);
            console.log("📤 Transaction sent:", tx.hash);
            
            const receipt = await tx.wait();
            console.log("✅ Owner added successfully!");
            console.log("⛽ Gas used:", receipt.gasUsed.toString());
            
        } else {
            // For multi-owner multisig, submit transaction for approval
            console.log("📝 Multi-owner multisig detected - submitting transaction");
            
            const addOwnerData = multisig.interface.encodeFunctionData("addOwner", [NEW_OWNER]);
            
            const tx = await multisig.submitTransaction(
                MULTISIG_ADDRESS,
                0,
                addOwnerData
            );
            
            console.log("📤 Transaction submitted:", tx.hash);
            const receipt = await tx.wait();
            console.log("✅ Add owner transaction submitted!");
            console.log("⚠️  Other owners need to confirm this transaction");
        }
        
        // Check updated status
        console.log("\n📊 Updated Status:");
        const updatedOwners = await multisig.getOwners();
        const isNowOwner = await multisig.isOwner(NEW_OWNER);
        
        console.log("   Total owners:", updatedOwners.length);
        console.log("   Target is now owner:", isNowOwner ? "✅ YES" : "⏳ PENDING");
        
        if (isNowOwner) {
            console.log("\n🎉 Success! You can now use this wallet for multisig transactions:");
            console.log("   - Submit transactions");
            console.log("   - Confirm transactions");
            console.log("   - Execute transactions");
        }
        
    } catch (error) {
        console.error("❌ Failed to add owner:", error.message);
        
        if (error.message.includes("Not an owner")) {
            console.log("\n💡 Solution:");
            console.log("1. Make sure you're using the deployer wallet");
            console.log("2. Check if you have the correct private key in .env");
            console.log("3. Verify the multisig address is correct");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Script failed:", error);
        process.exit(1);
    });
