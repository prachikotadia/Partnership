import { notificationService } from './notificationService';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  dueDate?: string;
  assignedTo: string[];
  tags: string[];
  subtasks: Subtask[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  category: 'personal' | 'finance' | 'travel' | 'shared-goals' | 'household';
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminderTime?: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'link';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  action: 'created' | 'updated' | 'completed' | 'deleted' | 'restored' | 'assigned' | 'priority-changed' | 'due-date-changed';
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

export interface TaskFilter {
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  category?: string[];
  tags?: string[];
  dueDate?: {
    start?: string;
    end?: string;
  };
}

class TaskManagerService {
  private tasks: Task[] = [];
  private taskHistory: TaskHistory[] = [];
  private listeners: ((tasks: Task[]) => void)[] = [];
  private currentUser = 'Person1'; // This would come from auth context
  private partnerUser = 'Person2';

  constructor() {
    this.loadTasks();
    this.loadTaskHistory();
    this.initializeSampleData();
  }

  // Real-time sync simulation
  subscribe(listener: (tasks: Task[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.tasks]));
    this.saveTasks();
  }

  private addToHistory(taskId: string, action: TaskHistory['action'], changes?: TaskHistory['changes'], description?: string) {
    const historyEntry: TaskHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      action,
      userId: this.currentUser,
      userName: this.currentUser,
      timestamp: new Date().toISOString(),
      changes,
      description: description || this.generateHistoryDescription(action, changes)
    };

    this.taskHistory.push(historyEntry);
    this.saveTaskHistory();

    // Notify partner about changes
    if (action !== 'created') {
      this.notifyPartner(taskId, action, description);
    }
  }

  private generateHistoryDescription(action: TaskHistory['action'], changes?: TaskHistory['changes']): string {
    switch (action) {
      case 'created':
        return `${this.currentUser} created this task`;
      case 'updated':
        if (changes && changes.length > 0) {
          const change = changes[0];
          return `${this.currentUser} changed ${change.field} from "${change.oldValue}" to "${change.newValue}"`;
        }
        return `${this.currentUser} updated this task`;
      case 'completed':
        return `${this.currentUser} completed this task`;
      case 'assigned':
        return `${this.currentUser} assigned this task`;
      case 'priority-changed':
        if (changes && changes.length > 0) {
          const change = changes[0];
          return `${this.currentUser} changed priority from ${change.oldValue} to ${change.newValue}`;
        }
        return `${this.currentUser} changed priority`;
      case 'due-date-changed':
        if (changes && changes.length > 0) {
          const change = changes[0];
          return `${this.currentUser} updated due date from ${change.oldValue} to ${change.newValue}`;
        }
        return `${this.currentUser} updated due date`;
      default:
        return `${this.currentUser} performed an action on this task`;
    }
  }

  private notifyPartner(taskId: string, action: string, description?: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      notificationService.createNotification({
        id: `task_${taskId}_${Date.now()}`,
        title: 'Task Updated',
        message: description || `${this.currentUser} updated "${task.title}"`,
        type: 'task-update',
        data: { taskId, action },
        timestamp: new Date().toISOString(),
        read: false
      });
    }
  }

  // Task CRUD Operations
  createTask(taskData: Partial<Task>): Task {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title || '',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: 'todo',
      dueDate: taskData.dueDate,
      assignedTo: taskData.assignedTo || [this.currentUser],
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || [],
      attachments: taskData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this.currentUser,
      category: taskData.category || 'personal',
      isRecurring: taskData.isRecurring || false,
      recurringPattern: taskData.recurringPattern,
      reminderTime: taskData.reminderTime,
      isDeleted: false
    };

    this.tasks.push(task);
    this.addToHistory(task.id, 'created');
    this.notifyListeners();

    // Set reminder if specified
    if (task.reminderTime && task.dueDate) {
      this.setTaskReminder(task.id, task.reminderTime);
    }

    return task;
  }

  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    const oldTask = { ...this.tasks[taskIndex] };
    const changes: TaskHistory['changes'] = [];

    // Track changes
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof Task] !== oldTask[key as keyof Task]) {
        changes.push({
          field: key,
          oldValue: oldTask[key as keyof Task],
          newValue: updates[key as keyof Task]
        });
      }
    });

    this.tasks[taskIndex] = {
      ...oldTask,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addToHistory(taskId, 'updated', changes);
    this.notifyListeners();

    return this.tasks[taskIndex];
  }

  deleteTask(taskId: string): boolean {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };

    this.addToHistory(taskId, 'deleted');
    this.notifyListeners();

    return true;
  }

  restoreTask(taskId: string): boolean {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      isDeleted: false,
      deletedAt: undefined
    };

    this.addToHistory(taskId, 'restored');
    this.notifyListeners();

    return true;
  }

  permanentlyDeleteTask(taskId: string): boolean {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    this.tasks.splice(taskIndex, 1);
    this.notifyListeners();

    return true;
  }

  // Task Status Management
  updateTaskStatus(taskId: string, status: Task['status']): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    const oldStatus = task.status;
    this.updateTask(taskId, { status });

    if (status === 'completed' && oldStatus !== 'completed') {
      this.addToHistory(taskId, 'completed');
      this.triggerCompletionCelebration(task);
    }

    return true;
  }

  updateTaskPriority(taskId: string, priority: Task['priority']): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    const oldPriority = task.priority;
    this.updateTask(taskId, { priority });
    this.addToHistory(taskId, 'priority-changed', [{
      field: 'priority',
      oldValue: oldPriority,
      newValue: priority
    }]);

    return true;
  }

  assignTask(taskId: string, assignedTo: string[]): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    const oldAssignedTo = [...task.assignedTo];
    this.updateTask(taskId, { assignedTo });
    this.addToHistory(taskId, 'assigned', [{
      field: 'assignedTo',
      oldValue: oldAssignedTo.join(', '),
      newValue: assignedTo.join(', ')
    }]);

    return true;
  }

  // Subtask Management
  addSubtask(taskId: string, subtaskTitle: string): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    const subtask: Subtask = {
      id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: subtaskTitle,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedSubtasks = [...task.subtasks, subtask];
    this.updateTask(taskId, { subtasks: updatedSubtasks });

    return true;
  }

  toggleSubtask(taskId: string, subtaskId: string): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    const updatedSubtasks = task.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        return {
          ...subtask,
          completed: !subtask.completed,
          completedAt: !subtask.completed ? new Date().toISOString() : undefined
        };
      }
      return subtask;
    });

    this.updateTask(taskId, { subtasks: updatedSubtasks });

    // Check if all subtasks are completed
    const allCompleted = updatedSubtasks.every(st => st.completed);
    if (allCompleted && updatedSubtasks.length > 0) {
      this.updateTaskStatus(taskId, 'completed');
    }

    return true;
  }

  deleteSubtask(taskId: string, subtaskId: string): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    this.updateTask(taskId, { subtasks: updatedSubtasks });

    return true;
  }

  // Query Methods
  getTasks(filter?: TaskFilter): Task[] {
    let filteredTasks = this.tasks.filter(task => !task.isDeleted);

    if (filter) {
      if (filter.status && filter.status.length > 0) {
        filteredTasks = filteredTasks.filter(task => filter.status!.includes(task.status));
      }
      if (filter.priority && filter.priority.length > 0) {
        filteredTasks = filteredTasks.filter(task => filter.priority!.includes(task.priority));
      }
      if (filter.assignedTo && filter.assignedTo.length > 0) {
        filteredTasks = filteredTasks.filter(task => 
          task.assignedTo.some(assignee => filter.assignedTo!.includes(assignee))
        );
      }
      if (filter.category && filter.category.length > 0) {
        filteredTasks = filteredTasks.filter(task => filter.category!.includes(task.category));
      }
      if (filter.tags && filter.tags.length > 0) {
        filteredTasks = filteredTasks.filter(task => 
          task.tags.some(tag => filter.tags!.includes(tag))
        );
      }
    }

    return filteredTasks.sort((a, b) => {
      // Sort by priority first, then by due date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  getTaskById(taskId: string): Task | null {
    return this.tasks.find(t => t.id === taskId) || null;
  }

  getTaskHistory(taskId: string): TaskHistory[] {
    return this.taskHistory
      .filter(history => history.taskId === taskId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getDeletedTasks(): Task[] {
    return this.tasks.filter(task => task.isDeleted);
  }

  // Utility Methods
  getTasksByCategory(category: Task['category']): Task[] {
    return this.getTasks().filter(task => task.category === category);
  }

  getTasksByAssignee(assignee: string): Task[] {
    return this.getTasks().filter(task => task.assignedTo.includes(assignee));
  }

  getOverdueTasks(): Task[] {
    const now = new Date();
    return this.getTasks().filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'completed'
    );
  }

  getTodayTasks(): Task[] {
    const today = new Date().toDateString();
    return this.getTasks().filter(task => 
      task.dueDate && 
      new Date(task.dueDate).toDateString() === today
    );
  }

  // Reminder Management
  private setTaskReminder(taskId: string, reminderTime: string) {
    // This would integrate with the notification service
    const task = this.getTaskById(taskId);
    if (task && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const reminderDate = new Date(dueDate.getTime() - this.parseReminderTime(reminderTime));
      
      if (reminderDate > new Date()) {
        notificationService.createReminder({
          id: `reminder_${taskId}`,
          title: `Task Reminder: ${task.title}`,
          message: task.description || 'Task is due soon!',
          type: 'task',
          scheduledTime: reminderDate.toISOString(),
          data: { taskId }
        });
      }
    }
  }

  private parseReminderTime(reminderTime: string): number {
    // Parse reminder time like "2 hours", "1 day", "30 minutes"
    const match = reminderTime.match(/(\d+)\s*(hour|day|minute)s?/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 'minute': return value * 60 * 1000;
        case 'hour': return value * 60 * 60 * 1000;
        case 'day': return value * 24 * 60 * 60 * 1000;
        default: return 0;
      }
    }
    return 0;
  }

  // Celebration and Feedback
  private triggerCompletionCelebration(task: Task) {
    // This would trigger confetti animation
    console.log(`🎉 Task completed: ${task.title}`);
  }

  // Data Persistence
  private saveTasks() {
    localStorage.setItem('bondly-tasks', JSON.stringify(this.tasks));
  }

  private loadTasks() {
    const saved = localStorage.getItem('bondly-tasks');
    if (saved) {
      this.tasks = JSON.parse(saved);
    }
  }

  private saveTaskHistory() {
    localStorage.setItem('bondly-task-history', JSON.stringify(this.taskHistory));
  }

  private loadTaskHistory() {
    const saved = localStorage.getItem('bondly-task-history');
    if (saved) {
      this.taskHistory = JSON.parse(saved);
    }
  }

  // Sample Data
  private initializeSampleData() {
    if (this.tasks.length === 0) {
      const sampleTasks: Task[] = [
        {
          id: 'task_1',
          title: 'Plan anniversary celebration',
          description: 'Book restaurant, buy gifts, plan surprise activities for our special day',
          priority: 'high',
          status: 'in-progress',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: [this.currentUser, this.partnerUser],
          tags: ['anniversary', 'celebration', 'romantic'],
          subtasks: [
            { id: 'sub_1', title: 'Book romantic dinner', completed: true, createdAt: new Date().toISOString() },
            { id: 'sub_2', title: 'Buy anniversary gift', completed: false, createdAt: new Date().toISOString() },
            { id: 'sub_3', title: 'Plan surprise activity', completed: false, createdAt: new Date().toISOString() }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.currentUser,
          category: 'shared-goals',
          isRecurring: false,
          isDeleted: false
        },
        {
          id: 'task_2',
          title: 'Review monthly budget together',
          description: 'Check expenses, adjust categories, plan for next month, discuss savings goals',
          priority: 'medium',
          status: 'todo',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: [this.currentUser, this.partnerUser],
          tags: ['finance', 'monthly', 'budget'],
          subtasks: [
            { id: 'sub_4', title: 'Review last month expenses', completed: false, createdAt: new Date().toISOString() },
            { id: 'sub_5', title: 'Set next month budget', completed: false, createdAt: new Date().toISOString() },
            { id: 'sub_6', title: 'Discuss savings goals', completed: false, createdAt: new Date().toISOString() }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.partnerUser,
          category: 'finance',
          isRecurring: true,
          recurringPattern: 'monthly',
          isDeleted: false
        },
        {
          id: 'task_3',
          title: 'Plan weekend date night',
          description: 'Choose movie, book tickets, plan dinner, create romantic atmosphere',
          priority: 'medium',
          status: 'completed',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: [this.currentUser],
          tags: ['date-night', 'weekend', 'romantic'],
          subtasks: [
            { id: 'sub_7', title: 'Book movie tickets', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
            { id: 'sub_8', title: 'Reserve dinner table', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
            { id: 'sub_9', title: 'Buy flowers', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.partnerUser,
          category: 'shared-goals',
          isRecurring: false,
          isDeleted: false
        },
        {
          id: 'task_4',
          title: 'Plan future vacation together',
          description: 'Research destinations, save money, plan itinerary for our dream trip',
          priority: 'low',
          status: 'todo',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: [this.currentUser, this.partnerUser],
          tags: ['vacation', 'travel', 'future-planning'],
          subtasks: [
            { id: 'sub_10', title: 'Research destinations', completed: false, createdAt: new Date().toISOString() },
            { id: 'sub_11', title: 'Set savings goal', completed: false, createdAt: new Date().toISOString() },
            { id: 'sub_12', title: 'Create travel bucket list', completed: false, createdAt: new Date().toISOString() }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.currentUser,
          category: 'travel',
          isRecurring: false,
          isDeleted: false
        },
        {
          id: 'task_5',
          title: 'Weekly relationship check-in',
          description: 'Discuss how we\'re feeling, share appreciation, plan quality time',
          priority: 'medium',
          status: 'todo',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: [this.currentUser, this.partnerUser],
          tags: ['relationship', 'communication', 'weekly'],
          subtasks: [
            { id: 'sub_13', title: 'Share what we appreciate about each other', completed: false, createdAt: new Date().toISOString() },
            { id: 'sub_14', title: 'Discuss any concerns', completed: false, createdAt: new Date().toISOString() },
            { id: 'sub_15', title: 'Plan quality time activities', completed: false, createdAt: new Date().toISOString() }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.partnerUser,
          category: 'shared-goals',
          isRecurring: true,
          recurringPattern: 'weekly',
          isDeleted: false
        }
      ];

      this.tasks = sampleTasks;
      this.saveTasks();
    }
  }

  // Cleanup deleted tasks (older than 7 days)
  cleanupDeletedTasks() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.tasks = this.tasks.filter(task => 
      !task.isDeleted || (task.deletedAt && new Date(task.deletedAt) > sevenDaysAgo)
    );
    this.notifyListeners();
  }
}

export const taskManagerService = new TaskManagerService();
