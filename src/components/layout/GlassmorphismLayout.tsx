import React, { useState } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  StickyNote,
  CheckSquare,
  Lightbulb,
  Search,
  User,
  ChevronRight,
  Trash2,
  MoreHorizontal,
  Plus,
  Mic,
  FileText
} from 'lucide-react';

interface GlassmorphismLayoutProps {
  userName: string;
  partnerName: string;
}

export const GlassmorphismLayout: React.FC<GlassmorphismLayoutProps> = ({ 
  userName, 
  partnerName 
}) => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Upload Design', completed: true },
    { id: 2, text: 'Groceries', completed: false },
    { id: 3, text: 'Prepare PPT', completed: false },
    { id: 4, text: 'Check emails', completed: true },
    { id: 5, text: 'Call Alex', completed: false },
  ]);

  const [notes, setNotes] = useState([
    { id: 1, title: 'Random', content: "You've got this! One step at a time." },
    { id: 2, title: 'Brainstorm Idea', content: "What if we introduced a loyalty rewards..." },
  ]);

  const [schedule, setSchedule] = useState([
    { id: 1, time: '10:00 AM', event: 'Client meeting' },
    { id: 2, time: '12:00 PM', event: 'UIUX Webinar' },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-yellow-300 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-amber-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-orange-300 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-yellow-400 text-2xl font-bold">Bondly Glow</h1>
              <p className="text-white/80 text-sm">Your Relationship Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
              <Search className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-white text-3xl font-bold mb-2">Welcome Back!</h2>
          <h3 className="text-white text-2xl font-semibold mb-2">{userName}</h3>
          <div className="flex items-center text-white/80">
            <span>Today, {getCurrentDate()}</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Schedule Widget */}
          <GlassmorphismCard variant="brown" size="md">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-white mr-2" />
              <h3 className="text-white font-semibold">Schedule</h3>
            </div>
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <span className="text-white/80 text-sm">{item.time}</span>
                  <div className="bg-black/30 rounded-lg px-3 py-1">
                    <span className="text-white text-sm">{item.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphismCard>

          {/* Notes Widget */}
          <GlassmorphismCard variant="beige" size="md">
            <div className="flex items-center mb-4">
              <StickyNote className="h-5 w-5 text-white mr-2" />
              <h3 className="text-white font-semibold">Notes</h3>
            </div>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-white font-medium text-sm mb-1">{note.title}</h4>
                  <p className="text-white/80 text-xs">{note.content}</p>
                </div>
              ))}
            </div>
          </GlassmorphismCard>

          {/* Brainstorm Widget - Larger */}
          <GlassmorphismCard variant="yellow" size="lg" className="md:col-span-2">
            <div className="flex items-center mb-4">
              <Lightbulb className="h-5 w-5 text-white mr-2" />
              <h3 className="text-white font-semibold">Brainstorm Idea</h3>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              What if we introduced a loyalty rewards program for premium users? 
              These could be redeemed for exclusive perks and special experiences.
            </p>
          </GlassmorphismCard>

          {/* Tasks Widget */}
          <GlassmorphismCard variant="brown" size="md">
            <div className="flex items-center mb-4">
              <CheckSquare className="h-5 w-5 text-white mr-2" />
              <h3 className="text-white font-semibold">Tasks</h3>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    task.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-white/50'
                  }`}>
                    {task.completed && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-sm ${
                    task.completed ? 'text-white/60 line-through' : 'text-white'
                  }`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </GlassmorphismCard>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-6 left-6 right-6">
          <GlassmorphismCard variant="default" size="sm" className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
              <Trash2 className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
            >
              <Mic className="h-6 w-6 text-white" />
            </Button>
            
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
              <FileText className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </GlassmorphismCard>
        </div>
      </div>
    </div>
  );
};
