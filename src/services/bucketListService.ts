import { notificationService } from './notificationService';

export interface BucketListItem {
  id: string;
  title: string;
  description: string;
  category: 'travel' | 'experiences' | 'goals' | 'adventures' | 'romantic' | 'personal' | 'career' | 'health' | 'learning' | 'family';
  priority: 'low' | 'medium' | 'high' | 'dream';
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  progress: number; // 0-100
  targetDate?: string;
  estimatedCost?: number;
  currency: 'USD' | 'INR';
  location?: string;
  tags: string[];
  assignedTo: string[]; // Person1, Person2, or both
  subtasks: BucketListSubtask[];
  attachments: BucketListAttachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  completedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  isShared: boolean; // Whether both partners can see and edit
  notes: string;
  inspiration?: string; // Why this is on the bucket list
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  timeRequired: 'hours' | 'days' | 'weeks' | 'months' | 'years';
}

export interface BucketListSubtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  assignedTo: string;
}

export interface BucketListAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'link' | 'video';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface BucketListHistory {
  id: string;
  itemId: string;
  action: 'created' | 'updated' | 'completed' | 'deleted' | 'restored' | 'progress-updated' | 'assigned' | 'priority-changed';
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

export interface BucketListFilter {
  status?: string[];
  priority?: string[];
  category?: string[];
  assignedTo?: string[];
  tags?: string[];
  targetDate?: {
    start?: string;
    end?: string;
  };
  progress?: {
    min?: number;
    max?: number;
  };
}

export interface BucketListStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  totalEstimatedCost: number;
  averageProgress: number;
}

class BucketListService {
  private items: BucketListItem[] = [];
  private history: BucketListHistory[] = [];
  private listeners: ((items: BucketListItem[]) => void)[] = [];
  private currentUser = 'Person1'; // This would come from auth context
  private partnerUser = 'Person2';

  constructor() {
    this.loadItems();
    this.loadHistory();
    this.initializeSampleData();
  }

