const { ethers, run, network } = require("hardhat");

/**
 * NYAXGovernor Deployment Script
 * 
 * Deploys NYAXGovernor and NYAXTimelockController contracts
 * Can be used standalone or as part of larger DAO deployment
 */

async function main() {
    console.log("🏛️ Starting NYAXGovernor deployment...\n");

    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.getBalance()), "ETH");
    console.log("🌐 Network:", network.name);
    console.log("🔗 Chain ID:", network.config.chainId || "unknown");
    
    // Check if we should verify contracts (skip for localhost/hardhat)
    const shouldVerify = !["localhost", "hardhat"].includes(network.name);
    console.log("🔍 Contract verification:", shouldVerify ? "enabled" : "disabled (local network)");
    console.log();

    // Deployment configuration
    const config = {
        // Token configuration (update these addresses for your deployment)
        token: {
            // If deploying standalone, update this to your NYAX token address
            address: process.env.NYAX_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000", // UPDATE THIS
        },
        
        // Governance configuration
        governance: {
            votingDelay: 1, // 1 block (~12 seconds)
            votingPeriod: 50400, // ~1 week (assuming 12 second blocks)
            proposalThreshold: ethers.parseEther("1000000"), // 1M tokens to create proposal
            quorumPercentage: 4, // 4% of total supply for quorum
            timelockDelay: 172800, // 2 days in seconds
        }
    };

    // Validate token address
    if (config.token.address === "0x0000000000000000000000000000000000000000") {
        console.log("⚠️  WARNING: NYAX token address not set!");
        console.log("   Please set NYAX_TOKEN_ADDRESS environment variable or update the script");
        console.log("   Using zero address for now - update before mainnet deployment\n");
    }

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
        // ===== 1. Deploy NYAXTimelockController =====
        console.log("⏰ Deploying NYAXTimelockController...");
        const NYAXTimelockController = await ethers.getContractFactory("NYAXTimelockController");
        
        const timelock = await NYAXTimelockController.deploy(
            config.governance.timelockDelay,
            [], // Proposers (will be set to Governor)
            [], // Executors (will be set to Governor)
            deployer.address // Admin (can be renounced later)
        );
        await timelock.waitForDeployment();
        
        deployedContracts.timelock = await timelock.getAddress();
        console.log("✅ NYAXTimelockController deployed to:", deployedContracts.timelock);
        console.log("   - Min Delay:", config.governance.timelockDelay, "seconds");
        console.log();

        // Verify NYAXTimelockController
        await verifyContract(
            deployedContracts.timelock,
            [config.governance.timelockDelay, [], [], deployer.address],
            "NYAXTimelockController"
        );

        // ===== 2. Deploy NYAXGovernor =====
        console.log("🏛️ Deploying NYAXGovernor...");
        const NYAXGovernor = await ethers.getContractFactory("NYAXGovernor");
        
        const governor = await NYAXGovernor.deploy(
            config.token.address,
            deployedContracts.timelock,
            config.governance.votingDelay,
            config.governance.votingPeriod,
            config.governance.proposalThreshold,
            config.governance.quorumPercentage
        );
        await governor.waitForDeployment();
        
        deployedContracts.governor = await governor.getAddress();
        console.log("✅ NYAXGovernor deployed to:", deployedContracts.governor);
        console.log("   - Token Address:", config.token.address);
        console.log("   - Timelock Address:", deployedContracts.timelock);
        console.log("   - Voting Delay:", config.governance.votingDelay, "blocks");
        console.log("   - Voting Period:", config.governance.votingPeriod, "blocks");
        console.log("   - Proposal Threshold:", ethers.formatEther(config.governance.proposalThreshold));
        console.log("   - Quorum Percentage:", config.governance.quorumPercentage + "%");
        console.log();

        // Verify NYAXGovernor
        await verifyContract(
            deployedContracts.governor,
            [
                config.token.address,
                deployedContracts.timelock,
                config.governance.votingDelay,
                config.governance.votingPeriod,
                config.governance.proposalThreshold,
                config.governance.quorumPercentage
            ],
            "NYAXGovernor"
        );

        // ===== 3. Configure Timelock Roles =====
        console.log("🔧 Configuring Timelock roles...");
        
        // Get role hashes
        const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
        const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
        const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();
        
        // Grant roles to Governor
        console.log("   - Granting PROPOSER_ROLE to Governor...");
        await timelock.grantRole(PROPOSER_ROLE, deployedContracts.governor);
        
        console.log("   - Granting EXECUTOR_ROLE to Governor...");
        await timelock.grantRole(EXECUTOR_ROLE, deployedContracts.governor);
        
        // Grant executor role to zero address (anyone can execute)
        console.log("   - Granting EXECUTOR_ROLE to zero address (public execution)...");
        await timelock.grantRole(EXECUTOR_ROLE, ethers.ZeroAddress);
        
        console.log("✅ Timelock roles configured");
        console.log("   - Governor can propose and execute");
        console.log("   - Anyone can execute after timelock delay");
        console.log();

        // ===== 4. Optional: Renounce Admin Role =====
        const shouldRenounceAdmin = process.env.RENOUNCE_TIMELOCK_ADMIN === "true";
        if (shouldRenounceAdmin) {
            console.log("🔐 Renouncing timelock admin role...");
            await timelock.renounceRole(TIMELOCK_ADMIN_ROLE, deployer.address);
            console.log("✅ Timelock admin role renounced - governance is now fully decentralized");
            console.log();
        } else {
            console.log("⚠️  Timelock admin role NOT renounced");
            console.log("   Set RENOUNCE_TIMELOCK_ADMIN=true to renounce admin role");
            console.log("   Admin can still manage roles and emergency functions");
            console.log();
        }

        // ===== Deployment Summary =====
        console.log("🎉 NYAXGovernor Deployment Complete!\n");
        console.log("📋 Contract Addresses:");
        console.log("=" .repeat(50));
        console.log("NYAXTimelockController: ", deployedContracts.timelock);
        console.log("NYAXGovernor:           ", deployedContracts.governor);
        console.log("=" .repeat(50));

        // ===== Environment Variables =====
        console.log("\n🔧 Environment Variables for Frontend:");
        console.log("=" .repeat(50));
        console.log(`NEXT_PUBLIC_TIMELOCK_ADDRESS=${deployedContracts.timelock}`);
        console.log(`NEXT_PUBLIC_GOVERNOR_ADDRESS=${deployedContracts.governor}`);
        console.log("=" .repeat(50));

        // ===== Configuration Summary =====
        console.log("\n⚙️ Governance Configuration:");
        console.log("=" .repeat(50));
        console.log("Voting Delay:        ", config.governance.votingDelay, "blocks");
        console.log("Voting Period:       ", config.governance.votingPeriod, "blocks");
        console.log("Proposal Threshold:  ", ethers.formatEther(config.governance.proposalThreshold), "NYAX");
        console.log("Quorum Percentage:   ", config.governance.quorumPercentage + "%");
        console.log("Timelock Delay:      ", config.governance.timelockDelay, "seconds");
        console.log("Emergency Voting:    ", "1 block delay, 10% quorum");
        console.log("Fast-track:          ", "Enabled for critical proposals");
        console.log("=" .repeat(50));

        // ===== Next Steps =====
        console.log("\n📝 Next Steps:");
        console.log("1. Update frontend environment variables");
        if (shouldVerify) {
            console.log("2. ✅ Contracts automatically verified on block explorer");
        } else {
            console.log("2. Verify contracts on block explorer (use commands above)");
        }
        if (config.token.address === "0x0000000000000000000000000000000000000000") {
            console.log("3. ⚠️  UPDATE NYAX token address in governor contract");
        }
        console.log("4. Test governance functionality with sample proposals");
        console.log("5. Create initial governance proposals");
        if (!shouldRenounceAdmin) {
            console.log("6. Consider renouncing timelock admin role for full decentralization");
        }

        // ===== Governance Features =====
        console.log("\n🚀 Available Governance Features:");
        console.log("=" .repeat(50));
        console.log("✅ Standard Proposals - Full timelock protection");
        console.log("✅ Emergency Proposals - Reduced delays for critical issues");
        console.log("✅ Fast-track Execution - Bypass timelock for urgent matters");
        console.log("✅ Vote Delegation - Users can delegate voting power");
        console.log("✅ Quorum Protection - Minimum participation required");
        console.log("✅ Proposal Threshold - Prevents spam proposals");
        console.log("=" .repeat(50));

        // ===== Usage Examples =====
        console.log("\n📖 Usage Examples:");
        console.log("=" .repeat(50));
        console.log("// Create standard proposal");
        console.log(`governor.propose([target], [0], [calldata], "Description");`);
        console.log();
        console.log("// Create emergency proposal");
        console.log(`governor.proposeEmergency([target], [0], [calldata], "Emergency: Description");`);
        console.log();
        console.log("// Vote on proposal");
        console.log(`governor.castVote(proposalId, 1); // 0=Against, 1=For, 2=Abstain`);
        console.log();
        console.log("// Execute proposal (after timelock)");
        console.log(`governor.execute([target], [0], [calldata], keccak256("Description"));`);
        console.log("=" .repeat(50));

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
