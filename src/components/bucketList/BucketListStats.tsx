import React from 'react';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause, 
  TrendingUp,
  DollarSign,
  MapPin,
  Heart,
  Star,
  Trophy,
  Sparkles
} from 'lucide-react';
import { bucketListService } from '@/services/bucketListService';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';

export const BucketListStats: React.FC = () => {
  const stats = bucketListService.getStats();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return <MapPin className="h-4 w-4" />;
      case 'experiences': return <Sparkles className="h-4 w-4" />;
      case 'goals': return <Target className="h-4 w-4" />;
      case 'adventures': return <Trophy className="h-4 w-4" />;
      case 'romantic': return <Heart className="h-4 w-4" />;
      case 'personal': return <Star className="h-4 w-4" />;
      case 'career': return <Target className="h-4 w-4" />;
      case 'health': return <Heart className="h-4 w-4" />;
      case 'learning': return <Star className="h-4 w-4" />;
      case 'family': return <Heart className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'dream': return <Sparkles className="h-4 w-4" />;
      case 'high': return <Target className="h-4 w-4" />;
      case 'medium': return <Star className="h-4 w-4" />;
      case 'low': return <Heart className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'dream': return 'text-purple-600';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'travel': return 'text-blue-600';
      case 'experiences': return 'text-purple-600';
      case 'goals': return 'text-green-600';
      case 'adventures': return 'text-orange-600';
      case 'romantic': return 'text-pink-600';
      case 'personal': return 'text-indigo-600';
      case 'career': return 'text-gray-600';
      case 'health': return 'text-red-600';
      case 'learning': return 'text-yellow-600';
      case 'family': return 'text-teal-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Progress */}
      <NeumorphicCard variant="elevated" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Overall Progress</h3>
          </div>
          <span className="text-2xl font-bold text-blue-600">{stats.averageProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.averageProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {stats.completed} of {stats.total} items completed
        </p>
      </NeumorphicCard>

      {/* Status Breakdown */}
      <NeumorphicCard variant="elevated" className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Target className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Status</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <span className="font-medium text-gray-900">{stats.completed}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            <span className="font-medium text-gray-900">{stats.inProgress}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Not Started</span>
            </div>
            <span className="font-medium text-gray-900">{stats.notStarted}</span>
          </div>
        </div>
      </NeumorphicCard>

      {/* Total Cost */}
      <NeumorphicCard variant="elevated" className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Total Cost</h3>
        </div>
        <div className="text-2xl font-bold text-green-600 mb-2">
          ${stats.totalEstimatedCost.toLocaleString()}
        </div>
        <p className="text-sm text-gray-600">
          Estimated cost for all bucket list items
        </p>
      </NeumorphicCard>

      {/* Top Categories */}
      <NeumorphicCard variant="elevated" className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Star className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Top Categories</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(stats.byCategory)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={getCategoryColor(category)}>
                    {getCategoryIcon(category)}
                  </div>
                  <span className="text-sm text-gray-600 capitalize">{category}</span>
                </div>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
        </div>
      </NeumorphicCard>

      {/* Priority Distribution */}
      <NeumorphicCard variant="elevated" className="p-4 md:col-span-2">
        <div className="flex items-center space-x-2 mb-3">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Priority Distribution</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.byPriority)
            .sort(([a], [b]) => {
              const priorityOrder = { 'dream': 4, 'high': 3, 'medium': 2, 'low': 1 };
              return priorityOrder[b as keyof typeof priorityOrder] - priorityOrder[a as keyof typeof priorityOrder];
            })
            .map(([priority, count]) => (
              <div key={priority} className="text-center">
                <div className={`flex items-center justify-center mb-2 ${getPriorityColor(priority)}`}>
                  {getPriorityIcon(priority)}
                </div>
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{priority}</div>
              </div>
            ))}
        </div>
      </NeumorphicCard>

      {/* Category Breakdown */}
      <NeumorphicCard variant="elevated" className="p-4 md:col-span-2">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">All Categories</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(stats.byCategory)
            .sort(([,a], [,b]) => b - a)
            .map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={getCategoryColor(category)}>
                    {getCategoryIcon(category)}
                  </div>
                  <span className="text-sm text-gray-600 capitalize">{category}</span>
                </div>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
        </div>
      </NeumorphicCard>
    </div>
  );
};
