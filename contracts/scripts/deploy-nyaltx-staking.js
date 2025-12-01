const hre = require("hardhat");
const { getAddressFromEnv } = require("./utils");

async function deployNyaltxStaking(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const governanceToken =
    overrides.governanceToken || getAddressFromEnv("GOVERNANCE_TOKEN_ADDRESS");
  const admin = overrides.admin || getAddressFromEnv("STAKING_ADMIN_ADDRESS", deployer.address);

  if (!governanceToken) {
    throw new Error("Missing governance token address for NYALTXStaking deployment");
  }

  console.log("====================================================");
  console.log(`[${network.name}] Deploying NYALTXStaking`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Governance Token: ${governanceToken}`);
  console.log(`Admin: ${admin}`);

  const factory = await ethers.getContractFactory("NYALTXStaking");
  const contract = await factory.deploy(governanceToken, admin);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`NYALTXStaking deployed at ${address}`);
  console.log("====================================================\n");

  return contract;
}

module.exports = {
  deployNyaltxStaking,
};

if (require.main === module) {
  deployNyaltxStaking()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
