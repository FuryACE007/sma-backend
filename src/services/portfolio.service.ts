import { contracts } from "../contracts";
import { ethers } from "ethers";
import { CashService } from './cash.service';

// Account #1 (Portfolio Manager) private key
const PORTFOLIO_MANAGER_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

interface PortfolioValue {
  totalValue: string;
  cashBalance: string; // Add cash balance
  fundValues: {
    tokenAddress: string;
    symbol: string;
    balance: string;
    value: string;
  }[];
}

export class PortfolioService {
  private cashService: CashService;

  constructor() {
    this.cashService = new CashService();
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

  async assignPortfolio(
    investor: string,
    portfolioId: number
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
        portfolioId
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
      
      // Step 1: Store initial cash deposit in balances.json
      await this.cashService.updateCashBalance(investor, Number(amount));
      console.log("💰 Initial cash deposit stored:", amount);
    
      // Step 2: Get portfolio details and calculate allocations
      const portfolioId = await contracts.investorPortfolioManager.getInvestorPortfolio(investor);
      const investorSigner = await contracts.provider.getSigner(investor);
      
      // Step 3: Trigger on-chain deposit for full amount
      const portfolioManager = contracts.investorPortfolioManager.connect(investorSigner);
      const tx = await portfolioManager.deposit(amount);
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error("Transaction failed: no receipt received");
      }
    
      // Step 4: Handle cash balance update based on actual Cash tokens minted
      const cashEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id("CashBalanceUpdated(address,uint256,bool)")
      );
      
      if (cashEvent) {
        const abiCoder = new ethers.AbiCoder();
        const [, cashTokenAmount, isIncrease] = abiCoder.decode(
          ["uint256", "bool"],
          cashEvent.data
        );
        
        // Step 5: Update balances.json to match Cash token amount
        // This ensures our off-chain cash balance matches on-chain Cash tokens
        const currentBalance = await this.cashService.getCashBalance(investor);
        const targetBalance = Number(cashTokenAmount);
        const adjustment = targetBalance - currentBalance;
        
        await this.cashService.updateCashBalance(investor, adjustment);
        console.log("💰 Cash balance adjusted to match Cash tokens:", targetBalance);
      }
    
      const afterValue = await this.getPortfolioValue(investor);
      console.log("Portfolio value after deposit:", afterValue);
    
      return receipt;
    } catch (error: any) {
      console.error("❌ Deposit failed:", error);
      throw new Error(`Failed to deposit: ${error.message}`);
    }
  }

  // Update getPortfolioValue to include cash balance
  async getPortfolioValue(investor: string): Promise<PortfolioValue> {
    try {
      const [onChainValue, cashBalance] = await Promise.all([
        contracts.investorPortfolioManager.getPortfolioValue(investor),
        this.cashService.getCashBalance(investor)
      ]);

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
        totalValue: ethers.formatUnits(onChainValue + BigInt(cashBalance), 6),
        cashBalance: ethers.formatUnits(cashBalance, 6),
        fundValues,
      };
    } catch (error: any) {
      throw new Error(`Failed to get portfolio value: ${error.message}`);
    }
  }

  async getModelPortfolio(portfolioId: number) {
    try {
      const modelPortfolio = await contracts.modelPortfolioManager.getModelPortfolio(portfolioId);
      return modelPortfolio;
    } catch (error: any) {
      console.error("❌ Failed to get model portfolio:", error);
      throw new Error(`Failed to get model portfolio: ${error.message}`);
    }
  }

  async updateModelPortfolio(portfolioId: number, fundAddresses: string[], weights: number[]) {
    try {
      const portfolioManagerSigner = new ethers.Wallet(
        PORTFOLIO_MANAGER_KEY,
        contracts.provider
      );

      const modelManager = contracts.modelPortfolioManager.connect(portfolioManagerSigner);
      const tx = await modelManager.updateModelPortfolio(portfolioId, fundAddresses, weights);
      const receipt = await tx.wait();
      
      if (!receipt) throw new Error("Transaction failed");
      
      console.log("✅ Model portfolio updated");
      return receipt;
    } catch (error: any) {
      console.error("❌ Failed to update model portfolio:", error);
      throw new Error(`Failed to update model portfolio: ${error.message}`);
    }
  }

  async withdraw(investor: string, amount: string) {
    try {
      console.log("Starting withdrawal process...");
      const investorSigner = await contracts.provider.getSigner(investor);

      // Step 1: Check if withdrawal amount is available
      const currentValue = await this.getPortfolioValue(investor);
      console.log("Portfolio value before withdrawal:", currentValue);
      
      // Step 2: Trigger on-chain withdrawal
      const portfolioManager = contracts.investorPortfolioManager.connect(investorSigner);
      const tx = await portfolioManager.withdraw(amount);
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error("Transaction failed: no receipt received");
      }

      // Step 3: Handle cash balance update based on actual Cash tokens burned
      const cashEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id("CashBalanceUpdated(address,uint256,bool)")
      );
      
      if (cashEvent) {
        const abiCoder = new ethers.AbiCoder();
        const [, cashTokenAmount, isIncrease] = abiCoder.decode(
          ["uint256", "bool"],
          cashEvent.data
        );
        
        // Step 4: Update balances.json to match remaining Cash tokens
        const currentBalance = await this.cashService.getCashBalance(investor);
        const targetBalance = currentBalance - Number(cashTokenAmount);
        
        await this.cashService.updateCashBalance(investor, -Number(cashTokenAmount));
        console.log("💰 Cash balance updated after withdrawal:", targetBalance);
      }

      // Step 5: Add withdrawn amount back to cash balance
      await this.cashService.updateCashBalance(investor, Number(amount));
      console.log("💰 Withdrawn amount added to cash balance:", amount);

      const afterValue = await this.getPortfolioValue(investor);
      console.log("Portfolio value after withdrawal:", afterValue);

      return receipt;
    } catch (error: any) {
      console.error("❌ Withdrawal failed:", error);
      throw new Error(`Failed to withdraw: ${error.message}`);
    }
  }
}
