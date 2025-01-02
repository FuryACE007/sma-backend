import { contracts } from "../contracts";
import { ethers } from "ethers";

// Account #1 (Portfolio Manager) private key
const PORTFOLIO_MANAGER_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

export class PortfolioService {
  async createModelPortfolio(fundAddresses: string[], weights: number[]) {
    try {
      // Connect as portfolio manager (Account #1) since they own the contract
      const portfolioManagerSigner = new ethers.Wallet(
        PORTFOLIO_MANAGER_KEY,
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

      // Use Account #1 (portfolio manager) who owns both contracts
      const portfolioManagerSigner = new ethers.Wallet(
        PORTFOLIO_MANAGER_KEY,
        contracts.provider
      );

      // First assign in InvestorPortfolioManager
      const investorManager = contracts.investorPortfolioManager.connect(
        portfolioManagerSigner
      );

      console.log("Assigning in InvestorPortfolioManager...");
      const assignTx = await investorManager.assignModelPortfolio(
        investor,
        portfolioId,
        stablecoin
      );
      await assignTx.wait();
      console.log("✅ Portfolio assigned in InvestorPortfolioManager");

      // The ModelPortfolioManager.assignInvestor will be called automatically
      // by InvestorPortfolioManager since it's the owner
      console.log("✅ Portfolio assigned successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Portfolio assignment failed:", error);
      throw new Error(`Failed to assign portfolio: ${error.message}`);
    }
  }

  async deposit(investor: string, amount: string) {
    try {
      const investorSigner = await contracts.provider.getSigner(investor);

      // Approve USDC spend
      const usdcWithInvestor =
        contracts.fundTokens.usdc.connect(investorSigner);
      const approveTx = await usdcWithInvestor.approve(
        await contracts.investorPortfolioManager.getAddress(),
        amount
      );
      await approveTx.wait();

      // Deposit
      const portfolioManager =
        contracts.investorPortfolioManager.connect(investorSigner);
      const tx = await portfolioManager.deposit(amount);
      const receipt = await tx.wait();

      return receipt;
    } catch (error: any) {
      throw new Error(`Failed to deposit: ${error.message}`);
    }
  }

  async withdraw(investor: string, amount: string) {
    try {
      const investorSigner = await contracts.provider.getSigner(investor);

      // Get investor's portfolio ID first
      const portfolioId = Number(
        await contracts.investorPortfolioManager.getInvestorPortfolio(investor)
      );

      // Get model portfolio using ID
      const portfolio = await this.getModelPortfolio(portfolioId);

      // First approve all fund tokens
      for (const allocation of portfolio) {
        const fundToken = new ethers.Contract(
          allocation.tokenAddress,
          ["function approve(address,uint256)"],
          investorSigner
        );
        await fundToken.approve(
          await contracts.investorPortfolioManager.getAddress(),
          ethers.MaxUint256
        );
      }

      // Then withdraw
      const portfolioManager =
        contracts.investorPortfolioManager.connect(investorSigner);
      const tx = await portfolioManager.withdraw(amount);
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
        PORTFOLIO_MANAGER_KEY,
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
