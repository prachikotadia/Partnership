import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  CheckCircle2,
  DollarSign,
  Heart,
  MessageCircle,
  PlusCircle,
  Sparkles,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';

interface DashboardProps {
  userName?: string;
  partnerName?: string;
}

export function Dashboard({ userName = "Person1", partnerName = "Person2" }: DashboardProps) {
  const [streakCount, setStreakCount] = useState(0);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setTodayCheckedIn(true);
    setStreakCount(prev => prev + 1);
  };

  const quickStats = [
    { label: "Monthly Budget", value: "$0", change: "No budget set", icon: DollarSign, color: "teal" },
    { label: "Tasks Done", value: "0/0", change: "No tasks yet", icon: CheckCircle2, color: "coral" },
    { label: "Savings Goal", value: "0%", change: "No goals set", icon: Target, color: "lavender" },
  ];

  const recentTasks: any[] = [];
  const upcomingEvents: any[] = [];

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Hero Section */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-primary relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {userName}! 💜
              </h1>
              <p className="text-white/80 text-lg">
                {todayCheckedIn 
                  ? `Great job! You and ${partnerName} are crushing it together.` 
                  : `Ready to make today amazing with ${partnerName}?`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-white/80 text-sm">Streak</div>
              <div className="text-4xl font-bold text-white flex items-center gap-2">
                {streakCount} <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              </div>
            </div>
          </div>

          {!todayCheckedIn && (
            <Button 
              onClick={handleCheckIn}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white glass-button"
            >
              <Heart className="w-4 h-4 mr-2" />
              Daily Check-in
            </Button>
          )}
        </div>
        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="glass-card border-glass-border hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs ${stat.change.startsWith('+') ? 'text-success' : 'text-muted-foreground'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <Card className="glass-card border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Tasks
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              <PlusCircle className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                <p className="text-muted-foreground">Add your first task to get started!</p>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 glass-card rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">Assigned to {task.assignee}</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                    {task.completed && <div className="w-2 h-2 bg-success rounded-full" />}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Timeline Section */}
        <Card className="glass-card border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Coming Up
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No events scheduled</h3>
                <p className="text-muted-foreground">Add your first event to get started!</p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 glass-card rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    event.type === 'relationship' ? 'bg-gradient-primary' :
                    event.type === 'finance' ? 'bg-gradient-teal' : 'bg-gradient-coral'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <Badge variant="secondary" className="glass-card text-xs">
                    {event.type}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: MessageCircle, label: "Add Note", color: "lavender" },
              { icon: DollarSign, label: "Log Expense", color: "teal" },
              { icon: Calendar, label: "Plan Event", color: "coral" },
              { icon: Users, label: "Invite Partner", color: "primary" },
            ].map((action, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                className="glass-card h-20 flex-col gap-2 hover-lift"
              >
                <div className={`p-2 rounded-lg bg-gradient-${action.color}`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}