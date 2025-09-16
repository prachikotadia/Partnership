import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PiggyBank, 
  AlertCircle,
  Calendar,
  PieChart,
  BarChart3,
  LineChart,
  ArrowUpDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  Expense, 
  Budget, 
  SavingsGoal, 
  BigExpense, 
  DueDate 
} from '@/services/financeService';
import { financeService } from '@/services/financeService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { useResponsive } from '@/hooks/use-responsive';

interface FinanceDashboardProps {
  className?: string;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ className = '' }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [bigExpenses, setBigExpenses] = useState<BigExpense[]>([]);
  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<'USD' | 'INR'>('USD');
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    const unsubscribe = financeService.subscribe((data) => {
      setExpenses(data.expenses);
      setBudgets(data.budgets);
      setSavingsGoals(data.savingsGoals);
      setBigExpenses(data.bigExpenses);
      setDueDates(data.dueDates);
      setCurrentCurrency(data.currency);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleCurrencyToggle = () => {
    const newCurrency = currentCurrency === 'USD' ? 'INR' : 'USD';
    financeService.setCurrency(newCurrency);
  };

  // Analytics calculations
  const monthlyExpenses = financeService.getMonthlyExpenses();
  const expensesByCategory = financeService.getExpensesByCategory();
  const savingsProgress = financeService.getSavingsProgress();
  const upcomingDueDates = financeService.getUpcomingDueDates(7);
  const overdueDueDates = financeService.getUpcomingDueDates(-30).filter(d => !d.isPaid);

  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, expense) => 
    sum + financeService.convertCurrency(expense.amount, expense.currency, currentCurrency), 0
  );

  const totalSavings = savingsGoals.reduce((sum, goal) => 
    sum + financeService.convertCurrency(goal.currentAmount, goal.currency, currentCurrency), 0
  );

  const totalBigExpenses = bigExpenses.reduce((sum, expense) => 
    sum + financeService.convertCurrency(expense.expectedAmount, expense.currency, currentCurrency), 0
  );

  const totalDueThisWeek = upcomingDueDates.reduce((sum, dueDate) => 
    sum + financeService.convertCurrency(dueDate.amount, dueDate.currency, currentCurrency), 0
  );

  // Budget analysis
  const currentBudget = budgets.find(b => b.period === 'monthly');
  const budgetProgress = currentBudget ? financeService.getBudgetProgress(currentBudget.id) : null;

  // Get top 3 savings goals
  const topSavingsGoals = savingsGoals
    .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))
    .slice(0, 3);

  // Get next big expense
  const nextBigExpense = bigExpenses
    .filter(e => e.status === 'planned' || e.status === 'in-progress')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      rent: 'bg-red-500',
      groceries: 'bg-green-500',
      transport: 'bg-blue-500',
      entertainment: 'bg-purple-500',
      utilities: 'bg-yellow-500',
      healthcare: 'bg-pink-500',
      education: 'bg-indigo-500',
      misc: 'bg-gray-500'
    };
    return colors[category] || colors.misc;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || colors.medium;
  };

  const renderExpenseChart = () => {
    const total = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    
    return (
      <div className="space-y-3">
        {Object.entries(expensesByCategory).map(([category, amount]) => {
          const percentage = total > 0 ? (amount / total) * 100 : 0;
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
                  <span className="text-sm font-medium capitalize">{category}</span>
                </div>
                <span className="text-sm font-bold">
                  {financeService.formatCurrency(amount, currentCurrency)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getCategoryColor(category)} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSavingsProgress = () => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {savingsProgress.percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">of total savings goals</div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(savingsProgress.percentage, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{financeService.formatCurrency(savingsProgress.totalCurrent, currentCurrency)}</span>
          <span>{financeService.formatCurrency(savingsProgress.totalTarget, currentCurrency)}</span>
        </div>

        {topSavingsGoals.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Top Goals</h4>
            {topSavingsGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{goal.name}</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderBudgetProgress = () => {
    if (!budgetProgress || !currentBudget) {
      return (
        <div className="text-center text-gray-500 py-8">
          No monthly budget set
        </div>
      );
    }

    const isOverBudget = budgetProgress.percentage > 100;
    const isNearBudget = budgetProgress.percentage > 80;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold ${isOverBudget ? 'text-red-600' : isNearBudget ? 'text-yellow-600' : 'text-green-600'}`}>
            {budgetProgress.percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">of monthly budget</div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-red-500' : isNearBudget ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetProgress.percentage, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Spent: {financeService.formatCurrency(budgetProgress.spent, currentBudget.currency)}</span>
          <span>Budget: {financeService.formatCurrency(currentBudget.totalAmount, currentBudget.currency)}</span>
        </div>

        <div className="text-center">
          <div className={`text-lg font-bold ${budgetProgress.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {budgetProgress.remaining >= 0 ? 'Remaining' : 'Over Budget'}
          </div>
          <div className={`text-xl font-bold ${budgetProgress.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {financeService.formatCurrency(Math.abs(budgetProgress.remaining), currentBudget.currency)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600">Overview of your shared finances</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <NeumorphicButton
            variant="secondary"
            icon={showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </NeumorphicButton>
          
          <NeumorphicButton
            variant="secondary"
            icon={<ArrowUpDown className="h-4 w-4" />}
            onClick={handleCurrencyToggle}
          >
            {currentCurrency} ↔ {currentCurrency === 'USD' ? 'INR' : 'USD'}
          </NeumorphicButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NeumorphicCard variant="inset" className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {financeService.formatCurrency(totalMonthlyExpenses, currentCurrency)}
          </div>
          <div className="text-sm text-gray-600">Monthly Expenses</div>
        </NeumorphicCard>
        
        <NeumorphicCard variant="inset" className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <PiggyBank className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {financeService.formatCurrency(totalSavings, currentCurrency)}
          </div>
          <div className="text-sm text-gray-600">Total Savings</div>
        </NeumorphicCard>
        
        <NeumorphicCard variant="inset" className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {financeService.formatCurrency(totalBigExpenses, currentCurrency)}
          </div>
          <div className="text-sm text-gray-600">Big Expenses</div>
        </NeumorphicCard>
        
        <NeumorphicCard variant="inset" className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {financeService.formatCurrency(totalDueThisWeek, currentCurrency)}
          </div>
          <div className="text-sm text-gray-600">Due This Week</div>
        </NeumorphicCard>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <NeumorphicCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Expenses by Category</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          {Object.keys(expensesByCategory).length > 0 ? (
            renderExpenseChart()
          ) : (
            <div className="text-center text-gray-500 py-8">
              No expenses this month
            </div>
          )}
        </NeumorphicCard>

        {/* Budget Progress */}
        <NeumorphicCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          {renderBudgetProgress()}
        </NeumorphicCard>
      </div>

      {/* Savings and Big Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Progress */}
        <NeumorphicCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Savings Progress</h3>
            <PiggyBank className="h-5 w-5 text-gray-400" />
          </div>
          {savingsGoals.length > 0 ? (
            renderSavingsProgress()
          ) : (
            <div className="text-center text-gray-500 py-8">
              No savings goals set
            </div>
          )}
        </NeumorphicCard>

        {/* Next Big Expense */}
        <NeumorphicCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Next Big Expense</h3>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
          {nextBigExpense ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{nextBigExpense.title}</h4>
                <div className="text-2xl font-bold text-purple-600">
                  {financeService.getDisplayAmount(nextBigExpense.expectedAmount, nextBigExpense.currency)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Due in</div>
                  <div className={`font-bold ${getPriorityColor(nextBigExpense.priority)}`}>
                    {Math.ceil((new Date(nextBigExpense.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Priority</div>
                  <div className={`font-bold ${getPriorityColor(nextBigExpense.priority)}`}>
                    {nextBigExpense.priority}
                  </div>
                </div>
              </div>

              {nextBigExpense.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {nextBigExpense.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No upcoming big expenses
            </div>
          )}
        </NeumorphicCard>
      </div>

      {/* Upcoming Due Dates */}
      {upcomingDueDates.length > 0 && (
        <NeumorphicCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Due Dates</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingDueDates.slice(0, 5).map((dueDate) => {
              const daysUntilDue = Math.ceil((new Date(dueDate.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={dueDate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-700">
                        {dueDate.category.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{dueDate.title}</div>
                      <div className="text-sm text-gray-500">
                        {dueDate.assignedPartner} • {new Date(dueDate.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {financeService.getDisplayAmount(dueDate.amount, dueDate.currency)}
                    </div>
                    <div className={`text-sm font-medium ${daysUntilDue <= 3 ? 'text-red-600' : daysUntilDue <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {daysUntilDue} days left
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </NeumorphicCard>
      )}

      {/* Overdue Alerts */}
      {overdueDueDates.length > 0 && (
        <NeumorphicCard variant="elevated" className="p-6 border-l-4 border-red-500">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-red-600">Overdue Payments</h3>
          </div>
          <div className="space-y-3">
            {overdueDueDates.map((dueDate) => {
              const daysOverdue = Math.ceil((new Date().getTime() - new Date(dueDate.dueDate).getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={dueDate.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-red-700">
                        {dueDate.category.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{dueDate.title}</div>
                      <div className="text-sm text-gray-500">
                        {dueDate.assignedPartner} • {new Date(dueDate.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {financeService.getDisplayAmount(dueDate.amount, dueDate.currency)}
                    </div>
                    <div className="text-sm font-medium text-red-600">
                      {daysOverdue} days overdue
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </NeumorphicCard>
      )}
    </div>
  );
};