  // Real-time sync simulation
  subscribe(listener: (items: BucketListItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.items]));
    this.saveItems();
  }

  private addToHistory(itemId: string, action: BucketListHistory['action'], changes?: BucketListHistory['changes'], description?: string) {
    const historyEntry: BucketListHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      action,
      userId: this.currentUser,
      userName: this.currentUser,
      timestamp: new Date().toISOString(),
      changes,
      description: description || `${this.currentUser} ${action} this bucket list item`
    };

    this.history.push(historyEntry);
    this.saveHistory();
  }

  // CRUD Operations
  createItem(itemData: Omit<BucketListItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isDeleted'>): BucketListItem {
    const newItem: BucketListItem = {
      ...itemData,
      id: `bucket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this.currentUser,
      isDeleted: false
    };

    this.items.push(newItem);
    this.addToHistory(newItem.id, 'created');
    this.notifyListeners();

    // Send notification to partner if shared
    if (newItem.isShared && newItem.assignedTo.includes(this.partnerUser)) {
      notificationService.showNotification(
        'New Bucket List Item!',
        `${this.currentUser} added "${newItem.title}" to your shared bucket list`,
        'info'
      );
    }

    return newItem;
  }

  updateItem(itemId: string, updates: Partial<BucketListItem>): BucketListItem | null {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return null;

    const oldItem = { ...this.items[itemIndex] };
    const changes: BucketListHistory['changes'] = [];

    // Track changes
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof BucketListItem] !== oldItem[key as keyof BucketListItem]) {
        changes.push({
          field: key,
          oldValue: oldItem[key as keyof BucketListItem],
          newValue: updates[key as keyof BucketListItem]
        });
      }
    });

    this.items[itemIndex] = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addToHistory(itemId, 'updated', changes);

    // Special handling for completion
    if (updates.status === 'completed' && oldItem.status !== 'completed') {
      this.items[itemIndex].completedAt = new Date().toISOString();
      this.items[itemIndex].progress = 100;
      this.addToHistory(itemId, 'completed');
      this.triggerCompletionCelebration(this.items[itemIndex]);
    }

    // Special handling for progress updates
    if (updates.progress !== undefined && updates.progress !== oldItem.progress) {
      this.addToHistory(itemId, 'progress-updated', [{
        field: 'progress',
        oldValue: oldItem.progress,
        newValue: updates.progress
      }]);
    }

    this.notifyListeners();
    return this.items[itemIndex];
  }

  deleteItem(itemId: string): boolean {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    this.items[itemIndex] = {
      ...this.items[itemIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };

    this.addToHistory(itemId, 'deleted');
    this.notifyListeners();
    return true;
  }

  restoreItem(itemId: string): boolean {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    this.items[itemIndex] = {
      ...this.items[itemIndex],
      isDeleted: false,
      deletedAt: undefined
    };

    this.addToHistory(itemId, 'restored');
    this.notifyListeners();
    return true;
  }

  permanentlyDeleteItem(itemId: string): boolean {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    this.items.splice(itemIndex, 1);
    this.notifyListeners();
    return true;
  }

  // Progress Management
  updateProgress(itemId: string, progress: number): boolean {
    const item = this.items.find(item => item.id === itemId);
    if (!item) return false;

    const oldProgress = item.progress;
    this.updateItem(itemId, { progress: Math.max(0, Math.min(100, progress)) });

    // Auto-complete if progress reaches 100%
    if (progress >= 100 && item.status !== 'completed') {
      this.updateItem(itemId, { status: 'completed' });
    }

    return true;
  }

  // Subtask Management
  addSubtask(itemId: string, title: string, assignedTo: string = this.currentUser): boolean {
    const item = this.items.find(item => item.id === itemId);
    if (!item) return false;

    const newSubtask: BucketListSubtask = {
      id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      assignedTo
    };

    item.subtasks.push(newSubtask);
    this.updateItem(itemId, { subtasks: item.subtasks });
    return true;
  }

  toggleSubtask(itemId: string, subtaskId: string): boolean {
    const item = this.items.find(item => item.id === itemId);
    if (!item) return false;

    const subtask = item.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return false;

    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date().toISOString() : undefined;

    // Update overall progress based on subtasks
    const completedSubtasks = item.subtasks.filter(st => st.completed).length;
    const totalSubtasks = item.subtasks.length;
    const newProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : item.progress;

    this.updateItem(itemId, { 
      subtasks: item.subtasks,
      progress: newProgress
    });

    return true;
  }

  deleteSubtask(itemId: string, subtaskId: string): boolean {
    const item = this.items.find(item => item.id === itemId);
    if (!item) return false;

    item.subtasks = item.subtasks.filter(st => st.id !== subtaskId);
    this.updateItem(itemId, { subtasks: item.subtasks });
    return true;
  }

  // Filtering and Search
  getItems(filter?: BucketListFilter, searchQuery?: string): BucketListItem[] {
    let filtered = this.items.filter(item => !item.isDeleted);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.location?.toLowerCase().includes(query)
      );
    }

    if (filter) {
      if (filter.status && filter.status.length > 0) {
        filtered = filtered.filter(item => filter.status!.includes(item.status));
      }
      if (filter.priority && filter.priority.length > 0) {
        filtered = filtered.filter(item => filter.priority!.includes(item.priority));
      }
      if (filter.category && filter.category.length > 0) {
        filtered = filtered.filter(item => filter.category!.includes(item.category));
      }
      if (filter.assignedTo && filter.assignedTo.length > 0) {
        filtered = filtered.filter(item => 
          filter.assignedTo!.some(user => item.assignedTo.includes(user))
        );
      }
      if (filter.tags && filter.tags.length > 0) {
        filtered = filtered.filter(item => 
          filter.tags!.some(tag => item.tags.includes(tag))
        );
      }
      if (filter.targetDate) {
        if (filter.targetDate.start) {
          filtered = filtered.filter(item => 
            item.targetDate && item.targetDate >= filter.targetDate!.start!
          );
        }
        if (filter.targetDate.end) {
          filtered = filtered.filter(item => 
            item.targetDate && item.targetDate <= filter.targetDate!.end!
          );
        }
      }
      if (filter.progress) {
        if (filter.progress.min !== undefined) {
          filtered = filtered.filter(item => item.progress >= filter.progress!.min!);
        }
        if (filter.progress.max !== undefined) {
          filtered = filtered.filter(item => item.progress <= filter.progress!.max!);
        }
      }
    }

    return filtered;
  }

  // Statistics
  getStats(): BucketListStats {
    const activeItems = this.items.filter(item => !item.isDeleted);
    const total = activeItems.length;
    const completed = activeItems.filter(item => item.status === 'completed').length;
    const inProgress = activeItems.filter(item => item.status === 'in-progress').length;
    const notStarted = activeItems.filter(item => item.status === 'not-started').length;

    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    activeItems.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
    });

    const totalEstimatedCost = activeItems.reduce((sum, item) => {
      if (item.estimatedCost) {
        // Convert to USD for calculation (simplified)
        const costInUSD = item.currency === 'INR' ? item.estimatedCost / 83 : item.estimatedCost;
        return sum + costInUSD;
      }
      return sum;
    }, 0);

    const averageProgress = total > 0 
      ? Math.round(activeItems.reduce((sum, item) => sum + item.progress, 0) / total)
      : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      byCategory,
      byPriority,
      totalEstimatedCost,
      averageProgress
    };
  }

  // History
  getItemHistory(itemId: string): BucketListHistory[] {
    return this.history.filter(entry => entry.itemId === itemId);
  }

  // Completion Celebration
  private triggerCompletionCelebration(item: BucketListItem) {
    notificationService.showNotification(
      '🎉 Bucket List Item Completed!',
      `Congratulations! You've completed "${item.title}"`,
      'success'
    );
  }

  // Data Persistence
  private saveItems() {
    localStorage.setItem('bucketListItems', JSON.stringify(this.items));
  }

  private loadItems() {
    const saved = localStorage.getItem('bucketListItems');
    if (saved) {
      this.items = JSON.parse(saved);
    }
  }

  private saveHistory() {
    localStorage.setItem('bucketListHistory', JSON.stringify(this.history));
  }

  private loadHistory() {
    const saved = localStorage.getItem('bucketListHistory');
    if (saved) {
      this.history = JSON.parse(saved);
    }
  }

  // Initialize with empty state
  private initializeSampleData() {
    // No sample data - start with empty state
    if (this.items.length === 0) {
      this.items = [];
      this.saveItems();
    }
  }

  // Cleanup deleted items (older than 30 days)
  cleanupDeletedItems() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.items = this.items.filter(item => 
      !item.isDeleted || (item.deletedAt && new Date(item.deletedAt) > thirtyDaysAgo)
    );
    this.notifyListeners();
  }
}

export const bucketListService = new BucketListService();
