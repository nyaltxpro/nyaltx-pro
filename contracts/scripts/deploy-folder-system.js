const hre = require("hardhat");
const { deployFolderFactory } = require("./deploy-folder-factory");
const { deployFolderEscrow } = require("./deploy-folder-escrow");
const { getAddressFromEnv, requireEnv, saveDeployment } = require("./utils");

async function deployFolderSystem(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  console.log("====================================================");
  console.log(`[${network.name}] Deploying Complete Folder System`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("====================================================");

  // Deploy FolderFactory first
  console.log("Step 1: Deploying FolderRegistryFactory...");
  const factoryContract = await deployFolderFactory(overrides.factory);
  const factoryAddress = await factoryContract.getAddress();

  // Wait a bit for the deployment to be fully processed
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Optional: Deploy a sample FolderEscrow if parameters are provided
  let escrowContract = null;
  if (overrides.escrow) {
    console.log("Step 2: Deploying sample FolderEscrow...");
    escrowContract = await deployFolderEscrow({
      ...overrides.escrow,
      registry: factoryAddress, // Use the deployed factory as registry
    });
    const escrowAddress = await escrowContract.getAddress();
    console.log(`Sample FolderEscrow deployed at ${escrowAddress}`);
  }

  // Save complete system deployment
  const deploymentData = {
    systemName: "FolderSystem",
    network: network.name,
    deployer: deployer.address,
    contracts: {
      FolderRegistryFactory: {
        address: factoryAddress,
        transactionHash: factoryContract.deploymentTransaction().hash,
      },
    },
    deployedAt: new Date().toISOString(),
  };

  if (escrowContract) {
    deploymentData.contracts.FolderEscrow = {
      address: await escrowContract.getAddress(),
      transactionHash: escrowContract.deploymentTransaction().hash,
    };
  }

  saveDeployment(network.name, deploymentData);

  console.log("====================================================");
  console.log("Folder System Deployment Complete!");
  console.log(`Factory: ${factoryAddress}`);
  if (escrowContract) {
    console.log(`Escrow:   ${await escrowContract.getAddress()}`);
  }
  console.log("====================================================\n");

  return {
    factory: factoryContract,
    escrow: escrowContract,
  };
}

module.exports = {
  deployFolderSystem,
};

if (require.main === module) {
  deployFolderSystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
