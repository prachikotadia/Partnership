import { authService } from './authService';
import { notificationService } from './notificationService';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'rent' | 'groceries' | 'utilities' | 'transportation' | 'entertainment' | 'dining' | 'shopping' | 'healthcare' | 'education' | 'other';
  date: Date;
  description?: string;
  createdBy: string;
  lastEditedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isRecurring: boolean;
  recurringType?: 'monthly' | 'weekly' | 'yearly';
  tags: string[];
  receipt?: string; // URL to receipt image
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: string;
  lastEditedBy: string;
  createdAt: Date;
  updatedAt: Date;
  notifications: {
    at50Percent: boolean;
    at80Percent: boolean;
    at100Percent: boolean;
  };
}

export interface BigExpense {
  id: string;
  title: string;
  amount: number;
  targetDate: Date;
  category: 'wedding' | 'trip' | 'gadget' | 'home' | 'car' | 'education' | 'other';
  description?: string;
  currentSaved: number;
  isCompleted: boolean;
  createdBy: string;
  lastEditedBy: string;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
  paymentPlan?: {
    monthlyAmount: number;
    startDate: Date;
    endDate: Date;
  };
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  description?: string;
  isCompleted: boolean;
  createdBy: string;
  lastEditedBy: string;
  createdAt: Date;
  updatedAt: Date;
  category: 'emergency' | 'vacation' | 'house' | 'car' | 'wedding' | 'retirement' | 'other';
  monthlyContribution: number;
  progress: number; // 0-100
}

export interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'mutual-funds' | 'etf' | 'crypto' | 'real-estate' | 'other';
  amount: number;
  currentValue: number;
  purchaseDate: Date;
  description?: string;
  createdBy: string;
  lastEditedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  performance: {
    totalReturn: number;
    percentageReturn: number;
    lastUpdated: Date;
  };
}

export interface FinancialEditHistory {
  id: string;
  entityType: 'expense' | 'budget' | 'big-expense' | 'savings-goal' | 'investment';
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  field?: string;
  oldValue?: any;
  newValue?: any;
  editedBy: string;
  editedAt: Date;
  description: string;
}

class FinancialService {
  private expenses: Map<string, Expense> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private bigExpenses: Map<string, BigExpense> = new Map();
  private savingsGoals: Map<string, SavingsGoal> = new Map();
  private investments: Map<string, Investment> = new Map();
  private editHistory: Map<string, FinancialEditHistory> = new Map();
  private userId: string | null = null;

  async initialize(userId: string) {
    this.userId = userId;
    await this.loadData();
    await this.initializeDefaultBudgets();
  }

  // Expense Management
  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastEditedBy'>): Promise<string> {
    const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newExpense: Expense = {
      ...expense,
      id: expenseId,
      createdBy: this.userId!,
      lastEditedBy: this.userId!,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.expenses.set(expenseId, newExpense);
    await this.updateBudgetSpending(newExpense);
    await this.recordEditHistory('expense', expenseId, 'created', undefined, newExpense);
    await this.saveData();

    // Notify partner
    await this.notifyPartner('expense_created', {
      type: 'expense',
      title: 'New Expense Added',
      message: `${newExpense.createdBy} added "${newExpense.title}" - $${newExpense.amount}`,
      expenseId,
      expense: newExpense
    });

    return expenseId;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    const expense = this.expenses.get(id);
    if (expense) {
      const oldExpense = { ...expense };
      const updatedExpense = {
        ...expense,
        ...updates,
        lastEditedBy: this.userId!,
        updatedAt: new Date()
      };

      this.expenses.set(id, updatedExpense);
      await this.updateBudgetSpending(updatedExpense, oldExpense);
      await this.recordEditHistory('expense', id, 'updated', oldExpense, updatedExpense);
      await this.saveData();

      // Notify partner
      await this.notifyPartner('expense_updated', {
        type: 'expense',
        title: 'Expense Updated',
        message: `${updatedExpense.lastEditedBy} updated "${updatedExpense.title}"`,
        expenseId: id,
        expense: updatedExpense
      });
    }
  }

