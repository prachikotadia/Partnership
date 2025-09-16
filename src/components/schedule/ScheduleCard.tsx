import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Bell, 
  Repeat,
  Calendar,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { ScheduleItem } from '@/services/scheduleService';
import { scheduleService } from '@/services/scheduleService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

interface ScheduleCardProps {
  item: ScheduleItem;
  onUpdate?: (itemId: string, updates: Partial<ScheduleItem>) => void;
  onDelete?: (itemId: string) => void;
  onComplete?: (itemId: string) => void;
  onEdit?: (itemId: string) => void;
  isEditing?: boolean;
  editData?: Partial<ScheduleItem>;
  onEditDataChange?: (updates: Partial<ScheduleItem>) => void;
  onSaveEdit?: (itemId: string, updates: Partial<ScheduleItem>) => void;
  onCancelEdit?: () => void;
  showActions?: boolean;
  compact?: boolean;
  variant?: 'timeline' | 'list' | 'calendar';
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  item,
  onUpdate,
  onDelete,
  onComplete,
  onEdit,
  isEditing = false,
  editData,
  onEditDataChange,
  onSaveEdit,
  onCancelEdit,
  showActions = true,
  compact = false,
  variant = 'timeline'
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getPartnerColor = (partner: string, type: 'primary' | 'secondary' | 'border' | 'text' | 'glow' | 'avatar' = 'primary') => {
    return scheduleService.getPartnerColor(partner, type);
  };

