import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Target,
  Heart,
  Trophy,
  Sparkles,
  MoreHorizontal,
  Mic,
  MicOff
} from 'lucide-react';
import { BucketListItem, BucketListFilter } from '@/services/bucketListService';
import { bucketListService } from '@/services/bucketListService';
import { useResponsive } from '@/hooks/use-responsive';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { BucketListCard } from './BucketListCard';
import { BucketListDetailModal } from './BucketListDetailModal';
import { BucketListStats } from './BucketListStats';
import { useAnimation } from '@/components/animations/AnimationProvider';

interface BucketListManagerProps {
  className?: string;
}

export const BucketListManager: React.FC<BucketListManagerProps> = ({ className = '' }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { showConfetti, showCheckmark } = useAnimation();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BucketListItem[]>([]);
  const [filter, setFilter] = useState<BucketListFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'targetDate' | 'createdAt'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<BucketListItem>>({});
  const [showTrash, setShowTrash] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BucketListItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // New item form
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'travel' as BucketListItem['category'],
    priority: 'medium' as BucketListItem['priority'],
    targetDate: '',
    estimatedCost: '',
    currency: 'USD' as BucketListItem['currency'],
    location: '',
    tags: [] as string[],
    assignedTo: [] as string[],
    notes: '',
    inspiration: '',
    difficulty: 'medium' as BucketListItem['difficulty'],
    timeRequired: 'months' as BucketListItem['timeRequired']
  });

  // Partner names for Person1 and Person2
  const partners = ['Person1', 'Person2'];
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Subscribe to item updates
    const unsubscribe = bucketListService.subscribe((updatedItems) => {
      setItems(updatedItems);
    });

    // Load initial data
    const initialItems = bucketListService.getItems();
    setItems(initialItems);

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = bucketListService.getItems(filter, searchQuery);

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'dream': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'targetDate':
          aValue = a.targetDate ? new Date(a.targetDate).getTime() : 0;
          bValue = b.targetDate ? new Date(b.targetDate).getTime() : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  }, [items, searchQuery, filter, sortBy, sortOrder]);

  const handleCreateItem = () => {
    if (newItem.title.trim()) {
      const itemData = {
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        priority: newItem.priority,
        status: 'not-started' as const,
        progress: 0,
        targetDate: newItem.targetDate || undefined,
        estimatedCost: newItem.estimatedCost ? parseFloat(newItem.estimatedCost) : undefined,
        currency: newItem.currency,
        location: newItem.location || undefined,
        tags: newItem.tags,
        assignedTo: newItem.assignedTo,
        subtasks: [],
        attachments: [],
        isShared: newItem.assignedTo.length > 1,
        notes: newItem.notes,
        inspiration: newItem.inspiration || undefined,
        difficulty: newItem.difficulty,
        timeRequired: newItem.timeRequired
      };

      bucketListService.createItem(itemData);
      setNewItem({
        title: '',
        description: '',
        category: 'travel',
        priority: 'medium',
        targetDate: '',
        estimatedCost: '',
        currency: 'USD',
        location: '',
        tags: [],
        assignedTo: [],
        notes: '',
        inspiration: '',
        difficulty: 'medium',
        timeRequired: 'months'
      });
      setShowAddItem(false);
      showCheckmark();
    }
  };

  const handleUpdateItem = (itemId: string, updates: Partial<BucketListItem>) => {
    const item = items.find(i => i.id === itemId);
    if (item && updates.status === 'completed' && item.status !== 'completed') {
      showConfetti();
    }
    bucketListService.updateItem(itemId, updates);
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this bucket list item? It will be moved to trash.')) {
      bucketListService.deleteItem(itemId);
    }
  };

  const handleEditItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setEditData({
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        targetDate: item.targetDate,
        estimatedCost: item.estimatedCost,
        currency: item.currency,
        location: item.location,
        tags: item.tags,
        assignedTo: item.assignedTo,
        notes: item.notes,
        inspiration: item.inspiration,
        difficulty: item.difficulty,
        timeRequired: item.timeRequired
      });
      setEditingItem(itemId);
    }
  };

  const handleSaveEdit = (itemId: string, updates: Partial<BucketListItem>) => {
    bucketListService.updateItem(itemId, updates);
    setEditingItem(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditData({});
  };

  const handleToggleSubtask = (itemId: string, subtaskId: string) => {
    bucketListService.toggleSubtask(itemId, subtaskId);
  };

  const handleAddSubtask = (itemId: string, title: string, assignedTo: string) => {
    bucketListService.addSubtask(itemId, title, assignedTo);
  };

  const handleDeleteSubtask = (itemId: string, subtaskId: string) => {
    bucketListService.deleteSubtask(itemId, subtaskId);
  };

  const handleUpdateProgress = (itemId: string, progress: number) => {
    bucketListService.updateProgress(itemId, progress);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewItem(prev => ({ ...prev, title: transcript }));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const getPriorityIcon = (priority: BucketListItem['priority']) => {
    switch (priority) {
      case 'dream': return <Sparkles className="h-4 w-4" />;
      case 'high': return <Target className="h-4 w-4" />;
      case 'medium': return <Star className="h-4 w-4" />;
      case 'low': return <Heart className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: BucketListItem['category']) => {
    switch (category) {
      case 'travel': return <MapPin className="h-4 w-4" />;
      case 'experiences': return <Sparkles className="h-4 w-4" />;
      case 'goals': return <Target className="h-4 w-4" />;
      case 'adventures': return <Trophy className="h-4 w-4" />;
      case 'romantic': return <Heart className="h-4 w-4" />;
      case 'personal': return <Star className="h-4 w-4" />;
      case 'career': return <Target className="h-4 w-4" />;
      case 'health': return <Heart className="h-4 w-4" />;
      case 'learning': return <Star className="h-4 w-4" />;
      case 'family': return <Heart className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredItems.map((item) => (
        <div key={item.id} className="w-full">
          <BucketListCard
            item={item}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtask={handleAddSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onUpdateProgress={handleUpdateProgress}
            onViewDetails={(item) => {
              setSelectedItem(item);
              setShowDetailModal(true);
            }}
            isEditing={editingItem === item.id}
            editData={editData}
            onEditDataChange={setEditData}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            compact={false}
          />
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <div key={item.id} className="w-full">
          <BucketListCard
            item={item}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtask={handleAddSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onUpdateProgress={handleUpdateProgress}
            onViewDetails={(item) => {
              setSelectedItem(item);
              setShowDetailModal(true);
            }}
            isEditing={editingItem === item.id}
            editData={editData}
            onEditDataChange={setEditData}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            compact={true}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bucket List</h2>
          <p className="text-gray-600">Dream big, achieve together</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <NeumorphicButton
            variant="secondary"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => setShowTrash(true)}
          />
          <NeumorphicButton
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddItem(true)}
          >
            {isMobile ? 'Add' : 'Add Item'}
          </NeumorphicButton>
        </div>
      </div>

      {/* Stats */}
      <BucketListStats />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <NeumorphicInput
            placeholder="Search bucket list items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <NeumorphicButton
            variant="secondary"
            icon={<Filter className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
          />
          
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <NeumorphicCard variant="elevated" className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full p-2 bg-gray-100 rounded-xl border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-gray-800"
                value={filter.status?.[0] || ''}
                onChange={(e) => setFilter({ ...filter, status: e.target.value ? [e.target.value] : undefined })}
              >
                <option value="">All Status</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                className="w-full p-2 bg-gray-100 rounded-xl border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-gray-800"
                value={filter.priority?.[0] || ''}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value ? [e.target.value] : undefined })}
              >
                <option value="">All Priorities</option>
                <option value="dream">Dream</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="w-full p-2 bg-gray-100 rounded-xl border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-gray-800"
                value={filter.category?.[0] || ''}
                onChange={(e) => setFilter({ ...filter, category: e.target.value ? [e.target.value] : undefined })}
              >
                <option value="">All Categories</option>
                <option value="travel">Travel</option>
                <option value="experiences">Experiences</option>
                <option value="goals">Goals</option>
                <option value="adventures">Adventures</option>
                <option value="romantic">Romantic</option>
                <option value="personal">Personal</option>
                <option value="career">Career</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="family">Family</option>
              </select>
            </div>
          </div>
        </NeumorphicCard>
      )}

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <NeumorphicCard variant="elevated" className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bucket list items found</h3>
          <p className="text-gray-800 mb-4">
            {searchQuery || Object.keys(filter).length > 0 
              ? 'Try adjusting your search or filters'
              : 'Start adding your dreams and goals!'
            }
          </p>
          {!searchQuery && Object.keys(filter).length === 0 && (
            <NeumorphicButton
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddItem(true)}
            >
              Add Your First Item
            </NeumorphicButton>
          )}
        </NeumorphicCard>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <NeumorphicCard variant="elevated" className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Bucket List Item</h3>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<MoreHorizontal className="h-4 w-4" />}
                onClick={() => setShowAddItem(false)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <NeumorphicInput
                  placeholder="What's your dream?"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="flex-1"
                />
                <NeumorphicButton
                  variant="secondary"
                  icon={isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  onClick={handleVoiceInput}
                />
              </div>
              
              <NeumorphicInput
                placeholder="Describe your dream..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as BucketListItem['category'] })}
                >
                  <option value="travel">🌍 Travel</option>
                  <option value="experiences">✨ Experiences</option>
                  <option value="goals">🎯 Goals</option>
                  <option value="adventures">🏆 Adventures</option>
                  <option value="romantic">💕 Romantic</option>
                  <option value="personal">⭐ Personal</option>
                  <option value="career">💼 Career</option>
                  <option value="health">💪 Health</option>
                  <option value="learning">📚 Learning</option>
                  <option value="family">👨‍👩‍👧‍👦 Family</option>
                </select>
                
                <select
                  className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as BucketListItem['priority'] })}
                >
                  <option value="low">💚 Low</option>
                  <option value="medium">💛 Medium</option>
                  <option value="high">🧡 High</option>
                  <option value="dream">✨ Dream</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <NeumorphicInput
                  type="date"
                  placeholder="Target date"
                  value={newItem.targetDate}
                  onChange={(e) => setNewItem({ ...newItem, targetDate: e.target.value })}
                />
                
                <div className="flex space-x-2">
                  <NeumorphicInput
                    type="number"
                    placeholder="Estimated cost"
                    value={newItem.estimatedCost}
                    onChange={(e) => setNewItem({ ...newItem, estimatedCost: e.target.value })}
                    className="flex-1"
                  />
                  <select
                    className="w-20 p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                    value={newItem.currency}
                    onChange={(e) => setNewItem({ ...newItem, currency: e.target.value as BucketListItem['currency'] })}
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>
              
              <NeumorphicInput
                placeholder="Location (optional)"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
              />
              
              {/* Partner Assignment */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assign to:</label>
                <div className="flex space-x-2">
                  {partners.map((partner) => (
                    <button
                      key={partner}
                      onClick={() => {
                        const isAssigned = newItem.assignedTo.includes(partner);
                        const updatedAssignedTo = isAssigned
                          ? newItem.assignedTo.filter(p => p !== partner)
                          : [...newItem.assignedTo, partner];
                        setNewItem({ ...newItem, assignedTo: updatedAssignedTo });
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newItem.assignedTo.includes(partner)
                          ? partner === 'Person1' ? 'bg-blue-500 text-white shadow-lg' : 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {partner}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={newItem.difficulty}
                  onChange={(e) => setNewItem({ ...newItem, difficulty: e.target.value as BucketListItem['difficulty'] })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="extreme">Extreme</option>
                </select>
                
                <select
                  className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={newItem.timeRequired}
                  onChange={(e) => setNewItem({ ...newItem, timeRequired: e.target.value as BucketListItem['timeRequired'] })}
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
              
              <NeumorphicInput
                placeholder="Why is this important to you? (inspiration)"
                value={newItem.inspiration}
                onChange={(e) => setNewItem({ ...newItem, inspiration: e.target.value })}
              />
              
              <NeumorphicInput
                placeholder="Additional notes..."
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              />
              
              <div className="flex space-x-3">
                <NeumorphicButton
                  variant="primary"
                  onClick={handleCreateItem}
                  className="flex-1"
                >
                  Add to Bucket List
                </NeumorphicButton>
                <NeumorphicButton
                  variant="secondary"
                  onClick={() => setShowAddItem(false)}
                  className="flex-1"
                >
                  Cancel
                </NeumorphicButton>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <BucketListDetailModal
          item={selectedItem}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onUpdate={handleUpdateItem}
          onDelete={handleDeleteItem}
          onToggleSubtask={handleToggleSubtask}
          onAddSubtask={handleAddSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onUpdateProgress={handleUpdateProgress}
        />
      )}

      {/* Trash Modal */}
      {showTrash && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <NeumorphicCard variant="elevated" className="w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Trash</h3>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<MoreHorizontal className="h-4 w-4" />}
                onClick={() => setShowTrash(false)}
              />
            </div>
            
            <div className="space-y-3">
              {items.filter(item => item.isDeleted).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">Deleted {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : 'recently'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <NeumorphicButton
                      variant="secondary"
                      size="sm"
                      onClick={() => bucketListService.restoreItem(item.id)}
                    >
                      Restore
                    </NeumorphicButton>
                    <NeumorphicButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Permanently delete this item?')) {
                          bucketListService.permanentlyDeleteItem(item.id);
                        }
                      }}
                    >
                      Delete
                    </NeumorphicButton>
                  </div>
                </div>
              ))}
              
              {items.filter(item => item.isDeleted).length === 0 && (
                <p className="text-center text-gray-600 py-8">No deleted items</p>
              )}
            </div>
          </NeumorphicCard>
        </div>
      )}
    </div>
  );
};
