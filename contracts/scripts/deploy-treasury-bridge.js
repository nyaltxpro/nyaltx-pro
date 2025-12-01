const hre = require("hardhat");
const { getAddressFromEnv } = require("./utils");

async function deployTreasuryBridge(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const treasuryMultisig =
    overrides.treasuryMultisig || getAddressFromEnv("TREASURY_MULTISIG_ADDRESS");
  const timelockController =
    overrides.timelockController || getAddressFromEnv("TIMELOCK_ADDRESS");
  const governor = overrides.governor || getAddressFromEnv("GOVERNOR_ADDRESS");
  const admin = overrides.admin || getAddressFromEnv("TREASURY_BRIDGE_ADMIN", deployer.address);

  if (!treasuryMultisig || !timelockController || !governor) {
    throw new Error("Missing multisig/timelock/governor address for TreasuryBridge deployment");
  }

  console.log("====================================================");
  console.log(`[${network.name}] Deploying TreasuryBridge`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Treasury Multisig: ${treasuryMultisig}`);
  console.log(`Timelock Controller: ${timelockController}`);
  console.log(`Governor: ${governor}`);
  console.log(`Admin: ${admin}`);

  const factory = await ethers.getContractFactory("TreasuryBridge");
  const contract = await factory.deploy(
    treasuryMultisig,
    timelockController,
    governor,
    admin
  );
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`TreasuryBridge deployed at ${address}`);
  console.log("====================================================\n");

  return contract;
}

module.exports = {
  deployTreasuryBridge,
};

if (require.main === module) {
  deployTreasuryBridge()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
