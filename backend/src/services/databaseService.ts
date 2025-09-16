import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export const initializeDatabase = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Run any necessary migrations or setup
    await setupDefaultData();
    
    return prisma;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

const setupDefaultData = async () => {
  try {
    // Create default achievements if they don't exist
    const achievementCount = await prisma.achievement.count();
    
    if (achievementCount === 0) {
      const defaultAchievements = [
        {
          name: 'First Steps',
          description: 'Complete your first task',
          icon: '🎯',
          points: 10,
          rarity: 'common',
          category: 'tasks'
        },
        {
          name: 'Streak Master',
          description: 'Maintain a 7-day check-in streak',
          icon: '🔥',
          points: 50,
          rarity: 'rare',
          category: 'streaks'
        },
        {
          name: 'Note Taker',
          description: 'Create your first note',
          icon: '📝',
          points: 15,
          rarity: 'common',
          category: 'notes'
        },
        {
          name: 'Dream Builder',
          description: 'Add your first bucket list item',
          icon: '🌟',
          points: 25,
          rarity: 'common',
          category: 'bucket'
        },
        {
          name: 'Financial Planner',
          description: 'Add your first finance entry',
          icon: '💰',
          points: 20,
          rarity: 'common',
          category: 'finance'
        },
        {
          name: 'Schedule Keeper',
          description: 'Create your first schedule item',
          icon: '📅',
          points: 15,
          rarity: 'common',
          category: 'schedule'
        },
        {
          name: 'Partner in Crime',
          description: 'Connect with your partner',
          icon: '💕',
          points: 100,
          rarity: 'legendary',
          category: 'social'
        },
        {
          name: 'Consistency King',
          description: 'Check in for 30 days straight',
          icon: '👑',
          points: 200,
          rarity: 'legendary',
          category: 'streaks'
        },
        {
          name: 'Task Destroyer',
          description: 'Complete 100 tasks',
          icon: '⚡',
          points: 150,
          rarity: 'epic',
          category: 'tasks'
        },
        {
          name: 'Memory Keeper',
          description: 'Create 50 notes',
          icon: '📚',
          points: 100,
          rarity: 'epic',
          category: 'notes'
        }
      ];

      await prisma.achievement.createMany({
        data: defaultAchievements
      });

      console.log('✅ Default achievements created');
    }
  } catch (error) {
    console.error('❌ Failed to setup default data:', error);
  }
};

export { prisma };
