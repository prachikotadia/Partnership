import { notificationService } from './notificationService';
import { reminderScheduler } from './reminderScheduler';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  type: 'trip' | 'meal' | 'life' | 'task' | 'reminder';
  category: string;
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  color: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdBy: string;
  assignedTo?: string;
  location?: string;
  tags: string[];
  attachments?: string[];
  notes?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TripPlan {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  status: 'planning' | 'booked' | 'completed' | 'cancelled';
  flights?: {
    departure: {
      airport: string;
      time: Date;
      airline: string;
      flightNumber: string;
    };
    return: {
      airport: string;
      time: Date;
      airline: string;
      flightNumber: string;
    };
  };
  accommodation?: {
    name: string;
    address: string;
    checkIn: Date;
    checkOut: Date;
    confirmationNumber: string;
  };
  activities: {
    id: string;
    name: string;
    date: Date;
    time?: string;
    location: string;
    cost?: number;
    notes?: string;
    isBooked: boolean;
  }[];
  todoList: {
    id: string;
    task: string;
    assignedTo: string;
    dueDate?: Date;
    isCompleted: boolean;
    priority: 'low' | 'medium' | 'high';
  }[];
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlan {
  id: string;
  weekStart: Date;
  meals: {
    [key: string]: {
      breakfast?: {
        name: string;
        ingredients: string[];
        prepTime: number;
        difficulty: 'easy' | 'medium' | 'hard';
      };
      lunch?: {
        name: string;
        ingredients: string[];
        prepTime: number;
        difficulty: 'easy' | 'medium' | 'hard';
      };
      dinner?: {
        name: string;
        ingredients: string[];
        prepTime: number;
        difficulty: 'easy' | 'medium' | 'hard';
      };
    };
  };
  shoppingList: {
    id: string;
    item: string;
    quantity: string;
    category: string;
    isPurchased: boolean;
    addedBy: string;
  }[];
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
}

class TimelineService {
  private events: Map<string, TimelineEvent> = new Map();
  private tripPlans: Map<string, TripPlan> = new Map();
  private mealPlans: Map<string, MealPlan> = new Map();
  private userId: string | null = null;

  async initialize(userId: string) {
    this.userId = userId;
    await this.loadData();
    await this.scheduleEventReminders();
  }

  // Event Management
  async createEvent(event: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEvent: TimelineEvent = {
      ...event,
      id: eventId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.events.set(eventId, newEvent);
    await this.scheduleEventReminders();
    await this.saveData();

    // Notify partner
    await this.notifyPartner('event_created', {
      type: 'event',
      title: 'New Event Added',
      message: `${event.createdBy} added "${event.title}" to the timeline`,
      eventId,
      event: newEvent
    });

    return eventId;
  }

  async updateEvent(id: string, updates: Partial<TimelineEvent>): Promise<void> {
    const event = this.events.get(id);
    if (event) {
      const updatedEvent = {
        ...event,
        ...updates,
        updatedAt: new Date()
      };
      this.events.set(id, updatedEvent);
      await this.scheduleEventReminders();
      await this.saveData();

      // Notify partner
      await this.notifyPartner('event_updated', {
        type: 'event',
        title: 'Event Updated',
        message: `${event.createdBy} updated "${event.title}"`,
        eventId: id,
        event: updatedEvent
      });
    }
  }

  async deleteEvent(id: string): Promise<void> {
    const event = this.events.get(id);
    if (event) {
      this.events.delete(id);
      await this.saveData();

      // Notify partner
      await this.notifyPartner('event_deleted', {
        type: 'event',
        title: 'Event Deleted',
        message: `${event.createdBy} deleted "${event.title}"`,
        eventId: id
      });
    }
  }

  // Trip Planning
  async createTripPlan(trip: Omit<TripPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTrip: TripPlan = {
      ...trip,
      id: tripId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tripPlans.set(tripId, newTrip);
    await this.createTripEvents(newTrip);
    await this.saveData();

    // Notify partner
    await this.notifyPartner('trip_created', {
      type: 'trip',
      title: 'New Trip Planned',
      message: `${trip.sharedWith[0]} planned a trip to ${trip.destination}`,
      tripId,
      trip: newTrip
    });

    return tripId;
  }

  private async createTripEvents(trip: TripPlan): Promise<void> {
    // Create main trip event
    await this.createEvent({
      title: `Trip to ${trip.destination}`,
      description: trip.title,
      type: 'trip',
      category: 'Travel',
      startDate: trip.startDate,
      endDate: trip.endDate,
      allDay: true,
      color: '#3b82f6',
      priority: 'high',
      isCompleted: false,
      createdBy: this.userId!,
      tags: ['travel', 'vacation', trip.destination.toLowerCase()],
      notes: trip.title
    });

    // Create flight events
    if (trip.flights) {
      await this.createEvent({
        title: `Flight to ${trip.destination}`,
        description: `${trip.flights.departure.airline} ${trip.flights.departure.flightNumber}`,
        type: 'trip',
        category: 'Transportation',
        startDate: trip.flights.departure.time,
        allDay: false,
        color: '#10b981',
        priority: 'high',
        isCompleted: false,
        createdBy: this.userId!,
        location: trip.flights.departure.airport,
        tags: ['flight', 'departure']
      });

      await this.createEvent({
        title: `Return Flight`,
        description: `${trip.flights.return.airline} ${trip.flights.return.flightNumber}`,
        type: 'trip',
        category: 'Transportation',
        startDate: trip.flights.return.time,
        allDay: false,
        color: '#10b981',
        priority: 'high',
        isCompleted: false,
        createdBy: this.userId!,
        location: trip.flights.return.airport,
        tags: ['flight', 'return']
      });
    }

    // Create accommodation event
    if (trip.accommodation) {
      await this.createEvent({
        title: `Check-in: ${trip.accommodation.name}`,
        description: trip.accommodation.address,
        type: 'trip',
        category: 'Accommodation',
        startDate: trip.accommodation.checkIn,
        endDate: trip.accommodation.checkOut,
        allDay: true,
        color: '#8b5cf6',
        priority: 'medium',
        isCompleted: false,
        createdBy: this.userId!,
        location: trip.accommodation.address,
        tags: ['hotel', 'accommodation']
      });
    }

    // Create activity events
    for (const activity of trip.activities) {
      await this.createEvent({
        title: activity.name,
        description: activity.notes,
        type: 'trip',
        category: 'Activity',
        startDate: activity.date,
        allDay: !activity.time,
        color: '#f59e0b',
        priority: 'medium',
        isCompleted: activity.isBooked,
        createdBy: this.userId!,
        location: activity.location,
        tags: ['activity', 'fun']
      });
    }
  }

  // Meal Planning
  async createMealPlan(mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const mealPlanId = `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMealPlan: MealPlan = {
      ...mealPlan,
      id: mealPlanId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mealPlans.set(mealPlanId, newMealPlan);
    await this.createMealEvents(newMealPlan);
    await this.saveData();

    // Notify partner
    await this.notifyPartner('meal_plan_created', {
      type: 'meal',
      title: 'New Meal Plan Created',
      message: `Weekly meal plan for ${newMealPlan.weekStart.toLocaleDateString()} has been created`,
      mealPlanId,
      mealPlan: newMealPlan
    });

    return mealPlanId;
  }

  private async createMealEvents(mealPlan: MealPlan): Promise<void> {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (const [dayIndex, day] of days.entries()) {
      const dayMeals = mealPlan.meals[day];
      if (dayMeals) {
        const eventDate = new Date(mealPlan.weekStart);
        eventDate.setDate(eventDate.getDate() + dayIndex);

        // Create meal planning event for the day
        await this.createEvent({
          title: `${day} Meals`,
          description: this.formatMealDescription(dayMeals),
          type: 'meal',
          category: 'Meal Planning',
          startDate: eventDate,
          allDay: true,
          color: '#ef4444',
          priority: 'medium',
          isCompleted: false,
          createdBy: this.userId!,
          tags: ['meal', 'planning', day.toLowerCase()]
        });
      }
    }

    // Create shopping list reminder
    const shoppingDate = new Date(mealPlan.weekStart);
    shoppingDate.setDate(shoppingDate.getDate() - 1); // Day before meal plan starts

    await this.createEvent({
      title: 'Grocery Shopping',
      description: `Shopping for ${mealPlan.weekStart.toLocaleDateString()} meal plan`,
      type: 'meal',
      category: 'Shopping',
      startDate: shoppingDate,
      allDay: true,
      color: '#06b6d4',
      priority: 'high',
      isCompleted: false,
      createdBy: this.userId!,
      tags: ['shopping', 'grocery', 'meal-planning']
    });
  }

  private formatMealDescription(dayMeals: any): string {
    const meals = [];
    if (dayMeals.breakfast) meals.push(`Breakfast: ${dayMeals.breakfast.name}`);
    if (dayMeals.lunch) meals.push(`Lunch: ${dayMeals.lunch.name}`);
    if (dayMeals.dinner) meals.push(`Dinner: ${dayMeals.dinner.name}`);
    return meals.join('\n');
  }

  // Event Reminders
  private async scheduleEventReminders(): Promise<void> {
    for (const event of this.events.values()) {
      if (!event.isCompleted && event.startDate > new Date()) {
        // Schedule reminder 1 day before
        const reminderDate = new Date(event.startDate);
        reminderDate.setDate(reminderDate.getDate() - 1);

        if (reminderDate > new Date()) {
        await reminderScheduler.createEventReminder({
          name: event.title,
          date: event.startDate,
          reminderHours: [24, 2, 1],
          isActive: true,
          category: event.category,
          location: event.location,
          notes: event.description
        });
        }
      }
    }
  }

  // Data Management
  private async loadData(): Promise<void> {
    try {
      const saved = localStorage.getItem(`timeline_${this.userId}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.events) {
          data.events.forEach((event: TimelineEvent) => {
            this.events.set(event.id, {
              ...event,
              startDate: new Date(event.startDate),
              endDate: event.endDate ? new Date(event.endDate) : undefined,
              createdAt: new Date(event.createdAt),
              updatedAt: new Date(event.updatedAt)
            });
          });
        }
        if (data.tripPlans) {
          data.tripPlans.forEach((trip: TripPlan) => {
            this.tripPlans.set(trip.id, {
              ...trip,
              startDate: new Date(trip.startDate),
              endDate: new Date(trip.endDate),
              createdAt: new Date(trip.createdAt),
              updatedAt: new Date(trip.updatedAt)
            });
          });
        }
        if (data.mealPlans) {
          data.mealPlans.forEach((mealPlan: MealPlan) => {
            this.mealPlans.set(mealPlan.id, {
              ...mealPlan,
              weekStart: new Date(mealPlan.weekStart),
              createdAt: new Date(mealPlan.createdAt),
              updatedAt: new Date(mealPlan.updatedAt)
            });
          });
        }
      }
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      const data = {
        events: Array.from(this.events.values()),
        tripPlans: Array.from(this.tripPlans.values()),
        mealPlans: Array.from(this.mealPlans.values())
      };
      localStorage.setItem(`timeline_${this.userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save timeline data:', error);
    }
  }

  // Partner Notifications
  private async notifyPartner(type: string, data: any): Promise<void> {
    await notificationService.notifyPartnerEdit(
      this.userId || 'System',
      type,
      data.title
    );
  }

  // Getters
  getEvents(): TimelineEvent[] {
    return Array.from(this.events.values()).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  getEventsByDate(date: Date): TimelineEvent[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getEvents().filter(event => {
      const eventDate = event.startDate;
      return eventDate >= startOfDay && eventDate <= endOfDay;
    });
  }

  getEventsByType(type: string): TimelineEvent[] {
    return this.getEvents().filter(event => event.type === type);
  }

  getTripPlans(): TripPlan[] {
    return Array.from(this.tripPlans.values()).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  getMealPlans(): MealPlan[] {
    return Array.from(this.mealPlans.values()).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }

  getUpcomingEvents(days: number = 7): TimelineEvent[] {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.getEvents().filter(event => 
      event.startDate >= now && event.startDate <= future && !event.isCompleted
    );
  }

  // Search and Filter
  searchEvents(query: string): TimelineEvent[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getEvents().filter(event =>
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.description?.toLowerCase().includes(lowercaseQuery) ||
      event.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  getEventsByTag(tag: string): TimelineEvent[] {
    return this.getEvents().filter(event => 
      event.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }
}

export const timelineService = new TimelineService();
