const hre = require("hardhat");
const { getAddressFromEnv } = require("./utils");

async function deployLegacyMigrationVault(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const legacyToken = overrides.legacyToken || getAddressFromEnv("LEGACY_TOKEN_ADDRESS");
  const governanceToken = overrides.governanceToken || getAddressFromEnv("GOVERNANCE_TOKEN_ADDRESS");
  const conversionRatio = overrides.conversionRatio || getAddressFromEnv("MIGRATION_RATIO", "1000000000000000000"); // default 1:1
  const admin = overrides.admin || getAddressFromEnv("MIGRATION_ADMIN_ADDRESS", deployer.address);

  if (!legacyToken || !governanceToken) {
    throw new Error("Missing legacy token or governance token address for LegacyMigrationVault deployment");
  }

  console.log("====================================================");
  console.log(`[${network.name}] Deploying LegacyMigrationVault`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Legacy Token: ${legacyToken}`);
  console.log(`Governance Token: ${governanceToken}`);
  console.log(`Conversion Ratio (1e18 scale): ${conversionRatio}`);
  console.log(`Admin: ${admin}`);

  const factory = await ethers.getContractFactory("LegacyMigrationVault");
  const contract = await factory.deploy(legacyToken, governanceToken, conversionRatio, admin);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`LegacyMigrationVault deployed at ${address}`);
  console.log("====================================================\n");

  return contract;
}

module.exports = {
  deployLegacyMigrationVault,
};

if (require.main === module) {
  deployLegacyMigrationVault()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
