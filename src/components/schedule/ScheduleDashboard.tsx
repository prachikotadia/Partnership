import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  ChevronRight,
  Users,
  MapPin,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { ScheduleItem } from '@/services/scheduleService';
import { scheduleService } from '@/services/scheduleService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';

interface ScheduleDashboardProps {
  className?: string;
  onOpenSchedule?: () => void;
}

export const ScheduleDashboard: React.FC<ScheduleDashboardProps> = ({ 
  className = '',
  onOpenSchedule 
}) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [todayItems, setTodayItems] = useState<ScheduleItem[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const unsubscribe = scheduleService.subscribe((updatedItems) => {
      setScheduleItems(updatedItems);
      setTodayItems(scheduleService.getTodayItems());
      setUpcomingItems(scheduleService.getUpcomingItems(24));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getPartnerColor = (partner: string, type: 'primary' | 'secondary' | 'border' | 'text' | 'glow' | 'avatar' = 'primary') => {
    return scheduleService.getPartnerColor(partner, type);
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

  const getTimeUntilEvent = (dateString: string) => {
    const now = new Date();
    const itemDate = new Date(dateString);
    const diffMs = itemDate.getTime() - now.getTime();
    
    if (diffMs < 0) return null;
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m`;
  };

  const getCategoryColor = (category: ScheduleItem['category']) => {
    const colors: { [key: string]: string } = {
      work: 'bg-blue-100 text-blue-700',
      personal: 'bg-green-100 text-green-700',
      health: 'bg-red-100 text-red-700',
      social: 'bg-purple-100 text-purple-700',
      travel: 'bg-yellow-100 text-yellow-700',
      finance: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700'
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

  const handleCompleteItem = (itemId: string) => {
    scheduleService.completeScheduleItem(itemId);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
        <NeumorphicButton
          variant="secondary"
          size="sm"
          icon={<ChevronRight className="h-4 w-4" />}
          onClick={onOpenSchedule}
        >
          View All
        </NeumorphicButton>
      </div>

      {/* Today's Items */}
      {todayItems.length > 0 ? (
        <div className="space-y-3">
          {todayItems.slice(0, 3).map((item) => (
            <NeumorphicCard 
              key={item.id} 
              variant="elevated" 
              className={`p-3 transition-all duration-200 hover:shadow-md ${
                item.assignedPartners.includes('Jay') 
                  ? 'border-l-4 border-blue-300' 
                  : 'border-l-4 border-purple-300'
              } ${item.isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.assignedPartners.includes('Jay') ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    <span className="text-white text-sm font-bold">
                      {item.assignedPartners.includes('Jay') ? 'J' : 'P'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${item.isCompleted ? 'line-through' : ''}`}>
                      {item.title}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(item.startDate)}</span>
                      {item.location && (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{item.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.mood && (
                    <span className="text-sm">{getMoodEmoji(item.mood)}</span>
                  )}
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  {!item.isCompleted && (
                    <NeumorphicButton
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 className="h-3 w-3" />}
                      onClick={() => handleCompleteItem(item.id)}
                    />
                  )}
                </div>
              </div>
            </NeumorphicCard>
          ))}
          
          {todayItems.length > 3 && (
            <div className="text-center">
              <NeumorphicButton
                variant="secondary"
                size="sm"
                onClick={onOpenSchedule}
              >
                +{todayItems.length - 3} more events today
              </NeumorphicButton>
            </div>
          )}
        </div>
      ) : (
        <NeumorphicCard variant="inset" className="p-6 text-center">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No events scheduled for today</p>
        </NeumorphicCard>
      )}

      {/* Upcoming Items */}
      {upcomingItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Upcoming</h3>
          {upcomingItems.slice(0, 2).map((item) => (
            <NeumorphicCard 
              key={item.id} 
              variant="inset" 
              className={`p-3 transition-all duration-200 hover:shadow-sm ${
                item.assignedPartners.includes('Jay') 
                  ? 'border-l-2 border-blue-200' 
                  : 'border-l-2 border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    item.assignedPartners.includes('Jay') ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    <span className="text-white text-xs font-bold">
                      {item.assignedPartners.includes('Jay') ? 'J' : 'P'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(item.startDate)} {!item.allDay && formatTime(item.startDate)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.mood && (
                    <span className="text-sm">{getMoodEmoji(item.mood)}</span>
                  )}
                  <span className="text-xs text-blue-600 font-medium">
                    {getTimeUntilEvent(item.startDate)}
                  </span>
                </div>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      )}

      {/* Quick Add */}
      <NeumorphicCard variant="elevated" className="p-3">
        <NeumorphicButton
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={onOpenSchedule}
          className="w-full"
        >
          Add New Event
        </NeumorphicButton>
      </NeumorphicCard>
    </div>
  );
};
