import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface BucketListItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  target_date?: string;
  cost?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

class SupabaseBucketListService {
  private listeners: ((items: BucketListItem[]) => void)[] = [];

  // Subscribe to bucket list changes
  subscribe(listener: (items: BucketListItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(items: BucketListItem[]) {
    this.listeners.forEach(listener => listener(items));
  }

  // Get all bucket list items for the current user
  async getBucketListItems(): Promise<BucketListItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bucket_list_items')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bucket list items:', error);
      return [];
    }
  }

  // Create a new bucket list item
  async createBucketListItem(itemData: Omit<BucketListItem, 'id' | 'created_at' | 'updated_at'>): Promise<BucketListItem | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bucket_list_items')
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
        'Item Added',
        `Bucket list item "${data.title}" has been added successfully.`,
        'success'
      );

      // Refresh items
      const items = await this.getBucketListItems();
      this.notifyListeners(items);

      return data;
    } catch (error) {
      console.error('Error creating bucket list item:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to add bucket list item. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Update a bucket list item
  async updateBucketListItem(itemId: string, updates: Partial<BucketListItem>): Promise<BucketListItem | null> {
    try {
      const { data, error } = await supabase
        .from('bucket_list_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Item Updated',
        `Bucket list item "${data.title}" has been updated successfully.`,
        'success'
      );

      // Refresh items
      const items = await this.getBucketListItems();
      this.notifyListeners(items);

      return data;
    } catch (error) {
      console.error('Error updating bucket list item:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to update bucket list item. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Delete a bucket list item
  async deleteBucketListItem(itemId: string): Promise<boolean> {
    try {
      const { data: currentItem } = await supabase
        .from('bucket_list_items')
        .select('*')
        .eq('id', itemId)
        .single();

      const { error } = await supabase
        .from('bucket_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      notificationService.showSimpleNotification(
        'Item Deleted',
        `Bucket list item "${currentItem?.title}" has been deleted successfully.`,
        'success'
      );

      // Refresh items
      const items = await this.getBucketListItems();
      this.notifyListeners(items);

      return true;
    } catch (error) {
      console.error('Error deleting bucket list item:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to delete bucket list item. Please try again.',
        'error'
      );
      return false;
    }
  }

  // Get bucket list items by status
  async getBucketListItemsByStatus(status: string): Promise<BucketListItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bucket_list_items')
        .select('*')
        .eq('created_by', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bucket list items by status:', error);
      return [];
    }
  }

  // Get bucket list items by category
  async getBucketListItemsByCategory(category: string): Promise<BucketListItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bucket_list_items')
        .select('*')
        .eq('created_by', user.id)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bucket list items by category:', error);
      return [];
    }
  }

  // Get bucket list items by priority
  async getBucketListItemsByPriority(priority: string): Promise<BucketListItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bucket_list_items')
        .select('*')
        .eq('created_by', user.id)
        .eq('priority', priority)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bucket list items by priority:', error);
      return [];
    }
  }

  // Search bucket list items
  async searchBucketListItems(query: string): Promise<BucketListItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bucket_list_items')
        .select('*')
        .eq('created_by', user.id)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching bucket list items:', error);
      return [];
    }
  }

  // Get bucket list statistics
  async getBucketListStats(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    totalCost: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bucket_list_items')
        .select('status, cost')
        .eq('created_by', user.id);

      if (error) throw error;

      const stats = {
        total: data.length,
        completed: data.filter(item => item.status === 'completed').length,
        inProgress: data.filter(item => item.status === 'in_progress').length,
        notStarted: data.filter(item => item.status === 'not_started').length,
        totalCost: data.reduce((sum, item) => sum + (item.cost || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error fetching bucket list stats:', error);
      return { total: 0, completed: 0, inProgress: 0, notStarted: 0, totalCost: 0 };
    }
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bucket_list_items')
        .select('category')
        .eq('created_by', user.id);

      if (error) throw error;

      const categories = [...new Set(data.map(item => item.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Mark item as completed
  async markAsCompleted(itemId: string): Promise<BucketListItem | null> {
    try {
      return await this.updateBucketListItem(itemId, { 
        status: 'completed',
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking item as completed:', error);
      return null;
    }
  }

  // Mark item as in progress
  async markAsInProgress(itemId: string): Promise<BucketListItem | null> {
    try {
      return await this.updateBucketListItem(itemId, { 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking item as in progress:', error);
      return null;
    }
  }

  // Get upcoming items (with target dates)
  async getUpcomingItems(): Promise<BucketListItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('bucket_list_items')
        .select('*')
        .eq('created_by', user.id)
        .not('target_date', 'is', null)
        .gte('target_date', now)
        .order('target_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming items:', error);
      return [];
    }
  }
}

export const supabaseBucketListService = new SupabaseBucketListService();
