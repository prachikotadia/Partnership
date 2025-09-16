import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  DollarSign, 
  CheckSquare, 
  MessageCircle,
  Calendar,
  Trophy,
  User,
  Settings,
  Search,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useKeyboardShortcuts, createAppShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { FinancePlanner } from '@/components/FinancePlanner';
import { TaskManager } from '@/components/TaskManager';
import { TimelineEnhanced } from '@/components/TimelineEnhanced';
import { NotesEnhanced } from '@/components/NotesEnhanced';
import { StreaksEngagement } from '@/components/StreaksEngagement';
import { Profile } from '@/components/Profile';
import { Dashboard } from '@/components/Dashboard';

interface DesktopLayoutProps {
  userName: string;
  partnerName: string;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ userName, partnerName }) => {
  const [activeView, setActiveView] = useState<'split' | 'full'>('split');
  const [leftPanel, setLeftPanel] = useState<'finance' | 'tasks' | 'timeline' | 'notes'>('finance');
  const [rightPanel, setRightPanel] = useState<'finance' | 'tasks' | 'timeline' | 'notes'>('tasks');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  // Keyboard shortcuts
  const shortcuts = createAppShortcuts(
    () => setRightPanel('tasks'),
    () => setRightPanel('notes'),
    () => setLeftPanel('finance'),
    () => setShowSidebar(!showSidebar),
    () => setShowSearch(!showSearch)
  );

  useKeyboardShortcuts(shortcuts);

  const renderPanel = (panel: string) => {
    switch (panel) {
      case 'finance':
        return <FinancePlanner />;
      case 'tasks':
        return <TaskManager />;
      case 'timeline':
        return <TimelineEnhanced />;
      case 'notes':
        return <NotesEnhanced />;
      default:
        return <Dashboard userName={userName} partnerName={partnerName} />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Bondly Glow</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-2">
            <Button
              variant={activeView === 'split' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('split')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Split View
            </Button>
            <Button
              variant={activeView === 'full' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('full')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Full View
            </Button>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Left Panel
              </h3>
              {['finance', 'tasks', 'timeline', 'notes'].map((panel) => (
                <Button
                  key={panel}
                  variant={leftPanel === panel ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setLeftPanel(panel as any)}
                >
                  {panel === 'finance' && <DollarSign className="h-4 w-4 mr-2" />}
                  {panel === 'tasks' && <CheckSquare className="h-4 w-4 mr-2" />}
                  {panel === 'timeline' && <Calendar className="h-4 w-4 mr-2" />}
                  {panel === 'notes' && <MessageCircle className="h-4 w-4 mr-2" />}
                  {panel.charAt(0).toUpperCase() + panel.slice(1)}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Right Panel
              </h3>
              {['finance', 'tasks', 'timeline', 'notes'].map((panel) => (
                <Button
                  key={panel}
                  variant={rightPanel === panel ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setRightPanel(panel as any)}
                >
                  {panel === 'finance' && <DollarSign className="h-4 w-4 mr-2" />}
                  {panel === 'tasks' && <CheckSquare className="h-4 w-4 mr-2" />}
                  {panel === 'timeline' && <Calendar className="h-4 w-4 mr-2" />}
                  {panel === 'notes' && <MessageCircle className="h-4 w-4 mr-2" />}
                  {panel.charAt(0).toUpperCase() + panel.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setActiveView('full')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            {!showSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {activeView === 'split' ? 'Split Dashboard' : 'Full View'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('full')}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {activeView === 'split' ? (
            <>
              {/* Left Panel */}
              <div className="flex-1 border-r border-gray-200">
                <div className="h-full p-6">
                  {renderPanel(leftPanel)}
                </div>
              </div>

              {/* Right Panel */}
              <div className="flex-1">
                <div className="h-full p-6">
                  {renderPanel(rightPanel)}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 p-6">
              {renderPanel(leftPanel)}
            </div>
          )}
        </div>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Quick Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Keyboard Shortcuts:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Add Task</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+T</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Add Note</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+N</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Add Expense</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+E</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle Sidebar</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+B</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Search</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+K</kbd>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
