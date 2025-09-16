import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Calendar, 
  Plus, 
  Filter, 
  Search,
  ArrowUpDown,
  PieChart,
  BarChart3,
  LineChart,
  Wallet,
  PiggyBank,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  Expense, 
  Budget, 
  SavingsGoal, 
  BigExpense, 
  Investment, 
  DueDate,
  FinanceHistory 
} from '@/services/financeService';
import { financeService } from '@/services/financeService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { useResponsive } from '@/hooks/use-responsive';
import { ConfettiAnimation } from '@/components/animations/ConfettiAnimation';
import { CheckmarkAnimation } from '@/components/animations/CheckmarkAnimation';

interface FinanceManagerProps {
  className?: string;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({ className = '' }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'budgets' | 'savings' | 'big-expenses' | 'investments' | 'due-dates'>('overview');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [bigExpenses, setBigExpenses] = useState<BigExpense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<'USD' | 'INR'>('USD');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnimations, setShowAnimations] = useState<{ confetti: boolean; checkmark: boolean }>({ confetti: false, checkmark: false });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'expense' | 'budget' | 'savings' | 'big-expense' | 'investment' | 'due-date'>('expense');

  // Form states
  const [newExpense, setNewExpense] = useState({
    category: 'misc' as Expense['category'],
    amount: '',
    currency: 'USD' as 'USD' | 'INR',
    date: new Date().toISOString().slice(0, 16),
    paidBy: 'Alex',
    notes: ''
  });

  const [newBudget, setNewBudget] = useState({
    name: '',
    totalAmount: '',
    currency: 'USD' as 'USD' | 'INR',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly'
  });

  const [newSavingsGoal, setNewSavingsGoal] = useState({
    name: '',
    targetAmount: '',
    currency: 'USD' as 'USD' | 'INR',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });

