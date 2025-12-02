const hre = require("hardhat");
const { requireEnv } = require("./utils");

/**
 * Generic verification helper using hardhat-etherscan.
 * @param {string} contractAddress deployed contract address
 * @param {string} contractPath fully qualified contract name (e.g. contracts/NYALTXGovernanceToken.sol:NYALTXGovernanceToken)
 * @param {Array} constructorArgs constructor arguments array
 */
async function verifyContract(contractAddress, contractPath, constructorArgs = []) {
  if (!contractAddress) {
    console.warn(`⚠️  Skipping ${contractPath} – no address provided.`);
    return;
  }

  console.log(`\n🔍 Verifying ${contractPath} at ${contractAddress} ...`);
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      contract: contractPath,
      constructorArguments: constructorArgs,
    });
    console.log(`✅ Verified ${contractPath}`);
  } catch (error) {
    const message = error.message || "";
    if (message.includes("Already Verified")) {
      console.log(`ℹ️  ${contractPath} is already verified.`);
    } else {
      console.error(`❌ Verification failed for ${contractPath}:`, message);
    }
  }
}

async function main() {
  const network = hre.network.name;
  console.log(`====================================================`);
  console.log(`[${network}] Starting verification run`);
  console.log(`====================================================`);

  // Gather constructor args from env (fallback to deployer where needed)
  const admin = requireEnv("FOLDER_ADMIN_ADDRESS");
  const governanceAdmin = requireEnv("GOVERNANCE_ADMIN_ADDRESS");
  const treasuryAddress = requireEnv("TREASURY_ADDRESS");
  const legacyToken = requireEnv("LEGACY_TOKEN_ADDRESS");
  const legacyTokenOwner = requireEnv("LEGACY_TOKEN_OWNER");
  const legacyTokenName = process.env.LEGACY_TOKEN_NAME || "Legacy NYALTX";
  const legacyTokenSymbol = process.env.LEGACY_TOKEN_SYMBOL || "lNYAX";
  const legacyTokenInitialSupplyRaw = process.env.LEGACY_TOKEN_INITIAL_SUPPLY || "0";
  const migrationAdmin = requireEnv("MIGRATION_ADMIN_ADDRESS");
  const stakingAdmin = requireEnv("STAKING_ADMIN_ADDRESS");
  const treasuryMultisig = requireEnv("TREASURY_MULTISIG_ADDRESS");
  const timelockAddress = requireEnv("TIMELOCK_ADDRESS");
  const governorAddress = requireEnv("GOVERNOR_ADDRESS");

  // Deployed contract addresses (env-driven)
  const nyaltxTokenAddr = requireEnv("NYALTX_GOVERNANCE_TOKEN_ADDRESS");
  const legacyVaultAddr = requireEnv("LEGACY_MIGRATION_VAULT_ADDRESS");
  const stakingAddr = requireEnv("NYALTX_STAKING_ADDRESS");
  const folderRegistryAddr = requireEnv("FOLDER_REGISTRY_ADDRESS");
  const timelockAddr = timelockAddress;
  const governorAddr = governorAddress;
  const treasuryBridgeAddr = requireEnv("TREASURY_BRIDGE_ADDRESS");
  const treasuryMultisigAddr = requireEnv("TREASURY_MULTISIG_DEPLOYED_ADDRESS");

  await verifyContract(legacyToken, "contracts/LegacyToken.sol:LegacyToken", [
    legacyTokenName,
    legacyTokenSymbol,
    legacyTokenOwner,
    hre.ethers.parseUnits(legacyTokenInitialSupplyRaw, 18),
  ]);

  await verifyContract(nyaltxTokenAddr, "contracts/NYALTXGovernanceToken.sol:NYALTXGovernanceToken", [governanceAdmin, treasuryAddress]);
  await verifyContract(legacyVaultAddr, "contracts/LegacyMigrationVault.sol:LegacyMigrationVault", [legacyToken, nyaltxTokenAddr, requireEnv("MIGRATION_RATIO"), migrationAdmin]);
  await verifyContract(stakingAddr, "contracts/contracts/NyaltxStaking.sol:NyaltxStaking", [nyaltxTokenAddr, stakingAdmin]);
  await verifyContract(folderRegistryAddr, "contracts/FolderRegistery.sol:FolderRegistry", [admin]);
  await verifyContract(timelockAddr, "contracts/NYAXTimelockController.sol:NYAXTimelockController", [3600, [governorAddr], [governanceAdmin], governanceAdmin]);
  await verifyContract(governorAddr, "contracts/NYAXGovernor.sol:NYAXGovernor",   [
    nyaltxTokenAddr,
    timelockAddr,
    parseInt(process.env.GOVERNOR_VOTING_DELAY_BLOCKS || "1", 10),
    parseInt(process.env.GOVERNOR_VOTING_PERIOD_BLOCKS || "50400", 10),
    hre.ethers.parseUnits(process.env.GOVERNOR_PROPOSAL_THRESHOLD || "1000000", 18),
    parseInt(process.env.GOVERNOR_QUORUM_NUMERATOR || "4", 10),
  ]);
  await verifyContract(treasuryBridgeAddr, "contracts/TreasuryBridge.sol:TreasuryBridge", [treasuryMultisig, timelockAddr, governorAddr, governanceAdmin]);
  await verifyContract(treasuryMultisigAddr, "contracts/TreasuryMultisig.sol:TreasuryMultisig", [
    requireEnv("TREASURY_MULTISIG_OWNERS").split(","),
    parseInt(requireEnv("TREASURY_MULTISIG_THRESHOLD"), 10),
  ]);

  console.log(`\n✅ Verification run finished.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
