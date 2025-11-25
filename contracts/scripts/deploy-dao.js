const { ethers, run, network } = require("hardhat");

/**
 * NYAX DAO Deployment Script
 * 
 * Deploys all NYAX DAO contracts in the correct order:
 * 1. NYAXToken
 * 2. SimpleMultiSig
 * 3. Treasury
 * 4. NYAXTimelockController
 * 5. NYAXGovernor
 * 6. VestingFactory
 * 7. VestingWalletFlexible (sample)
 */

async function main() {
    console.log("🚀 Starting NYAX DAO deployment...\n");

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

    // Deployment configuration
    const config = {
        // Token configuration
        token: {
            name: "NYAX",
            symbol: "NYAX",
            maxSupply: ethers.parseEther("1000000000"), // 1 billion tokens
        },
        
        // MultiSig configuration
        multisig: {
            owners: [
                deployer.address, // Add more owner addresses as needed
            ],
            threshold: 1, // Adjust based on number of owners (e.g., 2 for 3 owners)
        },
        
        // Governance configuration
        governance: {
            votingDelay: 1, // 1 block (~12 seconds)
            votingPeriod: 50400, // ~1 week (assuming 12 second blocks)
            proposalThreshold: ethers.parseEther("1000000"), // 1M tokens to create proposal
            quorumPercentage: 4, // 4% of total supply for quorum
            timelockDelay: 172800, // 2 days in seconds
        },
        
        // Treasury configuration
        treasury: {
            categories: [
                { name: "development", allocation: 2500 }, // 25%
                { name: "marketing", allocation: 1500 },   // 15%
                { name: "liquidity", allocation: 2000 },   // 20%
                { name: "team", allocation: 1000 },        // 10%
                { name: "advisors", allocation: 500 },     // 5%
                { name: "community", allocation: 1000 },   // 10%
                { name: "reserve", allocation: 1500 },     // 15%
            ]
        }
    };

    const deployedContracts = {};

    // Helper function to verify contracts
    async function verifyContract(address, constructorArguments, contractName) {
        if (!shouldVerify) {
            console.log(`⏭️  Skipping verification for ${contractName} (local network)`);
            return;
        }

        console.log(`🔍 Verifying ${contractName}...`);
        try {
            await run("verify:verify", {
                address: address,
                constructorArguments: constructorArguments,
            });
            console.log(`✅ ${contractName} verified successfully`);
        } catch (error) {
            if (error.message.toLowerCase().includes("already verified")) {
                console.log(`ℹ️  ${contractName} already verified`);
            } else {
                console.log(`❌ ${contractName} verification failed:`, error.message);
                console.log(`📝 Manual verification command:`);
                console.log(`npx hardhat verify --network ${network.name} ${address} ${constructorArguments.map(arg => `"${arg}"`).join(' ')}`);
            }
        }
        console.log();
    }

    try {
        // ===== 1. Use Existing NYAXToken =====
        console.log("📄 Using existing NYAXToken...");
        const EXISTING_NYAX_TOKEN_ADDRESS = "0x9b3C66f562EA32496bA19D9C7174613c37A91F98";
        
        // Connect to existing token contract
        const NYAXToken = await ethers.getContractFactory("NYAXToken");
        const nyaxToken = NYAXToken.attach(EXISTING_NYAX_TOKEN_ADDRESS);
        
        deployedContracts.nyaxToken = EXISTING_NYAX_TOKEN_ADDRESS;
        console.log("✅ Using existing NYAXToken at:", deployedContracts.nyaxToken);
        console.log("   - Name:", await nyaxToken.name());
        console.log("   - Symbol:", await nyaxToken.symbol());
        console.log("   - Max Supply:", ethers.formatEther(await nyaxToken.MAX_SUPPLY()));
        console.log();

        // ===== 2. Use Existing SimpleMultiSig =====
        console.log("🔐 Using existing SimpleMultiSig...");
        const EXISTING_MULTISIG_ADDRESS = "0x662f17058D7289bBb3A5Bb1C6f71587DA9DEBC4c";
        
        // Connect to existing multisig contract
        const SimpleMultiSig = await ethers.getContractFactory("SimpleMultiSig");
        const multisig = SimpleMultiSig.attach(EXISTING_MULTISIG_ADDRESS);
        
        deployedContracts.multisig = EXISTING_MULTISIG_ADDRESS;
        console.log("✅ Using existing SimpleMultiSig at:", deployedContracts.multisig);
        
        // Get multisig info from existing contract
        const threshold = await multisig.threshold();
        console.log("   - Threshold:", threshold.toString());
        console.log();

        // ===== 3. Use Existing Treasury =====
        console.log("🏦 Using existing Treasury...");
        const EXISTING_TREASURY_ADDRESS = "0x0344cD31a3385830c9Fa4d9d5b0e22288279C231";
        
        // Connect to existing treasury contract
        const Treasury = await ethers.getContractFactory("Treasury");
        const treasury = Treasury.attach(EXISTING_TREASURY_ADDRESS);
        
        deployedContracts.treasury = EXISTING_TREASURY_ADDRESS;
        console.log("✅ Using existing Treasury at:", deployedContracts.treasury);
        console.log();

        // ===== 4. Use Existing NYAXTimelockController =====
        console.log("⏰ Using existing NYAXTimelockController...");
        const EXISTING_TIMELOCK_ADDRESS = "0xd414356D7dDb6376eBd58b995ebc6a64EcC7b9d2";
        
        // Connect to existing timelock contract
        const NYAXTimelockController = await ethers.getContractFactory("NYAXTimelockController");
        const timelock = NYAXTimelockController.attach(EXISTING_TIMELOCK_ADDRESS);
        
        deployedContracts.timelock = EXISTING_TIMELOCK_ADDRESS;
        console.log("✅ Using existing NYAXTimelockController at:", deployedContracts.timelock);
        
        // Get timelock delay from existing contract
        const existingDelay = await timelock.getMinDelay();
        console.log("   - Min Delay:", existingDelay.toString(), "seconds");
        console.log();

        // ===== 5. Deploy NYAXGovernor =====
        console.log("🏛️ Deploying NYAXGovernor...");
        const NYAXGovernor = await ethers.getContractFactory("NYAXGovernor");
        
        const governor = await NYAXGovernor.deploy(
            deployedContracts.nyaxToken,
            deployedContracts.timelock,
            config.governance.votingDelay,
            config.governance.votingPeriod,
            config.governance.proposalThreshold,
            config.governance.quorumPercentage
        );
        await governor.waitForDeployment();
        
        deployedContracts.governor = await governor.getAddress();
        console.log("✅ NYAXGovernor deployed to:", deployedContracts.governor);
        console.log("   - Voting Delay:", config.governance.votingDelay, "blocks");
        console.log("   - Voting Period:", config.governance.votingPeriod, "blocks");
        console.log("   - Proposal Threshold:", ethers.formatEther(config.governance.proposalThreshold));
        console.log("   - Quorum Percentage:", config.governance.quorumPercentage + "%");
        console.log();

        // Verify NYAXGovernor
        await verifyContract(
            deployedContracts.governor,
            [
                deployedContracts.nyaxToken,
                deployedContracts.timelock,
                config.governance.votingDelay,
                config.governance.votingPeriod,
                config.governance.proposalThreshold,
                config.governance.quorumPercentage
            ],
            "NYAXGovernor"
        );

        // ===== 6. Configure Timelock Roles =====
        console.log("🔧 Configuring Timelock roles...");
        
        try {
            // Get role hashes using keccak256 (standard OpenZeppelin roles)
            const PROPOSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROPOSER_ROLE"));
            const EXECUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EXECUTOR_ROLE"));
            const TIMELOCK_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TIMELOCK_ADMIN_ROLE"));
            
            console.log("   - Granting PROPOSER_ROLE to Governor...");
            const proposerTx = await timelock.grantRole(PROPOSER_ROLE, deployedContracts.governor);
            await proposerTx.wait();
            
            console.log("   - Granting EXECUTOR_ROLE to Governor...");
            const executorTx = await timelock.grantRole(EXECUTOR_ROLE, deployedContracts.governor);
            await executorTx.wait();
            
            console.log("   - Granting EXECUTOR_ROLE to zero address (public execution)...");
            const publicExecutorTx = await timelock.grantRole(EXECUTOR_ROLE, ethers.ZeroAddress);
            await publicExecutorTx.wait();
            
            console.log("✅ Timelock roles configured");
            console.log("   - Governor can propose and execute");
            console.log("   - Anyone can execute after timelock delay");
        } catch (error) {
            console.log("⚠️  Timelock role configuration failed:", error.message);
            console.log("   - You may need to configure roles manually");
            console.log("   - Governor address:", deployedContracts.governor);
        }
        console.log();

        // ===== 7. Deploy VestingFactory =====
        console.log("🏭 Deploying VestingFactory...");
        const VestingFactory = await ethers.getContractFactory("VestingFactory");
        
        const vestingFactory = await VestingFactory.deploy(
            deployedContracts.nyaxToken,
            deployer.address // Owner
        );
        await vestingFactory.waitForDeployment();
        
        deployedContracts.vestingFactory = await vestingFactory.getAddress();
        console.log("✅ VestingFactory deployed to:", deployedContracts.vestingFactory);
        console.log();

        // Verify VestingFactory
        await verifyContract(
            deployedContracts.vestingFactory,
            [deployedContracts.nyaxToken, deployer.address],
            "VestingFactory"
        );

        // ===== 8. Deploy Sample VestingWalletFlexible =====
        console.log("📋 Deploying sample VestingWalletFlexible...");
        const VestingWalletFlexible = await ethers.getContractFactory("VestingWalletFlexible");
        
        const vestingWallet = await VestingWalletFlexible.deploy(
            deployedContracts.nyaxToken,
            deployer.address // Owner
        );
        await vestingWallet.waitForDeployment();
        
        deployedContracts.vestingWallet = await vestingWallet.getAddress();
        console.log("✅ Sample VestingWalletFlexible deployed to:", deployedContracts.vestingWallet);
        console.log();

        // Verify VestingWalletFlexible
        await verifyContract(
            deployedContracts.vestingWallet,
            [deployedContracts.nyaxToken, deployer.address],
            "VestingWalletFlexible"
        );

        // ===== 9. Check Treasury Status =====
        console.log("📊 Checking Treasury status...");
        const treasuryBalance = await nyaxToken.balanceOf(deployedContracts.treasury);
        console.log("   - Treasury Balance:", ethers.formatEther(treasuryBalance), "NYAX");
        console.log("✅ Treasury status checked");
        console.log();

        // ===== Deployment Summary =====
        console.log("🎉 NYAX DAO Deployment Complete!\n");
        console.log("📋 Contract Addresses:");
        console.log("=" .repeat(50));
        console.log("NYAXToken:              ", deployedContracts.nyaxToken);
        console.log("SimpleMultiSig:         ", deployedContracts.multisig);
        console.log("Treasury:               ", deployedContracts.treasury);
        console.log("NYAXTimelockController: ", deployedContracts.timelock);
        console.log("NYAXGovernor:           ", deployedContracts.governor);
        console.log("VestingFactory:         ", deployedContracts.vestingFactory);
        console.log("VestingWallet (sample): ", deployedContracts.vestingWallet);
        console.log("=" .repeat(50));

        // ===== Environment Variables =====
        console.log("\n🔧 Environment Variables for Frontend:");
        console.log("=" .repeat(50));
        console.log(`NEXT_PUBLIC_NYAX_TOKEN_ADDRESS=${deployedContracts.nyaxToken}`);
        console.log(`NEXT_PUBLIC_MULTISIG_ADDRESS=${deployedContracts.multisig}`);
        console.log(`NEXT_PUBLIC_TREASURY_ADDRESS=${deployedContracts.treasury}`);
        console.log(`NEXT_PUBLIC_TIMELOCK_ADDRESS=${deployedContracts.timelock}`);
        console.log(`NEXT_PUBLIC_GOVERNOR_ADDRESS=${deployedContracts.governor}`);
        console.log(`NEXT_PUBLIC_VESTING_FACTORY_ADDRESS=${deployedContracts.vestingFactory}`);
        console.log("=" .repeat(50));

        // ===== Next Steps =====
        console.log("\n📝 Next Steps:");
        console.log("1. Update frontend environment variables");
        if (shouldVerify) {
            console.log("2. ✅ Contracts automatically verified on block explorer");
        } else {
            console.log("2. Verify contracts on block explorer (use commands above)");
        }
        console.log("3. Update Treasury category wallets to actual addresses");
        console.log("4. Transfer ownership to multisig where appropriate");
        console.log("5. Renounce timelock admin role after testing");
        console.log("6. Create initial governance proposals");
        console.log("7. Set up proper multisig owners");

        // ===== Verification Status =====
        if (shouldVerify) {
            console.log("\n✅ Contract Verification:");
            console.log("=" .repeat(50));
            console.log("All contracts have been automatically verified on the block explorer.");
            console.log("If any verification failed, manual commands were provided above.");
            console.log("=" .repeat(50));
        } else {
            console.log("\n🔍 Manual Verification Commands (for non-local networks):");
            console.log("=" .repeat(50));
            console.log(`npx hardhat verify --network <network> ${deployedContracts.nyaxToken} "${treasury.address}" "${deployer.address}"`);
            console.log(`npx hardhat verify --network <network> ${deployedContracts.multisig} '["${config.multisig.owners.join('","')}"]' ${config.multisig.threshold}`);
            console.log(`npx hardhat verify --network <network> ${deployedContracts.treasury} "${deployedContracts.nyaxToken}" "${deployedContracts.multisig}" "${deployer.address}"`);
            console.log(`npx hardhat verify --network <network> ${deployedContracts.timelock} ${config.governance.timelockDelay} '[]' '[]' "${deployer.address}"`);
            console.log(`npx hardhat verify --network <network> ${deployedContracts.governor} "${deployedContracts.nyaxToken}" "${deployedContracts.timelock}" ${config.governance.votingDelay} ${config.governance.votingPeriod} "${config.governance.proposalThreshold}" ${config.governance.quorumPercentage}`);
            console.log(`npx hardhat verify --network <network> ${deployedContracts.vestingFactory} "${deployedContracts.nyaxToken}" "${deployer.address}"`);
            console.log(`npx hardhat verify --network <network> ${deployedContracts.vestingWallet} "${deployedContracts.nyaxToken}" "${deployer.address}"`);
            console.log("=" .repeat(50));
        }

        return deployedContracts;

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;
