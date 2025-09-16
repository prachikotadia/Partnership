import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, Filter, Search, MoreVertical, Trash2, Eye, EyeOff } from 'lucide-react';
import { notificationService, Notification, NotificationType } from '../../services/supabaseNotificationService';
import { useAuth } from '../../contexts/AuthContext';
import { NeumorphicCard } from '../ui/neumorphic-card';
import { NeumorphicButton } from '../ui/neumorphic-button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { NotificationItem } from './NotificationItem';
import { NotificationFilters } from './NotificationFilters';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    type: undefined as NotificationType | undefined,
    category: undefined as string | undefined,
    priority: undefined as string | undefined,
    is_read: undefined as boolean | undefined,
  });

  useEffect(() => {
    if (!isOpen || !user) return;

    // Subscribe to notifications
    const unsubscribeNotifications = notificationService.subscribe(setNotifications);
    const unsubscribeUnreadCount = notificationService.subscribeToUnreadCount(setUnreadCount);
    const unsubscribeUnseenCount = notificationService.subscribeToUnseenCount(setUnseenCount);

    // Load initial data
    loadNotifications();
    loadCounts();

    return () => {
      unsubscribeNotifications();
      unsubscribeUnreadCount();
      unsubscribeUnseenCount();
    };
  }, [isOpen, user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({
        ...filters,
        limit: 50,
      });
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      const [unread, unseen] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getUnseenCount(),
      ]);
      setUnreadCount(unread);
      setUnseenCount(unseen);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
  };

  const handleMarkAsSeen = async (notificationId: string) => {
    await notificationService.markAsSeen(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
  };

  const filteredNotifications = notifications.filter(notification => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!notification.title.toLowerCase().includes(query) && 
          !notification.message.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Tab filter
    switch (activeTab) {
      case 'unread':
        return !notification.is_read;
      case 'unseen':
        return !notification.is_seen;
      case 'urgent':
        return notification.priority === 'urgent';
      default:
        return true;
    }
  });

  const getNotificationIcon = (type: NotificationType) => {
    return notificationService.getNotificationIcon(type);
  };

  const getNotificationColor = (type: NotificationType) => {
    return notificationService.getNotificationColor(type);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] mx-4">
        <NeumorphicCard variant="elevated" className="p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-700" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">
                  {unreadCount} unread, {unseenCount} unseen
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <NeumorphicButton
                variant="secondary"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center space-x-1"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark All Read</span>
              </NeumorphicButton>
              
              <NeumorphicButton
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </NeumorphicButton>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <NotificationFilters
                filters={filters}
                onFiltersChange={setFilters}
                onApplyFilters={loadNotifications}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start rounded-none border-0 bg-transparent">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <span>All</span>
                  <Badge variant="secondary" className="ml-1">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center space-x-2">
                  <span>Unread</span>
                  <Badge variant="destructive" className="ml-1">
                    {unreadCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unseen" className="flex items-center space-x-2">
                  <span>Unseen</span>
                  <Badge variant="outline" className="ml-1">
                    {unseenCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="urgent" className="flex items-center space-x-2">
                  <span>Urgent</span>
                  <Badge variant="destructive" className="ml-1">
                    {notifications.filter(n => n.priority === 'urgent').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {searchQuery || Object.values(filters).some(f => f !== undefined)
                    ? 'Try adjusting your search or filters'
                    : 'You\'re all caught up!'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAsSeen={handleMarkAsSeen}
                    onDelete={handleDeleteNotification}
                    getIcon={getNotificationIcon}
                    getColor={getNotificationColor}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => notificationService.requestNotificationPermission()}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Enable Push Notifications
                </button>
              </div>
            </div>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};
