import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      preferences: true,
      partner: {
        select: {
          id: true,
          name: true,
          email: true,
          color: true,
          avatar: true,
        }
      },
      _count: {
        select: {
          tasks: true,
          notes: true,
          checkIns: true,
          bucketListItems: true,
          scheduleItems: true,
          financeEntries: true,
        }
      }
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: userWithoutPassword
  });
}));

// Update user preferences
router.put('/preferences', [
  body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
  body('language').optional().isLength({ min: 2, max: 5 }).withMessage('Invalid language code'),
  body('timezone').optional().isString().withMessage('Invalid timezone'),
  body('notifications').optional().isBoolean().withMessage('Notifications must be boolean'),
  body('emailNotifications').optional().isBoolean().withMessage('Email notifications must be boolean'),
  body('pushNotifications').optional().isBoolean().withMessage('Push notifications must be boolean'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { theme, language, timezone, notifications, emailNotifications, pushNotifications } = req.body;

  const updateData: any = {};
  if (theme !== undefined) updateData.theme = theme;
  if (language !== undefined) updateData.language = language;
  if (timezone !== undefined) updateData.timezone = timezone;
  if (notifications !== undefined) updateData.notifications = notifications;
  if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
  if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;

  const preferences = await prisma.userPreferences.upsert({
    where: { userId: req.user.id },
    update: updateData,
    create: {
      userId: req.user.id,
      ...updateData
    }
  });

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: preferences
  });
}));

// Connect with partner
router.post('/connect-partner', [
  body('partnerEmail').isEmail().normalizeEmail().withMessage('Valid partner email is required'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { partnerEmail } = req.body;

  // Check if user is trying to connect with themselves
  if (req.user.email === partnerEmail) {
    throw createError('Cannot connect with yourself', 400);
  }

  // Find partner
  const partner = await prisma.user.findUnique({
    where: { email: partnerEmail }
  });

  if (!partner) {
    throw createError('Partner not found', 404);
  }

  // Check if partner already has a connection
  if (partner.partnerId) {
    throw createError('Partner is already connected to someone else', 409);
  }

  // Check if current user already has a partner
  const currentUser = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  if (currentUser?.partnerId) {
    throw createError('You are already connected to a partner', 409);
  }

  // Create the connection
  await prisma.$transaction(async (tx) => {
    // Update current user
    await tx.user.update({
      where: { id: req.user!.id },
      data: { partnerId: partner.id }
    });

    // Update partner
    await tx.user.update({
      where: { id: partner.id },
      data: { partnerId: req.user!.id }
    });
  });

  // Get updated user with partner info
  const updatedUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      partner: {
        select: {
          id: true,
          name: true,
          email: true,
          color: true,
          avatar: true,
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Successfully connected with partner',
    data: updatedUser
  });
}));

// Disconnect from partner
router.delete('/disconnect-partner', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { partner: true }
  });

  if (!currentUser || !currentUser.partnerId) {
    throw createError('No partner connection found', 404);
  }

  // Remove the connection
  await prisma.$transaction(async (tx) => {
    // Update current user
    await tx.user.update({
      where: { id: req.user!.id },
      data: { partnerId: null }
    });

    // Update partner
    await tx.user.update({
      where: { id: currentUser.partnerId },
      data: { partnerId: null }
    });
  });

  res.json({
    success: true,
    message: 'Successfully disconnected from partner'
  });
}));

// Get partner info
router.get('/partner', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      partner: {
        select: {
          id: true,
          name: true,
          email: true,
          color: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              tasks: true,
              notes: true,
              checkIns: true,
              bucketListItems: true,
              scheduleItems: true,
              financeEntries: true,
            }
          }
        }
      }
    }
  });

  if (!user || !user.partner) {
    throw createError('No partner found', 404);
  }

  res.json({
    success: true,
    data: user.partner
  });
}));

// Search users (for partner connection)
router.get('/search', [
  body('query').trim().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { query } = req.query;

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: query as string, mode: 'insensitive' } },
            { email: { contains: query as string, mode: 'insensitive' } }
          ]
        },
        { id: { not: req.user.id } }, // Exclude current user
        { partnerId: null }, // Only users without partners
        { isActive: true }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      color: true,
      avatar: true,
    },
    take: 10
  });

  res.json({
    success: true,
    data: users
  });
}));

// Update avatar
router.put('/avatar', [
  body('avatar').isString().withMessage('Avatar must be a string'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatar },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      color: true,
    }
  });

  res.json({
    success: true,
    message: 'Avatar updated successfully',
    data: user
  });
}));

// Deactivate account
router.delete('/account', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Deactivate user instead of deleting
  await prisma.user.update({
    where: { id: req.user.id },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

export default router;
