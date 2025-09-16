import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  User, 
  Tag, 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Star,
  Target,
  Heart,
  Trophy,
  Sparkles,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Flag,
  Plus,
  Eye
} from 'lucide-react';
import { BucketListItem, BucketListSubtask } from '@/services/bucketListService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

interface BucketListCardProps {
  item: BucketListItem;
  onUpdate: (itemId: string, updates: Partial<BucketListItem>) => void;
  onDelete: (itemId: string) => void;
  onToggleSubtask: (itemId: string, subtaskId: string) => void;
  onAddSubtask: (itemId: string, title: string, assignedTo: string) => void;
  onDeleteSubtask: (itemId: string, subtaskId: string) => void;
  onUpdateProgress: (itemId: string, progress: number) => void;
  onViewDetails: (item: BucketListItem) => void;
  isEditing?: boolean;
  editData?: Partial<BucketListItem>;
  onEditDataChange?: (updates: Partial<BucketListItem>) => void;
  onSaveEdit?: (itemId: string, updates: Partial<BucketListItem>) => void;
  onCancelEdit?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export const BucketListCard: React.FC<BucketListCardProps> = ({
  item,
  onUpdate,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onUpdateProgress,
  onViewDetails,
  isEditing = false,
  editData,
  onEditDataChange,
  onSaveEdit,
  onCancelEdit,
  showActions = true,
  compact = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskAssignedTo, setNewSubtaskAssignedTo] = useState('Person1');

  const getPriorityColor = (priority: BucketListItem['priority']) => {
    switch (priority) {
      case 'dream': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: BucketListItem['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'paused': return 'text-orange-600 bg-orange-50';
      case 'not-started': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: BucketListItem['category']) => {
    switch (category) {
      case 'travel': return <MapPin className="h-4 w-4" />;
      case 'experiences': return <Sparkles className="h-4 w-4" />;
      case 'goals': return <Target className="h-4 w-4" />;
      case 'adventures': return <Trophy className="h-4 w-4" />;
      case 'romantic': return <Heart className="h-4 w-4" />;
      case 'personal': return <Star className="h-4 w-4" />;
      case 'career': return <Target className="h-4 w-4" />;
      case 'health': return <Heart className="h-4 w-4" />;
      case 'learning': return <Star className="h-4 w-4" />;
      case 'family': return <Heart className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: BucketListItem['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-orange-600';
      case 'extreme': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(item.id, newSubtaskTitle.trim(), newSubtaskAssignedTo);
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  const handleSaveEdit = () => {
    if (editData && onSaveEdit) {
      onSaveEdit(item.id, editData);
    }
  };

  const isOverdue = item.targetDate && new Date(item.targetDate) < new Date() && item.status !== 'completed';
  const completedSubtasks = item.subtasks.filter(st => st.completed).length;
  const totalSubtasks = item.subtasks.length;

  if (isEditing && editData) {
    return (
      <NeumorphicCard variant="elevated" className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit Bucket List Item</h3>
          <NeumorphicButton
            variant="secondary"
            size="sm"
            icon={<MoreVertical className="h-4 w-4" />}
            onClick={() => setShowMenu(!showMenu)}
          />
        </div>

        <div className="space-y-3">
          <NeumorphicInput
            placeholder="Item title..."
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
              value={editData.priority || item.priority}
              onChange={(e) => onEditDataChange?.({ ...editData, priority: e.target.value as BucketListItem['priority'] })}
            >
              <option value="low">💚 Low</option>
              <option value="medium">💛 Medium</option>
              <option value="high">🧡 High</option>
              <option value="dream">✨ Dream</option>
            </select>

            <select
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
              value={editData.status || item.status}
              onChange={(e) => onEditDataChange?.({ ...editData, status: e.target.value as BucketListItem['status'] })}
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="flex space-x-3">
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
    <NeumorphicCard variant="elevated" className={`${compact ? 'p-3' : 'p-5'} ${compact ? 'flex items-center space-x-4' : 'space-y-4'}`}>
      {compact ? (
        // Compact List View
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex-shrink-0">
                {getCategoryIcon(item.category)}
              </div>
              <h3 className="font-semibold text-gray-900 truncate text-base">{item.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)} flex-shrink-0`}>
                {item.priority}
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span className="font-medium">{item.progress}%</span>
              </div>
              {item.targetDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.targetDate).toLocaleDateString()}</span>
                </div>
              )}
              {item.estimatedCost && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{item.estimatedCost} {item.currency}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={<Eye className="h-4 w-4" />}
              onClick={() => onViewDetails(item)}
            />
            {showActions && (
              <div className="relative">
                <NeumorphicButton
                  variant="secondary"
                  size="sm"
                  icon={<MoreVertical className="h-4 w-4" />}
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border p-2 space-y-1 z-10 min-w-32">
                    <button
                      onClick={() => {
                        onUpdate(item.id, { status: item.status === 'completed' ? 'in-progress' : 'completed' });
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {item.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => {
                        onViewDetails(item);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        onDelete(item.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Full Card View
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0">
                  {getCategoryIcon(item.category)}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">{item.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)} flex-shrink-0`}>
                  {item.priority}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.description}</p>
            </div>
            
            {showActions && (
              <div className="relative ml-3 flex-shrink-0">
                <NeumorphicButton
                  variant="secondary"
                  size="sm"
                  icon={<MoreVertical className="h-4 w-4" />}
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border p-2 space-y-1 z-10 min-w-32">
                    <button
                      onClick={() => {
                        onUpdate(item.id, { status: item.status === 'completed' ? 'in-progress' : 'completed' });
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {item.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => {
                        onViewDetails(item);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        onDelete(item.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-gray-900">{item.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {item.targetDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-gray-500 text-xs">Date</div>
                  <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(item.targetDate).toLocaleDateString()}
                    {isOverdue && <span className="text-red-500 text-xs ml-1">(Overdue)</span>}
                  </div>
                </div>
              </div>
            )}
            
            {item.estimatedCost && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-gray-500 text-xs">Cost</div>
                  <div className="font-medium text-gray-900">{item.estimatedCost} {item.currency}</div>
                </div>
              </div>
            )}
            
            {item.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-gray-500 text-xs">Location</div>
                  <div className="font-medium text-gray-900 truncate">{item.location}</div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-gray-500 text-xs">Effort</div>
                <div className={`font-medium ${getDifficultyColor(item.difficulty)}`}>{item.difficulty}</div>
              </div>
            </div>
          </div>

          {/* Assigned Users */}
          {item.assignedTo.length > 0 && (
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex space-x-2">
                {item.assignedTo.map((user, index) => {
                  const getPartnerColor = (name: string) => {
                    if (name === 'Person1') return 'bg-gradient-to-br from-blue-400 to-blue-600';
                    if (name === 'Person2') return 'bg-gradient-to-br from-purple-400 to-purple-600';
                    return 'bg-gradient-to-br from-gray-400 to-gray-600';
                  };
                  
                  return (
                    <div
                      key={index}
                      className={`w-7 h-7 ${getPartnerColor(user)} rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm`}
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
          {item.tags.length > 0 && (
            <div className="flex items-start space-x-3">
              <Tag className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-2">
                {item.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
                {item.tags.length > 4 && (
                  <span className="text-xs text-gray-500 font-medium">+{item.tags.length - 4} more</span>
                )}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {item.subtasks.length > 0 && (
            <div className="space-y-3">
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showSubtasks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="font-medium">Subtasks ({completedSubtasks}/{totalSubtasks})</span>
              </button>
              
              {showSubtasks && (
                <div className="space-y-2 pl-6">
                  {item.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center space-x-3">
                      <button
                        onClick={() => onToggleSubtask(item.id, subtask.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {subtask.title}
                      </span>
                      <div className={`w-5 h-5 rounded-full ${
                        subtask.assignedTo === 'Person1' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} title={subtask.assignedTo} />
                    </div>
                  ))}
                  
                  {showAddSubtask ? (
                    <div className="flex items-center space-x-2 pt-2">
                      <NeumorphicInput
                        placeholder="Add subtask..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                      />
                      <select
                        className="p-2 bg-gray-100 rounded-lg text-xs border-0"
                        value={newSubtaskAssignedTo}
                        onChange={(e) => setNewSubtaskAssignedTo(e.target.value)}
                      >
                        <option value="Person1">Person1</option>
                        <option value="Person2">Person2</option>
                      </select>
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
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors ml-9"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add subtask</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status.replace('-', ' ')}
              </span>
              {item.isShared && (
                <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-600 font-medium">
                  Shared
                </span>
              )}
            </div>
            
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={<Eye className="h-4 w-4" />}
              onClick={() => onViewDetails(item)}
            >
              View Details
            </NeumorphicButton>
          </div>
        </div>
      )}
    </NeumorphicCard>
  );
};
