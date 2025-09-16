import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  DollarSign, 
  CheckSquare, 
  MessageCircle,
  Calendar,
  Trophy,
  User,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  X
} from 'lucide-react';
import { FinancePlanner } from '@/components/FinancePlanner';
import { TaskManager } from '@/components/TaskManager';
import { TimelineEnhanced } from '@/components/TimelineEnhanced';
import { NotesEnhanced } from '@/components/NotesEnhanced';
import { StreaksEngagement } from '@/components/StreaksEngagement';
import { Profile } from '@/components/Profile';
import { Dashboard } from '@/components/Dashboard';
import { useResponsive } from '@/hooks/use-responsive';

interface MobileLayoutProps {
  userName: string;
  partnerName: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ userName, partnerName }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showStreakCheckIn, setShowStreakCheckIn] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { isMobile, screenWidth } = useResponsive();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'notes', label: 'Notes', icon: MessageCircle },
    { id: 'streaks', label: 'Streaks', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard userName={userName} partnerName={partnerName} />;
      case 'finance':
        return <FinancePlanner />;
      case 'tasks':
        return <TaskManager />;
      case 'timeline':
        return <TimelineEnhanced />;
      case 'notes':
        return <NotesEnhanced />;
      case 'streaks':
        return <StreaksEngagement />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard userName={userName} partnerName={partnerName} />;
    }
  };

  // Touch handling for swipeable cards
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentCardIndex < 2) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
    if (isRightSwipe && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // Auto-hide streak check-in after 5 seconds
  useEffect(() => {
    if (showStreakCheckIn) {
      const timer = setTimeout(() => {
        setShowStreakCheckIn(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showStreakCheckIn]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Streak Check-in Banner - Mobile Optimized */}
      {showStreakCheckIn && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Trophy className="h-6 w-6 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-base">Daily Check-in</p>
                <p className="text-sm opacity-90">Keep your streak alive!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStreakCheckIn(false)}
              className="text-white hover:bg-white/20 p-2 min-h-[44px] min-w-[44px] flex-shrink-0"
              aria-label="Close streak check-in"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-3 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex-1 sm:flex-none min-h-[44px] text-sm font-medium"
            >
              Quick Check-in
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex-1 sm:flex-none min-h-[44px] text-sm font-medium"
            >
              View Progress
            </Button>
          </div>
        </div>
      )}

      {/* Main Content - Mobile Optimized */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' ? (
          <div className="h-full">
            {/* Swipeable Cards - Mobile Optimized */}
            <div 
              className="h-full flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Card 1: Quick Stats - Mobile Optimized */}
              <div className="w-full flex-shrink-0 p-3 sm:p-4">
                <Card className="h-full shadow-sm border-0 bg-white">
                  <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">Quick Stats</h3>
                    <div className="space-y-4 sm:space-y-5 flex-1">
                      <div className="flex justify-between items-center py-3 px-2 rounded-lg bg-gray-50">
                        <span className="text-sm sm:text-base font-medium text-gray-700">Today's Tasks</span>
                        <Badge variant="secondary" className="text-xs sm:text-sm px-3 py-1 bg-blue-100 text-blue-800">3/5</Badge>
                      </div>
                      <div className="flex justify-between items-center py-3 px-2 rounded-lg bg-gray-50">
                        <span className="text-sm sm:text-base font-medium text-gray-700">Weekly Budget</span>
                        <Badge variant="secondary" className="text-xs sm:text-sm px-3 py-1 bg-green-100 text-green-800">$240/$300</Badge>
                      </div>
                      <div className="flex justify-between items-center py-3 px-2 rounded-lg bg-gray-50">
                        <span className="text-sm sm:text-base font-medium text-gray-700">Streak</span>
                        <Badge variant="secondary" className="text-xs sm:text-sm px-3 py-1 bg-purple-100 text-purple-800">7 days</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 2: Recent Activity - Mobile Optimized */}
              <div className="w-full flex-shrink-0 p-3 sm:p-4">
                <Card className="h-full shadow-sm border-0 bg-white">
                  <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">Recent Activity</h3>
                    <div className="space-y-4 sm:space-y-5 flex-1">
                      <div className="flex items-center space-x-3 py-3 px-2 rounded-lg bg-gray-50">
                        <CheckSquare className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900">Completed task</p>
                          <p className="text-xs sm:text-sm text-gray-500">Upload Design</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 py-3 px-2 rounded-lg bg-gray-50">
                        <DollarSign className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900">Added expense</p>
                          <p className="text-xs sm:text-sm text-gray-500">Groceries - $45</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 py-3 px-2 rounded-lg bg-gray-50">
                        <MessageCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900">New note</p>
                          <p className="text-xs sm:text-sm text-gray-500">Brainstorm idea</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 3: Upcoming Events - Mobile Optimized */}
              <div className="w-full flex-shrink-0 p-3 sm:p-4">
                <Card className="h-full shadow-sm border-0 bg-white">
                  <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">Upcoming Events</h3>
                    <div className="space-y-4 sm:space-y-5 flex-1">
                      <div className="flex items-center space-x-3 py-3 px-2 rounded-lg bg-gray-50">
                        <Calendar className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900">Client meeting</p>
                          <p className="text-xs sm:text-sm text-gray-500">Today at 10:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 py-3 px-2 rounded-lg bg-gray-50">
                        <Calendar className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900">Rent due</p>
                          <p className="text-xs sm:text-sm text-gray-500">In 3 days</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 py-3 px-2 rounded-lg bg-gray-50">
                        <Calendar className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900">Anniversary</p>
                          <p className="text-xs sm:text-sm text-gray-500">In 2 weeks</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Card Indicators - Mobile Optimized */}
            <div className="flex justify-center space-x-2 p-4">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    currentCardIndex === index ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentCardIndex(index)}
                  aria-label={`Go to card ${index + 1}`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    currentCardIndex === index ? 'bg-white' : 'bg-gray-500'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {renderContent()}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Optimized */}
      <div className="bg-white border-t border-gray-200 px-2 py-2 safe-area-pb">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors min-h-[60px] min-w-[60px] justify-center ${
                activeTab === tab.id
                  ? 'text-blue-500 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={`${tab.label} tab`}
            >
              <tab.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs font-medium leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Button - Mobile Optimized */}
      <div className="fixed bottom-20 right-4 z-10">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow min-h-[56px] min-w-[56px]"
          onClick={() => {
            // Quick add based on current tab
            switch (activeTab) {
              case 'tasks':
                // Add task
                break;
              case 'finance':
                // Add expense
                break;
              case 'notes':
                // Add note
                break;
              default:
                // General add
                break;
            }
          }}
          aria-label="Quick add"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};