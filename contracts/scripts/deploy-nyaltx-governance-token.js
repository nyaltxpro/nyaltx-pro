const hre = require("hardhat");
const { getAddressFromEnv } = require("./utils");

async function deployNYALTXGovernanceToken(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const admin = overrides.admin || getAddressFromEnv("GOVERNANCE_ADMIN_ADDRESS", deployer.address);
  const treasury = overrides.treasury || getAddressFromEnv("TREASURY_ADDRESS", deployer.address);

  if (!admin || !treasury) {
    throw new Error("Missing admin or treasury address for NYALTXGovernanceToken deployment");
  }

  console.log("====================================================");
  console.log(`[${network.name}] Deploying NYALTXGovernanceToken`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Admin:    ${admin}`);
  console.log(`Treasury: ${treasury}`);

  const factory = await ethers.getContractFactory("NYALTXGovernanceToken");
  const contract = await factory.deploy(admin, treasury);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`NYALTXGovernanceToken deployed at ${address}`);
  console.log("====================================================\n");

  return contract;
}

module.exports = {
  deployNYALTXGovernanceToken,
};

if (require.main === module) {
  deployNYALTXGovernanceToken()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
