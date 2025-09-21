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

  // Sample Data
  private initializeSampleData() {
    if (this.items.length === 0) {
      const sampleItems: BucketListItem[] = [
        {
          id: 'bucket_1',
          title: 'Visit the Northern Lights together',
          description: 'Experience the magical aurora borealis in Iceland or Norway with Person2',
          category: 'travel',
          priority: 'dream',
          status: 'not-started',
          progress: 0,
          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCost: 5000,
          currency: 'USD',
          location: 'Iceland',
          tags: ['romantic', 'nature', 'photography', 'winter'],
          assignedTo: [this.currentUser, this.partnerUser],
          subtasks: [
            { id: 'sub_1', title: 'Research best viewing locations', completed: false, createdAt: new Date().toISOString(), assignedTo: this.currentUser },
            { id: 'sub_2', title: 'Save money for the trip', completed: false, createdAt: new Date().toISOString(), assignedTo: this.partnerUser },
            { id: 'sub_3', title: 'Book flights and accommodation', completed: false, createdAt: new Date().toISOString(), assignedTo: this.currentUser }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.currentUser,
          isDeleted: false,
          isShared: true,
          notes: 'This has been our dream for years. Need to plan for the best time of year to see the lights.',
          inspiration: 'We both love nature and want to experience something truly magical together',
          difficulty: 'medium',
          timeRequired: 'weeks'
        },
        {
          id: 'bucket_2',
          title: 'Learn to cook a traditional Indian feast',
          description: 'Master the art of making biryani, dal, and other traditional dishes',
          category: 'learning',
          priority: 'medium',
          status: 'in-progress',
          progress: 30,
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCost: 200,
          currency: 'USD',
          location: 'Home',
          tags: ['cooking', 'culture', 'family', 'tradition'],
          assignedTo: [this.partnerUser],
          subtasks: [
            { id: 'sub_4', title: 'Find authentic recipes', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.partnerUser },
            { id: 'sub_5', title: 'Buy necessary spices and ingredients', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.partnerUser },
            { id: 'sub_6', title: 'Practice making dal', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.partnerUser },
            { id: 'sub_7', title: 'Master biryani technique', completed: false, createdAt: new Date().toISOString(), assignedTo: this.partnerUser },
            { id: 'sub_8', title: 'Host a dinner party', completed: false, createdAt: new Date().toISOString(), assignedTo: this.partnerUser }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.partnerUser,
          isDeleted: false,
          isShared: true,
          notes: 'Grandma\'s recipes are the best. Need to call her for tips.',
          inspiration: 'Want to connect with my cultural roots and share authentic flavors with Person1',
          difficulty: 'medium',
          timeRequired: 'months'
        },
        {
          id: 'bucket_3',
          title: 'Run a marathon together',
          description: 'Train and complete a full marathon as a couple',
          category: 'health',
          priority: 'high',
          status: 'in-progress',
          progress: 45,
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCost: 300,
          currency: 'USD',
          location: 'Local marathon',
          tags: ['fitness', 'challenge', 'teamwork', 'health'],
          assignedTo: [this.currentUser, this.partnerUser],
          subtasks: [
            { id: 'sub_9', title: 'Create training schedule', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.currentUser },
            { id: 'sub_10', title: 'Buy proper running shoes', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.partnerUser },
            { id: 'sub_11', title: 'Complete 5K run', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.currentUser },
            { id: 'sub_12', title: 'Complete 10K run', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.partnerUser },
            { id: 'sub_13', title: 'Complete half marathon', completed: false, createdAt: new Date().toISOString(), assignedTo: this.currentUser },
            { id: 'sub_14', title: 'Register for full marathon', completed: false, createdAt: new Date().toISOString(), assignedTo: this.partnerUser }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.currentUser,
          isDeleted: false,
          isShared: true,
          notes: 'Training is going well. We motivate each other to keep going.',
          inspiration: 'Want to achieve something challenging together and improve our health',
          difficulty: 'hard',
          timeRequired: 'months'
        },
        {
          id: 'bucket_4',
          title: 'Write and publish a book together',
          description: 'Collaborate on writing a book about our relationship journey',
          category: 'goals',
          priority: 'medium',
          status: 'not-started',
          progress: 5,
          targetDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCost: 1000,
          currency: 'USD',
          location: 'Home office',
          tags: ['writing', 'creativity', 'storytelling', 'legacy'],
          assignedTo: [this.currentUser, this.partnerUser],
          subtasks: [
            { id: 'sub_15', title: 'Outline book structure', completed: false, createdAt: new Date().toISOString(), assignedTo: this.currentUser },
            { id: 'sub_16', title: 'Research publishing options', completed: false, createdAt: new Date().toISOString(), assignedTo: this.partnerUser },
            { id: 'sub_17', title: 'Write first chapter', completed: false, createdAt: new Date().toISOString(), assignedTo: this.currentUser },
            { id: 'sub_18', title: 'Edit and revise content', completed: false, createdAt: new Date().toISOString(), assignedTo: this.partnerUser }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.partnerUser,
          isDeleted: false,
          isShared: true,
          notes: 'This is a long-term project. Need to set aside dedicated writing time.',
          inspiration: 'Our story might inspire other couples. Want to document our journey.',
          difficulty: 'hard',
          timeRequired: 'years'
        },
        {
          id: 'bucket_5',
          title: 'Learn to dance salsa together',
          description: 'Take salsa dancing lessons and perform at a social event',
          category: 'experiences',
          priority: 'low',
          status: 'completed',
          progress: 100,
          targetDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCost: 400,
          currency: 'USD',
          location: 'Dance studio',
          tags: ['dancing', 'romance', 'fun', 'social'],
          assignedTo: [this.currentUser, this.partnerUser],
          subtasks: [
            { id: 'sub_19', title: 'Find a good dance instructor', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.currentUser },
            { id: 'sub_20', title: 'Take 10 beginner lessons', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.partnerUser },
            { id: 'sub_21', title: 'Practice at home', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.currentUser },
            { id: 'sub_22', title: 'Perform at social dance night', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), assignedTo: this.partnerUser }
          ],
          attachments: [],
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: this.partnerUser,
          completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          isDeleted: false,
          isShared: true,
          notes: 'We had so much fun! Planning to continue with more advanced classes.',
          inspiration: 'Always wanted to learn to dance together. It brought us closer.',
          difficulty: 'medium',
          timeRequired: 'months'
        }
      ];

      this.items = sampleItems;
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
