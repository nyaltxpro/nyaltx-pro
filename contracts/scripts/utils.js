require("dotenv").config();
const fs = require("fs");
const path = require("path");

function getAddressFromEnv(key, fallback) {
  const value = process.env[key];
  if (value && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function parseAddressListFromEnv(key, fallback = []) {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

function parseBigIntFromEnv(key, defaultValue) {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    return defaultValue;
  }
  return BigInt(value);
}

function saveDeployment(networkName, payload) {
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filePath = path.join(
    deploymentsDir,
    `${networkName || "unknown"}-deployment.json`
  );

  const data = {
    generatedAt: new Date().toISOString(),
    network: networkName || "unknown",
    ...payload,
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

module.exports = {
  getAddressFromEnv,
  parseAddressListFromEnv,
  requireEnv,
  parseBigIntFromEnv,
  saveDeployment,
};
