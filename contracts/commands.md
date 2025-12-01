# 1 Legacy Token
npx hardhat run scripts/deploy-legacy-token.js --network sepolia
# 2 Treasury Multisig
npx hardhat run scripts/deploy-treasury-multisig.js --network sepolia
# 3 Timelock
npx hardhat run scripts/deploy-nyax-timelock.js --network sepolia
# 4 Governor
npx hardhat run scripts/deploy-nyax-governor.js --network sepolia
# 5 Legacy Migration Vault
npx hardhat run scripts/deploy-legacy-migration-vault.js --network sepolia
# 6 NYALTX Staking
npx hardhat run scripts/deploy-nyaltx-staking.js --network sepolia
# 7 Treasury Bridge
npx hardhat run scripts/deploy-treasury-bridge.js --network sepolia