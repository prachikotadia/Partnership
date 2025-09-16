import { notificationService } from './notificationService';
import { reminderScheduler } from './reminderScheduler';

export interface CheckIn {
  id: string;
  userId: string;
  date: Date;
  mood: 'excited' | 'happy' | 'content' | 'neutral' | 'sad' | 'stressed' | 'tired';
  emoji: string;
  note?: string;
  energy: number; // 1-10 scale
  gratitude?: string;
  goals?: string[];
  partnerMessage?: string;
  isShared: boolean;
  createdAt: Date;
}

export interface Streak {
  id: string;
  type: 'daily-checkin' | 'task-completion' | 'note-sharing' | 'event-planning' | 'finance-tracking';
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date;
  startDate: Date;
  isActive: boolean;
  goal: number;
  milestone: number;
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: Date;
    points: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CoupleScore {
  id: string;
  userId: string;
  partnerId: string;
  totalScore: number;
  weeklyScore: number;
  monthlyScore: number;
  categories: {
    communication: number;
    planning: number;
    sharing: number;
    engagement: number;
    consistency: number;
  };
  level: number;
  xp: number;
  xpToNextLevel: number;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: Date;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }[];
  lastUpdated: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'communication' | 'planning' | 'sharing' | 'engagement';
  requirement: {
    type: 'streak' | 'count' | 'score' | 'combo';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  };
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: Date;
}

class EngagementService {
  private checkIns: Map<string, CheckIn> = new Map();
  private streaks: Map<string, Streak> = new Map();
  private coupleScores: Map<string, CoupleScore> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private userId: string | null = null;
  private partnerId: string | null = null;
  private listeners: Array<() => void> = [];

  async initialize(userId: string, partnerId?: string) {
    this.userId = userId;
    this.partnerId = partnerId;
    await this.loadData();
    await this.initializeDefaultAchievements();
    await this.initializeStreaks();
    await this.initializeCoupleScore();
  }

