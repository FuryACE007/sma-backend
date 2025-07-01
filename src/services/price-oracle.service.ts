interface AssetPrice {
  price: number;
  lastUpdated: Date;
}

export class PriceOracleService {
  private prices: Map<string, AssetPrice> = new Map();
  private readonly CASH_TOKEN_ADDRESS = process.env.CASH_TOKEN_ADDRESS ?? "";

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
    const realEstateTokenAddress = process.env.REAL_ESTATE_TOKEN_ADDRESS ?? "";
    if (realEstateTokenAddress) {
      this.prices.set(realEstateTokenAddress, {
        price: 1.0,
        lastUpdated: new Date(),
      });
    }

    // Private Equity Token
    this.prices.set(process.env.PRIVATE_EQUITY_TOKEN_ADDRESS ?? "", {
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
