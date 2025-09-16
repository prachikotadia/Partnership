import React from 'react';
import { Clock, User, Edit, CheckCircle2, Trash2, RotateCcw, Flag, Calendar, UserPlus } from 'lucide-react';
import { TaskHistory as TaskHistoryType } from '@/services/taskManagerService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';

interface TaskHistoryProps {
  history: TaskHistoryType[];
  className?: string;
}

export const TaskHistory: React.FC<TaskHistoryProps> = ({ history, className = '' }) => {
  const getActionIcon = (action: TaskHistoryType['action']) => {
    switch (action) {
      case 'created':
        return <Edit className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'restored':
        return <RotateCcw className="h-4 w-4 text-yellow-500" />;
      case 'assigned':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'priority-changed':
        return <Flag className="h-4 w-4 text-orange-500" />;
      case 'due-date-changed':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <Edit className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: TaskHistoryType['action']) => {
    switch (action) {
      case 'created':
        return 'bg-green-50 border-green-200';
      case 'updated':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'deleted':
        return 'bg-red-50 border-red-200';
      case 'restored':
        return 'bg-yellow-50 border-yellow-200';
      case 'assigned':
        return 'bg-purple-50 border-purple-200';
      case 'priority-changed':
        return 'bg-orange-50 border-orange-200';
      case 'due-date-changed':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (history.length === 0) {
    return (
      <NeumorphicCard variant="inset" className={`p-6 text-center ${className}`}>
        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No history available</p>
      </NeumorphicCard>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Task History</h3>
      
      {history.map((entry, index) => (
        <div
          key={entry.id}
          className={`flex items-start space-x-3 p-3 rounded-lg border ${getActionColor(entry.action)}`}
        >
          <div className="flex-shrink-0 mt-1">
            {getActionIcon(entry.action)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">{entry.userName}</span>
              <span className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</span>
            </div>
            
            <p className="text-sm text-gray-700">{entry.description}</p>
            
            {entry.changes && entry.changes.length > 0 && (
              <div className="mt-2 space-y-1">
                {entry.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="text-xs text-gray-600 bg-white bg-opacity-50 p-2 rounded">
                    <span className="font-medium capitalize">{change.field.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="ml-1 line-through text-red-500">{change.oldValue}</span>
                    <span className="mx-1">→</span>
                    <span className="text-green-600 font-medium">{change.newValue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
