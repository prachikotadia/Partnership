import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  User, 
  Tag, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  PiggyBank,
  CreditCard,
  Target,
  BarChart3
} from 'lucide-react';
import { 
  Expense, 
  Budget, 
  SavingsGoal, 
  BigExpense, 
  Investment, 
  DueDate 
} from '@/services/financeService';
import { financeService } from '@/services/financeService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

interface FinanceCardProps {
  type: 'expense' | 'budget' | 'savings' | 'big-expense' | 'investment' | 'due-date';
  data: Expense | Budget | SavingsGoal | BigExpense | Investment | DueDate;
  onUpdate?: (id: string, updates: any) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  isEditing?: boolean;
  editData?: any;
  onEditDataChange?: (updates: any) => void;
  onSaveEdit?: (id: string, updates: any) => void;
  onCancelEdit?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({
  type,
  data,
  onUpdate,
  onDelete,
  onEdit,
  isEditing = false,
  editData,
  onEditDataChange,
  onSaveEdit,
  onCancelEdit,
  showActions = true,
  compact = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      rent: 'bg-red-100 text-red-700 border-red-200',
      groceries: 'bg-green-100 text-green-700 border-green-200',
      transport: 'bg-blue-100 text-blue-700 border-blue-200',
      entertainment: 'bg-purple-100 text-purple-700 border-purple-200',
      utilities: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      healthcare: 'bg-pink-100 text-pink-700 border-pink-200',
      education: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      misc: 'bg-gray-100 text-gray-700 border-gray-200',
      // Investment types
      'mutual-fund': 'bg-blue-100 text-blue-700 border-blue-200',
      stocks: 'bg-green-100 text-green-700 border-green-200',
      'fixed-deposit': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      crypto: 'bg-orange-100 text-orange-700 border-orange-200',
      bonds: 'bg-purple-100 text-purple-700 border-purple-200',
      'real-estate': 'bg-red-100 text-red-700 border-red-200',
      // Due date categories
      loan: 'bg-red-100 text-red-700 border-red-200',
      subscription: 'bg-blue-100 text-blue-700 border-blue-200',
      insurance: 'bg-green-100 text-green-700 border-green-200',
      utility: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200'
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expense': return <CreditCard className="h-4 w-4" />;
      case 'budget': return <Target className="h-4 w-4" />;
      case 'savings': return <PiggyBank className="h-4 w-4" />;
      case 'big-expense': return <AlertCircle className="h-4 w-4" />;
      case 'investment': return <TrendingUp className="h-4 w-4" />;
      case 'due-date': return <Clock className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const renderExpenseCard = (expense: Expense) => {
    if (isEditing && editData) {
      return (
        <NeumorphicCard variant="elevated" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Edit Expense</h3>
            <div className="flex space-x-2">
              <NeumorphicButton
                variant="primary"
                size="sm"
                onClick={() => onSaveEdit?.(expense.id, editData)}
              >
                Save
              </NeumorphicButton>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                onClick={onCancelEdit}
              >
                Cancel
              </NeumorphicButton>
            </div>
          </div>

          <div className="space-y-3">
            <NeumorphicInput
              placeholder="Amount..."
              type="number"
              value={editData.amount || ''}
              onChange={(e) => onEditDataChange?.({ ...editData, amount: parseFloat(e.target.value) })}
            />

            <select
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
              value={editData.category || expense.category}
              onChange={(e) => onEditDataChange?.({ ...editData, category: e.target.value })}
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
              value={editData.notes || ''}
              onChange={(e) => onEditDataChange?.({ ...editData, notes: e.target.value })}
            />
          </div>
        </NeumorphicCard>
      );
    }

    return (
      <NeumorphicCard variant="elevated" className="p-4">
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
            {showActions && (
              <div className="flex space-x-1">
                <NeumorphicButton
                  variant="secondary"
                  size="sm"
                  icon={<Edit className="h-3 w-3" />}
                  onClick={() => onEdit?.(expense.id)}
                />
                <NeumorphicButton
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="h-3 w-3" />}
                  onClick={() => onDelete?.(expense.id)}
                />
              </div>
            )}
          </div>
        </div>
      </NeumorphicCard>
    );
  };

  const renderSavingsGoalCard = (goal: SavingsGoal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const daysUntilDeadline = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (isEditing && editData) {
      return (
        <NeumorphicCard variant="elevated" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Edit Savings Goal</h3>
            <div className="flex space-x-2">
              <NeumorphicButton
                variant="primary"
                size="sm"
                onClick={() => onSaveEdit?.(goal.id, editData)}
              >
                Save
              </NeumorphicButton>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                onClick={onCancelEdit}
              >
                Cancel
              </NeumorphicButton>
            </div>
          </div>

          <div className="space-y-3">
            <NeumorphicInput
              placeholder="Goal name..."
              value={editData.name || goal.name}
              onChange={(e) => onEditDataChange?.({ ...editData, name: e.target.value })}
            />

            <NeumorphicInput
              placeholder="Target amount..."
              type="number"
              value={editData.targetAmount || ''}
              onChange={(e) => onEditDataChange?.({ ...editData, targetAmount: parseFloat(e.target.value) })}
            />

            <NeumorphicInput
              type="datetime-local"
              value={editData.deadline ? new Date(editData.deadline).toISOString().slice(0, 16) : ''}
              onChange={(e) => onEditDataChange?.({ ...editData, deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            />
          </div>
        </NeumorphicCard>
      );
    }

    return (
      <NeumorphicCard variant="elevated" className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{goal.name}</h3>
            <span className="text-sm text-gray-500">
              {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Overdue'}
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
            {showActions && (
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
                  onClick={() => onEdit?.(goal.id)}
                />
                <NeumorphicButton
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="h-3 w-3" />}
                  onClick={() => onDelete?.(goal.id)}
                />
              </div>
            )}
          </div>
        </div>
      </NeumorphicCard>
    );
  };

  const renderBigExpenseCard = (expense: BigExpense) => {
    const daysUntilDue = Math.ceil((new Date(expense.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (isEditing && editData) {
      return (
        <NeumorphicCard variant="elevated" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Edit Big Expense</h3>
            <div className="flex space-x-2">
              <NeumorphicButton
                variant="primary"
                size="sm"
                onClick={() => onSaveEdit?.(expense.id, editData)}
              >
                Save
              </NeumorphicButton>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                onClick={onCancelEdit}
              >
                Cancel
              </NeumorphicButton>
            </div>
          </div>

          <div className="space-y-3">
            <NeumorphicInput
              placeholder="Title..."
              value={editData.title || expense.title}
              onChange={(e) => onEditDataChange?.({ ...editData, title: e.target.value })}
            />

            <NeumorphicInput
              placeholder="Expected amount..."
              type="number"
              value={editData.expectedAmount || ''}
              onChange={(e) => onEditDataChange?.({ ...editData, expectedAmount: parseFloat(e.target.value) })}
            />

            <select
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
              value={editData.priority || expense.priority}
              onChange={(e) => onEditDataChange?.({ ...editData, priority: e.target.value })}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            <NeumorphicInput
              placeholder="Notes..."
              value={editData.notes || ''}
              onChange={(e) => onEditDataChange?.({ ...editData, notes: e.target.value })}
            />
          </div>
        </NeumorphicCard>
      );
    }

    return (
      <NeumorphicCard variant="elevated" className="p-4">
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
            {showActions && (
              <div className="flex space-x-1">
                <NeumorphicButton
                  variant="secondary"
                  size="sm"
                  icon={<Edit className="h-3 w-3" />}
                  onClick={() => onEdit?.(expense.id)}
                />
                <NeumorphicButton
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="h-3 w-3" />}
                  onClick={() => onDelete?.(expense.id)}
                />
              </div>
            )}
          </div>
        </div>
      </NeumorphicCard>
    );
  };

  const renderDueDateCard = (dueDate: DueDate) => {
    const daysUntilDue = Math.ceil((new Date(dueDate.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (isEditing && editData) {
      return (
        <NeumorphicCard variant="elevated" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Edit Due Date</h3>
            <div className="flex space-x-2">
              <NeumorphicButton
                variant="primary"
                size="sm"
                onClick={() => onSaveEdit?.(dueDate.id, editData)}
              >
                Save
              </NeumorphicButton>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                onClick={onCancelEdit}
              >
                Cancel
              </NeumorphicButton>
            </div>
          </div>

          <div className="space-y-3">
            <NeumorphicInput
              placeholder="Title..."
              value={editData.title || dueDate.title}
              onChange={(e) => onEditDataChange?.({ ...editData, title: e.target.value })}
            />

            <NeumorphicInput
              placeholder="Amount..."
              type="number"
              value={editData.amount || ''}
              onChange={(e) => onEditDataChange?.({ ...editData, amount: parseFloat(e.target.value) })}
            />

            <select
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
              value={editData.category || dueDate.category}
              onChange={(e) => onEditDataChange?.({ ...editData, category: e.target.value })}
            >
              <option value="rent">Rent</option>
              <option value="loan">Loan</option>
              <option value="subscription">Subscription</option>
              <option value="insurance">Insurance</option>
              <option value="utility">Utility</option>
              <option value="other">Other</option>
            </select>

            <NeumorphicInput
              placeholder="Notes..."
              value={editData.notes || ''}
              onChange={(e) => onEditDataChange?.({ ...editData, notes: e.target.value })}
            />
          </div>
        </NeumorphicCard>
      );
    }

    return (
      <NeumorphicCard variant="elevated" className="p-4">
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
            {showActions && (
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
                  onClick={() => onEdit?.(dueDate.id)}
                />
                <NeumorphicButton
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="h-3 w-3" />}
                  onClick={() => onDelete?.(dueDate.id)}
                />
              </div>
            )}
          </div>
        </div>
      </NeumorphicCard>
    );
  };

  const renderCard = () => {
    switch (type) {
      case 'expense':
        return renderExpenseCard(data as Expense);
      case 'savings':
        return renderSavingsGoalCard(data as SavingsGoal);
      case 'big-expense':
        return renderBigExpenseCard(data as BigExpense);
      case 'due-date':
        return renderDueDateCard(data as DueDate);
      default:
        return (
          <NeumorphicCard variant="elevated" className="p-4">
            <div className="text-center text-gray-500">
              Card type not implemented: {type}
            </div>
          </NeumorphicCard>
        );
    }
  };

  return renderCard();
};
