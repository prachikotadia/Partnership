import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface FinanceEntry {
  id: string;
  title: string;
  amount: number;
  currency: 'USD' | 'INR';
  category: 'income' | 'expense' | 'savings' | 'investment';
  description?: string;
  date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  currency: 'USD' | 'INR';
  period: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  currency: 'USD' | 'INR';
  target_date?: string;
  created_at: string;
  updated_at: string;
}

class SupabaseFinanceService {
  private listeners: ((entries: FinanceEntry[]) => void)[] = [];
  private budgetListeners: ((budgets: Budget[]) => void)[] = [];
  private savingsListeners: ((goals: SavingsGoal[]) => void)[] = [];

  // Subscribe to finance entry changes
  subscribe(listener: (entries: FinanceEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Subscribe to budget changes
  subscribeBudgets(listener: (budgets: Budget[]) => void) {
    this.budgetListeners.push(listener);
    return () => {
      this.budgetListeners = this.budgetListeners.filter(l => l !== listener);
    };
  }

  // Subscribe to savings goal changes
  subscribeSavings(listener: (goals: SavingsGoal[]) => void) {
    this.savingsListeners.push(listener);
    return () => {
      this.savingsListeners = this.savingsListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(entries: FinanceEntry[]) {
    this.listeners.forEach(listener => listener(entries));
  }

  private notifyBudgetListeners(budgets: Budget[]) {
    this.budgetListeners.forEach(listener => listener(budgets));
  }

  private notifySavingsListeners(goals: SavingsGoal[]) {
    this.savingsListeners.forEach(listener => listener(goals));
  }

  // Get all finance entries for the current user
  async getFinanceEntries(): Promise<FinanceEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('finance_entries')
        .select('*')
        .eq('created_by', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching finance entries:', error);
      return [];
    }
  }

  // Create a new finance entry
  async createFinanceEntry(entryData: Omit<FinanceEntry, 'id' | 'created_at' | 'updated_at'>): Promise<FinanceEntry | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('finance_entries')
        .insert({
          ...entryData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Entry Added',
        `Finance entry "${data.title}" has been added successfully.`,
        'success'
      );

      // Refresh entries
      const entries = await this.getFinanceEntries();
      this.notifyListeners(entries);

      return data;
    } catch (error) {
      console.error('Error creating finance entry:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to add finance entry. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Update a finance entry
  async updateFinanceEntry(entryId: string, updates: Partial<FinanceEntry>): Promise<FinanceEntry | null> {
    try {
      const { data, error } = await supabase
        .from('finance_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Entry Updated',
        `Finance entry "${data.title}" has been updated successfully.`,
        'success'
      );

      // Refresh entries
      const entries = await this.getFinanceEntries();
      this.notifyListeners(entries);

      return data;
    } catch (error) {
      console.error('Error updating finance entry:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to update finance entry. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Delete a finance entry
  async deleteFinanceEntry(entryId: string): Promise<boolean> {
    try {
      const { data: currentEntry } = await supabase
        .from('finance_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      const { error } = await supabase
        .from('finance_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Entry Deleted',
        `Finance entry "${currentEntry?.title}" has been deleted successfully.`,
        'success'
      );

      // Refresh entries
      const entries = await this.getFinanceEntries();
      this.notifyListeners(entries);

      return true;
    } catch (error) {
      console.error('Error deleting finance entry:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to delete finance entry. Please try again.',
        'error'
      );
      return false;
    }
  }

  // Get budgets
  async getBudgets(): Promise<Budget[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  }

  // Create a budget
  async createBudget(budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Budget | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budgetData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Budget Created',
        `Budget for "${data.category}" has been created successfully.`,
        'success'
      );

      // Refresh budgets
      const budgets = await this.getBudgets();
      this.notifyBudgetListeners(budgets);

      return data;
    } catch (error) {
      console.error('Error creating budget:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to create budget. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Update a budget
  async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget | null> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', budgetId)
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Budget Updated',
        `Budget for "${data.category}" has been updated successfully.`,
        'success'
      );

      // Refresh budgets
      const budgets = await this.getBudgets();
      this.notifyBudgetListeners(budgets);

      return data;
    } catch (error) {
      console.error('Error updating budget:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to update budget. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Delete a budget
  async deleteBudget(budgetId: string): Promise<boolean> {
    try {
      const { data: currentBudget } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Budget Deleted',
        `Budget for "${currentBudget?.category}" has been deleted successfully.`,
        'success'
      );

      // Refresh budgets
      const budgets = await this.getBudgets();
      this.notifyBudgetListeners(budgets);

      return true;
    } catch (error) {
      console.error('Error deleting budget:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to delete budget. Please try again.',
        'error'
      );
      return false;
    }
  }

  // Get savings goals
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      return [];
    }
  }

  // Create a savings goal
  async createSavingsGoal(goalData: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<SavingsGoal | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          ...goalData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Goal Created',
        `Savings goal "${data.title}" has been created successfully.`,
        'success'
      );

      // Refresh goals
      const goals = await this.getSavingsGoals();
      this.notifySavingsListeners(goals);

      return data;
    } catch (error) {
      console.error('Error creating savings goal:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to create savings goal. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Update a savings goal
  async updateSavingsGoal(goalId: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal | null> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Goal Updated',
        `Savings goal "${data.title}" has been updated successfully.`,
        'success'
      );

      // Refresh goals
      const goals = await this.getSavingsGoals();
      this.notifySavingsListeners(goals);

      return data;
    } catch (error) {
      console.error('Error updating savings goal:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to update savings goal. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Delete a savings goal
  async deleteSavingsGoal(goalId: string): Promise<boolean> {
    try {
      const { data: currentGoal } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Goal Deleted',
        `Savings goal "${currentGoal?.title}" has been deleted successfully.`,
        'success'
      );

      // Refresh goals
      const goals = await this.getSavingsGoals();
      this.notifySavingsListeners(goals);

      return true;
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to delete savings goal. Please try again.',
        'error'
      );
      return false;
    }
  }

  // Get finance statistics
  async getFinanceStats(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    totalInvestment: number;
    netWorth: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('finance_entries')
        .select('amount, category')
        .eq('created_by', user.id);

      if (error) throw error;

      const stats = {
        totalIncome: data.filter(e => e.category === 'income').reduce((sum, e) => sum + e.amount, 0),
        totalExpenses: data.filter(e => e.category === 'expense').reduce((sum, e) => sum + e.amount, 0),
        totalSavings: data.filter(e => e.category === 'savings').reduce((sum, e) => sum + e.amount, 0),
        totalInvestment: data.filter(e => e.category === 'investment').reduce((sum, e) => sum + e.amount, 0),
        netWorth: 0
      };

      stats.netWorth = stats.totalIncome + stats.totalSavings + stats.totalInvestment - stats.totalExpenses;

      return stats;
    } catch (error) {
      console.error('Error fetching finance stats:', error);
      return { totalIncome: 0, totalExpenses: 0, totalSavings: 0, totalInvestment: 0, netWorth: 0 };
    }
  }

  // Get entries by category
  async getEntriesByCategory(category: string): Promise<FinanceEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('finance_entries')
        .select('*')
        .eq('created_by', user.id)
        .eq('category', category)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching entries by category:', error);
      return [];
    }
  }

  // Get entries by date range
  async getEntriesByDateRange(startDate: string, endDate: string): Promise<FinanceEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('finance_entries')
        .select('*')
        .eq('created_by', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching entries by date range:', error);
      return [];
    }
  }
}

export const supabaseFinanceService = new SupabaseFinanceService();
