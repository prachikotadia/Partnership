import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { NeumorphicNavbar } from './NeumorphicNavbar';
import { NeumorphicCardEnhanced } from '@/components/ui/neumorphic-card-enhanced';
import { NeumorphicButtonEnhanced } from '@/components/ui/neumorphic-button-enhanced';
import { 
  LayoutDashboard, 
  CheckSquare, 
  DollarSign, 
  StickyNote, 
  Calendar, 
  Target, 
  Trophy, 
  Settings,
  Plus,
  TrendingUp,
  Users,
  Heart,
  Sparkles,
  BarChart3,
  Activity,
  Zap,
  Star
} from 'lucide-react';
import { TaskManager } from '@/components/TaskManager';
import { FinancePlanner } from '@/components/FinancePlanner';
import { Notes } from '@/components/Notes';
import { Timeline } from '@/components/Timeline';
import { BucketListManager } from '@/components/bucketList/BucketListManager';
import { StreaksEngagement } from '@/components/StreaksEngagement';

interface EnhancedDashboardProps {
  userName?: string;
  partnerName?: string;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ 
  userName = "Person1", 
  partnerName = "Person2" 
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [streakCount, setStreakCount] = useState(0);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setTodayCheckedIn(true);
    setStreakCount(prev => prev + 1);
  };

  const quickStats = [
    { 
      label: "Monthly Budget", 
      value: "$0", 
      change: "No budget set", 
      icon: DollarSign, 
      color: "blue",
      trend: "neutral"
    },
    { 
      label: "Tasks Done", 
      value: "0/0", 
      change: "No tasks yet", 
      icon: CheckSquare, 
      color: "green",
      trend: "neutral"
    },
    { 
      label: "Savings Goal", 
      value: "0%", 
      change: "No goals set", 
      icon: Target, 
      color: "purple",
      trend: "neutral"
    },
    { 
      label: "Streak", 
      value: streakCount.toString(), 
      change: todayCheckedIn ? "Checked in today!" : "Check in to start", 
      icon: Sparkles, 
      color: "orange",
      trend: "up"
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskManager />;
      case 'finance':
        return <FinancePlanner />;
      case 'notes':
        return <Notes />;
      case 'timeline':
        return <Timeline />;
      case 'bucketlist':
        return <BucketListManager />;
      case 'streaks':
        return <StreaksEngagement />;
      case 'settings':
        return (
          <NeumorphicCardEnhanced size="lg" className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-gray-600 dark:text-gray-400">Settings panel coming soon!</p>
          </NeumorphicCardEnhanced>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <NeumorphicCardEnhanced size="lg" className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Welcome back, {userName}! 💜
                    </h1>
                    <p className="text-lg opacity-80">
                      {todayCheckedIn 
                        ? `Great job! You and ${partnerName} are crushing it together.` 
                        : `Ready to make today amazing with ${partnerName}?`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-80 mb-2">Streak</div>
                    <div className="text-4xl font-bold flex items-center gap-2">
                      {streakCount} <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                {!todayCheckedIn && (
                  <NeumorphicButtonEnhanced
                    onClick={handleCheckIn}
                    variant="primary"
                    size="lg"
                    icon={<Heart className="w-5 h-5" />}
                    className="w-full"
                  >
                    Daily Check-in
                  </NeumorphicButtonEnhanced>
                )}
              </div>
            </NeumorphicCardEnhanced>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <NeumorphicCardEnhanced key={index} hover className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center
                        ${theme === 'dark' 
                          ? 'bg-gray-800 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]' 
                          : 'bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]'
                        }
                      `}>
                        <Icon className={`w-6 h-6 ${
                          stat.color === 'blue' ? 'text-blue-500' :
                          stat.color === 'green' ? 'text-green-500' :
                          stat.color === 'purple' ? 'text-purple-500' :
                          'text-orange-500'
                        }`} />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium mb-1 opacity-80">{stat.label}</h3>
                    <p className="text-2xl font-bold mb-1">{stat.value}</p>
                    <p className={`text-xs ${
                      stat.trend === 'up' ? 'text-green-500' :
                      stat.trend === 'down' ? 'text-red-500' :
                      'opacity-60'
                    }`}>
                      {stat.change}
                    </p>
                  </NeumorphicCardEnhanced>
                );
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <NeumorphicCardEnhanced>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </h3>
                  <NeumorphicButtonEnhanced size="sm" variant="secondary">
                    View All
                  </NeumorphicButtonEnhanced>
                </div>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-40" />
                  <h4 className="text-lg font-medium mb-2">No activity yet</h4>
                  <p className="text-sm opacity-60">Start using the app to see your activity here!</p>
                </div>
              </NeumorphicCardEnhanced>

              {/* Quick Actions */}
              <NeumorphicCardEnhanced>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: StickyNote, label: "Add Note", color: "purple" },
                    { icon: DollarSign, label: "Log Expense", color: "green" },
                    { icon: Calendar, label: "Plan Event", color: "blue" },
                    { icon: Users, label: "Invite Partner", color: "orange" },
                  ].map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <NeumorphicButtonEnhanced
                        key={index}
                        variant="secondary"
                        className="h-20 flex-col gap-2"
                        onClick={() => setActiveTab(action.label.toLowerCase().replace(' ', ''))}
                      >
                        <Icon className={`w-5 h-5 ${
                          action.color === 'purple' ? 'text-purple-500' :
                          action.color === 'green' ? 'text-green-500' :
                          action.color === 'blue' ? 'text-blue-500' :
                          'text-orange-500'
                        }`} />
                        <span className="text-xs">{action.label}</span>
                      </NeumorphicButtonEnhanced>
                    );
                  })}
                </div>
              </NeumorphicCardEnhanced>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`
      min-h-screen transition-colors duration-300
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
    `}>
      <NeumorphicNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="lg:ml-20 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
