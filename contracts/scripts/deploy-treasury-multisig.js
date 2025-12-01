const hre = require("hardhat");
const { parseAddressListFromEnv, requireEnv, getAddressFromEnv } = require("./utils");

async function deployTreasuryMultisig(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const owners = overrides.owners || parseAddressListFromEnv("TREASURY_MULTISIG_OWNERS", [deployer.address]);
  const threshold = overrides.threshold || process.env.TREASURY_MULTISIG_THRESHOLD || "1";

  if (!owners || owners.length === 0) {
    throw new Error("Multisig requires at least one owner");
  }

  const thresholdNum = Number(threshold);
  if (Number.isNaN(thresholdNum) || thresholdNum < 1 || thresholdNum > owners.length) {
    throw new Error("Invalid multisig threshold");
  }

  console.log("====================================================");
  console.log(`[${network.name}] Deploying TreasuryMultisig`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Owners: ${owners.join(", ")}`);
  console.log(`Threshold: ${thresholdNum}`);

  const factory = await ethers.getContractFactory("TreasuryMultisig");
  const contract = await factory.deploy(owners, thresholdNum);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`TreasuryMultisig deployed at ${address}`);
  console.log("====================================================\n");

  return contract;
}

module.exports = {
  deployTreasuryMultisig,
};

if (require.main === module) {
  deployTreasuryMultisig()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
