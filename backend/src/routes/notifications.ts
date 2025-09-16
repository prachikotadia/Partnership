import express from 'express';
import { param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all notifications
router.get('/', [
  query('isRead').optional().isBoolean().withMessage('isRead must be boolean'),
  query('type').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Invalid type'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { isRead, type, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    userId: req.user.id,
  };

  if (isRead !== undefined) where.isRead = isRead === 'true';
  if (type) where.type = type;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.notification.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Mark notification as read
router.put('/:id/read', [
  param('id').isString().withMessage('Invalid notification ID'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    }
  });

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: updatedNotification
  });
}));

// Mark all notifications as read
router.put('/mark-all-read', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    }
  });

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// Delete notification
router.delete('/:id', [
  param('id').isString().withMessage('Invalid notification ID'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  await prisma.notification.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

// Get notification count
router.get('/count', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const [unreadCount, totalCount] = await Promise.all([
    prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      }
    }),
    prisma.notification.count({
      where: {
        userId: req.user.id,
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      unreadCount,
      totalCount
    }
  });
}));

export default router;
