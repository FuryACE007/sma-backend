import express from "express";
import deploymentInfo from "../contracts/deployment.json";

const router = express.Router();

/**
 * @swagger
 * /api/contracts/addresses:
 *   get:
 *     summary: Get contract addresses
 *     tags: [Contracts]
 *     description: Returns the addresses of all deployed contracts
 *     responses:
 *       200:
 *         description: Contract addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modelPortfolioManager:
 *                   type: string
 *                   description: Address of the Model Portfolio Manager contract
 *                 investorPortfolioManager:
 *                   type: string
 *                   description: Address of the Investor Portfolio Manager contract
 *                 cashToken:
 *                   type: string
 *                   description: Address of the Cash Token contract
 *                 realEstateToken:
 *                   type: string
 *                   description: Address of the Real Estate Token contract
 *                 privateEquityToken:
 *                   type: string
 *                   description: Address of the Private Equity Token contract
 */
router.get("/addresses", (req, res) => {
  res.json(deploymentInfo.addresses);
});

export default router;
