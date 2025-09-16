import express from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../services/databaseService';

const router = express.Router();

// Get all streaks
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const streaks = await prisma.streak.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: { updatedAt: 'desc' }
  });

  res.json({
    success: true,
    data: streaks
  });
}));

// Get streak statistics
router.get('/stats', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const [totalStreaks, activeStreaks, longestStreak] = await Promise.all([
    prisma.streak.count({
      where: { userId: req.user.id }
    }),
    prisma.streak.count({
      where: {
        userId: req.user.id,
        currentStreak: { gt: 0 }
      }
    }),
    prisma.streak.aggregate({
      where: { userId: req.user.id },
      _max: { longestStreak: true }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalStreaks,
      activeStreaks,
      longestStreak: longestStreak._max.longestStreak || 0
    }
  });
}));

export default router;
