import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { engagementService, CheckIn, Streak, CoupleScore, Achievement } from '@/services/engagementService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Trophy,
  Star,
  Heart,
  Target,
  Zap,
  Calendar,
  TrendingUp,
  Award,
  Crown,
  Gem,
  Flame,
  CheckCircle,
  Plus,
  Edit,
  Share,
  Lock,
  Unlock,
  Users,
  MessageCircle,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Clock,
  BarChart3,
  Activity,
  Gift,
  Sparkles,
  XCircle,
  Info
} from 'lucide-react';

export function StreaksEngagement() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [coupleScore, setCoupleScore] = useState<CoupleScore | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [checkInStatus, setCheckInStatus] = useState<{ hasCheckedIn: boolean; checkIn?: CheckIn; streak: number; nextCheckInTime?: Date }>({ hasCheckedIn: false, streak: 0 });
  const [checkInMessage, setCheckInMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [countdownTime, setCountdownTime] = useState<string>('');

  const [newCheckIn, setNewCheckIn] = useState({
    mood: 'happy' as CheckIn['mood'],
    emoji: '😊',
    note: '',
    energy: 8,
    gratitude: '',
    goals: [] as string[],
    partnerMessage: '',
    isShared: true
  });

  const moodOptions = [
    { value: 'excited', emoji: '🤩', label: 'Excited', color: 'text-purple-500' },
    { value: 'happy', emoji: '😊', label: 'Happy', color: 'text-yellow-500' },
    { value: 'content', emoji: '😌', label: 'Content', color: 'text-green-500' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'text-gray-500' },
    { value: 'sad', emoji: '😢', label: 'Sad', color: 'text-blue-500' },
    { value: 'stressed', emoji: '😰', label: 'Stressed', color: 'text-red-500' },
    { value: 'tired', emoji: '😴', label: 'Tired', color: 'text-indigo-500' }
  ];

  useEffect(() => {
    if (user) {
      engagementService.initialize(user.id);
      loadData();
      
      // Subscribe to real-time updates
      const unsubscribe = engagementService.subscribe(() => {
        loadData();
      });
      
      // Set up periodic refresh for real-time updates
      const interval = setInterval(() => {
        loadData();
      }, 30000); // Refresh every 30 seconds
      
      // Set up countdown timer for next check-in
      const countdownInterval = setInterval(() => {
        if (checkInStatus.nextCheckInTime) {
          setCountdownTime(formatTimeUntilNextCheckIn(checkInStatus.nextCheckInTime));
        }
      }, 60000); // Update every minute
      
      return () => {
        unsubscribe();
        clearInterval(interval);
        clearInterval(countdownInterval);
      };
    }
  }, [user]);

  const loadData = () => {
    setCheckIns(engagementService.getCheckIns());
    setStreaks(engagementService.getStreaks());
    const coupleScoreData = engagementService.getCoupleScore();
    setCoupleScore(coupleScoreData);
    setAchievements(engagementService.getAchievements());
    setTodayCheckIn(engagementService.getTodayCheckIn());
    setStats(engagementService.getStats());
    const status = engagementService.getCheckInStatus();
    setCheckInStatus(status);
    
    // Update countdown time
    if (status.nextCheckInTime) {
      setCountdownTime(formatTimeUntilNextCheckIn(status.nextCheckInTime));
    }
  };

  const handleCreateCheckIn = async () => {
    if (!newCheckIn.note.trim()) {
      setCheckInMessage({ type: 'error', text: 'Please add a note to your check-in!' });
      return;
    }

    const result = await engagementService.createCheckIn({
      userId: user!.id,
      date: new Date(),
      mood: newCheckIn.mood,
      emoji: newCheckIn.emoji,
      note: newCheckIn.note,
      energy: newCheckIn.energy,
      gratitude: newCheckIn.gratitude,
      goals: newCheckIn.goals,
      partnerMessage: newCheckIn.partnerMessage,
      isShared: newCheckIn.isShared
    });

    if (result.success) {
      setCheckInMessage({ type: 'success', text: result.message || 'Check-in successful!' });
      setNewCheckIn({
        mood: 'happy',
        emoji: '😊',
        note: '',
        energy: 8,
        gratitude: '',
        goals: [],
        partnerMessage: '',
        isShared: true
      });
      setShowCheckIn(false);
      // Clear message after 3 seconds
      setTimeout(() => setCheckInMessage(null), 3000);
    } else {
      setCheckInMessage({ type: 'error', text: result.message || 'Failed to create check-in' });
      // Clear message after 5 seconds
      setTimeout(() => setCheckInMessage(null), 5000);
    }
  };

  const getMoodIcon = (mood: CheckIn['mood']) => {
    const moodOption = moodOptions.find(m => m.value === mood);
    return moodOption?.emoji || '😊';
  };

  const getMoodColor = (mood: CheckIn['mood']) => {
    const moodOption = moodOptions.find(m => m.value === mood);
    return moodOption?.color || 'text-gray-500';
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'daily-checkin': return MessageCircle;
      case 'task-completion': return CheckCircle;
      case 'note-sharing': return Share;
      case 'event-planning': return Calendar;
      case 'finance-tracking': return BarChart3;
      default: return Activity;
    }
  };

  const formatTimeUntilNextCheckIn = (nextCheckInTime: Date): string => {
    const now = new Date();
    const diff = nextCheckInTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Available now!';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m until next check-in`;
    } else {
      return `${minutes}m until next check-in`;
    }
  };

  const getAchievementRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      {/* Header */}
      <Card className="glass-card border-glass-border">
        <CardHeader className="p-4 sm:p-6">
          {/* Check-in Message */}
          {checkInMessage && (
            <div className={`mb-4 p-3 rounded-lg border ${
              checkInMessage.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : checkInMessage.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                {checkInMessage.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                {checkInMessage.type === 'error' && <XCircle className="w-4 h-4 flex-shrink-0" />}
                {checkInMessage.type === 'info' && <Info className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm font-medium break-words">{checkInMessage.text}</span>
              </div>
            </div>
          )}
          
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-semibold">Streaks & Engagement</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!checkInStatus.hasCheckedIn ? (
                <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary gap-2 hover:shadow-lg transition-all w-full sm:w-auto text-sm sm:text-base">
                      <Plus className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Daily Check-in</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-glass-border max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Daily Check-in
                      </DialogTitle>
                      <p className="text-sm text-gray-600">
                        Share how you're feeling and continue your streak!
                      </p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>How are you feeling today?</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {moodOptions.map((mood) => (
                            <button
                              key={mood.value}
                              onClick={() => setNewCheckIn(prev => ({ 
                                ...prev, 
                                mood: mood.value as CheckIn['mood'],
                                emoji: mood.emoji
                              }))}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                newCheckIn.mood === mood.value 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-transparent hover:border-primary/50'
                              }`}
                            >
                              <div className="text-2xl mb-1">{mood.emoji}</div>
                              <div className="text-xs">{mood.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Energy Level: {newCheckIn.energy}/10</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">😴</span>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={newCheckIn.energy}
                            onChange={(e) => setNewCheckIn(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                            className="flex-1"
                          />
                          <span className="text-sm">⚡</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>What's on your mind?</Label>
                        <Textarea
                          placeholder="Share your thoughts, feelings, or what happened today..."
                          value={newCheckIn.note}
                          onChange={(e) => setNewCheckIn(prev => ({ ...prev, note: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Gratitude (Optional)</Label>
                        <Input
                          placeholder="What are you grateful for today?"
                          value={newCheckIn.gratitude}
                          onChange={(e) => setNewCheckIn(prev => ({ ...prev, gratitude: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Message for your partner (Optional)</Label>
                        <Input
                          placeholder="Leave a sweet message..."
                          value={newCheckIn.partnerMessage}
                          onChange={(e) => setNewCheckIn(prev => ({ ...prev, partnerMessage: e.target.value }))}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={newCheckIn.isShared}
                          onCheckedChange={(checked) => setNewCheckIn(prev => ({ ...prev, isShared: checked }))}
                        />
                        <Label>Share with partner</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleCreateCheckIn} className="flex-1 bg-gradient-primary">
                          Check In
                        </Button>
                        <Button variant="outline" onClick={() => setShowCheckIn(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="flex flex-col gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="text-green-700 font-medium text-xs sm:text-sm break-words">
                      Checked in today! 🔥 {checkInStatus.streak} day streak
                    </span>
                  </div>
                  {checkInStatus.nextCheckInTime && countdownTime && (
                    <div className="text-xs text-green-600 break-words">
                      {countdownTime}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="glass-card border-glass-border">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-500">{stats?.currentStreaks || 0}</div>
            <div className="text-xs sm:text-sm text-gray-600 break-words">Active Streaks</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-glass-border">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{stats?.totalCheckIns || 0}</div>
            <div className="text-xs sm:text-sm text-gray-600 break-words">Total Check-ins</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-glass-border">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-500">{achievements.filter(a => a.isUnlocked).length}</div>
            <div className="text-xs sm:text-sm text-gray-600 break-words">Achievements</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-glass-border">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-500">{coupleScore?.totalScore || 0}</div>
            <div className="text-xs sm:text-sm text-gray-600 break-words">Couple Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="checkins" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="checkins" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Check-ins</TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Achievements</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm py-2 px-1 sm:px-3">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="checkins" className="space-y-4">
          {/* Recent Check-ins */}
          <Card className="glass-card border-glass-border">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                <span>Recent Check-ins</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {checkIns.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm sm:text-base text-gray-700">No check-ins yet. Start your streak today!</p>
                </div>
              ) : (
                checkIns.slice(0, 5).map((checkIn) => (
                  <div key={checkIn.id} className="p-3 sm:p-4 rounded-lg border border-glass-border bg-glass-card">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{getMoodIcon(checkIn.mood)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm sm:text-base truncate">{checkIn.mood.charAt(0).toUpperCase() + checkIn.mood.slice(1)}</div>
                          <div className="text-xs sm:text-sm text-gray-700">
                            {new Date(checkIn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                        <span className="text-xs sm:text-sm">{checkIn.energy}/10</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">{checkIn.note}</p>
                    {checkIn.gratitude && (
                      <p className="text-xs sm:text-sm text-green-600 italic break-words">Grateful for: {checkIn.gratitude}</p>
                    )}
                    {checkIn.partnerMessage && (
                      <p className="text-xs sm:text-sm text-purple-600 italic break-words">Message: {checkIn.partnerMessage}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Current Streaks */}
          <Card className="glass-card border-glass-border">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Flame className="w-5 h-5 flex-shrink-0" />
                <span>Current Streaks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {streaks.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Flame className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm sm:text-base text-gray-700">No active streaks. Start building your habits!</p>
                </div>
              ) : (
                streaks.map((streak) => {
                  const StreakIcon = getStreakIcon(streak.type);
                  return (
                    <div key={streak.id} className="p-3 sm:p-4 rounded-lg border border-glass-border bg-glass-card">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <StreakIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                          <span className="font-medium capitalize text-sm sm:text-base truncate">
                            {streak.type.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                          <span className="font-bold text-sm sm:text-base">{streak.currentStreak}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Progress</span>
                          <span>{streak.currentStreak}/{streak.goal}</span>
                        </div>
                        <Progress 
                          value={(streak.currentStreak / streak.goal) * 100} 
                          className="h-2"
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700 mt-2">
                        Best: {streak.longestStreak} days
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card className="glass-card border-glass-border">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Award className="w-5 h-5 flex-shrink-0" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 grid grid-cols-1 gap-3 sm:gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`p-3 sm:p-4 rounded-lg border ${
                    achievement.isUnlocked 
                      ? 'border-yellow-200 bg-yellow-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`text-xl sm:text-2xl flex-shrink-0 ${achievement.isUnlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{achievement.name}</div>
                      <div className={`text-xs sm:text-sm ${getAchievementRarityColor(achievement.rarity)}`}>
                        {achievement.rarity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">{achievement.description}</p>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium">{achievement.points} points</span>
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <span className="text-xs text-gray-700 truncate">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="glass-card border-glass-border">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span>Activity History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 sm:p-4 rounded-lg bg-glass-card border border-glass-border">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{stats?.totalCheckIns || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Check-ins</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 rounded-lg bg-glass-card border border-glass-border">
                  <div className="text-xl sm:text-2xl font-bold text-green-500">{stats?.weeklyActivity || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">This Week</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 rounded-lg bg-glass-card border border-glass-border">
                  <div className="text-xl sm:text-2xl font-bold text-orange-500">{stats?.longestStreak || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Longest Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}