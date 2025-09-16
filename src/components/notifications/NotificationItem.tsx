import React, { useState } from 'react';
import { 
  Clock, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  Eye, 
  EyeOff, 
  Trash2,
  ExternalLink,
  Bell,
  BellOff
} from 'lucide-react';
import { Notification, NotificationType } from '../../services/supabaseNotificationService';
import { NeumorphicButton } from '../ui/neumorphic-button';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsSeen: (id: string) => void;
  onDelete: (id: string) => void;
  getIcon: (type: NotificationType) => string;
  getColor: (type: NotificationType) => string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsSeen,
  onDelete,
  getIcon,
  getColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleActionClick = () => {
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleMarkAsSeen = () => {
    if (!notification.is_seen) {
      onMarkAsSeen(notification.id);
    }
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tasks':
        return 'bg-blue-50 border-blue-200';
      case 'notes':
        return 'bg-green-50 border-green-200';
      case 'finance':
        return 'bg-yellow-50 border-yellow-200';
      case 'schedule':
        return 'bg-purple-50 border-purple-200';
      case 'bucket_list':
        return 'bg-pink-50 border-pink-200';
      case 'streaks':
        return 'bg-orange-50 border-orange-200';
      case 'partner':
        return 'bg-indigo-50 border-indigo-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div
      className={`p-4 transition-all duration-200 hover:bg-gray-50 ${
        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      } ${!notification.is_seen ? 'ring-2 ring-blue-200' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          getCategoryColor(notification.category)
        }`}>
          <Bell className={`h-5 w-5 ${
            notification.color === 'red' ? 'text-red-600' :
            notification.color === 'green' ? 'text-green-600' :
            notification.color === 'blue' ? 'text-blue-600' :
            notification.color === 'purple' ? 'text-purple-600' :
            notification.color === 'orange' ? 'text-orange-600' :
            notification.color === 'pink' ? 'text-pink-600' :
            notification.color === 'gold' ? 'text-yellow-600' :
            'text-gray-600'
          }`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`text-sm font-semibold ${
                  !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {notification.title}
                </h3>
                
                {/* Priority Badge */}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                >
                  {notification.priority}
                </Badge>

                {/* Status Indicators */}
                <div className="flex items-center space-x-1">
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" title="Unread" />
                  )}
                  {!notification.is_seen && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full" title="Unseen" />
                  )}
                </div>
              </div>

              <p className={`text-sm mb-2 ${
                !notification.is_read ? 'text-gray-800' : 'text-gray-600'
              }`}>
                {notification.message}
              </p>

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(notification.created_at)}</span>
                </div>
                
                {notification.category && (
                  <Badge variant="outline" className="text-xs">
                    {notification.category.replace('_', ' ')}
                  </Badge>
                )}

                {notification.sound_enabled && (
                  <div className="flex items-center space-x-1">
                    <Bell className="h-3 w-3" />
                    <span>Sound</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Action Button */}
              {notification.action_text && notification.action_url && (
                <NeumorphicButton
                  variant="primary"
                  size="sm"
                  onClick={handleActionClick}
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>{notification.action_text}</span>
                </NeumorphicButton>
              )}

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <NeumorphicButton
                    variant="secondary"
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </NeumorphicButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!notification.is_read && (
                    <DropdownMenuItem onClick={handleMarkAsRead} className="flex items-center space-x-2">
                      <Check className="h-4 w-4" />
                      <span>Mark as Read</span>
                    </DropdownMenuItem>
                  )}
                  
                  {!notification.is_seen && (
                    <DropdownMenuItem onClick={handleMarkAsSeen} className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Mark as Seen</span>
                    </DropdownMenuItem>
                  )}

                  {notification.is_read && (
                    <DropdownMenuItem onClick={handleMarkAsRead} className="flex items-center space-x-2">
                      <CheckCheck className="h-4 w-4" />
                      <span>Mark as Unread</span>
                    </DropdownMenuItem>
                  )}

                  {notification.is_seen && (
                    <DropdownMenuItem onClick={handleMarkAsSeen} className="flex items-center space-x-2">
                      <EyeOff className="h-4 w-4" />
                      <span>Mark as Unseen</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem 
                    onClick={handleDelete} 
                    className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Additional Data */}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="mt-2 p-2 bg-gray-100 rounded-md">
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(notification.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
