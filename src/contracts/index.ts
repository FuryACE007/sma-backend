import { ethers } from "ethers";
import deploymentInfo from "./deployment.json";
import {
  ModelPortfolioManager__factory,
  InvestorPortfolioManager__factory,
  FundToken__factory,
} from "../../../sma-contracts/typechain-types";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Use Portfolio Manager's key (Account #1)
const PORTFOLIO_MANAGER_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
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
    usdc: FundToken__factory.connect(
      deploymentInfo.addresses.usdcToken,
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
