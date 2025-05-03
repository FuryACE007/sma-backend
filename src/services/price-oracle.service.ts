import { ethers } from "ethers";

interface AssetPrice {
  price: number;
  lastUpdated: Date;
}

export class PriceOracleService {
  private prices: Map<string, AssetPrice> = new Map();
  private readonly CASH_TOKEN_ADDRESS =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  private readonly volatilityFactors: Map<string, number> = new Map();

  constructor() {
    // Initialize with default prices (1 USD)
    this.initializeDefaultPrices();

    // Set volatility factors for different asset types (higher = more volatile)
    // Real Estate Token - increased volatility for testing
    this.volatilityFactors.set(
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      0.1
    ); // 10% volatility
    // Private Equity Token - increased volatility for testing
    this.volatilityFactors.set(
      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      0.15
    ); // 15% volatility

    // Start price simulation with more frequent updates for testing
    this.startPriceSimulation();
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

  private startPriceSimulation() {
    // Update prices more frequently (every 1 minute) for testing
    setInterval(() => this.simulatePriceChanges(), 60 * 1000);
  }

  private simulatePriceChanges() {
    this.prices.forEach((assetPrice, tokenAddress) => {
      // Skip CASH token - it always stays at $1
      if (tokenAddress === this.CASH_TOKEN_ADDRESS) return;

      const volatility = this.volatilityFactors.get(tokenAddress) || 0.1; // Default 10% volatility

      // Generate random price movement with bias toward larger changes
      // This will create more significant price movements
      const randomFactor = Math.random();
      let priceChange;

      if (randomFactor > 0.7) {
        // 30% chance of a significant price movement (up to 2x volatility)
        priceChange = (Math.random() * 2 - 1) * volatility * 2;
      } else {
        // 70% chance of a normal price movement
        priceChange = (Math.random() * 2 - 1) * volatility;
      }

      // Update price with random movement
      const newPrice = Math.max(0.1, assetPrice.price * (1 + priceChange));

      // Update the price
      this.prices.set(tokenAddress, {
        price: newPrice,
        lastUpdated: new Date(),
      });

      console.log(`Price updated for ${tokenAddress}: $${newPrice.toFixed(4)}`);
    });
  }

  // Add this method to your PriceOracleService class
  public forceSignificantPriceChange() {
    this.prices.forEach((assetPrice, tokenAddress) => {
      // Skip CASH token - it must always stay at $1
      if (tokenAddress === this.CASH_TOKEN_ADDRESS) {
        // Ensure CASH is always exactly $1
        if (assetPrice.price !== 1.0) {
          this.prices.set(tokenAddress, {
            price: 1.0,
            lastUpdated: new Date(),
          });
          console.log(`🔄 Reset CASH token price to exactly $1.00`);
        }
        return;
      }

      // Force a large price change (40-60% up or down)
      const direction = Math.random() > 0.5 ? 1 : -1;
      const magnitude = 0.4 + Math.random() * 0.2; // 40-60%
      const priceChange = direction * magnitude;

      const newPrice = Math.max(0.1, assetPrice.price * (1 + priceChange));

      this.prices.set(tokenAddress, {
        price: newPrice,
        lastUpdated: new Date(),
      });

      console.log(
        `🔥 Forced significant price change for ${tokenAddress}: $${newPrice.toFixed(
          4
        )} (${(priceChange * 100).toFixed(2)}%)`
      );
    });

    return this.getAllPrices();
  }

  // Force an immediate price update (useful for testing)
  public updatePricesNow() {
    this.simulatePriceChanges();
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
