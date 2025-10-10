import WebSocket from "ws";

const TOKEN_ADDRESS = "4xYrnBTdACYetkJEAP4gj4bLFfKw9YYv1nvSWyS1pump";
const WS_URL = "wss://pumpportal.fun/api/data";

const ws = new WebSocket(WS_URL);

ws.on("open", () => {
  console.log("✅ Connected to Pump.fun WebSocket");

  // Subscribe to real-time trade updates for your token
  const payload = {
    method: "subscribeTokenTrade",
    keys: [TOKEN_ADDRESS],
  };

  ws.send(JSON.stringify(payload));
  console.log(`📡 Subscribed to live trades for token: ${TOKEN_ADDRESS}`);
});

ws.on("message", (message) => {
  try {
    const data = JSON.parse(message);

    // Only log trade data for this token
    if (data?.type === "tokenTrade" && data?.token === TOKEN_ADDRESS) {
      const { price_sol, price_usd, volume_24h, liquidity, buyer, seller } = data;

      console.log("\n💱 New Trade Detected:");
      console.log(`   💰 Price (SOL): ${price_sol}`);
      console.log(`   💵 Price (USD): ${price_usd}`);
      console.log(`   📊 24h Volume: ${volume_24h}`);
      console.log(`   💧 Liquidity: ${liquidity}`);
      console.log(`   👤 Buyer: ${buyer}`);
      console.log(`   🧾 Seller: ${seller}`);
      console.log("──────────────────────────────");
    }
  } catch (err) {
    console.error("Error parsing message:", err);
  }
});

ws.on("close", () => {
  console.log("❌ WebSocket disconnected");
});

ws.on("error", (err) => {
  console.error("⚠️ WebSocket error:", err);
});
