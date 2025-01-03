import { contracts } from "../contracts";
import { ethers } from "ethers";

// Account #1 (Portfolio Manager) private key
const PORTFOLIO_MANAGER_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

interface PortfolioValue {
  totalValue: string;
  fundValues: {
    tokenAddress: string;
    symbol: string;
    balance: string;
    value: string;
  }[];
}

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
      console.log("Starting deposit process...");
      const investorSigner = await contracts.provider.getSigner(investor);

      // Log initial balances
      const initialUsdcBalance = await contracts.fundTokens.usdc.balanceOf(
        investor
      );
      console.log(
        "Initial USDC balance:",
        ethers.formatUnits(initialUsdcBalance, 6)
      );

      // Get portfolio value before deposit
      const beforeValue = await this.getPortfolioValue(investor);
      console.log("Portfolio value before deposit:", beforeValue);

      // Approve USDC spend
      console.log("Approving USDC spend...");
      const usdcWithInvestor =
        contracts.fundTokens.usdc.connect(investorSigner);
      const approveTx = await usdcWithInvestor.approve(
        await contracts.investorPortfolioManager.getAddress(),
        amount
      );
      await approveTx.wait();
      console.log("✅ USDC spend approved");

      // Deposit
      console.log("Depositing USDC...");
      const portfolioManager =
        contracts.investorPortfolioManager.connect(investorSigner);
      const tx = await portfolioManager.deposit(amount);
      const receipt = await tx.wait();
      console.log("✅ Deposit transaction confirmed");

      // Log final balances
      const finalUsdcBalance = await contracts.fundTokens.usdc.balanceOf(
        investor
      );
      console.log(
        "Final USDC balance:",
        ethers.formatUnits(finalUsdcBalance, 6)
      );

      const afterValue = await this.getPortfolioValue(investor);
      console.log("Portfolio value after deposit:", afterValue);

      return receipt;
    } catch (error: any) {
      console.error("❌ Deposit failed:", error);
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
      const portfolioManagerSigner = new ethers.Wallet(
        PORTFOLIO_MANAGER_KEY,
        contracts.provider
      );

      // First approve all tokens for rebalancing
      const investor = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Account #2
      const investorSigner = await contracts.provider.getSigner(investor);

      console.log("Approving tokens for rebalancing...");
      for (const tokenAddress of fundAddresses) {
        const token = new ethers.Contract(
          tokenAddress,
          ["function approve(address,uint256)"],
          investorSigner
        );

        const approveTx = await token.approve(
          await contracts.investorPortfolioManager.getAddress(),
          ethers.MaxUint256
        );
        await approveTx.wait(); // Wait for each approval
      }
      console.log("✅ Tokens approved");

      // Wait a bit to ensure nonce is updated
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update model portfolio
      console.log("Updating model portfolio...");
      const modelManager = contracts.modelPortfolioManager.connect(
        portfolioManagerSigner
      );
      const tx = await modelManager.updateModelPortfolio(
        portfolioId,
        fundAddresses,
        weights
      );
      await tx.wait();
      console.log("✅ Model portfolio updated successfully");

      // Wait again before rebalancing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Rebalance with fresh connection
      const investorManager = contracts.investorPortfolioManager.connect(
        new ethers.Wallet(PORTFOLIO_MANAGER_KEY, contracts.provider)
      );

      console.log("Triggering manual rebalance...");
      const rebalanceTx = await investorManager.rebalancePortfolio(investor);
      await rebalanceTx.wait();
      console.log("✅ Portfolio rebalanced");

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

  async getPortfolioValue(investor: string): Promise<PortfolioValue> {
    try {
      // Get total value from contract
      const totalValue =
        await contracts.investorPortfolioManager.getPortfolioValue(investor);

      // Get investor's portfolio ID
      const portfolioId =
        await contracts.investorPortfolioManager.getInvestorPortfolio(investor);

      // Get model portfolio to know which tokens to check
      const modelPortfolio =
        await contracts.modelPortfolioManager.getModelPortfolio(portfolioId);

      // Get individual fund values
      const fundValues = await Promise.all(
        modelPortfolio.map(async (allocation) => {
          const token = new ethers.Contract(
            allocation.tokenAddress,
            [
              "function symbol() view returns (string)",
              "function balanceOf(address) view returns (uint256)",
            ],
            contracts.provider
          );

          const balance = await token.balanceOf(investor);

          return {
            tokenAddress: allocation.tokenAddress,
            symbol: await token.symbol(),
            balance: ethers.formatUnits(balance, 6),
            value: ethers.formatUnits(balance, 6), // Assuming 1:1 price with USD
          };
        })
      );

      return {
        totalValue: ethers.formatUnits(totalValue, 6),
        fundValues,
      };
    } catch (error: any) {
      throw new Error(`Failed to get portfolio value: ${error.message}`);
    }
  }
}
