import { notificationService, ReminderData } from './notificationService';

export interface BillReminder {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  recurring: {
    type: 'monthly' | 'quarterly' | 'yearly';
    interval: number;
  };
  isActive: boolean;
  category: string;
  notes?: string;
}

export interface EventReminder {
  id: string;
  name: string;
  date: Date;
  reminderHours: number[];
  isActive: boolean;
  category: string;
  location?: string;
  notes?: string;
}

export interface StreakReminder {
  id: string;
  type: string;
  currentStreak: number;
  lastCheckIn: Date;
  reminderTime: string; // "09:00" format
  isActive: boolean;
  goal?: number;
}

class ReminderScheduler {
  private bills: Map<string, BillReminder> = new Map();
  private events: Map<string, EventReminder> = new Map();
  private streaks: Map<string, StreakReminder> = new Map();
  private userId: string | null = null;

  async initialize(userId: string) {
    this.userId = userId;
    await this.loadReminders();
    await this.scheduleAllReminders();
  }

  // Bill Reminders
  async createBillReminder(bill: Omit<BillReminder, 'id'>): Promise<string> {
    const billId = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBill: BillReminder = {
      ...bill,
      id: billId
    };

    this.bills.set(billId, newBill);
    await this.scheduleBillReminder(newBill);
    await this.saveReminders();

    return billId;
  }

  private async scheduleBillReminder(bill: BillReminder) {
    if (!bill.isActive) return;

    // Schedule reminder 3 days before due date
    const reminderDate = new Date(bill.dueDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    if (reminderDate > new Date()) {
      await notificationService.createReminder({
        type: 'bill',
        title: `Bill Due Soon: ${bill.name}`,
        message: `Your ${bill.name} bill of $${bill.amount} is due in 3 days (${bill.dueDate.toLocaleDateString()})`,
        scheduledTime: reminderDate,
        isActive: true,
        userId: this.userId!
      });
    }

    // Schedule reminder on due date
    if (bill.dueDate > new Date()) {
      await notificationService.createReminder({
        type: 'bill',
        title: `Bill Due Today: ${bill.name}`,
        message: `Your ${bill.name} bill of $${bill.amount} is due today!`,
        scheduledTime: bill.dueDate,
        isActive: true,
        userId: this.userId!
      });
    }

    // Schedule overdue reminder (1 day after due date)
    const overdueDate = new Date(bill.dueDate);
    overdueDate.setDate(overdueDate.getDate() + 1);

    if (overdueDate > new Date()) {
      await notificationService.createReminder({
        type: 'bill',
        title: `Bill Overdue: ${bill.name}`,
        message: `Your ${bill.name} bill of $${bill.amount} is now overdue. Please pay as soon as possible.`,
        scheduledTime: overdueDate,
        isActive: true,
        userId: this.userId!
      });
    }
  }

  // Event Reminders
  async createEventReminder(event: Omit<EventReminder, 'id'>): Promise<string> {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEvent: EventReminder = {
      ...event,
      id: eventId
    };

    this.events.set(eventId, newEvent);
    await this.scheduleEventReminder(newEvent);
    await this.saveReminders();

    return eventId;
  }

  private async scheduleEventReminder(event: EventReminder) {
    if (!event.isActive) return;

    // Schedule countdown reminders
    for (const hours of event.reminderHours) {
      const reminderTime = new Date(event.date.getTime() - (hours * 60 * 60 * 1000));
      
      if (reminderTime > new Date()) {
        await notificationService.createReminder({
          type: 'event',
          title: `Event Reminder: ${event.name}`,
          message: `${event.name} is in ${hours} hour${hours > 1 ? 's' : ''}!${event.location ? ` Location: ${event.location}` : ''}`,
          scheduledTime: reminderTime,
          isActive: true,
          userId: this.userId!
        });
      }
    }

    // Schedule day-of reminder
    const dayOfReminder = new Date(event.date);
    dayOfReminder.setHours(9, 0, 0, 0); // 9 AM on event day

    if (dayOfReminder > new Date()) {
      await notificationService.createReminder({
        type: 'event',
        title: `Today: ${event.name}`,
        message: `Don't forget! ${event.name} is today${event.location ? ` at ${event.location}` : ''}`,
        scheduledTime: dayOfReminder,
        isActive: true,
        userId: this.userId!
      });
    }
  }

  // Streak Reminders
  async createStreakReminder(streak: Omit<StreakReminder, 'id'>): Promise<string> {
    const streakId = `streak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newStreak: StreakReminder = {
      ...streak,
      id: streakId
    };

    this.streaks.set(streakId, newStreak);
    await this.scheduleStreakReminder(newStreak);
    await this.saveReminders();

    return streakId;
  }

  private async scheduleStreakReminder(streak: StreakReminder) {
    if (!streak.isActive) return;

    // Schedule daily reminder
    const [hours, minutes] = streak.reminderTime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (reminderTime <= new Date()) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    await notificationService.createReminder({
      type: 'streak',
      title: `Maintain Your ${streak.type} Streak!`,
      message: `You're on a ${streak.currentStreak} day streak! Keep it going!${streak.goal ? ` Goal: ${streak.goal} days` : ''}`,
      scheduledTime: reminderTime,
      recurring: {
        type: 'daily',
        interval: 1
      },
      isActive: true,
      userId: this.userId!
    });

