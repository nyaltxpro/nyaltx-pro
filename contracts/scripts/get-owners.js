const { ethers } = require("hardhat");

/**
 * Get Multisig Owners Script
 * Simple script to check current multisig owners and status
 */

const MULTISIG_ADDRESS = "0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c";

const MULTISIG_ABI = [
    "function getOwners() view returns (address[])",
    "function isOwner(address) view returns (bool)",
    "function threshold() view returns (uint256)",
    "function transactionCount() view returns (uint256)"
];

async function main() {
    console.log("👥 Getting Multisig Owners...\n");

    const [signer] = await ethers.getSigners();
    console.log("📋 Using account:", signer.address);
    console.log("🏛️ Multisig address:", MULTISIG_ADDRESS);
    console.log();

    const multisig = new ethers.Contract(MULTISIG_ADDRESS, MULTISIG_ABI, signer);

    try {
        const owners = await multisig.getOwners();
        const threshold = await multisig.threshold();
        const txCount = await multisig.transactionCount();
        const isCurrentOwner = await multisig.isOwner(signer.address);
        
        console.log("📊 Multisig Status:");
        console.log("👥 Total Owners:", owners.length);
        console.log("🎯 Threshold:", threshold.toString());
        console.log("📝 Total Transactions:", txCount.toString());
        console.log();
        
        console.log("👤 Owners List:");
        owners.forEach((owner, index) => {
            const isCurrent = owner.toLowerCase() === signer.address.toLowerCase();
            console.log(`   ${index + 1}. ${owner} ${isCurrent ? '(YOU ✅)' : ''}`);
        });
        
        console.log();
        console.log("🔐 Your Status:");
        console.log("   Address:", signer.address);
        console.log("   Is Owner:", isCurrentOwner ? "✅ YES" : "❌ NO");
        
        if (!isCurrentOwner) {
            console.log();
            console.log("💡 To add yourself as owner, ask an existing owner to run:");
            console.log(`   npm run add-owner`);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Script failed:", error);
        process.exit(1);
    });
