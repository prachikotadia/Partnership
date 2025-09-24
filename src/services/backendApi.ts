// Complete Backend API Service for Bondly Glow Partnership App
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dobclnswdftadrqftpux.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmNsbnN3ZGZ0YWRycWZ0cHV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAwNjg1MCwiZXhwIjoyMDczNTgyODUwfQ.U7AbdvnLqaywylD5Rg-lTsNxghdyQpn6wrDYqQhhu2g';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar_url?: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Partnership {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'active' | 'ended';
  invitation_code: string;
  created_at: string;
  activated_at?: string;
  ended_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  is_read: boolean;
  is_seen: boolean;
  data?: any;
  expires_at?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  partnership_id?: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  partnership_id?: string;
  title: string;
  content?: string;
  category?: string;
  is_starred: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceTransaction {
  id: string;
  user_id: string;
  partnership_id?: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  category?: string;
  is_shared: boolean;
  shared_amount?: number;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface BucketListItem {
  id: string;
  user_id: string;
  partnership_id?: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  user_id: string;
  partnership_id?: string;
  title: string;
  description?: string;
  event_date: string;
  event_type?: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  streak_start_date?: string;
  created_at: string;
  updated_at: string;
}

// Authentication API
export class AuthAPI {
  static async login(username: string, password: string) {
    try {
      // First, get user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password
      });

      if (authError) {
        throw authError;
      }

      // Record login attempt
      await this.recordLoginAttempt(userData.id, true);
      
      return {
        user: userData,
        session: authData.session
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(username: string, email: string, password: string, name: string) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            name
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // Create user in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          username,
          email,
          name,
          password_hash: 'hashed_password' // In real app, this would be properly hashed
        })
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      return {
        user: userData,
        session: authData.session
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  static async recordLoginAttempt(userId: string, success: boolean, failureReason?: string) {
    try {
      await supabase
        .from('login_history')
        .insert({
          user_id: userId,
          success,
          failure_reason: failureReason
        });
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }
}

// Notifications API
export class NotificationsAPI {
  static async getNotifications(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  }

  static async getUnreadCount(userId: string) {
    const { data, error } = await supabase.rpc('get_unread_notification_count', {
      user_uuid: userId
    });

    if (error) {
      throw error;
    }

    return data || 0;
  }

  static async markAsRead(userId: string, notificationIds: string[]) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .in('id', notificationIds);

    if (error) {
      throw error;
    }
  }

  static async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any,
    expiresHours?: number
  ) {
    const { data: result, error } = await supabase.rpc('create_notification', {
      user_uuid: userId,
      notification_type: type,
      notification_title: title,
      notification_message: message,
      notification_data: data,
      expires_hours: expiresHours
    });

    if (error) {
      throw error;
    }

    return result;
  }

  static async clearAll(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }
}

// Streak API
export class StreakAPI {
  static async getUserStreak(userId: string) {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }

    return data;
  }

  static async updateStreak(userId: string) {
    const { error } = await supabase.rpc('update_user_streak', {
      user_uuid: userId
    });

    if (error) {
      throw error;
    }

    // Get updated streak
    return await this.getUserStreak(userId);
  }
}

// Partnership API
export class PartnershipAPI {
  static async getPartnership(userId: string) {
    const { data, error } = await supabase.rpc('get_user_partnership', {
      user_uuid: userId
    });

    if (error) {
      throw error;
    }

    return data?.[0] || null;
  }

