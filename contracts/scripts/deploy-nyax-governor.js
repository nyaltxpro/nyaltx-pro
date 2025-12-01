const hre = require("hardhat");
const { requireEnv, parseBigIntFromEnv, getAddressFromEnv } = require("./utils");

async function deployNyaxGovernor(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const tokenAddress = overrides.token || requireEnv("GOVERNANCE_TOKEN_ADDRESS");
  const timelockAddress = overrides.timelock || requireEnv("TIMELOCK_ADDRESS");

  const votingDelay = overrides.votingDelay || process.env.GOVERNOR_VOTING_DELAY_BLOCKS || "1";
  const votingPeriod = overrides.votingPeriod || process.env.GOVERNOR_VOTING_PERIOD_BLOCKS || "50400";
  const proposalThreshold = overrides.proposalThreshold || process.env.GOVERNOR_PROPOSAL_THRESHOLD || "1000000";
  const quorumNumerator = overrides.quorumNumerator || process.env.GOVERNOR_QUORUM_NUMERATOR || "4";

  console.log("====================================================");
  console.log(`[${network.name}] Deploying NYAXGovernor`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Governance Token: ${tokenAddress}`);
  console.log(`Timelock: ${timelockAddress}`);
  console.log(`Voting Delay (blocks): ${votingDelay}`);
  console.log(`Voting Period (blocks): ${votingPeriod}`);
  console.log(`Proposal Threshold (votes): ${proposalThreshold}`);
  console.log(`Quorum Numerator (%): ${quorumNumerator}`);

  const factory = await ethers.getContractFactory("NYAXGovernor");
  const contract = await factory.deploy(
    tokenAddress,
    timelockAddress,
    votingDelay,
    votingPeriod,
    ethers.parseUnits(proposalThreshold, 18),
    quorumNumerator
  );
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`NYAXGovernor deployed at ${address}`);
  console.log("====================================================\n");

  return contract;
}

module.exports = {
  deployNyaxGovernor,
};

if (require.main === module) {
  deployNyaxGovernor()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
