const hre = require("hardhat");
const { getAddressFromEnv } = require("./utils");

async function deployFolderRegistry(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const admin = overrides.admin || getAddressFromEnv("FOLDER_ADMIN_ADDRESS", deployer.address);

  if (!admin) {
    throw new Error("Missing admin address for FolderRegistry deployment");
  }

  console.log("====================================================");
  console.log(`[${network.name}] Deploying FolderRegistry`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Admin:    ${admin}`);

  const factory = await ethers.getContractFactory("FolderRegistry");
  const contract = await factory.deploy(admin);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`FolderRegistry deployed at ${address}`);
  console.log("====================================================\n");

  return contract;
}

module.exports = {
  deployFolderRegistry,
};

if (require.main === module) {
  deployFolderRegistry()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
