import { notificationService } from './notificationService';

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  location?: string;
  reminderSettings: {
    enabled: boolean;
    minutesBefore: number;
    hoursBefore: number;
    daysBefore: number;
  };
  repeatPattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    endDate?: string;
  };
  assignedPartners: string[];
  createdBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'work' | 'personal' | 'health' | 'social' | 'travel' | 'finance' | 'other';
  tags: string[];
  attachments: Attachment[];
  mood?: 'excited' | 'stressed' | 'neutral' | 'happy' | 'anxious';
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'link' | 'file' | 'image';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ScheduleHistory {
  id: string;
  itemId: string;
  action: 'created' | 'updated' | 'deleted' | 'restored' | 'completed' | 'reminder-sent';
  userId: string;
  userName: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  description: string;
}

export interface ScheduleFilter {
  partners?: string[];
  categories?: string[];
  priority?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  completed?: boolean;
}

class ScheduleService {
  private scheduleItems: ScheduleItem[] = [];
  private scheduleHistory: ScheduleHistory[] = [];
  private listeners: ((items: ScheduleItem[]) => void)[] = [];
  private currentUser = 'Person1'; // This would come from auth context
  private partnerUser = 'Person2';
  
  // Partner color mapping
  private partnerColors = {
    'Person1': {
      primary: 'bg-blue-100',
      secondary: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      glow: 'shadow-blue-200',
      avatar: 'bg-blue-500'
    },
    'Person2': {
      primary: 'bg-purple-100',
      secondary: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      glow: 'shadow-purple-200',
      avatar: 'bg-purple-500'
    }
  };

  constructor() {
    this.loadScheduleItems();
    this.loadScheduleHistory();
    this.initializeSampleData();
    this.startReminderCheck();
  }

