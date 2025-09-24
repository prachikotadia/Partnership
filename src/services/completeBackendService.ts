// Complete Backend Service Integration for All Features
import { CompleteBackendAPI, supabase } from './completeBackendApi';

export interface BackendUser {
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

export interface BackendPartnership {
  partnership_id: string;
  partner_id: string;
  partner_name: string;
  status: string;
}

export class CompleteBackendService {
  private currentUser: BackendUser | null = null;
  private currentPartnership: BackendPartnership | null = null;
  private realtimeSubscriptions: any[] = [];

  // Initialize the service
  async initialize() {
    try {
      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user data from our users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();
        
        if (userData) {
          this.currentUser = userData;
          await this.loadPartnership();
          await this.setupRealtimeSubscriptions();
        }
      }
    } catch (error) {
      console.error('Backend service initialization error:', error);
    }
  }

  // =============================================
  // AUTHENTICATION METHODS
  // =============================================

  async login(username: string, password: string) {
    try {
      const result = await CompleteBackendAPI.Auth.login(username, password);
      this.currentUser = result.user;
      await this.loadPartnership();
      await this.setupRealtimeSubscriptions();
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(username: string, email: string, password: string, name: string) {
    try {
      const result = await CompleteBackendAPI.Auth.register(username, email, password, name);
      this.currentUser = result.user;
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await CompleteBackendAPI.Auth.logout();
      this.currentUser = null;
      this.currentPartnership = null;
      this.cleanupRealtimeSubscriptions();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // =============================================
  // PARTNERSHIP METHODS
  // =============================================

  async loadPartnership() {
    if (!this.currentUser) return null;
    
    try {
      const partnership = await CompleteBackendAPI.Partnership.getPartnership(this.currentUser.id);
      this.currentPartnership = partnership;
      return partnership;
    } catch (error) {
      console.error('Error loading partnership:', error);
      return null;
    }
  }

  async createPartnership(invitationCode: string) {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    try {
      const partnership = await CompleteBackendAPI.Partnership.createPartnership(
        this.currentUser.id, 
        invitationCode
      );
      await this.loadPartnership();
      return partnership;
    } catch (error) {
      console.error('Error creating partnership:', error);
      throw error;
    }
  }

  async joinPartnership(invitationCode: string) {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    try {
      const partnership = await CompleteBackendAPI.Partnership.joinPartnership(
        this.currentUser.id, 
        invitationCode
      );
      await this.loadPartnership();
      return partnership;
    } catch (error) {
      console.error('Error joining partnership:', error);
      throw error;
    }
  }

  async endPartnership() {
    if (!this.currentPartnership) throw new Error('No active partnership');
    
    try {
      await CompleteBackendAPI.Partnership.endPartnership(this.currentPartnership.partnership_id);
      this.currentPartnership = null;
    } catch (error) {
      console.error('Error ending partnership:', error);
      throw error;
    }
  }

  async getPartnershipActivities() {
    if (!this.currentPartnership) return [];
    
    try {
      return await CompleteBackendAPI.Partnership.getPartnershipActivities(
        this.currentPartnership.partnership_id
      );
    } catch (error) {
      console.error('Error getting partnership activities:', error);
      return [];
    }
  }

  // =============================================
  // NOTIFICATION METHODS
  // =============================================

  async getNotifications() {
    if (!this.currentUser) return [];
    
    try {
      return await CompleteBackendAPI.Notifications.getNotifications(this.currentUser.id);
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async getUnreadNotificationCount() {
    if (!this.currentUser) return 0;
    
    try {
      return await CompleteBackendAPI.Notifications.getUnreadCount(this.currentUser.id);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async markNotificationsAsRead(notificationIds: string[]) {
    if (!this.currentUser) return;
    
    try {
      await CompleteBackendAPI.Notifications.markAsRead(this.currentUser.id, notificationIds);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }

  async createNotification(type: string, title: string, message: string, data?: any) {
    if (!this.currentUser) return;
    
    try {
      return await CompleteBackendAPI.Notifications.createNotification(
        this.currentUser.id,
        type,
        title,
        message,
        data
      );
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  async clearAllNotifications() {
    if (!this.currentUser) return;
    
    try {
      await CompleteBackendAPI.Notifications.clearAll(this.currentUser.id);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // =============================================
  // STREAK METHODS
  // =============================================

  async getUserStreak() {
    if (!this.currentUser) return null;
    
    try {
      return await CompleteBackendAPI.Streak.getUserStreak(this.currentUser.id);
    } catch (error) {
      console.error('Error getting user streak:', error);
      return null;
    }
  }

  async updateStreak() {
    if (!this.currentUser) return null;
    
    try {
      const updatedStreak = await CompleteBackendAPI.Streak.updateStreak(this.currentUser.id);
      
      // Create notification for streak updates
      if (updatedStreak && updatedStreak.current_streak > 1) {
        await this.createNotification(
          'success',
          'Streak Update!',
          `🔥 ${updatedStreak.current_streak} day streak! Keep it up!`
        );
      }
      
      return updatedStreak;
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }

  // =============================================
  // TASKS METHODS
  // =============================================

  async getTasks() {
    if (!this.currentUser) return [];
    
    try {
      return await CompleteBackendAPI.Tasks.getTasks(
        this.currentUser.id,
        this.currentPartnership?.partnership_id
      );
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  async getTodaysTasks() {
    if (!this.currentUser) return [];
    
    try {
      return await CompleteBackendAPI.Tasks.getTodaysTasks(this.currentUser.id);
    } catch (error) {
      console.error('Error getting today\'s tasks:', error);
      return [];
    }
  }

  async createTask(task: any) {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    try {
      const newTask = await CompleteBackendAPI.Tasks.createTask({
        ...task,
        user_id: this.currentUser.id,
        partnership_id: this.currentPartnership?.partnership_id
      });
      
      // Create notification for new task
      await this.createNotification(
        'info',
        'New Task Added',
        `Task "${task.title}" has been added`
      );
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: any) {
    try {
      return await CompleteBackendAPI.Tasks.updateTask(taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string) {
    try {
      await CompleteBackendAPI.Tasks.deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async toggleTask(taskId: string) {
    try {
      const updatedTask = await CompleteBackendAPI.Tasks.toggleTask(taskId);
      
      // Create notification for task completion
      if (updatedTask.completed) {
        await this.createNotification(
          'success',
          'Task Completed!',
          `Task "${updatedTask.title}" has been completed`
        );
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  }

  // =============================================
  // NOTES METHODS
  // =============================================

  async getNotes() {
    if (!this.currentUser) return [];
    
    try {
      return await CompleteBackendAPI.Notes.getNotes(
        this.currentUser.id,
        this.currentPartnership?.partnership_id
      );
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  async createNote(note: any) {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    try {
      const newNote = await CompleteBackendAPI.Notes.createNote({
        ...note,
        user_id: this.currentUser.id,
        partnership_id: this.currentPartnership?.partnership_id
      });
      
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async updateNote(noteId: string, updates: any) {
    try {
      return await CompleteBackendAPI.Notes.updateNote(noteId, updates);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string) {
    try {
      await CompleteBackendAPI.Notes.deleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  async toggleStar(noteId: string) {
    try {
      return await CompleteBackendAPI.Notes.toggleStar(noteId);
    } catch (error) {
      console.error('Error toggling star:', error);
      throw error;
    }
  }

  // =============================================
  // FINANCE METHODS
  // =============================================

  async getTransactions() {
    if (!this.currentUser) return [];
    
    try {
      return await CompleteBackendAPI.Finance.getTransactions(
        this.currentUser.id,
        this.currentPartnership?.partnership_id
      );
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async getFinanceSummary(currency = 'USD') {
    if (!this.currentUser) return null;
    
    try {
      return await CompleteBackendAPI.Finance.getFinanceSummary(
        this.currentUser.id,
        currency
      );
    } catch (error) {
      console.error('Error getting finance summary:', error);
      return null;
    }
  }

  async createTransaction(transaction: any) {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    try {
      const newTransaction = await CompleteBackendAPI.Finance.createTransaction({
        ...transaction,
        user_id: this.currentUser.id,
        partnership_id: this.currentPartnership?.partnership_id
      });
      
      // Create notification for new transaction
      await this.createNotification(
        'info',
        'New Transaction',
        `Transaction "${transaction.title}" has been added`
      );
      
      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async updateTransaction(transactionId: string, updates: any) {
    try {
      return await CompleteBackendAPI.Finance.updateTransaction(transactionId, updates);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(transactionId: string) {
    try {
      await CompleteBackendAPI.Finance.deleteTransaction(transactionId);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // =============================================
  // BUCKET LIST METHODS
  // =============================================

  async getBucketItems() {
    // For demo users, return empty array (will be populated by local state)
    if (!this.currentUser) return [];
    
    try {
      return await CompleteBackendAPI.BucketList.getBucketItems(
        this.currentUser.id,
        this.currentPartnership?.partnership_id
      );
    } catch (error) {
      console.error('Error getting bucket items:', error);
      return [];
    }
  }

  async createBucketItem(item: any) {
    // For demo users, use local storage instead of database
    if (!this.currentUser) {
      // Create a demo item with local ID
      const demoItem = {
        id: Date.now().toString(),
        ...item,
        user_id: 'demo-user',
        partnership_id: 'demo-partnership',
        created_at: new Date().toISOString()
      };
      return demoItem;
    }
    
    try {
      const newItem = await CompleteBackendAPI.BucketList.createBucketItem({
        ...item,
        user_id: this.currentUser.id,
        partnership_id: this.currentPartnership?.partnership_id
      });
      
      return newItem;
    } catch (error) {
      console.error('Error creating bucket item:', error);
      throw error;
    }
  }

  async updateBucketItem(itemId: string, updates: any) {
    try {
      return await CompleteBackendAPI.BucketList.updateBucketItem(itemId, updates);
    } catch (error) {
      console.error('Error updating bucket item:', error);
      throw error;
    }
  }

  async deleteBucketItem(itemId: string) {
    // For demo users, just return success (local state will handle the deletion)
    if (!this.currentUser) return;
    
    try {
      await CompleteBackendAPI.BucketList.deleteBucketItem(itemId);
    } catch (error) {
      console.error('Error deleting bucket item:', error);
      throw error;
    }
  }

  async toggleBucketItem(itemId: string) {
    // For demo users, just return success (local state will handle the toggle)
    if (!this.currentUser) return;
    
    try {
      const updatedItem = await CompleteBackendAPI.BucketList.toggleBucketItem(itemId);
      
      // Create notification for bucket item completion
      if (updatedItem.completed) {
        await this.createNotification(
          'success',
          'Goal Achieved!',
          `Goal "${updatedItem.title}" has been completed!`
        );
      }
      
      return updatedItem;
    } catch (error) {
      console.error('Error toggling bucket item:', error);
      throw error;
    }
  }

  // =============================================
  // TIMELINE METHODS
  // =============================================

  async getTimelineEvents() {
    if (!this.currentUser) return [];
    
    try {
      return await CompleteBackendAPI.Timeline.getTimelineEvents(
        this.currentUser.id,
        this.currentPartnership?.partnership_id
      );
    } catch (error) {
      console.error('Error getting timeline events:', error);
      return [];
    }
  }

  async createTimelineEvent(event: any) {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    try {
      const newEvent = await CompleteBackendAPI.Timeline.createTimelineEvent({
        ...event,
        user_id: this.currentUser.id,
        partnership_id: this.currentPartnership?.partnership_id
      });
      
      return newEvent;
    } catch (error) {
      console.error('Error creating timeline event:', error);
      throw error;
    }
  }

  async updateTimelineEvent(eventId: string, updates: any) {
    try {
      return await CompleteBackendAPI.Timeline.updateTimelineEvent(eventId, updates);
    } catch (error) {
      console.error('Error updating timeline event:', error);
      throw error;
    }
  }

  async deleteTimelineEvent(eventId: string) {
    try {
      await CompleteBackendAPI.Timeline.deleteTimelineEvent(eventId);
    } catch (error) {
      console.error('Error deleting timeline event:', error);
      throw error;
    }
  }

  // =============================================
  // DASHBOARD METHODS
  // =============================================

  async getDashboardOverview() {
    if (!this.currentUser) return null;
    
    try {
      return await CompleteBackendAPI.Dashboard.getDashboardOverview(this.currentUser.id);
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      return null;
    }
  }

  // =============================================
  // SEARCH METHODS
  // =============================================

  async globalSearch(query: string) {
    if (!this.currentUser) return [];
    
    try {
      return await CompleteBackendAPI.Search.globalSearch(this.currentUser.id, query);
    } catch (error) {
      console.error('Error performing global search:', error);
      return [];
    }
  }

  // =============================================
  // REAL-TIME SUBSCRIPTION SETUP
  // =============================================

  private async setupRealtimeSubscriptions() {
    if (!this.currentUser) return;
    
    try {
      // Subscribe to notifications
      const notificationSub = CompleteBackendAPI.Realtime.subscribeToNotifications(
        this.currentUser.id,
        (payload) => {
          console.log('New notification:', payload);
          window.dispatchEvent(new CustomEvent('backend-notification', { detail: payload }));
        }
      );
      this.realtimeSubscriptions.push(notificationSub);

      // Subscribe to tasks
      const taskSub = CompleteBackendAPI.Realtime.subscribeToTasks(
        this.currentUser.id,
        (payload) => {
          console.log('Task update:', payload);
          window.dispatchEvent(new CustomEvent('backend-task-update', { detail: payload }));
        }
      );
      this.realtimeSubscriptions.push(taskSub);

      // Subscribe to partnership activities if in a partnership
      if (this.currentPartnership) {
        const activitySub = CompleteBackendAPI.Realtime.subscribeToPartnershipActivities(
          this.currentPartnership.partnership_id,
          (payload) => {
            console.log('Partnership activity:', payload);
            window.dispatchEvent(new CustomEvent('backend-partnership-activity', { detail: payload }));
          }
        );
        this.realtimeSubscriptions.push(activitySub);
      }
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error);
    }
  }

  private cleanupRealtimeSubscriptions() {
    this.realtimeSubscriptions.forEach(sub => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    this.realtimeSubscriptions = [];
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  getCurrentUser() {
    return this.currentUser;
  }

  getCurrentPartnership() {
    return this.currentPartnership;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  isInPartnership() {
    return this.currentPartnership !== null;
  }
}

// Create singleton instance
export const completeBackendService = new CompleteBackendService();

// Initialize on import
completeBackendService.initialize();