  async deleteExpense(id: string): Promise<void> {
    const expense = this.expenses.get(id);
    if (expense) {
      this.expenses.delete(id);
      await this.updateBudgetSpending(expense, expense, true); // Remove from budget
      await this.recordEditHistory('expense', id, 'deleted', expense, undefined);
      await this.saveData();

      // Notify partner
      await this.notifyPartner('expense_deleted', {
        type: 'expense',
        title: 'Expense Deleted',
        message: `${expense.lastEditedBy} deleted "${expense.title}"`,
        expenseId: id
      });
    }
  }

  // Budget Management
  private async initializeDefaultBudgets(): Promise<void> {
    const defaultBudgets = [
      { category: 'groceries', monthlyLimit: 400 },
      { category: 'entertainment', monthlyLimit: 200 },
      { category: 'dining', monthlyLimit: 300 },
      { category: 'shopping', monthlyLimit: 250 },
      { category: 'transportation', monthlyLimit: 150 }
    ];

    for (const budget of defaultBudgets) {
      const existing = Array.from(this.budgets.values()).find(b => b.category === budget.category);
      if (!existing) {
        await this.createBudget({
          category: budget.category,
          monthlyLimit: budget.monthlyLimit,
          currentSpent: 0,
          startDate: new Date(),
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          isActive: true,
          notifications: {
            at50Percent: true,
            at80Percent: true,
            at100Percent: true
          }
        });
      }
    }
  }

  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastEditedBy'>): Promise<string> {
    const budgetId = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBudget: Budget = {
      ...budget,
      id: budgetId,
      createdBy: this.userId!,
      lastEditedBy: this.userId!,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.budgets.set(budgetId, newBudget);
    await this.recordEditHistory('budget', budgetId, 'created', undefined, newBudget);
    await this.saveData();

    return budgetId;
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
    const budget = this.budgets.get(id);
    if (budget) {
      const oldBudget = { ...budget };
      const updatedBudget = {
        ...budget,
        ...updates,
        lastEditedBy: this.userId!,
        updatedAt: new Date()
      };

      this.budgets.set(id, updatedBudget);
      await this.recordEditHistory('budget', id, 'updated', oldBudget, updatedBudget);
      await this.saveData();
    }
  }

  private async updateBudgetSpending(expense: Expense, oldExpense?: Expense, isDeleted: boolean = false): Promise<void> {
    const budget = Array.from(this.budgets.values()).find(b => b.category === expense.category && b.isActive);
    if (budget) {
      let amountChange = expense.amount;
      
      if (oldExpense && oldExpense.category === expense.category) {
        amountChange = expense.amount - oldExpense.amount;
      } else if (oldExpense && oldExpense.category !== expense.category) {
        // Category changed, remove from old budget and add to new
        const oldBudget = Array.from(this.budgets.values()).find(b => b.category === oldExpense.category && b.isActive);
        if (oldBudget) {
          oldBudget.currentSpent -= oldExpense.amount;
        }
      }

      if (isDeleted) {
        amountChange = -expense.amount;
      }

      budget.currentSpent += amountChange;
      budget.updatedAt = new Date();

      // Check for budget notifications
      await this.checkBudgetNotifications(budget);
    }
  }

  private async checkBudgetNotifications(budget: Budget): Promise<void> {
    const percentage = (budget.currentSpent / budget.monthlyLimit) * 100;

    if (percentage >= 100 && budget.notifications.at100Percent) {
      await notificationService.createReminder({
        type: 'bill',
        title: 'Budget Exceeded! 💸',
        message: `You've exceeded your ${budget.category} budget by $${(budget.currentSpent - budget.monthlyLimit).toFixed(2)}`,
        scheduledTime: new Date(),
        isActive: true,
        userId: this.userId!
      });
    } else if (percentage >= 80 && budget.notifications.at80Percent) {
      await notificationService.createReminder({
        type: 'bill',
        title: 'Budget Alert! ⚠️',
        message: `You've used 80% of your ${budget.category} budget ($${budget.currentSpent.toFixed(2)} / $${budget.monthlyLimit})`,
        scheduledTime: new Date(),
        isActive: true,
        userId: this.userId!
      });
    } else if (percentage >= 50 && budget.notifications.at50Percent) {
      await notificationService.createReminder({
        type: 'bill',
        title: 'Budget Update 📊',
        message: `You've used 50% of your ${budget.category} budget ($${budget.currentSpent.toFixed(2)} / $${budget.monthlyLimit})`,
        scheduledTime: new Date(),
        isActive: true,
        userId: this.userId!
      });
    }
  }

