import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Target,
  PiggyBank,
  CreditCard,
  ShoppingCart,
  Home,
  Car,
  Coffee
} from 'lucide-react';

const CURRENCIES = {
  USD: { symbol: '$', rate: 1, name: 'US Dollar' },
  INR: { symbol: '₹', rate: 83.12, name: 'Indian Rupee' },
  EUR: { symbol: '€', rate: 0.85, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.73, name: 'British Pound' },
} as const;

type CurrencyCode = keyof typeof CURRENCIES;

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  addedBy: 'Alex' | 'Sam';
}

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
}

export function FinancePlanner() {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', title: 'Groceries', amount: 120.50, category: 'Food', date: new Date(), addedBy: 'Alex' },
    { id: '2', title: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: new Date(Date.now() - 24*60*60*1000), addedBy: 'Sam' },
    { id: '3', title: 'Gas Station', amount: 45.00, category: 'Transport', date: new Date(Date.now() - 2*24*60*60*1000), addedBy: 'Alex' },
    { id: '4', title: 'Restaurant Dinner', amount: 85.30, category: 'Food', date: new Date(Date.now() - 3*24*60*60*1000), addedBy: 'Sam' },
  ]);

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      title: 'Paris Trip',
      targetAmount: 3000,
      currentAmount: 2040,
      targetDate: new Date(2024, 5, 15),
    },
    {
      id: '2',
      title: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 6500,
      targetDate: new Date(2024, 11, 31),
    },
    {
      id: '3',
      title: 'New Laptop',
      targetAmount: 1500,
      currentAmount: 450,
      targetDate: new Date(2024, 3, 1),
    },
  ]);

  const monthlyBudget = 2500;
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = monthlyBudget - totalSpent;

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food': return Coffee;
      case 'transport': return Car;
      case 'entertainment': return ShoppingCart;
      case 'housing': return Home;
      default: return CreditCard;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food': return 'bg-gradient-coral';
      case 'transport': return 'bg-gradient-teal';
      case 'entertainment': return 'bg-gradient-primary';
      case 'housing': return 'bg-gradient-secondary';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-glass-border hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Budget</p>
                <p className="text-2xl font-bold">${monthlyBudget.toLocaleString()}</p>
                <Progress value={(totalSpent / monthlyBudget) * 100} className="mt-2" />
              </div>
              <div className="p-3 rounded-xl bg-gradient-primary">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-glass-border hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spent This Month</p>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                <p className="text-xs text-destructive">
                  {((totalSpent / monthlyBudget) * 100).toFixed(1)}% of budget
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-coral">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-glass-border hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${Math.abs(remainingBudget).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {remainingBudget >= 0 ? 'Under budget' : 'Over budget'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${remainingBudget >= 0 ? 'bg-gradient-teal' : 'bg-gradient-coral'}`}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card className="glass-card border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Recent Expenses
            </CardTitle>
            <Button size="sm" className="bg-gradient-primary hover-lift">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenses.slice(0, 5).map((expense) => {
              const CategoryIcon = getCategoryIcon(expense.category);
              return (
                <div key={expense.id} className="flex items-center justify-between p-3 glass-card rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(expense.category)}`}>
                      <CategoryIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{expense.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{expense.category}</span>
                        <span>•</span>
                        <span>Added by {expense.addedBy}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">-${expense.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categoryTotals).map(([category, amount]) => {
              const CategoryIcon = getCategoryIcon(category);
              const percentage = (amount / totalSpent) * 100;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                        <CategoryIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <Card className="glass-card border-glass-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Savings Goals
          </CardTitle>
          <Button size="sm" className="bg-gradient-teal hover-lift">
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const remaining = goal.targetAmount - goal.currentAmount;
              const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={goal.id} className="glass-card border-glass-border hover-lift">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <PiggyBank className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${goal.currentAmount.toLocaleString()}</span>
                          <span>${goal.targetAmount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-glass-border">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Remaining:</span>
                          <span className="font-medium">${remaining.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Past due'}</span>
                          <Badge variant={progress >= 100 ? "default" : daysLeft < 30 ? "destructive" : "secondary"}>
                            {progress >= 100 ? "Complete" : daysLeft < 30 ? "Urgent" : "On Track"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}