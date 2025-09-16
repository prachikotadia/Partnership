import { supabaseAuthService } from './supabaseAuthService';
import { notificationService } from './notificationService';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'random' | 'brainstorm' | 'bucket-list' | 'funny' | 'personal' | 'work' | 'travel' | 'finance';
  tags: string[];
  isShared: boolean;
  isEncrypted: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastEditedBy: string;
  version: number;
  isFavorite: boolean;
  isPinned: boolean;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  collaborators: string[];
  color?: string;
  emoji?: string;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  version: number;
  title: string;
  content: string;
  editedBy: string;
  editedAt: Date;
  changeType: 'created' | 'edited' | 'deleted' | 'restored';
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export interface NoteCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  isDefault: boolean;
  noteCount: number;
}

class NotesService {
  private notes: Map<string, Note> = new Map();
  private versions: Map<string, NoteVersion[]> = new Map();
  private categories: Map<string, NoteCategory> = new Map();
  private userId: string | null = null;

  async initialize(userId: string) {
    this.userId = userId;
    await this.loadData();
    await this.initializeDefaultCategories();
  }

  // Note Management
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'lastEditedBy'>): Promise<string> {
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNote: Note = {
      ...note,
      id: noteId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy: this.userId!,
      version: 1
    };

    // Note: Encryption feature will be implemented in future version
    // if (newNote.isEncrypted) {
    //   newNote.content = encryptSensitiveData(newNote.content);
    // }

    this.notes.set(noteId, newNote);
    await this.createVersion(newNote, 'created');
    await this.updateCategoryCount(newNote.category);
    await this.saveData();

    // Notify partner if shared
    if (newNote.isShared) {
      await this.notifyPartner('note_created', {
        type: 'note',
        title: 'New Note Added',
        message: `${newNote.createdBy} added a new note: "${newNote.title}"`,
        noteId,
        note: newNote
      });
    }

    return noteId;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    const note = this.notes.get(id);
    if (note) {
      const oldNote = { ...note };
      const updatedNote = {
        ...note,
        ...updates,
        updatedAt: new Date(),
        lastEditedBy: this.userId!,
        version: note.version + 1
      };

      // Note: Encryption feature will be implemented in future version
      // if (updatedNote.isEncrypted && updates.content) {
      //   updatedNote.content = encryptSensitiveData(updates.content);
      // }

      this.notes.set(id, updatedNote);
      await this.createVersion(updatedNote, 'edited', oldNote);
      
      // Update category count if category changed
      if (updates.category && updates.category !== oldNote.category) {
        await this.updateCategoryCount(oldNote.category, -1);
        await this.updateCategoryCount(updatedNote.category);
      }
      
      await this.saveData();

      // Notify partner if shared
      if (updatedNote.isShared) {
        await this.notifyPartner('note_updated', {
          type: 'note',
          title: 'Note Updated',
          message: `${updatedNote.lastEditedBy} updated "${updatedNote.title}"`,
          noteId: id,
          note: updatedNote
        });
      }
    }
  }

  async deleteNote(id: string): Promise<void> {
    const note = this.notes.get(id);
    if (note) {
      this.notes.delete(id);
      await this.createVersion(note, 'deleted');
      await this.updateCategoryCount(note.category, -1);
      await this.saveData();

      // Notify partner if shared
      if (note.isShared) {
        await this.notifyPartner('note_deleted', {
          type: 'note',
          title: 'Note Deleted',
          message: `${note.lastEditedBy} deleted "${note.title}"`,
          noteId: id
        });
      }
    }
  }

  async restoreNote(id: string): Promise<void> {
    const versions = this.versions.get(id);
    if (versions && versions.length > 0) {
      const latestVersion = versions[versions.length - 1];
      const restoredNote: Note = {
        id,
        title: latestVersion.title,
        content: latestVersion.content,
        category: 'random', // Default category for restored notes
        tags: [],
        isShared: false,
        isEncrypted: false,
        createdBy: this.userId!,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastEditedBy: this.userId!,
        version: latestVersion.version + 1,
        isFavorite: false,
        isPinned: false,
        collaborators: []
      };

      this.notes.set(id, restoredNote);
      await this.createVersion(restoredNote, 'restored');
      await this.updateCategoryCount(restoredNote.category);
      await this.saveData();
    }
  }

  // Version Management
  private async createVersion(note: Note, changeType: 'created' | 'edited' | 'deleted' | 'restored', oldNote?: Note): Promise<void> {
    const version: NoteVersion = {
      id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      noteId: note.id,
      version: note.version,
      title: note.title,
      content: note.content,
      editedBy: note.lastEditedBy,
      editedAt: new Date(),
      changeType
    };

    // Track changes if editing
    if (changeType === 'edited' && oldNote) {
      version.changes = [];
      if (oldNote.title !== note.title) {
        version.changes.push({
          field: 'title',
          oldValue: oldNote.title,
          newValue: note.title
        });
      }
      if (oldNote.content !== note.content) {
        version.changes.push({
          field: 'content',
          oldValue: oldNote.content.substring(0, 100) + '...',
          newValue: note.content.substring(0, 100) + '...'
        });
      }
      if (oldNote.category !== note.category) {
        version.changes.push({
          field: 'category',
          oldValue: oldNote.category,
          newValue: note.category
        });
      }
    }

    const existingVersions = this.versions.get(note.id) || [];
    existingVersions.push(version);
    this.versions.set(note.id, existingVersions);
  }

  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    return this.versions.get(noteId) || [];
  }

  async restoreToVersion(noteId: string, version: number): Promise<void> {
    const versions = this.versions.get(noteId);
    if (versions) {
      const targetVersion = versions.find(v => v.version === version);
      if (targetVersion) {
        await this.updateNote(noteId, {
          title: targetVersion.title,
          content: targetVersion.content,
          version: targetVersion.version + 1
        });
      }
    }
  }

  // Category Management
  private async initializeDefaultCategories(): Promise<void> {
    const defaultCategories: NoteCategory[] = [
      {
        id: 'random',
        name: 'Random',
        description: 'Random thoughts and ideas',
        color: '#6b7280',
        emoji: '💭',
        isDefault: true,
        noteCount: 0
      },
      {
        id: 'brainstorm',
        name: 'Brainstorm',
        description: 'Creative brainstorming sessions',
        color: '#3b82f6',
        emoji: '💡',
        isDefault: true,
        noteCount: 0
      },
      {
        id: 'bucket-list',
        name: 'Bucket List',
        description: 'Things we want to do together',
        color: '#10b981',
        emoji: '🎯',
        isDefault: true,
        noteCount: 0
      },
      {
        id: 'funny',
        name: 'Funny Notes',
        description: 'Lighthearted and funny messages',
        color: '#f59e0b',
        emoji: '😂',
        isDefault: true,
        noteCount: 0
      },
      {
        id: 'personal',
        name: 'Personal',
        description: 'Personal thoughts and feelings',
        color: '#8b5cf6',
        emoji: '💝',
        isDefault: true,
        noteCount: 0
      },
      {
        id: 'work',
        name: 'Work',
        description: 'Work-related notes and ideas',
        color: '#ef4444',
        emoji: '💼',
        isDefault: true,
        noteCount: 0
      },
      {
        id: 'travel',
        name: 'Travel',
        description: 'Travel plans and memories',
        color: '#06b6d4',
        emoji: '✈️',
        isDefault: true,
        noteCount: 0
      },
      {
        id: 'finance',
        name: 'Finance',
        description: 'Financial planning and budgeting',
        color: '#84cc16',
        emoji: '💰',
        isDefault: true,
        noteCount: 0
      }
    ];

    for (const category of defaultCategories) {
      if (!this.categories.has(category.id)) {
        this.categories.set(category.id, category);
      }
    }

    await this.updateAllCategoryCounts();
  }

  private async updateCategoryCount(categoryId: string, delta: number = 1): Promise<void> {
    const category = this.categories.get(categoryId);
    if (category) {
      category.noteCount = Math.max(0, category.noteCount + delta);
      this.categories.set(categoryId, category);
    }
  }

  private async updateAllCategoryCounts(): Promise<void> {
    // Reset all counts
    for (const category of this.categories.values()) {
      category.noteCount = 0;
    }

    // Count notes in each category
    for (const note of this.notes.values()) {
      const category = this.categories.get(note.category);
      if (category) {
        category.noteCount++;
      }
    }
  }

  // Search and Filter
  searchNotes(query: string): Note[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getNotes().filter(note => {
      const title = note.title.toLowerCase();
      const content = note.isEncrypted ? '' : note.content.toLowerCase();
      const tags = note.tags.join(' ').toLowerCase();
      
      return title.includes(lowercaseQuery) || 
             content.includes(lowercaseQuery) || 
             tags.includes(lowercaseQuery);
    });
  }

  getNotesByCategory(category: string): Note[] {
    return this.getNotes().filter(note => note.category === category);
  }

  getNotesByTag(tag: string): Note[] {
    return this.getNotes().filter(note => 
      note.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  getSharedNotes(): Note[] {
    return this.getNotes().filter(note => note.isShared);
  }

  getFavoriteNotes(): Note[] {
    return this.getNotes().filter(note => note.isFavorite);
  }

  getPinnedNotes(): Note[] {
    return this.getNotes().filter(note => note.isPinned);
  }

  getRecentNotes(limit: number = 10): Note[] {
    return this.getNotes()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  // Tag Management
  getAllTags(): string[] {
    const tagSet = new Set<string>();
    for (const note of this.notes.values()) {
      note.tags.forEach(tag => tagSet.add(tag.toLowerCase()));
    }
    return Array.from(tagSet).sort();
  }

  getPopularTags(limit: number = 20): { tag: string; count: number }[] {
    const tagCounts = new Map<string, number>();
    
    for (const note of this.notes.values()) {
      note.tags.forEach(tag => {
        const lowercaseTag = tag.toLowerCase();
        tagCounts.set(lowercaseTag, (tagCounts.get(lowercaseTag) || 0) + 1);
      });
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Data Management
  private async loadData(): Promise<void> {
    try {
      const saved = localStorage.getItem(`notes_${this.userId}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.notes) {
          data.notes.forEach((note: Note) => {
            this.notes.set(note.id, {
              ...note,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt)
            });
          });
        }
        if (data.versions) {
          Object.entries(data.versions).forEach(([noteId, versions]: [string, any]) => {
            this.versions.set(noteId, versions.map((v: any) => ({
              ...v,
              editedAt: new Date(v.editedAt)
            })));
          });
        }
        if (data.categories) {
          data.categories.forEach((category: NoteCategory) => {
            this.categories.set(category.id, category);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load notes data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      const data = {
        notes: Array.from(this.notes.values()),
        versions: Object.fromEntries(this.versions.entries()),
        categories: Array.from(this.categories.values())
      };
      localStorage.setItem(`notes_${this.userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notes data:', error);
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
  getNotes(): Note[] {
    return Array.from(this.notes.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getCategories(): NoteCategory[] {
    return Array.from(this.categories.values()).sort((a, b) => b.noteCount - a.noteCount);
  }

  getNote(id: string): Note | undefined {
    return this.notes.get(id);
  }

  // Statistics
  getStats(): {
    totalNotes: number;
    sharedNotes: number;
    encryptedNotes: number;
    favoriteNotes: number;
    pinnedNotes: number;
    totalTags: number;
    mostUsedCategory: string;
    recentActivity: number;
  } {
    const notes = this.getNotes();
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const categoryCounts = new Map<string, number>();
    notes.forEach(note => {
      categoryCounts.set(note.category, (categoryCounts.get(note.category) || 0) + 1);
    });

    const mostUsedCategory = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'random';

    return {
      totalNotes: notes.length,
      sharedNotes: notes.filter(n => n.isShared).length,
      encryptedNotes: notes.filter(n => n.isEncrypted).length,
      favoriteNotes: notes.filter(n => n.isFavorite).length,
      pinnedNotes: notes.filter(n => n.isPinned).length,
      totalTags: this.getAllTags().length,
      mostUsedCategory,
      recentActivity: notes.filter(n => n.updatedAt > lastWeek).length
    };
  }
}

export const notesService = new NotesService();
