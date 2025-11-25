const { run } = require("hardhat");

/**
 * Contract Verification Script
 * 
 * This script helps verify deployed contracts on block explorers.
 * Update the contract addresses and constructor arguments below.
 */

async function main() {
    console.log("🔍 Starting contract verification...\n");

    // ===== UPDATE THESE ADDRESSES AFTER DEPLOYMENT =====
    const contracts = {
        nyaxToken: "0x...", // NYAXToken address
        multisig: "0x...",  // SimpleMultiSig address
        treasury: "0x...",  // Treasury address
        timelock: "0x...",  // NYAXTimelockController address
        governor: "0x...",  // NYAXGovernor address
        vestingFactory: "0x...", // VestingFactory address
        vestingWallet: "0x...",  // Sample VestingWalletFlexible address
    };

    // ===== UPDATE THESE CONSTRUCTOR ARGUMENTS =====
    const constructorArgs = {
        nyaxToken: [
            "0x...", // treasury address
            "0x...", // owner address
        ],
        multisig: [
            ["0x..."], // owners array
            1,          // threshold
        ],
        treasury: [
            contracts.nyaxToken, // NYAX token address
            contracts.multisig,  // MultiSig address
            "0x...",            // owner address
        ],
        timelock: [
            172800,  // min delay (2 days)
            [],      // proposers (empty initially)
            [],      // executors (empty initially)
            "0x...", // admin address
        ],
        governor: [
            contracts.nyaxToken, // NYAX token address
            contracts.timelock,  // Timelock address
            1,        // voting delay
            50400,    // voting period
            "1000000000000000000000000", // proposal threshold (1M tokens)
            4,        // quorum percentage
        ],
        vestingFactory: [
            contracts.nyaxToken, // NYAX token address
            "0x...",            // owner address
        ],
        vestingWallet: [
            contracts.nyaxToken, // NYAX token address
            "0x...",            // owner address
        ],
    };

    try {
        // Verify NYAXToken
        if (contracts.nyaxToken !== "0x...") {
            console.log("📄 Verifying NYAXToken...");
            await run("verify:verify", {
                address: contracts.nyaxToken,
                constructorArguments: constructorArgs.nyaxToken,
            });
            console.log("✅ NYAXToken verified\n");
        }

        // Verify SimpleMultiSig
        if (contracts.multisig !== "0x...") {
            console.log("🔐 Verifying SimpleMultiSig...");
            await run("verify:verify", {
                address: contracts.multisig,
                constructorArguments: constructorArgs.multisig,
            });
            console.log("✅ SimpleMultiSig verified\n");
        }

        // Verify Treasury
        if (contracts.treasury !== "0x...") {
            console.log("🏦 Verifying Treasury...");
            await run("verify:verify", {
                address: contracts.treasury,
                constructorArguments: constructorArgs.treasury,
            });
            console.log("✅ Treasury verified\n");
        }

        // Verify NYAXTimelockController
        if (contracts.timelock !== "0x...") {
            console.log("⏰ Verifying NYAXTimelockController...");
            await run("verify:verify", {
                address: contracts.timelock,
                constructorArguments: constructorArgs.timelock,
            });
            console.log("✅ NYAXTimelockController verified\n");
        }

        // Verify NYAXGovernor
        if (contracts.governor !== "0x...") {
            console.log("🏛️ Verifying NYAXGovernor...");
            await run("verify:verify", {
                address: contracts.governor,
                constructorArguments: constructorArgs.governor,
            });
            console.log("✅ NYAXGovernor verified\n");
        }

        // Verify VestingFactory
        if (contracts.vestingFactory !== "0x...") {
            console.log("🏭 Verifying VestingFactory...");
            await run("verify:verify", {
                address: contracts.vestingFactory,
                constructorArguments: constructorArgs.vestingFactory,
            });
            console.log("✅ VestingFactory verified\n");
        }

        // Verify VestingWalletFlexible
        if (contracts.vestingWallet !== "0x...") {
            console.log("📋 Verifying VestingWalletFlexible...");
            await run("verify:verify", {
                address: contracts.vestingWallet,
                constructorArguments: constructorArgs.vestingWallet,
            });
            console.log("✅ VestingWalletFlexible verified\n");
        }

        console.log("🎉 All contracts verified successfully!");

    } catch (error) {
        console.error("❌ Verification failed:", error.message);
        
        if (error.message.includes("Already Verified")) {
            console.log("ℹ️ Contract was already verified");
        } else if (error.message.includes("does not have bytecode")) {
            console.log("ℹ️ Please check the contract address");
        } else if (error.message.includes("Invalid constructor arguments")) {
            console.log("ℹ️ Please check the constructor arguments");
        }
    }
}

// Execute verification
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;
