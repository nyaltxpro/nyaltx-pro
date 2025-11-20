const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting NYAX Platform deployment...\n");

  // Get deployment configuration
  const config = getDeploymentConfig();
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Deployment Configuration:");
  console.log("- Network:", hre.network.name);
  console.log("- Deployer:", deployer.address);
  console.log("- Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("- MultiSig Owners:", config.multisigOwners);
  console.log("- MultiSig Threshold:", config.multisigThreshold);
  console.log("");

  const deploymentResults = {};

  try {
    // 1. Deploy MultiSig
    console.log("1️⃣ Deploying SimpleMultiSig...");
    const SimpleMultiSig = await ethers.getContractFactory("SimpleMultiSig");
    const multisig = await SimpleMultiSig.deploy(config.multisigOwners, config.multisigThreshold);
    await multisig.waitForDeployment();
    const multisigAddress = await multisig.getAddress();
    console.log("✅ SimpleMultiSig deployed to:", multisigAddress);
    deploymentResults.multisig = multisigAddress;

    // 2. Deploy NYAX Token
    console.log("\n2️⃣ Deploying NYAX Token...");
    const NYAXToken = await ethers.getContractFactory("NYAXToken");
    const nyaxToken = await NYAXToken.deploy(
      deployer.address, // Initial treasury (will be changed to Treasury contract)
      deployer.address  // Initial owner
    );
    await nyaxToken.waitForDeployment();
    const nyaxTokenAddress = await nyaxToken.getAddress();
    console.log("✅ NYAX Token deployed to:", nyaxTokenAddress);
    deploymentResults.nyaxToken = nyaxTokenAddress;

    // 3. Deploy Treasury
    console.log("\n3️⃣ Deploying Treasury...");
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy(
      nyaxTokenAddress,
      multisigAddress,
      deployer.address
    );
    await treasury.waitForDeployment();
    const treasuryAddress = await treasury.getAddress();
    console.log("✅ Treasury deployed to:", treasuryAddress);
    deploymentResults.treasury = treasuryAddress;

    // 4. Deploy Vesting Factory
    console.log("\n4️⃣ Deploying Vesting Factory...");
    const VestingFactory = await ethers.getContractFactory("VestingFactory");
    const vestingFactory = await VestingFactory.deploy(
      nyaxTokenAddress,
      deployer.address
    );
    await vestingFactory.waitForDeployment();
    const vestingFactoryAddress = await vestingFactory.getAddress();
    console.log("✅ Vesting Factory deployed to:", vestingFactoryAddress);
    deploymentResults.vestingFactory = vestingFactoryAddress;

    // 5. Configure NYAX Token
    console.log("\n5️⃣ Configuring NYAX Token...");
    console.log("- Setting Treasury as authorized minter...");
    await nyaxToken.setTreasury(treasuryAddress);
    console.log("✅ Treasury set as authorized minter");

    // 6. Setup Treasury Categories
    console.log("\n6️⃣ Setting up Treasury Categories...");
    const categories = config.treasuryAllocations;
    for (const [category, allocation] of Object.entries(categories)) {
      console.log(`- Setting up ${category} category (${allocation}%)...`);
      const allocationBasisPoints = allocation * 100; // Convert percentage to basis points
      await treasury.setCategoryWallet(
        category,
        deployer.address, // Temporary wallet, should be changed later
        allocationBasisPoints
      );
      console.log(`✅ ${category} category configured`);
    }

    // 7. Initial Token Minting (if specified)
    if (config.initialSupply && config.initialSupply !== "0") {
      console.log("\n7️⃣ Minting Initial Supply...");
      const initialSupply = ethers.parseEther(config.initialSupply);
      await treasury.mintToTreasury(initialSupply, "Initial supply mint");
      console.log("✅ Initial supply minted to Treasury:", ethers.formatEther(initialSupply), "NYAX");
      deploymentResults.initialSupply = ethers.formatEther(initialSupply);
    }

    // 8. Create Sample Vesting Contracts
    console.log("\n8️⃣ Creating Sample Vesting Contracts...");
    const vestingCategories = ["team", "advisors", "marketing"];
    for (const category of vestingCategories) {
      console.log(`- Creating ${category} vesting contract...`);
      const tx = await vestingFactory.createVestingContract(category);
      await tx.wait();
      console.log(`✅ ${category} vesting contract created`);
    }

    // 9. Verification Setup
    console.log("\n9️⃣ Preparing Verification Data...");
    const verificationData = {
      network: hre.network.name,
      contracts: {
        SimpleMultiSig: {
          address: multisigAddress,
          constructorArgs: [config.multisigOwners, config.multisigThreshold]
        },
        NYAXToken: {
          address: nyaxTokenAddress,
          constructorArgs: [deployer.address, deployer.address]
        },
        Treasury: {
          address: treasuryAddress,
          constructorArgs: [nyaxTokenAddress, multisigAddress, deployer.address]
        },
        VestingFactory: {
          address: vestingFactoryAddress,
          constructorArgs: [nyaxTokenAddress, deployer.address]
        }
      }
    };

    // Save deployment results
    const deploymentFile = path.join(__dirname, `../deployments/${hre.network.name}.json`);
    const deploymentsDir = path.dirname(deploymentFile);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentData = {
      timestamp: new Date().toISOString(),
      network: hre.network.name,
      deployer: deployer.address,
      ...deploymentResults,
      verificationData
    };

    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log("✅ Deployment data saved to:", deploymentFile);

    // Summary
    console.log("\n🎉 NYAX Platform Deployment Complete!");
    console.log("=" .repeat(50));
    console.log("📋 Deployment Summary:");
    console.log("- Network:", hre.network.name);
    console.log("- NYAX Token:", nyaxTokenAddress);
    console.log("- Treasury:", treasuryAddress);
    console.log("- MultiSig:", multisigAddress);
    console.log("- Vesting Factory:", vestingFactoryAddress);
    if (deploymentResults.initialSupply) {
      console.log("- Initial Supply:", deploymentResults.initialSupply, "NYAX");
    }
    console.log("\n🔍 Next Steps:");
    console.log("1. Verify contracts on block explorer");
    console.log("2. Update category wallet addresses in Treasury");
    console.log("3. Transfer ownership to MultiSig if needed");
    console.log("4. Set up governance system");
    console.log("5. Configure frontend with contract addresses");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

function getDeploymentConfig() {
  const network = hre.network.name;
  
  // Default configuration
  let config = {
    multisigOwners: [
      "0x77B6321d2888aa62f2A42620852FEe8eeDcfA77b", // Admin wallet 1
      "0x81bA7b98E49014bff22F811E9405640bc2b39cc0"  // Admin wallet 2
    ],
    multisigThreshold: 2,
    initialSupply: "0", // Will mint on demand
    treasuryAllocations: {
      team: 20,        // 20%
      advisors: 5,     // 5%
      marketing: 15,   // 15%
      development: 25, // 25%
      community: 35    // 35%
    }
  };

  // Network-specific overrides
  if (network === "mainnet") {
    // Production configuration
    config.initialSupply = "1000000000"; // 1 billion tokens
  } else if (network === "sepolia") {
    // Testnet configuration
    config.initialSupply = "100000000"; // 100 million tokens for testing
  }

  // Environment variable overrides
  if (process.env.MULTISIG_OWNERS) {
    config.multisigOwners = process.env.MULTISIG_OWNERS.split(",");
  }
  if (process.env.MULTISIG_THRESHOLD) {
    config.multisigThreshold = parseInt(process.env.MULTISIG_THRESHOLD);
  }
  if (process.env.INITIAL_SUPPLY) {
    config.initialSupply = process.env.INITIAL_SUPPLY;
  }

  return config;
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, getDeploymentConfig };
