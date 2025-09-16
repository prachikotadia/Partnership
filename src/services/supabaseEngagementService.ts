import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface CheckIn {
  id: string;
  user_id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  note?: string;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_check_in?: string;
  created_at: string;
  updated_at: string;
}

class SupabaseEngagementService {
  private checkInListeners: ((checkIns: CheckIn[]) => void)[] = [];
  private streakListeners: ((streaks: Streak[]) => void)[] = [];

  // Subscribe to check-in changes
  subscribeCheckIns(listener: (checkIns: CheckIn[]) => void) {
    this.checkInListeners.push(listener);
    return () => {
      this.checkInListeners = this.checkInListeners.filter(l => l !== listener);
    };
  }

  // Subscribe to streak changes
  subscribeStreaks(listener: (streaks: Streak[]) => void) {
    this.streakListeners.push(listener);
    return () => {
      this.streakListeners = this.streakListeners.filter(l => l !== listener);
    };
  }

  private notifyCheckInListeners(checkIns: CheckIn[]) {
    this.checkInListeners.forEach(listener => listener(checkIns));
  }

  private notifyStreakListeners(streaks: Streak[]) {
    this.streakListeners.forEach(listener => listener(streaks));
  }

  // Get all check-ins for the current user
  async getCheckIns(): Promise<CheckIn[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      return [];
    }
  }

  // Create a new check-in
  async createCheckIn(checkInData: Omit<CheckIn, 'id' | 'user_id' | 'created_at'>): Promise<CheckIn | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if check-in already exists for this date
      const { data: existingCheckIn } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', checkInData.date)
        .single();

      if (existingCheckIn) {
        notificationService.showSimpleNotification(
          'Already Checked In',
          'You have already checked in for today.',
          'info'
        );
        return existingCheckIn;
      }

      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          ...checkInData,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update streaks
      await this.updateStreaks('daily_check_in');

      notificationService.showSimpleNotification(
        'Check-in Complete',
        `Great! You've checked in for ${checkInData.date}.`,
        'success'
      );

      // Refresh check-ins
      const checkIns = await this.getCheckIns();
      this.notifyCheckInListeners(checkIns);

      return data;
    } catch (error) {
      console.error('Error creating check-in:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to create check-in. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Update a check-in
  async updateCheckIn(checkInId: string, updates: Partial<CheckIn>): Promise<CheckIn | null> {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .update(updates)
        .eq('id', checkInId)
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Check-in Updated',
        'Your check-in has been updated successfully.',
        'success'
      );

      // Refresh check-ins
      const checkIns = await this.getCheckIns();
      this.notifyCheckInListeners(checkIns);

      return data;
    } catch (error) {
      console.error('Error updating check-in:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to update check-in. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Delete a check-in
  async deleteCheckIn(checkInId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('check_ins')
        .delete()
        .eq('id', checkInId);

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Check-in Deleted',
        'Your check-in has been deleted successfully.',
        'success'
      );

      // Refresh check-ins
      const checkIns = await this.getCheckIns();
      this.notifyCheckInListeners(checkIns);

      return true;
    } catch (error) {
      console.error('Error deleting check-in:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to delete check-in. Please try again.',
        'error'
      );
      return false;
    }
  }

  // Get check-in for a specific date
  async getCheckInByDate(date: string): Promise<CheckIn | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching check-in by date:', error);
      return null;
    }
  }

  // Get all streaks for the current user
  async getStreaks(): Promise<Streak[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching streaks:', error);
      return [];
    }
  }

  // Update streaks
  async updateStreaks(streakType: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current streak
      const { data: currentStreak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('streak_type', streakType)
        .single();

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (currentStreak) {
        // Check if last check-in was yesterday (continuing streak) or today (already counted)
        if (currentStreak.last_check_in === yesterday) {
          // Continue streak
          const newStreak = currentStreak.current_streak + 1;
          const longestStreak = Math.max(newStreak, currentStreak.longest_streak);

          await supabase
            .from('streaks')
            .update({
              current_streak: newStreak,
              longest_streak: longestStreak,
              last_check_in: today,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentStreak.id);
        } else if (currentStreak.last_check_in !== today) {
          // Reset streak
          await supabase
            .from('streaks')
            .update({
              current_streak: 1,
              last_check_in: today,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentStreak.id);
        }
      } else {
        // Create new streak
        await supabase
          .from('streaks')
          .insert({
            user_id: user.id,
            streak_type: streakType,
            current_streak: 1,
            longest_streak: 1,
            last_check_in: today,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      // Refresh streaks
      const streaks = await this.getStreaks();
      this.notifyStreakListeners(streaks);
    } catch (error) {
      console.error('Error updating streaks:', error);
    }
  }

  // Get streak by type
  async getStreakByType(streakType: string): Promise<Streak | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('streak_type', streakType)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching streak by type:', error);
      return null;
    }
  }

  // Get check-in statistics
  async getCheckInStats(): Promise<{
    total: number;
    thisWeek: number;
    thisMonth: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('date')
        .eq('user_id', user.id);

      const { data: streak } = await supabase
        .from('streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .eq('streak_type', 'daily_check_in')
        .single();

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats = {
        total: checkIns?.length || 0,
        thisWeek: checkIns?.filter(ci => new Date(ci.date) >= weekAgo).length || 0,
        thisMonth: checkIns?.filter(ci => new Date(ci.date) >= monthAgo).length || 0,
        currentStreak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching check-in stats:', error);
      return { total: 0, thisWeek: 0, thisMonth: 0, currentStreak: 0, longestStreak: 0 };
    }
  }

  // Get mood statistics
  async getMoodStats(): Promise<{
    great: number;
    good: number;
    okay: number;
    bad: number;
    terrible: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('check_ins')
        .select('mood')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        great: data?.filter(ci => ci.mood === 'great').length || 0,
        good: data?.filter(ci => ci.mood === 'good').length || 0,
        okay: data?.filter(ci => ci.mood === 'okay').length || 0,
        bad: data?.filter(ci => ci.mood === 'bad').length || 0,
        terrible: data?.filter(ci => ci.mood === 'terrible').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching mood stats:', error);
      return { great: 0, good: 0, okay: 0, bad: 0, terrible: 0 };
    }
  }

  // Check if user has checked in today
  async hasCheckedInToday(): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkIn = await this.getCheckInByDate(today);
      return !!checkIn;
    } catch (error) {
      console.error('Error checking if user has checked in today:', error);
      return false;
    }
  }
}

export const supabaseEngagementService = new SupabaseEngagementService();
