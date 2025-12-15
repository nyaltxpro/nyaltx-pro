const hre = require("hardhat");
const { getAddressFromEnv, requireEnv, saveDeployment } = require("./utils");

async function deployFolderEscrow(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  // Get deployment parameters
  const tokenAddress = overrides.token || requireEnv("TOKEN_ADDRESS");
  const admin = overrides.admin || getAddressFromEnv("FOLDER_ADMIN_ADDRESS", deployer.address);
  const folderName = overrides.folderName || process.env.FOLDER_NAME || "Default Folder";
  const registry = overrides.registry || getAddressFromEnv("FOLDER_REGISTRY_ADDRESS");

  if (!tokenAddress) {
    throw new Error("Missing token address for FolderEscrow deployment");
  }

  if (!registry) {
    throw new Error("Missing registry address for FolderEscrow deployment");
  }

  console.log("====================================================");
  console.log(`[${network.name}] Deploying FolderEscrow`);
  console.log(`Deployer:    ${deployer.address}`);
  console.log(`Token:       ${tokenAddress}`);
  console.log(`Admin:       ${admin}`);
  console.log(`Folder Name: ${folderName}`);
  console.log(`Registry:    ${registry}`);

  const factory = await ethers.getContractFactory("FolderEscrow");
  const contract = await factory.deploy(
    tokenAddress,
    admin,
    folderName,
    registry
  );
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`FolderEscrow deployed at ${address}`);
  console.log("====================================================\n");

  // Save deployment info
  saveDeployment(network.name, {
    contractName: "FolderEscrow",
    address,
    deployer: deployer.address,
    token: tokenAddress,
    admin,
    folderName,
    registry,
    transactionHash: contract.deploymentTransaction().hash,
  });

  return contract;
}

module.exports = {
  deployFolderEscrow,
};

if (require.main === module) {
  deployFolderEscrow()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
