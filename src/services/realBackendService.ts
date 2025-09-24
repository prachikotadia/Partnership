// Real Backend Service - Connects to Express.js backend with PostgreSQL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.herokuapp.com/api' // Replace with your production backend URL
  : 'http://localhost:3001/api';

class RealBackendService {
  private token: string | null = null;

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Get authentication token
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Make authenticated API request with comprehensive error handling
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        // Handle rate limiting gracefully
        if (response.status === 429) {
          console.warn('⚠️ Rate limit reached, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          throw new Error('Rate limit reached. Please wait a moment and try again.');
        }
        
        // Try to parse error response, fallback to status text
        try {
          const error = await response.json();
          throw new Error(error.error || 'Request failed');
        } catch (parseError) {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Backend server is not running. Please start the backend server on port 3001.');
      }
      throw error;
    }
  }

  // =============================================
  // AUTHENTICATION METHODS
  // =============================================

  async login(username: string, password: string) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(username: string, email: string, password: string, name: string) {
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, name }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    this.clearToken();
  }

  async getUserInfo() {
    try {
      return await this.makeRequest('/auth/me');
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  // =============================================
  // TASKS METHODS - BULLETPROOF CRUD
  // =============================================

  async getTasks() {
    try {
      const tasks = await this.makeRequest('/tasks');
      console.log('📋 Fetched tasks from database:', tasks);
      return tasks;
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      throw error;
    }
  }

  async createTask(task: any) {
    try {
      console.log('📋 Creating task in database:', task);
      const createdTask = await this.makeRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
      console.log('✅ Task created successfully:', createdTask);
      return createdTask;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, task: any) {
    try {
      console.log(`📋 Updating task ${id} in database:`, task);
      const updatedTask = await this.makeRequest(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
      });
      console.log('✅ Task updated successfully:', updatedTask);
      return updatedTask;
    } catch (error) {
      console.error('❌ Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string) {
    try {
      console.log(`📋 Deleting task ${id} from database`);
      const result = await this.makeRequest(`/tasks/${id}`, {
        method: 'DELETE',
      });
      console.log('✅ Task deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  }

  async toggleTask(id: string) {
    // First get the current task
    const tasks = await this.getTasks();
    const task = tasks.find((t: any) => t.id.toString() === id);
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Toggle the completed status
    return this.updateTask(id, {
      ...task,
      completed: !task.completed,
    });
  }

  // =============================================
  // INVITES METHODS - BULLETPROOF INVITE SYSTEM
  // =============================================

  async createInvite(inviteData: any) {
    try {
      console.log('🔗 Creating invite in database:', inviteData);
      const createdInvite = await this.makeRequest('/invites', {
        method: 'POST',
        body: JSON.stringify(inviteData),
      });
      console.log('✅ Invite created successfully:', createdInvite);
      return createdInvite;
    } catch (error) {
      console.error('❌ Error creating invite:', error);
      throw error;
    }
  }

  async getInvites() {
    try {
      const invites = await this.makeRequest('/invites');
      console.log('🔗 Fetched invites from database:', invites);
      return invites;
    } catch (error) {
      console.error('❌ Error fetching invites:', error);
      throw error;
    }
  }

  async getInvite(id: string) {
    try {
      const invite = await this.makeRequest(`/invites/${id}`);
      console.log('🔗 Fetched invite from database:', invite);
      return invite;
    } catch (error) {
      console.error('❌ Error fetching invite:', error);
      throw error;
    }
  }

  async joinInvite(joinData: { code?: string; link_token?: string }) {
    try {
      console.log('🔗 Joining invite:', joinData);
      const result = await this.makeRequest('/invites/join', {
        method: 'POST',
        body: JSON.stringify(joinData),
      });
      console.log('✅ Successfully joined invite:', result);
      return result;
    } catch (error) {
      console.error('❌ Error joining invite:', error);
      throw error;
    }
  }

  async revokeInvite(id: string) {
    try {
      console.log(`🔗 Revoking invite ${id}`);
      const result = await this.makeRequest(`/invites/${id}`, {
        method: 'DELETE',
      });
      console.log('✅ Invite revoked successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error revoking invite:', error);
      throw error;
    }
  }

  // =============================================
  // TIMELINE METHODS - BULLETPROOF TIMELINE SYSTEM
  // =============================================

  async getTimelineEntries() {
    try {
      const entries = await this.makeRequest('/timeline');
      console.log('📅 Fetched timeline entries from database:', entries);
      return entries;
    } catch (error) {
      console.error('❌ Error fetching timeline entries:', error);
      throw error;
    }
  }

  async getTimelineEntry(id: string) {
    try {
      const entry = await this.makeRequest(`/timeline/${id}`);
      console.log('📅 Fetched timeline entry from database:', entry);
      return entry;
    } catch (error) {
      console.error('❌ Error fetching timeline entry:', error);
      throw error;
    }
  }

  async createTimelineEntry(entryData: any) {
    try {
      console.log('📅 Creating timeline entry in database:', entryData);
      const createdEntry = await this.makeRequest('/timeline', {
        method: 'POST',
        body: JSON.stringify(entryData),
      });
      console.log('✅ Timeline entry created successfully:', createdEntry);
      return createdEntry;
    } catch (error) {
      console.error('❌ Error creating timeline entry:', error);
      throw error;
    }
  }

  async updateTimelineEntry(id: string, entryData: any) {
    try {
      console.log(`📅 Updating timeline entry ${id} in database:`, entryData);
      const updatedEntry = await this.makeRequest(`/timeline/${id}`, {
        method: 'PUT',
        body: JSON.stringify(entryData),
      });
      console.log('✅ Timeline entry updated successfully:', updatedEntry);
      return updatedEntry;
    } catch (error) {
      console.error('❌ Error updating timeline entry:', error);
      throw error;
    }
  }

  async deleteTimelineEntry(id: string) {
    try {
      console.log(`📅 Deleting timeline entry ${id} from database`);
      const result = await this.makeRequest(`/timeline/${id}`, {
        method: 'DELETE',
      });
      console.log('✅ Timeline entry deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting timeline entry:', error);
      throw error;
    }
  }

  async addTimelineReaction(entryId: string, reactionType: string) {
    try {
      console.log(`📅 Adding reaction to timeline entry ${entryId}:`, reactionType);
      const result = await this.makeRequest(`/timeline/${entryId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ reaction_type: reactionType }),
      });
      console.log('✅ Reaction added successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding reaction:', error);
      throw error;
    }
  }

  async removeTimelineReaction(entryId: string, reactionType: string) {
    try {
      console.log(`📅 Removing reaction from timeline entry ${entryId}:`, reactionType);
      const result = await this.makeRequest(`/timeline/${entryId}/reactions`, {
        method: 'DELETE',
        body: JSON.stringify({ reaction_type: reactionType }),
      });
      console.log('✅ Reaction removed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error removing reaction:', error);
      throw error;
    }
  }

  async addTimelineComment(entryId: string, content: string) {
    try {
      console.log(`📅 Adding comment to timeline entry ${entryId}:`, content);
      const result = await this.makeRequest(`/timeline/${entryId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      console.log('✅ Comment added successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  }

  async updateTimelineComment(commentId: string, content: string) {
    try {
      console.log(`📅 Updating comment ${commentId}:`, content);
      const result = await this.makeRequest(`/timeline/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      console.log('✅ Comment updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating comment:', error);
      throw error;
    }
  }

  async deleteTimelineComment(commentId: string) {
    try {
      console.log(`📅 Deleting comment ${commentId}`);
      const result = await this.makeRequest(`/timeline/comments/${commentId}`, {
        method: 'DELETE',
      });
      console.log('✅ Comment deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  }

  // =============================================
  // STREAK METHODS - BULLETPROOF STREAK SYSTEM
  // =============================================

  async getStreak() {
    try {
      const streak = await this.makeRequest('/streak');
      console.log('🔥 Fetched streak from database:', streak);
      return streak;
    } catch (error) {
      console.error('❌ Error fetching streak:', error);
      throw error;
    }
  }

  async clickStreak() {
    try {
      console.log('🔥 Recording streak click in database');
      const result = await this.makeRequest('/streak/click', {
        method: 'POST',
      });
      console.log('✅ Streak click recorded successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error recording streak click:', error);
      throw error;
    }
  }

  async getStreakHistory() {
    try {
      const history = await this.makeRequest('/streak/history');
      console.log('🔥 Fetched streak history from database:', history);
      return history;
    } catch (error) {
      console.error('❌ Error fetching streak history:', error);
      throw error;
    }
  }

  // =============================================
  // BUCKET LIST METHODS
  // =============================================

  async getBucketItems() {
    return this.makeRequest('/bucketlist');
  }

  async createBucketItem(item: any) {
    return this.makeRequest('/bucketlist', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateBucketItem(id: string, item: any) {
    return this.makeRequest(`/bucketlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteBucketItem(id: string) {
    return this.makeRequest(`/bucketlist/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleBucketItem(id: string) {
    // First get the current item
    const items = await this.getBucketItems();
    const item = items.find((i: any) => i.id.toString() === id);
    
    if (!item) {
      throw new Error('Bucket list item not found');
    }

    // Toggle the completed status
    return this.updateBucketItem(id, {
      ...item,
      completed: !item.completed,
    });
  }

  // =============================================
  // NOTES METHODS - BULLETPROOF DATABASE PERSISTENCE
  // =============================================

  async getNotes() {
    try {
      const notes = await this.makeRequest('/notes');
      console.log('📝 Fetched notes from database:', notes);
      return notes;
    } catch (error) {
      console.error('❌ Error fetching notes:', error);
      throw error;
    }
  }

  async createNote(note: any) {
    try {
      console.log('📝 Creating note in database:', note);
      const createdNote = await this.makeRequest('/notes', {
        method: 'POST',
        body: JSON.stringify(note),
      });
      console.log('✅ Note created successfully:', createdNote);
      return createdNote;
    } catch (error) {
      console.error('❌ Error creating note:', error);
      throw error;
    }
  }

  async updateNote(id: string, note: any) {
    try {
      console.log(`📝 Updating note ${id} in database:`, note);
      const updatedNote = await this.makeRequest(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(note),
      });
      console.log('✅ Note updated successfully:', updatedNote);
      return updatedNote;
    } catch (error) {
      console.error('❌ Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(id: string) {
    try {
      console.log(`📝 Deleting note ${id} from database`);
      const result = await this.makeRequest(`/notes/${id}`, {
        method: 'DELETE',
      });
      console.log('✅ Note deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      throw error;
    }
  }

  // =============================================
  // FINANCE METHODS
  // =============================================

  async getTransactions() {
    return this.makeRequest('/finance');
  }

  async createTransaction(transaction: any) {
    return this.makeRequest('/finance', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, transaction: any) {
    return this.makeRequest(`/finance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: string) {
    return this.makeRequest(`/finance/${id}`, {
      method: 'DELETE',
    });
  }

  // =============================================
  // TIMELINE METHODS
  // =============================================

  async getTimelineEvents() {
    return this.makeRequest('/timeline');
  }

  async createTimelineEvent(event: any) {
    return this.makeRequest('/timeline', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateTimelineEvent(id: string, event: any) {
    return this.makeRequest(`/timeline/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteTimelineEvent(id: string) {
    return this.makeRequest(`/timeline/${id}`, {
      method: 'DELETE',
    });
  }

  // =============================================
  // FINANCE METHODS WITH CURRENCY CONVERSION
  // =============================================

  async getFinanceTransactions(displayCurrency = 'USD', person = 'person1') {
    return this.makeRequest(`/finance?display_currency=${displayCurrency}&person=${person}`);
  }

  async createFinanceTransaction(transaction: {
    title: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
    type: 'income' | 'expense';
    person?: string;
  }) {
    return this.makeRequest('/finance', {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
  }

  async updateFinanceTransaction(id: number, transaction: {
    title?: string;
    amount?: number;
    currency?: string;
    category?: string;
    date?: string;
    type?: 'income' | 'expense';
  }) {
    return this.makeRequest(`/finance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction)
    });
  }

  async deleteFinanceTransaction(id: number) {
    return this.makeRequest(`/finance/${id}`, {
      method: 'DELETE'
    });
  }

  async getFinanceSummary(displayCurrency = 'USD', person = 'person1') {
    return this.makeRequest(`/finance/summary?display_currency=${displayCurrency}&person=${person}`);
  }

  async getCurrencyRates(baseCurrency = 'USD', targetCurrency = 'USD') {
    return this.makeRequest(`/currency-rates?base=${baseCurrency}&target=${targetCurrency}`);
  }

  async convertCurrency(amount: number, from: string, to: string) {
    return this.makeRequest('/convert', {
      method: 'POST',
      body: JSON.stringify({ amount, from, to })
    });
  }

  // =============================================
  // PERSON NAME MANAGEMENT METHODS
  // =============================================

  async getPersons() {
    return this.makeRequest('/persons');
  }

  async updatePerson(personKey: string, name: string, currencyPreference?: string) {
    return this.makeRequest(`/persons/${personKey}`, {
      method: 'PUT',
      body: JSON.stringify({ name, currency_preference: currencyPreference })
    });
  }

  // =============================================
  // NOTIFICATIONS METHODS
  // =============================================

  async getNotifications() {
    // For now, return empty array - notifications can be added later
    return [];
  }

  async getUserStreak() {
    // For now, return default streak - can be implemented later
    return { current_streak: 0, longest_streak: 0 };
  }

  // =============================================
  // HEALTH CHECK
  // =============================================

  async healthCheck() {
    return this.makeRequest('/health');
  }
}

export const realBackendService = new RealBackendService();