  // Real-time updates
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Check-In Management
  async createCheckIn(checkIn: Omit<CheckIn, 'id' | 'createdAt'>): Promise<{ success: boolean; message?: string; checkInId?: string }> {
    // Check if user has already checked in today
    const todayCheckIn = this.getTodayCheckIn();
    if (todayCheckIn) {
      return {
        success: false,
        message: 'You have already checked in today! Come back tomorrow to continue your streak.'
      };
    }

    const checkInId = `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCheckIn: CheckIn = {
      ...checkIn,
      id: checkInId,
      createdAt: new Date()
    };

    this.checkIns.set(checkInId, newCheckIn);
    await this.updateStreaks('daily-checkin');
    await this.updateCoupleScore('communication', 10);
    await this.checkAchievements();
    await this.saveData();

    // Notify partner if shared
    if (newCheckIn.isShared && this.partnerId) {
      await notificationService.notifyPartnerEdit(
        this.userId!,
        'checkin',
        `Daily check-in: ${newCheckIn.mood} ${newCheckIn.emoji}`
      );
    }

    // Notify all listeners about the update
    this.notifyListeners();

    return {
      success: true,
      message: 'Check-in successful! Your streak continues.',
      checkInId
    };
  }

  async updateCheckIn(id: string, updates: Partial<CheckIn>): Promise<void> {
    const checkIn = this.checkIns.get(id);
    if (checkIn) {
      const updatedCheckIn = { ...checkIn, ...updates };
      this.checkIns.set(id, updatedCheckIn);
      await this.saveData();
    }
  }

  // Streak Management
  private async initializeStreaks(): Promise<void> {
    const streakTypes: Streak['type'][] = [
      'daily-checkin',
      'task-completion',
      'note-sharing',
      'event-planning',
      'finance-tracking'
    ];

    for (const type of streakTypes) {
      const existingStreak = Array.from(this.streaks.values()).find(s => s.type === type && s.userId === this.userId);
      if (!existingStreak) {
        const streak: Streak = {
          id: `streak_${type}_${this.userId}`,
          type,
          userId: this.userId!,
          currentStreak: 0,
          longestStreak: 0,
          lastCheckIn: new Date(0),
          startDate: new Date(),
          isActive: true,
          goal: this.getStreakGoal(type),
          milestone: 0,
          achievements: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.streaks.set(streak.id, streak);
      }
    }
  }

  private getStreakGoal(type: Streak['type']): number {
    switch (type) {
      case 'daily-checkin': return 30;
      case 'task-completion': return 14;
      case 'note-sharing': return 7;
      case 'event-planning': return 4;
      case 'finance-tracking': return 7;
      default: return 7;
    }
  }

  async updateStreaks(type: Streak['type']): Promise<void> {
    const streak = Array.from(this.streaks.values()).find(s => s.type === type && s.userId === this.userId);
    if (streak) {
      const now = new Date();
      const lastCheckIn = new Date(streak.lastCheckIn);
      const daysDiff = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Continue streak
        streak.currentStreak++;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        streak.lastCheckIn = now;
        streak.updatedAt = now;

        // Check for milestones
        await this.checkStreakMilestones(streak);

        // Schedule streak reminder
        await reminderScheduler.createStreakReminder({
          type: this.getStreakDisplayName(type),
          currentStreak: streak.currentStreak,
          lastCheckIn: now,
          reminderTime: '09:00',
          isActive: true,
          goal: streak.goal
        });
      } else if (daysDiff > 1) {
        // Streak broken
        streak.currentStreak = 1;
        streak.lastCheckIn = now;
        streak.updatedAt = now;
      }

      this.streaks.set(streak.id, streak);
    }
  }

  private getStreakDisplayName(type: Streak['type']): string {
    switch (type) {
      case 'daily-checkin': return 'Daily Check-in';
      case 'task-completion': return 'Task Completion';
      case 'note-sharing': return 'Note Sharing';
      case 'event-planning': return 'Event Planning';
      case 'finance-tracking': return 'Finance Tracking';
      default: return 'Activity';
    }
  }

  private async checkStreakMilestones(streak: Streak): Promise<void> {
    const milestones = [3, 7, 14, 30, 60, 100];
    const newMilestone = milestones.find(m => m > streak.milestone && streak.currentStreak >= m);
    
    if (newMilestone) {
      streak.milestone = newMilestone;
      
      // Create achievement
      const achievement = {
        id: `milestone_${streak.type}_${newMilestone}`,
        name: `${newMilestone} Day Streak!`,
        description: `Maintained ${this.getStreakDisplayName(streak.type)} for ${newMilestone} days`,
        icon: this.getStreakIcon(newMilestone),
        unlockedAt: new Date(),
        points: newMilestone * 10
      };
      
      streak.achievements.push(achievement);
      
      // Notify user
      await notificationService.createReminder({
        type: 'streak',
        title: 'Streak Milestone! 🎉',
        message: `Congratulations! You've maintained your ${this.getStreakDisplayName(streak.type)} streak for ${newMilestone} days!`,
        scheduledTime: new Date(),
        isActive: true,
        userId: this.userId!
      });
    }
  }

  private getStreakIcon(days: number): string {
    if (days >= 100) return '🏆';
    if (days >= 60) return '🥇';
    if (days >= 30) return '⭐';
    if (days >= 14) return '🔥';
    if (days >= 7) return '💪';
    return '🎯';
  }

  // Couple Score Management
  private async initializeCoupleScore(): Promise<void> {
    if (!this.partnerId) return;

    const existingScore = Array.from(this.coupleScores.values())
      .find(s => s.userId === this.userId && s.partnerId === this.partnerId);
    
    if (!existingScore) {
      const coupleScore: CoupleScore = {
        id: `couple_${this.userId}_${this.partnerId}`,
        userId: this.userId!,
        partnerId: this.partnerId,
        totalScore: 0,
        weeklyScore: 0,
        monthlyScore: 0,
        categories: {
          communication: 0,
          planning: 0,
          sharing: 0,
          engagement: 0,
          consistency: 0
        },
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        badges: [],
        lastUpdated: new Date()
      };
      this.coupleScores.set(coupleScore.id, coupleScore);
    }
  }

  async updateCoupleScore(category: keyof CoupleScore['categories'], points: number): Promise<void> {
    if (!this.partnerId) return;

    const score = Array.from(this.coupleScores.values())
      .find(s => s.userId === this.userId && s.partnerId === this.partnerId);
    
    if (score) {
      score.categories[category] += points;
      score.totalScore += points;
      score.weeklyScore += points;
      score.monthlyScore += points;
      score.xp += points;
      score.lastUpdated = new Date();

      // Check for level up
      if (score.xp >= score.xpToNextLevel) {
        score.level++;
        score.xp -= score.xpToNextLevel;
        score.xpToNextLevel = Math.floor(score.xpToNextLevel * 1.2);

        // Notify level up
        await notificationService.createReminder({
          type: 'streak',
          title: 'Level Up! 🎉',
          message: `Congratulations! You and your partner reached level ${score.level}!`,
          scheduledTime: new Date(),
          isActive: true,
          userId: this.userId!
        });
      }

      this.coupleScores.set(score.id, score);
    }
  }

  // Achievement System
  private async initializeDefaultAchievements(): Promise<void> {
    const defaultAchievements: Achievement[] = [
      // Streak Achievements
      {
        id: 'streak_7_days',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        category: 'streak',
        requirement: { type: 'streak', value: 7 },
        points: 50,
        rarity: 'common',
        isUnlocked: false
      },
      {
        id: 'streak_30_days',
        name: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: '⭐',
        category: 'streak',
        requirement: { type: 'streak', value: 30 },
        points: 200,
        rarity: 'rare',
        isUnlocked: false
      },
      {
        id: 'streak_100_days',
        name: 'Century Champion',
        description: 'Maintain a 100-day streak',
        icon: '🏆',
        category: 'streak',
        requirement: { type: 'streak', value: 100 },
        points: 1000,
        rarity: 'legendary',
        isUnlocked: false
      },
      
      // Communication Achievements
      {
        id: 'checkin_7_days',
        name: 'Daily Communicator',
        description: 'Check in for 7 consecutive days',
        icon: '💬',
        category: 'communication',
        requirement: { type: 'count', value: 7, timeframe: 'weekly' },
        points: 100,
        rarity: 'common',
        isUnlocked: false
      },
      {
        id: 'checkin_30_days',
        name: 'Consistent Connector',
        description: 'Check in for 30 days in a month',
        icon: '💝',
        category: 'communication',
        requirement: { type: 'count', value: 30, timeframe: 'monthly' },
        points: 300,
        rarity: 'rare',
        isUnlocked: false
      },

      // Planning Achievements
      {
        id: 'plan_5_events',
        name: 'Event Planner',
        description: 'Plan 5 events together',
        icon: '📅',
        category: 'planning',
        requirement: { type: 'count', value: 5 },
        points: 150,
        rarity: 'common',
        isUnlocked: false
      },
      {
        id: 'plan_trip',
        name: 'Travel Buddy',
        description: 'Plan a trip together',
        icon: '✈️',
        category: 'planning',
        requirement: { type: 'count', value: 1 },
        points: 200,
        rarity: 'rare',
        isUnlocked: false
      },

      // Sharing Achievements
      {
        id: 'share_10_notes',
        name: 'Note Sharer',
        description: 'Share 10 notes with your partner',
        icon: '📝',
        category: 'sharing',
        requirement: { type: 'count', value: 10 },
        points: 100,
        rarity: 'common',
        isUnlocked: false
      },
      {
        id: 'share_funny_note',
        name: 'Comedy Partner',
        description: 'Share a funny note',
        icon: '😂',
        category: 'sharing',
        requirement: { type: 'count', value: 1 },
        points: 50,
        rarity: 'common',
        isUnlocked: false
      },

      // Engagement Achievements
      {
        id: 'score_1000',
        name: 'Power Couple',
        description: 'Reach 1000 couple score points',
        icon: '💕',
        category: 'engagement',
        requirement: { type: 'score', value: 1000 },
        points: 500,
        rarity: 'epic',
        isUnlocked: false
      },
      {
        id: 'level_10',
        name: 'Relationship Expert',
        description: 'Reach level 10 as a couple',
        icon: '👑',
        category: 'engagement',
        requirement: { type: 'score', value: 1000 },
        points: 1000,
        rarity: 'legendary',
        isUnlocked: false
      }
    ];

    for (const achievement of defaultAchievements) {
      if (!this.achievements.has(achievement.id)) {
        this.achievements.set(achievement.id, achievement);
      }
    }
  }

  async checkAchievements(): Promise<void> {
    for (const achievement of this.achievements.values()) {
      if (achievement.isUnlocked) continue;

      let isUnlocked = false;

      switch (achievement.requirement.type) {
        case 'streak':
          const streak = Array.from(this.streaks.values())
            .find(s => s.userId === this.userId && s.currentStreak >= achievement.requirement.value);
          isUnlocked = !!streak;
          break;

        case 'count':
          const count = this.getActivityCount(achievement.requirement.timeframe || 'all-time');
          isUnlocked = count >= achievement.requirement.value;
          break;

        case 'score':
          const score = this.getCoupleScoreValue();
          isUnlocked = score >= achievement.requirement.value;
          break;
      }

      if (isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();

        // Notify user
        await notificationService.createReminder({
          type: 'streak',
          title: 'Achievement Unlocked! 🏆',
          message: `${achievement.name}: ${achievement.description}`,
          scheduledTime: new Date(),
          isActive: true,
          userId: this.userId!
        });
      }
    }
  }

  private getActivityCount(timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time'): number {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    return Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.createdAt >= startDate).length;
  }

  private getCoupleScoreValue(): number {
    const score = Array.from(this.coupleScores.values())
      .find(s => s.userId === this.userId);
    return score?.totalScore || 0;
  }

  // Data Management
  private async loadData(): Promise<void> {
    try {
      const saved = localStorage.getItem(`engagement_${this.userId}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.checkIns) {
          data.checkIns.forEach((checkIn: CheckIn) => {
            this.checkIns.set(checkIn.id, {
              ...checkIn,
              date: new Date(checkIn.date),
              createdAt: new Date(checkIn.createdAt)
            });
          });
        }
        if (data.streaks) {
          data.streaks.forEach((streak: Streak) => {
            this.streaks.set(streak.id, {
              ...streak,
              lastCheckIn: new Date(streak.lastCheckIn),
              startDate: new Date(streak.startDate),
              createdAt: new Date(streak.createdAt),
              updatedAt: new Date(streak.updatedAt)
            });
          });
        }
        if (data.coupleScores) {
          data.coupleScores.forEach((score: CoupleScore) => {
            this.coupleScores.set(score.id, {
              ...score,
              lastUpdated: new Date(score.lastUpdated)
            });
          });
        }
        if (data.achievements) {
          data.achievements.forEach((achievement: Achievement) => {
            this.achievements.set(achievement.id, {
              ...achievement,
              unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
            });
          });
        }
      }
    } catch (error) {
      console.error('Failed to load engagement data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      const data = {
        checkIns: Array.from(this.checkIns.values()),
        streaks: Array.from(this.streaks.values()),
        coupleScores: Array.from(this.coupleScores.values()),
        achievements: Array.from(this.achievements.values())
      };
      localStorage.setItem(`engagement_${this.userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save engagement data:', error);
    }
  }

  // Getters
  getCheckIns(): CheckIn[] {
    return Array.from(this.checkIns.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getStreaks(): Streak[] {
    return Array.from(this.streaks.values()).filter(s => s.userId === this.userId);
  }

  getCoupleScore(): CoupleScore | undefined {
    return Array.from(this.coupleScores.values())
      .find(s => s.userId === this.userId);
  }

  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getUnlockedAchievements(): Achievement[] {
    return this.getAchievements().filter(a => a.isUnlocked);
  }

  getTodayCheckIn(): CheckIn | undefined {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.checkIns.values())
      .find(checkIn => checkIn.date >= today && checkIn.date < tomorrow);
  }

  hasCheckedInToday(): boolean {
    return this.getTodayCheckIn() !== undefined;
  }

  getCheckInStatus(): { hasCheckedIn: boolean; checkIn?: CheckIn; streak: number; nextCheckInTime?: Date } {
    const todayCheckIn = this.getTodayCheckIn();
    const dailyStreak = this.streaks.get('daily-checkin') || { currentStreak: 0 };
    
    // Calculate next check-in time (midnight tomorrow)
    const nextCheckInTime = new Date();
    nextCheckInTime.setDate(nextCheckInTime.getDate() + 1);
    nextCheckInTime.setHours(0, 0, 0, 0);
    
    return {
      hasCheckedIn: todayCheckIn !== undefined,
      checkIn: todayCheckIn,
      streak: dailyStreak.currentStreak,
      nextCheckInTime: todayCheckIn ? nextCheckInTime : undefined
    };
  }

  // Statistics
  getStats(): {
    totalCheckIns: number;
    currentStreaks: number;
    longestStreak: number;
    totalScore: number;
    level: number;
    achievementsUnlocked: number;
    weeklyActivity: number;
    monthlyActivity: number;
  } {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const streaks = this.getStreaks();
    const coupleScore = this.getCoupleScore();

    return {
      totalCheckIns: this.checkIns.size,
      currentStreaks: streaks.filter(s => s.currentStreak > 0).length,
      longestStreak: Math.max(...streaks.map(s => s.longestStreak), 0),
      totalScore: coupleScore?.totalScore || 0,
      level: coupleScore?.level || 1,
      achievementsUnlocked: this.getUnlockedAchievements().length,
      weeklyActivity: Array.from(this.checkIns.values())
        .filter(c => c.createdAt >= weekAgo).length,
      monthlyActivity: Array.from(this.checkIns.values())
        .filter(c => c.createdAt >= monthAgo).length
    };
  }
}

export const engagementService = new EngagementService();
