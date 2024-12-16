import app from "./app";
import { config } from "./config";
import { contracts } from "./contracts";

// Verify contract connections
async function verifyContracts() {
  try {
    // Test contract connections by calling view functions
    await contracts.modelPortfolioManager.linkedManagers(
      await contracts.investorPortfolioManager.getAddress()
    );
    console.log("✅ Contract connections verified");
  } catch (error) {
    console.error("❌ Contract connection failed:", error);
    process.exit(1);
  }
}

async function startServer() {
  await verifyContracts();

  app.listen(config.PORT, async () => {
    console.log(`Server running on port ${config.PORT}`);
    console.log("Connected to contracts:");
    console.log(
      "- Model Portfolio Manager:",
      await contracts.modelPortfolioManager.getAddress()
    );
    console.log(
      "- Investor Portfolio Manager:",
      await contracts.investorPortfolioManager.getAddress()
    );
    console.log("- USDC Token:", await contracts.usdcToken.getAddress());
    console.log("- Real Estate Token:", await contracts.realEstateToken.getAddress());
    console.log(
      "- Private Equity Token:",
      await contracts.privateEquityToken.getAddress()
    );
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
