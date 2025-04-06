import { contracts } from "../contracts";
import { ethers } from "ethers";

// Account #1 (Portfolio Manager) private key
const PORTFOLIO_MANAGER_KEY = process.env.PORTFOLIO_MANAGER_KEY || "";

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
  constructor() {
    // No need for CashService anymore
  }

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

  async assignPortfolio(investor: string, portfolioId: number) {
    try {
      console.log("Assigning portfolio...");

      // Use Account #1 (portfolio manager) who owns both contracts
      const portfolioManagerSigner = new ethers.Wallet(
        PORTFOLIO_MANAGER_KEY,
        contracts.provider
      );

      console.log("Assigning in InvestorPortfolioManager...");
      const investorManager = contracts.investorPortfolioManager.connect(
        portfolioManagerSigner
      );
      const tx = await investorManager.assignModelPortfolio(
        investor,
        portfolioId
      );
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction failed");

      console.log("✅ Portfolio assigned in InvestorPortfolioManager");
      console.log("✅ Portfolio assigned successfully");

      return receipt;
    } catch (error: any) {
      console.error("❌ Failed to assign portfolio:", error);
      throw new Error(`Failed to assign portfolio: ${error.message}`);
    }
  }

  async deposit(investor: string, amountInUSD: string) {
    try {
      console.log("Starting deposit process...");

      // Convert USD amount to token amount (6 decimals)
      const amount = ethers.parseUnits(amountInUSD, 6).toString();
      console.log("Converting $" + amountInUSD + " to " + amount + " tokens");

      // Get portfolio details
      const portfolioId =
        await contracts.investorPortfolioManager.getInvestorPortfolio(investor);
      const investorSigner = await contracts.provider.getSigner(investor);

      // Trigger on-chain deposit for full amount
      const portfolioManager =
        contracts.investorPortfolioManager.connect(investorSigner);
      const tx = await portfolioManager.deposit(amount);
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error("Transaction failed: no receipt received");
      }

      const afterValue = await this.getPortfolioValue(investor);
      console.log("Portfolio value after deposit:", afterValue);

      return receipt;
    } catch (error: any) {
      console.error("❌ Deposit failed:", error);
      throw new Error(`Failed to deposit: ${error.message}`);
    }
  }

  async getPortfolioValue(investor: string): Promise<PortfolioValue> {
    try {
      // Get portfolio details
      const portfolioId =
        await contracts.investorPortfolioManager.getInvestorPortfolio(investor);
      const modelPortfolio =
        await contracts.modelPortfolioManager.getModelPortfolio(portfolioId);

      // Get individual fund values
      const fundValues = await Promise.all(
        modelPortfolio.map(async (allocation) => {
          // For all tokens, get balance from contract
          const token = new ethers.Contract(
            allocation.tokenAddress,
            [
              "function symbol() view returns (string)",
              "function balanceOf(address) view returns (uint256)",
            ],
            contracts.provider
          );

          const balance = await token.balanceOf(investor);
          const balanceBigInt = BigInt(balance.toString());

          return {
            tokenAddress: allocation.tokenAddress,
            symbol: await token.symbol(),
            balance: balanceBigInt.toString(),
            value: balanceBigInt.toString(),
          };
        })
      );

      // Calculate total value
      const totalValue = fundValues.reduce(
        (sum, fund) => sum + BigInt(fund.value),
        BigInt(0)
      );

      // Format all values with 6 decimals
      return {
        totalValue: ethers.formatUnits(totalValue, 6),
        fundValues: fundValues.map((fund) => ({
          tokenAddress: fund.tokenAddress,
          symbol: fund.symbol,
          balance: ethers.formatUnits(BigInt(fund.balance), 6),
          value: ethers.formatUnits(BigInt(fund.value), 6),
        })),
      };
    } catch (error: any) {
      throw new Error(`Failed to get portfolio value: ${error.message}`);
    }
  }

  async withdraw(investor: string, amountInUSD: string) {
    try {
      console.log("Starting withdrawal process...");

      // Convert USD amount to token amount (6 decimals)
      const amount = ethers.parseUnits(amountInUSD, 6).toString();
      console.log("Converting $" + amountInUSD + " to " + amount + " tokens");

      const investorSigner = await contracts.provider.getSigner(investor);

      // Step 1: Check if withdrawal amount is available
      const currentValue = await this.getPortfolioValue(investor);
      console.log("Portfolio value before withdrawal:", currentValue);

      // Step 2: Trigger on-chain withdrawal
      const portfolioManager =
        contracts.investorPortfolioManager.connect(investorSigner);
      const tx = await portfolioManager.withdraw(amount);
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error("Transaction failed: no receipt received");
      }

      const afterValue = await this.getPortfolioValue(investor);
      console.log("Portfolio value after withdrawal:", afterValue);

      return receipt;
    } catch (error: any) {
      console.error("❌ Withdrawal failed:", error);
      throw new Error(`Failed to withdraw: ${error.message}`);
    }
  }

  async getModelPortfolio(portfolioId: number) {
    try {
      const modelPortfolio = await contracts.modelPortfolioManager.getModelPortfolio(portfolioId);
      
      // Format the response to be more readable
      const formattedPortfolio = await Promise.all(
        modelPortfolio.map(async (allocation) => {
          const token = new ethers.Contract(
            allocation.tokenAddress,
            ["function symbol() view returns (string)"],
            contracts.provider
          );
          
          let symbol;
          try {
            symbol = await token.symbol();
          } catch (error) {
            symbol = "Unknown";
          }
          
          return {
            tokenAddress: allocation.tokenAddress,
            symbol,
            weight: Number(allocation.targetWeight) / 100 // Convert basis points to percentage
          };
        })
      );
      
      return formattedPortfolio;
    } catch (error: any) {
      console.error("❌ Failed to get model portfolio:", error);
      throw new Error(`Failed to get model portfolio: ${error.message}`);
    }
  }

  async updateModelPortfolio(portfolioId: number, fundAddresses: string[], weights: number[]) {
    try {
      // Connect as portfolio manager (Account #1) since they own the contract
      const portfolioManagerSigner = new ethers.Wallet(
        PORTFOLIO_MANAGER_KEY,
        contracts.provider
      );
  
      const modelManager = contracts.modelPortfolioManager.connect(
        portfolioManagerSigner
      );
      const tx = await modelManager.updateModelPortfolio(
        portfolioId,
        fundAddresses,
        weights
      );
      const receipt = await tx.wait();
  
      if (!receipt) throw new Error("Transaction failed");
      console.log("✅ Model portfolio updated");
      return receipt;
    } catch (error: any) {
      console.error("❌ Failed to update model portfolio:", error);
      throw new Error(`Failed to update model portfolio: ${error.message}`);
    }
  }

  async rebalancePortfolio(investor: string) {
    try {
      console.log("Manually rebalancing portfolio for investor:", investor);
      
      // Connect as portfolio manager (Account #1) since they own the contract
      const portfolioManagerSigner = new ethers.Wallet(
        PORTFOLIO_MANAGER_KEY,
        contracts.provider
      );
  
      const investorManager = contracts.investorPortfolioManager.connect(
        portfolioManagerSigner
      );
      
      const tx = await investorManager.rebalancePortfolio(investor);
      const receipt = await tx.wait();
      
      if (!receipt) throw new Error("Transaction failed");
      console.log("✅ Portfolio rebalanced successfully");
      
      const afterValue = await this.getPortfolioValue(investor);
      console.log("Portfolio value after rebalance:", afterValue);
      
      return receipt;
    } catch (error: any) {
      console.error("❌ Failed to rebalance portfolio:", error);
      throw new Error(`Failed to rebalance portfolio: ${error.message}`);
    }
  }
}
