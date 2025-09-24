// Demo Backend Service - Works without backend for Netlify deployment
class DemoBackendService {
  private token: string | null = null;
  private demoData: any = {
    user: { id: 1, username: 'person1', email: 'person1@example.com', name: 'Person One' },
    tasks: [
      { id: 1, title: 'Complete project', completed: false, priority: 'high' },
      { id: 2, title: 'Review code', completed: true, priority: 'medium' },
      { id: 3, title: 'Update documentation', completed: false, priority: 'low' }
    ],
    notes: [
      { id: 1, title: 'Meeting notes', content: 'Important discussion points', created_at: new Date().toISOString() }
    ],
    timeline: [
      { id: 1, title: 'Project milestone', description: 'Completed first phase', date: new Date().toISOString() }
    ],
    streak: { id: 1, current_streak_count: 2, max_streak_count: 7, is_active: true, emoji: '🔥' },
    finance: {
      transactions: [
        { id: 1, title: 'Salary', amount: 1400, currency: 'USD', type: 'income', category: 'Work', date: new Date().toISOString(), person: 'person1' },
        { id: 2, title: 'Groceries', amount: 150, currency: 'USD', type: 'expense', category: 'Food', date: new Date().toISOString(), person: 'person1' },
        { id: 3, title: 'Rent', amount: 1200, currency: 'USD', type: 'expense', category: 'Housing', date: new Date().toISOString(), person: 'person1' }
      ],
      summary: {
        income: { total: 1400, count: 1, currency: 'USD' },
        expense: { total: 1350, count: 2, currency: 'USD' },
        balance: 50,
        person: 'person1'
      },
      persons: {
        person1: { name: 'Person 1', currency_preference: 'USD' },
        person2: { name: 'Person 2', currency_preference: 'USD' }
      }
    }
  };

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

  // Demo login - always works with person1/password123
  async login(username: string, password: string) {
    if (username === 'person1' && password === 'password123') {
      const token = 'demo-token-' + Date.now();
      this.setToken(token);
      return {
        user: this.demoData.user,
        token: token
      };
    }
    throw new Error('Invalid credentials');
  }

  // Demo user info
  async getUserInfo() {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    return this.demoData.user;
  }

  // Demo tasks
  async getTasks() {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    return this.demoData.tasks;
  }

  async createTask(task: any) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    const newTask = { ...task, id: Date.now() };
    this.demoData.tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: number, updates: any) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    const taskIndex = this.demoData.tasks.findIndex((t: any) => t.id === id);
    if (taskIndex !== -1) {
      this.demoData.tasks[taskIndex] = { ...this.demoData.tasks[taskIndex], ...updates };
      return this.demoData.tasks[taskIndex];
    }
    throw new Error('Task not found');
  }

  async deleteTask(id: number) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    this.demoData.tasks = this.demoData.tasks.filter((t: any) => t.id !== id);
    return { success: true };
  }

  // Demo notes
  async getNotes() {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    return this.demoData.notes;
  }

  async createNote(note: any) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    const newNote = { ...note, id: Date.now(), created_at: new Date().toISOString() };
    this.demoData.notes.push(newNote);
    return newNote;
  }

  async updateNote(id: number, updates: any) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    const noteIndex = this.demoData.notes.findIndex((n: any) => n.id === id);
    if (noteIndex !== -1) {
      this.demoData.notes[noteIndex] = { ...this.demoData.notes[noteIndex], ...updates };
      return this.demoData.notes[noteIndex];
    }
    throw new Error('Note not found');
  }

  async deleteNote(id: number) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    this.demoData.notes = this.demoData.notes.filter((n: any) => n.id !== id);
    return { success: true };
  }

  // Demo timeline
  async getTimelineEntries() {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    return this.demoData.timeline;
  }

  async createTimelineEntry(entry: any) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    const newEntry = { ...entry, id: Date.now(), created_at: new Date().toISOString() };
    this.demoData.timeline.push(newEntry);
    return newEntry;
  }

  async deleteTimelineEntry(id: number) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    this.demoData.timeline = this.demoData.timeline.filter((e: any) => e.id !== id);
    return { success: true };
  }

  // Demo streak
  async getStreak() {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    return this.demoData.streak;
  }

  async updateStreak() {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    this.demoData.streak.current_streak_count += 1;
    this.demoData.streak.last_click_date = new Date().toISOString();
    return this.demoData.streak;
  }

  // Demo finance
  async getFinanceTransactions(person: string = 'person1', displayCurrency: string = 'USD') {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    return this.demoData.finance.transactions.filter((t: any) => t.person === person);
  }

  async getFinanceSummary(person: string = 'person1', displayCurrency: string = 'USD') {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    return this.demoData.finance.summary;
  }

  async createFinanceTransaction(transaction: any) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    const newTransaction = { ...transaction, id: Date.now(), created_at: new Date().toISOString() };
    this.demoData.finance.transactions.push(newTransaction);
    return newTransaction;
  }

  async deleteFinanceTransaction(id: number) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    this.demoData.finance.transactions = this.demoData.finance.transactions.filter((t: any) => t.id !== id);
    return { success: true };
  }

  // Demo persons
  async getPersons() {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    return this.demoData.finance.persons;
  }

  async updatePerson(personKey: string, updates: any) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    if (this.demoData.finance.persons[personKey]) {
      this.demoData.finance.persons[personKey] = { ...this.demoData.finance.persons[personKey], ...updates };
      return this.demoData.finance.persons[personKey];
    }
    throw new Error('Person not found');
  }

  // Demo currency conversion
  async convertCurrency(amount: number, from: string, to: string) {
    if (!this.getToken()) {
      throw new Error('Not authenticated');
    }
    // Simple demo conversion rates
    const rates: any = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'INR': 83.0,
      'JPY': 110.0,
      'CAD': 1.25,
      'AUD': 1.35
    };
    
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    const converted = (amount / fromRate) * toRate;
    
    return {
      converted: Math.round(converted * 100) / 100,
      rate: toRate / fromRate,
      source: 'demo'
    };
  }
}

export default new DemoBackendService();
