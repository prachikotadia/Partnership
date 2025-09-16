import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { emitToPartner } from '../services/socketService';
import { io } from '../index';

const router = express.Router();
const prisma = new PrismaClient();

// Get all check-ins
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [checkIns, total] = await Promise.all([
    prisma.checkIn.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.checkIn.count({
      where: {
        userId: req.user.id,
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      checkIns,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Get today's check-in
router.get('/today', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkIn = await prisma.checkIn.findFirst({
    where: {
      userId: req.user.id,
      createdAt: {
        gte: today,
        lt: tomorrow,
      }
    }
  });

  res.json({
    success: true,
    data: checkIn
  });
}));

// Create check-in
router.post('/', [
  body('mood').trim().isLength({ min: 1, max: 50 }).withMessage('Mood is required'),
  body('emoji').trim().isLength({ min: 1, max: 10 }).withMessage('Emoji is required'),
  body('note').trim().isLength({ min: 1, max: 1000 }).withMessage('Note is required and must be less than 1000 characters'),
  body('energy').isInt({ min: 1, max: 10 }).withMessage('Energy must be between 1 and 10'),
  body('gratitude').optional().trim().isLength({ max: 500 }).withMessage('Gratitude must be less than 500 characters'),
  body('goals').optional().isArray().withMessage('Goals must be an array'),
  body('partnerMessage').optional().trim().isLength({ max: 500 }).withMessage('Partner message must be less than 500 characters'),
  body('isShared').optional().isBoolean().withMessage('isShared must be boolean'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { mood, emoji, note, energy, gratitude, goals = [], partnerMessage, isShared = true } = req.body;

  // Check if user already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId: req.user.id,
      createdAt: {
        gte: today,
        lt: tomorrow,
      }
    }
  });

  if (existingCheckIn) {
    throw createError('You have already checked in today! Come back tomorrow to continue your streak.', 409);
  }

  const checkIn = await prisma.checkIn.create({
    data: {
      mood,
      emoji,
      note,
      energy,
      gratitude,
      goals,
      partnerMessage,
      isShared,
      userId: req.user.id,
    }
  });

  // Update or create streak
  await prisma.streak.upsert({
    where: {
      userId_type: {
        userId: req.user.id,
        type: 'daily-checkin'
      }
    },
    update: {
      currentStreak: {
        increment: 1
      },
      lastActivity: new Date(),
    },
    create: {
      userId: req.user.id,
      type: 'daily-checkin',
      currentStreak: 1,
      longestStreak: 1,
      goal: 30,
      lastActivity: new Date(),
    }
  });

  // Emit to partner if exists and check-in is shared
  if (req.user.partnerId && isShared) {
    emitToPartner(io, req.user.partnerId, 'checkin:created', {
      checkIn,
      createdBy: req.user.name,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Check-in successful! Your streak continues.',
    data: checkIn
  });
}));

// Get streaks
router.get('/streaks', asyncHandler(async (req: AuthRequest, res) => {
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

  const [totalCheckIns, weeklyCheckIns, longestStreak, currentStreaks] = await Promise.all([
    prisma.checkIn.count({
      where: { userId: req.user.id }
    }),
    prisma.checkIn.count({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.streak.aggregate({
      where: { userId: req.user.id },
      _max: { longestStreak: true }
    }),
    prisma.streak.count({
      where: {
        userId: req.user.id,
        currentStreak: { gt: 0 }
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalCheckIns,
      weeklyCheckIns,
      longestStreak: longestStreak._max.longestStreak || 0,
      currentStreaks
    }
  });
}));

export default router;
