import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Device } from '@capacitor/device';
import io, { Socket } from 'socket.io-client';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'finance' | 'event' | 'system' | 'partner' | 'reminder' | 'bill' | 'streak';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  icon?: string;
  sender?: string;
  data?: any;
}

export interface ReminderData {
  id: string;
  type: 'bill' | 'event' | 'streak' | 'checkin';
  title: string;
  message: string;
  scheduledTime: Date;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
  isActive: boolean;
  userId: string;
}

class NotificationService {
  private socket: Socket | null = null;
  private isConnected = false;
  private deviceId: string | null = null;
  private userId: string | null = null;
  private reminders: Map<string, ReminderData> = new Map();

  async initialize(userId: string) {
    this.userId = userId;
    
    // Get device ID
    if (Capacitor.isNativePlatform()) {
      const deviceInfo = await Device.getId();
      this.deviceId = deviceInfo.identifier;
    }

    // Initialize push notifications
    await this.initializePushNotifications();
    
    // Initialize local notifications
    await this.initializeLocalNotifications();
    
    // Connect to real-time service
    await this.connectToRealtimeService();
    
    // Load and schedule reminders
    await this.loadReminders();
  }

  private async initializePushNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    // Request permissions
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
    }

    // Listen for registration
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Send token to your server
      this.sendTokenToServer(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error: ', err.error);
    });

    // Listen for push notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      this.handlePushNotification(notification);
    });

    // Listen for push notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed', notification);
      this.handleNotificationAction(notification);
    });
  }

  private async initializeLocalNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    // Request permissions
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display === 'granted') {
      console.log('Local notifications permission granted');
    }
  }

  private async connectToRealtimeService() {
    // Connect to your real-time service (WebSocket/Socket.IO)
    this.socket = io(process.env.VITE_SOCKET_URL || 'ws://localhost:3001', {
      auth: {
        userId: this.userId,
        deviceId: this.deviceId
      }
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to real-time service');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from real-time service');
    });

    this.socket.on('notification', (data: NotificationData) => {
      this.handleRealtimeNotification(data);
    });

    this.socket.on('reminder', (data: ReminderData) => {
      this.handleReminder(data);
    });
  }

  private async sendTokenToServer(token: string) {
    // Send the push token to your server
    try {
      await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          deviceId: this.deviceId,
          token,
          platform: Capacitor.getPlatform()
        })
      });
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  }

  private handlePushNotification(notification: any) {
    // Handle incoming push notification
    const notificationData: NotificationData = {
      id: notification.id || Date.now().toString(),
      title: notification.title,
      message: notification.body,
      type: notification.data?.type || 'system',
      priority: notification.data?.priority || 'medium',
      read: false,
      timestamp: new Date(),
      data: notification.data
    };

    this.showNotification(notificationData);
  }

  private handleRealtimeNotification(data: NotificationData) {
    // Handle real-time notification from WebSocket
    this.showNotification(data);
  }

  private handleNotificationAction(notification: any) {
    // Handle notification tap/action
    const actionUrl = notification.notification.data?.actionUrl;
    if (actionUrl) {
      // Navigate to the action URL
      window.location.href = actionUrl;
    }
  }

  private showNotification(notification: NotificationData) {
    // Show notification in UI
    this.dispatchNotificationEvent(notification);
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  // Public method for simple notifications
  public showSimpleNotification(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const notification: NotificationData = {
      id: `simple_${Date.now()}`,
      title,
      message,
      type: 'system',
      priority: type === 'error' ? 'high' : 'medium',
      read: false,
      timestamp: new Date()
    };
    
    this.showNotification(notification);
  }

  private dispatchNotificationEvent(notification: NotificationData) {
    // Dispatch custom event for UI components to listen to
    const event = new CustomEvent('notificationReceived', {
      detail: notification
    });
    window.dispatchEvent(event);
  }

  // Reminder Management
  async createReminder(reminder: Omit<ReminderData, 'id'>) {
    const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReminder: ReminderData = {
      ...reminder,
      id: reminderId,
      userId: this.userId!
    };

    this.reminders.set(reminderId, newReminder);
    await this.scheduleReminder(newReminder);
    await this.saveReminders();

    return reminderId;
  }

  private async scheduleReminder(reminder: ReminderData) {
    if (!Capacitor.isNativePlatform()) {
      // For web, use setTimeout
      const timeUntilReminder = reminder.scheduledTime.getTime() - Date.now();
      if (timeUntilReminder > 0) {
        setTimeout(() => {
          this.triggerReminder(reminder);
        }, timeUntilReminder);
      }
      return;
    }

    // For native, use local notifications
    await LocalNotifications.schedule({
      notifications: [
        {
          title: reminder.title,
          body: reminder.message,
          id: parseInt(reminder.id.split('_')[1]),
          schedule: { at: reminder.scheduledTime },
          extra: {
            reminderId: reminder.id,
            type: reminder.type
          }
        }
      ]
    });
  }

  private async triggerReminder(reminder: ReminderData) {
    const notification: NotificationData = {
      id: `reminder_${reminder.id}`,
      title: reminder.title,
      message: reminder.message,
      type: reminder.type as any,
      priority: 'medium',
      read: false,
      timestamp: new Date(),
      data: { reminderId: reminder.id }
    };

    this.showNotification(notification);

    // Handle recurring reminders
    if (reminder.recurring) {
      const nextTime = this.calculateNextRecurringTime(reminder);
      if (nextTime) {
        const updatedReminder = {
          ...reminder,
          scheduledTime: nextTime
        };
        this.reminders.set(reminder.id, updatedReminder);
        await this.scheduleReminder(updatedReminder);
        await this.saveReminders();
      }
    }
  }

  private calculateNextRecurringTime(reminder: ReminderData): Date | null {
    if (!reminder.recurring) return null;

    const now = new Date();
    const nextTime = new Date(reminder.scheduledTime);

    switch (reminder.recurring.type) {
      case 'daily':
        nextTime.setDate(nextTime.getDate() + reminder.recurring.interval);
        break;
      case 'weekly':
        nextTime.setDate(nextTime.getDate() + (7 * reminder.recurring.interval));
        break;
      case 'monthly':
        nextTime.setMonth(nextTime.getMonth() + reminder.recurring.interval);
        break;
    }

    return nextTime > now ? nextTime : null;
  }

  private async loadReminders() {
    try {
      const saved = localStorage.getItem(`reminders_${this.userId}`);
      if (saved) {
        const reminders: ReminderData[] = JSON.parse(saved);
        reminders.forEach(reminder => {
          this.reminders.set(reminder.id, reminder);
          if (reminder.isActive) {
            this.scheduleReminder(reminder);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  }

  private async saveReminders() {
    try {
      const reminders = Array.from(this.reminders.values());
      localStorage.setItem(`reminders_${this.userId}`, JSON.stringify(reminders));
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  }

  // Smart Reminder Creation Methods
  async createBillReminder(billName: string, dueDate: Date, amount: number) {
    return this.createReminder({
      type: 'bill',
      title: `Bill Due: ${billName}`,
      message: `Your ${billName} bill of $${amount} is due today!`,
      scheduledTime: dueDate,
      isActive: true
    });
  }

  async createEventCountdown(eventName: string, eventDate: Date, reminderHours: number[] = [24, 2, 1]) {
    const reminders: string[] = [];
    
    for (const hours of reminderHours) {
      const reminderTime = new Date(eventDate.getTime() - (hours * 60 * 60 * 1000));
      if (reminderTime > new Date()) {
        const reminderId = await this.createReminder({
          type: 'event',
          title: `Event Reminder: ${eventName}`,
          message: `${eventName} is in ${hours} hour${hours > 1 ? 's' : ''}!`,
          scheduledTime: reminderTime,
          isActive: true
        });
        reminders.push(reminderId);
      }
    }
    
    return reminders;
  }

  async createStreakReminder(streakType: string, currentStreak: number) {
    // Create daily reminder for streak maintenance
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM reminder

    return this.createReminder({
      type: 'streak',
      title: `Maintain Your ${streakType} Streak!`,
      message: `You're on a ${currentStreak} day streak! Keep it going!`,
      scheduledTime: tomorrow,
      recurring: {
        type: 'daily',
        interval: 1
      },
      isActive: true
    });
  }

  // Partner Edit Notifications
  async notifyPartnerEdit(partnerName: string, editType: string, itemName: string) {
    const notification: NotificationData = {
      id: `edit_${Date.now()}`,
      title: 'Partner Update',
      message: `${partnerName} updated ${editType}: "${itemName}"`,
      type: 'partner',
      priority: 'medium',
      read: false,
      timestamp: new Date(),
      sender: partnerName
    };

    this.showNotification(notification);
    
    // Send to partner via real-time
    if (this.socket && this.isConnected) {
      this.socket.emit('partnerEdit', notification);
    }
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

export const notificationService = new NotificationService();
