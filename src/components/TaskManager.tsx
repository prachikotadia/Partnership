import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  Circle, 
  User, 
  Calendar,
  Flag,
  Trash2,
  Edit3
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  assignee: 'Person1' | 'Person2';
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        assignee: 'Person1',
        priority: 'medium',
        category: 'General',
        completed: false,
        createdAt: new Date(),
      };
      setTasks([task, ...tasks]);
      setNewTask('');
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      default: return true;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Household': return 'bg-gradient-teal';
      case 'Travel': return 'bg-gradient-coral';
      case 'Relationship': return 'bg-gradient-primary';
      case 'Finance': return 'bg-gradient-secondary';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Task Manager
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-gradient-primary' : ''}
              >
                All ({tasks.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('pending')}
                className={filter === 'pending' ? 'bg-gradient-primary' : ''}
              >
                Pending ({tasks.filter(t => !t.completed).length})
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('completed')}
                className={filter === 'completed' ? 'bg-gradient-primary' : ''}
              >
                Done ({tasks.filter(t => t.completed).length})
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="glass-card border-glass-border"
            />
            <Button onClick={addTask} className="bg-gradient-primary hover-lift">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`glass-card border-glass-border hover-lift transition-all duration-300 ${
              task.completed ? 'opacity-70' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Completion Toggle */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1 hover:scale-110 transition-transform"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium text-lg ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {/* Priority */}
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {task.priority}
                          </span>
                        </div>

                        {/* Category */}
                        <Badge className={`${getCategoryColor(task.category)} text-white border-0 text-xs`}>
                          {task.category}
                        </Badge>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Due {task.dueDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Assignee */}
                      <div className="flex items-center gap-2 mt-3">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-gradient-primary text-white">
                            {task.assignee[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          Assigned to {task.assignee}
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-card border-glass-border">
                        <DropdownMenuItem className="gap-2">
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <User className="w-4 h-4" />
                          Reassign
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Flag className="w-4 h-4" />
                          Change Priority
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive focus:text-destructive"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="glass-card border-glass-border">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' ? 'Add your first task to get started!' : 
               filter === 'pending' ? 'All tasks are completed! 🎉' :
               'No completed tasks yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}