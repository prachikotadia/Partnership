import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { emitToPartner } from '../services/socketService';
import { io } from '../index';

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateTask = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('assignedTo').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid assigned to value'),
];

// Get all tasks
router.get('/', [
  query('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).withMessage('Invalid status'),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  query('assignedTo').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid assigned to value'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { status, priority, assignedTo, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    userId: req.user.id,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assignedTo) where.assignedTo = assignedTo;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        subtasks: true,
        attachments: true,
        history: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.task.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Get single task
router.get('/:id', [
  param('id').isString().withMessage('Invalid task ID'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      subtasks: true,
      attachments: true,
      history: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!task) {
    throw createError('Task not found', 404);
  }

  res.json({
    success: true,
    data: task
  });
}));

// Create task
router.post('/', validateTask, asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { title, description, priority = 'MEDIUM', dueDate, assignedTo } = req.body;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority as Priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo,
      userId: req.user.id,
    },
    include: {
      subtasks: true,
      attachments: true,
    }
  });

  // Add to history
  await prisma.taskHistory.create({
    data: {
      taskId: task.id,
      action: 'created',
      newValue: title,
    }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'task:created', {
      task,
      createdBy: req.user.name,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
}));

// Update task
router.put('/:id', [
  param('id').isString().withMessage('Invalid task ID'),
  ...validateTask,
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  // Get existing task
  const existingTask = await prisma.task.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!existingTask) {
    throw createError('Task not found', 404);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status as TaskStatus;
  if (priority !== undefined) updateData.priority = priority as Priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

  // Handle completion
  if (status === 'DONE' && existingTask.status !== 'DONE') {
    updateData.completedAt = new Date();
  } else if (status !== 'DONE' && existingTask.status === 'DONE') {
    updateData.completedAt = null;
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      subtasks: true,
      attachments: true,
    }
  });

  // Add to history
  await prisma.taskHistory.create({
    data: {
      taskId: task.id,
      action: 'updated',
      oldValue: JSON.stringify(existingTask),
      newValue: JSON.stringify(task),
    }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'task:updated', {
      task,
      updatedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
}));

// Delete task
router.delete('/:id', [
  param('id').isString().withMessage('Invalid task ID'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!task) {
    throw createError('Task not found', 404);
  }

  await prisma.task.delete({
    where: { id }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'task:deleted', {
      taskId: id,
      deletedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// Create subtask
router.post('/:id/subtasks', [
  param('id').isString().withMessage('Invalid task ID'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
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
  const { title, assignedTo } = req.body;

  // Verify task exists and belongs to user
  const task = await prisma.task.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!task) {
    throw createError('Task not found', 404);
  }

  const subtask = await prisma.subtask.create({
    data: {
      title,
      assignedTo,
      taskId: id,
    }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'subtask:created', {
      subtask,
      taskId: id,
      createdBy: req.user.name,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Subtask created successfully',
    data: subtask
  });
}));

// Update subtask
router.put('/:id/subtasks/:subtaskId', [
  param('id').isString().withMessage('Invalid task ID'),
  param('subtaskId').isString().withMessage('Invalid subtask ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('completed').optional().isBoolean().withMessage('Completed must be boolean'),
  body('assignedTo').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid assigned to value'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id, subtaskId } = req.params;
  const { title, completed, assignedTo } = req.body;

  // Verify task exists and belongs to user
  const task = await prisma.task.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!task) {
    throw createError('Task not found', 404);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (completed !== undefined) {
    updateData.completed = completed;
    updateData.completedAt = completed ? new Date() : null;
  }
  if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

  const subtask = await prisma.subtask.update({
    where: { id: subtaskId },
    data: updateData
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'subtask:updated', {
      subtask,
      taskId: id,
      updatedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Subtask updated successfully',
    data: subtask
  });
}));

// Delete subtask
router.delete('/:id/subtasks/:subtaskId', [
  param('id').isString().withMessage('Invalid task ID'),
  param('subtaskId').isString().withMessage('Invalid subtask ID'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id, subtaskId } = req.params;

  // Verify task exists and belongs to user
  const task = await prisma.task.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!task) {
    throw createError('Task not found', 404);
  }

  await prisma.subtask.delete({
    where: { id: subtaskId }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'subtask:deleted', {
      subtaskId,
      taskId: id,
      deletedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Subtask deleted successfully'
  });
}));

export default router;
