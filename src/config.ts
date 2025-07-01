import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  RPC_URL: process.env.BUILD_BEAR_RPC_URL || "",
  CONTRACT_ADDRESSES: {
    modelPortfolioManager: process.env.MODEL_PORTFOLIO_MANAGER_ADDRESS || "",
    investorPortfolioManager:
      process.env.INVESTOR_PORTFOLIO_MANAGER_ADDRESS || "",
    realEstateToken: process.env.REAL_ESTATE_TOKEN_ADDRESS || "",
    privateEquityToken: process.env.PRIVATE_EQUITY_TOKEN_ADDRESS || "",
    cashToken: process.env.CASH_TOKEN_ADDRESS || "", // Add cash token address
  },
};
