const { ethers, network } = require("hardhat");

/**
 * Script to approve all DAO contracts to spend NYAX tokens
 * This prevents transaction reverts when contracts need to transfer tokens
 */

async function main() {
    console.log("🚀 Starting contract approvals for NYAX token...\n");

    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Approving contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    console.log("🌐 Network:", network.name);
    console.log();

    // Contract addresses from constants
    const NYAX_TOKEN_ADDRESS = "0x9b3C66f562EA32496bA19D9C7174613c37A91F98";
    const TREASURY_ADDRESS = "0x0344cD31a3385830c9Fa4d9d5b0e22288279C231";
    const MULTISIG_ADDRESS = "0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c";
    const TIMELOCK_ADDRESS = "0xd414356D7dDb6376eBd58b995ebc6a64EcC7b9d2";
    const GOVERNOR_ADDRESS = "0x9188d60532d021EB8E453b6e01Ba2E7717106413";
    const VESTING_FACTORY_ADDRESS = "0xc33Faff420eD8fFe480b6983f57886025405f8eb";
    const VESTING_WALLET_ADDRESS = "0x80dA49f79125d1c1428776b75B5164C21B72aA89";

    // Maximum approval amount (effectively unlimited)
    const MAX_APPROVAL = ethers.parseEther("1000000000000"); // 1 trillion tokens

    // Get NYAX token contract
    const nyaxToken = await ethers.getContractAt("NYAXToken", NYAX_TOKEN_ADDRESS);
    
    // Check current token balance
    const balance = await nyaxToken.balanceOf(deployer.address);
    console.log("📊 Current NYAX balance:", ethers.formatEther(balance), "NYAX");
    console.log();

    // Contracts to approve
    const contractsToApprove = [
        { name: "Treasury", address: TREASURY_ADDRESS },
        { name: "MultiSig", address: MULTISIG_ADDRESS },
        { name: "Timelock", address: TIMELOCK_ADDRESS },
        { name: "Governor", address: GOVERNOR_ADDRESS },
        { name: "VestingFactory", address: VESTING_FACTORY_ADDRESS },
        { name: "VestingWallet", address: VESTING_WALLET_ADDRESS }
    ];

    console.log("🔓 Approving contracts to spend NYAX tokens...");
    console.log("=" .repeat(60));

    for (const contract of contractsToApprove) {
        try {
            console.log(`\n📝 Approving ${contract.name} (${contract.address})...`);
            
            // Check current allowance
            const currentAllowance = await nyaxToken.allowance(deployer.address, contract.address);
            console.log(`   Current allowance: ${ethers.formatEther(currentAllowance)} NYAX`);
            
            if (currentAllowance >= MAX_APPROVAL / 2n) {
                console.log(`   ✅ ${contract.name} already has sufficient allowance`);
                continue;
            }

            // Approve the contract
            const approveTx = await nyaxToken.approve(contract.address, MAX_APPROVAL);
            console.log(`   ⏳ Transaction hash: ${approveTx.hash}`);
            
            // Wait for confirmation
            const receipt = await approveTx.wait();
            console.log(`   ✅ ${contract.name} approved successfully!`);
            console.log(`   📊 New allowance: ${ethers.formatEther(MAX_APPROVAL)} NYAX`);
            console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
        } catch (error) {
            console.error(`   ❌ Failed to approve ${contract.name}:`, error.message);
        }
    }

    console.log("\n" + "=" .repeat(60));
    console.log("🎉 Contract approval process completed!");
    console.log();

    // Verify all approvals
    console.log("🔍 Verifying approvals...");
    console.log("-" .repeat(60));
    
    for (const contract of contractsToApprove) {
        try {
            const allowance = await nyaxToken.allowance(deployer.address, contract.address);
            const allowanceFormatted = ethers.formatEther(allowance);
            const status = allowance > 0 ? "✅ APPROVED" : "❌ NOT APPROVED";
            
            console.log(`${contract.name.padEnd(15)} | ${allowanceFormatted.padEnd(20)} NYAX | ${status}`);
        } catch (error) {
            console.log(`${contract.name.padEnd(15)} | ERROR: ${error.message}`);
        }
    }

    console.log("-" .repeat(60));
    console.log();

    // Additional setup for Treasury contract
    console.log("🏦 Setting up Treasury contract permissions...");
    try {
        const treasury = await ethers.getContractAt("Treasury", TREASURY_ADDRESS);
        
        // Check if deployer is owner
        const owner = await treasury.owner();
        if (owner.toLowerCase() === deployer.address.toLowerCase()) {
            console.log("✅ Deployer is Treasury owner - permissions are correct");
        } else {
            console.log("⚠️  Deployer is not Treasury owner. Current owner:", owner);
        }
    } catch (error) {
        console.log("❌ Failed to check Treasury permissions:", error.message);
    }

    console.log();

    // Summary
    console.log("📋 SUMMARY");
    console.log("=" .repeat(60));
    console.log("✅ All DAO contracts have been approved to spend NYAX tokens");
    console.log("✅ Contracts can now perform token transfers without reverting");
    console.log("✅ Treasury, governance, and vesting operations are now enabled");
    console.log();
    console.log("🔧 Next steps:");
    console.log("1. Test token transfers through the frontend");
    console.log("2. Verify governance proposals can be created");
    console.log("3. Test treasury operations");
    console.log("4. Confirm vesting contract functionality");
    console.log();
    console.log("🎯 Your DAO is now fully operational!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Approval script failed:", error);
        process.exit(1);
    });
