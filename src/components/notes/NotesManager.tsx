import React, { useState, useEffect } from 'react';
import { 
  StickyNote, 
  Plus, 
  Search, 
  Filter, 
  Pin, 
  PinOff,
  CheckCircle2,
  Edit,
  Trash2,
  Bell,
  BellOff,
  Clock,
  User,
  Tag,
  X
} from 'lucide-react';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { useResponsive } from '@/hooks/use-responsive';
import { useAnimation } from '@/components/animations/AnimationProvider';

interface Note {
  id: string;
  title: string;
  content: string;
  author: 'Person1' | 'Person2';
  category: 'personal' | 'work' | 'shopping' | 'ideas' | 'reminders' | 'shared' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPinned: boolean;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: 'Person1' | 'Person2';
  tags: string[];
  reminderSettings: {
    enabled: boolean;
    scheduledTime?: string;
    repeatPattern?: {
      type: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      endDate?: string;
    };
    lastReminderSent?: string;
    snoozeUntil?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastEditedBy: 'Person1' | 'Person2';
  isDeleted: boolean;
  deletedAt?: string;
  version: number;
}

interface NotesManagerProps {
  className?: string;
}

export const NotesManager: React.FC<NotesManagerProps> = ({ className = '' }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Note>>({});
  const { showConfetti, showCheckmark } = useAnimation();
  const [filter, setFilter] = useState({
    authors: [] as ('Person1' | 'Person2')[],
    categories: [] as string[],
    priority: [] as string[],
    tags: [] as string[],
    completed: undefined as boolean | undefined,
    pinned: undefined as boolean | undefined,
    hasReminders: undefined as boolean | undefined
  });

  // New note form
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    author: 'Person1' as 'Person1' | 'Person2',
    category: 'personal' as Note['category'],
    priority: 'medium' as Note['priority'],
    tags: [] as string[],
    isPinned: false,
    reminderEnabled: false,
    reminderTime: '',
    reminderDate: '',
    repeatType: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
    repeatInterval: 1
  });

  // Sample data for demonstration
  useEffect(() => {
    const sampleNotes: Note[] = [
      {
        id: 'note_1',
        title: 'Grocery List',
        content: 'Milk, eggs, bread, apples, chicken breast',
        author: 'Person1',
        category: 'shopping',
        priority: 'medium',
        isPinned: true,
        isCompleted: false,
        tags: ['groceries', 'food'],
        reminderSettings: {
          enabled: true,
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastEditedBy: 'Person1',
        isDeleted: false,
        version: 1
      },
      {
        id: 'note_2',
        title: 'Weekend Plans',
        content: 'Movie night on Friday, hiking on Saturday, brunch on Sunday',
        author: 'Person2',
        category: 'personal',
        priority: 'high',
        isPinned: false,
        isCompleted: false,
        tags: ['weekend', 'plans'],
        reminderSettings: {
          enabled: true,
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          repeatPattern: {
            type: 'weekly',
            interval: 1
          }
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastEditedBy: 'Person2',
        isDeleted: false,
        version: 1
      },
      {
        id: 'note_3',
        title: 'Project Ideas',
        content: 'Build a mobile app for couples, create a shared photo album, design a travel planner',
        author: 'Person1',
        category: 'ideas',
        priority: 'low',
        isPinned: false,
        isCompleted: false,
        tags: ['projects', 'ideas'],
        reminderSettings: {
          enabled: false
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastEditedBy: 'Person1',
        isDeleted: false,
        version: 1
      }
    ];
    setNotes(sampleNotes);
  }, []);

  useEffect(() => {
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply other filters
    if (filter.authors.length > 0) {
      filtered = filtered.filter(note => filter.authors.includes(note.author));
    }
    if (filter.categories.length > 0) {
      filtered = filtered.filter(note => filter.categories.includes(note.category));
    }
    if (filter.priority.length > 0) {
      filtered = filtered.filter(note => filter.priority.includes(note.priority));
    }
    if (filter.tags.length > 0) {
      filtered = filtered.filter(note => 
        note.tags.some(tag => filter.tags.includes(tag))
      );
    }
    if (filter.completed !== undefined) {
      filtered = filtered.filter(note => note.isCompleted === filter.completed);
    }
    if (filter.pinned !== undefined) {
      filtered = filtered.filter(note => note.isPinned === filter.pinned);
    }
    if (filter.hasReminders !== undefined) {
      filtered = filtered.filter(note => 
        filter.hasReminders ? note.reminderSettings.enabled : !note.reminderSettings.enabled
      );
    }

    setFilteredNotes(filtered);
  }, [notes, searchQuery, filter]);

  const getPartnerColor = (partner: 'Person1' | 'Person2', type: 'primary' | 'secondary' | 'border' | 'text' | 'glow' | 'avatar' | 'popup' | 'button' = 'primary') => {
    const colors = {
      'Person1': {
        primary: 'bg-blue-100',
        secondary: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        glow: 'shadow-blue-200',
        avatar: 'bg-blue-500',
        popup: 'bg-blue-50 border-blue-200',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      'Person2': {
        primary: 'bg-purple-100',
        secondary: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        glow: 'shadow-purple-200',
        avatar: 'bg-purple-500',
        popup: 'bg-purple-50 border-purple-200',
        button: 'bg-purple-500 hover:bg-purple-600'
      }
    };
    return colors[partner][type];
  };

  const getPartnerAvatar = (partner: 'Person1' | 'Person2') => {
    return partner.charAt(0).toUpperCase();
  };

  const getCategoryColor = (category: Note['category']) => {
    const colors: { [key: string]: string } = {
      personal: 'bg-green-100 text-green-700',
      work: 'bg-blue-100 text-blue-700',
      shopping: 'bg-yellow-100 text-yellow-700',
      ideas: 'bg-purple-100 text-purple-700',
      reminders: 'bg-red-100 text-red-700',
      shared: 'bg-indigo-100 text-indigo-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.other;
  };

  const getPriorityColor = (priority: Note['priority']) => {
    const colors: { [key: string]: string } = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  const handleCreateNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note: Note = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newNote.title,
        content: newNote.content,
        author: newNote.author,
        category: newNote.category,
        priority: newNote.priority,
        isPinned: newNote.isPinned,
        isCompleted: false,
        tags: newNote.tags,
        reminderSettings: {
          enabled: newNote.reminderEnabled,
          scheduledTime: newNote.reminderEnabled && newNote.reminderDate && newNote.reminderTime 
            ? new Date(`${newNote.reminderDate}T${newNote.reminderTime}`).toISOString()
            : undefined,
          repeatPattern: newNote.repeatType !== 'none' ? {
            type: newNote.repeatType as 'daily' | 'weekly' | 'monthly' | 'yearly',
            interval: newNote.repeatInterval
          } : undefined
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastEditedBy: newNote.author,
        isDeleted: false,
        version: 1
      };

      setNotes([...notes, note]);
      
      setNewNote({
        title: '',
        content: '',
        author: 'Person1',
        category: 'personal',
        priority: 'medium',
        tags: [],
        isPinned: false,
        reminderEnabled: false,
        reminderTime: '',
        reminderDate: '',
        repeatType: 'none',
        repeatInterval: 1
      });
      setShowAddModal(false);
      showCheckmark();
    }
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString(), version: note.version + 1 }
        : note
    ));
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.map(note => 
        note.id === noteId 
          ? { ...note, isDeleted: true, deletedAt: new Date().toISOString() }
          : note
      ));
    }
  };

  const handleCompleteNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      handleUpdateNote(noteId, {
        isCompleted: true,
        completedAt: new Date().toISOString(),
        completedBy: note.author
      });
      showConfetti();
    }
  };

  const handleTogglePin = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      handleUpdateNote(noteId, { isPinned: !note.isPinned });
    }
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditData({
        title: note.title,
        content: note.content,
        category: note.category,
        priority: note.priority,
        tags: note.tags,
        reminderSettings: note.reminderSettings
      });
      setEditingNote(noteId);
    }
  };

  const handleSaveEdit = (noteId: string, updates: Partial<Note>) => {
    handleUpdateNote(noteId, updates);
    setEditingNote(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditData({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const renderNoteCard = (note: Note) => {
    if (editingNote === note.id && editData) {
      return (
        <NeumorphicCard key={note.id} variant="elevated" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Edit Note</h3>
            <div className="flex space-x-2">
              <NeumorphicButton
                variant="primary"
                size="sm"
                onClick={() => handleSaveEdit(note.id, editData)}
              >
                Save
              </NeumorphicButton>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </NeumorphicButton>
            </div>
          </div>

          <div className="space-y-3">
            <NeumorphicInput
              placeholder="Note title..."
              value={editData.title || ''}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />

            <textarea
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800 resize-none"
              placeholder="Note content..."
              rows={4}
              value={editData.content || ''}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={editData.category || note.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value as Note['category'] })}
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="shopping">Shopping</option>
                <option value="ideas">Ideas</option>
                <option value="reminders">Reminders</option>
                <option value="shared">Shared</option>
                <option value="other">Other</option>
              </select>

              <select
                className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={editData.priority || note.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value as Note['priority'] })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </NeumorphicCard>
      );
    }

    return (
      <NeumorphicCard 
        key={note.id} 
        variant="elevated" 
        className={`p-4 transition-all duration-200 hover:shadow-lg ${
          note.author === 'Person1' 
            ? 'border-l-4 border-blue-300' 
            : 'border-l-4 border-purple-300'
        } ${note.isCompleted ? 'opacity-60' : ''}`}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPartnerColor(note.author, 'avatar')}`}>
                <span className="text-white text-sm font-bold">{getPartnerAvatar(note.author)}</span>
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${note.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {note.title}
                </h3>
                <p className="text-sm text-gray-500">{note.author} • {formatDate(note.updatedAt)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {note.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
              {note.reminderSettings.enabled && <Bell className="h-4 w-4 text-blue-500" />}
              {!note.isCompleted && (
                <NeumorphicButton
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 className="h-3 w-3" />}
                  onClick={() => handleCompleteNote(note.id)}
                />
              )}
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<Edit className="h-3 w-3" />}
                onClick={() => handleEditNote(note.id)}
              />
              <NeumorphicButton
                variant="danger"
                size="sm"
                icon={<Trash2 className="h-3 w-3" />}
                onClick={() => handleDeleteNote(note.id)}
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-gray-700 text-sm">
            {note.content}
          </div>

          {/* Tags and Categories */}
          <div className="flex items-center space-x-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
              {note.category}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}>
              {note.priority}
            </span>
            {note.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                #{tag}
              </span>
            ))}
          </div>

          {/* Reminder Info */}
          {note.reminderSettings.enabled && note.reminderSettings.scheduledTime && (
            <div className="flex items-center space-x-1 text-sm text-blue-600">
              <Clock className="h-4 w-4" />
              <span>Reminder: {formatDate(note.reminderSettings.scheduledTime)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={note.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              onClick={() => handleTogglePin(note.id)}
            >
              {note.isPinned ? 'Unpin' : 'Pin'}
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicCard>
    );
  };

  const renderAddModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <NeumorphicCard variant="elevated" className="w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Note</h3>
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={() => setShowAddModal(false)}
            />
          </div>

          <div className="space-y-4">
            <NeumorphicInput
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />

            <textarea
              className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800 resize-none"
              placeholder="Note content..."
              rows={4}
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={newNote.author}
                onChange={(e) => setNewNote({ ...newNote, author: e.target.value as 'Person1' | 'Person2' })}
              >
                <option value="Person1">Person1</option>
                <option value="Person2">Person2</option>
              </select>

              <select
                className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value as Note['category'] })}
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="shopping">Shopping</option>
                <option value="ideas">Ideas</option>
                <option value="reminders">Reminders</option>
                <option value="shared">Shared</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={newNote.priority}
                onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as Note['priority'] })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newNote.isPinned}
                  onChange={(e) => setNewNote({ ...newNote, isPinned: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Pin Note</span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newNote.reminderEnabled}
                  onChange={(e) => setNewNote({ ...newNote, reminderEnabled: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Set Reminder</span>
              </label>

              {newNote.reminderEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <NeumorphicInput
                    type="date"
                    value={newNote.reminderDate}
                    onChange={(e) => setNewNote({ ...newNote, reminderDate: e.target.value })}
                  />
                  <NeumorphicInput
                    type="time"
                    value={newNote.reminderTime}
                    onChange={(e) => setNewNote({ ...newNote, reminderTime: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <NeumorphicButton
                variant="primary"
                onClick={handleCreateNote}
                className="flex-1"
              >
                Create Note
              </NeumorphicButton>
              <NeumorphicButton
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                Cancel
              </NeumorphicButton>
            </div>
          </div>
        </NeumorphicCard>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes & Reminders</h1>
          <p className="text-gray-600">Person1 & Person2's shared notes with pop-up reminders</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <NeumorphicButton
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Note
          </NeumorphicButton>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex-1">
          <NeumorphicInput
            variant="search"
            placeholder="Search notes..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <NeumorphicButton
          variant="secondary"
          icon={<Filter className="h-4 w-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filter
        </NeumorphicButton>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <NeumorphicCard variant="elevated" className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Authors</label>
              <div className="space-y-2">
                {['Person1', 'Person2'].map(author => (
                  <label key={author} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.authors.includes(author as 'Person1' | 'Person2')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilter({ ...filter, authors: [...filter.authors, author as 'Person1' | 'Person2'] });
                        } else {
                          setFilter({ ...filter, authors: filter.authors.filter(a => a !== author) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{author}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="space-y-2">
                {['personal', 'work', 'shopping', 'ideas', 'reminders', 'shared', 'other'].map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.categories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilter({ ...filter, categories: [...filter.categories, category] });
                        } else {
                          setFilter({ ...filter, categories: filter.categories.filter(c => c !== category) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="space-y-2">
                {['low', 'medium', 'high', 'urgent'].map(priority => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.priority.includes(priority)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilter({ ...filter, priority: [...filter.priority, priority] });
                        } else {
                          setFilter({ ...filter, priority: filter.priority.filter(p => p !== priority) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{priority}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.completed === false}
                    onChange={(e) => setFilter({ ...filter, completed: e.target.checked ? false : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">Pending</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.completed === true}
                    onChange={(e) => setFilter({ ...filter, completed: e.target.checked ? true : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">Completed</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.pinned === true}
                    onChange={(e) => setFilter({ ...filter, pinned: e.target.checked ? true : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">Pinned</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.hasReminders === true}
                    onChange={(e) => setFilter({ ...filter, hasReminders: e.target.checked ? true : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">With Reminders</span>
                </label>
              </div>
            </div>
          </div>
        </NeumorphicCard>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(renderNoteCard)}
      </div>

      {filteredNotes.length === 0 && (
        <NeumorphicCard variant="inset" className="p-8 text-center">
          <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || Object.values(filter).some(f => Array.isArray(f) ? f.length > 0 : f !== undefined)
              ? 'Try adjusting your search or filters'
              : 'Create your first note to get started'
            }
          </p>
          {!searchQuery && !Object.values(filter).some(f => Array.isArray(f) ? f.length > 0 : f !== undefined) && (
            <NeumorphicButton
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Your First Note
            </NeumorphicButton>
          )}
        </NeumorphicCard>
      )}

      {/* Add Modal */}
      {renderAddModal()}
    </div>
  );
};
