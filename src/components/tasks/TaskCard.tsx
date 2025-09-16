import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Star,
  Paperclip,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Flag
} from 'lucide-react';
import { Task, Subtask } from '@/services/taskManagerService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  isEditing?: boolean;
  onEdit?: (taskId: string) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: (taskId: string, updates: Partial<Task>) => void;
  editData?: Partial<Task>;
  onEditDataChange?: (updates: Partial<Task>) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdate,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  isEditing = false,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  editData,
  onEditDataChange,
  showActions = true,
  compact = false
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-50';
      case 'high': return 'text-orange-500 bg-orange-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-3 w-3" />;
      case 'high': return <Flag className="h-3 w-3" />;
      case 'medium': return <Flag className="h-3 w-3" />;
      case 'low': return <Flag className="h-3 w-3" />;
      default: return <Flag className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'blocked': return 'text-red-600 bg-red-50';
      case 'todo': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  const handleSaveEdit = () => {
    if (editData && onSaveEdit) {
      onSaveEdit(task.id, editData);
    }
  };

  if (isEditing && editData) {
    return (
      <NeumorphicCard variant="elevated" className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
          <NeumorphicButton
            variant="secondary"
            size="sm"
            icon={<MoreVertical className="h-4 w-4" />}
            onClick={() => setShowMenu(!showMenu)}
          />
        </div>

        <div className="space-y-3">
          <NeumorphicInput
            placeholder="Task title..."
            value={editData.title || ''}
            onChange={(e) => onEditDataChange?.({ ...editData, title: e.target.value })}
          />

          <NeumorphicInput
            placeholder="Description..."
            value={editData.description || ''}
            onChange={(e) => onEditDataChange?.({ ...editData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
              value={editData.priority || task.priority}
              onChange={(e) => onEditDataChange?.({ ...editData, priority: e.target.value as Task['priority'] })}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>

            <select
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
              value={editData.status || task.status}
              onChange={(e) => onEditDataChange?.({ ...editData, status: e.target.value as Task['status'] })}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <NeumorphicInput
            type="datetime-local"
            value={editData.dueDate ? new Date(editData.dueDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => onEditDataChange?.({ ...editData, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
          />

          <div className="flex space-x-2">
            <NeumorphicButton
              variant="primary"
              onClick={handleSaveEdit}
              className="flex-1"
            >
              Save
            </NeumorphicButton>
            <NeumorphicButton
              variant="secondary"
              onClick={onCancelEdit}
              className="flex-1"
            >
              Cancel
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicCard>
    );
  }

  return (
    <NeumorphicCard 
      variant="elevated" 
      className={`p-4 transition-all duration-200 hover:shadow-lg ${compact ? 'p-3' : ''}`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <button
                onClick={() => onUpdate(task.id, { 
                  status: task.status === 'completed' ? 'todo' : 'completed' 
                })}
                className="transition-transform hover:scale-110"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 hover:text-green-500" />
                )}
              </button>
              
              <h3 className={`font-semibold text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-500' : ''} ${compact ? 'text-sm' : 'text-base'}`}>
                {task.title}
              </h3>
            </div>

            {!compact && task.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {showActions && (
            <div className="flex items-center space-x-1">
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<Edit className="h-3 w-3" />}
                onClick={() => onEdit?.(task.id)}
              />
              <NeumorphicButton
                variant="danger"
                size="sm"
                icon={<Trash2 className="h-3 w-3" />}
                onClick={() => onDelete(task.id)}
              />
            </div>
          )}
        </div>

        {/* Priority and Status */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)}
            <span className="capitalize">{task.priority}</span>
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            <span className="capitalize">{task.status.replace('-', ' ')}</span>
          </span>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center space-x-1 text-sm ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(task.dueDate).toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
        )}

        {/* Assigned Users */}
        {task.assignedTo.length > 0 && (
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4 text-gray-400" />
            <div className="flex space-x-1">
              {task.assignedTo.map((user, index) => {
                const getPartnerColor = (name: string) => {
                  if (name === 'Person1') return 'bg-gradient-to-br from-blue-400 to-blue-600';
                  if (name === 'Person2') return 'bg-gradient-to-br from-purple-400 to-purple-600';
                  return 'bg-gradient-to-br from-gray-400 to-gray-600';
                };
                
                return (
                  <div
                    key={index}
                    className={`w-6 h-6 ${getPartnerColor(user)} rounded-full flex items-center justify-center text-white text-xs font-medium`}
                    title={user}
                  >
                    {user.charAt(0).toUpperCase()}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex items-center space-x-1 flex-wrap">
            <Tag className="h-4 w-4 text-gray-400" />
            <div className="flex space-x-1 flex-wrap">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {task.attachments.length > 0 && (
          <div className="flex items-center space-x-1">
            <Paperclip className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
            >
              {showSubtasks ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span>
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </span>
            </button>

            {showSubtasks && (
              <div className="space-y-2 ml-4">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleSubtask(task.id, subtask.id)}
                      className="transition-transform hover:scale-110"
                    >
                      {subtask.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400 hover:text-green-500" />
                      )}
                    </button>
                    <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {subtask.title}
                    </span>
                    <NeumorphicButton
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={() => onDeleteSubtask(task.id, subtask.id)}
                    />
                  </div>
                ))}

                {showAddSubtask ? (
                  <div className="flex items-center space-x-2">
                    <NeumorphicInput
                      placeholder="Add subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                      className="flex-1"
                    />
                    <NeumorphicButton
                      variant="primary"
                      size="sm"
                      onClick={handleAddSubtask}
                    >
                      Add
                    </NeumorphicButton>
                    <NeumorphicButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAddSubtask(false)}
                    >
                      Cancel
                    </NeumorphicButton>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddSubtask(true)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    + Add subtask
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recurring Indicator */}
        {task.isRecurring && (
          <div className="flex items-center space-x-1 text-sm text-blue-500">
            <Clock className="h-4 w-4" />
            <span>Recurring ({task.recurringPattern})</span>
          </div>
        )}
      </div>
    </NeumorphicCard>
  );
};
