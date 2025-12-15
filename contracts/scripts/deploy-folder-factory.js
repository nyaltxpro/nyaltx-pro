const hre = require("hardhat");
const { getAddressFromEnv, requireEnv, saveDeployment } = require("./utils");

async function deployFolderFactory(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  // Get deployment parameters
  const governance = deployer.address;

  if (!governance) {
    throw new Error("Missing governance address for FolderFactory deployment");
  }

  console.log("====================================================");
  console.log(`[${network.name}] Deploying FolderRegistryFactory`);
  console.log(`Deployer:   ${deployer.address}`);
  console.log(`Governance: ${governance}`);

  const factory = await ethers.getContractFactory("FolderRegistryFactory");
  const contract = await factory.deploy(governance);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`FolderRegistryFactory deployed at ${address}`);
  console.log("====================================================\n");

  // Save deployment info
  saveDeployment(network.name, {
    contractName: "FolderRegistryFactory",
    address,
    deployer: deployer.address,
    governance,
    transactionHash: contract.deploymentTransaction().hash,
  });

  return contract;
}

module.exports = {
  deployFolderFactory,
};

if (require.main === module) {
  deployFolderFactory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
