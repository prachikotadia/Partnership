import React, { useState, useEffect } from 'react';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { NeumorphicToggle } from '@/components/ui/neumorphic-toggle';
import { NeumorphicProgress } from '@/components/ui/neumorphic-progress';
import { TaskManager } from '@/components/tasks/TaskManager';
import { FinanceManager } from '@/components/finance/FinanceManager';
import { ScheduleManager } from '@/components/schedule/ScheduleManager';
import { ScheduleDashboard } from '@/components/schedule/ScheduleDashboard';
import { NotesManager } from '@/components/notes/NotesManager';
import { NotesDashboard } from '@/components/notes/NotesDashboard';
import { BucketListManager } from '@/components/bucketList/BucketListManager';
import { BucketListStats } from '@/components/bucketList/BucketListStats';
import { useAnimation } from '@/components/animations/AnimationProvider';
import { 
  Clock,
  StickyNote,
  CheckSquare,
  Lightbulb,
  Search,
  User,
  ChevronRight,
  Trash2,
  MoreHorizontal,
  Plus,
  Mic,
  FileText,
  Calendar,
  DollarSign,
  Trophy,
  MessageCircle,
  Heart,
  Edit,
  X,
  Save,
  Filter,
  SortAsc,
  Bell,
  Settings,
  Home,
  TrendingUp,
  Target,
  Zap,
  Star,
  Bookmark,
  Share,
  Download,
  Upload,
  Play,
  Pause,
  Volume2,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

interface IOSDashboardProps {
  userName: string;
  partnerName: string;
}

export const IOSDashboard: React.FC<IOSDashboardProps> = ({ 
  userName, 
  partnerName 
}) => {
  const { showConfetti, showCheckmark } = useAnimation();
  
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Upload Design', completed: true, category: 'work', priority: 'high' },
    { id: 2, text: 'Groceries', completed: false, category: 'household', priority: 'medium' },
    { id: 3, text: 'Prepare PPT', completed: false, category: 'work', priority: 'high' },
    { id: 4, text: 'Check emails', completed: true, category: 'work', priority: 'low' },
    { id: 5, text: 'Call Person1', completed: false, category: 'relationship', priority: 'medium' },
  ]);

  const [notes, setNotes] = useState([
    { id: 1, title: 'Random', content: "You've got this! One step at a time.", category: 'random', starred: false },
    { id: 2, title: 'Brainstorm Idea', content: "What if we introduced a loyalty rewards...", category: 'brainstorm', starred: true },
    { id: 3, title: 'Bucket List', content: "Visit Japan together next year", category: 'bucket', starred: false },
  ]);

  const [schedule, setSchedule] = useState([
    { id: 1, time: '10:00 AM', event: 'Client meeting', type: 'work', duration: '1h' },
    { id: 2, time: '12:00 PM', event: 'UIUX Webinar', type: 'work', duration: '2h' },
    { id: 3, time: '7:00 PM', event: 'Date night', type: 'relationship', duration: '3h' },
  ]);

  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Groceries', amount: 120, date: 'Today', trend: 'up' },
    { id: 2, category: 'Rent', amount: 1500, date: 'Due in 3 days', trend: 'stable' },
    { id: 3, category: 'Entertainment', amount: 80, date: 'Yesterday', trend: 'down' },
  ]);

  // Modal states
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [showBucketListManager, setShowBucketListManager] = useState(false);
  const [showFinanceManager, setShowFinanceManager] = useState(false);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showNotesManager, setShowNotesManager] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newEvent, setNewEvent] = useState({ time: '', event: '', type: 'work', duration: '' });
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', date: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editing states
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  
  // Edit form states
  const [editTask, setEditTask] = useState({ text: '', category: 'work', priority: 'medium' });
  const [editNote, setEditNote] = useState({ title: '', content: '', category: 'random' });
  const [editEvent, setEditEvent] = useState({ time: '', event: '', type: 'work', duration: '' });
  const [editExpense, setEditExpense] = useState({ category: '', amount: '', date: '' });
  
  // Filter and sort states
  const [taskFilter, setTaskFilter] = useState('all');
  const [noteFilter, setNoteFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Error states
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Streak tracking
  const [streaks, setStreaks] = useState({
    dailyCheckIn: 7,
    tasksCompleted: 12,
    notesShared: 5,
    lastCheckIn: new Date().toISOString()
  });

  // Device status simulation
  const [deviceStatus, setDeviceStatus] = useState({
    wifi: true,
    battery: 85,
    signal: 4,
    bluetooth: true
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('bondly-tasks');
    const savedNotes = localStorage.getItem('bondly-notes');
    const savedSchedule = localStorage.getItem('bondly-schedule');
    const savedExpenses = localStorage.getItem('bondly-expenses');
    const savedStreaks = localStorage.getItem('bondly-streaks');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedStreaks) setStreaks(JSON.parse(savedStreaks));
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('bondly-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('bondly-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('bondly-schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('bondly-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('bondly-streaks', JSON.stringify(streaks));
  }, [streaks]);

  // Task management
  const toggleTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      showConfetti();
      setStreaks(prev => ({ ...prev, tasksCompleted: prev.tasksCompleted + 1 }));
    }
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (!newTask.trim()) {
      setErrors({ task: 'Task text is required' });
      return;
    }
    
    setTasks([...tasks, { 
      id: Date.now(), 
      text: newTask, 
      completed: false, 
      category: 'general',
      priority: 'medium'
    }]);
    setNewTask('');
    setShowAddTask(false);
    setErrors({});
    showCheckmark();
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditTask({
        text: task.text,
        category: task.category,
        priority: task.priority
      });
      setEditingTask(id);
    }
  };

  const saveEditTask = () => {
    if (!editTask.text.trim()) {
      setErrors({ editTask: 'Task text is required' });
      return;
    }
    
    setTasks(tasks.map(task => 
      task.id === editingTask ? { 
        ...task, 
        text: editTask.text,
        category: editTask.category,
        priority: editTask.priority
      } : task
    ));
    setEditingTask(null);
    setEditTask({ text: '', category: 'work', priority: 'medium' });
    setErrors({});
    showCheckmark();
  };

  const cancelEditTask = () => {
    setEditingTask(null);
    setEditTask({ text: '', category: 'work', priority: 'medium' });
    setErrors({});
  };

  // Note management
  const addNote = () => {
    if (!newNote.title.trim()) {
      setErrors({ noteTitle: 'Note title is required' });
      return;
    }
    if (!newNote.content.trim()) {
      setErrors({ noteContent: 'Note content is required' });
      return;
    }
    
    setNotes([...notes, { 
      id: Date.now(), 
      ...newNote, 
      category: 'random',
      starred: false
    }]);
    setNewNote({ title: '', content: '' });
    setShowAddNote(false);
    setStreaks(prev => ({ ...prev, notesShared: prev.notesShared + 1 }));
    setErrors({});
    showCheckmark();
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const toggleStar = (id: number) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, starred: !note.starred } : note
    ));
  };

  const startEditNote = (id: number) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setEditNote({
        title: note.title,
        content: note.content,
        category: note.category
      });
      setEditingNote(id);
    }
  };

  const saveEditNote = () => {
    if (!editNote.title.trim()) {
      setErrors({ editNoteTitle: 'Note title is required' });
      return;
    }
    if (!editNote.content.trim()) {
      setErrors({ editNoteContent: 'Note content is required' });
      return;
    }
    
    setNotes(notes.map(note => 
      note.id === editingNote ? { 
        ...note, 
        title: editNote.title,
        content: editNote.content,
        category: editNote.category
      } : note
    ));
    setEditingNote(null);
    setEditNote({ title: '', content: '', category: 'random' });
    setErrors({});
    showCheckmark();
  };

  const cancelEditNote = () => {
    setEditingNote(null);
    setEditNote({ title: '', content: '', category: 'random' });
    setErrors({});
  };

  // Event management
  const addEvent = () => {
    if (!newEvent.time.trim()) {
      setErrors({ eventTime: 'Event time is required' });
      return;
    }
    if (!newEvent.event.trim()) {
      setErrors({ eventName: 'Event name is required' });
      return;
    }
    
    setSchedule([...schedule, { 
      id: Date.now(), 
      ...newEvent
    }]);
    setNewEvent({ time: '', event: '', type: 'work', duration: '' });
    setShowAddEvent(false);
    setErrors({});
    showCheckmark();
  };

  const deleteEvent = (id: number) => {
    setSchedule(schedule.filter(event => event.id !== id));
  };

  const startEditEvent = (id: number) => {
    const event = schedule.find(e => e.id === id);
    if (event) {
      setEditEvent({
        time: event.time,
        event: event.event,
        type: event.type,
        duration: event.duration
      });
      setEditingEvent(id);
    }
  };

  const saveEditEvent = () => {
    if (!editEvent.time.trim()) {
      setErrors({ editEventTime: 'Event time is required' });
      return;
    }
    if (!editEvent.event.trim()) {
      setErrors({ editEventName: 'Event name is required' });
      return;
    }
    
    setSchedule(schedule.map(event => 
      event.id === editingEvent ? { 
        ...event, 
        time: editEvent.time,
        event: editEvent.event,
        type: editEvent.type,
        duration: editEvent.duration
      } : event
    ));
    setEditingEvent(null);
    setEditEvent({ time: '', event: '', type: 'work', duration: '' });
    setErrors({});
    showCheckmark();
  };

  const cancelEditEvent = () => {
    setEditingEvent(null);
    setEditEvent({ time: '', event: '', type: 'work', duration: '' });
    setErrors({});
  };

  // Expense management
  const addExpense = () => {
    if (!newExpense.category.trim()) {
      setErrors({ expenseCategory: 'Expense category is required' });
      return;
    }
    if (!newExpense.amount.trim()) {
      setErrors({ expenseAmount: 'Expense amount is required' });
      return;
    }
    if (isNaN(parseFloat(newExpense.amount))) {
      setErrors({ expenseAmount: 'Please enter a valid amount' });
      return;
    }
    
    setExpenses([...expenses, { 
      id: Date.now(), 
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date || 'Today',
      trend: 'stable'
    }]);
    setNewExpense({ category: '', amount: '', date: '' });
    setShowAddExpense(false);
    setErrors({});
    showCheckmark();
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const startEditExpense = (id: number) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setEditExpense({
        category: expense.category,
        amount: expense.amount.toString(),
        date: expense.date
      });
      setEditingExpense(id);
    }
  };

  const saveEditExpense = () => {
    if (!editExpense.category.trim()) {
      setErrors({ editExpenseCategory: 'Expense category is required' });
      return;
    }
    if (!editExpense.amount.trim()) {
      setErrors({ editExpenseAmount: 'Expense amount is required' });
      return;
    }
    if (isNaN(parseFloat(editExpense.amount))) {
      setErrors({ editExpenseAmount: 'Please enter a valid amount' });
      return;
    }
    
    setExpenses(expenses.map(expense => 
      expense.id === editingExpense ? { 
        ...expense, 
        category: editExpense.category,
        amount: parseFloat(editExpense.amount),
        date: editExpense.date
      } : expense
    ));
    setEditingExpense(null);
    setEditExpense({ category: '', amount: '', date: '' });
    setErrors({});
    showCheckmark();
  };

  const cancelEditExpense = () => {
    setEditingExpense(null);
    setEditExpense({ category: '', amount: '', date: '' });
    setErrors({});
  };

  // Search functionality
  const searchItems = () => {
    const query = searchQuery.toLowerCase();
    const allItems = [
      ...tasks.map(t => ({ type: 'task', ...t })),
      ...notes.map(n => ({ type: 'note', ...n })),
      ...schedule.map(s => ({ type: 'event', ...s })),
      ...expenses.map(e => ({ type: 'expense', ...e }))
    ];
    
    return allItems.filter(item => {
      const searchableText = [
        'text' in item ? item.text : '',
        'title' in item ? item.title : '',
        'event' in item ? item.event : '',
        'category' in item ? item.category : ''
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
  };

  // Voice assistant simulation
  const handleVoiceAssistant = () => {
    showCheckmark();
    setTimeout(() => {
      alert('Voice assistant activated! (This is a demo)');
    }, 1000);
  };

  // Daily check-in
  const handleDailyCheckIn = () => {
    setStreaks(prev => ({ 
      ...prev, 
      dailyCheckIn: prev.dailyCheckIn + 1,
      lastCheckIn: new Date().toISOString()
    }));
    showConfetti();
  };

  // Clear all data
  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setTasks([]);
      setNotes([]);
      setSchedule([]);
      setExpenses([]);
      setStreaks({
        dailyCheckIn: 0,
        tasksCompleted: 0,
        notesShared: 0,
        lastCheckIn: new Date().toISOString()
      });
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'text-blue-600 bg-blue-100',
      household: 'text-green-600 bg-green-100',
      relationship: 'text-pink-600 bg-pink-100',
      random: 'text-purple-600 bg-purple-100',
      brainstorm: 'text-yellow-600 bg-yellow-100',
      bucket: 'text-orange-600 bg-orange-100',
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Status Bar - Mobile Optimized */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-md">
        <div className="text-sm font-semibold text-gray-900">9:41</div>
        <div className="flex items-center space-x-1">
          <Signal className="h-4 w-4 text-gray-900" />
          <Wifi className="h-4 w-4 text-gray-900" />
          <Battery className="h-4 w-4 text-gray-900" />
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <NeumorphicCard variant="elevated" size="sm" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
            </NeumorphicCard>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Bondly Glow</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Your Relationship Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <NeumorphicButton 
              variant="secondary" 
              size="sm"
              icon={<Search className="h-4 w-4" />}
              onClick={() => setShowSearch(true)}
              className="min-h-[44px] min-w-[44px]"
            />
            <NeumorphicCard 
              variant="elevated" 
              size="sm" 
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              onClick={() => setShowTaskManager(true)}
            >
              <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </NeumorphicCard>
            <NeumorphicCard 
              variant="elevated" 
              size="sm" 
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              onClick={() => setShowBucketListManager(true)}
            >
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </NeumorphicCard>
            <NeumorphicCard 
              variant="elevated" 
              size="sm" 
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              onClick={() => setShowFinanceManager(true)}
            >
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </NeumorphicCard>
            <NeumorphicCard 
              variant="elevated" 
              size="sm" 
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              onClick={() => setShowScheduleManager(true)}
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </NeumorphicCard>
            <NeumorphicCard 
              variant="elevated" 
              size="sm" 
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              onClick={() => setShowNotesManager(true)}
            >
              <StickyNote className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </NeumorphicCard>
            <NeumorphicCard 
              variant="elevated" 
              size="sm" 
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              onClick={() => setShowProfile(true)}
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </NeumorphicCard>
          </div>
        </div>

        {/* Welcome Section - Mobile Optimized */}
        <NeumorphicCard variant="elevated" size="lg" className="mb-4 sm:mb-6 p-4 sm:p-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h2>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">{userName}</h3>
            <p className="text-sm sm:text-base text-gray-600">{getCurrentDate()}</p>
          </div>
        </NeumorphicCard>

        {/* Quick Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <NeumorphicCard variant="elevated" size="md" className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{streaks.dailyCheckIn}</div>
              <div className="text-xs sm:text-sm text-gray-600">Day Streak</div>
            </div>
          </NeumorphicCard>
          <NeumorphicCard variant="elevated" size="md" className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{streaks.tasksCompleted}</div>
              <div className="text-xs sm:text-sm text-gray-600">Tasks Done</div>
            </div>
          </NeumorphicCard>
        </div>

        {/* Main Widgets - Mobile Optimized */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Notes Widget - Mobile Optimized */}
          <NeumorphicCard variant="elevated" size="lg" className="p-4 sm:p-6">
            <NotesDashboard onOpenNotes={() => setShowNotesManager(true)} />
          </NeumorphicCard>
          
          {/* Tasks Widget - Mobile Optimized */}
          <NeumorphicCard variant="elevated" size="lg" className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
              </div>
              <NeumorphicButton 
                variant="primary" 
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowAddTask(true)}
                className="min-h-[44px] min-w-[44px]"
              />
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors min-h-[60px]"
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <NeumorphicToggle
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      size="sm"
                      color="blue"
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className={`text-sm sm:text-base font-medium block ${
                        task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {task.text}
                      </span>
                      <div className="flex items-center space-x-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                        <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <NeumorphicButton 
                      variant="secondary" 
                      size="sm"
                      icon={<Edit className="h-3 w-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditTask(task.id);
                      }}
                    />
                    <NeumorphicButton 
                      variant="danger" 
                      size="sm"
                      icon={<X className="h-3 w-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </NeumorphicCard>

          {/* Notes Widget */}
          <NeumorphicCard variant="elevated" size="lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <StickyNote className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              </div>
              <NeumorphicButton 
                variant="accent" 
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowAddNote(true)}
              />
            </div>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-gray-900">{note.title}</h4>
                      <button
                        onClick={() => toggleStar(note.id)}
                        className="text-yellow-500 hover:text-yellow-600 transition-colors"
                      >
                        <Star className={`h-4 w-4 ${note.starred ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <NeumorphicButton 
                        variant="secondary" 
                        size="sm"
                        icon={<Edit className="h-3 w-3" />}
                        onClick={() => startEditNote(note.id)}
                      />
                      <NeumorphicButton 
                        variant="danger" 
                        size="sm"
                        icon={<X className="h-3 w-3" />}
                        onClick={() => deleteNote(note.id)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{note.content}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(note.category)}`}>
                    {note.category}
                  </span>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        </div>

        {/* Schedule and Finance Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Schedule Widget */}
          <NeumorphicCard variant="elevated" size="lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
              </div>
              <NeumorphicButton 
                variant="success" 
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowAddEvent(true)}
              />
            </div>
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.id} className="group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">{item.time}</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{item.event}</div>
                        <div className="text-xs text-gray-500">{item.duration}</div>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <NeumorphicButton 
                        variant="secondary" 
                        size="sm"
                        icon={<Edit className="h-3 w-3" />}
                        onClick={() => startEditEvent(item.id)}
                      />
                      <NeumorphicButton 
                        variant="danger" 
                        size="sm"
                        icon={<X className="h-3 w-3" />}
                        onClick={() => deleteEvent(item.id)}
                      />
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.type)}`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </NeumorphicCard>

          {/* Finance Widget */}
          <NeumorphicCard variant="elevated" size="lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Finance</h3>
              </div>
              <NeumorphicButton 
                variant="success" 
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowAddExpense(true)}
              />
            </div>
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{expense.category}</div>
                      <div className="text-xs text-gray-500">{expense.date}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-bold text-gray-900">${expense.amount}</div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <NeumorphicButton 
                          variant="secondary" 
                          size="sm"
                          icon={<Edit className="h-3 w-3" />}
                          onClick={() => startEditExpense(expense.id)}
                        />
                        <NeumorphicButton 
                          variant="danger" 
                          size="sm"
                          icon={<X className="h-3 w-3" />}
                          onClick={() => deleteExpense(expense.id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        </div>

        {/* Progress Section */}
        <NeumorphicCard variant="elevated" size="lg" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
            </div>
            <NeumorphicButton 
              variant="primary" 
              size="sm"
              onClick={handleDailyCheckIn}
            >
              Check In
            </NeumorphicButton>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Daily Streak</span>
                <span className="text-sm text-gray-500">{streaks.dailyCheckIn} days</span>
              </div>
              <NeumorphicProgress value={streaks.dailyCheckIn} max={30} color="blue" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Tasks Completed</span>
                <span className="text-sm text-gray-500">{streaks.tasksCompleted}/20</span>
              </div>
              <NeumorphicProgress value={streaks.tasksCompleted} max={20} color="green" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Notes Shared</span>
                <span className="text-sm text-gray-500">{streaks.notesShared}/10</span>
              </div>
              <NeumorphicProgress value={streaks.notesShared} max={10} color="purple" />
            </div>
          </div>
        </NeumorphicCard>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-6 right-6">
        <NeumorphicCard variant="elevated" size="sm" className="flex items-center justify-between">
          <NeumorphicButton 
            variant="secondary" 
            size="sm"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={handleClearAll}
          />
          
          <NeumorphicButton 
            variant="secondary" 
            size="sm"
            icon={<Calendar className="h-4 w-4" />}
            onClick={() => setShowAddEvent(true)}
          />
          
          <NeumorphicButton 
            size="lg" 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-[8px_8px_16px_rgba(59,130,246,0.3),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_24px_rgba(59,130,246,0.4),-12px_-12px_24px_rgba(255,255,255,0.2)]"
            onClick={handleVoiceAssistant}
          >
            <Mic className="h-6 w-6 text-white" />
          </NeumorphicButton>
          
          <NeumorphicButton 
            variant="secondary" 
            size="sm"
            icon={<FileText className="h-4 w-4" />}
            onClick={() => setShowAddNote(true)}
          />
          
          <NeumorphicButton 
            variant="secondary" 
            size="sm"
            icon={<MoreHorizontal className="h-4 w-4" />}
            onClick={() => setShowProfile(true)}
          />
        </NeumorphicCard>
      </div>

      {/* Add Task Modal */}
      <NeumorphicCard 
        variant="elevated" 
        size="lg" 
        className={`fixed inset-0 m-4 max-w-md mx-auto z-50 ${showAddTask ? 'block' : 'hidden'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Task</h3>
          <NeumorphicButton 
            variant="secondary" 
            size="sm"
            icon={<X className="h-4 w-4" />}
            onClick={() => setShowAddTask(false)}
          />
        </div>
        <div className="space-y-4">
          <NeumorphicInput
            placeholder="Enter task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          {errors.task && <p className="text-red-500 text-sm">{errors.task}</p>}
          <div className="flex space-x-3">
            <NeumorphicButton 
              variant="primary" 
              onClick={addTask}
              className="flex-1"
            >
              Add Task
            </NeumorphicButton>
            <NeumorphicButton 
              variant="secondary" 
              onClick={() => setShowAddTask(false)}
              className="flex-1"
            >
              Cancel
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicCard>

      {/* Task Manager Modal */}
      {showTaskManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <NeumorphicCard variant="elevated" className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Task Manager</h2>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<X className="h-4 w-4" />}
                onClick={() => setShowTaskManager(false)}
              />
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <TaskManager />
            </div>
          </NeumorphicCard>
        </div>
      )}

      {/* Bucket List Manager Modal */}
      {showBucketListManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <NeumorphicCard variant="elevated" className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Bucket List</h2>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<X className="h-4 w-4" />}
                onClick={() => setShowBucketListManager(false)}
              />
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <BucketListManager />
            </div>
          </NeumorphicCard>
        </div>
      )}

      {/* Finance Manager Modal */}
      {showFinanceManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <NeumorphicCard variant="elevated" className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Finance Manager</h2>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<X className="h-4 w-4" />}
                onClick={() => setShowFinanceManager(false)}
              />
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <FinanceManager />
            </div>
          </NeumorphicCard>
        </div>
      )}

      {/* Schedule Manager Modal */}
      {showScheduleManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <NeumorphicCard variant="elevated" className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Schedule Manager</h2>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<X className="h-4 w-4" />}
                onClick={() => setShowScheduleManager(false)}
              />
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <ScheduleManager />
            </div>
          </NeumorphicCard>
        </div>
      )}

      {/* Notes Manager Modal */}
      {showNotesManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <NeumorphicCard variant="elevated" className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Notes & Reminders</h2>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<X className="h-4 w-4" />}
                onClick={() => setShowNotesManager(false)}
              />
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <NotesManager />
            </div>
          </NeumorphicCard>
        </div>
      )}
    </div>
  );
};
