import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Filter, 
  Search,
  MapPin,
  Users,
  Tag,
  Bell,
  Repeat,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  BarChart3,
  Activity,
  X
} from 'lucide-react';
import { 
  ScheduleItem, 
  ScheduleFilter 
} from '@/services/scheduleService';
import { scheduleService } from '@/services/scheduleService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { useResponsive } from '@/hooks/use-responsive';
import { ConfettiAnimation } from '@/components/animations/ConfettiAnimation';
import { CheckmarkAnimation } from '@/components/animations/CheckmarkAnimation';

interface ScheduleManagerProps {
  className?: string;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ className = '' }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ScheduleItem[]>([]);
  const [activeView, setActiveView] = useState<'timeline' | 'calendar' | 'list'>('timeline');
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('weekly');
  const [filter, setFilter] = useState<ScheduleFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ScheduleItem>>({});
  const [showAnimations, setShowAnimations] = useState<{ confetti: boolean; checkmark: boolean }>({ confetti: false, checkmark: false });
  const [currentDate, setCurrentDate] = useState(new Date());

  // New item form
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    allDay: false,
    location: '',
    assignedPartners: ['Jay'] as string[],
    priority: 'medium' as ScheduleItem['priority'],
    category: 'personal' as ScheduleItem['category'],
    tags: [] as string[],
    mood: 'neutral' as ScheduleItem['mood'],
    reminderEnabled: true,
    reminderMinutes: 15,
    reminderHours: 0,
    reminderDays: 0,
    repeatType: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
    repeatInterval: 1
  });

  useEffect(() => {
    // Subscribe to schedule updates
    const unsubscribe = scheduleService.subscribe((updatedItems) => {
      setScheduleItems(updatedItems);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = [...scheduleItems];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply other filters
    if (filter.partners && filter.partners.length > 0) {
      filtered = filtered.filter(item => 
        item.assignedPartners.some(partner => filter.partners!.includes(partner))
      );
    }
    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter(item => filter.categories!.includes(item.category));
    }
    if (filter.priority && filter.priority.length > 0) {
      filtered = filtered.filter(item => filter.priority!.includes(item.priority));
    }
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(item => 
        item.tags.some(tag => filter.tags!.includes(tag))
      );
    }
    if (filter.completed !== undefined) {
      filtered = filtered.filter(item => item.isCompleted === filter.completed);
    }

    // Apply date range filter based on view mode
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (viewMode) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      default:
        startDate = new Date(0);
        endDate = new Date(9999, 11, 31);
    }

    filtered = filtered.filter(item => {
      const itemDate = new Date(item.startDate);
      return itemDate >= startDate && itemDate < endDate;
    });

    setFilteredItems(filtered);
  }, [scheduleItems, searchQuery, filter, viewMode, currentDate]);

  const handleCreateItem = () => {
    if (newItem.title.trim()) {
      const itemData: Partial<ScheduleItem> = {
        title: newItem.title,
        description: newItem.description,
        startDate: new Date(newItem.startDate).toISOString(),
        endDate: newItem.endDate ? new Date(newItem.endDate).toISOString() : undefined,
        allDay: newItem.allDay,
        location: newItem.location,
        assignedPartners: newItem.assignedPartners,
        priority: newItem.priority,
        category: newItem.category,
        tags: newItem.tags,
        mood: newItem.mood,
        reminderSettings: {
          enabled: newItem.reminderEnabled,
          minutesBefore: newItem.reminderMinutes,
          hoursBefore: newItem.reminderHours,
          daysBefore: newItem.reminderDays
        }
      };

      if (newItem.repeatType !== 'none') {
        itemData.repeatPattern = {
          type: newItem.repeatType as 'daily' | 'weekly' | 'monthly' | 'yearly',
          interval: newItem.repeatInterval
        };
      }

      scheduleService.createScheduleItem(itemData);
      
      setNewItem({
        title: '',
        description: '',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
        allDay: false,
        location: '',
        assignedPartners: ['Jay'],
        priority: 'medium',
        category: 'personal',
        tags: [],
        mood: 'neutral',
        reminderEnabled: true,
        reminderMinutes: 15,
        reminderHours: 0,
        reminderDays: 0,
        repeatType: 'none',
        repeatInterval: 1
      });
      setShowAddModal(false);
      setShowAnimations(prev => ({ ...prev, checkmark: true }));
      setTimeout(() => setShowAnimations(prev => ({ ...prev, checkmark: false })), 2000);
    }
  };

  const handleUpdateItem = (itemId: string, updates: Partial<ScheduleItem>) => {
    scheduleService.updateScheduleItem(itemId, updates);
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      scheduleService.deleteScheduleItem(itemId);
    }
  };

  const handleCompleteItem = (itemId: string) => {
    scheduleService.completeScheduleItem(itemId);
    setShowAnimations(prev => ({ ...prev, confetti: true }));
    setTimeout(() => setShowAnimations(prev => ({ ...prev, confetti: false })), 3000);
  };

  const handleEditItem = (itemId: string) => {
    const item = scheduleItems.find(i => i.id === itemId);
    if (item) {
      setEditData({
        title: item.title,
        description: item.description,
        startDate: item.startDate,
        endDate: item.endDate,
        allDay: item.allDay,
        location: item.location,
        assignedPartners: item.assignedPartners,
        priority: item.priority,
        category: item.category,
        tags: item.tags,
        mood: item.mood
      });
      setEditingItem(itemId);
    }
  };

  const handleSaveEdit = (itemId: string, updates: Partial<ScheduleItem>) => {
    scheduleService.updateScheduleItem(itemId, updates);
    setEditingItem(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditData({});
  };

  const getPartnerColor = (partner: string, type: 'primary' | 'secondary' | 'border' | 'text' | 'glow' | 'avatar' = 'primary') => {
    return scheduleService.getPartnerColor(partner, type);
  };

  const getCategoryColor = (category: ScheduleItem['category']) => {
    const colors: { [key: string]: string } = {
      work: 'bg-blue-100 text-blue-700',
      personal: 'bg-green-100 text-green-700',
      health: 'bg-red-100 text-red-700',
      social: 'bg-purple-100 text-purple-700',
      travel: 'bg-yellow-100 text-yellow-700',
      finance: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.other;
  };

  const getPriorityColor = (priority: ScheduleItem['priority']) => {
    const colors: { [key: string]: string } = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  const getMoodEmoji = (mood?: ScheduleItem['mood']) => {
    const emojis: { [key: string]: string } = {
      excited: '😊',
      stressed: '😰',
      neutral: '😐',
      happy: '😄',
      anxious: '😟'
    };
    return emojis[mood || 'neutral'] || '😐';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTimelineView = () => {
    return (
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <NeumorphicCard 
            key={item.id} 
            variant="elevated" 
            className={`p-4 transition-all duration-200 hover:shadow-lg ${
              item.assignedPartners.includes('Jay') ? 'border-l-4 border-blue-300' : 'border-l-4 border-purple-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className={`font-semibold text-lg ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                  {item.mood && (
                    <span className="text-lg">{getMoodEmoji(item.mood)}</span>
                  )}
                  {item.repeatPattern && (
                    <Repeat className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                {item.description && (
                  <p className="text-gray-600 mb-2">{item.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(item.startDate)}</span>
                    {!item.allDay && (
                      <span>at {formatTime(item.startDate)}</span>
                    )}
                  </div>
                  
                  {item.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                  {item.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  {item.assignedPartners.map((partner) => (
                    <div
                      key={partner}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPartnerColor(partner, 'primary')} ${getPartnerColor(partner, 'text')}`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${getPartnerColor(partner, 'avatar')}`}>
                        {scheduleService.getPartnerAvatar(partner)}
                      </div>
                      <span>{partner}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {!item.isCompleted && (
                  <NeumorphicButton
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    onClick={() => handleCompleteItem(item.id)}
                  >
                    Complete
                  </NeumorphicButton>
                )}
                <NeumorphicButton
                  variant="secondary"
                  size="sm"
                  icon={<Edit className="h-4 w-4" />}
                  onClick={() => handleEditItem(item.id)}
                />
                <NeumorphicButton
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => handleDeleteItem(item.id)}
                />
              </div>
            </div>
          </NeumorphicCard>
        ))}
      </div>
    );
  };

  const renderCalendarView = () => {
    // Simplified calendar view - in a real app, this would be more sophisticated
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="text-center text-gray-500 py-8">
          Calendar view coming soon...
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
              item.assignedPartners.includes('Jay') ? 'border-blue-300 bg-blue-50' : 'border-purple-300 bg-purple-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                item.assignedPartners.includes('Jay') ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                <span className="text-white text-sm font-bold">
                  {item.assignedPartners.includes('Jay') ? 'J' : 'P'}
                </span>
              </div>
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-gray-500">
                  {formatDate(item.startDate)} {!item.allDay && formatTime(item.startDate)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!item.isCompleted && (
                <NeumorphicButton
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 className="h-3 w-3" />}
                  onClick={() => handleCompleteItem(item.id)}
                />
              )}
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<Edit className="h-3 w-3" />}
                onClick={() => handleEditItem(item.id)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAddModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <NeumorphicCard variant="elevated" className="w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Schedule Item</h3>
            <NeumorphicButton
              variant="secondary"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={() => setShowAddModal(false)}
            />
          </div>

          <div className="space-y-4">
            <NeumorphicInput
              placeholder="Event title..."
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            />

            <NeumorphicInput
              placeholder="Description..."
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <NeumorphicInput
                type="datetime-local"
                value={newItem.startDate}
                onChange={(e) => setNewItem({ ...newItem, startDate: e.target.value })}
              />
              <NeumorphicInput
                type="datetime-local"
                value={newItem.endDate}
                onChange={(e) => setNewItem({ ...newItem, endDate: e.target.value })}
              />
            </div>

            <NeumorphicInput
              placeholder="Location..."
              value={newItem.location}
              onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as ScheduleItem['priority'] })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ScheduleItem['category'] })}
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="social">Social</option>
                <option value="travel">Travel</option>
                <option value="finance">Finance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <NeumorphicButton
                variant="primary"
                onClick={handleCreateItem}
                className="flex-1"
              >
                Create Event
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
      {/* Animations */}
      {showAnimations.confetti && (
        <ConfettiAnimation 
          isActive={showAnimations.confetti} 
          onComplete={() => setShowAnimations(prev => ({ ...prev, confetti: false }))} 
        />
      )}
      {showAnimations.checkmark && (
        <CheckmarkAnimation 
          isActive={showAnimations.checkmark} 
          onComplete={() => setShowAnimations(prev => ({ ...prev, checkmark: false }))} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600">Jay & Prachi's shared calendar</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <NeumorphicButton
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Event
          </NeumorphicButton>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex space-x-2">
          <NeumorphicButton
            variant={activeView === 'timeline' ? 'primary' : 'secondary'}
            icon={<Activity className="h-4 w-4" />}
            onClick={() => setActiveView('timeline')}
          >
            Timeline
          </NeumorphicButton>
          <NeumorphicButton
            variant={activeView === 'calendar' ? 'primary' : 'secondary'}
            icon={<Calendar className="h-4 w-4" />}
            onClick={() => setActiveView('calendar')}
          >
            Calendar
          </NeumorphicButton>
          <NeumorphicButton
            variant={activeView === 'list' ? 'primary' : 'secondary'}
            icon={<List className="h-4 w-4" />}
            onClick={() => setActiveView('list')}
          >
            List
          </NeumorphicButton>
        </div>

        {activeView === 'calendar' && (
          <div className="flex space-x-2">
            <NeumorphicButton
              variant={viewMode === 'monthly' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('monthly')}
            >
              Month
            </NeumorphicButton>
            <NeumorphicButton
              variant={viewMode === 'weekly' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('weekly')}
            >
              Week
            </NeumorphicButton>
            <NeumorphicButton
              variant={viewMode === 'daily' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('daily')}
            >
              Day
            </NeumorphicButton>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex-1">
          <NeumorphicInput
            variant="search"
            placeholder="Search events..."
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Partners</label>
              <div className="space-y-2">
                {['Jay', 'Prachi'].map(partner => (
                  <label key={partner} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.partners?.includes(partner) || false}
                      onChange={(e) => {
                        const currentPartners = filter.partners || [];
                        if (e.target.checked) {
                          setFilter({ ...filter, partners: [...currentPartners, partner] });
                        } else {
                          setFilter({ ...filter, partners: currentPartners.filter(p => p !== partner) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{partner}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="space-y-2">
                {['work', 'personal', 'health', 'social', 'travel', 'finance', 'other'].map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.categories?.includes(category) || false}
                      onChange={(e) => {
                        const currentCategories = filter.categories || [];
                        if (e.target.checked) {
                          setFilter({ ...filter, categories: [...currentCategories, category] });
                        } else {
                          setFilter({ ...filter, categories: currentCategories.filter(c => c !== category) });
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
                      checked={filter.priority?.includes(priority) || false}
                      onChange={(e) => {
                        const currentPriority = filter.priority || [];
                        if (e.target.checked) {
                          setFilter({ ...filter, priority: [...currentPriority, priority] });
                        } else {
                          setFilter({ ...filter, priority: currentPriority.filter(p => p !== priority) });
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
              </div>
            </div>
          </div>
        </NeumorphicCard>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {activeView === 'timeline' && renderTimelineView()}
        {activeView === 'calendar' && renderCalendarView()}
        {activeView === 'list' && renderListView()}
      </div>

      {/* Add Modal */}
      {renderAddModal()}
    </div>
  );
};
