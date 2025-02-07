import app from "./app";
import { config } from "./config";
import { contracts } from "./contracts";

// Verify contract connections
async function verifyContracts() {
  try {
    // Test contract connections by calling view functions
    await contracts.modelPortfolioManager.investorPortfolioManager();
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

    // Log test accounts
    console.log("\nTest Accounts:");
    console.log(
      "Account #0 (Deployer):",
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
    console.log(
      "Account #1 (Portfolio Manager):",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );
    console.log(
      "Account #2 (Investor):",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    );

    console.log("\nConnected to contracts:");
    console.log(
      "- Model Portfolio Manager:",
      await contracts.modelPortfolioManager.getAddress()
    );
    console.log(
      "- Investor Portfolio Manager:",
      await contracts.investorPortfolioManager.getAddress()
    );
    console.log("- Cash Token:", await contracts.fundTokens.cash.getAddress());
    console.log(
      "- Real Estate Token:",
      await contracts.fundTokens.realEstate.getAddress()
    );
    console.log(
      "- Private Equity Token:",
      await contracts.fundTokens.privateEquity.getAddress()
    );
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
