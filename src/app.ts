import express from "express";
import cors from "cors";
import { PortfolioService } from "./services/portfolio.service";

const app = express();
const portfolioService = new PortfolioService();

// Add custom JSON handler for BigInt
app.set('json replacer', (_key: string, value: any) => 
  typeof value === 'bigint' ? value.toString() : value
);

app.use(cors());
app.use(express.json());

// Create model portfolio
app.post("/api/portfolio/model", async (req, res) => {
  try {
    const { fundAddresses, weights } = req.body;
    const portfolioId = await portfolioService.createModelPortfolio(
      fundAddresses,
      weights,
    );
    res.json({ portfolioId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get model portfolio details
app.get("/api/portfolio/model/:portfolioId", async (req, res) => {
  try {
    const portfolio = await portfolioService.getModelPortfolio(
      parseInt(req.params.portfolioId)
    );
    res.json({ portfolio });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update model portfolio
app.put("/api/portfolio/model/:portfolioId", async (req, res) => {
  try {
    const { fundAddresses, weights } = req.body;
    await portfolioService.updateModelPortfolio(
      parseInt(req.params.portfolioId),
      fundAddresses,
      weights
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Assign portfolio to investor
app.post("/api/portfolio/assign", async (req, res) => {
  try {
    const { investor, portfolioId, stablecoin } = req.body;
    await portfolioService.assignPortfolio(investor, portfolioId, stablecoin);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Deposit funds
app.post("/api/portfolio/deposit", async (req, res) => {
  try {
    const { investor, amount } = req.body;
    await portfolioService.deposit(investor, amount);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw funds
app.post("/api/portfolio/withdraw", async (req, res) => {
  try {
    const { investor, amount } = req.body;
    await portfolioService.withdraw(investor, amount);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get portfolio value
app.get("/api/portfolio/value/:investor", async (req, res) => {
  try {
    const value = await portfolioService.getPortfolioValue(req.params.investor);
    res.json({ value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
