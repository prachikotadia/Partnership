import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  partner_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'tasks' | 'notes' | 'finance' | 'schedule' | 'bucket_list' | 'streaks' | 'partner' | 'system' | 'general';
  is_read: boolean;
  is_seen: boolean;
  read_at?: string;
  seen_at?: string;
  expires_at?: string;
  action_url?: string;
  action_text?: string;
  icon?: string;
  color?: string;
  sound_enabled: boolean;
  push_sent: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 
  | 'task_created' | 'task_completed' | 'task_assigned' | 'task_due'
  | 'note_created' | 'note_shared' | 'note_reminder'
  | 'finance_expense' | 'finance_budget_alert' | 'finance_goal_reached'
  | 'schedule_event' | 'schedule_reminder' | 'schedule_updated'
  | 'bucket_list_created' | 'bucket_list_completed' | 'bucket_list_shared'
  | 'streak_achievement' | 'streak_reminder' | 'streak_broken'
  | 'partner_pairing' | 'partner_activity' | 'system_announcement';

export interface CreateNotificationData {
  user_id: string;
  partner_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'tasks' | 'notes' | 'finance' | 'schedule' | 'bucket_list' | 'streaks' | 'partner' | 'system' | 'general';
  expires_at?: string;
  action_url?: string;
  action_text?: string;
  icon?: string;
  color?: string;
  sound_enabled?: boolean;
}

export interface NotificationFilters {
  type?: NotificationType;
  category?: string;
  priority?: string;
  is_read?: boolean;
  is_seen?: boolean;
  limit?: number;
  offset?: number;
}

class SupabaseNotificationService {
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private unreadCountListeners: ((count: number) => void)[] = [];
  private unseenCountListeners: ((count: number) => void)[] = [];

  constructor() {
    this.setupRealtimeSubscription();
  }

