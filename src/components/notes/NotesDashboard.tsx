import React, { useState, useEffect } from 'react';
import { 
  StickyNote, 
  Plus, 
  Pin, 
  Bell, 
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';

interface Note {
  id: string;
  title: string;
  content: string;
  author: 'Jay' | 'Prachi';
  category: 'personal' | 'work' | 'shopping' | 'ideas' | 'reminders' | 'shared' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPinned: boolean;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: 'Jay' | 'Prachi';
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
  lastEditedBy: 'Jay' | 'Prachi';
  isDeleted: boolean;
  deletedAt?: string;
  version: number;
}

interface NotesDashboardProps {
  className?: string;
  onOpenNotes?: () => void;
}

export const NotesDashboard: React.FC<NotesDashboardProps> = ({ 
  className = '',
  onOpenNotes 
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pinnedNotes, setPinnedNotes] = useState<Note[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [notesWithReminders, setNotesWithReminders] = useState<Note[]>([]);

  useEffect(() => {
    // Initialize with empty state
    setNotes([]);
    setPinnedNotes([]);
    setRecentNotes([]);
    setNotesWithReminders([]);
  }, []);

  const getPartnerColor = (partner: 'Jay' | 'Prachi', type: 'primary' | 'secondary' | 'border' | 'text' | 'glow' | 'avatar' | 'popup' | 'button' = 'primary') => {
    const colors = {
      'Jay': {
        primary: 'bg-blue-100',
        secondary: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        glow: 'shadow-blue-200',
        avatar: 'bg-blue-500',
        popup: 'bg-blue-50 border-blue-200',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      'Prachi': {
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

  const getPartnerAvatar = (partner: 'Jay' | 'Prachi') => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getTimeUntilReminder = (dateString: string) => {
    const now = new Date();
    const reminderDate = new Date(dateString);
    const diffMs = reminderDate.getTime() - now.getTime();
    
    if (diffMs < 0) return null;
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m`;
  };

  const handleCompleteNote = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, isCompleted: true, completedAt: new Date().toISOString(), completedBy: note.author }
        : note
    ));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Notes & Reminders</h2>
        <NeumorphicButton
          variant="secondary"
          size="sm"
          onClick={onOpenNotes}
        >
          View All
        </NeumorphicButton>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Pinned Notes</h3>
          {pinnedNotes.slice(0, 2).map((note) => (
            <NeumorphicCard 
              key={note.id} 
              variant="elevated" 
              className={`p-3 transition-all duration-200 hover:shadow-md ${
                note.author === 'Jay' 
                  ? 'border-l-4 border-blue-300' 
                  : 'border-l-4 border-purple-300'
              } ${note.isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPartnerColor(note.author, 'avatar')}`}>
                    <span className="text-white text-sm font-bold">{getPartnerAvatar(note.author)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${note.isCompleted ? 'line-through' : ''}`}>
                      {note.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {note.content}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Pin className="h-3 w-3 text-yellow-500" />
                  {note.reminderSettings.enabled && (
                    <Bell className="h-3 w-3 text-blue-500" />
                  )}
                  {!note.isCompleted && (
                    <NeumorphicButton
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 className="h-3 w-3" />}
                      onClick={() => handleCompleteNote(note.id)}
                    />
                  )}
                </div>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      )}

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Recent Notes</h3>
          {recentNotes.slice(0, 2).map((note) => (
            <NeumorphicCard 
              key={note.id} 
              variant="inset" 
              className={`p-3 transition-all duration-200 hover:shadow-sm ${
                note.author === 'Jay' 
                  ? 'border-l-2 border-blue-200' 
                  : 'border-l-2 border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getPartnerColor(note.author, 'avatar')}`}>
                    <span className="text-white text-xs font-bold">{getPartnerAvatar(note.author)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{note.title}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(note.updatedAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                    {note.category}
                  </span>
                  {note.reminderSettings.enabled && note.reminderSettings.scheduledTime && (
                    <span className="text-xs text-blue-600 font-medium">
                      {getTimeUntilReminder(note.reminderSettings.scheduledTime)}
                    </span>
                  )}
                </div>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      )}

      {/* Upcoming Reminders */}
      {notesWithReminders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Upcoming Reminders</h3>
          {notesWithReminders.slice(0, 2).map((note) => (
            <NeumorphicCard 
              key={note.id} 
              variant="inset" 
              className={`p-3 transition-all duration-200 hover:shadow-sm ${
                note.author === 'Jay' 
                  ? 'border-l-2 border-blue-200' 
                  : 'border-l-2 border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">{note.title}</div>
                    <div className="text-xs text-gray-500">
                      {note.reminderSettings.scheduledTime && formatDate(note.reminderSettings.scheduledTime)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getPartnerColor(note.author, 'avatar')}`}>
                    <span className="text-white text-xs font-bold">{getPartnerAvatar(note.author)}</span>
                  </div>
                  {note.reminderSettings.scheduledTime && (
                    <span className="text-xs text-blue-600 font-medium">
                      {getTimeUntilReminder(note.reminderSettings.scheduledTime)}
                    </span>
                  )}
                </div>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      )}

      {/* Quick Add */}
      <NeumorphicCard variant="elevated" className="p-3">
        <NeumorphicButton
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={onOpenNotes}
          className="w-full"
        >
          Add New Note
        </NeumorphicButton>
      </NeumorphicCard>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <NeumorphicCard variant="inset" className="p-3 text-center">
          <div className="text-lg font-bold text-gray-900">{notes.filter(n => !n.isCompleted && !n.isDeleted).length}</div>
          <div className="text-xs text-gray-500">Active Notes</div>
        </NeumorphicCard>
        <NeumorphicCard variant="inset" className="p-3 text-center">
          <div className="text-lg font-bold text-gray-900">{notesWithReminders.length}</div>
          <div className="text-xs text-gray-500">With Reminders</div>
        </NeumorphicCard>
      </div>
    </div>
  );
};
