const { ethers, network } = require("hardhat");

/**
 * Deploy VestingFactory and VestingWalletFlexible contracts
 */

async function main() {
    console.log("🚀 Starting Vesting Contracts deployment...\n");

    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    console.log("🌐 Network:", network.name);
    console.log("🔗 Chain ID:", network.config.chainId || "unknown");
    
    // Check if we should verify contracts (skip for localhost/hardhat)
    const shouldVerify = !["localhost", "hardhat"].includes(network.name);
    console.log("🔍 Contract verification:", shouldVerify ? "enabled" : "disabled (local network)");
    console.log();

    // Use existing NYAX token address
    const NYAX_TOKEN_ADDRESS = "0x9b3C66f562EA32496bA19D9C7174613c37A91F98";
    
    const deployedContracts = {};

    // Contract verification helper
    async function verifyContract(address, constructorArguments = [], contractName = "Contract") {
        if (!shouldVerify) {
            console.log(`⏭️  Skipping ${contractName} verification (local network)`);
            return;
        }

        console.log(`🔍 Verifying ${contractName}...`);
        try {
            await hre.run("verify:verify", {
                address: address,
                constructorArguments: constructorArguments,
            });
            console.log(`✅ ${contractName} verified successfully`);
        } catch (error) {
            if (error.message.toLowerCase().includes("already verified")) {
                console.log(`✅ ${contractName} already verified`);
            } else {
                console.log(`❌ ${contractName} verification failed:`, error.message);
                console.log(`📝 Manual verification command:`);
                console.log(`npx hardhat verify --network ${network.name} ${address} ${constructorArguments.map(arg => `"${arg}"`).join(' ')}`);
            }
        }
        console.log();
    }

    try {
        // ===== 1. Deploy VestingFactory =====
        console.log("🏭 Deploying VestingFactory...");
        const VestingFactory = await ethers.getContractFactory("VestingFactory");
        
        const vestingFactory = await VestingFactory.deploy(
            NYAX_TOKEN_ADDRESS,
            deployer.address // Owner
        );
        await vestingFactory.waitForDeployment();
        
        deployedContracts.vestingFactory = await vestingFactory.getAddress();
        console.log("✅ VestingFactory deployed to:", deployedContracts.vestingFactory);
        console.log("   - Token Address:", NYAX_TOKEN_ADDRESS);
        console.log("   - Owner:", deployer.address);
        console.log();

        // Verify VestingFactory
        await verifyContract(
            deployedContracts.vestingFactory,
            [NYAX_TOKEN_ADDRESS, deployer.address],
            "VestingFactory"
        );

        // ===== 2. Deploy VestingWalletFlexible =====
        console.log("📋 Deploying VestingWalletFlexible...");
        const VestingWalletFlexible = await ethers.getContractFactory("VestingWalletFlexible");
        
        const vestingWallet = await VestingWalletFlexible.deploy(
            NYAX_TOKEN_ADDRESS,
            deployer.address // Owner
        );
        await vestingWallet.waitForDeployment();
        
        deployedContracts.vestingWallet = await vestingWallet.getAddress();
        console.log("✅ VestingWalletFlexible deployed to:", deployedContracts.vestingWallet);
        console.log("   - Token Address:", NYAX_TOKEN_ADDRESS);
        console.log("   - Owner:", deployer.address);
        console.log();

        // Verify VestingWalletFlexible
        await verifyContract(
            deployedContracts.vestingWallet,
            [NYAX_TOKEN_ADDRESS, deployer.address],
            "VestingWalletFlexible"
        );

        // ===== Deployment Summary =====
        console.log("🎉 Vesting Contracts Deployment Complete!\n");
        console.log("📋 Contract Addresses:");
        console.log("=" .repeat(50));
        console.log("VestingFactory:         ", deployedContracts.vestingFactory);
        console.log("VestingWalletFlexible:  ", deployedContracts.vestingWallet);
        console.log("=" .repeat(50));
        console.log();

        // Environment variables for frontend
        console.log("🔧 Environment Variables for Frontend:");
        console.log("NEXT_PUBLIC_VESTING_FACTORY_ADDRESS=" + deployedContracts.vestingFactory);
        console.log("NEXT_PUBLIC_VESTING_WALLET_ADDRESS=" + deployedContracts.vestingWallet);
        console.log();

        // Manual verification commands (if needed)
        console.log("📝 Manual Verification Commands (if needed):");
        console.log(`npx hardhat verify --network ${network.name} ${deployedContracts.vestingFactory} "${NYAX_TOKEN_ADDRESS}" "${deployer.address}"`);
        console.log(`npx hardhat verify --network ${network.name} ${deployedContracts.vestingWallet} "${NYAX_TOKEN_ADDRESS}" "${deployer.address}"`);
        console.log();

        console.log("✨ All vesting contracts deployed successfully!");

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
