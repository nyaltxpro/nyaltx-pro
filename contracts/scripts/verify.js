const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Starting contract verification...\n");

  const network = hre.network.name;
  const deploymentFile = path.join(__dirname, `../deployments/${network}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found:", deploymentFile);
    console.log("Please run deployment script first.");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contracts = deploymentData.verificationData.contracts;

  console.log("📋 Verification Configuration:");
  console.log("- Network:", network);
  console.log("- Contracts to verify:", Object.keys(contracts).length);
  console.log("");

  for (const [contractName, contractData] of Object.entries(contracts)) {
    try {
      console.log(`🔍 Verifying ${contractName}...`);
      console.log(`- Address: ${contractData.address}`);
      console.log(`- Constructor args:`, contractData.constructorArgs);

      await run("verify:verify", {
        address: contractData.address,
        constructorArguments: contractData.constructorArgs,
      });

      console.log(`✅ ${contractName} verified successfully\n`);
    } catch (error) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log(`✅ ${contractName} already verified\n`);
      } else {
        console.error(`❌ Failed to verify ${contractName}:`, error.message);
        console.log("");
      }
    }
  }

  console.log("🎉 Verification process completed!");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
