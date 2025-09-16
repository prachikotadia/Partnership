import { notificationService } from './notificationService';

export interface Expense {
  id: string;
  category: 'rent' | 'groceries' | 'transport' | 'entertainment' | 'misc' | 'utilities' | 'healthcare' | 'education';
  amount: number;
  currency: 'USD' | 'INR';
  date: string;
  paidBy: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface Budget {
  id: string;
  name: string;
  totalAmount: number;
  currency: 'USD' | 'INR';
  period: 'monthly' | 'weekly' | 'yearly';
  categories: {
    [key: string]: number;
  };
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currency: 'USD' | 'INR';
  deadline: string;
  contributions: {
    [partner: string]: number;
  };
  currentAmount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface BigExpense {
  id: string;
  title: string;
  expectedAmount: number;
  currency: 'USD' | 'INR';
  dueDate: string;
  assignedPartners: string[];
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'mutual-fund' | 'stocks' | 'fixed-deposit' | 'crypto' | 'bonds' | 'real-estate';
  amount: number;
  currency: 'USD' | 'INR';
  startDate: string;
  maturityDate?: string;
  expectedReturn: number;
  currentValue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface DueDate {
  id: string;
  title: string;
  amount: number;
  currency: 'USD' | 'INR';
  dueDate: string;
  category: 'rent' | 'loan' | 'subscription' | 'insurance' | 'utility' | 'other';
  assignedPartner: string;
  isRecurring: boolean;
  recurringPattern?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface FinanceHistory {
  id: string;
  itemId: string;
  itemType: 'expense' | 'budget' | 'savings' | 'big-expense' | 'investment' | 'due-date';
  action: 'created' | 'updated' | 'deleted' | 'restored' | 'paid' | 'contributed';
  userId: string;
  userName: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  description: string;
}

export interface CurrencyRates {
  USD_TO_INR: number;
  INR_TO_USD: number;
  lastUpdated: string;
}

class FinanceService {
  private expenses: Expense[] = [];
  private budgets: Budget[] = [];
  private savingsGoals: SavingsGoal[] = [];
  private bigExpenses: BigExpense[] = [];
  private investments: Investment[] = [];
  private dueDates: DueDate[] = [];
  private financeHistory: FinanceHistory[] = [];
  private listeners: ((data: any) => void)[] = [];
  private currentUser = 'Alex';
  private partnerUser = 'Ethan';
  private currentCurrency: 'USD' | 'INR' = 'USD';
  
  // Fixed exchange rate (in real app, this would come from API)
  private currencyRates: CurrencyRates = {
    USD_TO_INR: 83.0,
    INR_TO_USD: 0.012,
    lastUpdated: new Date().toISOString()
  };

  constructor() {
    this.loadData();
    this.initializeSampleData();
  }

  // Real-time sync simulation
  subscribe(listener: (data: any) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const data = {
      expenses: [...this.expenses],
      budgets: [...this.budgets],
      savingsGoals: [...this.savingsGoals],
      bigExpenses: [...this.bigExpenses],
      investments: [...this.investments],
      dueDates: [...this.dueDates],
      currency: this.currentCurrency
    };
    this.listeners.forEach(listener => listener(data));
    this.saveData();
  }

  // Currency Management
  setCurrency(currency: 'USD' | 'INR') {
    this.currentCurrency = currency;
    this.notifyListeners();
  }

  getCurrentCurrency(): 'USD' | 'INR' {
    return this.currentCurrency;
  }

  convertCurrency(amount: number, fromCurrency: 'USD' | 'INR', toCurrency: 'USD' | 'INR'): number {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'USD' && toCurrency === 'INR') {
      return amount * this.currencyRates.USD_TO_INR;
    } else if (fromCurrency === 'INR' && toCurrency === 'USD') {
      return amount * this.currencyRates.INR_TO_USD;
    }
    
    return amount;
  }

  formatCurrency(amount: number, currency: 'USD' | 'INR'): string {
    if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  }

  getDisplayAmount(amount: number, currency: 'USD' | 'INR'): string {
    const primaryAmount = this.formatCurrency(amount, currency);
    const secondaryAmount = this.formatCurrency(
      this.convertCurrency(amount, currency, this.currentCurrency === 'USD' ? 'INR' : 'USD'),
      this.currentCurrency === 'USD' ? 'INR' : 'USD'
    );
    
    if (currency === this.currentCurrency) {
      return primaryAmount;
    } else {
      return `${primaryAmount} / ${secondaryAmount}`;
    }
  }

  // History Management
  private addToHistory(
    itemId: string, 
    itemType: FinanceHistory['itemType'], 
    action: FinanceHistory['action'], 
    changes?: FinanceHistory['changes'],
    description?: string
  ) {
    const historyEntry: FinanceHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      itemType,
      action,
      userId: this.currentUser,
      userName: this.currentUser,
      timestamp: new Date().toISOString(),
      changes,
      description: description || this.generateHistoryDescription(action, changes)
    };

    this.financeHistory.push(historyEntry);
    this.saveFinanceHistory();

    // Notify partner about changes
    if (action !== 'created') {
      this.notifyPartner(itemId, itemType, action, description);
    }
  }

  private generateHistoryDescription(action: FinanceHistory['action'], changes?: FinanceHistory['changes']): string {
    switch (action) {
      case 'created':
        return `${this.currentUser} created a new item`;
      case 'updated':
        if (changes && changes.length > 0) {
          const change = changes[0];
          return `${this.currentUser} changed ${change.field} from "${change.oldValue}" to "${change.newValue}"`;
        }
        return `${this.currentUser} updated the item`;
      case 'deleted':
        return `${this.currentUser} deleted the item`;
      case 'restored':
        return `${this.currentUser} restored the item`;
      case 'paid':
        return `${this.currentUser} marked as paid`;
      case 'contributed':
        return `${this.currentUser} made a contribution`;
      default:
        return `${this.currentUser} performed an action`;
    }
  }

  private notifyPartner(itemId: string, itemType: string, action: string, description?: string) {
    // This would integrate with the notification service
    console.log(`Finance notification: ${this.currentUser} updated ${itemType} - ${description}`);
  }

  // Expense Management
  createExpense(expenseData: Partial<Expense>): Expense {
    const expense: Expense = {
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: expenseData.category || 'misc',
      amount: expenseData.amount || 0,
      currency: expenseData.currency || this.currentCurrency,
      date: expenseData.date || new Date().toISOString(),
      paidBy: expenseData.paidBy || this.currentUser,
      notes: expenseData.notes,
      attachments: expenseData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this.currentUser,
      isDeleted: false
    };

    this.expenses.push(expense);
    this.addToHistory(expense.id, 'expense', 'created');
    this.notifyListeners();

    return expense;
  }

  updateExpense(expenseId: string, updates: Partial<Expense>): Expense | null {
    const expenseIndex = this.expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) return null;

    const oldExpense = { ...this.expenses[expenseIndex] };
    const changes: FinanceHistory['changes'] = [];

    Object.keys(updates).forEach(key => {
      if (updates[key as keyof Expense] !== oldExpense[key as keyof Expense]) {
        changes.push({
          field: key,
          oldValue: oldExpense[key as keyof Expense],
          newValue: updates[key as keyof Expense]
        });
      }
    });

    this.expenses[expenseIndex] = {
      ...oldExpense,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addToHistory(expenseId, 'expense', 'updated', changes);
    this.notifyListeners();

    return this.expenses[expenseIndex];
  }

  deleteExpense(expenseId: string): boolean {
    const expenseIndex = this.expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) return false;

    this.expenses[expenseIndex] = {
      ...this.expenses[expenseIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };

    this.addToHistory(expenseId, 'expense', 'deleted');
    this.notifyListeners();

    return true;
  }

  // Budget Management
  createBudget(budgetData: Partial<Budget>): Budget {
    const budget: Budget = {
      id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: budgetData.name || 'Monthly Budget',
      totalAmount: budgetData.totalAmount || 0,
      currency: budgetData.currency || this.currentCurrency,
      period: budgetData.period || 'monthly',
      categories: budgetData.categories || {},
      startDate: budgetData.startDate || new Date().toISOString(),
      endDate: budgetData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this.currentUser,
      isDeleted: false
    };

    this.budgets.push(budget);
    this.addToHistory(budget.id, 'budget', 'created');
    this.notifyListeners();

    return budget;
  }

  updateBudget(budgetId: string, updates: Partial<Budget>): Budget | null {
    const budgetIndex = this.budgets.findIndex(b => b.id === budgetId);
    if (budgetIndex === -1) return null;

    const oldBudget = { ...this.budgets[budgetIndex] };
    const changes: FinanceHistory['changes'] = [];

    Object.keys(updates).forEach(key => {
      if (updates[key as keyof Budget] !== oldBudget[key as keyof Budget]) {
        changes.push({
          field: key,
          oldValue: oldBudget[key as keyof Budget],
          newValue: updates[key as keyof Budget]
        });
      }
    });

    this.budgets[budgetIndex] = {
      ...oldBudget,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addToHistory(budgetId, 'budget', 'updated', changes);
    this.notifyListeners();

    return this.budgets[budgetIndex];
  }

  deleteBudget(budgetId: string): boolean {
    const budgetIndex = this.budgets.findIndex(b => b.id === budgetId);
    if (budgetIndex === -1) return false;

    this.budgets[budgetIndex] = {
      ...this.budgets[budgetIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };

    this.addToHistory(budgetId, 'budget', 'deleted');
    this.notifyListeners();

    return true;
  }

  // Savings Goals Management
  createSavingsGoal(goalData: Partial<SavingsGoal>): SavingsGoal {
    const goal: SavingsGoal = {
      id: `savings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: goalData.name || 'New Savings Goal',
      targetAmount: goalData.targetAmount || 0,
      currency: goalData.currency || this.currentCurrency,
      deadline: goalData.deadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      contributions: goalData.contributions || {},
      currentAmount: goalData.currentAmount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this.currentUser,
      isDeleted: false
    };

    this.savingsGoals.push(goal);
    this.addToHistory(goal.id, 'savings', 'created');
    this.notifyListeners();

    return goal;
  }

  updateSavingsGoal(goalId: string, updates: Partial<SavingsGoal>): SavingsGoal | null {
    const goalIndex = this.savingsGoals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return null;

    const oldGoal = { ...this.savingsGoals[goalIndex] };
    const changes: FinanceHistory['changes'] = [];

    Object.keys(updates).forEach(key => {
      if (updates[key as keyof SavingsGoal] !== oldGoal[key as keyof SavingsGoal]) {
        changes.push({
          field: key,
          oldValue: oldGoal[key as keyof SavingsGoal],
          newValue: updates[key as keyof SavingsGoal]
        });
      }
    });

    this.savingsGoals[goalIndex] = {
      ...oldGoal,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addToHistory(goalId, 'savings', 'updated', changes);
    this.notifyListeners();

    return this.savingsGoals[goalIndex];
  }

  addContribution(goalId: string, partner: string, amount: number): boolean {
    const goal = this.savingsGoals.find(g => g.id === goalId);
    if (!goal) return false;

    const currentContribution = goal.contributions[partner] || 0;
    const newContribution = currentContribution + amount;
    
    const updatedContributions = {
      ...goal.contributions,
      [partner]: newContribution
    };

    const newCurrentAmount = Object.values(updatedContributions).reduce((sum, amount) => sum + amount, 0);

    this.updateSavingsGoal(goalId, {
      contributions: updatedContributions,
      currentAmount: newCurrentAmount
    });

    this.addToHistory(goalId, 'savings', 'contributed', [{
      field: 'contribution',
      oldValue: currentContribution,
      newValue: newContribution
    }], `${this.currentUser} contributed ${this.formatCurrency(amount, goal.currency)}`);

    return true;
  }

  // Big Expenses Management
  createBigExpense(expenseData: Partial<BigExpense>): BigExpense {
    const expense: BigExpense = {
      id: `big_expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: expenseData.title || 'New Big Expense',
      expectedAmount: expenseData.expectedAmount || 0,
      currency: expenseData.currency || this.currentCurrency,
      dueDate: expenseData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      assignedPartners: expenseData.assignedPartners || [this.currentUser],
      notes: expenseData.notes,
      priority: expenseData.priority || 'medium',
      status: expenseData.status || 'planned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this.currentUser,
      isDeleted: false
    };

    this.bigExpenses.push(expense);
    this.addToHistory(expense.id, 'big-expense', 'created');
    this.notifyListeners();

    return expense;
  }

  updateBigExpense(expenseId: string, updates: Partial<BigExpense>): BigExpense | null {
    const expenseIndex = this.bigExpenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) return null;

    const oldExpense = { ...this.bigExpenses[expenseIndex] };
    const changes: FinanceHistory['changes'] = [];

    Object.keys(updates).forEach(key => {
      if (updates[key as keyof BigExpense] !== oldExpense[key as keyof BigExpense]) {
        changes.push({
          field: key,
          oldValue: oldExpense[key as keyof BigExpense],
          newValue: updates[key as keyof BigExpense]
        });
      }
    });

    this.bigExpenses[expenseIndex] = {
      ...oldExpense,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addToHistory(expenseId, 'big-expense', 'updated', changes);
    this.notifyListeners();

    return this.bigExpenses[expenseIndex];
  }

  deleteBigExpense(expenseId: string): boolean {
    const expenseIndex = this.bigExpenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) return false;

    this.bigExpenses[expenseIndex] = {
      ...this.bigExpenses[expenseIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };

    this.addToHistory(expenseId, 'big-expense', 'deleted');
    this.notifyListeners();

    return true;
  }

  // Investment Management
  createInvestment(investmentData: Partial<Investment>): Investment {
    const investment: Investment = {
      id: `investment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: investmentData.name || 'New Investment',
      type: investmentData.type || 'mutual-fund',
      amount: investmentData.amount || 0,
      currency: investmentData.currency || this.currentCurrency,
      startDate: investmentData.startDate || new Date().toISOString(),
      maturityDate: investmentData.maturityDate,
      expectedReturn: investmentData.expectedReturn || 0,
      currentValue: investmentData.currentValue,
      notes: investmentData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this.currentUser,
      isDeleted: false
    };

    this.investments.push(investment);
    this.addToHistory(investment.id, 'investment', 'created');
    this.notifyListeners();

    return investment;
  }

  updateInvestment(investmentId: string, updates: Partial<Investment>): Investment | null {
    const investmentIndex = this.investments.findIndex(i => i.id === investmentId);
    if (investmentIndex === -1) return null;

    const oldInvestment = { ...this.investments[investmentIndex] };
    const changes: FinanceHistory['changes'] = [];

    Object.keys(updates).forEach(key => {
      if (updates[key as keyof Investment] !== oldInvestment[key as keyof Investment]) {
        changes.push({
          field: key,
          oldValue: oldInvestment[key as keyof Investment],
          newValue: updates[key as keyof Investment]
        });
      }
    });

    this.investments[investmentIndex] = {
      ...oldInvestment,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addToHistory(investmentId, 'investment', 'updated', changes);
    this.notifyListeners();

    return this.investments[investmentIndex];
  }

  deleteInvestment(investmentId: string): boolean {
    const investmentIndex = this.investments.findIndex(i => i.id === investmentId);
    if (investmentIndex === -1) return false;

    this.investments[investmentIndex] = {
      ...this.investments[investmentIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };

    this.addToHistory(investmentId, 'investment', 'deleted');
    this.notifyListeners();

    return true;
  }

  // Due Dates Management
  createDueDate(dueDateData: Partial<DueDate>): DueDate {
    const dueDate: DueDate = {
      id: `due_date_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: dueDateData.title || 'New Due Date',
      amount: dueDateData.amount || 0,
      currency: dueDateData.currency || this.currentCurrency,
      dueDate: dueDateData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: dueDateData.category || 'other',
      assignedPartner: dueDateData.assignedPartner || this.currentUser,
      isRecurring: dueDateData.isRecurring || false,
      recurringPattern: dueDateData.recurringPattern,
      notes: dueDateData.notes,
      isPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this.currentUser,
      isDeleted: false
    };

    this.dueDates.push(dueDate);
    this.addToHistory(dueDate.id, 'due-date', 'created');
    this.notifyListeners();

    return dueDate;
  }

  updateDueDate(dueDateId: string, updates: Partial<DueDate>): DueDate | null {
    const dueDateIndex = this.dueDates.findIndex(d => d.id === dueDateId);
    if (dueDateIndex === -1) return null;

    const oldDueDate = { ...this.dueDates[dueDateIndex] };
    const changes: FinanceHistory['changes'] = [];

    Object.keys(updates).forEach(key => {
      if (updates[key as keyof DueDate] !== oldDueDate[key as keyof DueDate]) {
        changes.push({
          field: key,
          oldValue: oldDueDate[key as keyof DueDate],
          newValue: updates[key as keyof DueDate]
        });
      }
    });

    this.dueDates[dueDateIndex] = {
      ...oldDueDate,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addToHistory(dueDateId, 'due-date', 'updated', changes);
    this.notifyListeners();

    return this.dueDates[dueDateIndex];
  }

  markAsPaid(dueDateId: string): boolean {
    const dueDate = this.dueDates.find(d => d.id === dueDateId);
    if (!dueDate) return false;

    this.updateDueDate(dueDateId, {
      isPaid: true,
      paidAt: new Date().toISOString()
    });

    this.addToHistory(dueDateId, 'due-date', 'paid', [{
      field: 'isPaid',
      oldValue: false,
      newValue: true
    }], `${this.currentUser} marked as paid`);

    return true;
  }

  deleteDueDate(dueDateId: string): boolean {
    const dueDateIndex = this.dueDates.findIndex(d => d.id === dueDateId);
    if (dueDateIndex === -1) return false;

    this.dueDates[dueDateIndex] = {
      ...this.dueDates[dueDateIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };

    this.addToHistory(dueDateId, 'due-date', 'deleted');
    this.notifyListeners();

    return true;
  }

  // Query Methods
  getExpenses(): Expense[] {
    return this.expenses.filter(expense => !expense.isDeleted);
  }

  getBudgets(): Budget[] {
    return this.budgets.filter(budget => !budget.isDeleted);
  }

  getSavingsGoals(): SavingsGoal[] {
    return this.savingsGoals.filter(goal => !goal.isDeleted);
  }

  getBigExpenses(): BigExpense[] {
    return this.bigExpenses.filter(expense => !expense.isDeleted);
  }

  getInvestments(): Investment[] {
    return this.investments.filter(investment => !investment.isDeleted);
  }

  getDueDates(): DueDate[] {
    return this.dueDates.filter(dueDate => !dueDate.isDeleted);
  }

  getFinanceHistory(itemId?: string): FinanceHistory[] {
    let history = this.financeHistory;
    if (itemId) {
      history = history.filter(h => h.itemId === itemId);
    }
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Analytics Methods
  getMonthlyExpenses(month?: string): Expense[] {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    return this.getExpenses().filter(expense => 
      expense.date.slice(0, 7) === targetMonth
    );
  }

  getExpensesByCategory(month?: string): { [category: string]: number } {
    const expenses = this.getMonthlyExpenses(month);
    const categoryTotals: { [category: string]: number } = {};
    
    expenses.forEach(expense => {
      const amount = this.convertCurrency(expense.amount, expense.currency, this.currentCurrency);
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + amount;
    });
    
    return categoryTotals;
  }

  getBudgetProgress(budgetId: string): { spent: number; remaining: number; percentage: number } {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return { spent: 0, remaining: 0, percentage: 0 };

    const expenses = this.getMonthlyExpenses();
    const spent = expenses.reduce((total, expense) => {
      const amount = this.convertCurrency(expense.amount, expense.currency, budget.currency);
      return total + amount;
    }, 0);

    const remaining = budget.totalAmount - spent;
    const percentage = (spent / budget.totalAmount) * 100;

    return { spent, remaining, percentage };
  }

  getUpcomingDueDates(days: number = 7): DueDate[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.getDueDates().filter(dueDate => {
      const dueDateObj = new Date(dueDate.dueDate);
      return dueDateObj >= now && dueDateObj <= futureDate && !dueDate.isPaid;
    });
  }

  getSavingsProgress(): { totalTarget: number; totalCurrent: number; percentage: number } {
    const goals = this.getSavingsGoals();
    const totalTarget = goals.reduce((sum, goal) => {
      const amount = this.convertCurrency(goal.targetAmount, goal.currency, this.currentCurrency);
      return sum + amount;
    }, 0);
    
    const totalCurrent = goals.reduce((sum, goal) => {
      const amount = this.convertCurrency(goal.currentAmount, goal.currency, this.currentCurrency);
      return sum + amount;
    }, 0);
    
    const percentage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    
    return { totalTarget, totalCurrent, percentage };
  }

  // Data Persistence
  private saveData() {
    localStorage.setItem('bondly-finance-expenses', JSON.stringify(this.expenses));
    localStorage.setItem('bondly-finance-budgets', JSON.stringify(this.budgets));
    localStorage.setItem('bondly-finance-savings', JSON.stringify(this.savingsGoals));
    localStorage.setItem('bondly-finance-big-expenses', JSON.stringify(this.bigExpenses));
    localStorage.setItem('bondly-finance-investments', JSON.stringify(this.investments));
    localStorage.setItem('bondly-finance-due-dates', JSON.stringify(this.dueDates));
    localStorage.setItem('bondly-finance-currency', this.currentCurrency);
  }

  private loadData() {
    const savedExpenses = localStorage.getItem('bondly-finance-expenses');
    const savedBudgets = localStorage.getItem('bondly-finance-budgets');
    const savedSavings = localStorage.getItem('bondly-finance-savings');
    const savedBigExpenses = localStorage.getItem('bondly-finance-big-expenses');
    const savedInvestments = localStorage.getItem('bondly-finance-investments');
    const savedDueDates = localStorage.getItem('bondly-finance-due-dates');
    const savedCurrency = localStorage.getItem('bondly-finance-currency');

    if (savedExpenses) this.expenses = JSON.parse(savedExpenses);
    if (savedBudgets) this.budgets = JSON.parse(savedBudgets);
    if (savedSavings) this.savingsGoals = JSON.parse(savedSavings);
    if (savedBigExpenses) this.bigExpenses = JSON.parse(savedBigExpenses);
    if (savedInvestments) this.investments = JSON.parse(savedInvestments);
    if (savedDueDates) this.dueDates = JSON.parse(savedDueDates);
    if (savedCurrency) this.currentCurrency = savedCurrency as 'USD' | 'INR';
  }

  private saveFinanceHistory() {
    localStorage.setItem('bondly-finance-history', JSON.stringify(this.financeHistory));
  }

  private loadFinanceHistory() {
    const saved = localStorage.getItem('bondly-finance-history');
    if (saved) {
      this.financeHistory = JSON.parse(saved);
    }
  }

  // Sample Data
  private initializeSampleData() {
    if (this.expenses.length === 0) {
      const sampleExpenses: Expense[] = [
        {
          id: 'expense_1',
          category: 'groceries',
          amount: 150,
          currency: 'USD',
          date: new Date().toISOString(),
          paidBy: this.currentUser,
          notes: 'Weekly grocery shopping',
          attachments: [],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.currentUser,
          isDeleted: false
        },
        {
          id: 'expense_2',
          category: 'rent',
          amount: 1200,
          currency: 'USD',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          paidBy: this.partnerUser,
          notes: 'Monthly rent payment',
          attachments: [],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.partnerUser,
          isDeleted: false
        }
      ];

      this.expenses = sampleExpenses;
    }

    if (this.budgets.length === 0) {
      const sampleBudget: Budget = {
        id: 'budget_1',
        name: 'Monthly Budget',
        totalAmount: 3000,
        currency: 'USD',
        period: 'monthly',
        categories: {
          rent: 1200,
          groceries: 400,
          transport: 200,
          entertainment: 300,
          utilities: 150,
          misc: 750
        },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: this.currentUser,
        isDeleted: false
      };

      this.budgets = [sampleBudget];
    }

    if (this.savingsGoals.length === 0) {
      const sampleGoal: SavingsGoal = {
        id: 'savings_1',
        name: 'House Fund',
        targetAmount: 50000,
        currency: 'USD',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        contributions: {
          [this.currentUser]: 5000,
          [this.partnerUser]: 4500
        },
        currentAmount: 9500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: this.currentUser,
        isDeleted: false
      };

      this.savingsGoals = [sampleGoal];
    }

    this.saveData();
  }
}

export const financeService = new FinanceService();
