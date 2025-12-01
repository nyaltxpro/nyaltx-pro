const hre = require("hardhat");
const {
  getAddressFromEnv,
  requireEnv,
  saveDeployment,
} = require("./utils");

const {
  deployNYALTXGovernanceToken,
} = require("./deploy-nyaltx-governance-token");
const {
  deployLegacyMigrationVault,
} = require("./deploy-legacy-migration-vault");
const { deployNyaltxStaking } = require("./deploy-nyaltx-staking");
const { deployFolderRegistry } = require("./deploy-folder-registry");
const { deployTreasuryBridge } = require("./deploy-treasury-bridge");

async function deployGovernanceStack() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  console.log("====================================================");
  console.log(`[${network.name}] Starting full NYALTX governance stack deployment`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("====================================================\n");

  const summary = {
    deployer: deployer.address,
    network: network.name,
  };

  // 1. Deploy governance token
  const governanceToken = await deployNYALTXGovernanceToken({
    admin: getAddressFromEnv("GOVERNANCE_ADMIN_ADDRESS", deployer.address),
    treasury: getAddressFromEnv("TREASURY_ADDRESS", deployer.address),
  });
  const governanceTokenAddress = await governanceToken.getAddress();
  summary.governanceToken = governanceTokenAddress;

  // 2. Deploy migration vault (requires legacy token address)
  const legacyTokenAddress = requireEnv("LEGACY_TOKEN_ADDRESS");
  const legacyVault = await deployLegacyMigrationVault({
    legacyToken: legacyTokenAddress,
    governanceToken: governanceTokenAddress,
    conversionRatio: getAddressFromEnv(
      "MIGRATION_RATIO",
      "1000000000000000000"
    ),
    admin: getAddressFromEnv("MIGRATION_ADMIN_ADDRESS", deployer.address),
  });
  const legacyVaultAddress = await legacyVault.getAddress();
  summary.legacyMigrationVault = legacyVaultAddress;

  console.log("Authorizing migration vault within governance token...");
  const migrationTx = await governanceToken.setMigrationContract(
    legacyVaultAddress,
    true
  );
  await migrationTx.wait();
  console.log("Migration contract authorized.\n");

  // 3. Deploy staking contract and grant staking role
  const staking = await deployNyaltxStaking({
    governanceToken: governanceTokenAddress,
    admin: getAddressFromEnv("STAKING_ADMIN_ADDRESS", deployer.address),
  });
  const stakingAddress = await staking.getAddress();
  summary.staking = stakingAddress;

  console.log("Granting STAKING_ROLE to staking contract...");
  const stakingRole = await governanceToken.STAKING_ROLE();
  const grantStakingTx = await governanceToken.grantRole(
    stakingRole,
    stakingAddress
  );
  await grantStakingTx.wait();
  console.log("STAKING_ROLE granted.\n");

  // 4. Deploy folder registry
  const folderRegistry = await deployFolderRegistry({
    admin: getAddressFromEnv("FOLDER_ADMIN_ADDRESS", deployer.address),
  });
  const folderRegistryAddress = await folderRegistry.getAddress();
  summary.folderRegistry = folderRegistryAddress;

  // 5. Deploy treasury bridge (requires external governance/timelock/multisig)
  const treasuryBridge = await deployTreasuryBridge({
    treasuryMultisig: requireEnv("TREASURY_MULTISIG_ADDRESS"),
    timelockController: requireEnv("TIMELOCK_ADDRESS"),
    governor: requireEnv("GOVERNOR_ADDRESS"),
    admin: getAddressFromEnv("TREASURY_BRIDGE_ADMIN", deployer.address),
  });
  const treasuryBridgeAddress = await treasuryBridge.getAddress();
  summary.treasuryBridge = treasuryBridgeAddress;

  console.log("====================================================");
  console.log("Deployment Summary:");
  console.table(summary);
  console.log("====================================================\n");

  const outputPath = saveDeployment(network.name, summary);
  console.log(`Deployment summary saved to ${outputPath}`);

  return summary;
}

module.exports = {
  deployGovernanceStack,
};

if (require.main === module) {
  deployGovernanceStack()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
