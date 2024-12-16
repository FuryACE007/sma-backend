import { contracts } from "../contracts";
import { ethers } from "ethers";

export class PortfolioService {
  async createModelPortfolio(fundAddresses: string[], weights: number[]) {
    try {
      const tx = await contracts.modelPortfolioManager.createModelPortfolio(
        fundAddresses,
        weights,
      );
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction failed");
      const event = receipt.logs[0] as ethers.EventLog;
      return event.args[0];
    } catch (error: any) {
      throw new Error(`Failed to create model portfolio: ${error.message}`);
    }
  }

  async assignPortfolio(
    investor: string,
    portfolioId: number,
    stablecoin: string,
  ) {
    try {
      const tx = await contracts.investorPortfolioManager.assignModelPortfolio(
        investor,
        portfolioId,
        stablecoin,
      );
      await tx.wait();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to assign portfolio: ${error.message}`);
    }
  }

  async deposit(investor: string, amount: string) {
    try {
      // First approve the transfer
      const tx1 = await contracts.usdcToken.approve(
        await contracts.investorPortfolioManager.getAddress(),
        amount,
      );
      await tx1.wait();

      // Then deposit
      const signer = await contracts.provider.getSigner(investor);
      const tx2 = await contracts.investorPortfolioManager
        .connect(signer)
        .deposit(amount);
      await tx2.wait();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to deposit: ${error.message}`);
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

  async updateModelPortfolio(portfolioId: number, fundAddresses: string[], weights: number[]) {
    try {
      const tx = await contracts.modelPortfolioManager.updateModelPortfolio(
        portfolioId,
        fundAddresses,
        weights
      );
      await tx.wait();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to update model portfolio: ${error.message}`);
    }
  }

  async getModelPortfolio(portfolioId: number) {
    try {
      const portfolio = await contracts.modelPortfolioManager.getModelPortfolio(portfolioId);
      return portfolio;
    } catch (error: any) {
      throw new Error(`Failed to get model portfolio: ${error.message}`);
    }
  }

  async getPortfolioValue(investor: string) {
    try {
      const value =
        await contracts.investorPortfolioManager.getPortfolioValue(investor);
      return ethers.formatUnits(value, 6); // Assuming USDC with 6 decimals
    } catch (error: any) {
      throw new Error(`Failed to get portfolio value: ${error.message}`);
    }
  }
}
