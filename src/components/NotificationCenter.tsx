import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, NotificationData } from '@/services/notificationService';
import { reminderScheduler } from '@/services/reminderScheduler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  CheckCircle, 
  X, 
  MoreVertical,
  Calendar,
  DollarSign,
  Heart,
  CheckSquare,
  MessageCircle,
  Settings,
  Filter,
  Trash2,
  Plus,
  Clock,
  AlertTriangle,
  Star,
  Zap
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'finance' | 'event' | 'system' | 'partner';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  icon?: string;
  sender?: 'Alex' | 'Sam' | 'System';
}

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showCreateReminder, setShowCreateReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: 'bill' as 'bill' | 'event' | 'streak',
    name: '',
    amount: 0,
    dueDate: '',
    reminderHours: [24, 2, 1],
    category: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      // Initialize notification service
      notificationService.initialize(user.id);
      reminderScheduler.initialize(user.id);

      // Listen for real-time notifications
      const handleNotification = (event: CustomEvent) => {
        const notification = event.detail as NotificationData;
        setNotifications(prev => [notification, ...prev]);
      };

      window.addEventListener('notificationReceived', handleNotification as EventListener);

      // Load existing notifications
      loadNotifications();

      return () => {
        window.removeEventListener('notificationReceived', handleNotification as EventListener);
        notificationService.disconnect();
      };
    }
  }, [user]);

  const loadNotifications = () => {
    // Load notifications from localStorage or API
    const saved = localStorage.getItem(`notifications_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  };

  const saveNotifications = (updatedNotifications: NotificationData[]) => {
    localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updatedNotifications));
  };

  const [settings, setSettings] = useState({
    taskNotifications: true,
    financeNotifications: true,
    eventNotifications: true,
    partnerNotifications: true,
    systemNotifications: true,
    pushEnabled: true,
    emailEnabled: true,
  });

  const [filter, setFilter] = useState<'all' | 'unread' | 'task' | 'finance' | 'event'>('all');

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const handleCreateReminder = async () => {
    try {
      if (newReminder.type === 'bill') {
        await reminderScheduler.createBillReminder({
          name: newReminder.name,
          amount: newReminder.amount,
          dueDate: new Date(newReminder.dueDate),
          recurring: { type: 'monthly', interval: 1 },
          isActive: true,
          category: newReminder.category,
          notes: newReminder.notes
        });
      } else if (newReminder.type === 'event') {
        await reminderScheduler.createEventReminder({
          name: newReminder.name,
          date: new Date(newReminder.dueDate),
          reminderHours: newReminder.reminderHours,
          isActive: true,
          category: newReminder.category,
          notes: newReminder.notes
        });
      } else if (newReminder.type === 'streak') {
        await reminderScheduler.createStreakReminder({
          type: newReminder.name,
          currentStreak: 0,
          lastCheckIn: new Date(),
          reminderTime: '09:00',
          isActive: true,
          goal: 30
        });
      }

      // Reset form
      setNewReminder({
        type: 'bill',
        name: '',
        amount: 0,
        dueDate: '',
        reminderHours: [24, 2, 1],
        category: '',
        notes: ''
      });
      setShowCreateReminder(false);

      // Show success notification
      const successNotification: NotificationData = {
        id: `success_${Date.now()}`,
        title: 'Reminder Created',
        message: `Your ${newReminder.type} reminder has been created successfully!`,
        type: 'system',
        priority: 'medium',
        read: false,
        timestamp: new Date(),
        sender: 'System'
      };
      setNotifications(prev => [successNotification, ...prev]);
      saveNotifications([successNotification, ...notifications]);
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'finance': return DollarSign;
      case 'event': return Calendar;
      case 'partner': return Heart;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-gradient-primary';
      case 'finance': return 'bg-gradient-secondary';
      case 'event': return 'bg-gradient-coral';
      case 'partner': return 'bg-gradient-teal';
      default: return 'bg-muted';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.read;
      case 'task': return notif.type === 'task';
      case 'finance': return notif.type === 'finance';
      case 'event': return notif.type === 'event';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-white">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showCreateReminder} onOpenChange={setShowCreateReminder}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-glass-border max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Create Smart Reminder
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reminder Type</Label>
                      <Select value={newReminder.type} onValueChange={(value: any) => setNewReminder(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bill">Bill Reminder</SelectItem>
                          <SelectItem value="event">Event Reminder</SelectItem>
                          <SelectItem value="streak">Streak Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder={newReminder.type === 'bill' ? 'Bill name (e.g., Electricity)' : newReminder.type === 'event' ? 'Event name (e.g., Anniversary)' : 'Streak type (e.g., Daily Check-in)'}
                        value={newReminder.name}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    {newReminder.type === 'bill' && (
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={newReminder.amount}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>{newReminder.type === 'bill' ? 'Due Date' : newReminder.type === 'event' ? 'Event Date' : 'Start Date'}</Label>
                      <Input
                        type="date"
                        value={newReminder.dueDate}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        placeholder="e.g., Utilities, Personal, Work"
                        value={newReminder.category}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        placeholder="Additional details..."
                        value={newReminder.notes}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateReminder} className="flex-1 bg-gradient-primary">
                        Create Reminder
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateReminder(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-card border-glass-border">
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Unread Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('task')}>
                    Tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('finance')}>
                    Finance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('event')}>
                    Events
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {unreadCount > 0 && (
                <Button 
                  onClick={markAllAsRead}
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark All Read
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const NotificationIcon = getNotificationIcon(notification.type);
          
          return (
            <Card 
              key={notification.id} 
              className={`glass-card border-glass-border hover-lift transition-all duration-300 ${
                !notification.read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg ${getTypeColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                    <NotificationIcon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {notification.sender && notification.sender !== 'System' && (
                            <div className="flex items-center gap-1">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs bg-gradient-primary text-white">
                                  {notification.sender[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{notification.sender}</span>
                            </div>
                          )}
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-card border-glass-border">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)} className="gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => deleteNotification(notification.id)}
                              className="gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <Card className="glass-card border-glass-border">
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {filter === 'unread' ? 'All caught up! No unread notifications.' : 'You\'re all set. New notifications will appear here.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Notification Types</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  <span className="text-sm">Task Updates</span>
                </div>
                <Switch 
                  checked={settings.taskNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, taskNotifications: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Finance Alerts</span>
                </div>
                <Switch 
                  checked={settings.financeNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, financeNotifications: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Event Reminders</span>
                </div>
                <Switch 
                  checked={settings.eventNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, eventNotifications: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">Partner Activity</span>
                </div>
                <Switch 
                  checked={settings.partnerNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, partnerNotifications: checked})}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Delivery Methods</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">Push Notifications</span>
                </div>
                <Switch 
                  checked={settings.pushEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, pushEnabled: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Email Notifications</span>
                </div>
                <Switch 
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, emailEnabled: checked})}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-glass-border">
            <Button className="bg-gradient-primary hover-lift">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}