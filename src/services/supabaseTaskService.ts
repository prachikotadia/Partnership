import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done';
  due_date?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  old_value?: any;
  new_value?: any;
  created_at: string;
}

class SupabaseTaskService {
  private listeners: ((tasks: Task[]) => void)[] = [];

  // Subscribe to task changes
  subscribe(listener: (tasks: Task[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(tasks: Task[]) {
    this.listeners.forEach(listener => listener(tasks));
  }

  // Get all tasks for the current user
  async getTasks(): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  // Create a new task
  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Add to history
      await this.addTaskHistory(data.id, 'created', null, data);

      notificationService.showSimpleNotification(
        'Task Created',
        `Task "${data.title}" has been created successfully.`,
        'success'
      );

      // Refresh tasks
      const tasks = await this.getTasks();
      this.notifyListeners(tasks);

      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to create task. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Update a task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current task for history
      const { data: currentTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Add to history
      await this.addTaskHistory(taskId, 'updated', currentTask, data);

      notificationService.showSimpleNotification(
        'Task Updated',
        `Task "${data.title}" has been updated successfully.`,
        'success'
      );

      // Refresh tasks
      const tasks = await this.getTasks();
      this.notifyListeners(tasks);

      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to update task. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current task for history
      const { data: currentTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Add to history
      await this.addTaskHistory(taskId, 'deleted', currentTask, null);

      notificationService.showSimpleNotification(
        'Task Deleted',
        `Task "${currentTask?.title}" has been deleted successfully.`,
        'success'
      );

      // Refresh tasks
      const tasks = await this.getTasks();
      this.notifyListeners(tasks);

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to delete task. Please try again.',
        'error'
      );
      return false;
    }
  }

  // Get subtasks for a task
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      return [];
    }
  }

  // Create a subtask
  async createSubtask(taskId: string, title: string): Promise<Subtask | null> {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          task_id: taskId,
          title,
          is_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating subtask:', error);
      return null;
    }
  }

  // Update a subtask
  async updateSubtask(subtaskId: string, updates: Partial<Subtask>): Promise<Subtask | null> {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', subtaskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating subtask:', error);
      return null;
    }
  }

  // Delete a subtask
  async deleteSubtask(subtaskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting subtask:', error);
      return false;
    }
  }

  // Get task history
  async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    try {
      const { data, error } = await supabase
        .from('task_history')
        .select(`
          *,
          users!task_history_user_id_fkey(name)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching task history:', error);
      return [];
    }
  }

  // Add task history entry
  private async addTaskHistory(taskId: string, action: string, oldValue: any, newValue: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('task_history')
        .insert({
          task_id: taskId,
          user_id: user.id,
          action,
          old_value: oldValue,
          new_value: newValue,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error adding task history:', error);
    }
  }

  // Get tasks by status
  async getTasksByStatus(status: string): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', status)
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      return [];
    }
  }

  // Get tasks by priority
  async getTasksByPriority(priority: string): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('priority', priority)
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks by priority:', error);
      return [];
    }
  }

  // Search tasks
  async searchTasks(query: string): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching tasks:', error);
      return [];
    }
  }

  // Get task statistics
  async getTaskStats(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('status, due_date')
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`);

      if (error) throw error;

      const stats = {
        total: data.length,
        completed: data.filter(t => t.status === 'done').length,
        inProgress: data.filter(t => t.status === 'in_progress').length,
        todo: data.filter(t => t.status === 'todo').length,
        overdue: data.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length
      };

      return stats;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      return { total: 0, completed: 0, inProgress: 0, todo: 0, overdue: 0 };
    }
  }
}

export const supabaseTaskService = new SupabaseTaskService();
