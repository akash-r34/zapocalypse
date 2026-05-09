export interface BudgetDoc {
  spent: number;
  limit: number;
  killSwitch: boolean;
  budgetMonth: string; // "YYYY-MM"
  updatedAt: Date;
}

export class BudgetExceededError extends Error {
  constructor(spent: number, limit: number) {
    super(`Budget exceeded: $${spent.toFixed(4)} of $${limit}/mo`);
    this.name = "BudgetExceededError";
  }
}