  const [newBigExpense, setNewBigExpense] = useState({
    title: '',
    expectedAmount: '',
    currency: 'USD' as 'USD' | 'INR',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: ''
  });

  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: 'mutual-fund' as 'mutual-fund' | 'stocks' | 'fixed-deposit' | 'crypto' | 'bonds' | 'real-estate',
    amount: '',
    currency: 'USD' as 'USD' | 'INR',
    expectedReturn: '',
    notes: ''
  });

  const [newDueDate, setNewDueDate] = useState({
    title: '',
    amount: '',
    currency: 'USD' as 'USD' | 'INR',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    category: 'other' as 'rent' | 'loan' | 'subscription' | 'insurance' | 'utility' | 'other',
    assignedPartner: 'Alex',
    notes: ''
  });

  useEffect(() => {
    // Subscribe to finance data updates
    const unsubscribe = financeService.subscribe((data) => {
      setExpenses(data.expenses);
      setBudgets(data.budgets);
      setSavingsGoals(data.savingsGoals);
      setBigExpenses(data.bigExpenses);
      setInvestments(data.investments);
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

  const handleCreateExpense = () => {
    if (newExpense.amount && newExpense.category) {
      financeService.createExpense({
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        currency: newExpense.currency,
        date: new Date(newExpense.date).toISOString(),
        paidBy: newExpense.paidBy,
        notes: newExpense.notes
      });
      
      setNewExpense({
        category: 'misc',
        amount: '',
        currency: currentCurrency,
        date: new Date().toISOString().slice(0, 16),
        paidBy: 'Alex',
        notes: ''
      });
      setShowAddModal(false);
      setShowAnimations(prev => ({ ...prev, checkmark: true }));
      setTimeout(() => setShowAnimations(prev => ({ ...prev, checkmark: false })), 2000);
    }
  };

  const handleCreateBudget = () => {
    if (newBudget.name && newBudget.totalAmount) {
      financeService.createBudget({
        name: newBudget.name,
        totalAmount: parseFloat(newBudget.totalAmount),
        currency: newBudget.currency,
        period: newBudget.period
      });
      
      setNewBudget({
        name: '',
        totalAmount: '',
        currency: currentCurrency,
        period: 'monthly'
      });
      setShowAddModal(false);
      setShowAnimations(prev => ({ ...prev, checkmark: true }));
      setTimeout(() => setShowAnimations(prev => ({ ...prev, checkmark: false })), 2000);
    }
  };

  const handleCreateSavingsGoal = () => {
    if (newSavingsGoal.name && newSavingsGoal.targetAmount) {
      financeService.createSavingsGoal({
        name: newSavingsGoal.name,
        targetAmount: parseFloat(newSavingsGoal.targetAmount),
        currency: newSavingsGoal.currency,
        deadline: new Date(newSavingsGoal.deadline).toISOString()
      });
      
      setNewSavingsGoal({
        name: '',
        targetAmount: '',
        currency: currentCurrency,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      });
      setShowAddModal(false);
      setShowAnimations(prev => ({ ...prev, checkmark: true }));
      setTimeout(() => setShowAnimations(prev => ({ ...prev, checkmark: false })), 2000);
    }
  };

  const handleCreateBigExpense = () => {
    if (newBigExpense.title && newBigExpense.expectedAmount) {
      financeService.createBigExpense({
        title: newBigExpense.title,
        expectedAmount: parseFloat(newBigExpense.expectedAmount),
        currency: newBigExpense.currency,
        dueDate: new Date(newBigExpense.dueDate).toISOString(),
        priority: newBigExpense.priority,
        notes: newBigExpense.notes
      });
      
      setNewBigExpense({
        title: '',
        expectedAmount: '',
        currency: currentCurrency,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        priority: 'medium',
        notes: ''
      });
      setShowAddModal(false);
      setShowAnimations(prev => ({ ...prev, checkmark: true }));
      setTimeout(() => setShowAnimations(prev => ({ ...prev, checkmark: false })), 2000);
    }
  };

  const handleCreateInvestment = () => {
    if (newInvestment.name && newInvestment.amount) {
      financeService.createInvestment({
        name: newInvestment.name,
        type: newInvestment.type,
        amount: parseFloat(newInvestment.amount),
        currency: newInvestment.currency,
        expectedReturn: parseFloat(newInvestment.expectedReturn) || 0,
        notes: newInvestment.notes
      });
      
      setNewInvestment({
        name: '',
        type: 'mutual-fund',
        amount: '',
        currency: currentCurrency,
        expectedReturn: '',
        notes: ''
      });
      setShowAddModal(false);
      setShowAnimations(prev => ({ ...prev, checkmark: true }));
      setTimeout(() => setShowAnimations(prev => ({ ...prev, checkmark: false })), 2000);
    }
  };

  const handleCreateDueDate = () => {
    if (newDueDate.title && newDueDate.amount) {
      financeService.createDueDate({
        title: newDueDate.title,
        amount: parseFloat(newDueDate.amount),
        currency: newDueDate.currency,
        dueDate: new Date(newDueDate.dueDate).toISOString(),
        category: newDueDate.category,
        assignedPartner: newDueDate.assignedPartner,
        notes: newDueDate.notes
      });
      
      setNewDueDate({
        title: '',
        amount: '',
        currency: currentCurrency,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        category: 'other',
        assignedPartner: 'Alex',
        notes: ''
      });
      setShowAddModal(false);
      setShowAnimations(prev => ({ ...prev, checkmark: true }));
      setTimeout(() => setShowAnimations(prev => ({ ...prev, checkmark: false })), 2000);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      rent: 'bg-red-100 text-red-700',
      groceries: 'bg-green-100 text-green-700',
      transport: 'bg-blue-100 text-blue-700',
      entertainment: 'bg-purple-100 text-purple-700',
      utilities: 'bg-yellow-100 text-yellow-700',
      healthcare: 'bg-pink-100 text-pink-700',
      education: 'bg-indigo-100 text-indigo-700',
      misc: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.misc;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      planned: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.planned;
  };

  const renderOverview = () => {
    const monthlyExpenses = financeService.getMonthlyExpenses();
    const expensesByCategory = financeService.getExpensesByCategory();
    const savingsProgress = financeService.getSavingsProgress();
    const upcomingDueDates = financeService.getUpcomingDueDates(7);

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NeumorphicCard variant="inset" className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {financeService.formatCurrency(
                monthlyExpenses.reduce((sum, expense) => 
                  sum + financeService.convertCurrency(expense.amount, expense.currency, currentCurrency), 0
                ), currentCurrency
              )}
            </div>
            <div className="text-sm text-gray-800">Monthly Expenses</div>
          </NeumorphicCard>
          
          <NeumorphicCard variant="inset" className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {financeService.formatCurrency(savingsProgress.totalCurrent, currentCurrency)}
            </div>
            <div className="text-sm text-gray-600">Total Savings</div>
          </NeumorphicCard>
          
          <NeumorphicCard variant="inset" className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {bigExpenses.length}
            </div>
            <div className="text-sm text-gray-800">Big Expenses</div>
          </NeumorphicCard>
          
          <NeumorphicCard variant="inset" className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {upcomingDueDates.length}
            </div>
            <div className="text-sm text-gray-600">Due This Week</div>
          </NeumorphicCard>
        </div>

        {/* Charts and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Category */}
          <NeumorphicCard variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(category).replace('bg-', 'bg-').replace('text-', 'text-')}`}></div>
                    <span className="text-sm font-medium capitalize text-gray-900">{category}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {financeService.formatCurrency(amount, currentCurrency)}
                  </span>
                </div>
              ))}
            </div>
          </NeumorphicCard>

          {/* Savings Progress */}
          <NeumorphicCard variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Progress</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {savingsProgress.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-800">of total savings goals</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(savingsProgress.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-800">
                <span>{financeService.formatCurrency(savingsProgress.totalCurrent, currentCurrency)}</span>
                <span>{financeService.formatCurrency(savingsProgress.totalTarget, currentCurrency)}</span>
              </div>
            </div>
          </NeumorphicCard>
        </div>

        {/* Recent Activity */}
        <NeumorphicCard variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {monthlyExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryColor(expense.category)}`}>
                    <span className="text-xs font-bold">{expense.category.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="font-medium capitalize text-gray-900">{expense.category}</div>
                    <div className="text-sm text-gray-700">{expense.paidBy}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{financeService.getDisplayAmount(expense.amount, expense.currency)}</div>
                  <div className="text-sm text-gray-700">
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NeumorphicCard>
      </div>
    );
  };

  const renderExpenses = () => {
    const filteredExpenses = expenses.filter(expense => 
      !searchQuery || 
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-4">
        {filteredExpenses.map((expense) => (
          <NeumorphicCard key={expense.id} variant="elevated" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(expense.category)}`}>
                  <span className="text-sm font-bold">{expense.category.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="font-semibold capitalize">{expense.category}</div>
                  <div className="text-sm text-gray-500">
                    {expense.paidBy} • {new Date(expense.date).toLocaleDateString()}
                  </div>
                  {expense.notes && (
                    <div className="text-sm text-gray-600 mt-1">{expense.notes}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {financeService.getDisplayAmount(expense.amount, expense.currency)}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <NeumorphicButton
                    variant="secondary"
                    size="sm"
                    icon={<Edit className="h-3 w-3" />}
                  />
                  <NeumorphicButton
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="h-3 w-3" />}
                    onClick={() => financeService.deleteExpense(expense.id)}
                  />
                </div>
              </div>
            </div>
          </NeumorphicCard>
        ))}
      </div>
    );
  };

  const renderSavingsGoals = () => {
    return (
      <div className="space-y-4">
        {savingsGoals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <NeumorphicCard key={goal.id} variant="elevated" className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{goal.name}</h3>
                  <span className="text-sm text-gray-500">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{financeService.getDisplayAmount(goal.currentAmount, goal.currency)}</span>
                    <span>{financeService.getDisplayAmount(goal.targetAmount, goal.currency)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm font-medium text-green-600">
                    {progress.toFixed(1)}% Complete
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {Object.entries(goal.contributions).map(([partner, amount]) => (
                      <div key={partner}>
                        {partner}: {financeService.formatCurrency(amount, goal.currency)}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-1">
                    <NeumorphicButton
                      variant="primary"
                      size="sm"
                      onClick={() => financeService.addContribution(goal.id, 'Alex', 100)}
                    >
                      +$100
                    </NeumorphicButton>
                    <NeumorphicButton
                      variant="secondary"
                      size="sm"
                      icon={<Edit className="h-3 w-3" />}
                    />
                    <NeumorphicButton
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="h-3 w-3" />}
                    />
                  </div>
                </div>
              </div>
            </NeumorphicCard>
          );
        })}
      </div>
    );
  };

  const renderBigExpenses = () => {
    return (
      <div className="space-y-4">
        {bigExpenses.map((expense) => {
          const daysUntilDue = Math.ceil((new Date(expense.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return (
            <NeumorphicCard key={expense.id} variant="elevated" className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{expense.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(expense.priority)}`}>
                      {expense.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {financeService.getDisplayAmount(expense.expectedAmount, expense.currency)}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Due in</div>
                    <div className={`font-bold ${daysUntilDue <= 7 ? 'text-red-600' : daysUntilDue <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {daysUntilDue} days
                    </div>
                  </div>
                </div>

                {expense.notes && (
                  <div className="text-sm text-gray-600">{expense.notes}</div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Partners: {expense.assignedPartners.join(', ')}
                  </div>
                  <div className="flex space-x-1">
                    <NeumorphicButton
                      variant="secondary"
                      size="sm"
                      icon={<Edit className="h-3 w-3" />}
                    />
                    <NeumorphicButton
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="h-3 w-3" />}
                    />
                  </div>
                </div>
              </div>
            </NeumorphicCard>
          );
        })}
      </div>
    );
  };

  const renderDueDates = () => {
    const upcomingDueDates = financeService.getUpcomingDueDates(30);
    
    return (
      <div className="space-y-4">
        {upcomingDueDates.map((dueDate) => {
          const daysUntilDue = Math.ceil((new Date(dueDate.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return (
            <NeumorphicCard key={dueDate.id} variant="elevated" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(dueDate.category)}`}>
                    <span className="text-sm font-bold">{dueDate.category.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{dueDate.title}</div>
                    <div className="text-sm text-gray-500">
                      {dueDate.assignedPartner} • {new Date(dueDate.dueDate).toLocaleDateString()}
                    </div>
                    {dueDate.notes && (
                      <div className="text-sm text-gray-600 mt-1">{dueDate.notes}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {financeService.getDisplayAmount(dueDate.amount, dueDate.currency)}
                    </div>
                    <div className={`text-sm font-medium ${daysUntilDue <= 3 ? 'text-red-600' : daysUntilDue <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {daysUntilDue} days left
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {!dueDate.isPaid && (
                      <NeumorphicButton
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle2 className="h-3 w-3" />}
                        onClick={() => financeService.markAsPaid(dueDate.id)}
                      >
                        Pay
                      </NeumorphicButton>
                    )}
                    <NeumorphicButton
                      variant="secondary"
                      size="sm"
                      icon={<Edit className="h-3 w-3" />}
                    />
                    <NeumorphicButton
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="h-3 w-3" />}
                    />
                  </div>
                </div>
              </div>
            </NeumorphicCard>
          );
        })}
      </div>
    );
  };

  const renderAddModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <NeumorphicCard variant="elevated" className="w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Add {addModalType.charAt(0).toUpperCase() + addModalType.slice(1).replace('-', ' ')}
            </h3>
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={() => setShowAddModal(false)}
            />
          </div>

          <div className="space-y-4">
            {addModalType === 'expense' && (
              <>
                <NeumorphicInput
                  placeholder="Amount..."
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
                <select
                  className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as Expense['category'] })}
                >
                  <option value="rent">Rent</option>
                  <option value="groceries">Groceries</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="misc">Miscellaneous</option>
                </select>
                <NeumorphicInput
                  placeholder="Notes..."
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                />
              </>
            )}

            {addModalType === 'savings' && (
              <>
                <NeumorphicInput
                  placeholder="Goal name..."
                  value={newSavingsGoal.name}
                  onChange={(e) => setNewSavingsGoal({ ...newSavingsGoal, name: e.target.value })}
                />
                <NeumorphicInput
                  placeholder="Target amount..."
                  type="number"
                  value={newSavingsGoal.targetAmount}
                  onChange={(e) => setNewSavingsGoal({ ...newSavingsGoal, targetAmount: e.target.value })}
                />
                <NeumorphicInput
                  type="datetime-local"
                  value={newSavingsGoal.deadline}
                  onChange={(e) => setNewSavingsGoal({ ...newSavingsGoal, deadline: e.target.value })}
                />
              </>
            )}

            {addModalType === 'big-expense' && (
              <>
                <NeumorphicInput
                  placeholder="Title..."
                  value={newBigExpense.title}
                  onChange={(e) => setNewBigExpense({ ...newBigExpense, title: e.target.value })}
                />
                <NeumorphicInput
                  placeholder="Expected amount..."
                  type="number"
                  value={newBigExpense.expectedAmount}
                  onChange={(e) => setNewBigExpense({ ...newBigExpense, expectedAmount: e.target.value })}
                />
                <select
                  className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={newBigExpense.priority}
                  onChange={(e) => setNewBigExpense({ ...newBigExpense, priority: e.target.value as BigExpense['priority'] })}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <NeumorphicInput
                  placeholder="Notes..."
                  value={newBigExpense.notes}
                  onChange={(e) => setNewBigExpense({ ...newBigExpense, notes: e.target.value })}
                />
              </>
            )}

            <div className="flex space-x-3">
              <NeumorphicButton
                variant="primary"
                onClick={() => {
                  switch (addModalType) {
                    case 'expense': handleCreateExpense(); break;
                    case 'savings': handleCreateSavingsGoal(); break;
                    case 'big-expense': handleCreateBigExpense(); break;
                    default: break;
                  }
                }}
                className="flex-1"
              >
                Create
              </NeumorphicButton>
              <NeumorphicButton
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                Cancel
              </NeumorphicButton>
            </div>
          </div>
        </NeumorphicCard>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Animations */}
      {showAnimations.confetti && <ConfettiAnimation isActive={true} onComplete={() => setShowAnimations(prev => ({ ...prev, confetti: false }))} />}
      {showAnimations.checkmark && <CheckmarkAnimation isActive={true} onComplete={() => setShowAnimations(prev => ({ ...prev, checkmark: false }))} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Manager</h1>
          <p className="text-gray-600">Track and manage your shared finances</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <NeumorphicButton
            variant="secondary"
            icon={<ArrowUpDown className="h-4 w-4" />}
            onClick={handleCurrencyToggle}
          >
            {currentCurrency} ↔ {currentCurrency === 'USD' ? 'INR' : 'USD'}
          </NeumorphicButton>
          
          <NeumorphicButton
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setAddModalType('expense');
              setShowAddModal(true);
            }}
          >
            Add Expense
          </NeumorphicButton>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'expenses', label: 'Expenses', icon: CreditCard },
          { id: 'budgets', label: 'Budgets', icon: Target },
          { id: 'savings', label: 'Savings', icon: PiggyBank },
          { id: 'big-expenses', label: 'Big Expenses', icon: AlertCircle },
          { id: 'investments', label: 'Investments', icon: TrendingUp },
          { id: 'due-dates', label: 'Due Dates', icon: Calendar }
        ].map((tab) => (
          <NeumorphicButton
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            icon={<tab.icon className="h-4 w-4" />}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </NeumorphicButton>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex-1">
          <NeumorphicInput
            variant="search"
            placeholder="Search..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <NeumorphicButton
          variant="secondary"
          icon={<Filter className="h-4 w-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filter
        </NeumorphicButton>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'expenses' && renderExpenses()}
        {activeTab === 'budgets' && (
          <div className="text-center py-8 text-gray-500">
            Budget management coming soon...
          </div>
        )}
        {activeTab === 'savings' && renderSavingsGoals()}
        {activeTab === 'big-expenses' && renderBigExpenses()}
        {activeTab === 'investments' && (
          <div className="text-center py-8 text-gray-500">
            Investment tracking coming soon...
          </div>
        )}
        {activeTab === 'due-dates' && renderDueDates()}
      </div>

      {/* Add Modal */}
      {renderAddModal()}
    </div>
  );
};
