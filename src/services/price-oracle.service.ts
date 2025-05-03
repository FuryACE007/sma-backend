interface AssetPrice {
  price: number;
  lastUpdated: Date;
}

export class PriceOracleService {
  private prices: Map<string, AssetPrice> = new Map();
  private readonly CASH_TOKEN_ADDRESS =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  constructor() {
    // Initialize with default prices (1 USD)
    this.initializeDefaultPrices();
  }

  private initializeDefaultPrices() {
    // CASH token always stays at $1
    this.prices.set(this.CASH_TOKEN_ADDRESS, {
      price: 1.0,
      lastUpdated: new Date(),
    });

    // Real Estate Token
    this.prices.set("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", {
      price: 1.0,
      lastUpdated: new Date(),
    });

    // Private Equity Token
    this.prices.set("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", {
      price: 1.0,
      lastUpdated: new Date(),
    });
  }

  // Get current price for a token
  public getPrice(tokenAddress: string): number {
    // If we don't have a price, return default $1
    if (!this.prices.has(tokenAddress)) {
      this.prices.set(tokenAddress, { price: 1.0, lastUpdated: new Date() });
    }

    return this.prices.get(tokenAddress)!.price;
  }

  // Get all current prices
  public getAllPrices(): Record<string, number> {
    const result: Record<string, number> = {};
    this.prices.forEach((assetPrice, tokenAddress) => {
      result[tokenAddress] = assetPrice.price;
    });
    return result;
  }
}

// Create a singleton instance
export const priceOracle = new PriceOracleService();
