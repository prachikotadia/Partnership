import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_recurring: boolean;
  recurring_pattern?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

class SupabaseScheduleService {
  private listeners: ((items: ScheduleItem[]) => void)[] = [];

  // Subscribe to schedule changes
  subscribe(listener: (items: ScheduleItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(items: ScheduleItem[]) {
    this.listeners.forEach(listener => listener(items));
  }

  // Get all schedule items for the current user
  async getScheduleItems(): Promise<ScheduleItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('created_by', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching schedule items:', error);
      return [];
    }
  }

  // Create a new schedule item
  async createScheduleItem(itemData: Omit<ScheduleItem, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduleItem | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('schedule_items')
        .insert({
          ...itemData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Event Created',
        `Schedule item "${data.title}" has been created successfully.`,
        'success'
      );

      // Refresh items
      const items = await this.getScheduleItems();
      this.notifyListeners(items);

      return data;
    } catch (error) {
      console.error('Error creating schedule item:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to create schedule item. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Update a schedule item
  async updateScheduleItem(itemId: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem | null> {
    try {
      const { data, error } = await supabase
        .from('schedule_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Event Updated',
        `Schedule item "${data.title}" has been updated successfully.`,
        'success'
      );

      // Refresh items
      const items = await this.getScheduleItems();
      this.notifyListeners(items);

      return data;
    } catch (error) {
      console.error('Error updating schedule item:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to update schedule item. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Delete a schedule item
  async deleteScheduleItem(itemId: string): Promise<boolean> {
    try {
      const { data: currentItem } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('id', itemId)
        .single();

      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Event Deleted',
        `Schedule item "${currentItem?.title}" has been deleted successfully.`,
        'success'
      );

      // Refresh items
      const items = await this.getScheduleItems();
      this.notifyListeners(items);

      return true;
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to delete schedule item. Please try again.',
        'error'
      );
      return false;
    }
  }

  // Get schedule items for a specific date
  async getScheduleItemsByDate(date: string): Promise<ScheduleItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('created_by', user.id)
        .gte('start_date', startOfDay.toISOString())
        .lte('start_date', endOfDay.toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching schedule items by date:', error);
      return [];
    }
  }

  // Get schedule items for a date range
  async getScheduleItemsByDateRange(startDate: string, endDate: string): Promise<ScheduleItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('created_by', user.id)
        .gte('start_date', startDate)
        .lte('start_date', endDate)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching schedule items by date range:', error);
      return [];
    }
  }

  // Get upcoming schedule items
  async getUpcomingScheduleItems(limit: number = 10): Promise<ScheduleItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('created_by', user.id)
        .gte('start_date', now)
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming schedule items:', error);
      return [];
    }
  }

  // Get recurring schedule items
  async getRecurringScheduleItems(): Promise<ScheduleItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_recurring', true)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recurring schedule items:', error);
      return [];
    }
  }

  // Search schedule items
  async searchScheduleItems(query: string): Promise<ScheduleItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('created_by', user.id)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching schedule items:', error);
      return [];
    }
  }

  // Get schedule statistics
  async getScheduleStats(): Promise<{
    total: number;
    upcoming: number;
    recurring: number;
    thisWeek: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('schedule_items')
        .select('start_date, is_recurring')
        .eq('created_by', user.id);

      if (error) throw error;

      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const stats = {
        total: data.length,
        upcoming: data.filter(item => new Date(item.start_date) > now).length,
        recurring: data.filter(item => item.is_recurring).length,
        thisWeek: data.filter(item => {
          const itemDate = new Date(item.start_date);
          return itemDate >= now && itemDate <= weekFromNow;
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error fetching schedule stats:', error);
      return { total: 0, upcoming: 0, recurring: 0, thisWeek: 0 };
    }
  }
}

export const supabaseScheduleService = new SupabaseScheduleService();
