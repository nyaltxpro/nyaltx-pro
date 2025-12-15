const hre = require("hardhat");
const { requireEnv, getAddressFromEnv, saveDeployment } = require("./utils");

async function deployTreasury(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const token =
    overrides.token || requireEnv("NYALTX_GOVERNANCE_TOKEN_ADDRESS");
  const governance = deployer.address;

  if (!token) {
    throw new Error("Missing token address for Treasury deployment");
  }

  console.log("====================================================");
  console.log(`[${network.name}] Deploying Treasury`);
  console.log(`Deployer:   ${deployer.address}`);
  console.log(`Token:     ${token}`);
  console.log(`Governance: ${governance}`);

  const TreasuryFactory = await ethers.getContractFactory("Treasury");
  const treasury = await TreasuryFactory.deploy(token, governance);
  await treasury.waitForDeployment();

  const treasuryAddress = await treasury.getAddress();
  console.log(`Treasury deployed at ${treasuryAddress}`);
  console.log("====================================================\n");

  saveDeployment(network.name, {
    contractName: "Treasury",
    address: treasuryAddress,
    deployer: deployer.address,
    token,
    governance,
    transactionHash: treasury.deploymentTransaction().hash,
  });

  return treasury;
}

module.exports = {
  deployTreasury,
};

if (require.main === module) {
  deployTreasury()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
