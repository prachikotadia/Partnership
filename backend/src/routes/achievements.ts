import express from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../services/databaseService';

const router = express.Router();

// Get all achievements
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const achievements = await prisma.achievement.findMany({
    include: {
      userAchievements: {
        where: { userId: req.user.id },
        select: {
          isUnlocked: true,
          unlockedAt: true,
        }
      }
    },
    orderBy: { points: 'desc' }
  });

  // Transform to include user's unlock status
  const achievementsWithStatus = achievements.map(achievement => ({
    ...achievement,
    isUnlocked: achievement.userAchievements.length > 0 ? achievement.userAchievements[0].isUnlocked : false,
    unlockedAt: achievement.userAchievements.length > 0 ? achievement.userAchievements[0].unlockedAt : null,
    userAchievements: undefined
  }));

  res.json({
    success: true,
    data: achievementsWithStatus
  });
}));

// Get user's achievements
router.get('/my', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const userAchievements = await prisma.userAchievement.findMany({
    where: {
      userId: req.user.id,
      isUnlocked: true
    },
    include: {
      achievement: true
    },
    orderBy: { unlockedAt: 'desc' }
  });

  res.json({
    success: true,
    data: userAchievements
  });
}));

export default router;
