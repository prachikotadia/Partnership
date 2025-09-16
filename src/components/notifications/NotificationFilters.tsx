import React from 'react';
import { Filter, X } from 'lucide-react';
import { NeumorphicButton } from '../ui/neumorphic-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { NotificationType } from '../../services/supabaseNotificationService';

interface NotificationFiltersProps {
  filters: {
    type?: NotificationType;
    category?: string;
    priority?: string;
    is_read?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onApplyFilters: () => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const notificationTypes: { value: NotificationType; label: string }[] = [
    { value: 'task_created', label: 'Task Created' },
    { value: 'task_completed', label: 'Task Completed' },
    { value: 'task_assigned', label: 'Task Assigned' },
    { value: 'task_due', label: 'Task Due' },
    { value: 'note_created', label: 'Note Created' },
    { value: 'note_shared', label: 'Note Shared' },
    { value: 'note_reminder', label: 'Note Reminder' },
    { value: 'finance_expense', label: 'Finance Expense' },
    { value: 'finance_budget_alert', label: 'Budget Alert' },
    { value: 'finance_goal_reached', label: 'Goal Reached' },
    { value: 'schedule_event', label: 'Schedule Event' },
    { value: 'schedule_reminder', label: 'Schedule Reminder' },
    { value: 'schedule_updated', label: 'Schedule Updated' },
    { value: 'bucket_list_created', label: 'Bucket List Created' },
    { value: 'bucket_list_completed', label: 'Bucket List Completed' },
    { value: 'bucket_list_shared', label: 'Bucket List Shared' },
    { value: 'streak_achievement', label: 'Streak Achievement' },
    { value: 'streak_reminder', label: 'Streak Reminder' },
    { value: 'streak_broken', label: 'Streak Broken' },
    { value: 'partner_pairing', label: 'Partner Pairing' },
    { value: 'partner_activity', label: 'Partner Activity' },
    { value: 'system_announcement', label: 'System Announcement' },
  ];

  const categories = [
    { value: 'tasks', label: 'Tasks' },
    { value: 'notes', label: 'Notes' },
    { value: 'finance', label: 'Finance' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'bucket_list', label: 'Bucket List' },
    { value: 'streaks', label: 'Streaks' },
    { value: 'partner', label: 'Partner' },
    { value: 'system', label: 'System' },
    { value: 'general', label: 'General' },
  ];

  const priorities = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const readStatuses = [
    { value: 'true', label: 'Read' },
    { value: 'false', label: 'Unread' },
  ];

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  const clearFilters = () => {
    onFiltersChange({
      type: undefined,
      category: undefined,
      priority: undefined,
      is_read: undefined,
    });
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'undefined' ? undefined : value,
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <NeumorphicButton
        variant="secondary"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </NeumorphicButton>

      {hasActiveFilters && (
        <NeumorphicButton
          variant="secondary"
          size="sm"
          onClick={clearFilters}
          className="flex items-center space-x-1"
        >
          <X className="h-4 w-4" />
          <span>Clear</span>
        </NeumorphicButton>
      )}

      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <Select
                value={filters.type || 'undefined'}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">All types</SelectItem>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                value={filters.category || 'undefined'}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <Select
                value={filters.priority || 'undefined'}
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">All priorities</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.is_read?.toString() || 'undefined'}
                onValueChange={(value) => handleFilterChange('is_read', value === 'undefined' ? undefined : value === 'true')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">All statuses</SelectItem>
                  {readStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <NeumorphicButton
              variant="primary"
              size="sm"
              onClick={() => {
                onApplyFilters();
                setIsExpanded(false);
              }}
            >
              Apply Filters
            </NeumorphicButton>
          </div>
        </div>
      )}
    </div>
  );
};