  static async createPartnership(userId: string, invitationCode: string) {
    const { data, error } = await supabase
      .from('partnerships')
      .insert({
        user1_id: userId,
        invitation_code: invitationCode,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async joinPartnership(userId: string, invitationCode: string) {
    // Find partnership by invitation code
    const { data: partnership, error: findError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('invitation_code', invitationCode)
      .eq('status', 'pending')
      .single();

    if (findError || !partnership) {
      throw new Error('Invalid invitation code');
    }

    // Update partnership
    const { data, error } = await supabase
      .from('partnerships')
      .update({
        user2_id: userId,
        status: 'active',
        activated_at: new Date().toISOString()
      })
      .eq('id', partnership.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async endPartnership(partnershipId: string) {
    const { error } = await supabase
      .from('partnerships')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', partnershipId);

    if (error) {
      throw error;
    }
  }
}

// Tasks API
export class TasksAPI {
  static async getTasks(userId: string, partnershipId?: string) {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (partnershipId) {
      query = query.or(`user_id.eq.${userId},partnership_id.eq.${partnershipId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async updateTask(taskId: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw error;
    }
  }

  static async toggleTask(taskId: string) {
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', taskId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

// Notes API
export class NotesAPI {
  static async getNotes(userId: string, partnershipId?: string) {
    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (partnershipId) {
      query = query.or(`user_id.eq.${userId},partnership_id.eq.${partnershipId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  static async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async updateNote(noteId: string, updates: Partial<Note>) {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async deleteNote(noteId: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      throw error;
    }
  }

  static async toggleStar(noteId: string) {
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('is_starred')
      .eq('id', noteId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { data, error } = await supabase
      .from('notes')
      .update({ is_starred: !note.is_starred })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

// Finance API
export class FinanceAPI {
  static async getTransactions(userId: string, partnershipId?: string) {
    let query = supabase
      .from('finance_transactions')
      .select('*')
      .eq('user_id', userId);

    if (partnershipId) {
      query = query.or(`user_id.eq.${userId},partnership_id.eq.${partnershipId}`);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  static async createTransaction(transaction: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('finance_transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async updateTransaction(transactionId: string, updates: Partial<FinanceTransaction>) {
    const { data, error } = await supabase
      .from('finance_transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async deleteTransaction(transactionId: string) {
    const { error } = await supabase
      .from('finance_transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      throw error;
    }
  }

  static async getFinanceSummary(userId: string, partnershipId?: string) {
    const transactions = await this.getTransactions(userId, partnershipId);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactions.length
    };
  }
}

// Bucket List API
export class BucketListAPI {
  static async getBucketItems(userId: string, partnershipId?: string) {
    let query = supabase
      .from('bucket_list_items')
      .select('*')
      .eq('user_id', userId);

    if (partnershipId) {
      query = query.or(`user_id.eq.${userId},partnership_id.eq.${partnershipId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  static async createBucketItem(item: Omit<BucketListItem, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('bucket_list_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async updateBucketItem(itemId: string, updates: Partial<BucketListItem>) {
    const { data, error } = await supabase
      .from('bucket_list_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async deleteBucketItem(itemId: string) {
    const { error } = await supabase
      .from('bucket_list_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }
  }

  static async toggleBucketItem(itemId: string) {
    const { data: item, error: fetchError } = await supabase
      .from('bucket_list_items')
      .select('completed')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { data, error } = await supabase
      .from('bucket_list_items')
      .update({
        completed: !item.completed,
        completed_at: !item.completed ? new Date().toISOString() : null
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

// Timeline API
export class TimelineAPI {
  static async getTimelineEvents(userId: string, partnershipId?: string) {
    let query = supabase
      .from('timeline_events')
      .select('*')
      .eq('user_id', userId);

    if (partnershipId) {
      query = query.or(`user_id.eq.${userId},partnership_id.eq.${partnershipId}`);
    }

    const { data, error } = await query.order('event_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  static async createTimelineEvent(event: Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('timeline_events')
      .insert(event)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async updateTimelineEvent(eventId: string, updates: Partial<TimelineEvent>) {
    const { data, error } = await supabase
      .from('timeline_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async deleteTimelineEvent(eventId: string) {
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      throw error;
    }
  }
}

// Real-time subscriptions
export class RealtimeAPI {
  static subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToTasks(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToPartnershipActivities(partnershipId: string, callback: (payload: any) => void) {
    return supabase
      .channel('partnership_activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partnership_activities',
          filter: `partnership_id=eq.${partnershipId}`
        },
        callback
      )
      .subscribe();
  }
}

// Export all APIs
export const BackendAPI = {
  Auth: AuthAPI,
  Notifications: NotificationsAPI,
  Streak: StreakAPI,
  Partnership: PartnershipAPI,
  Tasks: TasksAPI,
  Notes: NotesAPI,
  Finance: FinanceAPI,
  BucketList: BucketListAPI,
  Timeline: TimelineAPI,
  Realtime: RealtimeAPI
};
