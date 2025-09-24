import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  StickyNote, 
  DollarSign, 
  Star, 
  Calendar,
  Plus,
  X,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  Globe,
  Clock,
  FileText,
  Heart,
  LogOut,
  CheckCircle,
  Circle,
  AlertCircle,
  UserPlus,
  Users,
  Copy,
  Link,
  Info,
  ArrowRight,
  Lock,
  Bell,
  Flame,
  Settings,
  Zap,
  BarChart3
} from 'lucide-react';
import { realBackendService } from './services/realBackendService';
import { CompleteBackendAPI } from './services/completeBackendApi';

// Simple App that bypasses all complex components
const SimpleApp = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === null) {
      // Set default theme to light mode
      localStorage.setItem('theme', 'light');
      return false;
    }
    return savedTheme === 'dark';
  });

  // Notification system
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Welcome to Bondly Glow! Start your partnership journey.', timestamp: new Date(), read: false },
    { id: 2, type: 'info', message: 'Complete your first task to start your streak!', timestamp: new Date(), read: false }
  ]);

  // Daily streak system - REMOVED (replaced with bulletproof backend system)

  // Partner system
  const [partner, setPartner] = useState(null);
  const [invitationCode, setInvitationCode] = useState('');

  // Currency system
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    return savedCurrency || 'USD';
  });

  // UI state
  const [showNotifications, setShowNotifications] = useState(false);

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Notification functions
  const addNotification = (type: string, message: string) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Streak functions - REMOVED (replaced with bulletproof backend system)

  // Currency functions
  const toggleCurrency = () => {
    const newCurrency = currency === 'USD' ? 'INR' : 'USD';
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    addNotification('info', `Currency switched to ${newCurrency}`);
  };

  // Partner functions
  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInvitationCode(code);
    addNotification('success', `Invitation code generated: ${code}`);
    return code;
  };

  const joinWithCode = (code: string) => {
    // Simulate partner joining
    setPartner({ name: 'Partner', code });
    addNotification('success', 'Partner joined successfully!');
  };

  // Neumorphic styles based on theme
  const getNeumorphicStyles = () => {
    if (isDarkMode) {
      return {
        background: 'bg-gray-900',
        card: 'bg-gray-800 shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(255,255,255,0.1)]',
        cardPressed: 'bg-gray-800 shadow-[inset_12px_12px_24px_rgba(0,0,0,0.5),inset_-12px_-12px_24px_rgba(255,255,255,0.1)]',
        text: 'text-gray-50',
        textSecondary: 'text-gray-200',
        textMuted: 'text-gray-400',
        border: 'border-gray-700',
        input: 'bg-gray-800 border-gray-700 text-gray-50 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),inset_-6px_-6px_12px_rgba(255,255,255,0.1)]',
        button: 'bg-gray-800 text-gray-50 shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(255,255,255,0.1)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.5),-8px_-8px_16px_rgba(255,255,255,0.1)]',
        buttonPressed: 'bg-gray-800 text-gray-50 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),inset_-6px_-6px_12px_rgba(255,255,255,0.1)]',
        accent: 'bg-blue-600 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(255,255,255,0.1)]',
        gradient: 'bg-gradient-to-br from-gray-800 to-gray-900'
      };
    } else {
      return {
        background: 'bg-gray-100',
        card: 'bg-gray-100 shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)]',
        cardPressed: 'bg-gray-100 shadow-[inset_12px_12px_24px_rgba(0,0,0,0.15),inset_-12px_-12px_24px_rgba(255,255,255,0.9)]',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        textMuted: 'text-gray-500',
        border: 'border-gray-200',
        input: 'bg-gray-100 border-gray-200 text-gray-900 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]',
        button: 'bg-gray-100 text-gray-900 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.9)]',
        buttonPressed: 'bg-gray-100 text-gray-900 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]',
        accent: 'bg-blue-600 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]',
        gradient: 'bg-gradient-to-br from-gray-100 to-gray-200'
      };
    }
  };

  const styles = getNeumorphicStyles();

  // Check if user is logged in on mount
  useEffect(() => {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Use real backend authentication
      const result = await realBackendService.login(username, password);
      if (result && result.user) {
        setUser(result.user);
      setMessage('Login successful! Welcome to Bondly Glow!');
        
        // Load initial data from backend
        await loadInitialData();
        return;
      }
    } catch (error: any) {
      console.error('Backend login error:', error);
      setMessage('Login failed. Please check your credentials.');
    }

    setIsLoading(false);
  };


  const handleLogout = async () => {
    try {
      await realBackendService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('demo_user');
    setUser(null);
    setMessage('');
  };

  // Load initial data from backend
  const loadInitialData = async () => {
    try {
      // Load notifications and streak from backend
      const [notifications, streakData] = await Promise.all([
        realBackendService.getNotifications(),
        realBackendService.getUserStreak()
      ]);

      // Update state with backend data
      setNotifications(notifications || []);
      // setStreak - REMOVED (replaced with bulletproof backend system)
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  // Check for existing authentication token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Set the token in the service
      realBackendService.setToken(token);
      // Try to get user info to validate the token
      realBackendService.getUserInfo().then(userInfo => {
        if (userInfo) {
          setUser(userInfo);
        }
      }).catch(() => {
        // Token is invalid, clear it
        realBackendService.clearToken();
        localStorage.removeItem('auth_token');
      });
    }
  }, []);

  // If user is logged in, show dashboard
  if (user) {
          return <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme}
            notifications={notifications}
            setNotifications={setNotifications}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            addNotification={addNotification}
            markNotificationAsRead={markNotificationAsRead}
            clearAllNotifications={clearAllNotifications}
            // streak - REMOVED (now using global streak state)
            partner={partner}
            setPartner={setPartner}
            currency={currency}
            toggleCurrency={toggleCurrency}
          />;
  }

  // Show login form
  return (
    <div className={`min-h-screen ${styles.background} flex items-center justify-center p-4 transition-all duration-300`}>
      <div className="w-full max-w-md">
        <div className={`${styles.card} rounded-2xl p-8 space-y-6 transition-all duration-300`}>
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`w-12 h-12 ${styles.card} rounded-2xl flex items-center justify-center transition-all duration-300`}>
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${styles.text} transition-all duration-300`}>Bondly Glow</h1>
                <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>Partner Collaboration</p>
              </div>
            </div>
            <h2 className={`text-xl font-semibold ${styles.text} transition-all duration-300`}>Welcome Back</h2>
            <p className={`${styles.textSecondary} transition-all duration-300`}>Sign in to continue your journey together</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-xl ${
              message.includes('successful') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${styles.text} transition-all duration-300`}>Username</label>
              <div className="relative">
                <FileText className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${styles.textMuted} transition-all duration-300`} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${styles.text} transition-all duration-300`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${styles.textMuted} transition-all duration-300`} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${styles.accent} py-3 px-4 rounded-xl font-medium focus:outline-none transition-all duration-300 disabled:opacity-50 hover:scale-105`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>

          {/* Theme Toggle */}
          <div className="flex justify-center">
            <button
              onClick={toggleTheme}
              className={`w-12 h-12 ${styles.button} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105`}
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>

          {/* Demo Instructions */}
          <div className="text-center space-y-2">
            <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
              <strong>Demo Mode:</strong>
            </p>
            <div className={`text-xs ${styles.textMuted} space-y-1 text-left transition-all duration-300`}>
              <p className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> <strong>person1</strong> / <strong>password123</strong></p>
              <p className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> <strong>person2</strong> / <strong>password123</strong></p>
              <p className="flex items-center"><Info className="h-3 w-3 mr-1 text-blue-500" /> No database setup required!</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// Enhanced Dashboard Component with all features
