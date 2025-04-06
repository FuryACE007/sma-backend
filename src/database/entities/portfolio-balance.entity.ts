import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class PortfolioBalance {
  @PrimaryGeneratedColumn("increment")
  id!: number; 

  @Column()
  investor!: string;

  @Column()
  portfolioId!: number;

  @Column("text")
  balanceData!: string; // JSON string of portfolio value

  @Column("decimal", { precision: 18, scale: 6 })
  totalValue!: number;

  @Column()
  transactionType!: string; // "deposit", "withdraw", "rebalance"

  @CreateDateColumn()
  timestamp!: Date;
}
