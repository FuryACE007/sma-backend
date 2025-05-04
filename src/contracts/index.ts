import { ethers } from "ethers";
import deploymentInfo from "./deployment.json";
import {
  ModelPortfolioManager__factory,
  InvestorPortfolioManager__factory,
  FundToken__factory,
} from "../../../sma-contracts/typechain-types";
import dotenv from "dotenv";

dotenv.config();

// Use Sepolia RPC URL from environment variables
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
if (!SEPOLIA_RPC_URL) {
  throw new Error("SEPOLIA_RPC_URL not set in environment variables");
}

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

// Use Portfolio Manager's key from environment variables
const PORTFOLIO_MANAGER_KEY = process.env.PRIVATE_KEY || "";
if (!PORTFOLIO_MANAGER_KEY) {
  throw new Error("PRIVATE_KEY not set in environment variables");
}
const wallet = new ethers.Wallet(PORTFOLIO_MANAGER_KEY, provider);

export const contracts = {
  provider,
  wallet,
  modelPortfolioManager: ModelPortfolioManager__factory.connect(
    deploymentInfo.addresses.modelPortfolioManager,
    wallet
  ),
  investorPortfolioManager: InvestorPortfolioManager__factory.connect(
    deploymentInfo.addresses.investorPortfolioManager,
    wallet
  ),
  fundTokens: {
    cash: FundToken__factory.connect(
      deploymentInfo.addresses.cashToken,
      wallet
    ),
    realEstate: FundToken__factory.connect(
      deploymentInfo.addresses.realEstateToken,
      wallet
    ),
    privateEquity: FundToken__factory.connect(
      deploymentInfo.addresses.privateEquityToken,
      wallet
    ),
  },
};
