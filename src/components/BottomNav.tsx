import { useState } from 'react';
import { 
  Home, 
  DollarSign, 
  CheckSquare, 
  MessageCircle, 
  Calendar,
  User,
  Trophy,
  Star
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'bucket-list', label: 'Dreams', icon: Star },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'notes', label: 'Notes', icon: MessageCircle },
    { id: 'streaks', label: 'Streaks', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-card border-t border-glass-border rounded-t-2xl px-2 py-2">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-gradient-primary text-white shadow-glow' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}