import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  Trash2, 
  RotateCcw,
  Mic,
  MicOff,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Task, TaskFilter } from '@/services/taskManagerService';
import { taskManagerService } from '@/services/taskManagerService';
import { TaskCard } from './TaskCard';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { useResponsive } from '@/hooks/use-responsive';
import { ConfettiAnimation } from '@/components/animations/ConfettiAnimation';
import { CheckmarkAnimation } from '@/components/animations/CheckmarkAnimation';

interface TaskManagerProps {
  className?: string;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ className = '' }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [showTrash, setShowTrash] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAnimations, setShowAnimations] = useState<{ confetti: boolean; checkmark: boolean }>({ confetti: false, checkmark: false });
  
  // New task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    assignedTo: [] as string[],
    tags: [] as string[],
    category: 'shared-goals' as Task['category']
  });

  // Partner names for Person1 and Person2
  const partners = ['Person1', 'Person2'];

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Subscribe to task updates
    const unsubscribe = taskManagerService.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
    });

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewTask(prev => ({ ...prev, title: transcript }));
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply other filters
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(task => filter.status!.includes(task.status));
    }
    if (filter.priority && filter.priority.length > 0) {
      filtered = filtered.filter(task => filter.priority!.includes(task.priority));
    }
    if (filter.assignedTo && filter.assignedTo.length > 0) {
      filtered = filtered.filter(task => 
        task.assignedTo.some(assignee => filter.assignedTo!.includes(assignee))
      );
    }
    if (filter.category && filter.category.length > 0) {
      filtered = filtered.filter(task => filter.category!.includes(task.category));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, filter, sortBy, sortOrder]);

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      taskManagerService.createTask(newTask);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignedTo: [],
        tags: [],
        category: 'shared-goals'
      });
      setShowAddTask(false);
      setShowAnimations(prev => ({ ...prev, checkmark: true }));
      setTimeout(() => setShowAnimations(prev => ({ ...prev, checkmark: false })), 2000);
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && updates.status === 'completed' && task.status !== 'completed') {
      setShowAnimations(prev => ({ ...prev, confetti: true }));
      setTimeout(() => setShowAnimations(prev => ({ ...prev, confetti: false })), 3000);
    }
    taskManagerService.updateTask(taskId, updates);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task? It will be moved to trash.')) {
      taskManagerService.deleteTask(taskId);
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
        tags: task.tags,
        category: task.category
      });
      setEditingTask(taskId);
    }
  };

  const handleSaveEdit = (taskId: string, updates: Partial<Task>) => {
    taskManagerService.updateTask(taskId, updates);
    setEditingTask(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditData({});
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    taskManagerService.toggleSubtask(taskId, subtaskId);
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    taskManagerService.addSubtask(taskId, title);
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    taskManagerService.deleteSubtask(taskId, subtaskId);
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getStatusStats = () => {
    const stats = {
      todo: filteredTasks.filter(t => t.status === 'todo').length,
      'in-progress': filteredTasks.filter(t => t.status === 'in-progress').length,
      completed: filteredTasks.filter(t => t.status === 'completed').length,
      blocked: filteredTasks.filter(t => t.status === 'blocked').length
    };
    return stats;
  };

  const stats = getStatusStats();

  const renderKanbanColumn = (status: Task['status'], title: string, color: string) => {
    const columnTasks = getTasksByStatus(status);
    
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold text-lg ${color}`}>{title}</h3>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {columnTasks.length}
          </span>
        </div>
        
        <div className="space-y-3 min-h-[400px]">
          {columnTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onAddSubtask={handleAddSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              isEditing={editingTask === task.id}
              onEdit={handleEditTask}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              editData={editData}
              onEditDataChange={setEditData}
              compact={isMobile}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtask={handleAddSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            isEditing={editingTask === task.id}
            onEdit={handleEditTask}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            editData={editData}
            onEditDataChange={setEditData}
            compact={isMobile}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Animations */}
      {showAnimations.confetti && <ConfettiAnimation />}
      {showAnimations.checkmark && <CheckmarkAnimation />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-600">Collaborate on tasks with your partner</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <NeumorphicButton
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddTask(true)}
          >
            {isMobile ? 'Add' : 'Add Task'}
          </NeumorphicButton>
          
          <NeumorphicButton
            variant="secondary"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => setShowTrash(true)}
          >
            Trash
          </NeumorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <NeumorphicCard variant="inset" className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.todo}</div>
          <div className="text-sm text-gray-600">To Do</div>
        </NeumorphicCard>
        <NeumorphicCard variant="inset" className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats['in-progress']}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </NeumorphicCard>
        <NeumorphicCard variant="inset" className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </NeumorphicCard>
        <NeumorphicCard variant="inset" className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          <div className="text-sm text-gray-600">Blocked</div>
        </NeumorphicCard>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex-1">
          <NeumorphicInput
            variant="search"
            placeholder="Search tasks..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <NeumorphicButton
            variant="secondary"
            icon={<Filter className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </NeumorphicButton>
          
          {isDesktop && (
            <NeumorphicButton
              variant="secondary"
              icon={viewMode === 'kanban' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
            >
              {viewMode === 'kanban' ? 'List' : 'Kanban'}
            </NeumorphicButton>
          )}
          
          <NeumorphicButton
            variant="secondary"
            icon={sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortBy}
          </NeumorphicButton>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <NeumorphicCard variant="elevated" className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {['todo', 'in-progress', 'completed', 'blocked'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.status?.includes(status) || false}
                      onChange={(e) => {
                        const currentStatus = filter.status || [];
                        if (e.target.checked) {
                          setFilter({ ...filter, status: [...currentStatus, status] });
                        } else {
                          setFilter({ ...filter, status: currentStatus.filter(s => s !== status) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="space-y-2">
                {['personal', 'finance', 'travel', 'shared-goals', 'household'].map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.category?.includes(category) || false}
                      onChange={(e) => {
                        const currentCategory = filter.category || [];
                        if (e.target.checked) {
                          setFilter({ ...filter, category: [...currentCategory, category] });
                        } else {
                          setFilter({ ...filter, category: currentCategory.filter(c => c !== category) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{category.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <div className="space-y-2">
                {['Alex', 'Ethan'].map(user => (
                  <label key={user} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.assignedTo?.includes(user) || false}
                      onChange={(e) => {
                        const currentAssigned = filter.assignedTo || [];
                        if (e.target.checked) {
                          setFilter({ ...filter, assignedTo: [...currentAssigned, user] });
                        } else {
                          setFilter({ ...filter, assignedTo: currentAssigned.filter(a => a !== user) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{user}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </NeumorphicCard>
      )}

      {/* Task View */}
      {viewMode === 'kanban' && isDesktop ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {renderKanbanColumn('todo', 'To Do', 'text-blue-600')}
          {renderKanbanColumn('in-progress', 'In Progress', 'text-yellow-600')}
          {renderKanbanColumn('completed', 'Completed', 'text-green-600')}
          {renderKanbanColumn('blocked', 'Blocked', 'text-red-600')}
        </div>
      ) : (
        renderListView()
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <NeumorphicCard variant="elevated" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Task</h3>
              <NeumorphicButton
                variant="secondary"
                size="sm"
                icon={<MoreHorizontal className="h-4 w-4" />}
                onClick={() => setShowAddTask(false)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <NeumorphicInput
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="flex-1"
                />
                <NeumorphicButton
                  variant="secondary"
                  icon={isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  onClick={handleVoiceInput}
                />
              </div>
              
              <NeumorphicInput
                placeholder="Description..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
                
                <select
                  className="w-full p-3 bg-gray-100 rounded-2xl border-0 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-gray-800"
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Task['category'] })}
                >
                  <option value="personal">Personal</option>
                  <option value="finance">Finance</option>
                  <option value="travel">Travel</option>
                  <option value="shared-goals">Shared Goals</option>
                  <option value="household">Household</option>
                </select>
              </div>
              
              <NeumorphicInput
                type="datetime-local"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              
              {/* Partner Assignment */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assign to:</label>
                <div className="flex space-x-2">
                  {partners.map((partner) => (
                    <button
                      key={partner}
                      onClick={() => {
                        const isAssigned = newTask.assignedTo.includes(partner);
                        const updatedAssignedTo = isAssigned
                          ? newTask.assignedTo.filter(p => p !== partner)
                          : [...newTask.assignedTo, partner];
                        setNewTask({ ...newTask, assignedTo: updatedAssignedTo });
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newTask.assignedTo.includes(partner)
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {partner}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <NeumorphicButton
                  variant="primary"
                  onClick={handleCreateTask}
                  className="flex-1"
                >
                  Create Task
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
        </div>
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
              {taskManagerService.getDeletedTasks().map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 line-through">{task.title}</h4>
                    <p className="text-sm text-gray-500">
                      Deleted {task.deletedAt ? new Date(task.deletedAt).toLocaleDateString() : 'recently'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <NeumorphicButton
                      variant="primary"
                      size="sm"
                      icon={<RotateCcw className="h-3 w-3" />}
                      onClick={() => taskManagerService.restoreTask(task.id)}
                    >
                      Restore
                    </NeumorphicButton>
                    <NeumorphicButton
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={() => {
                        if (window.confirm('Permanently delete this task?')) {
                          taskManagerService.permanentlyDeleteTask(task.id);
                        }
                      }}
                    >
                      Delete
                    </NeumorphicButton>
                  </div>
                </div>
              ))}
              
              {taskManagerService.getDeletedTasks().length === 0 && (
                <p className="text-center text-gray-500 py-8">No deleted tasks</p>
              )}
            </div>
          </NeumorphicCard>
        </div>
      )}
    </div>
  );
};
