import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import deploymentInfo from "./deployment.json";
import { ModelPortfolioManager__factory, InvestorPortfolioManager__factory, FundToken__factory } from "../../../sma-contracts/typechain-types";

// Use Account #0's private key (deployer) for contract initialization
const DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Use Account #1's private key for manager operations
const PORTFOLIO_MANAGER_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet(DEPLOYER_KEY, provider);

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
