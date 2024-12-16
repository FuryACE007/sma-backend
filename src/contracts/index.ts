import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import deploymentInfo from "./deployment.json";
import { ModelPortfolioManager__factory, InvestorPortfolioManager__factory, FundToken__factory } from "../../../sma-contracts/typechain-types";

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export const contracts = {
  provider,
  modelPortfolioManager: ModelPortfolioManager__factory.connect(
    deploymentInfo.addresses.modelPortfolioManager,
    wallet
  ),
  investorPortfolioManager: InvestorPortfolioManager__factory.connect(
    deploymentInfo.addresses.investorPortfolioManager,
    wallet
  ),
  usdcToken: FundToken__factory.connect(
    deploymentInfo.addresses.usdcToken,
    wallet
  ),
  realEstateToken: FundToken__factory.connect(
    deploymentInfo.addresses.realEstateToken,
    wallet
  ),
  privateEquityToken: FundToken__factory.connect(
    deploymentInfo.addresses.privateEquityToken,
    wallet
  ),
};