  private setupRealtimeSubscription() {
    // Subscribe to notifications table changes
    supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notification change received:', payload);
          this.refreshNotifications();
          this.refreshUnreadCount();
          this.refreshUnseenCount();
        }
      )
      .subscribe();
  }

  // Subscribe to notifications updates
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Subscribe to unread count updates
  subscribeToUnreadCount(listener: (count: number) => void) {
    this.unreadCountListeners.push(listener);
    return () => {
      this.unreadCountListeners = this.unreadCountListeners.filter(l => l !== listener);
    };
  }

  // Subscribe to unseen count updates
  subscribeToUnseenCount(listener: (count: number) => void) {
    this.unseenCountListeners.push(listener);
    return () => {
      this.unseenCountListeners = this.unseenCountListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(notifications: Notification[]) {
    this.listeners.forEach(listener => listener(notifications));
  }

  private notifyUnreadCountListeners(count: number) {
    this.unreadCountListeners.forEach(listener => listener(count));
  }

  private notifyUnseenCountListeners(count: number) {
    this.unseenCountListeners.forEach(listener => listener(count));
  }

  // Get all notifications for current user
  async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }
      if (filters.is_seen !== undefined) {
        query = query.eq('is_seen', filters.is_seen);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return [];
    }
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    try {
      // Try to use the database function first
      const { data, error } = await supabase
        .rpc('get_unread_notification_count');

      if (error) {
        console.warn('Database function not found, using fallback query:', error.message);
        
        // Fallback: query notifications table directly
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('notifications')
          .select('id', { count: 'exact' })
          .eq('is_read', false);

        if (fallbackError) {
          console.warn('Fallback query failed, returning 0:', fallbackError.message);
          return 0;
        }

        return fallbackData?.length || 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  // Get unseen notifications count
  async getUnseenCount(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_unseen_notification_count');

      if (error) {
        console.error('Error fetching unseen count:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getUnseenCount:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('mark_notification_read', { notification_id: notificationId });

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      this.refreshUnreadCount();
      return data;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  // Mark notification as seen
  async markAsSeen(notificationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('mark_notification_seen', { notification_id: notificationId });

      if (error) {
        console.error('Error marking notification as seen:', error);
        return false;
      }

      this.refreshUnseenCount();
      return data;
    } catch (error) {
      console.error('Error in markAsSeen:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('mark_all_notifications_read');

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return 0;
      }

      this.refreshUnreadCount();
      return data || 0;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return 0;
    }
  }

  // Create a new notification
  async createNotification(notificationData: CreateNotificationData): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          priority: notificationData.priority || 'medium',
          category: notificationData.category || 'general',
          sound_enabled: notificationData.sound_enabled !== false,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      this.refreshNotifications();
      this.refreshUnreadCount();
      this.refreshUnseenCount();
      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return false;
    }
  }

  // Refresh notifications and notify listeners
  private async refreshNotifications() {
    const notifications = await this.getNotifications();
    this.notifyListeners(notifications);
  }

  // Refresh unread count and notify listeners
  private async refreshUnreadCount() {
    const count = await this.getUnreadCount();
    this.notifyUnreadCountListeners(count);
  }

  // Refresh unseen count and notify listeners
  private async refreshUnseenCount() {
    const count = await this.getUnseenCount();
    this.notifyUnseenCountListeners(count);
  }

  // Helper method to create notification for partner
  async notifyPartner(
    partnerId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
    options?: Partial<CreateNotificationData>
  ): Promise<Notification | null> {
    return this.createNotification({
      user_id: partnerId,
      partner_id: (await supabase.auth.getUser()).data.user?.id,
      type,
      title,
      message,
      data,
      ...options,
    });
  }

  // Helper method to create system notification
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'system_announcement',
    options?: Partial<CreateNotificationData>
  ): Promise<Notification | null> {
    return this.createNotification({
      user_id: userId,
      type,
      title,
      message,
      category: 'system',
      priority: 'medium',
      ...options,
    });
  }

  // Get notification icon based on type
  getNotificationIcon(type: NotificationType): string {
    const iconMap: Record<NotificationType, string> = {
      task_created: 'plus-circle',
      task_completed: 'check-circle',
      task_assigned: 'user-plus',
      task_due: 'clock',
      note_created: 'file-text',
      note_shared: 'share',
      note_reminder: 'bell',
      finance_expense: 'dollar-sign',
      finance_budget_alert: 'alert-triangle',
      finance_goal_reached: 'target',
      schedule_event: 'calendar',
      schedule_reminder: 'bell',
      schedule_updated: 'edit',
      bucket_list_created: 'list',
      bucket_list_completed: 'check-circle',
      bucket_list_shared: 'share',
      streak_achievement: 'trophy',
      streak_reminder: 'bell',
      streak_broken: 'x-circle',
      partner_pairing: 'users',
      partner_activity: 'activity',
      system_announcement: 'info',
    };
    return iconMap[type] || 'bell';
  }

  // Get notification color based on type
  getNotificationColor(type: NotificationType): string {
    const colorMap: Record<NotificationType, string> = {
      task_created: 'blue',
      task_completed: 'green',
      task_assigned: 'purple',
      task_due: 'orange',
      note_created: 'blue',
      note_shared: 'green',
      note_reminder: 'orange',
      finance_expense: 'green',
      finance_budget_alert: 'red',
      finance_goal_reached: 'green',
      schedule_event: 'purple',
      schedule_reminder: 'orange',
      schedule_updated: 'blue',
      bucket_list_created: 'purple',
      bucket_list_completed: 'green',
      bucket_list_shared: 'blue',
      streak_achievement: 'gold',
      streak_reminder: 'orange',
      streak_broken: 'red',
      partner_pairing: 'pink',
      partner_activity: 'blue',
      system_announcement: 'gray',
    };
    return colorMap[type] || 'blue';
  }

  // Play notification sound
  playNotificationSound(type: NotificationType, priority: string = 'medium') {
    if (typeof window !== 'undefined' && 'Audio' in window) {
      try {
        const audio = new Audio();
        
        // Different sounds for different priorities
        switch (priority) {
          case 'urgent':
            audio.src = '/sounds/urgent-notification.mp3';
            break;
          case 'high':
            audio.src = '/sounds/high-notification.mp3';
            break;
          case 'medium':
            audio.src = '/sounds/medium-notification.mp3';
            break;
          case 'low':
            audio.src = '/sounds/low-notification.mp3';
            break;
          default:
            audio.src = '/sounds/notification.mp3';
        }
        
        audio.volume = 0.5;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }
  }

  // Show browser notification
  async showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          data: notification,
        });

        browserNotification.onclick = () => {
          window.focus();
          if (notification.action_url) {
            window.location.href = notification.action_url;
          }
          browserNotification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      } catch (error) {
        console.error('Error showing browser notification:', error);
      }
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }
    return false;
  }
}

export const notificationService = new SupabaseNotificationService();
