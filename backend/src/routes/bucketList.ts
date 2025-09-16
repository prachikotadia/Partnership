import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient, Priority, BucketStatus } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { emitToPartner } from '../services/socketService';
import { io } from '../index';

const router = express.Router();
const prisma = new PrismaClient();

// Get all bucket list items
router.get('/', [
  query('status').optional().isIn(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  query('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Invalid category'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { status, priority, category, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    userId: req.user.id,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = category;

  const [items, total] = await Promise.all([
    prisma.bucketListItem.findMany({
      where,
      include: {
        subtasks: true,
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.bucketListItem.count({ where })
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

// Create bucket list item
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category is required and must be less than 50 characters'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('timeEstimate').optional().trim().isLength({ max: 100 }).withMessage('Time estimate must be less than 100 characters'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('assignedTo').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid assigned to value'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { title, description, category, priority = 'MEDIUM', cost, timeEstimate, difficulty = 'medium', assignedTo } = req.body;

  const item = await prisma.bucketListItem.create({
    data: {
      title,
      description,
      category,
      priority: priority as Priority,
      cost,
      timeEstimate,
      difficulty,
      assignedTo,
      userId: req.user.id,
    },
    include: {
      subtasks: true,
      attachments: true,
    }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'bucket:created', {
      item,
      createdBy: req.user.name,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Bucket list item created successfully',
    data: item
  });
}));

// Update bucket list item
router.put('/:id', [
  param('id').isString().withMessage('Invalid item ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be less than 50 characters'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('status').optional().isIn(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('timeEstimate').optional().trim().isLength({ max: 100 }).withMessage('Time estimate must be less than 100 characters'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
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
  const { title, description, category, priority, status, cost, timeEstimate, difficulty, progress, assignedTo } = req.body;

  // Get existing item
  const existingItem = await prisma.bucketListItem.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!existingItem) {
    throw createError('Bucket list item not found', 404);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (priority !== undefined) updateData.priority = priority as Priority;
  if (status !== undefined) updateData.status = status as BucketStatus;
  if (cost !== undefined) updateData.cost = cost;
  if (timeEstimate !== undefined) updateData.timeEstimate = timeEstimate;
  if (difficulty !== undefined) updateData.difficulty = difficulty;
  if (progress !== undefined) updateData.progress = progress;
  if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

  // Handle completion
  if (status === 'COMPLETED' && existingItem.status !== 'COMPLETED') {
    updateData.completedAt = new Date();
    updateData.progress = 100;
  } else if (status !== 'COMPLETED' && existingItem.status === 'COMPLETED') {
    updateData.completedAt = null;
  }

  const item = await prisma.bucketListItem.update({
    where: { id },
    data: updateData,
    include: {
      subtasks: true,
      attachments: true,
    }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'bucket:updated', {
      item,
      updatedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Bucket list item updated successfully',
    data: item
  });
}));

// Delete bucket list item
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

  const item = await prisma.bucketListItem.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!item) {
    throw createError('Bucket list item not found', 404);
  }

  await prisma.bucketListItem.delete({
    where: { id }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'bucket:deleted', {
      itemId: id,
      deletedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Bucket list item deleted successfully'
  });
}));

export default router;
