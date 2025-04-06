import { AppDataSource } from "../database/database";
import { PortfolioBalance } from "../database/entities/portfolio-balance.entity";
import { PortfolioValue } from "./portfolio.service";

export class DatabaseService {
  private portfolioBalanceRepository = AppDataSource.getRepository(PortfolioBalance);

  async savePortfolioBalance(
    investor: string,
    portfolioId: number,
    portfolioValue: PortfolioValue,
    transactionType: "deposit" | "withdraw" | "rebalance" | "update"
  ): Promise<PortfolioBalance> {
    const portfolioBalance = new PortfolioBalance();
    portfolioBalance.investor = investor;
    portfolioBalance.portfolioId = portfolioId;
    portfolioBalance.balanceData = JSON.stringify(portfolioValue);
    portfolioBalance.totalValue = parseFloat(portfolioValue.totalValue);
    portfolioBalance.transactionType = transactionType;

    return this.portfolioBalanceRepository.save(portfolioBalance);
  }

  async getPortfolioBalanceHistory(investor: string): Promise<PortfolioBalance[]> {
    return this.portfolioBalanceRepository.find({
      where: { investor },
      order: { timestamp: "DESC" },
    });
  }

  async getLatestPortfolioBalance(investor: string): Promise<PortfolioBalance | null> {
    return this.portfolioBalanceRepository.findOne({
      where: { investor },
      order: { timestamp: "DESC" },
    });
  }

  async getUniqueInvestors(): Promise<string[]> {
    const result = await this.portfolioBalanceRepository
      .createQueryBuilder("balance")
      .select("DISTINCT balance.investor", "investor")
      .getRawMany();
    
    return result.map(item => item.investor);
  }
}