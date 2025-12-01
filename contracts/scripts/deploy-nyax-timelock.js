const hre = require("hardhat");
const { parseAddressListFromEnv, getAddressFromEnv, requireEnv } = require("./utils");

async function deployNyaxTimelock(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const minDelayRaw = overrides.minDelay || process.env.TIMELOCK_MIN_DELAY || "172800"; // default 2 days
  const proposers = overrides.proposers || parseAddressListFromEnv("TIMELOCK_PROPOSERS", [deployer.address]);
  const executors = overrides.executors || parseAddressListFromEnv("TIMELOCK_EXECUTORS", [deployer.address]);
  const admin = overrides.admin || getAddressFromEnv("TIMELOCK_ADMIN", deployer.address);

  if (Number(minDelayRaw) < 0) {
    throw new Error("Timelock delay cannot be negative");
  }
  if (!admin) {
    throw new Error("Timelock admin address is required");
  }

  const minDelay = BigInt(minDelayRaw);

  console.log("====================================================");
  console.log(`[${network.name}] Deploying NYAXTimelockController`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Min Delay (seconds): ${minDelayRaw}`);
  console.log(`Proposers: ${proposers.join(", ")}`);
  console.log(`Executors: ${executors.join(", ")}`);
  console.log(`Admin: ${admin}`);

  const factory = await ethers.getContractFactory("NYAXTimelockController");
  const contract = await factory.deploy(minDelay, proposers, executors, admin);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`NYAXTimelockController deployed at ${address}`);
  console.log("====================================================\n");

  return contract;
}

module.exports = {
  deployNyaxTimelock,
};

if (require.main === module) {
  deployNyaxTimelock()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
