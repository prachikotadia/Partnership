import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface Note {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  reminder_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NoteHistory {
  id: string;
  note_id: string;
  user_id: string;
  action: string;
  old_value?: any;
  new_value?: any;
  created_at: string;
}

class SupabaseNotesService {
  private listeners: ((notes: Note[]) => void)[] = [];

  // Subscribe to note changes
  subscribe(listener: (notes: Note[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(notes: Note[]) {
    this.listeners.forEach(listener => listener(notes));
  }

  // Get all notes for the current user
  async getNotes(): Promise<Note[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('created_by', user.id)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  }

  // Create a new note
  async createNote(noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Add to history
      await this.addNoteHistory(data.id, 'created', null, data);

      notificationService.showSimpleNotification(
        'Note Created',
        `Note "${data.title}" has been created successfully.`,
        'success'
      );

      // Refresh notes
      const notes = await this.getNotes();
      this.notifyListeners(notes);

      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to create note. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Update a note
  async updateNote(noteId: string, updates: Partial<Note>): Promise<Note | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current note for history
      const { data: currentNote } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      // Add to history
      await this.addNoteHistory(noteId, 'updated', currentNote, data);

      notificationService.showSimpleNotification(
        'Note Updated',
        `Note "${data.title}" has been updated successfully.`,
        'success'
      );

      // Refresh notes
      const notes = await this.getNotes();
      this.notifyListeners(notes);

      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to update note. Please try again.',
        'error'
      );
      return null;
    }
  }

  // Delete a note
  async deleteNote(noteId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current note for history
      const { data: currentNote } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      // Add to history
      await this.addNoteHistory(noteId, 'deleted', currentNote, null);

      notificationService.showSimpleNotification(
        'Note Deleted',
        `Note "${currentNote?.title}" has been deleted successfully.`,
        'success'
      );

      // Refresh notes
      const notes = await this.getNotes();
      this.notifyListeners(notes);

      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      notificationService.showSimpleNotification(
        'Error',
        'Failed to delete note. Please try again.',
        'error'
      );
      return false;
    }
  }

  // Pin/unpin a note
  async togglePin(noteId: string): Promise<Note | null> {
    try {
      const { data: currentNote } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (!currentNote) return null;

      return await this.updateNote(noteId, { is_pinned: !currentNote.is_pinned });
    } catch (error) {
      console.error('Error toggling pin:', error);
      return null;
    }
  }

  // Get note history
  async getNoteHistory(noteId: string): Promise<NoteHistory[]> {
    try {
      const { data, error } = await supabase
        .from('note_history')
        .select(`
          *,
          users!note_history_user_id_fkey(name)
        `)
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching note history:', error);
      return [];
    }
  }

  // Add note history entry
  private async addNoteHistory(noteId: string, action: string, oldValue: any, newValue: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('note_history')
        .insert({
          note_id: noteId,
          user_id: user.id,
          action,
          old_value: oldValue,
          new_value: newValue,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error adding note history:', error);
    }
  }

  // Search notes
  async searchNotes(query: string): Promise<Note[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('created_by', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }

  // Get pinned notes
  async getPinnedNotes(): Promise<Note[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_pinned', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pinned notes:', error);
      return [];
    }
  }

  // Get notes with reminders
  async getNotesWithReminders(): Promise<Note[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('created_by', user.id)
        .not('reminder_date', 'is', null)
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes with reminders:', error);
      return [];
    }
  }

  // Get note statistics
  async getNoteStats(): Promise<{
    total: number;
    pinned: number;
    withReminders: number;
    recent: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('is_pinned, reminder_date, created_at')
        .eq('created_by', user.id);

      if (error) throw error;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const stats = {
        total: data.length,
        pinned: data.filter(n => n.is_pinned).length,
        withReminders: data.filter(n => n.reminder_date).length,
        recent: data.filter(n => new Date(n.created_at) > weekAgo).length
      };

      return stats;
    } catch (error) {
      console.error('Error fetching note stats:', error);
      return { total: 0, pinned: 0, withReminders: 0, recent: 0 };
    }
  }
}

export const supabaseNotesService = new SupabaseNotesService();