  // Big Expenses Management
  async createBigExpense(bigExpense: Omit<BigExpense, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastEditedBy'>): Promise<string> {
    const bigExpenseId = `big_expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBigExpense: BigExpense = {
      ...bigExpense,
      id: bigExpenseId,
      createdBy: this.userId!,
      lastEditedBy: this.userId!,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bigExpenses.set(bigExpenseId, newBigExpense);
    await this.recordEditHistory('big-expense', bigExpenseId, 'created', undefined, newBigExpense);
    await this.saveData();

    return bigExpenseId;
  }

  async updateBigExpense(id: string, updates: Partial<BigExpense>): Promise<void> {
    const bigExpense = this.bigExpenses.get(id);
    if (bigExpense) {
      const oldBigExpense = { ...bigExpense };
      const updatedBigExpense = {
        ...bigExpense,
        ...updates,
        lastEditedBy: this.userId!,
        updatedAt: new Date()
      };

      this.bigExpenses.set(id, updatedBigExpense);
      await this.recordEditHistory('big-expense', id, 'updated', oldBigExpense, updatedBigExpense);
      await this.saveData();
    }
  }

  // Savings Goals Management
  async createSavingsGoal(savingsGoal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastEditedBy' | 'progress'>): Promise<string> {
    const savingsGoalId = `savings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const progress = (savingsGoal.currentAmount / savingsGoal.targetAmount) * 100;
    
    const newSavingsGoal: SavingsGoal = {
      ...savingsGoal,
      id: savingsGoalId,
      progress: Math.min(progress, 100),
      createdBy: this.userId!,
      lastEditedBy: this.userId!,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.savingsGoals.set(savingsGoalId, newSavingsGoal);
    await this.recordEditHistory('savings-goal', savingsGoalId, 'created', undefined, newSavingsGoal);
    await this.saveData();

    return savingsGoalId;
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<void> {
    const savingsGoal = this.savingsGoals.get(id);
    if (savingsGoal) {
      const oldSavingsGoal = { ...savingsGoal };
      const updatedSavingsGoal = {
        ...savingsGoal,
        ...updates,
        lastEditedBy: this.userId!,
        updatedAt: new Date()
      };

      // Recalculate progress
      updatedSavingsGoal.progress = (updatedSavingsGoal.currentAmount / updatedSavingsGoal.targetAmount) * 100;
      updatedSavingsGoal.isCompleted = updatedSavingsGoal.progress >= 100;

      this.savingsGoals.set(id, updatedSavingsGoal);
      await this.recordEditHistory('savings-goal', id, 'updated', oldSavingsGoal, updatedSavingsGoal);
      await this.saveData();
    }
  }

  // Investment Management
  async createInvestment(investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastEditedBy' | 'performance'>): Promise<string> {
    const investmentId = `investment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const totalReturn = investment.currentValue - investment.amount;
    const percentageReturn = (totalReturn / investment.amount) * 100;
    
    const newInvestment: Investment = {
      ...investment,
      id: investmentId,
      performance: {
        totalReturn,
        percentageReturn,
        lastUpdated: new Date()
      },
      createdBy: this.userId!,
      lastEditedBy: this.userId!,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.investments.set(investmentId, newInvestment);
    await this.recordEditHistory('investment', investmentId, 'created', undefined, newInvestment);
    await this.saveData();

    return investmentId;
  }

  async updateInvestment(id: string, updates: Partial<Investment>): Promise<void> {
    const investment = this.investments.get(id);
    if (investment) {
      const oldInvestment = { ...investment };
      const updatedInvestment = {
        ...investment,
        ...updates,
        lastEditedBy: this.userId!,
        updatedAt: new Date()
      };

      // Recalculate performance
      if (updates.currentValue !== undefined || updates.amount !== undefined) {
        const totalReturn = updatedInvestment.currentValue - updatedInvestment.amount;
        const percentageReturn = (totalReturn / updatedInvestment.amount) * 100;
        updatedInvestment.performance = {
          totalReturn,
          percentageReturn,
          lastUpdated: new Date()
        };
      }

      this.investments.set(id, updatedInvestment);
      await this.recordEditHistory('investment', id, 'updated', oldInvestment, updatedInvestment);
      await this.saveData();
    }
  }

  // Edit History Management
  private async recordEditHistory(
    entityType: FinancialEditHistory['entityType'],
    entityId: string,
    action: FinancialEditHistory['action'],
    oldValue: any,
    newValue: any
  ): Promise<void> {
    const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let description = '';
    let field = '';
    let oldVal = oldValue;
    let newVal = newValue;

    if (action === 'created') {
      description = `Created ${entityType}`;
    } else if (action === 'updated') {
      // Find changed fields
      const changes: string[] = [];
      if (oldValue && newValue) {
        Object.keys(newValue).forEach(key => {
          if (oldValue[key] !== newValue[key] && key !== 'updatedAt' && key !== 'lastEditedBy') {
            changes.push(key);
            if (changes.length === 1) {
              field = key;
              oldVal = oldValue[key];
              newVal = newValue[key];
            }
          }
        });
      }
      description = `Updated ${entityType}${changes.length > 1 ? ` (${changes.length} fields)` : ` (${field})`}`;
    } else if (action === 'deleted') {
      description = `Deleted ${entityType}`;
    }

    const history: FinancialEditHistory = {
      id: historyId,
      entityType,
      entityId,
      action,
      field,
      oldValue: oldVal,
      newValue: newVal,
      editedBy: this.userId!,
      editedAt: new Date(),
      description
    };

    this.editHistory.set(historyId, history);
  }

  // Analytics and Statistics
  getMonthlyExpenses(month?: Date): Expense[] {
    const targetMonth = month || new Date();
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

    return Array.from(this.expenses.values()).filter(expense => 
      expense.date >= startOfMonth && expense.date <= endOfMonth
    );
  }

  getExpensesByCategory(month?: Date): { [key: string]: { amount: number; count: number } } {
    const expenses = this.getMonthlyExpenses(month);
    const categories: { [key: string]: { amount: number; count: number } } = {};

    expenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = { amount: 0, count: 0 };
      }
      categories[expense.category].amount += expense.amount;
      categories[expense.category].count += 1;
    });

    return categories;
  }

  getTotalMonthlySpending(month?: Date): number {
    return this.getMonthlyExpenses(month).reduce((total, expense) => total + expense.amount, 0);
  }

  getBudgetProgress(): { [key: string]: { spent: number; limit: number; percentage: number } } {
    const progress: { [key: string]: { spent: number; limit: number; percentage: number } } = {};

    Array.from(this.budgets.values()).forEach(budget => {
      if (budget.isActive) {
        progress[budget.category] = {
          spent: budget.currentSpent,
          limit: budget.monthlyLimit,
          percentage: (budget.currentSpent / budget.monthlyLimit) * 100
        };
      }
    });

    return progress;
  }

  getUpcomingBigExpenses(): BigExpense[] {
    const now = new Date();
    const next3Months = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    return Array.from(this.bigExpenses.values())
      .filter(expense => !expense.isCompleted && expense.targetDate <= next3Months)
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
  }

  getSavingsProgress(): SavingsGoal[] {
    return Array.from(this.savingsGoals.values())
      .filter(goal => !goal.isCompleted)
      .sort((a, b) => b.progress - a.progress);
  }

  getInvestmentPerformance(): { totalInvested: number; totalValue: number; totalReturn: number; percentageReturn: number } {
    const investments = Array.from(this.investments.values()).filter(inv => inv.isActive);
    
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturn = totalValue - totalInvested;
    const percentageReturn = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    return { totalInvested, totalValue, totalReturn, percentageReturn };
  }

  getEditHistory(entityType?: string, entityId?: string): FinancialEditHistory[] {
    let history = Array.from(this.editHistory.values());

    if (entityType) {
      history = history.filter(h => h.entityType === entityType);
    }
    if (entityId) {
      history = history.filter(h => h.entityId === entityId);
    }

    return history.sort((a, b) => b.editedAt.getTime() - a.editedAt.getTime());
  }

  // Data Management
  private async loadData(): Promise<void> {
    try {
      const saved = localStorage.getItem(`financial_${this.userId}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.expenses) {
          data.expenses.forEach((expense: Expense) => {
            this.expenses.set(expense.id, {
              ...expense,
              date: new Date(expense.date),
              createdAt: new Date(expense.createdAt),
              updatedAt: new Date(expense.updatedAt)
            });
          });
        }
        if (data.budgets) {
          data.budgets.forEach((budget: Budget) => {
            this.budgets.set(budget.id, {
              ...budget,
              startDate: new Date(budget.startDate),
              endDate: new Date(budget.endDate),
              createdAt: new Date(budget.createdAt),
              updatedAt: new Date(budget.updatedAt)
            });
          });
        }
        if (data.bigExpenses) {
          data.bigExpenses.forEach((bigExpense: BigExpense) => {
            this.bigExpenses.set(bigExpense.id, {
              ...bigExpense,
              targetDate: new Date(bigExpense.targetDate),
              createdAt: new Date(bigExpense.createdAt),
              updatedAt: new Date(bigExpense.updatedAt)
            });
          });
        }
        if (data.savingsGoals) {
          data.savingsGoals.forEach((savingsGoal: SavingsGoal) => {
            this.savingsGoals.set(savingsGoal.id, {
              ...savingsGoal,
              targetDate: new Date(savingsGoal.targetDate),
              createdAt: new Date(savingsGoal.createdAt),
              updatedAt: new Date(savingsGoal.updatedAt)
            });
          });
        }
        if (data.investments) {
          data.investments.forEach((investment: Investment) => {
            this.investments.set(investment.id, {
              ...investment,
              purchaseDate: new Date(investment.purchaseDate),
              createdAt: new Date(investment.createdAt),
              updatedAt: new Date(investment.updatedAt),
              performance: {
                ...investment.performance,
                lastUpdated: new Date(investment.performance.lastUpdated)
              }
            });
          });
        }
        if (data.editHistory) {
          data.editHistory.forEach((history: FinancialEditHistory) => {
            this.editHistory.set(history.id, {
              ...history,
              editedAt: new Date(history.editedAt)
            });
          });
        }
      }
    } catch (error) {
      console.error('Failed to load financial data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      const data = {
        expenses: Array.from(this.expenses.values()),
        budgets: Array.from(this.budgets.values()),
        bigExpenses: Array.from(this.bigExpenses.values()),
        savingsGoals: Array.from(this.savingsGoals.values()),
        investments: Array.from(this.investments.values()),
        editHistory: Array.from(this.editHistory.values())
      };
      localStorage.setItem(`financial_${this.userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save financial data:', error);
    }
  }

  // Partner Notifications
  private async notifyPartner(type: string, data: any): Promise<void> {
    await notificationService.notifyPartnerEdit(
      this.userId || 'System',
      type,
      data.title
    );
  }

  // Getters
  getExpenses(): Expense[] {
    return Array.from(this.expenses.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getBudgets(): Budget[] {
    return Array.from(this.budgets.values()).filter(b => b.isActive);
  }

  getBigExpenses(): BigExpense[] {
    return Array.from(this.bigExpenses.values()).sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
  }

  getSavingsGoals(): SavingsGoal[] {
    return Array.from(this.savingsGoals.values()).sort((a, b) => b.progress - a.progress);
  }

  getInvestments(): Investment[] {
    return Array.from(this.investments.values()).filter(i => i.isActive);
  }
}

export const financialService = new FinancialService();
