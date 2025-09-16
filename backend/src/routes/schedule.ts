import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { emitToPartner } from '../services/socketService';
import { io } from '../index';

const router = express.Router();
const prisma = new PrismaClient();

// Get all schedule items
router.get('/', [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { startDate, endDate, page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    userId: req.user.id,
  };

  if (startDate || endDate) {
    where.startDate = {};
    if (startDate) where.startDate.gte = new Date(startDate as string);
    if (endDate) where.startDate.lte = new Date(endDate as string);
  }

  const [items, total] = await Promise.all([
    prisma.scheduleItem.findMany({
      where,
      orderBy: { startDate: 'asc' },
      skip,
      take: Number(limit),
    }),
    prisma.scheduleItem.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Create schedule item
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  body('isAllDay').optional().isBoolean().withMessage('isAllDay must be boolean'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  body('recurrence').optional().trim().isLength({ max: 100 }).withMessage('Recurrence must be less than 100 characters'),
  body('reminder').optional().isInt({ min: 0 }).withMessage('Reminder must be a positive integer'),
  body('mood').optional().trim().isLength({ max: 50 }).withMessage('Mood must be less than 50 characters'),
  body('assignedTo').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid assigned to value'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { title, description, startDate, endDate, isAllDay = false, location, isRecurring = false, recurrence, reminder, mood, assignedTo } = req.body;

  const item = await prisma.scheduleItem.create({
    data: {
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isAllDay,
      location,
      isRecurring,
      recurrence,
      reminder,
      mood,
      assignedTo,
      userId: req.user.id,
    }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'schedule:created', {
      item,
      createdBy: req.user.name,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Schedule item created successfully',
    data: item
  });
}));

// Update schedule item
router.put('/:id', [
  param('id').isString().withMessage('Invalid item ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  body('isAllDay').optional().isBoolean().withMessage('isAllDay must be boolean'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  body('recurrence').optional().trim().isLength({ max: 100 }).withMessage('Recurrence must be less than 100 characters'),
  body('reminder').optional().isInt({ min: 0 }).withMessage('Reminder must be a positive integer'),
  body('mood').optional().trim().isLength({ max: 50 }).withMessage('Mood must be less than 50 characters'),
  body('assignedTo').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid assigned to value'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { title, description, startDate, endDate, isAllDay, location, isRecurring, recurrence, reminder, mood, assignedTo } = req.body;

  // Get existing item
  const existingItem = await prisma.scheduleItem.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!existingItem) {
    throw createError('Schedule item not found', 404);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (startDate !== undefined) updateData.startDate = new Date(startDate);
  if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
  if (isAllDay !== undefined) updateData.isAllDay = isAllDay;
  if (location !== undefined) updateData.location = location;
  if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
  if (recurrence !== undefined) updateData.recurrence = recurrence;
  if (reminder !== undefined) updateData.reminder = reminder;
  if (mood !== undefined) updateData.mood = mood;
  if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

  const item = await prisma.scheduleItem.update({
    where: { id },
    data: updateData
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'schedule:updated', {
      item,
      updatedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Schedule item updated successfully',
    data: item
  });
}));

// Delete schedule item
router.delete('/:id', [
  param('id').isString().withMessage('Invalid item ID'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;

  const item = await prisma.scheduleItem.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!item) {
    throw createError('Schedule item not found', 404);
  }

  await prisma.scheduleItem.delete({
    where: { id }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'schedule:deleted', {
      itemId: id,
      deletedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Schedule item deleted successfully'
  });
}));

export default router;
