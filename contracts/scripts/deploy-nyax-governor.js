const hre = require("hardhat");
const { requireEnv, parseBigIntFromEnv, getAddressFromEnv } = require("./utils");

const sanitizeIntegerInput = (value, label) => {
  if (value === undefined || value === null) {
    throw new Error(`${label} is required`);
  }
  const cleaned = value.toString().trim();
  if (!/^\d+$/.test(cleaned)) {
    throw new Error(`${label} must be an unsigned integer, received "${value}"`);
  }
  return cleaned;
};

async function deployNyaxGovernor(overrides = {}) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const tokenAddress = overrides.token || requireEnv("GOVERNANCE_TOKEN_ADDRESS");
  const timelockAddress = overrides.timelock || requireEnv("TIMELOCK_ADDRESS");

  const votingDelayInput = overrides.votingDelay || process.env.GOVERNOR_VOTING_DELAY_BLOCKS || "1";
  const votingPeriodInput = overrides.votingPeriod || process.env.GOVERNOR_VOTING_PERIOD_BLOCKS || "50400";
  const proposalThresholdInput = overrides.proposalThreshold || process.env.GOVERNOR_PROPOSAL_THRESHOLD || "1000000";
  const quorumNumeratorInput =  4 

  const votingDelay = BigInt(sanitizeIntegerInput(votingDelayInput, "GOVERNOR_VOTING_DELAY_BLOCKS"));
  const votingPeriod = BigInt(sanitizeIntegerInput(votingPeriodInput, "GOVERNOR_VOTING_PERIOD_BLOCKS"));
  const proposalThreshold = sanitizeIntegerInput(proposalThresholdInput, "GOVERNOR_PROPOSAL_THRESHOLD");
  const quorumNumerator = BigInt(sanitizeIntegerInput(quorumNumeratorInput, "GOVERNOR_QUORUM_NUMERATOR"));

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