const Dashboard = ({ 
  user, 
  onLogout, 
  isDarkMode, 
  toggleTheme,
  notifications,
  setNotifications,
  showNotifications,
  setShowNotifications,
  addNotification,
  markNotificationAsRead,
  clearAllNotifications,
  // streak - REMOVED (now using global streak state)
  partner,
  setPartner,
  currency,
  toggleCurrency
}: { 
  user: any; 
  onLogout: () => void; 
  isDarkMode: boolean; 
  toggleTheme: () => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  addNotification: (type: string, message: string) => void;
  markNotificationAsRead: (id: number) => void;
  clearAllNotifications: () => void;
  // streak - REMOVED (now using global streak state)
  partner: any;
  setPartner: (partner: any) => void;
  currency: string;
  toggleCurrency: () => void;
}) => {
  // Enhanced Tasks with priority, due dates, and categories
  // Enhanced Tasks with priorities and due dates - LOADED FROM DATABASE
  const [tasks, setTasks] = useState([]);

  // Enhanced Notes with categories and rich content - LOADED FROM DATABASE
  const [notes, setNotes] = useState([]);
  
  // Professional Finance System with Currency Conversion
  const [financeTransactions, setFinanceTransactions] = useState([]);
  const [financeSummary, setFinanceSummary] = useState({
    income: { total: 0, count: 0, currency: 'USD' },
    expense: { total: 0, count: 0, currency: 'USD' },
    balance: 0
  });
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [financeFilter, setFinanceFilter] = useState('all');
  const [currentPerson, setCurrentPerson] = useState('person1');
  const [personNames, setPersonNames] = useState({
    person1: { name: 'Person 1', currency_preference: 'USD' },
    person2: { name: 'Person 2', currency_preference: 'USD' }
  });
  const [editingPerson, setEditingPerson] = useState(null);
  const [editPersonName, setEditPersonName] = useState('');

  // Load ALL data from backend - SIMPLIFIED AND BULLETPROOF
  useEffect(() => {
    const loadAllData = async () => {
      if (!user || user.id === 'demo-user') return;
      
      try {
        console.log('🔄 Loading all data from backend...');
        
        // Load notes FIRST and separately to debug
        console.log('📝 Loading notes...');
        const notes = await realBackendService.getNotes();
        console.log('📝 RAW NOTES FROM API:', notes);
        console.log('📝 NUMBER OF NOTES:', notes.length);
        
        // Map notes properly
        const mappedNotes = notes.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          description: note.description,
          category: note.category,
          starred: note.starred,
          createdAt: note.created_at
        }));
        
        console.log('📝 MAPPED NOTES:', mappedNotes);
        setNotes(mappedNotes);
        console.log('📝 NOTES STATE SET TO:', mappedNotes.length, 'notes');
        
        // Load other data
      const [tasks, bucketList, timelineEntries, streakData, financeTransactions, financeSummary, persons] = await Promise.all([
        realBackendService.getTasks().catch(() => []),
        realBackendService.getBucketItems().catch(() => []),
        realBackendService.getTimelineEntries().catch(() => []),
        realBackendService.getStreak().catch(() => null),
        realBackendService.getFinanceTransactions(displayCurrency, currentPerson).catch(() => []),
        realBackendService.getFinanceSummary(displayCurrency, currentPerson).catch(() => ({
          income: { total: 0, count: 0, currency: displayCurrency },
          expense: { total: 0, count: 0, currency: displayCurrency },
          balance: 0
        })),
        realBackendService.getPersons().catch(() => ({
          person1: { name: 'Person 1', currency_preference: 'USD' },
          person2: { name: 'Person 2', currency_preference: 'USD' }
        }))
      ]);
        
        console.log('📋 RAW TASKS FROM API:', tasks);
        console.log('📋 NUMBER OF TASKS:', tasks.length);
        
        // Always set tasks, even if empty array
        const mappedTasks = tasks.map(t => ({
          id: t.id,
          title: t.name, // Map name to title for UI compatibility
          name: t.name,
          description: t.description,
          completed: t.status === 'completed',
          priority: t.priority,
          dueDate: t.due_date,
          dueTime: t.due_time,
          status: t.status,
          moneyRequired: t.money_required,
          currency: t.currency,
          assignedTo: t.assigned_to,
          assignedBy: t.assigned_by,
          category: t.priority // Use priority as category for now
        }));
        
        console.log('📋 MAPPED TASKS:', mappedTasks);
        setTasks(mappedTasks);
        console.log('📋 TASKS STATE SET TO:', mappedTasks.length, 'tasks');
        
        setBucketList(bucketList);
        
        console.log('📅 RAW TIMELINE ENTRIES FROM API:', timelineEntries);
        console.log('📅 NUMBER OF TIMELINE ENTRIES:', timelineEntries.length);
        setTimelineEntries(timelineEntries);
        console.log('📅 TIMELINE ENTRIES STATE SET TO:', timelineEntries.length, 'entries');
        
        console.log('🔥 RAW STREAK FROM API:', streakData);
        setStreak(streakData);
        console.log('🔥 STREAK STATE SET TO:', streakData ? 'loaded' : 'null');
        
        console.log('💰 RAW FINANCE TRANSACTIONS FROM API:', financeTransactions);
        console.log('💰 NUMBER OF FINANCE TRANSACTIONS:', financeTransactions.length);
        setFinanceTransactions(financeTransactions);
        console.log('💰 FINANCE TRANSACTIONS STATE SET TO:', financeTransactions.length, 'transactions');
        
        console.log('💰 RAW FINANCE SUMMARY FROM API:', financeSummary);
        setFinanceSummary(financeSummary);
        console.log('💰 FINANCE SUMMARY STATE SET TO:', financeSummary);
        
        console.log('👤 RAW PERSONS FROM API:', persons);
        setPersonNames(persons);
        console.log('👤 PERSONS STATE SET TO:', persons);
        
        console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
      }
    };
    
    loadAllData();
  }, [user]);

  // Reload finance data when display currency changes
  useEffect(() => {
    if (user && user.id !== 'demo-user') {
      loadFinanceData();
    }
  }, [displayCurrency, user, currentPerson]);

  // Enhanced Finance with income, expenses, and budgets - Start empty, only user-added entries
  const [expenses, setExpenses] = useState([]);

  // Bucket List items - Start empty, only user-added entries
  const [bucketList, setBucketList] = useState([]);

  // Timeline events - Start empty, only user-added entries
  const [timeline, setTimeline] = useState([]);

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [invites, setInvites] = useState([]);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [streak, setStreak] = useState(null);
  const [streakLoading, setStreakLoading] = useState(false);
  const [newItem, setNewItem] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    priority: 'medium', 
    amount: '', 
    type: 'expense', 
    dueDate: '', 
    dueTime: '', 
    moneyRequired: '', 
    currency: 'USD', 
    assignedTo: '', 
    assignedBy: '',
    expirationDays: '',
    maxUses: '',
    timelineContent: '',
    timelineVisibility: 'private',
  });
  const [joinData, setJoinData] = useState({ code: '', link_token: '' });

  // Enhanced Task Management
  const toggleTask = async (id: number) => {
    try {
      await realBackendService.toggleTask(id.toString());
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  // =============================================
  // INVITE MANAGEMENT - BULLETPROOF SYSTEM
  // =============================================

  const createInvite = async (inviteData: any) => {
    try {
      const newInvite = await realBackendService.createInvite(inviteData);
      setInvites([newInvite, ...invites]);
      console.log('✅ Invite created and saved to database!');
      return newInvite;
    } catch (error) {
      console.error('❌ Error creating invite:', error);
      throw error;
    }
  };

  const loadInvites = async () => {
    try {
      const userInvites = await realBackendService.getInvites();
      setInvites(userInvites);
      console.log('✅ Invites loaded from database!');
    } catch (error) {
      console.error('❌ Error loading invites:', error);
    }
  };

  const joinInvite = async (joinData: { code?: string; link_token?: string }) => {
    try {
      const result = await realBackendService.joinInvite(joinData);
      console.log('✅ Successfully joined invite!');
      alert('Successfully joined! Welcome to the partnership!');
      return result;
    } catch (error) {
      console.error('❌ Error joining invite:', error);
      alert('Failed to join invite. Please check the code or link.');
      throw error;
    }
  };

  const revokeInvite = async (id: string) => {
    try {
      await realBackendService.revokeInvite(id);
      setInvites(invites.filter(invite => invite.id !== id));
      console.log('✅ Invite revoked successfully!');
    } catch (error) {
      console.error('❌ Error revoking invite:', error);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard');
    }
  };

  // =============================================
  // TIMELINE MANAGEMENT - BULLETPROOF SYSTEM
  // =============================================

  const loadTimelineEntries = async () => {
    try {
      const entries = await realBackendService.getTimelineEntries();
      setTimelineEntries(entries);
      console.log('✅ Timeline entries loaded from database!');
    } catch (error) {
      console.error('❌ Error loading timeline entries:', error);
    }
  };

  const createTimelineEntry = async (entryData: any) => {
    try {
      const newEntry = await realBackendService.createTimelineEntry(entryData);
      setTimelineEntries([newEntry, ...timelineEntries]);
      console.log('✅ Timeline entry created and saved to database!');
      return newEntry;
    } catch (error) {
      console.error('❌ Error creating timeline entry:', error);
      throw error;
    }
  };

  const updateTimelineEntry = async (id: string, entryData: any) => {
    try {
      const updatedEntry = await realBackendService.updateTimelineEntry(id, entryData);
      setTimelineEntries(timelineEntries.map(entry => 
        entry.id === id ? updatedEntry : entry
      ));
      console.log('✅ Timeline entry updated and saved to database!');
      return updatedEntry;
    } catch (error) {
      console.error('❌ Error updating timeline entry:', error);
      throw error;
    }
  };

  const deleteTimelineEntry = async (id: string) => {
    try {
      await realBackendService.deleteTimelineEntry(id);
      setTimelineEntries(timelineEntries.filter(entry => entry.id !== id));
      console.log('✅ Timeline entry deleted from database!');
    } catch (error) {
      console.error('❌ Error deleting timeline entry:', error);
    }
  };

  const addTimelineReaction = async (entryId: string, reactionType: string) => {
    try {
      await realBackendService.addTimelineReaction(entryId, reactionType);
      // Reload timeline entries to get updated reactions
      await loadTimelineEntries();
      console.log('✅ Reaction added to timeline entry!');
    } catch (error) {
      console.error('❌ Error adding reaction:', error);
    }
  };

  const removeTimelineReaction = async (entryId: string, reactionType: string) => {
    try {
      await realBackendService.removeTimelineReaction(entryId, reactionType);
      // Reload timeline entries to get updated reactions
      await loadTimelineEntries();
      console.log('✅ Reaction removed from timeline entry!');
    } catch (error) {
      console.error('❌ Error removing reaction:', error);
    }
  };

  const addTimelineComment = async (entryId: string, content: string) => {
    try {
      await realBackendService.addTimelineComment(entryId, content);
      // Reload timeline entries to get updated comments
      await loadTimelineEntries();
      console.log('✅ Comment added to timeline entry!');
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    }
  };

  const updateTimelineComment = async (commentId: string, content: string) => {
    try {
      await realBackendService.updateTimelineComment(commentId, content);
      // Reload timeline entries to get updated comments
      await loadTimelineEntries();
      console.log('✅ Comment updated!');
    } catch (error) {
      console.error('❌ Error updating comment:', error);
    }
  };

  const deleteTimelineComment = async (commentId: string) => {
    try {
      await realBackendService.deleteTimelineComment(commentId);
      // Reload timeline entries to get updated comments
      await loadTimelineEntries();
      console.log('✅ Comment deleted!');
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
    }
  };

  // =============================================
  // STREAK MANAGEMENT - BULLETPROOF SYSTEM
  // =============================================

  const loadStreak = async () => {
    try {
      const streakData = await realBackendService.getStreak();
      setStreak(streakData);
      console.log('✅ Streak loaded from database!');
    } catch (error) {
      console.error('❌ Error loading streak:', error);
    }
  };

  const clickStreak = async () => {
    if (streakLoading) return;
    
    setStreakLoading(true);
    try {
      const result = await realBackendService.clickStreak();
      setStreak(result.streak);
      
      // Show success message with animation
      if (result.reward) {
        alert(`🎉 ${result.reward}\n${result.message}`);
      } else {
        alert(result.message);
      }
      
      console.log('✅ Streak clicked and saved to database!');
    } catch (error) {
      console.error('❌ Error clicking streak:', error);
      if (error.message && error.message.includes('Already clicked today')) {
        alert('You have already recorded your streak for today! 🔥');
      } else {
        alert('Failed to record streak. Please try again.');
      }
    } finally {
      setStreakLoading(false);
    }
  };

  const getStreakStatus = () => {
    if (!streak) return { canClick: false, message: 'Loading...' };
    
    const today = new Date().toISOString().split('T')[0];
    const lastClickDate = streak.last_click_date ? streak.last_click_date.split('T')[0] : null;
    
    if (lastClickDate === today) {
      return { canClick: false, message: 'Already clicked today! 🔥' };
    }
    
    return { canClick: true, message: 'Click to record your streak!' };
  };

  const addTask = async () => {
    try {
      const newTask = await realBackendService.createTask({
        name: newItem.title || 'New task',
        description: newItem.description || '',
        priority: newItem.priority || 'Medium',
        due_date: newItem.dueDate || null,
        due_time: newItem.dueTime || null,
        status: 'pending',
        money_required: newItem.moneyRequired || null,
        currency: newItem.currency || 'USD',
        assigned_to: newItem.assignedTo || null,
        assigned_by: newItem.assignedBy || null
      });
      
      console.log('📋 Enhanced task created:', newTask);
      
      // Update local state with the created task from database
      setTasks([{
        id: newTask.id,
        title: newTask.name, // Map name to title for UI compatibility
        name: newTask.name,
        description: newTask.description,
        completed: newTask.status === 'completed',
        priority: newTask.priority,
        dueDate: newTask.due_date,
        dueTime: newTask.due_time,
        status: newTask.status,
        moneyRequired: newTask.money_required,
        currency: newTask.currency,
        assignedTo: newTask.assigned_to,
        assignedBy: newTask.assigned_by,
        category: newTask.priority
      }, ...tasks]);
      
      setNewItem({ title: '', description: '', category: '', priority: 'medium', amount: '', type: 'expense', dueDate: '', dueTime: '', moneyRequired: '', currency: 'USD', assignedTo: '', assignedBy: '', expirationDays: '', maxUses: '', timelineContent: '', timelineVisibility: 'private' });
      setShowAddModal(false);
      console.log('✅ Enhanced task added and saved to database!');
    } catch (error) {
      console.error('❌ Error adding enhanced task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  // Bucket List Management
  const toggleBucketItem = async (id: number) => {
    try {
      await realBackendService.toggleBucketItem(id.toString());
      setBucketList(bucketList.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      ));
    } catch (error) {
      console.error('Error toggling bucket item:', error);
    }
  };

  const addBucketItem = async () => {
    try {
      const newBucketItem = {
        title: newItem.title || 'New bucket list item',
        description: newItem.description || '',
        completed: false,
        priority: newItem.priority,
        target_date: new Date().toISOString().split('T')[0]
      };
      
      const createdItem = await realBackendService.createBucketItem(newBucketItem);
      setBucketList([...bucketList, { ...createdItem, id: createdItem.id }]);
      setNewItem({ title: '', description: '', category: '', priority: 'medium', amount: '', type: 'expense', dueDate: '', dueTime: '', moneyRequired: '', currency: 'USD', assignedTo: '', assignedBy: '', expirationDays: '', maxUses: '', timelineContent: '', timelineVisibility: 'private' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding bucket item:', error);
    }
  };

  const deleteBucketItem = async (id: number) => {
    try {
      await realBackendService.deleteBucketItem(id.toString());
      setBucketList(bucketList.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting bucket item:', error);
    }
  };

  // Finance Management
  const addFinanceItem = () => {
    const newFinanceItem = {
      id: Date.now(),
      title: newItem.title || 'New transaction',
      amount: parseFloat(newItem.amount) || 0,
      category: newItem.category || 'Other',
      date: new Date().toISOString().split('T')[0],
      type: newItem.type
    };
    setExpenses([...expenses, newFinanceItem]);
    setNewItem({ title: '', description: '', category: '', priority: 'medium', amount: '', type: 'expense', dueDate: '', dueTime: '', moneyRequired: '', currency: 'USD', assignedTo: '', assignedBy: '', expirationDays: '', maxUses: '', timelineContent: '', timelineVisibility: 'private' });
    setShowAddModal(false);
  };

  // Notes Management - BULLETPROOF DATABASE PERSISTENCE
  const addNote = async () => {
    try {
      const newNote = {
        title: newItem.title || 'New note',
        content: newItem.description || '',
        description: newItem.description || '', // Add description field
        category: newItem.category || 'general',
        starred: false
      };
      
      console.log('📝 Creating note in database:', newNote);
      const createdNote = await realBackendService.createNote(newNote);
      
      // Update local state with the created note from database
      setNotes([...notes, {
        id: createdNote.id,
        title: createdNote.title,
        content: createdNote.content,
        description: createdNote.description, // Add description field
        category: createdNote.category,
        starred: createdNote.starred,
        createdAt: createdNote.created_at
      }]);
      
      setNewItem({ title: '', description: '', category: '', priority: 'medium', amount: '', type: 'expense', dueDate: '', dueTime: '', moneyRequired: '', currency: 'USD', assignedTo: '', assignedBy: '', expirationDays: '', maxUses: '', timelineContent: '', timelineVisibility: 'private' });
      setShowAddModal(false);
      console.log('✅ Note created and saved to database!');
    } catch (error) {
      console.error('❌ Error creating note:', error);
      alert('Failed to create note. Please try again.');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      console.log(`📝 Deleting note ${noteId} from database`);
      await realBackendService.deleteNote(noteId);
      
      // Update local state
      setNotes(notes.filter(note => note.id !== noteId));
      console.log('✅ Note deleted from database!');
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  // Timeline Management - BULLETPROOF SYSTEM
  const addTimelineEvent = async () => {
    try {
      const newEntry = await createTimelineEntry({
        title: newItem.title || 'New timeline entry',
        content: newItem.timelineContent || '',
        visibility: newItem.timelineVisibility || 'private'
      });
      setNewItem({ title: '', description: '', category: '', priority: 'medium', amount: '', type: 'expense', dueDate: '', dueTime: '', moneyRequired: '', currency: 'USD', assignedTo: '', assignedBy: '', expirationDays: '', maxUses: '', timelineContent: '', timelineVisibility: 'private' });
      setShowAddModal(false);
      console.log('✅ Timeline entry created and saved to database!');
    } catch (error) {
      console.error('❌ Error creating timeline entry:', error);
      alert('Failed to create timeline entry. Please try again.');
    }
  };

  // Calculate totals
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completedBucketItems = bucketList.filter(b => b.completed).length;

  // Finance System Functions
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥'
    };
    return symbols[currency] || currency;
  };

  const filteredFinanceTransactions = financeTransactions.filter(transaction => {
    if (financeFilter === 'all') return true;
    return transaction.type === financeFilter;
  });

  // Finance Management Functions with REAL Currency Conversion for Two-Person System
  const loadFinanceData = async () => {
    try {
      console.log(`💱 Loading finance data for ${currentPerson} with display currency: ${displayCurrency}`);
      
      // Get all transactions for current person (without conversion first)
      const transactions = await realBackendService.getFinanceTransactions('USD', currentPerson);
      console.log(`💰 Raw transactions for ${currentPerson}:`, transactions);
      
      // Convert each transaction to display currency using REAL API
      const convertedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          if (transaction.currency === displayCurrency) {
            return {
              ...transaction,
              converted_amount: transaction.amount,
              original_amount: transaction.amount,
              original_currency: transaction.currency,
              display_currency: displayCurrency
            };
          }
          
          try {
            console.log(`💱 Converting ${transaction.amount} ${transaction.currency} → ${displayCurrency}`);
            const conversion = await realBackendService.convertCurrency(
              parseFloat(transaction.amount),
              transaction.currency,
              displayCurrency
            );
            
            console.log(`💱 Conversion result:`, conversion);
            
            return {
              ...transaction,
              converted_amount: conversion.converted,
              original_amount: transaction.amount,
              original_currency: transaction.currency,
              display_currency: displayCurrency,
              conversion_rate: conversion.rate,
              last_updated: conversion.last_updated,
              source: conversion.source
            };
          } catch (conversionError) {
            console.error(`❌ Conversion failed for ${transaction.currency} → ${displayCurrency}:`, conversionError);
            // Fallback to original amount
            return {
              ...transaction,
              converted_amount: transaction.amount,
              original_amount: transaction.amount,
              original_currency: transaction.currency,
              display_currency: displayCurrency
            };
          }
        })
      );
      
      console.log('💰 Converted transactions:', convertedTransactions);
      setFinanceTransactions(convertedTransactions);
      
      // Calculate summary with converted amounts
      const incomeTotal = convertedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.converted_amount || t.amount), 0);
      
      const expenseTotal = convertedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.converted_amount || t.amount), 0);
      
      const balance = incomeTotal - expenseTotal;
      
      setFinanceSummary({
        income: { total: incomeTotal, count: convertedTransactions.filter(t => t.type === 'income').length, currency: displayCurrency },
        expense: { total: expenseTotal, count: convertedTransactions.filter(t => t.type === 'expense').length, currency: displayCurrency },
        balance: balance
      });
      
      console.log(`💰 Finance summary updated for ${currentPerson}:`, {
        income: incomeTotal,
        expense: expenseTotal,
        balance: balance,
        currency: displayCurrency,
        person: currentPerson
      });
      
    } catch (error) {
      console.error('❌ Error loading finance data:', error);
    }
  };

  const addFinanceTransaction = async () => {
    try {
      const newTransaction = await realBackendService.createFinanceTransaction({
        title: newItem.title || 'New Transaction',
        amount: parseFloat(newItem.amount) || 0,
        currency: newItem.currency || 'USD',
        category: newItem.category || 'General',
        date: newItem.dueDate || new Date().toISOString().split('T')[0],
        type: newItem.type as 'income' | 'expense',
        person: currentPerson
      });
      
      setFinanceTransactions([newTransaction, ...financeTransactions]);
      await loadFinanceData(); // Refresh summary
      setNewItem({ title: '', description: '', category: '', priority: 'medium', amount: '', type: 'expense', dueDate: '', dueTime: '', moneyRequired: '', currency: 'USD', assignedTo: '', assignedBy: '', expirationDays: '', maxUses: '', timelineContent: '', timelineVisibility: 'private' });
      setShowAddModal(false);
      console.log('✅ Finance transaction created and saved to database!');
    } catch (error) {
      console.error('❌ Error creating finance transaction:', error);
      alert('Failed to create finance transaction. Please try again.');
    }
  };

  const deleteFinanceTransaction = async (id: number) => {
    try {
      await realBackendService.deleteFinanceTransaction(id);
      setFinanceTransactions(financeTransactions.filter(t => t.id !== id));
      await loadFinanceData(); // Refresh summary
      console.log('✅ Finance transaction deleted from database!');
    } catch (error) {
      console.error('❌ Error deleting finance transaction:', error);
      alert('Failed to delete finance transaction. Please try again.');
    }
  };

  // Person Name Management Functions
  const startEditingPerson = (personKey: string) => {
    setEditingPerson(personKey);
    setEditPersonName(personNames[personKey]?.name || '');
  };

  const savePersonName = async (personKey: string) => {
    try {
      if (!editPersonName.trim()) return;
      
      await realBackendService.updatePerson(personKey, editPersonName.trim());
      setPersonNames(prev => ({
        ...prev,
        [personKey]: { ...prev[personKey], name: editPersonName.trim() }
      }));
      setEditingPerson(null);
      setEditPersonName('');
      console.log(`✅ Person ${personKey} name updated to: ${editPersonName.trim()}`);
    } catch (error) {
      console.error('❌ Error updating person name:', error);
    }
  };

  const cancelEditingPerson = () => {
    setEditingPerson(null);
    setEditPersonName('');
  };

  // Dashboard logic - get today's and tomorrow's items
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const todayDate = getTodayDate();
  const tomorrowDate = getTomorrowDate();

  // Filter items due today
  const todayTasks = tasks.filter(task => task.dueDate === todayDate && !task.completed);
  const todayBucketItems = bucketList.filter(item => item.targetDate === todayDate && !item.completed);
  const todayExpenses = expenses.filter(expense => expense.date === todayDate);

  // Filter items due tomorrow
  const tomorrowTasks = tasks.filter(task => task.dueDate === tomorrowDate && !task.completed);
  const tomorrowBucketItems = bucketList.filter(item => item.targetDate === tomorrowDate && !item.completed);
  const tomorrowExpenses = expenses.filter(expense => expense.date === tomorrowDate);

  // Get recent timeline events (last 7 days)
  const recentTimeline = timeline.filter(event => {
    const eventDate = new Date(event.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return eventDate >= sevenDaysAgo;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get starred notes
  const starredNotes = notes.filter(note => note.starred);

  // Neumorphic styles based on theme
  const getNeumorphicStyles = () => {
    if (isDarkMode) {
      return {
        background: 'bg-gray-900',
        card: 'bg-gray-800 shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(255,255,255,0.1)]',
        cardPressed: 'bg-gray-800 shadow-[inset_12px_12px_24px_rgba(0,0,0,0.5),inset_-12px_-12px_24px_rgba(255,255,255,0.1)]',
        text: 'text-gray-50',
        textSecondary: 'text-gray-200',
        textMuted: 'text-gray-400',
        border: 'border-gray-700',
        input: 'bg-gray-800 border-gray-700 text-gray-50 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),inset_-6px_-6px_12px_rgba(255,255,255,0.1)]',
        button: 'bg-gray-800 text-gray-50 shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(255,255,255,0.1)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.5),-8px_-8px_16px_rgba(255,255,255,0.1)]',
        buttonPressed: 'bg-gray-800 text-gray-50 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),inset_-6px_-6px_12px_rgba(255,255,255,0.1)]',
        accent: 'bg-blue-600 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(255,255,255,0.1)]',
        gradient: 'bg-gradient-to-br from-gray-800 to-gray-900'
      };
    } else {
      return {
        background: 'bg-gray-100',
        card: 'bg-gray-100 shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)]',
        cardPressed: 'bg-gray-100 shadow-[inset_12px_12px_24px_rgba(0,0,0,0.15),inset_-12px_-12px_24px_rgba(255,255,255,0.9)]',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        textMuted: 'text-gray-500',
        border: 'border-gray-200',
        input: 'bg-gray-100 border-gray-200 text-gray-900 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]',
        button: 'bg-gray-100 text-gray-900 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.9)]',
        buttonPressed: 'bg-gray-100 text-gray-900 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]',
        accent: 'bg-blue-600 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]',
        gradient: 'bg-gradient-to-br from-gray-100 to-gray-200'
      };
    }
  };

  const styles = getNeumorphicStyles();

  return (
    <div className={`min-h-screen transition-all duration-300 ${styles.background}`}>
      {/* Professional Header */}
      <header className={`${styles.card} border-b ${styles.border} transition-all duration-300 sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and App Name - Clickable to Dashboard */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-3 hover:scale-105 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${styles.card} rounded-2xl flex items-center justify-center transition-all duration-300`}>
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h1 className={`text-xl font-bold ${styles.text} transition-all duration-300`}>Bondly Glow</h1>
                <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>Partnership App</p>
              </div>
            </button>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-12 h-12 ${styles.button} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105`}
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`w-12 h-12 ${styles.button} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-medium ${styles.text} transition-all duration-300`}>{user.name}</p>
                  <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>Welcome back!</p>
              </div>
                <button
                  onClick={onLogout}
                  className={`flex items-center space-x-2 px-4 py-2 ${styles.button} rounded-xl transition-all duration-300 hover:scale-105 ${styles.text}`}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed top-20 right-4 z-50 w-80 max-h-96 overflow-y-auto">
          <div className={`${styles.card} rounded-xl p-4 transition-all duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${styles.text} transition-all duration-300`}>Notifications</h3>
              <div className="flex space-x-2">
            <button
                  onClick={clearAllNotifications}
                  className={`px-3 py-1 ${styles.button} rounded-lg text-sm transition-all duration-300`}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className={`w-8 h-8 ${styles.button} rounded-lg flex items-center justify-center transition-all duration-300`}
                >
                  <X className="h-4 w-4" />
            </button>
          </div>
        </div>
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className={`${styles.textMuted} text-center py-4 transition-all duration-300`}>No notifications</p>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg transition-all duration-300 ${
                      notification.read ? styles.card : styles.button
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-sm ${styles.text} transition-all duration-300`}>
                          {notification.message}
                        </p>
                        <p className={`text-xs ${styles.textMuted} transition-all duration-300`}>
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation - Hidden on Mobile */}
      <nav className={`${styles.card} border-b ${styles.border} transition-all duration-300 hidden sm:block`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-3">
            {[
              { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              { id: 'notes', label: 'Notes', icon: StickyNote },
              { id: 'finance', label: 'Finance', icon: DollarSign },
              { id: 'bucketlist', label: 'Bucket List', icon: Star },
              { id: 'timeline', label: 'Timeline', icon: Calendar }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
            <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center transition-all duration-300 ${
                    activeTab === tab.id
                      ? `${styles.buttonPressed} ${styles.text}`
                      : `${styles.button} ${styles.textSecondary} hover:scale-105`
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.label}
            </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className={`${styles.card} rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 ${styles.text} transition-all duration-300`}>
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.name}!
                  </h1>
                  <p className={`text-sm sm:text-base lg:text-lg ${styles.textSecondary} transition-all duration-300`}>
                    Here's what's happening today and tomorrow
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${styles.text} transition-all duration-300`}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                  <p className={`text-sm sm:text-base ${styles.textSecondary} transition-all duration-300`}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Streak & Partner Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* BULLETPROOF DAILY STREAK */}
              <div className={`${styles.card} rounded-xl p-4 sm:p-6 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${styles.text} flex items-center transition-all duration-300`}>
                    <Flame className="h-5 w-5 text-orange-500 mr-2" />
                    Daily Streak
                  </h3>
                  <span className={`text-2xl font-bold text-orange-500 transition-all duration-300`}>
                    {streak ? streak.current_streak_count : 0}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                      Current: {streak ? streak.current_streak_count : 0} days
                    </p>
                    <span className="text-2xl">{streak ? streak.emoji : '🔥'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                      Best: {streak ? streak.max_streak_count : 0} days
                    </p>
                    {streak && streak.reward_earned && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {streak.reward_earned}
                      </span>
                    )}
                  </div>
                  
                  {streak && (
                    <div className="text-xs text-gray-500">
                      Last clicked: {new Date(streak.last_click_date).toLocaleDateString()}
                    </div>
                  )}
                  
                <button
                    onClick={clickStreak}
                    disabled={streakLoading || !getStreakStatus().canClick}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      getStreakStatus().canClick && !streakLoading
                        ? `${styles.accent} hover:scale-105`
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {streakLoading ? 'Recording...' : getStreakStatus().message}
                </button>
                </div>
              </div>

              {/* Partner Status */}
              <div className={`${styles.card} rounded-xl p-4 sm:p-6 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${styles.text} flex items-center transition-all duration-300`}>
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    Partnership
                  </h3>
                  <span className={`text-sm ${partner ? 'text-green-500' : 'text-gray-500'} transition-all duration-300`}>
                    {partner ? 'Connected' : 'Solo'}
                  </span>
                </div>
                <div className="space-y-2">
                  {partner ? (
                    <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                      Partner: {partner.name}
                    </p>
                  ) : (
                    <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                      Invite a partner to collaborate
                    </p>
                  )}
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className={`w-full ${styles.button} py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{partner ? 'Manage Partner' : 'Invite Partner'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Today's Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Today's Tasks */}
              <div className={`${styles.card} rounded-xl p-4 sm:p-6 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${styles.text} flex items-center transition-all duration-300`}>
                    <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
                    Today's Tasks
                  </h3>
                  <span className={`${styles.button} text-sm font-medium px-3 py-1 rounded-full transition-all duration-300`}>
                    {todayTasks.length}
                  </span>
              </div>
              <div className="space-y-3">
                  {todayTasks.length === 0 ? (
                    <p className={`${styles.textMuted} text-sm transition-all duration-300`}>No tasks due today</p>
                  ) : (
                    todayTasks.map(task => (
                      <div key={task.id} className={`flex items-center space-x-3 p-3 ${styles.card} rounded-lg transition-all duration-300`}>
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-6 h-6 rounded-xl ${styles.button} flex items-center justify-center transition-all duration-300 hover:scale-105`}
                        >
                          {task.completed && <CheckCircle className="h-3 w-3" />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${styles.text} transition-all duration-300`}>{task.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${styles.button} ${
                              task.priority === 'high' ? 'text-red-600' :
                              task.priority === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`text-xs ${styles.textMuted} transition-all duration-300`}>{task.category}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Today's Bucket List */}
              <div className={`${styles.card} rounded-xl p-4 sm:p-6 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${styles.text} flex items-center transition-all duration-300`}>
                    <Star className="h-5 w-5 text-yellow-600 mr-2" />
                    Today's Goals
                  </h3>
                  <span className={`${styles.button} text-sm font-medium px-3 py-1 rounded-full transition-all duration-300`}>
                    {todayBucketItems.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {todayBucketItems.length === 0 ? (
                    <p className={`${styles.textMuted} text-sm transition-all duration-300`}>No goals due today</p>
                  ) : (
                    todayBucketItems.map(item => (
                      <div key={item.id} className={`flex items-center space-x-3 p-3 ${styles.card} rounded-lg transition-all duration-300`}>
                        <button
                          onClick={() => toggleBucketItem(item.id)}
                          className={`w-6 h-6 rounded-xl ${styles.button} flex items-center justify-center transition-all duration-300 hover:scale-105`}
                        >
                          {item.completed && <CheckCircle className="h-3 w-3" />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${styles.text} transition-all duration-300`}>{item.title}</p>
                          <p className={`text-sm ${styles.textSecondary} mt-1 transition-all duration-300`}>{item.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Today's Expenses */}
              <div className={`${styles.card} rounded-xl p-4 sm:p-6 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${styles.text} flex items-center transition-all duration-300`}>
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    Today's Expenses
                  </h3>
                  <span className={`${styles.button} text-sm font-medium px-3 py-1 rounded-full transition-all duration-300`}>
                    {todayExpenses.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {todayExpenses.length === 0 ? (
                    <p className={`${styles.textMuted} text-sm transition-all duration-300`}>No expenses today</p>
                  ) : (
                    todayExpenses.map(expense => (
                      <div key={expense.id} className={`flex justify-between items-center p-3 ${styles.card} rounded-lg transition-all duration-300`}>
                        <div>
                          <p className={`font-medium ${styles.text} transition-all duration-300`}>{expense.title}</p>
                          <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>{expense.category}</p>
                        </div>
                        <span className={`font-semibold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {expense.type === 'income' ? '+' : '-'}${expense.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Tomorrow's Preview - REDESIGNED */}
            <div className={`${styles.card} rounded-xl p-6 transition-all duration-300 border-l-4 border-indigo-500`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${styles.text} flex items-center transition-all duration-300`}>
                  <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                  Tomorrow's Preview
                </h3>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                  {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-3">
                {tomorrowTasks.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckSquare className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-blue-800">Tasks Due</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{tomorrowTasks.length}</span>
                  </div>
                )}
                {tomorrowBucketItems.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-600 mr-3" />
                      <span className="text-sm font-medium text-yellow-800">Goals Due</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{tomorrowBucketItems.length}</span>
                  </div>
                )}
                {tomorrowExpenses.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-green-800">Expenses</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{tomorrowExpenses.length}</span>
                  </div>
                )}
                {tomorrowTasks.length === 0 && tomorrowBucketItems.length === 0 && tomorrowExpenses.length === 0 && (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No items scheduled for tomorrow</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Timeline */}
              <div className={`${styles.card} rounded-xl p-4 sm:p-6 transition-all duration-300`}>
                <h3 className={`text-lg font-semibold ${styles.text} mb-4 flex items-center transition-all duration-300`}>
                  <Clock className="h-5 w-5 text-purple-600 mr-2" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentTimeline.slice(0, 3).map(event => (
                    <div key={event.id} className={`flex items-start space-x-3 p-3 ${styles.card} rounded-lg transition-all duration-300`}>
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        event.type === 'milestone' ? 'bg-blue-500' :
                        event.type === 'celebration' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className={`font-medium ${styles.text} transition-all duration-300`}>{event.title}</p>
                        <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>{event.description}</p>
                        <p className={`text-xs ${styles.textMuted} mt-1 transition-all duration-300`}>{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Starred Notes */}
              <div className={`${styles.card} rounded-xl p-4 sm:p-6 transition-all duration-300`}>
                <h3 className={`text-lg font-semibold ${styles.text} mb-4 flex items-center transition-all duration-300`}>
                  <StickyNote className="h-5 w-5 text-purple-600 mr-2" />
                  Important Notes
                </h3>
                <div className="space-y-3">
                  {starredNotes.slice(0, 3).map(note => (
                    <div key={note.id} className={`p-3 ${styles.card} rounded-lg transition-all duration-300`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className={`font-medium ${styles.text} transition-all duration-300`}>{note.title}</h4>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>{note.content}</p>
                      <p className={`text-xs ${styles.textMuted} mt-1 transition-all duration-300`}>{note.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions - REDESIGNED */}
            <div className={`${styles.card} rounded-xl p-6 transition-all duration-300 border-t-4 border-blue-500`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${styles.text} flex items-center transition-all duration-300`}>
                  <Zap className="h-5 w-5 text-blue-600 mr-2" />
                  Quick Actions
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Fast Add
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  onClick={() => { setActiveTab('tasks'); setShowAddModal(true); }}
                  className={`flex items-center p-4 ${styles.button} rounded-xl hover:scale-105 transition-all duration-300 border-l-4 border-blue-500`}
                >
                  <CheckSquare className="h-5 w-5 text-blue-600 mr-3" />
                  <div className="text-left">
                    <span className={`text-sm font-medium ${styles.text} block`}>Add Task</span>
                    <span className="text-xs text-gray-500">Create new task</span>
                  </div>
                </button>
                <button
                  onClick={() => { setActiveTab('notes'); setShowAddModal(true); }}
                  className={`flex items-center p-4 ${styles.button} rounded-xl hover:scale-105 transition-all duration-300 border-l-4 border-purple-500`}
                >
                  <StickyNote className="h-5 w-5 text-purple-600 mr-3" />
                  <div className="text-left">
                    <span className={`text-sm font-medium ${styles.text} block`}>Add Note</span>
                    <span className="text-xs text-gray-500">Write note</span>
                  </div>
                </button>
                <button
                  onClick={() => { setActiveTab('finance'); setShowAddModal(true); }}
                  className={`flex items-center p-4 ${styles.button} rounded-xl hover:scale-105 transition-all duration-300 border-l-4 border-green-500`}
                >
                  <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                  <div className="text-left">
                    <span className={`text-sm font-medium ${styles.text} block`}>Add Expense</span>
                    <span className="text-xs text-gray-500">Track spending</span>
                  </div>
                </button>
                <button
                  onClick={() => { setActiveTab('bucketlist'); setShowAddModal(true); }}
                  className={`flex items-center p-4 ${styles.button} rounded-xl hover:scale-105 transition-all duration-300 border-l-4 border-yellow-500`}
                >
                  <Star className="h-5 w-5 text-yellow-600 mr-3" />
                  <div className="text-left">
                    <span className={`text-sm font-medium ${styles.text} block`}>Add Goal</span>
                    <span className="text-xs text-gray-500">Set target</span>
                  </div>
                </button>
                <button
                  onClick={() => { setActiveTab('timeline'); setShowAddModal(true); }}
                  className={`flex items-center p-4 ${styles.button} rounded-xl hover:scale-105 transition-all duration-300 border-l-4 border-indigo-500`}
                >
                  <Calendar className="h-5 w-5 text-indigo-600 mr-3" />
                  <div className="text-left">
                    <span className={`text-sm font-medium ${styles.text} block`}>Add Event</span>
                    <span className="text-xs text-gray-500">Log activity</span>
                  </div>
                </button>
                <button
                  onClick={() => { setShowInviteModal(true); }}
                  className={`flex items-center p-4 ${styles.button} rounded-xl hover:scale-105 transition-all duration-300 border-l-4 border-pink-500`}
                >
                  <UserPlus className="h-5 w-5 text-pink-600 mr-3" />
                  <div className="text-left">
                    <span className={`text-sm font-medium ${styles.text} block`}>Invite Partner</span>
                    <span className="text-xs text-gray-500">Share access</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Partnership Suggestions */}
            <div className={`${styles.card} rounded-xl p-4 sm:p-6 transition-all duration-300`}>
              <h3 className={`text-lg font-semibold ${styles.text} mb-4 flex items-center transition-all duration-300`}>
                <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                Partnership Suggestions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className={`${styles.button} p-4 rounded-lg transition-all duration-300`}>
                  <h4 className={`font-medium ${styles.text} mb-2 transition-all duration-300`}>💝 Shared Goals</h4>
                  <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                    Set mutual bucket list items and track progress together
                  </p>
                </div>
                <div className={`${styles.button} p-4 rounded-lg transition-all duration-300`}>
                  <h4 className={`font-medium ${styles.text} mb-2 transition-all duration-300`}>💰 Split Expenses</h4>
                  <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                    Track shared expenses and automatically split costs
                  </p>
                </div>
                <div className={`${styles.button} p-4 rounded-lg transition-all duration-300`}>
                  <h4 className={`font-medium ${styles.text} mb-2 transition-all duration-300`}>📅 Date Planning</h4>
                  <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                    Plan dates and special occasions together
                  </p>
                </div>
                <div className={`${styles.button} p-4 rounded-lg transition-all duration-300`}>
                  <h4 className={`font-medium ${styles.text} mb-2 transition-all duration-300`}>🎯 Challenge Mode</h4>
                  <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                    Create friendly competitions and challenges
                  </p>
                </div>
                <div className={`${styles.button} p-4 rounded-lg transition-all duration-300`}>
                  <h4 className={`font-medium ${styles.text} mb-2 transition-all duration-300`}>📊 Progress Reports</h4>
                  <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                    Weekly reports on shared achievements
                  </p>
                </div>
                <div className={`${styles.button} p-4 rounded-lg transition-all duration-300`}>
                  <h4 className={`font-medium ${styles.text} mb-2 transition-all duration-300`}>🎁 Surprise Features</h4>
                  <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                    Secret notes and surprise planning tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <h2 className={`text-xl sm:text-2xl font-bold ${styles.text} transition-all duration-300`}>Tasks & Goals</h2>
              <button
                onClick={() => { setActiveTab('tasks'); setShowAddModal(true); }}
                className={`${styles.accent} px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2`}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm sm:text-base">Add Task</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {tasks.map(task => (
                <div key={task.id} className={`${styles.card} rounded-xl p-4 sm:p-6 transition-all duration-300`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-xl flex items-center justify-center mt-1 transition-all duration-300 ${
                        task.completed 
                          ? `${styles.accent}` 
                          : `${styles.button} hover:scale-105`
                      }`}
                    >
                      {task.completed && (
                          <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold transition-all duration-300 ${task.completed ? `line-through ${styles.textMuted}` : styles.text}`}>
                      {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-sm ${styles.textSecondary} mt-1 transition-all duration-300`}>{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.button} ${
                            task.priority === 'High' ? 'text-red-600' :
                            task.priority === 'Medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {task.priority}
                    </span>
                          {task.dueDate && (
                            <span className={`text-xs px-2 py-1 rounded-full ${styles.button} transition-all duration-300`}>
                              📅 {task.dueDate}
                            </span>
                          )}
                          {task.dueTime && (
                            <span className={`text-xs px-2 py-1 rounded-full ${styles.button} transition-all duration-300`}>
                              🕐 {task.dueTime}
                            </span>
                          )}
                          {task.moneyRequired && (
                            <span className={`text-xs px-2 py-1 rounded-full ${styles.button} transition-all duration-300`}>
                              💰 {task.moneyRequired} {task.currency}
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className={`text-xs px-2 py-1 rounded-full ${styles.button} transition-all duration-300`}>
                              👤 {task.assignedTo}
                            </span>
                          )}
                  </div>
              </div>
            </div>
          </div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${styles.text} transition-all duration-300`}>Notes & Ideas</h2>
              <button
                onClick={() => { setActiveTab('notes'); setShowAddModal(true); }}
                className={`${styles.accent} px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2`}
              >
                <Plus className="h-4 w-4" />
                <span>Add Note</span>
              </button>
          </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {notes.map(note => (
                <div key={note.id} className={`${styles.card} rounded-xl p-6 transition-all duration-300`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-lg font-semibold ${styles.text} transition-all duration-300`}>{note.title}</h3>
                        {note.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      <p className={`${styles.textSecondary} mt-2 transition-all duration-300`}>{note.content}</p>
                      {note.description && (
                        <p className={`${styles.textMuted} mt-1 text-sm transition-all duration-300`}>
                          <strong>Description:</strong> {note.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`px-2 py-1 ${styles.button} rounded-full text-xs font-medium transition-all duration-300`}>
                          {note.category}
                        </span>
                        <span className={`text-sm ${styles.textMuted} transition-all duration-300`}>{note.createdAt}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className={`${styles.button} p-2 rounded-xl hover:scale-105 transition-all duration-300 ml-2`}
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Professional Finance Tab */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            {/* Finance Header with Person Switcher - Mobile Optimized */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-lg sm:text-xl font-bold ${styles.text} transition-all duration-300`}>Finance</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className={`px-3 py-2 ${styles.accent} rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300`}
                >
                  + Add
                </button>
              </div>
              
              {/* Person Switcher - Mobile Optimized */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${styles.textSecondary} transition-all duration-300`}>View:</span>
                  
                  {/* Person 1 Button */}
                  <div className="flex items-center space-x-1">
                    {editingPerson === 'person1' ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={editPersonName}
                          onChange={(e) => setEditPersonName(e.target.value)}
                          className={`px-2 py-1 text-xs rounded ${styles.input} transition-all duration-300 w-20`}
                          placeholder="Name"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && savePersonName('person1')}
                        />
                        <button
                          onClick={() => savePersonName('person1')}
                          className="px-1 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-all duration-300"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEditingPerson}
                          className="px-1 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-all duration-300"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCurrentPerson('person1')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
                          currentPerson === 'person1' 
                            ? 'bg-blue-600 text-white' 
                            : `${styles.button} hover:scale-105`
                        }`}
                      >
                        {personNames.person1?.name || 'Person 1'}
                      </button>
                    )}
                    <button
                      onClick={() => startEditingPerson('person1')}
                      className="px-1 py-1 text-gray-500 hover:text-gray-700 transition-all duration-300 text-xs"
                      title="Edit name"
                    >
                      ✏️
                    </button>
                  </div>
                  
                  {/* Person 2 Button */}
                  <div className="flex items-center space-x-1">
                    {editingPerson === 'person2' ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={editPersonName}
                          onChange={(e) => setEditPersonName(e.target.value)}
                          className={`px-2 py-1 text-xs rounded ${styles.input} transition-all duration-300 w-20`}
                          placeholder="Name"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && savePersonName('person2')}
                        />
                        <button
                          onClick={() => savePersonName('person2')}
                          className="px-1 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-all duration-300"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEditingPerson}
                          className="px-1 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-all duration-300"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCurrentPerson('person2')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
                          currentPerson === 'person2' 
                            ? 'bg-blue-600 text-white' 
                            : `${styles.button} hover:scale-105`
                        }`}
                      >
                        {personNames.person2?.name || 'Person 2'}
                      </button>
                    )}
                    <button
                      onClick={() => startEditingPerson('person2')}
                      className="px-1 py-1 text-gray-500 hover:text-gray-700 transition-all duration-300 text-xs"
                      title="Edit name"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
                
                {/* Currency Selector - Mobile Optimized */}
                <select
                  value={displayCurrency}
                  onChange={(e) => setDisplayCurrency(e.target.value)}
                  className={`px-2 py-1 text-xs rounded ${styles.input} transition-all duration-300`}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
            {/* Filter Selector - Mobile Optimized */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${styles.textSecondary} transition-all duration-300`}>Filter:</span>
                <select
                  value={financeFilter}
                  onChange={(e) => setFinanceFilter(e.target.value)}
                  className={`px-2 py-1 text-xs rounded ${styles.input} transition-all duration-300`}
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expenses</option>
                </select>
              </div>
            </div>

            {/* Finance Summary Cards - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-3">
              {/* Income */}
              <div className={`${styles.card} p-3 rounded-lg transition-all duration-300`}>
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className={`text-xs font-medium ${styles.textSecondary} transition-all duration-300`}>Income</span>
                </div>
                <p className={`text-lg font-bold text-green-600 transition-all duration-300`}>
                  {getCurrencySymbol(displayCurrency)}{financeSummary.income.total.toFixed(0)}
                </p>
                <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>
                  {financeSummary.income.count} txns
                </p>
              </div>

              {/* Expenses */}
              <div className={`${styles.card} p-3 rounded-lg transition-all duration-300`}>
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className={`text-xs font-medium ${styles.textSecondary} transition-all duration-300`}>Expenses</span>
                </div>
                <p className={`text-lg font-bold text-red-600 transition-all duration-300`}>
                  {getCurrencySymbol(displayCurrency)}{financeSummary.expense.total.toFixed(0)}
                </p>
                <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>
                  {financeSummary.expense.count} txns
                </p>
              </div>

              {/* Balance */}
              <div className={`${styles.card} p-3 rounded-lg transition-all duration-300 col-span-2`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span className={`text-xs font-medium ${styles.textSecondary} transition-all duration-300`}>Balance</span>
                    </div>
                    <p className={`text-xl font-bold ${financeSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'} transition-all duration-300`}>
                      {getCurrencySymbol(displayCurrency)}{financeSummary.balance.toFixed(0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>
                      {displayCurrency}
                    </p>
                    <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>
                      {financeSummary.balance >= 0 ? 'Positive' : 'Negative'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions List - Mobile Optimized */}
            <div className={`${styles.card} rounded-lg p-4 transition-all duration-300`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-base font-semibold ${styles.text} transition-all duration-300`}>Transactions</h3>
              </div>
              
              <div className="space-y-3">
                {filteredFinanceTransactions.map(transaction => (
                  <div key={transaction.id} className={`flex justify-between items-center p-3 ${styles.card} rounded-lg transition-all duration-300`}>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${styles.text} transition-all duration-300 truncate`}>{transaction.title}</p>
                        <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className={`text-sm font-bold transition-all duration-300 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{getCurrencySymbol(displayCurrency)}
                          {transaction.converted_amount || transaction.amount}
                        </p>
                        <p className={`text-xs ${styles.textMuted} transition-all duration-300`}>
                          {transaction.currency}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteFinanceTransaction(transaction.id)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-all duration-300 flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredFinanceTransactions.length === 0 && (
                  <div className="text-center py-6">
                    <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className={`text-sm ${styles.textSecondary} transition-all duration-300`}>
                      No transactions found
                    </p>
              </div>
                )}
            </div>
            </div>
          </div>
        )}

        {/* Bucket List Tab */}
        {activeTab === 'bucketlist' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${styles.text} transition-all duration-300`}>Bucket List</h2>
              <button
                onClick={() => { setActiveTab('bucketlist'); setShowAddModal(true); }}
                className={`${styles.accent} px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2`}
              >
                <Plus className="h-4 w-4" />
                <span>Add Goal</span>
              </button>
                </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {bucketList.map(item => (
                <div key={item.id} className={`${styles.card} rounded-xl p-6 transition-all duration-300`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleBucketItem(item.id)}
                        className={`w-6 h-6 rounded-xl flex items-center justify-center mt-1 transition-all duration-300 ${
                          item.completed 
                            ? styles.accent
                            : `${styles.button} hover:scale-105`
                        }`}
                      >
                        {item.completed && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold transition-all duration-300 ${item.completed ? `line-through ${styles.textMuted}` : styles.text}`}>
                          {item.title}
              </h3>
                        <p className={`${styles.textSecondary} mt-1 transition-all duration-300`}>{item.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.button} ${
                            item.priority === 'high' ? 'text-red-600' :
                            item.priority === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {item.priority}
                          </span>
                          <span className={`text-sm ${styles.textMuted} transition-all duration-300`}>Target: {item.targetDate}</span>
                    </div>
              </div>
            </div>
                    <button
                      onClick={() => deleteBucketItem(item.id)}
                      className={`${styles.button} p-2 rounded-xl hover:scale-105 transition-all duration-300`}
                      title="Delete goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
          </div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${styles.text} transition-all duration-300`}>Our Timeline</h2>
              <button
                onClick={() => { setActiveTab('timeline'); setShowAddModal(true); }}
                className={`${styles.accent} px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2`}
              >
                <Plus className="h-4 w-4" />
                <span>Add Event</span>
              </button>
                </div>
            
            <div className="space-y-4">
              {timelineEntries.map(entry => (
                <div key={entry.id} className={`${styles.card} rounded-xl p-6 transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-lg font-semibold ${styles.text} transition-all duration-300`}>{entry.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.visibility === 'public' ? 'bg-green-100 text-green-800' :
                          entry.visibility === 'private' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        } transition-all duration-300`}>
                          {entry.visibility}
                        </span>
                </div>
                      <p className={`text-sm ${styles.textSecondary} mb-2 transition-all duration-300`}>{entry.content}</p>
                      <p className={`text-xs ${styles.textMuted} transition-all duration-300`}>
                        {new Date(entry.created_at).toLocaleDateString()} by {entry.user_name || entry.username}
                      </p>
                      
              </div>
                    <button
                      onClick={() => deleteTimelineEntry(entry.id)}
                      className={`${styles.button} rounded-lg p-2 hover:scale-105 transition-all duration-300`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
            </div>
                  
                  {/* Reactions */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-sm ${styles.textMuted} transition-all duration-300`}>Reactions:</span>
                    {['like', 'love', 'laugh', 'wow', 'sad', 'angry'].map(reaction => (
                      <button
                        key={reaction}
                        onClick={() => addTimelineReaction(entry.id, reaction)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${styles.button} hover:scale-105 transition-all duration-300`}
                      >
                        {reaction === 'like' && '👍'}
                        {reaction === 'love' && '❤️'}
                        {reaction === 'laugh' && '😂'}
                        {reaction === 'wow' && '😮'}
                        {reaction === 'sad' && '😢'}
                        {reaction === 'angry' && '😠'}
                      </button>
                    ))}
          </div>
                  
                  {/* Comments */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className={`flex-1 px-3 py-2 ${styles.input} rounded-lg text-sm transition-all duration-300`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                            addTimelineComment(entry.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
        </div>
                    
                    {/* Display Comments */}
                    {entry.comments && entry.comments.length > 0 && (
                      <div className="space-y-2">
                        {entry.comments.map(comment => (
                          <div key={comment.id} className={`${styles.button} rounded-lg p-3 transition-all duration-300`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className={`text-sm ${styles.text} transition-all duration-300`}>{comment.content}</p>
                                <p className={`text-xs ${styles.textMuted} transition-all duration-300`}>
                                  {comment.commenter_name} • {new Date(comment.created_at).toLocaleDateString()}
                                </p>
      </div>
                              <button
                                onClick={() => deleteTimelineComment(comment.id)}
                                className={`${styles.button} rounded p-1 hover:scale-105 transition-all duration-300`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
    </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

            {/* Quick Stats - Mobile Optimized */}
        <div className={`mt-6 ${styles.card} rounded-lg p-4 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-base font-semibold ${styles.text} flex items-center transition-all duration-300`}>
              <BarChart3 className="h-4 w-4 text-green-600 mr-2" />
              Stats
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 ${styles.button} rounded-lg transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-blue-600">{completedTasks}</p>
                  <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>Tasks</p>
                </div>
                <CheckSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className={`p-3 ${styles.button} rounded-lg transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-green-600">{completedBucketItems}</p>
                  <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>Goals</p>
                </div>
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className={`p-3 ${styles.button} rounded-lg transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-purple-600">{notes.length}</p>
                  <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>Notes</p>
                </div>
                <StickyNote className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className={`p-3 ${styles.button} rounded-lg transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-yellow-600">{timeline.length}</p>
                  <p className={`text-xs ${styles.textSecondary} transition-all duration-300`}>Timeline</p>
                </div>
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className={`${styles.card} rounded-xl p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-0 transition-all duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${styles.text} transition-all duration-300`}>
                Add {activeTab === 'tasks' ? 'Task' : 
                     activeTab === 'notes' ? 'Note' : 
                     activeTab === 'finance' ? 'Transaction' : 
                     activeTab === 'bucketlist' ? 'Bucket List Item' : 'Timeline Entry'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className={`${styles.button} rounded-xl p-2 hover:scale-105 transition-all duration-300`}
              >
                <X className="h-6 w-6" />
              </button>
    </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                  placeholder="Enter title..."
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                  rows={3}
                  placeholder="Enter description..."
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                >
                  <option value="">Select category...</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="travel">Travel</option>
                  <option value="shopping">Shopping</option>
                  <option value="health">Health</option>
                  <option value="education">Education</option>
                </select>
              </div>
              
              {activeTab === 'finance' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.amount}
                      onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                      className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Currency</label>
                      <select
                        value={newItem.currency}
                        onChange={(e) => setNewItem({...newItem, currency: e.target.value})}
                        className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                      >
                        <option value="USD">🇺🇸 USD</option>
                        <option value="EUR">🇪🇺 EUR</option>
                        <option value="GBP">🇬🇧 GBP</option>
                        <option value="INR">🇮🇳 INR</option>
                        <option value="JPY">🇯🇵 JPY</option>
                        <option value="CAD">🇨🇦 CAD</option>
                        <option value="AUD">🇦🇺 AUD</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Type</label>
                      <select
                        value={newItem.type}
                        onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                        className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                      >
                        <option value="expense">📉 Expense</option>
                        <option value="income">📈 Income</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Date</label>
                    <input
                      type="date"
                      value={newItem.dueDate}
                      onChange={(e) => setNewItem({...newItem, dueDate: e.target.value})}
                      className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                    >
                      <option value="">Select category...</option>
                      <option value="Food & Dining">🍽️ Food & Dining</option>
                      <option value="Transportation">🚗 Transportation</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Entertainment">🎬 Entertainment</option>
                      <option value="Bills & Utilities">💡 Bills & Utilities</option>
                      <option value="Healthcare">🏥 Healthcare</option>
                      <option value="Education">📚 Education</option>
                      <option value="Travel">✈️ Travel</option>
                      <option value="Salary">💰 Salary</option>
                      <option value="Freelance">💼 Freelance</option>
                      <option value="Investment">📈 Investment</option>
                      <option value="Other">📝 Other</option>
                    </select>
                  </div>
                </>
              )}
              
              {activeTab === 'tasks' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Due Date</label>
                    <input
                      type="date"
                      value={newItem.dueDate}
                      onChange={(e) => setNewItem({...newItem, dueDate: e.target.value})}
                      className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Due Time</label>
                    <input
                      type="time"
                      value={newItem.dueTime}
                      onChange={(e) => setNewItem({...newItem, dueTime: e.target.value})}
                      className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Money Required</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.moneyRequired}
                        onChange={(e) => setNewItem({...newItem, moneyRequired: e.target.value})}
                        className={`flex-1 px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                        placeholder="0.00"
                      />
                      <select
                        value={newItem.currency}
                        onChange={(e) => setNewItem({...newItem, currency: e.target.value})}
                        className={`px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                      >
                        <option value="USD">USD</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Assigned To</label>
                    <input
                      type="text"
                      value={newItem.assignedTo}
                      onChange={(e) => setNewItem({...newItem, assignedTo: e.target.value})}
                      className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                      placeholder="Person name..."
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Assigned By</label>
                    <input
                      type="text"
                      value={newItem.assignedBy}
                      onChange={(e) => setNewItem({...newItem, assignedBy: e.target.value})}
                      className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                      placeholder="Your name..."
                    />
                  </div>
                </>
              )}
              
              {activeTab === 'timeline' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Content</label>
                    <textarea
                      value={newItem.timelineContent}
                      onChange={(e) => setNewItem({...newItem, timelineContent: e.target.value})}
                      className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                      rows={3}
                      placeholder="What's happening?"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Visibility</label>
                    <select
                      value={newItem.timelineVisibility}
                      onChange={(e) => setNewItem({...newItem, timelineVisibility: e.target.value})}
                      className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                      <option value="group">Group</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-1 transition-all duration-300`}>Priority</label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({...newItem, priority: e.target.value})}
                  className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300 text-sm sm:text-base`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    if (activeTab === 'tasks') addTask();
                    else if (activeTab === 'notes') addNote();
                    else if (activeTab === 'finance') addFinanceTransaction();
                    else if (activeTab === 'bucketlist') addBucketItem();
                    else if (activeTab === 'timeline') addTimelineEvent();
                  }}
                  className={`flex-1 ${styles.accent} py-2 px-4 rounded-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base`}
                >
                  Add {activeTab === 'tasks' ? 'Task' : 
                       activeTab === 'notes' ? 'Note' : 
                       activeTab === 'finance' ? 'Transaction' : 
                       activeTab === 'bucketlist' ? 'Goal' : 'Event'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 ${styles.button} py-2 px-4 rounded-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Mobile Bottom Navigation - Minimal */}
      <nav className={`${styles.card} border-t ${styles.border} transition-all duration-300 fixed bottom-0 left-0 right-0 z-50 sm:hidden`}>
        <div className="flex justify-around py-1">
          {[
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'notes', label: 'Notes', icon: StickyNote },
            { id: 'finance', label: 'Finance', icon: DollarSign },
            { id: 'bucketlist', label: 'Goals', icon: Star },
            { id: 'timeline', label: 'Timeline', icon: Calendar }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-2 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? `${styles.buttonPressed} ${styles.text}`
                    : `${styles.button} ${styles.textSecondary}`
                }`}
              >
                <IconComponent className="h-4 w-4 mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Create Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className={`${styles.card} rounded-xl p-4 sm:p-6 w-full max-w-lg mx-2 sm:mx-0 transition-all duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${styles.text} transition-all duration-300`}>
                Create Invite
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className={`${styles.button} rounded-xl p-2 hover:scale-105 transition-all duration-300`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2 transition-all duration-300`}>
                  Expiration Days (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  placeholder="7 (default)"
                  className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                  onChange={(e) => setNewItem({...newItem, expirationDays: e.target.value})}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2 transition-all duration-300`}>
                  Max Uses (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                  onChange={(e) => setNewItem({...newItem, maxUses: e.target.value})}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={async () => {
                    try {
                      const inviteData = {
                        expiration_days: newItem.expirationDays ? parseInt(newItem.expirationDays) : null,
                        max_uses: newItem.maxUses ? parseInt(newItem.maxUses) : null
                      };
                      const newInvite = await createInvite(inviteData);
                      setShowInviteModal(false);
                      alert('Invite created successfully!');
                    } catch (error) {
                      console.error('Error creating invite:', error);
                    }
                  }}
                  className={`flex-1 ${styles.accent} py-2 px-4 rounded-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base`}
                >
                  Create Invite
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className={`flex-1 ${styles.button} py-2 px-4 rounded-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Invite Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className={`${styles.card} rounded-xl p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-0 transition-all duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${styles.text} transition-all duration-300`}>
                Join Partnership
              </h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className={`${styles.button} rounded-xl p-2 hover:scale-105 transition-all duration-300`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2 transition-all duration-300`}>
                  Invite Code
                </label>
                <input
                  type="text"
                  placeholder="Enter invite code..."
                  value={joinData.code}
                  onChange={(e) => setJoinData({...joinData, code: e.target.value})}
                  className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                />
              </div>
              
              <div className="text-center">
                <span className={`text-sm ${styles.textMuted} transition-all duration-300`}>OR</span>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2 transition-all duration-300`}>
                  Invite Link Token
                </label>
                <input
                  type="text"
                  placeholder="Enter link token..."
                  value={joinData.link_token}
                  onChange={(e) => setJoinData({...joinData, link_token: e.target.value})}
                  className={`w-full px-3 py-2 ${styles.input} rounded-xl focus:outline-none transition-all duration-300`}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={async () => {
                    try {
                      if (!joinData.code && !joinData.link_token) {
                        alert('Please enter either a code or link token');
                        return;
                      }
                      await joinInvite(joinData);
                      setJoinData({ code: '', link_token: '' });
                      setShowJoinModal(false);
                    } catch (error) {
                      console.error('Error joining invite:', error);
                    }
                  }}
                  className={`flex-1 ${styles.accent} py-2 px-4 rounded-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base`}
                >
                  Join Partnership
                </button>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className={`flex-1 ${styles.button} py-2 px-4 rounded-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleApp;