    // Schedule milestone reminders
    const milestones = [7, 14, 30, 60, 100];
    for (const milestone of milestones) {
      if (streak.currentStreak < milestone && (!streak.goal || milestone <= streak.goal)) {
        const milestoneDate = new Date();
        milestoneDate.setDate(milestoneDate.getDate() + (milestone - streak.currentStreak));
        milestoneDate.setHours(hours, minutes, 0, 0);

        if (milestoneDate > new Date()) {
          await notificationService.createReminder({
            type: 'streak',
            title: `Streak Milestone Coming Up!`,
            message: `You're ${milestone - streak.currentStreak} days away from a ${milestone}-day ${streak.type} streak!`,
            scheduledTime: milestoneDate,
            isActive: true,
            userId: this.userId!
          });
        }
      }
    }
  }

  // Smart Reminder Suggestions
  async generateSmartReminders(): Promise<{
    bills: BillReminder[];
    events: EventReminder[];
    streaks: StreakReminder[];
  }> {
    const suggestions = {
      bills: [] as BillReminder[],
      events: [] as EventReminder[],
      streaks: [] as StreakReminder[]
    };

    // Suggest common bills
    const commonBills = [
      { name: 'Electricity', amount: 120, category: 'Utilities' },
      { name: 'Internet', amount: 80, category: 'Utilities' },
      { name: 'Phone', amount: 60, category: 'Communication' },
      { name: 'Rent/Mortgage', amount: 1500, category: 'Housing' },
      { name: 'Insurance', amount: 200, category: 'Insurance' }
    ];

    for (const bill of commonBills) {
      if (!Array.from(this.bills.values()).some(b => b.name === bill.name)) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 1);
        dueDate.setDate(1); // First of next month

        suggestions.bills.push({
          id: '',
          name: bill.name,
          amount: bill.amount,
          dueDate,
          recurring: { type: 'monthly', interval: 1 },
          isActive: true,
          category: bill.category
        });
      }
    }

    // Suggest common events
    const commonEvents = [
      { name: 'Anniversary', category: 'Relationship' },
      { name: 'Birthday', category: 'Personal' },
      { name: 'Date Night', category: 'Relationship' },
      { name: 'Vacation', category: 'Travel' }
    ];

    for (const event of commonEvents) {
      if (!Array.from(this.events.values()).some(e => e.name === event.name)) {
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + 30); // 30 days from now

        suggestions.events.push({
          id: '',
          name: event.name,
          date: eventDate,
          reminderHours: [24, 2, 1],
          isActive: true,
          category: event.category
        });
      }
    }

    // Suggest common streaks
    const commonStreaks = [
      { type: 'Daily Check-in', goal: 30 },
      { type: 'Exercise', goal: 21 },
      { type: 'Meditation', goal: 30 },
      { type: 'Reading', goal: 14 }
    ];

    for (const streak of commonStreaks) {
      if (!Array.from(this.streaks.values()).some(s => s.type === streak.type)) {
        suggestions.streaks.push({
          id: '',
          type: streak.type,
          currentStreak: 0,
          lastCheckIn: new Date(),
          reminderTime: '09:00',
          isActive: true,
          goal: streak.goal
        });
      }
    }

    return suggestions;
  }

  // Data persistence
  private async loadReminders() {
    try {
      const saved = localStorage.getItem(`reminders_${this.userId}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.bills) {
          data.bills.forEach((bill: BillReminder) => this.bills.set(bill.id, bill));
        }
        if (data.events) {
          data.events.forEach((event: EventReminder) => this.events.set(event.id, event));
        }
        if (data.streaks) {
          data.streaks.forEach((streak: StreakReminder) => this.streaks.set(streak.id, streak));
        }
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  }

  private async saveReminders() {
    try {
      const data = {
        bills: Array.from(this.bills.values()),
        events: Array.from(this.events.values()),
        streaks: Array.from(this.streaks.values())
      };
      localStorage.setItem(`reminders_${this.userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  }

  private async scheduleAllReminders() {
    // Schedule all existing reminders
    for (const bill of this.bills.values()) {
      await this.scheduleBillReminder(bill);
    }
    for (const event of this.events.values()) {
      await this.scheduleEventReminder(event);
    }
    for (const streak of this.streaks.values()) {
      await this.scheduleStreakReminder(streak);
    }
  }

  // Getters
  getAllBills(): BillReminder[] {
    return Array.from(this.bills.values());
  }

  getAllEvents(): EventReminder[] {
    return Array.from(this.events.values());
  }

  getAllStreaks(): StreakReminder[] {
    return Array.from(this.streaks.values());
  }

  // Update methods
  async updateBillReminder(id: string, updates: Partial<BillReminder>) {
    const bill = this.bills.get(id);
    if (bill) {
      const updatedBill = { ...bill, ...updates };
      this.bills.set(id, updatedBill);
      await this.scheduleBillReminder(updatedBill);
      await this.saveReminders();
    }
  }

  async updateEventReminder(id: string, updates: Partial<EventReminder>) {
    const event = this.events.get(id);
    if (event) {
      const updatedEvent = { ...event, ...updates };
      this.events.set(id, updatedEvent);
      await this.scheduleEventReminder(updatedEvent);
      await this.saveReminders();
    }
  }

  async updateStreakReminder(id: string, updates: Partial<StreakReminder>) {
    const streak = this.streaks.get(id);
    if (streak) {
      const updatedStreak = { ...streak, ...updates };
      this.streaks.set(id, updatedStreak);
      await this.scheduleStreakReminder(updatedStreak);
      await this.saveReminders();
    }
  }

  // Delete methods
  async deleteBillReminder(id: string) {
    this.bills.delete(id);
    await this.saveReminders();
  }

  async deleteEventReminder(id: string) {
    this.events.delete(id);
    await this.saveReminders();
  }

  async deleteStreakReminder(id: string) {
    this.streaks.delete(id);
    await this.saveReminders();
  }
}

export const reminderScheduler = new ReminderScheduler();
