const hre = require("hardhat");
const { requireEnv, getAddressFromEnv, saveDeployment } = require("./utils");

async function deployTreasury(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const nyaxToken =
    overrides.nyaxToken || requireEnv("NYALTX_GOVERNANCE_TOKEN_ADDRESS");
  const multisig =
    overrides.multisig || requireEnv("TREASURY_MULTISIG_ADDRESS");
  const owner =
    overrides.owner ||
    getAddressFromEnv("TREASURY_ADMIN_ADDRESS", deployer.address);

  console.log("====================================================");
  console.log(`[${network.name}] Deploying Treasury`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`NYAX Token: ${nyaxToken}`);
  console.log(`Multisig:   ${multisig}`);
  console.log(`Owner:      ${owner}`);

  const TreasuryFactory = await ethers.getContractFactory("Treasury");
  const treasury = await TreasuryFactory.deploy(nyaxToken, multisig, owner);
  await treasury.waitForDeployment();

  const treasuryAddress = await treasury.getAddress();
  console.log(`Treasury deployed at ${treasuryAddress}`);
  console.log("====================================================\n");

  saveDeployment(network.name, {
    treasury: treasuryAddress,
    nyaxToken,
    multisig,
    owner,
    deployer: deployer.address,
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
