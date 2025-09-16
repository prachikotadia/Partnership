import React, { useState } from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Tag, 
  Paperclip, 
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Flag,
  Star,
  History
} from 'lucide-react';
import { Task, Subtask } from '@/services/taskManagerService';
import { taskManagerService } from '@/services/taskManagerService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { TaskHistory } from './TaskHistory';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newTag, setNewTag] = useState('');

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-50';
      case 'high': return 'text-orange-500 bg-orange-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
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

  const handleEdit = () => {
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      tags: task.tags,
      category: task.category
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleToggleSubtask = (subtaskId: string) => {
    taskManagerService.toggleSubtask(task.id, subtaskId);
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      taskManagerService.addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    taskManagerService.deleteSubtask(task.id, subtaskId);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !task.tags.includes(newTag.trim())) {
      const updatedTags = [...task.tags, newTag.trim()];
      onUpdate(task.id, { tags: updatedTags });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = task.tags.filter(tag => tag !== tagToRemove);
    onUpdate(task.id, { tags: updatedTags });
  };

  const handleAssignUser = (user: string) => {
    const isAssigned = task.assignedTo.includes(user);
    const updatedAssignedTo = isAssigned 
      ? task.assignedTo.filter(u => u !== user)
      : [...task.assignedTo, user];
    onUpdate(task.id, { assignedTo: updatedAssignedTo });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const taskHistory = taskManagerService.getTaskHistory(task.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <NeumorphicCard variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
            <div className="flex items-center space-x-2">
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<History className="h-4 w-4" />}
                onClick={() => setShowHistory(!showHistory)}
              >
                History
              </NeumorphicButton>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<Edit className="h-4 w-4" />}
                onClick={handleEdit}
              />
              <NeumorphicButton
                variant="danger"
                size="sm"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
              />
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<X className="h-4 w-4" />}
                onClick={onClose}
              />
            </div>
          </div>

          {/* Task Content */}
          <div className="space-y-4">
            {/* Title */}
            {isEditing ? (
              <NeumorphicInput
                placeholder="Task title..."
                value={editData.title || ''}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            ) : (
              <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
            )}

            {/* Description */}
            {isEditing ? (
              <NeumorphicInput
                placeholder="Description..."
                value={editData.description || ''}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
            ) : (
              task.description && (
                <p className="text-gray-700">{task.description}</p>
              )
            )}

            {/* Priority and Status */}
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <div className="flex space-x-2">
                  <select
                    className="p-2 bg-gray-100 rounded-lg border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-gray-800"
                    value={editData.priority || task.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as Task['priority'] })}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                  
                  <select
                    className="p-2 bg-gray-100 rounded-lg border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-gray-800"
                    value={editData.status || task.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as Task['status'] })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    <Flag className="h-3 w-3" />
                    <span className="capitalize">{task.priority}</span>
                  </span>
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    <span className="capitalize">{task.status.replace('-', ' ')}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              {isEditing ? (
                <NeumorphicInput
                  type="datetime-local"
                  value={editData.dueDate ? new Date(editData.dueDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                />
              ) : (
                <span className={`text-sm ${isOverdue ? 'text-red-500' : 'text-gray-600'}`}>
                  {task.dueDate ? (
                    <>
                      {new Date(task.dueDate).toLocaleDateString()}
                      {isOverdue && ' (Overdue)'}
                    </>
                  ) : (
                    'No due date'
                  )}
                </span>
              )}
            </div>

            {/* Assigned Users */}
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                {['Jay', 'Prachi'].map(user => (
                  <button
                    key={user}
                    onClick={() => handleAssignUser(user)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                      task.assignedTo.includes(user)
                        ? user === 'Jay' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
                      user === 'Jay' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      user === 'Prachi' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                      'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}>
                      {user.charAt(0)}
                    </div>
                    <span>{user}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2 flex-wrap">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                  >
                    <span>#{tag}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
                
                {isEditing && (
                  <div className="flex items-center space-x-1">
                    <NeumorphicInput
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="w-24"
                    />
                    <NeumorphicButton
                      variant="primary"
                      size="sm"
                      icon={<Plus className="h-3 w-3" />}
                      onClick={handleAddTag}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Subtasks */}
            {task.subtasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Subtasks ({completedSubtasks}/{totalSubtasks})
                  </h4>
                  {!isEditing && (
                    <NeumorphicButton
                      variant="secondary"
                      size="sm"
                      icon={<Plus className="h-3 w-3" />}
                      onClick={() => setShowAddSubtask(true)}
                    >
                      Add
                    </NeumorphicButton>
                  )}
                </div>
                
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleSubtask(subtask.id)}
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
                      {isEditing && (
                        <NeumorphicButton
                          variant="danger"
                          size="sm"
                          icon={<Trash2 className="h-3 w-3" />}
                          onClick={() => handleDeleteSubtask(subtask.id)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {showAddSubtask && (
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
                )}
              </div>
            )}

            {/* Attachments */}
            {task.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Attachments</h4>
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{attachment.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring Indicator */}
            {task.isRecurring && (
              <div className="flex items-center space-x-2 text-sm text-blue-500">
                <Clock className="h-4 w-4" />
                <span>Recurring ({task.recurringPattern})</span>
              </div>
            )}
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex space-x-3 pt-4 border-t">
              <NeumorphicButton
                variant="primary"
                onClick={handleSaveEdit}
                className="flex-1"
              >
                Save Changes
              </NeumorphicButton>
              <NeumorphicButton
                variant="secondary"
                onClick={handleCancelEdit}
                className="flex-1"
              >
                Cancel
              </NeumorphicButton>
            </div>
          )}

          {/* History */}
          {showHistory && (
            <div className="pt-4 border-t">
              <TaskHistory history={taskHistory} />
            </div>
          )}
        </div>
      </NeumorphicCard>
    </div>
  );
};
