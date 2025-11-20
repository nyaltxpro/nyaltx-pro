const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🏛️ Setting up NYAX Governance System...\n");

  const network = hre.network.name;
  const deploymentFile = path.join(__dirname, `../deployments/${network}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found:", deploymentFile);
    console.log("Please run deployment script first.");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const [deployer] = await ethers.getSigners();

  console.log("📋 Governance Setup Configuration:");
  console.log("- Network:", network);
  console.log("- Deployer:", deployer.address);
  console.log("- NYAX Token:", deploymentData.nyaxToken);
  console.log("- Treasury:", deploymentData.treasury);
  console.log("- MultiSig:", deploymentData.multisig);
  console.log("");

  try {
    // Get contract instances
    const nyaxToken = await ethers.getContractAt("NYAXToken", deploymentData.nyaxToken);
    const treasury = await ethers.getContractAt("Treasury", deploymentData.treasury);
    const multisig = await ethers.getContractAt("SimpleMultiSig", deploymentData.multisig);

    // 1. Setup initial token distribution for governance
    console.log("1️⃣ Setting up initial token distribution...");
    
    const initialGovernanceSupply = ethers.parseEther("10000000"); // 10M tokens for initial governance
    const currentBalance = await nyaxToken.balanceOf(deploymentData.treasury);
    
    if (currentBalance < initialGovernanceSupply) {
      console.log("- Minting additional tokens for governance...");
      await treasury.mintToTreasury(
        initialGovernanceSupply - currentBalance,
        "Initial governance token distribution"
      );
    }

    // 2. Distribute tokens to key stakeholders for voting power
    console.log("\n2️⃣ Distributing governance tokens...");
    
    const governanceDistribution = [
      { category: "team", amount: ethers.parseEther("3000000"), reason: "Team governance allocation" },
      { category: "advisors", amount: ethers.parseEther("500000"), reason: "Advisor governance allocation" },
      { category: "community", amount: ethers.parseEther("2000000"), reason: "Community governance allocation" }
    ];

    for (const dist of governanceDistribution) {
      console.log(`- Allocating ${ethers.formatEther(dist.amount)} NYAX for ${dist.category}...`);
      
      // For now, allocate to deployer address (should be changed to proper addresses later)
      await treasury.transferTo(
        deployer.address,
        dist.amount,
        dist.reason,
        dist.category
      );
      
      console.log(`✅ ${dist.category} allocation completed`);
    }

    // 3. Delegate voting power
    console.log("\n3️⃣ Setting up voting delegation...");
    console.log("- Self-delegating voting power...");
    await nyaxToken.delegate(deployer.address);
    console.log("✅ Voting power delegated");

    // 4. Create sample vesting schedules for governance participants
    console.log("\n4️⃣ Creating governance vesting schedules...");
    
    const vestingFactory = await ethers.getContractAt("VestingFactory", deploymentData.vestingFactory);
    
    // Get team vesting contract
    const teamContracts = await vestingFactory.getCategoryContracts("team");
    if (teamContracts.length > 0) {
      const teamVesting = await ethers.getContractAt("VestingWalletFlexible", teamContracts[0]);
      
      // Approve tokens for vesting
      await nyaxToken.approve(teamContracts[0], ethers.parseEther("1000000"));
      
      // Create sample vesting schedule
      const startTime = Math.floor(Date.now() / 1000);
      const cliffDuration = 365 * 24 * 60 * 60; // 1 year cliff
      const vestingDuration = 4 * 365 * 24 * 60 * 60; // 4 year vesting
      
      console.log("- Creating team vesting schedule...");
      await teamVesting.createVestingSchedule(
        deployer.address, // beneficiary (should be actual team member)
        ethers.parseEther("1000000"), // 1M tokens
        startTime,
        cliffDuration,
        vestingDuration,
        true, // revocable
        "team"
      );
      
      console.log("✅ Team vesting schedule created");
    }

    // 5. Setup MultiSig governance proposals
    console.log("\n5️⃣ Setting up MultiSig governance framework...");
    
    // Create a sample governance proposal (transfer ownership to multisig)
    console.log("- Creating sample governance proposal...");
    
    const transferOwnershipData = nyaxToken.interface.encodeFunctionData(
      "transferOwnership",
      [deploymentData.multisig]
    );
    
    // Submit proposal to transfer token ownership to multisig
    const tx = await multisig.submitTransaction(
      deploymentData.nyaxToken,
      0,
      transferOwnershipData
    );
    
    const receipt = await tx.wait();
    console.log("✅ Ownership transfer proposal submitted to MultiSig");

    // 6. Setup emergency procedures
    console.log("\n6️⃣ Setting up emergency procedures...");
    
    // Enable transfers (they should be enabled by default, but let's make sure)
    const transfersEnabled = await nyaxToken.transfersEnabled();
    if (!transfersEnabled) {
      await nyaxToken.setTransfersEnabled(true);
      console.log("✅ Token transfers enabled");
    } else {
      console.log("✅ Token transfers already enabled");
    }

    // 7. Generate governance documentation
    console.log("\n7️⃣ Generating governance documentation...");
    
    const governanceData = {
      timestamp: new Date().toISOString(),
      network: network,
      contracts: {
        nyaxToken: deploymentData.nyaxToken,
        treasury: deploymentData.treasury,
        multisig: deploymentData.multisig,
        vestingFactory: deploymentData.vestingFactory
      },
      governance: {
        initialSupply: ethers.formatEther(await nyaxToken.totalSupply()),
        treasuryBalance: ethers.formatEther(await nyaxToken.balanceOf(deploymentData.treasury)),
        votingPower: ethers.formatEther(await nyaxToken.getVotes(deployer.address)),
        multisigOwners: await multisig.getOwners(),
        multisigThreshold: await multisig.threshold()
      },
      procedures: {
        proposalSubmission: "Submit proposals through MultiSig contract",
        votingMechanism: "ERC20Votes standard with delegation",
        executionDelay: "Immediate execution after multisig approval",
        emergencyProcedures: "Owner can pause transfers and revoke vesting"
      }
    };

    const governanceFile = path.join(__dirname, `../deployments/${network}-governance.json`);
    fs.writeFileSync(governanceFile, JSON.stringify(governanceData, null, 2));
    console.log("✅ Governance documentation saved to:", governanceFile);

    // Summary
    console.log("\n🎉 NYAX Governance Setup Complete!");
    console.log("=" .repeat(50));
    console.log("📋 Governance Summary:");
    console.log("- Total Supply:", ethers.formatEther(await nyaxToken.totalSupply()), "NYAX");
    console.log("- Treasury Balance:", ethers.formatEther(await nyaxToken.balanceOf(deploymentData.treasury)), "NYAX");
    console.log("- Your Voting Power:", ethers.formatEther(await nyaxToken.getVotes(deployer.address)), "NYAX");
    console.log("- MultiSig Owners:", (await multisig.getOwners()).length);
    console.log("- MultiSig Threshold:", await multisig.threshold());
    
    console.log("\n🔍 Next Steps:");
    console.log("1. Distribute tokens to actual team members and advisors");
    console.log("2. Set up proper category wallet addresses");
    console.log("3. Create additional vesting schedules");
    console.log("4. Implement OpenZeppelin Governor for advanced governance");
    console.log("5. Set up governance frontend interface");
    console.log("6. Transfer contract ownership to MultiSig");

  } catch (error) {
    console.error("❌ Governance setup failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
