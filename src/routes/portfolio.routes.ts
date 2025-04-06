import express from "express";
import { PortfolioService } from "../services/portfolio.service";

export const portfolioRoutes = express.Router();
const portfolioService = new PortfolioService();

/**
 * @swagger
 * /api/portfolio/model:
 *   post:
 *     summary: Create a new model portfolio
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fundAddresses
 *               - weights
 *             properties:
 *               fundAddresses:
 *                 type: array
 *                 items:
 *                   type: string
 *               weights:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Model portfolio created successfully
 *       500:
 *         description: Server error
 */
portfolioRoutes.post("/model", async (req, res) => {
  try {
    const { fundAddresses, weights } = req.body;
    const portfolioId = await portfolioService.createModelPortfolio(
      fundAddresses,
      weights
    );
    res.json({ portfolioId: portfolioId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/model/{portfolioId}:
 *   get:
 *     summary: Get model portfolio by ID
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         schema:
 *           type: number
 *         required: true
 *         description: ID of the model portfolio
 *     responses:
 *       200:
 *         description: Model portfolio details
 *       500:
 *         description: Server error
 */
portfolioRoutes.get("/model/:portfolioId", async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const modelPortfolio = await portfolioService.getModelPortfolio(Number(portfolioId));
    res.json({ modelPortfolio });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/model/{portfolioId}:
 *   put:
 *     summary: Update model portfolio
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         schema:
 *           type: number
 *         required: true
 *         description: ID of the model portfolio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fundAddresses
 *               - weights
 *             properties:
 *               fundAddresses:
 *                 type: array
 *                 items:
 *                   type: string
 *               weights:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Model portfolio updated successfully
 *       500:
 *         description: Server error
 */
portfolioRoutes.put("/model/:portfolioId", async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const { fundAddresses, weights } = req.body;
    await portfolioService.updateModelPortfolio(
      Number(portfolioId),
      fundAddresses,
      weights
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/assign:
 *   post:
 *     summary: Assign a model portfolio to an investor
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investor
 *               - portfolioId
 *             properties:
 *               investor:
 *                 type: string
 *                 description: Ethereum address of the investor
 *               portfolioId:
 *                 type: number
 *                 description: ID of the model portfolio to assign
 *     responses:
 *       200:
 *         description: Portfolio assigned successfully
 *       500:
 *         description: Server error
 */
portfolioRoutes.post("/assign", async (req, res) => {
  try {
    const { investor, portfolioId } = req.body;
    await portfolioService.assignPortfolio(investor, portfolioId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/deposit:
 *   post:
 *     summary: Deposit funds into an investor's portfolio
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investor
 *               - amount
 *             properties:
 *               investor:
 *                 type: string
 *                 description: Ethereum address of the investor
 *               amount:
 *                 type: string
 *                 description: Amount to deposit in USD
 *     responses:
 *       200:
 *         description: Deposit successful
 *       500:
 *         description: Server error
 */
portfolioRoutes.post("/deposit", async (req, res) => {
  try {
    const { investor, amount } = req.body;
    await portfolioService.deposit(investor, amount);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/withdraw:
 *   post:
 *     summary: Withdraw funds from an investor's portfolio
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investor
 *               - amount
 *             properties:
 *               investor:
 *                 type: string
 *                 description: Ethereum address of the investor
 *               amount:
 *                 type: string
 *                 description: Amount to withdraw in USD
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *       500:
 *         description: Server error
 */
portfolioRoutes.post("/withdraw", async (req, res) => {
  try {
    const { investor, amount } = req.body;
    await portfolioService.withdraw(investor, amount);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/value/{investor}:
 *   get:
 *     summary: Get the current value of an investor's portfolio
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: investor
 *         schema:
 *           type: string
 *         required: true
 *         description: Ethereum address of the investor
 *     responses:
 *       200:
 *         description: Portfolio value details
 *       500:
 *         description: Server error
 */
portfolioRoutes.get("/value/:investor", async (req, res) => {
  try {
    const { investor } = req.params;
    const value = await portfolioService.getPortfolioValue(investor);
    res.json({ value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/rebalance/{investor}:
 *   post:
 *     summary: Manually rebalance an investor's portfolio
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: investor
 *         schema:
 *           type: string
 *         required: true
 *         description: Ethereum address of the investor
 *     responses:
 *       200:
 *         description: Portfolio rebalanced successfully
 *       500:
 *         description: Server error
 */
portfolioRoutes.post("/rebalance/:investor", async (req, res) => {
  try {
    const { investor } = req.params;
    await portfolioService.rebalancePortfolio(investor);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/history/{investor}:
 *   get:
 *     summary: Get portfolio balance history for an investor
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: investor
 *         schema:
 *           type: string
 *         required: true
 *         description: Ethereum address of the investor
 *     responses:
 *       200:
 *         description: Portfolio balance history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       investor:
 *                         type: string
 *                       portfolioId:
 *                         type: number
 *                       balanceData:
 *                         type: string
 *                       totalValue:
 *                         type: number
 *                       transactionType:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */
portfolioRoutes.get("/history/:investor", async (req, res) => {
  try {
    const { investor } = req.params;
    const history = await portfolioService.getPortfolioBalanceHistory(investor);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/latest-balance/{investor}:
 *   get:
 *     summary: Get latest portfolio balance for an investor
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: investor
 *         schema:
 *           type: string
 *         required: true
 *         description: Ethereum address of the investor
 *     responses:
 *       200:
 *         description: Latest portfolio balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 latestBalance:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     investor:
 *                       type: string
 *                     portfolioId:
 *                       type: number
 *                     balanceData:
 *                       type: string
 *                     totalValue:
 *                       type: number
 *                     transactionType:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
portfolioRoutes.get("/latest-balance/:investor", async (req, res) => {
  try {
    const { investor } = req.params;
    const latestBalance = await portfolioService.getLatestPortfolioBalance(investor);
    res.json({ latestBalance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});