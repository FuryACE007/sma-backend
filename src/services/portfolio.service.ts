import { contracts } from "../contracts";
import { ethers } from "ethers";

export class PortfolioService {
  async createModelPortfolio(fundAddresses: string[], weights: number[]) {
    try {
      // Connect as portfolio manager (Account #1) since they own the contract
      const portfolioManagerSigner = new ethers.Wallet(
        // Account #1's private key
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        contracts.provider
      );

      // Connect model portfolio manager with correct signer
      const modelManager = contracts.modelPortfolioManager.connect(
        portfolioManagerSigner
      );

      console.log("Creating model portfolio...");
      const tx = await modelManager.createModelPortfolio(
        fundAddresses,
        weights
      );
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction failed");

      const event = receipt.logs[0] as ethers.EventLog;
      const portfolioId = event.args[0];
      console.log(
        "✅ Model portfolio created with ID:",
        portfolioId.toString()
      );

      return portfolioId;
    } catch (error: any) {
      console.error("❌ Failed to create model portfolio:", error);
      throw new Error(`Failed to create model portfolio: ${error.message}`);
    }
  }

  async assignPortfolio(
    investor: string,
    portfolioId: number,
    stablecoin: string
  ) {
    try {
      console.log("Assigning portfolio...");
      // Connect as portfolio manager (Account #1) since they own the manager
      const portfolioManagerSigner = new ethers.Wallet(
        // Account #1's private key
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        contracts.provider
      );

      // Connect investor portfolio manager with correct signer
      const investorManager = contracts.investorPortfolioManager.connect(
        portfolioManagerSigner
      );

      const tx = await investorManager.assignModelPortfolio(
        investor,
        portfolioId,
        stablecoin
      );
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction failed");
      console.log("✅ Portfolio assigned successfully");

      return true;
    } catch (error: any) {
      console.error("❌ Portfolio assignment failed:", error);
      throw new Error(`Failed to assign portfolio: ${error.message}`);
    }
  }

  async deposit(investor: string, amount: string) {
    try {
      // Get the deployer signer (Account #0) who has the initial USDC supply
      const deployerSigner = new ethers.Wallet(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        contracts.provider
      );

      // Connect USDC token with deployer signer
      const usdcWithDeployer = contracts.usdcToken.connect(deployerSigner);

      // Transfer USDC from deployer to investor instead of minting
      console.log("Transferring USDC to investor...");
      const transferTx = await usdcWithDeployer.transfer(investor, amount);
      const transferReceipt = await transferTx.wait();
      if (!transferReceipt) throw new Error("Transfer transaction failed");
      console.log("✅ Transferred USDC to investor");

      // Create investor signer (Account #2)
      const investorSigner = new ethers.Wallet(
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        contracts.provider
      );

      // Connect USDC token with investor signer
      const usdcWithSigner = contracts.usdcToken.connect(investorSigner);

      // Approve spending
      console.log("Approving USDC spend...");
      const approveTx = await usdcWithSigner.approve(
        await contracts.investorPortfolioManager.getAddress(),
        amount
      );
      const approveReceipt = await approveTx.wait();
      if (!approveReceipt) throw new Error("Approve transaction failed");
      console.log("✅ Approved USDC spend");

      // Connect portfolio manager with investor signer
      const portfolioManagerWithSigner =
        contracts.investorPortfolioManager.connect(investorSigner);

      // Deposit using investor's signer
      console.log("Depositing as investor...");
      const depositTx = await portfolioManagerWithSigner.deposit(amount);
      const depositReceipt = await depositTx.wait();
      if (!depositReceipt) throw new Error("Deposit transaction failed");
      console.log("✅ Deposit successful");

      return depositReceipt;
    } catch (error) {
      console.error("❌ Deposit failed:", error);
      throw error;
    }
  }

  async withdraw(investor: string, amount: string) {
    try {
      const signer = await contracts.provider.getSigner(investor);
      const tx = await contracts.investorPortfolioManager
        .connect(signer)
        .withdraw(amount);
      await tx.wait();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to withdraw: ${error.message}`);
    }
  }

  async updateModelPortfolio(
    portfolioId: number,
    fundAddresses: string[],
    weights: number[]
  ) {
    try {
      // Connect as portfolio manager (Account #1) since they own the contract
      const portfolioManagerSigner = new ethers.Wallet(
        // Account #1's private key
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        contracts.provider
      );

      // Connect model portfolio manager with correct signer
      const modelManager = contracts.modelPortfolioManager.connect(
        portfolioManagerSigner
      );

      console.log("Updating model portfolio...");
      const tx = await modelManager.updateModelPortfolio(
        portfolioId,
        fundAddresses,
        weights
      );
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction failed");
      console.log("✅ Model portfolio updated successfully");

      return true;
    } catch (error: any) {
      console.error("❌ Failed to update model portfolio:", error);
      throw new Error(`Failed to update model portfolio: ${error.message}`);
    }
  }

  async getModelPortfolio(portfolioId: number) {
    try {
      const portfolio = await contracts.modelPortfolioManager.getModelPortfolio(
        portfolioId
      );
      return portfolio;
    } catch (error: any) {
      throw new Error(`Failed to get model portfolio: ${error.message}`);
    }
  }

  async getPortfolioValue(investor: string) {
    try {
      const value = await contracts.investorPortfolioManager.getPortfolioValue(
        investor
      );
      return ethers.formatUnits(value, 6); // Assuming USDC with 6 decimals
    } catch (error: any) {
      throw new Error(`Failed to get portfolio value: ${error.message}`);
    }
  }
}
