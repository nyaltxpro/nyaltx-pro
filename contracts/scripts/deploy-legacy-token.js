const hre = require("hardhat");
const { getAddressFromEnv, requireEnv } = require("./utils");

async function deployLegacyToken(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const name = overrides.name || process.env.LEGACY_TOKEN_NAME || "Legacy NYALTX";
  const symbol = overrides.symbol || process.env.LEGACY_TOKEN_SYMBOL || "lNYAX";
  const owner = overrides.owner || getAddressFromEnv("LEGACY_TOKEN_OWNER", deployer.address);
  const initialSupplyRaw = overrides.initialSupply || process.env.LEGACY_TOKEN_INITIAL_SUPPLY || "0";

  if (!owner) {
    throw new Error("Missing legacy token owner address");
  }

  const initialSupply = ethers.parseUnits(initialSupplyRaw, 18);

  console.log("====================================================");
  console.log(`[${network.name}] Deploying LegacyToken`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Owner: ${owner}`);
  console.log(`Name/Symbol: ${name}/${symbol}`);
  console.log(`Initial Supply (raw): ${initialSupplyRaw}`);

  const factory = await ethers.getContractFactory("LegacyToken");
  const contract = await factory.deploy(name, symbol, owner, initialSupply);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`LegacyToken deployed at ${address}`);
  console.log("====================================================\n");

  return contract;
}

module.exports = {
  deployLegacyToken,
};

if (require.main === module) {
  deployLegacyToken()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
