import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  DollarSign, 
  StickyNote, 
  Calendar, 
  Target, 
  Trophy, 
  Settings, 
  Sun, 
  Moon,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const NeumorphicNavbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onTabChange, 
  className = '' 
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'finance', icon: DollarSign, label: 'Finance' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
    { id: 'timeline', icon: Calendar, label: 'Timeline' },
    { id: 'bucketlist', icon: Target, label: 'Bucket List' },
    { id: 'streaks', icon: Trophy, label: 'Streaks' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`fixed top-4 left-4 z-50 p-3 rounded-2xl transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.1),inset_2px_2px_6px_rgba(0,0,0,0.8)]' 
            : 'bg-gray-100 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.8),inset_2px_2px_6px_rgba(0,0,0,0.1)]'
        } hover:scale-105 active:scale-95 lg:hidden`}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-3 rounded-2xl transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.1),inset_2px_2px_6px_rgba(0,0,0,0.8)]' 
            : 'bg-gray-100 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.8),inset_2px_2px_6px_rgba(0,0,0,0.1)]'
        } hover:scale-105 active:scale-95`}
      >
        {theme === 'dark' ? (
          <Sun className="w-6 h-6 text-yellow-500" />
        ) : (
          <Moon className="w-6 h-6 text-blue-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navbar */}
      <nav className={`
        fixed left-0 top-0 h-full w-20 z-30 transition-all duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${className}
      `}>
        <div className={`
          h-full w-full p-4 flex flex-col items-center space-y-4
          ${theme === 'dark' 
            ? 'bg-gray-900' 
            : 'bg-gray-50'
          }
        `}>
          {/* Logo */}
          <div className={`
            w-12 h-12 rounded-2xl flex items-center justify-center mb-8
            ${theme === 'dark' 
              ? 'bg-gray-800 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.1),inset_2px_2px_6px_rgba(0,0,0,0.8)]' 
              : 'bg-gray-100 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.8),inset_2px_2px_6px_rgba(0,0,0,0.1)]'
            }
          `}>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
          </div>

          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? theme === 'dark'
                      ? 'bg-gray-700 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.1),inset_2px_2px_6px_rgba(0,0,0,0.8)]'
                      : 'bg-gray-200 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.8),inset_2px_2px_6px_rgba(0,0,0,0.1)]'
                    : theme === 'dark'
                      ? 'bg-gray-800 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.1),inset_2px_2px_6px_rgba(0,0,0,0.8)] hover:bg-gray-700'
                      : 'bg-gray-100 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.8),inset_2px_2px_6px_rgba(0,0,0,0.1)] hover:bg-gray-200'
                  }
                  hover:scale-105 active:scale-95
                `}
                title={item.label}
              >
                <Icon className={`
                  w-5 h-5 transition-colors duration-300
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300'
                  }
                `} />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
