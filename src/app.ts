import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { portfolioRoutes } from "./routes/portfolio.routes";
import { initializeDatabase } from "./database/database";
import "reflect-metadata";

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Portfolio Management API",
      version: "1.0.0",
      description: "API documentation for Smart Portfolio Management",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        PortfolioValue: {
          type: "object",
          properties: {
            totalValue: {
              type: "string",
              description: "Total portfolio value in USD"
            },
            fundValues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tokenAddress: {
                    type: "string",
                    description: "Address of the token"
                  },
                  symbol: {
                    type: "string",
                    description: "Token symbol"
                  },
                  balance: {
                    type: "string",
                    description: "Token balance"
                  },
                  value: {
                    type: "string",
                    description: "Token value in USD"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/portfolio", portfolioRoutes);

// Initialize database
export const startApp = async () => {
  try {
    await initializeDatabase();
    console.log("Database connection initialized");
    return app;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
};

export default app;
