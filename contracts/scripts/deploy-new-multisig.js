const { ethers } = require("hardhat");

/**
 * Deploy New Multisig Script
 * 
 * Deploys a new SimpleMultiSig with your address as owner
 * and sets up NYAX token approval
 */

// Configuration
const YOUR_ADDRESS = "0xda791a424b294a594D81b09A86531CB1Dcf6b932";
const NYAX_TOKEN_ADDRESS = "0x9b3C66f562EA32496bA19D9C7174613c37A91F98";

// NYAX Token ABI (for approval)
const NYAX_TOKEN_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

async function main() {
    console.log("🚀 Deploying New Multisig Wallet...\n");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deployer account:", deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    console.log("👤 Your address:", YOUR_ADDRESS);
    console.log("🪙 NYAX Token:", NYAX_TOKEN_ADDRESS);
    console.log();

    try {
        // 1. Deploy new SimpleMultiSig
        console.log("📦 Deploying SimpleMultiSig contract...");
        
        const SimpleMultiSig = await ethers.getContractFactory("SimpleMultiSig");
        
        // Set up owners and threshold
        const owners = [YOUR_ADDRESS]; // Your address as the only owner
        const threshold = 1; // Only need 1 confirmation since you're the only owner
        
        console.log("👥 Owners:", owners);
        console.log("🎯 Threshold:", threshold);
        
        const multisig = await SimpleMultiSig.deploy(owners, threshold);
        await multisig.waitForDeployment();
        
        const multisigAddress = await multisig.getAddress();
        console.log("✅ SimpleMultiSig deployed to:", multisigAddress);
        console.log("📤 Deployment transaction:", multisig.deploymentTransaction().hash);
        console.log();

        // 2. Verify deployment
        console.log("🔍 Verifying deployment...");
        const deployedOwners = await multisig.getOwners();
        const deployedThreshold = await multisig.threshold();
        const isYourOwner = await multisig.isOwner(YOUR_ADDRESS);
        
        console.log("👥 Deployed owners:", deployedOwners);
        console.log("🎯 Deployed threshold:", deployedThreshold.toString());
        console.log("✅ You are owner:", isYourOwner ? "YES" : "NO");
        console.log();

        // 3. Connect to NYAX token and approve the multisig
        console.log("🪙 Setting up NYAX token approval...");
        
        const nyaxToken = new ethers.Contract(NYAX_TOKEN_ADDRESS, NYAX_TOKEN_ABI, deployer);
        
        // Get token info
        const symbol = await nyaxToken.symbol();
        const decimals = await nyaxToken.decimals();
        const balance = await nyaxToken.balanceOf(deployer.address);
        
        console.log("📊 Token Info:");
        console.log("   Symbol:", symbol);
        console.log("   Decimals:", decimals.toString());
        console.log("   Your balance:", ethers.formatUnits(balance, decimals), symbol);
        console.log();

        // Approve maximum amount to the new multisig
        const maxApproval = ethers.MaxUint256;
        
        console.log("🔄 Approving NYAX tokens to new multisig...");
        console.log("   Spender (Multisig):", multisigAddress);
        console.log("   Amount: MAX (unlimited)");
        
        const approveTx = await nyaxToken.approve(multisigAddress, maxApproval);
        console.log("📤 Approval transaction:", approveTx.hash);
        
        const approvalReceipt = await approveTx.wait();
        console.log("✅ Approval confirmed!");
        console.log("⛽ Gas used:", approvalReceipt.gasUsed.toString());
        console.log();

        // 4. Verify approval
        console.log("🔍 Verifying approval...");
        const allowance = await nyaxToken.allowance(deployer.address, multisigAddress);
        console.log("💰 Allowance:", allowance.toString() === ethers.MaxUint256.toString() ? "UNLIMITED" : ethers.formatUnits(allowance, decimals));
        console.log();

        // 5. Summary
        console.log("🎉 Deployment Complete!");
        console.log("=" .repeat(50));
        console.log("📋 New Multisig Address:", multisigAddress);
        console.log("👤 Owner:", YOUR_ADDRESS);
        console.log("🎯 Threshold: 1 (only you need to confirm)");
        console.log("🪙 NYAX Approval: UNLIMITED");
        console.log("=" .repeat(50));
        console.log();

        // 6. Update environment variables suggestion
        console.log("📝 Add to your .env file:");
        console.log(`NEXT_PUBLIC_NEW_MULTISIG_ADDRESS=${multisigAddress}`);
        console.log();

        // 7. Usage instructions
        console.log("🔧 How to use your new multisig:");
        console.log("1. Update CallDataHelper with new multisig address");
        console.log("2. Use your wallet to submit transactions");
        console.log("3. Since threshold is 1, transactions execute immediately");
        console.log("4. You can transfer NYAX tokens through this multisig");
        console.log();

        console.log("💡 Next steps:");
        console.log("- Update frontend to use new multisig address");
        console.log("- Test with small transactions first");
        console.log("- Add more owners later if needed");

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Solution: Add more ETH to deployer wallet");
            console.log("   Deployer:", deployer.address);
        }
        
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Script failed:", error);
        process.exit(1);
    });