  const getCategoryColor = (category: ScheduleItem['category']) => {
    const colors: { [key: string]: string } = {
      work: 'bg-blue-100 text-blue-700 border-blue-200',
      personal: 'bg-green-100 text-green-700 border-green-200',
      health: 'bg-red-100 text-red-700 border-red-200',
      social: 'bg-purple-100 text-purple-700 border-purple-200',
      travel: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      finance: 'bg-orange-100 text-orange-700 border-orange-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || colors.other;
  };

  const getPriorityColor = (priority: ScheduleItem['priority']) => {
    const colors: { [key: string]: string } = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  const getMoodEmoji = (mood?: ScheduleItem['mood']) => {
    const emojis: { [key: string]: string } = {
      excited: '😊',
      stressed: '😰',
      neutral: '😐',
      happy: '😄',
      anxious: '😟'
    };
    return emojis[mood || 'neutral'] || '😐';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUpcoming = () => {
    const now = new Date();
    const itemDate = new Date(item.startDate);
    return itemDate > now;
  };

  const isOverdue = () => {
    const now = new Date();
    const itemDate = new Date(item.startDate);
    return itemDate < now && !item.isCompleted;
  };

  const getTimeUntilEvent = () => {
    const now = new Date();
    const itemDate = new Date(item.startDate);
    const diffMs = itemDate.getTime() - now.getTime();
    
    if (diffMs < 0) return null;
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  };

  if (isEditing && editData) {
    return (
      <NeumorphicCard variant="elevated" className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit Event</h3>
          <div className="flex space-x-2">
            <NeumorphicButton
              variant="primary"
              size="sm"
              onClick={() => onSaveEdit?.(item.id, editData)}
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
            placeholder="Event title..."
            value={editData.title || ''}
            onChange={(e) => onEditDataChange?.({ ...editData, title: e.target.value })}
          />

          <NeumorphicInput
            placeholder="Description..."
            value={editData.description || ''}
            onChange={(e) => onEditDataChange?.({ ...editData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <NeumorphicInput
              type="datetime-local"
              value={editData.startDate ? new Date(editData.startDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => onEditDataChange?.({ ...editData, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            />
            <NeumorphicInput
              type="datetime-local"
              value={editData.endDate ? new Date(editData.endDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => onEditDataChange?.({ ...editData, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            />
          </div>

          <NeumorphicInput
            placeholder="Location..."
            value={editData.location || ''}
            onChange={(e) => onEditDataChange?.({ ...editData, location: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
              value={editData.priority || item.priority}
              onChange={(e) => onEditDataChange?.({ ...editData, priority: e.target.value as ScheduleItem['priority'] })}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
              value={editData.category || item.category}
              onChange={(e) => onEditDataChange?.({ ...editData, category: e.target.value as ScheduleItem['category'] })}
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="social">Social</option>
              <option value="travel">Travel</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <select
            className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
            value={editData.mood || item.mood || 'neutral'}
            onChange={(e) => onEditDataChange?.({ ...editData, mood: e.target.value as ScheduleItem['mood'] })}
          >
            <option value="neutral">😐 Neutral</option>
            <option value="excited">😊 Excited</option>
            <option value="happy">😄 Happy</option>
            <option value="stressed">😰 Stressed</option>
            <option value="anxious">😟 Anxious</option>
          </select>
        </div>
      </NeumorphicCard>
    );
  }

  if (variant === 'list') {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
          item.assignedPartners.includes('Jay') 
            ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
            : 'border-purple-300 bg-purple-50 hover:bg-purple-100'
        } ${item.isCompleted ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            item.assignedPartners.includes('Jay') ? 'bg-blue-500' : 'bg-purple-500'
          }`}>
            <span className="text-white text-sm font-bold">
              {item.assignedPartners.includes('Jay') ? 'J' : 'P'}
            </span>
          </div>
          <div>
            <div className={`font-medium ${item.isCompleted ? 'line-through' : ''}`}>
              {item.title}
            </div>
            <div className="text-sm text-gray-700">
              {formatDate(item.startDate)} {!item.allDay && formatTime(item.startDate)}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {item.mood && (
            <span className="text-lg">{getMoodEmoji(item.mood)}</span>
          )}
          {!item.isCompleted && (
            <NeumorphicButton
              variant="primary"
              size="sm"
              icon={<CheckCircle2 className="h-3 w-3" />}
              onClick={() => onComplete?.(item.id)}
            />
          )}
          <NeumorphicButton
            variant="secondary"
            size="sm"
            icon={<Edit className="h-3 w-3" />}
            onClick={() => onEdit?.(item.id)}
          />
        </div>
      </div>
    );
  }

  return (
    <NeumorphicCard 
      variant="elevated" 
      className={`p-4 transition-all duration-200 hover:shadow-lg ${
        item.assignedPartners.includes('Jay') 
          ? 'border-l-4 border-blue-300' 
          : 'border-l-4 border-purple-300'
      } ${item.isCompleted ? 'opacity-60' : ''} ${
        isOverdue() ? 'ring-2 ring-red-200' : ''
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-semibold text-lg ${item.isCompleted ? 'line-through text-gray-700' : 'text-gray-900'}`}>
                {item.title}
              </h3>
              {item.mood && (
                <span className="text-lg">{getMoodEmoji(item.mood)}</span>
              )}
              {item.repeatPattern && (
                <Repeat className="h-4 w-4 text-gray-400" />
              )}
              {item.reminderSettings.enabled && (
                <Bell className="h-4 w-4 text-gray-400" />
              )}
            </div>

            {item.description && (
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
            )}
          </div>

          {showActions && (
            <div className="flex space-x-1">
              {!item.isCompleted && (
                <NeumorphicButton
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 className="h-3 w-3" />}
                  onClick={() => onComplete?.(item.id)}
                />
              )}
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<Edit className="h-3 w-3" />}
                onClick={() => onEdit?.(item.id)}
              />
              <NeumorphicButton
                variant="danger"
                size="sm"
                icon={<Trash2 className="h-3 w-3" />}
                onClick={() => onDelete?.(item.id)}
              />
            </div>
          )}
        </div>

        {/* Time and Location */}
        <div className="flex items-center space-x-4 text-sm text-gray-700">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatDateTime(item.startDate)}</span>
            {item.endDate && (
              <span> - {formatTime(item.endDate)}</span>
            )}
          </div>
          
          {item.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{item.location}</span>
            </div>
          )}
        </div>

        {/* Countdown */}
        {isUpcoming() && (
          <div className="text-sm text-blue-600 font-medium">
            ⏰ {getTimeUntilEvent()} until event
          </div>
        )}

        {isOverdue() && (
          <div className="text-sm text-red-600 font-medium">
            ⚠️ Overdue
          </div>
        )}

        {/* Tags and Categories */}
        <div className="flex items-center space-x-2 flex-wrap">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
            {item.category}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
            {item.priority}
          </span>
          {item.tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
              #{tag}
            </span>
          ))}
        </div>

        {/* Partners */}
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <div className="flex space-x-1">
            {item.assignedPartners.map((partner) => (
              <div
                key={partner}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPartnerColor(partner, 'primary')} ${getPartnerColor(partner, 'text')}`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${getPartnerColor(partner, 'avatar')}`}>
                  {scheduleService.getPartnerAvatar(partner)}
                </div>
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Settings */}
        {item.reminderSettings.enabled && (
          <div className="flex items-center space-x-1 text-sm text-gray-700">
            <Bell className="h-4 w-4" />
            <span>
              Reminder: {item.reminderSettings.daysBefore > 0 && `${item.reminderSettings.daysBefore} days `}
              {item.reminderSettings.hoursBefore > 0 && `${item.reminderSettings.hoursBefore} hours `}
              {item.reminderSettings.minutesBefore > 0 && `${item.reminderSettings.minutesBefore} minutes `}
              before
            </span>
          </div>
        )}

        {/* Attachments */}
        {item.attachments.length > 0 && (
          <div className="flex items-center space-x-1 text-sm text-gray-700">
            <Tag className="h-4 w-4" />
            <span>{item.attachments.length} attachment{item.attachments.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Details Toggle */}
        {!compact && (
          <div className="pt-2 border-t">
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </NeumorphicButton>
          </div>
        )}

        {/* Expanded Details */}
        {showDetails && !compact && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-sm text-gray-600">
              <div><strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}</div>
              <div><strong>Last Updated:</strong> {new Date(item.updatedAt).toLocaleString()}</div>
              <div><strong>Created By:</strong> {item.createdBy}</div>
              {item.isCompleted && (
                <div><strong>Completed:</strong> {item.completedAt ? new Date(item.completedAt).toLocaleString() : 'Recently'} by {item.completedBy}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </NeumorphicCard>
  );
};
