import { DataSource } from "typeorm";
import { PortfolioBalance } from "./entities/portfolio-balance.entity";
import path from "path";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: path.join(__dirname, "../../database.sqlite"),
  entities: [PortfolioBalance],
  synchronize: true,
  logging: false,
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Error initializing database connection:", error);
    throw error;
  }
};