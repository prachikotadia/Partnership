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
  Plus,
  X,
  AlertCircle,
  Flag,
  Share2,
  Bookmark
} from 'lucide-react';
import { BucketListItem, BucketListSubtask } from '@/services/bucketListService';
import { bucketListService } from '@/services/bucketListService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

interface BucketListDetailModalProps {
  item: BucketListItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (itemId: string, updates: Partial<BucketListItem>) => void;
  onDelete: (itemId: string) => void;
  onToggleSubtask: (itemId: string, subtaskId: string) => void;
  onAddSubtask: (itemId: string, title: string, assignedTo: string) => void;
  onDeleteSubtask: (itemId: string, subtaskId: string) => void;
  onUpdateProgress: (itemId: string, progress: number) => void;
}

export const BucketListDetailModal: React.FC<BucketListDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onUpdateProgress
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<BucketListItem>>({});
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskAssignedTo, setNewSubtaskAssignedTo] = useState('Jay');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newTag, setNewTag] = useState('');

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
      case 'travel': return <MapPin className="h-5 w-5" />;
      case 'experiences': return <Sparkles className="h-5 w-5" />;
      case 'goals': return <Target className="h-5 w-5" />;
      case 'adventures': return <Trophy className="h-5 w-5" />;
      case 'romantic': return <Heart className="h-5 w-5" />;
      case 'personal': return <Star className="h-5 w-5" />;
      case 'career': return <Target className="h-5 w-5" />;
      case 'health': return <Heart className="h-5 w-5" />;
      case 'learning': return <Star className="h-5 w-5" />;
      case 'family': return <Heart className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
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

  const handleEdit = () => {
    setEditData({
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      status: item.status,
      targetDate: item.targetDate,
      estimatedCost: item.estimatedCost,
      currency: item.currency,
      location: item.location,
      tags: item.tags,
      assignedTo: item.assignedTo,
      notes: item.notes,
      inspiration: item.inspiration,
      difficulty: item.difficulty,
      timeRequired: item.timeRequired
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdate(item.id, editData);
    setIsEditing(false);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleToggleSubtask = (subtaskId: string) => {
    onToggleSubtask(item.id, subtaskId);
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(item.id, newSubtaskTitle.trim(), newSubtaskAssignedTo);
      setNewSubtaskTitle('');
      setNewSubtaskAssignedTo('Jay');
      setShowAddSubtask(false);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    onDeleteSubtask(item.id, subtaskId);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !item.tags.includes(newTag.trim())) {
      const updatedTags = [...item.tags, newTag.trim()];
      onUpdate(item.id, { tags: updatedTags });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = item.tags.filter(tag => tag !== tagToRemove);
    onUpdate(item.id, { tags: updatedTags });
  };

  const handleAssignUser = (user: string) => {
    const isAssigned = item.assignedTo.includes(user);
    const updatedAssignedTo = isAssigned 
      ? item.assignedTo.filter(u => u !== user)
      : [...item.assignedTo, user];
    onUpdate(item.id, { assignedTo: updatedAssignedTo });
  };

  const handleProgressChange = (progress: number) => {
    onUpdateProgress(item.id, progress);
  };

  const isOverdue = item.targetDate && new Date(item.targetDate) < new Date() && item.status !== 'completed';
  const completedSubtasks = item.subtasks.filter(st => st.completed).length;
  const totalSubtasks = item.subtasks.length;
  const itemHistory = bucketListService.getItemHistory(item.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <NeumorphicCard variant="elevated" className="w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getCategoryIcon(item.category)}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Bucket List Item' : item.title}
              </h2>
              <p className="text-sm text-gray-600">
                Created by {item.createdBy} • {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={<Share2 className="h-4 w-4" />}
              onClick={() => setShowHistory(!showHistory)}
            />
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={<Edit className="h-4 w-4" />}
              onClick={handleEdit}
            />
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={onClose}
            />
          </div>
        </div>

        {isEditing ? (
          // Edit Mode
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeumorphicInput
                placeholder="Item title..."
                value={editData.title || ''}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
              
              <div className="flex space-x-2">
                <select
                  className="flex-1 p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={editData.priority || item.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value as BucketListItem['priority'] })}
                >
                  <option value="low">💚 Low</option>
                  <option value="medium">💛 Medium</option>
                  <option value="high">🧡 High</option>
                  <option value="dream">✨ Dream</option>
                </select>
                
                <select
                  className="flex-1 p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={editData.status || item.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value as BucketListItem['status'] })}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
            
            <NeumorphicInput
              placeholder="Description..."
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={editData.category || item.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value as BucketListItem['category'] })}
              >
                <option value="travel">🌍 Travel</option>
                <option value="experiences">✨ Experiences</option>
                <option value="goals">🎯 Goals</option>
                <option value="adventures">🏆 Adventures</option>
                <option value="romantic">💕 Romantic</option>
                <option value="personal">⭐ Personal</option>
                <option value="career">💼 Career</option>
                <option value="health">💪 Health</option>
                <option value="learning">📚 Learning</option>
                <option value="family">👨‍👩‍👧‍👦 Family</option>
              </select>
              
              <NeumorphicInput
                type="date"
                placeholder="Target date"
                value={editData.targetDate || ''}
                onChange={(e) => setEditData({ ...editData, targetDate: e.target.value })}
              />
              
              <div className="flex space-x-2">
                <NeumorphicInput
                  type="number"
                  placeholder="Estimated cost"
                  value={editData.estimatedCost || ''}
                  onChange={(e) => setEditData({ ...editData, estimatedCost: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <select
                  className="w-20 p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={editData.currency || item.currency}
                  onChange={(e) => setEditData({ ...editData, currency: e.target.value as BucketListItem['currency'] })}
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
            
            <NeumorphicInput
              placeholder="Location (optional)"
              value={editData.location || ''}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={editData.difficulty || item.difficulty}
                onChange={(e) => setEditData({ ...editData, difficulty: e.target.value as BucketListItem['difficulty'] })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
              
              <select
                className="p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={editData.timeRequired || item.timeRequired}
                onChange={(e) => setEditData({ ...editData, timeRequired: e.target.value as BucketListItem['timeRequired'] })}
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
            
            <NeumorphicInput
              placeholder="Why is this important to you? (inspiration)"
              value={editData.inspiration || ''}
              onChange={(e) => setEditData({ ...editData, inspiration: e.target.value })}
            />
            
            <NeumorphicInput
              placeholder="Additional notes..."
              value={editData.notes || ''}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
            />
            
            <div className="flex space-x-3">
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
          </div>
        ) : (
          // View Mode
          <div className="space-y-6">
            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                <span className="text-2xl font-bold text-blue-600">{item.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={item.progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">Update progress</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                
                {item.inspiration && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Inspiration</h4>
                    <p className="text-gray-600 italic">"{item.inspiration}"</p>
                  </div>
                )}
                
                {item.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-600">{item.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(item.priority)}`}>
                    {item.priority} Priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(item.status)}`}>
                    {item.status.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {item.targetDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className={isOverdue ? 'text-red-600' : 'text-gray-600'}>
                        Target: {new Date(item.targetDate).toLocaleDateString()}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>
                  )}
                  
                  {item.estimatedCost && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Cost: {item.estimatedCost} {item.currency}
                      </span>
                    </div>
                  )}
                  
                  {item.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Location: {item.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Difficulty: <span className={getDifficultyColor(item.difficulty)}>{item.difficulty}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Time: {item.timeRequired}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Users */}
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                {['Jay', 'Prachi'].map(user => (
                  <button
                    key={user}
                    onClick={() => handleAssignUser(user)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm ${
                      item.assignedTo.includes(user)
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
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="px-2 py-1 text-xs border rounded-lg"
                  />
                  <button
                    onClick={handleAddTag}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Subtasks ({completedSubtasks}/{totalSubtasks})
                </h3>
                <button
                  onClick={() => setShowAddSubtask(!showAddSubtask)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Subtask</span>
                </button>
              </div>
              
              {showAddSubtask && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <select
                    className="p-2 bg-gray-100 rounded-lg text-sm"
                    value={newSubtaskAssignedTo}
                    onChange={(e) => setNewSubtaskAssignedTo(e.target.value)}
                  >
                    <option value="Jay">Jay</option>
                    <option value="Prachi">Prachi</option>
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
              )}
              
              <div className="space-y-2">
                {item.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <button
                      onClick={() => handleToggleSubtask(subtask.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {subtask.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {subtask.title}
                    </span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                      subtask.assignedTo === 'Jay' ? 'bg-blue-500' : 'bg-purple-500'
                    }`} title={subtask.assignedTo}>
                      {subtask.assignedTo.charAt(0)}
                    </div>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {item.subtasks.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No subtasks yet</p>
                )}
              </div>
            </div>

            {/* History */}
            {showHistory && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">History</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {itemHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        entry.action === 'completed' ? 'bg-green-500' :
                        entry.action === 'created' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{entry.description}</p>
                        <p className="text-xs text-gray-500">
                          {entry.userName} • {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <NeumorphicButton
                  variant="primary"
                  onClick={() => onUpdate(item.id, { status: item.status === 'completed' ? 'in-progress' : 'completed' })}
                >
                  {item.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                </NeumorphicButton>
                <NeumorphicButton
                  variant="secondary"
                  onClick={handleEdit}
                >
                  Edit
                </NeumorphicButton>
              </div>
              
              <NeumorphicButton
                variant="secondary"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this bucket list item?')) {
                    onDelete(item.id);
                    onClose();
                  }
                }}
                className="text-red-600"
              >
                Delete
              </NeumorphicButton>
            </div>
          </div>
        )}
      </NeumorphicCard>
    </div>
  );
};
