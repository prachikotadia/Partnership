import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/components/Dashboard';
import { FinancePlanner } from '@/components/FinancePlanner';
import { Timeline } from '@/components/Timeline';
import { Notes } from '@/components/Notes';
import { Profile } from '@/components/Profile';
import { NotificationCenter } from '@/components/NotificationCenter';
import { TimelineEnhanced } from '@/components/TimelineEnhanced';
import { NotesEnhanced } from '@/components/NotesEnhanced';
import { StreaksEngagement } from '@/components/StreaksEngagement';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { GlassmorphismDashboard } from '@/components/layout/GlassmorphismDashboard';
import { IOSDashboard } from '@/components/layout/IOSDashboard';
import { TaskManager } from '@/components/tasks/TaskManager';
import { BucketListManager } from '@/components/bucketList/BucketListManager';
import { DragDropProvider } from '@/components/drag-drop/DragDropProvider';
import { AnimationProvider } from '@/components/animations/AnimationProvider';
import { useResponsive } from '@/hooks/use-responsive';
import heroImage from '@/assets/hero-bg.jpg';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const { isMobile } = useResponsive();

  const renderContent = () => {
    if (showNotifications) {
      return <NotificationCenter />;
    }
    
    switch (activeTab) {
      case 'home':
        return <Dashboard userName="Person1" partnerName="Person2" />;
      case 'tasks':
        return <TaskManager />;
      case 'bucket-list':
        return <BucketListManager />;
      case 'finance':
        return <FinancePlanner />;
      case 'timeline':
        return <TimelineEnhanced />;
      case 'notes':
        return <NotesEnhanced />;
      case 'streaks':
        return <StreaksEngagement />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard userName="Person1" partnerName="Person2" />;
    }
  };

  // Use iOS neumorphic layout for all devices
  return (
    <DragDropProvider>
      <AnimationProvider>
        <IOSDashboard userName="Person1" partnerName="Person2" />
      </AnimationProvider>
    </DragDropProvider>
  );
};

export default Index;
