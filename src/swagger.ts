import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Portfolio Management API',
      version: '1.0.0',
      description: 'API documentation for Smart Portfolio Management System',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ModelPortfolio: {
          type: 'object',
          properties: {
            fundAddresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of fund token addresses',
            },
            weights: {
              type: 'array',
              items: { type: 'number' },
              description: 'Array of fund weights in basis points (100 = 1%)',
            },
          },
        },
        PortfolioAssignment: {
          type: 'object',
          properties: {
            investor: { type: 'string', description: 'Investor address' },
            portfolioId: { type: 'number', description: 'Model portfolio ID' },
            stablecoin: { type: 'string', description: 'Stablecoin address' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            investor: { type: 'string', description: 'Investor address' },
            amount: { type: 'string', description: 'Transaction amount' },
          },
        },
      },
    },
  },
  apis: ['./src/app.ts'], // Path to the API routes
};

export const specs = swaggerJsdoc(options); 