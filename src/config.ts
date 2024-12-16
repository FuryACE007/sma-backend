import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  RPC_URL: process.env.SEPOLIA_RPC_URL || "",
  CONTRACT_ADDRESSES: {
    modelPortfolioManager: process.env.MODEL_PORTFOLIO_MANAGER_ADDRESS || "",
    investorPortfolioManager:
      process.env.INVESTOR_PORTFOLIO_MANAGER_ADDRESS || "",
    usdcToken: process.env.USDC_TOKEN_ADDRESS || "",
    realEstateToken: process.env.REAL_ESTATE_TOKEN_ADDRESS || "",
    privateEquityToken: process.env.PRIVATE_EQUITY_TOKEN_ADDRESS || "",
  },
};