  // Real-time sync simulation
  subscribe(listener: (items: ScheduleItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.scheduleItems]));
    this.saveScheduleItems();
  }

  // Partner color utilities
  getPartnerColor(partner: string, type: 'primary' | 'secondary' | 'border' | 'text' | 'glow' | 'avatar' = 'primary') {
    return this.partnerColors[partner as keyof typeof this.partnerColors]?.[type] || this.partnerColors.Person1[type];
  }

  getPartnerAvatar(partner: string) {
    return partner.charAt(0).toUpperCase();
  }

  // History Management
  private addToHistory(
    itemId: string, 
    action: ScheduleHistory['action'], 
    changes?: ScheduleHistory['changes'],
    description?: string
  ) {
    const historyEntry: ScheduleHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      action,
      userId: this.currentUser,
      userName: this.currentUser,
      timestamp: new Date().toISOString(),
      changes,
      description: description || this.generateHistoryDescription(action, changes)
    };

    this.scheduleHistory.push(historyEntry);
    this.saveScheduleHistory();

    // Notify partner about changes
    if (action !== 'created') {
      this.notifyPartner(itemId, action, description);
    }
  }

  private generateHistoryDescription(action: ScheduleHistory['action'], changes?: ScheduleHistory['changes']): string {
    switch (action) {
      case 'created':
        return `${this.currentUser} created this event`;
      case 'updated':
        if (changes && changes.length > 0) {
          const change = changes[0];
          return `${this.currentUser} changed ${change.field} from "${change.oldValue}" to "${change.newValue}"`;
        }
        return `${this.currentUser} updated this event`;
      case 'deleted':
        return `${this.currentUser} deleted this event`;
      case 'restored':
        return `${this.currentUser} restored this event`;
      case 'completed':
        return `${this.currentUser} completed this event`;
      case 'reminder-sent':
        return `Reminder sent for this event`;
      default:
        return `${this.currentUser} performed an action on this event`;
    }
  }

  private notifyPartner(itemId: string, action: string, description?: string) {
    const item = this.scheduleItems.find(i => i.id === itemId);
    if (item) {
      // This would integrate with the notification service
      console.log(`Schedule notification: ${this.currentUser} ${action} "${item.title}" - ${description}`);
    }
  }

  // Schedule Item Management
  createScheduleItem(itemData: Partial<ScheduleItem>): ScheduleItem {
    const item: ScheduleItem = {
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: itemData.title || '',
      description: itemData.description,
      startDate: itemData.startDate || new Date().toISOString(),
      endDate: itemData.endDate,
      allDay: itemData.allDay || false,
      location: itemData.location,
      reminderSettings: itemData.reminderSettings || {
        enabled: true,
        minutesBefore: 15,
        hoursBefore: 0,
        daysBefore: 0
      },
      repeatPattern: itemData.repeatPattern,
      assignedPartners: itemData.assignedPartners || [this.currentUser],
      createdBy: this.currentUser,
      priority: itemData.priority || 'medium',
      category: itemData.category || 'personal',
      tags: itemData.tags || [],
      attachments: itemData.attachments || [],
      mood: itemData.mood,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };

    this.scheduleItems.push(item);
    this.addToHistory(item.id, 'created');
    this.notifyListeners();

    // Set up reminders
    if (item.reminderSettings.enabled) {
      this.scheduleReminder(item);
    }

    // Generate recurring events if needed
    if (item.repeatPattern) {
      this.generateRecurringEvents(item);
    }

    return item;
  }

  updateScheduleItem(itemId: string, updates: Partial<ScheduleItem>): ScheduleItem | null {
    const itemIndex = this.scheduleItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return null;

    const oldItem = { ...this.scheduleItems[itemIndex] };
    const changes: ScheduleHistory['changes'] = [];

    // Track changes
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof ScheduleItem] !== oldItem[key as keyof ScheduleItem]) {
        changes.push({
          field: key,
          oldValue: oldItem[key as keyof ScheduleItem],
          newValue: updates[key as keyof ScheduleItem]
        });
      }
    });

    this.scheduleItems[itemIndex] = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addToHistory(itemId, 'updated', changes);
    this.notifyListeners();

    return this.scheduleItems[itemIndex];
  }

  deleteScheduleItem(itemId: string): boolean {
    const itemIndex = this.scheduleItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    this.scheduleItems[itemIndex] = {
      ...this.scheduleItems[itemIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };

    this.addToHistory(itemId, 'deleted');
    this.notifyListeners();

    return true;
  }

  restoreScheduleItem(itemId: string): boolean {
    const itemIndex = this.scheduleItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    this.scheduleItems[itemIndex] = {
      ...this.scheduleItems[itemIndex],
      isDeleted: false,
      deletedAt: undefined
    };

    this.addToHistory(itemId, 'restored');
    this.notifyListeners();

    return true;
  }

  permanentlyDeleteScheduleItem(itemId: string): boolean {
    const itemIndex = this.scheduleItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    this.scheduleItems.splice(itemIndex, 1);
    this.notifyListeners();

    return true;
  }

  completeScheduleItem(itemId: string): boolean {
    const item = this.scheduleItems.find(i => i.id === itemId);
    if (!item) return false;

    this.updateScheduleItem(itemId, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
      completedBy: this.currentUser
    });

    this.addToHistory(itemId, 'completed');
    this.notifyListeners();

    return true;
  }

  // Recurring Events
  private generateRecurringEvents(parentItem: ScheduleItem) {
    if (!parentItem.repeatPattern) return;

    const { type, interval, daysOfWeek, endDate } = parentItem.repeatPattern;
    const startDate = new Date(parentItem.startDate);
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default

    let currentDate = new Date(startDate);
    let count = 0;
    const maxRecurrences = 50; // Prevent infinite loops

    while (currentDate <= end && count < maxRecurrences) {
      switch (type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + interval);
          break;
      }

      if (currentDate <= end) {
        const recurringItem: ScheduleItem = {
          ...parentItem,
          id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          startDate: currentDate.toISOString(),
          endDate: parentItem.endDate ? new Date(new Date(parentItem.endDate).getTime() + (currentDate.getTime() - startDate.getTime())).toISOString() : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.scheduleItems.push(recurringItem);
        count++;
      }
    }

    this.notifyListeners();
  }

  // Reminder System
  private scheduleReminder(item: ScheduleItem) {
    if (!item.reminderSettings.enabled) return;

    const reminderTime = new Date(item.startDate);
    reminderTime.setMinutes(reminderTime.getMinutes() - item.reminderSettings.minutesBefore);
    reminderTime.setHours(reminderTime.getHours() - item.reminderSettings.hoursBefore);
    reminderTime.setDate(reminderTime.getDate() - item.reminderSettings.daysBefore);

    if (reminderTime > new Date()) {
      // This would integrate with the notification service
      console.log(`Reminder scheduled for "${item.title}" at ${reminderTime.toISOString()}`);
    }
  }

  private startReminderCheck() {
    // Check for reminders every minute
    setInterval(() => {
      this.checkReminders();
    }, 60000);
  }

  private checkReminders() {
    const now = new Date();
    const upcomingItems = this.getUpcomingItems(1); // Next hour

    upcomingItems.forEach(item => {
      if (item.reminderSettings.enabled) {
        const reminderTime = new Date(item.startDate);
        reminderTime.setMinutes(reminderTime.getMinutes() - item.reminderSettings.minutesBefore);
        reminderTime.setHours(reminderTime.getHours() - item.reminderSettings.hoursBefore);
        reminderTime.setDate(reminderTime.getDate() - item.reminderSettings.daysBefore);

        if (Math.abs(now.getTime() - reminderTime.getTime()) < 60000) { // Within 1 minute
          this.sendReminder(item);
        }
      }
    });
  }

  private sendReminder(item: ScheduleItem) {
    // This would send actual push notifications
    console.log(`🔔 Reminder: "${item.title}" is starting soon!`);
    
    this.addToHistory(item.id, 'reminder-sent', undefined, `Reminder sent for "${item.title}"`);
  }

  // Query Methods
  getScheduleItems(filter?: ScheduleFilter): ScheduleItem[] {
    let filteredItems = this.scheduleItems.filter(item => !item.isDeleted);

    if (filter) {
      if (filter.partners && filter.partners.length > 0) {
        filteredItems = filteredItems.filter(item => 
          item.assignedPartners.some(partner => filter.partners!.includes(partner))
        );
      }
      if (filter.categories && filter.categories.length > 0) {
        filteredItems = filteredItems.filter(item => filter.categories!.includes(item.category));
      }
      if (filter.priority && filter.priority.length > 0) {
        filteredItems = filteredItems.filter(item => filter.priority!.includes(item.priority));
      }
      if (filter.dateRange) {
        filteredItems = filteredItems.filter(item => {
          const itemDate = new Date(item.startDate);
          return itemDate >= new Date(filter.dateRange!.start) && itemDate <= new Date(filter.dateRange!.end);
        });
      }
      if (filter.tags && filter.tags.length > 0) {
        filteredItems = filteredItems.filter(item => 
          item.tags.some(tag => filter.tags!.includes(tag))
        );
      }
      if (filter.completed !== undefined) {
        filteredItems = filteredItems.filter(item => item.isCompleted === filter.completed);
      }
    }

    return filteredItems.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  getScheduleItemById(itemId: string): ScheduleItem | null {
    return this.scheduleItems.find(item => item.id === itemId) || null;
  }

  getScheduleHistory(itemId: string): ScheduleHistory[] {
    return this.scheduleHistory
      .filter(history => history.itemId === itemId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getDeletedItems(): ScheduleItem[] {
    return this.scheduleItems.filter(item => item.isDeleted);
  }

  // Utility Methods
  getUpcomingItems(hours: number = 24): ScheduleItem[] {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return this.getScheduleItems().filter(item => {
      const itemDate = new Date(item.startDate);
      return itemDate >= now && itemDate <= future && !item.isCompleted;
    });
  }

  getTodayItems(): ScheduleItem[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getScheduleItems().filter(item => {
      const itemDate = new Date(item.startDate);
      return itemDate >= today && itemDate < tomorrow;
    });
  }

  getThisWeekItems(): ScheduleItem[] {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return this.getScheduleItems({
      dateRange: {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString()
      }
    });
  }

  getThisMonthItems(): ScheduleItem[] {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getScheduleItems({
      dateRange: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      }
    });
  }

  getItemsByPartner(partner: string): ScheduleItem[] {
    return this.getScheduleItems().filter(item => item.assignedPartners.includes(partner));
  }

  getItemsByCategory(category: ScheduleItem['category']): ScheduleItem[] {
    return this.getScheduleItems().filter(item => item.category === category);
  }

  // Data Persistence
  private saveScheduleItems() {
    localStorage.setItem('bondly-schedule-items', JSON.stringify(this.scheduleItems));
  }

  private loadScheduleItems() {
    const saved = localStorage.getItem('bondly-schedule-items');
    if (saved) {
      this.scheduleItems = JSON.parse(saved);
    }
  }

  private saveScheduleHistory() {
    localStorage.setItem('bondly-schedule-history', JSON.stringify(this.scheduleHistory));
  }

  private loadScheduleHistory() {
    const saved = localStorage.getItem('bondly-schedule-history');
    if (saved) {
      this.scheduleHistory = JSON.parse(saved);
    }
  }

  // Initialize with empty state
  private initializeSampleData() {
    // No sample data - start with empty state
    if (this.scheduleItems.length === 0) {
      this.scheduleItems = [];
      this.saveScheduleItems();
    }
  }

  // Cleanup deleted items (older than 7 days)
  cleanupDeletedItems() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.scheduleItems = this.scheduleItems.filter(item => 
      !item.isDeleted || (item.deletedAt && new Date(item.deletedAt) > sevenDaysAgo)
    );
    this.notifyListeners();
  }
}

export const scheduleService = new ScheduleService();
