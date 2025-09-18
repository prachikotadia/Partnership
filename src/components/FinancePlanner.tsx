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
  addedBy: 'Person1' | 'Person2';
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
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
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
                <p className="text-muted-foreground">Add your first expense to get started!</p>
              </div>
            ) : (
              expenses.slice(0, 5).map((expense) => {
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
              })
            )}
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
            {Object.keys(categoryTotals).length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No categories yet</h3>
                <p className="text-muted-foreground">Add expenses to see category breakdown!</p>
              </div>
            ) : (
              Object.entries(categoryTotals).map(([category, amount]) => {
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
              })
            )}
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
          {savingsGoals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No savings goals yet</h3>
              <p className="text-muted-foreground">Create your first savings goal to get started!</p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}