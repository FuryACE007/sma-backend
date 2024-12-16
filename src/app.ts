import express from "express";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import { PortfolioService } from "./services/portfolio.service";

const app = express();
const portfolioService = new PortfolioService();

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Add custom JSON handler for BigInt
app.set('json replacer', (_key: string, value: any) => 
  typeof value === 'bigint' ? value.toString() : value
);

app.use(cors());
app.use(express.json());

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
 *             $ref: '#/components/schemas/ModelPortfolio'
 *     responses:
 *       200:
 *         description: Portfolio created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 portfolioId: 
 *                   type: string
 *                   description: The ID of the created portfolio
 */
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

/**
 * @swagger
 * /api/portfolio/model/{portfolioId}:
 *   get:
 *     summary: Get model portfolio details
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio ID
 *     responses:
 *       200:
 *         description: Portfolio details retrieved successfully
 */
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

/**
 * @swagger
 * /api/portfolio/model/{portfolioId}:
 *   put:
 *     summary: Update an existing model portfolio
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModelPortfolio'
 *     responses:
 *       200:
 *         description: Portfolio updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
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

/**
 * @swagger
 * /api/portfolio/assign:
 *   post:
 *     summary: Assign portfolio to investor
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioAssignment'
 *     responses:
 *       200:
 *         description: Portfolio assigned successfully
 */
app.post("/api/portfolio/assign", async (req, res) => {
  try {
    const { investor, portfolioId, stablecoin } = req.body;
    await portfolioService.assignPortfolio(investor, portfolioId, stablecoin);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolio/deposit:
 *   post:
 *     summary: Deposit funds into portfolio
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Funds deposited successfully
 */
app.post("/api/portfolio/deposit", async (req, res) => {
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
 *     summary: Withdraw funds from portfolio
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Funds withdrawn successfully
 */
app.post("/api/portfolio/withdraw", async (req, res) => {
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
 *     summary: Get portfolio value
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: investor
 *         required: true
 *         schema:
 *           type: string
 *         description: Investor address
 *     responses:
 *       200:
 *         description: Portfolio value retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 value:
 *                   type: string
 *                   description: Portfolio value in USDC
 */
app.get("/api/portfolio/value/:investor", async (req, res) => {
  try {
    const value = await portfolioService.getPortfolioValue(req.params.investor);
    res.json({ value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
