import * as fs from 'fs';
import * as path from 'path';

export class CashService {
  private balancesPath: string;

  constructor() {
    this.balancesPath = path.join(__dirname, '../data/balances.json');
    this.initializeBalancesFile();
  }

  private initializeBalancesFile() {
    if (!fs.existsSync(this.balancesPath)) {
      fs.writeFileSync(this.balancesPath, JSON.stringify({ investors: {} }, null, 2));
    }
  }

  async updateCashBalance(investor: string, amount: number) {
    const balances = JSON.parse(fs.readFileSync(this.balancesPath, 'utf8'));
    
    // If amount is 0, reset the balance
    if (amount === 0) {
      balances.investors[investor] = 0;
    } else {
      // Otherwise add to existing balance (or initialize if not exists)
      if (!balances.investors[investor]) {
        balances.investors[investor] = 0;
      }
      
      balances.investors[investor] += amount;
    }
    
    // Ensure balance doesn't go below 0
    if (balances.investors[investor] < 0) {
      throw new Error('Insufficient cash balance');
    }
    
    fs.writeFileSync(this.balancesPath, JSON.stringify(balances, null, 2));
    return balances.investors[investor];
  }

  async getCashBalance(investor: string): Promise<number> {
    const balances = JSON.parse(fs.readFileSync(this.balancesPath, 'utf8'));
    return balances.investors[investor] || 0;
  }
}