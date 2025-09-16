import React, { useState, useEffect } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { GlassmorphismInput } from '@/components/ui/glassmorphism-input';
import { GlassmorphismModal } from '@/components/ui/glassmorphism-modal';
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
  SortAsc
} from 'lucide-react';

interface GlassmorphismDashboardProps {
  userName: string;
  partnerName: string;
}

export const GlassmorphismDashboard: React.FC<GlassmorphismDashboardProps> = ({ 
  userName, 
  partnerName 
}) => {
  const { showConfetti, showCheckmark } = useAnimation();
  
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Upload Design', completed: true, category: 'work' },
    { id: 2, text: 'Groceries', completed: false, category: 'household' },
    { id: 3, text: 'Prepare PPT', completed: false, category: 'work' },
    { id: 4, text: 'Check emails', completed: true, category: 'work' },
    { id: 5, text: 'Call Alex', completed: false, category: 'relationship' },
  ]);

  const [notes, setNotes] = useState([
    { id: 1, title: 'Random', content: "You've got this! One step at a time.", category: 'random' },
    { id: 2, title: 'Brainstorm Idea', content: "What if we introduced a loyalty rewards...", category: 'brainstorm' },
    { id: 3, title: 'Bucket List', content: "Visit Japan together next year", category: 'bucket' },
  ]);

  const [schedule, setSchedule] = useState([
    { id: 1, time: '10:00 AM', event: 'Client meeting', type: 'work' },
    { id: 2, time: '12:00 PM', event: 'UIUX Webinar', type: 'work' },
    { id: 3, time: '7:00 PM', event: 'Date night', type: 'relationship' },
  ]);

  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Groceries', amount: 120, date: 'Today' },
    { id: 2, category: 'Rent', amount: 1500, date: 'Due in 3 days' },
    { id: 3, category: 'Entertainment', amount: 80, date: 'Yesterday' },
  ]);

  // Modal states
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newEvent, setNewEvent] = useState({ time: '', event: '', type: 'work' });
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', date: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editing states
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  
  // Streak tracking
  const [streaks, setStreaks] = useState({
    dailyCheckIn: 7,
    tasksCompleted: 12,
    notesShared: 5,
    lastCheckIn: new Date().toISOString()
  });

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
    if (newTask.trim()) {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: newTask, 
        completed: false, 
        category: 'general' 
      }]);
      setNewTask('');
      setShowAddTask(false);
      showCheckmark();
    }
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const editTask = (id: number, newText: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, text: newText } : task
    ));
    setEditingTask(null);
  };

  // Note management
  const addNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      setNotes([...notes, { 
        id: Date.now(), 
        ...newNote, 
        category: 'random' 
      }]);
      setNewNote({ title: '', content: '' });
      setShowAddNote(false);
      setStreaks(prev => ({ ...prev, notesShared: prev.notesShared + 1 }));
      showCheckmark();
    }
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const editNote = (id: number, title: string, content: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, title, content } : note
    ));
    setEditingNote(null);
  };

  // Event management
  const addEvent = () => {
    if (newEvent.time.trim() && newEvent.event.trim()) {
      setSchedule([...schedule, { 
        id: Date.now(), 
        ...newEvent
      }]);
      setNewEvent({ time: '', event: '', type: 'work' });
      setShowAddEvent(false);
      showCheckmark();
    }
  };

  const deleteEvent = (id: number) => {
    setSchedule(schedule.filter(event => event.id !== id));
  };

  const editEvent = (id: number, time: string, event: string, type: string) => {
    setSchedule(schedule.map(item => 
      item.id === id ? { ...item, time, event, type } : item
    ));
    setEditingEvent(null);
  };

  // Expense management
  const addExpense = () => {
    if (newExpense.category.trim() && newExpense.amount.trim()) {
      setExpenses([...expenses, { 
        id: Date.now(), 
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date || 'Today'
      }]);
      setNewExpense({ category: '', amount: '', date: '' });
      setShowAddExpense(false);
      showCheckmark();
    }
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const editExpense = (id: number, category: string, amount: number, date: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, category, amount, date } : expense
    ));
    setEditingExpense(null);
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
    // Simulate voice assistant activation
    setTimeout(() => {
      // Voice assistant feature coming soon
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
      work: 'bg-blue-500/30 border-blue-500/50',
      household: 'bg-green-500/30 border-green-500/50',
      relationship: 'bg-pink-500/30 border-pink-500/50',
      random: 'bg-purple-500/30 border-purple-500/50',
      brainstorm: 'bg-yellow-500/30 border-yellow-500/50',
      bucket: 'bg-orange-500/30 border-orange-500/50',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/30 border-gray-500/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-yellow-300 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-amber-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-orange-300 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-yellow-400 text-2xl font-bold">Bondly Glow</h1>
              <p className="text-white/80 text-sm">Your Relationship Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <GlassmorphismButton 
              variant="glass" 
              size="sm"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
            </GlassmorphismButton>
            <div 
              className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              onClick={() => setShowProfile(true)}
            >
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-white text-3xl font-bold mb-2">Welcome Back!</h2>
          <h3 className="text-white text-2xl font-semibold mb-2">{userName}</h3>
          <div className="flex items-center text-white/80">
            <span>Today, {getCurrentDate()}</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Schedule Widget */}
          <GlassmorphismCard variant="brown" size="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-white mr-2" />
                <h3 className="text-white font-semibold">Schedule</h3>
              </div>
              <GlassmorphismButton variant="glass" size="sm" onClick={() => setShowAddEvent(true)}>
                <Plus className="h-4 w-4" />
              </GlassmorphismButton>
            </div>
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <span className="text-white/80 text-sm">{item.time}</span>
                    <div className={`rounded-lg px-3 py-1 ${getCategoryColor(item.type)}`}>
                      <span className="text-white text-sm">{item.event}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GlassmorphismButton 
                      variant="glass" 
                      size="sm"
                      onClick={() => setEditingEvent(item.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </GlassmorphismButton>
                    <GlassmorphismButton 
                      variant="glass" 
                      size="sm"
                      onClick={() => deleteEvent(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </GlassmorphismButton>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphismCard>

          {/* Notes Widget */}
          <GlassmorphismCard variant="beige" size="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <StickyNote className="h-5 w-5 text-white mr-2" />
                <h3 className="text-white font-semibold">Notes</h3>
              </div>
              <GlassmorphismButton variant="glass" size="sm" onClick={() => setShowAddNote(true)}>
                <Plus className="h-4 w-4" />
              </GlassmorphismButton>
            </div>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="bg-white/10 rounded-lg p-3 group">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium text-sm">{note.title}</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getCategoryColor(note.category).replace('bg-', 'bg-').replace('/30', '/60')}`}></div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GlassmorphismButton 
                          variant="glass" 
                          size="sm"
                          onClick={() => setEditingNote(note.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </GlassmorphismButton>
                        <GlassmorphismButton 
                          variant="glass" 
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                        >
                          <X className="h-3 w-3" />
                        </GlassmorphismButton>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/80 text-xs">{note.content}</p>
                </div>
              ))}
            </div>
          </GlassmorphismCard>

          {/* Tasks Widget */}
          <GlassmorphismCard variant="brown" size="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-white mr-2" />
                <h3 className="text-white font-semibold">Tasks</h3>
              </div>
              <GlassmorphismButton variant="glass" size="sm" onClick={() => setShowAddTask(true)}>
                <Plus className="h-4 w-4" />
              </GlassmorphismButton>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between group cursor-pointer"
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      task.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-white/50'
                    }`}>
                      {task.completed && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-sm ${
                      task.completed ? 'text-white/60 line-through' : 'text-white'
                    }`}>
                      {task.text}
                    </span>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GlassmorphismButton 
                      variant="glass" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task.id);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </GlassmorphismButton>
                    <GlassmorphismButton 
                      variant="glass" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </GlassmorphismButton>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphismCard>

          {/* Brainstorm Widget - Larger */}
          <GlassmorphismCard variant="yellow" size="lg" className="md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Lightbulb className="h-5 w-5 text-white mr-2" />
                <h3 className="text-white font-semibold">Brainstorm Idea</h3>
              </div>
              <GlassmorphismButton variant="glass-primary" size="sm">
                <Plus className="h-4 w-4" />
              </GlassmorphismButton>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              What if we introduced a loyalty rewards program for premium users? 
              These could be redeemed for exclusive perks and special experiences.
            </p>
          </GlassmorphismCard>

          {/* Finance Widget */}
          <GlassmorphismCard variant="brown" size="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-white mr-2" />
                <h3 className="text-white font-semibold">Finance</h3>
              </div>
              <GlassmorphismButton variant="glass" size="sm" onClick={() => setShowAddExpense(true)}>
                <Plus className="h-4 w-4" />
              </GlassmorphismButton>
            </div>
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between group">
                  <div>
                    <p className="text-white text-sm">{expense.category}</p>
                    <p className="text-white/60 text-xs">{expense.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">${expense.amount}</span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GlassmorphismButton 
                        variant="glass" 
                        size="sm"
                        onClick={() => setEditingExpense(expense.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </GlassmorphismButton>
                      <GlassmorphismButton 
                        variant="glass" 
                        size="sm"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        <X className="h-3 w-3" />
                      </GlassmorphismButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphismCard>

          {/* Streaks Widget */}
          <GlassmorphismCard variant="beige" size="md">
            <div className="flex items-center mb-4">
              <Trophy className="h-5 w-5 text-white mr-2" />
              <h3 className="text-white font-semibold">Streaks</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Daily Check-in</span>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 font-bold">{streaks.dailyCheckIn} days</span>
                  <GlassmorphismButton 
                    variant="glass" 
                    size="sm"
                    onClick={handleDailyCheckIn}
                  >
                    <Plus className="h-3 w-3" />
                  </GlassmorphismButton>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Tasks Completed</span>
                <span className="text-green-400 font-bold">{streaks.tasksCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Notes Shared</span>
                <span className="text-blue-400 font-bold">{streaks.notesShared}</span>
              </div>
            </div>
          </GlassmorphismCard>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-6 left-6 right-6">
          <GlassmorphismCard variant="default" size="sm" className="flex items-center justify-between">
            <GlassmorphismButton 
              variant="glass" 
              size="sm"
              onClick={handleClearAll}
            >
              <Trash2 className="h-5 w-5" />
            </GlassmorphismButton>
            
            <GlassmorphismButton 
              variant="glass" 
              size="sm"
              onClick={() => setShowAddEvent(true)}
            >
              <ChevronRight className="h-5 w-5" />
            </GlassmorphismButton>
            
            <GlassmorphismButton 
              size="lg" 
              className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
              onClick={handleVoiceAssistant}
            >
              <Mic className="h-6 w-6 text-white" />
            </GlassmorphismButton>
            
            <GlassmorphismButton 
              variant="glass" 
              size="sm"
              onClick={() => setShowAddNote(true)}
            >
              <FileText className="h-5 w-5" />
            </GlassmorphismButton>
            
            <GlassmorphismButton 
              variant="glass" 
              size="sm"
              onClick={() => setShowProfile(true)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </GlassmorphismButton>
          </GlassmorphismCard>
        </div>
      </div>

      {/* Add Task Modal */}
      <GlassmorphismModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        title="Add New Task"
      >
        <div className="space-y-4">
          <GlassmorphismInput
            placeholder="Enter task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <div className="flex space-x-3">
            <GlassmorphismButton 
              variant="glass-primary" 
              onClick={addTask}
              className="flex-1"
            >
              Add Task
            </GlassmorphismButton>
            <GlassmorphismButton 
              variant="glass" 
              onClick={() => setShowAddTask(false)}
              className="flex-1"
            >
              Cancel
            </GlassmorphismButton>
          </div>
        </div>
      </GlassmorphismModal>

      {/* Add Note Modal */}
      <GlassmorphismModal
        isOpen={showAddNote}
        onClose={() => setShowAddNote(false)}
        title="Add New Note"
      >
        <div className="space-y-4">
          <GlassmorphismInput
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />
          <GlassmorphismInput
            placeholder="Note content..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          />
          <div className="flex space-x-3">
            <GlassmorphismButton 
              variant="glass-primary" 
              onClick={addNote}
              className="flex-1"
            >
              Add Note
            </GlassmorphismButton>
            <GlassmorphismButton 
              variant="glass" 
              onClick={() => setShowAddNote(false)}
              className="flex-1"
            >
              Cancel
            </GlassmorphismButton>
          </div>
        </div>
      </GlassmorphismModal>

      {/* Add Event Modal */}
      <GlassmorphismModal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        title="Add New Event"
      >
        <div className="space-y-4">
          <GlassmorphismInput
            placeholder="Time (e.g., 10:00 AM)..."
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
          />
          <GlassmorphismInput
            placeholder="Event name..."
            value={newEvent.event}
            onChange={(e) => setNewEvent({ ...newEvent, event: e.target.value })}
          />
          <select 
            className="w-full p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40"
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
          >
            <option value="work" className="bg-amber-800">Work</option>
            <option value="household" className="bg-amber-800">Household</option>
            <option value="relationship" className="bg-amber-800">Relationship</option>
          </select>
          <div className="flex space-x-3">
            <GlassmorphismButton 
              variant="glass-primary" 
              onClick={addEvent}
              className="flex-1"
            >
              Add Event
            </GlassmorphismButton>
            <GlassmorphismButton 
              variant="glass" 
              onClick={() => setShowAddEvent(false)}
              className="flex-1"
            >
              Cancel
            </GlassmorphismButton>
          </div>
        </div>
      </GlassmorphismModal>

      {/* Add Expense Modal */}
      <GlassmorphismModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        title="Add New Expense"
      >
        <div className="space-y-4">
          <GlassmorphismInput
            placeholder="Category (e.g., Groceries)..."
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
          />
          <GlassmorphismInput
            placeholder="Amount..."
            type="number"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          />
          <GlassmorphismInput
            placeholder="Date (optional)..."
            value={newExpense.date}
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
          />
          <div className="flex space-x-3">
            <GlassmorphismButton 
              variant="glass-primary" 
              onClick={addExpense}
              className="flex-1"
            >
              Add Expense
            </GlassmorphismButton>
            <GlassmorphismButton 
              variant="glass" 
              onClick={() => setShowAddExpense(false)}
              className="flex-1"
            >
              Cancel
            </GlassmorphismButton>
          </div>
        </div>
      </GlassmorphismModal>

      {/* Search Modal */}
      <GlassmorphismModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        title="Search"
      >
        <div className="space-y-4">
          <GlassmorphismInput
            placeholder="Search tasks, notes, events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="max-h-60 overflow-y-auto space-y-2">
            {searchQuery && searchItems().map((item, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {item.type === 'task' ? ('text' in item ? item.text : '') : 
                       item.type === 'note' ? ('title' in item ? item.title : '') :
                       item.type === 'event' ? ('event' in item ? item.event : '') :
                       ('category' in item ? item.category : '')}
                    </p>
                    <p className="text-white/60 text-xs capitalize">{item.type}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getCategoryColor(('category' in item ? item.category : item.type) || item.type).replace('bg-', 'bg-').replace('/30', '/60')}`}></div>
                </div>
              </div>
            ))}
            {searchQuery && searchItems().length === 0 && (
              <p className="text-white/60 text-center py-4">No results found</p>
            )}
          </div>
          <div className="flex space-x-3">
            <GlassmorphismButton 
              variant="glass" 
              onClick={() => setShowSearch(false)}
              className="flex-1"
            >
              Close
            </GlassmorphismButton>
          </div>
        </div>
      </GlassmorphismModal>

      {/* Profile Modal */}
      <GlassmorphismModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        title="Profile"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-white text-xl font-semibold">{userName}</h3>
            <p className="text-white/60 text-sm">Partner: {partnerName}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white">Daily Check-ins</span>
              <span className="text-yellow-400 font-bold">{streaks.dailyCheckIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Tasks Completed</span>
              <span className="text-green-400 font-bold">{streaks.tasksCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Notes Shared</span>
              <span className="text-blue-400 font-bold">{streaks.notesShared}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <GlassmorphismButton 
              variant="glass-primary" 
              onClick={handleDailyCheckIn}
              className="flex-1"
            >
              Check In
            </GlassmorphismButton>
            <GlassmorphismButton 
              variant="glass" 
              onClick={() => setShowProfile(false)}
              className="flex-1"
            >
              Close
            </GlassmorphismButton>
          </div>
        </div>
      </GlassmorphismModal>
    </div>
  );
};
