import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { notificationService } from '../../services/supabaseNotificationService';
import { useAuth } from '../../contexts/AuthContext';
import { NeumorphicButton } from '../ui/neumorphic-button';
import { Badge } from '../ui/badge';
import { NotificationCenter } from './NotificationCenter';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Subscribe to unread count updates
    const unsubscribeUnreadCount = notificationService.subscribeToUnreadCount((count) => {
      setUnreadCount(count);
      
      // Trigger animation when count increases
      if (count > unreadCount) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }
    });

    // Subscribe to unseen count updates
    const unsubscribeUnseenCount = notificationService.subscribeToUnseenCount(setUnseenCount);

    // Load initial counts
    loadCounts();

    return () => {
      unsubscribeUnreadCount();
      unsubscribeUnseenCount();
    };
  }, [user, unreadCount]);

  const loadCounts = async () => {
    try {
      const [unread, unseen] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getUnseenCount(),
      ]);
      setUnreadCount(unread);
      setUnseenCount(unseen);
    } catch (error) {
      console.error('Error loading notification counts:', error);
    }
  };

  const handleBellClick = () => {
    setIsNotificationCenterOpen(true);
  };

  const handleCloseNotificationCenter = () => {
    setIsNotificationCenterOpen(false);
  };

  return (
    <>
      <div className="relative">
        <NeumorphicButton
          variant="secondary"
          size="sm"
          onClick={handleBellClick}
          className={`relative w-10 h-10 p-0 transition-all duration-300 ${
            isAnimating ? 'animate-pulse scale-110' : ''
          } ${unreadCount > 0 ? 'ring-2 ring-blue-200' : ''}`}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-blue-600" />
          ) : (
            <Bell className="h-5 w-5 text-gray-600" />
          )}
        </NeumorphicButton>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}

        {/* Unseen Indicator */}
        {unseenCount > 0 && unreadCount === 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No new notifications'}
        </div>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={handleCloseNotificationCenter}
      />
    </>
  );
};
