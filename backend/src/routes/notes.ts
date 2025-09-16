import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { emitToPartner } from '../services/socketService';
import { io } from '../index';

const router = express.Router();
const prisma = new PrismaClient();

// Get all notes
router.get('/', [
  query('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Invalid category'),
  query('isPinned').optional().isBoolean().withMessage('isPinned must be boolean'),
  query('isShared').optional().isBoolean().withMessage('isShared must be boolean'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { category, isPinned, isShared, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    userId: req.user.id,
  };

  if (category) where.category = category;
  if (isPinned !== undefined) where.isPinned = isPinned === 'true';
  if (isShared !== undefined) where.isShared = isShared === 'true';

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      include: {
        attachments: true,
        history: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ],
      skip,
      take: Number(limit),
    }),
    prisma.note.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      notes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Get single note
router.get('/:id', [
  param('id').isString().withMessage('Invalid note ID'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;

  const note = await prisma.note.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      attachments: true,
      history: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!note) {
    throw createError('Note not found', 404);
  }

  res.json({
    success: true,
    data: note
  });
}));

// Create note
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be less than 50 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPinned').optional().isBoolean().withMessage('isPinned must be boolean'),
  body('isShared').optional().isBoolean().withMessage('isShared must be boolean'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { title, content, category, tags = [], isPinned = false, isShared = true } = req.body;

  const note = await prisma.note.create({
    data: {
      title,
      content,
      category,
      tags,
      isPinned,
      isShared,
      userId: req.user.id,
    },
    include: {
      attachments: true,
    }
  });

  // Add to history
  await prisma.noteHistory.create({
    data: {
      noteId: note.id,
      action: 'created',
      newValue: title,
    }
  });

  // Emit to partner if exists and note is shared
  if (req.user.partnerId && isShared) {
    emitToPartner(io, req.user.partnerId, 'note:created', {
      note,
      createdBy: req.user.name,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note
  });
}));

// Update note
router.put('/:id', [
  param('id').isString().withMessage('Invalid note ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be less than 50 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPinned').optional().isBoolean().withMessage('isPinned must be boolean'),
  body('isShared').optional().isBoolean().withMessage('isShared must be boolean'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { title, content, category, tags, isPinned, isShared } = req.body;

  // Get existing note
  const existingNote = await prisma.note.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!existingNote) {
    throw createError('Note not found', 404);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (tags !== undefined) updateData.tags = tags;
  if (isPinned !== undefined) updateData.isPinned = isPinned;
  if (isShared !== undefined) updateData.isShared = isShared;

  const note = await prisma.note.update({
    where: { id },
    data: updateData,
    include: {
      attachments: true,
    }
  });

  // Add to history
  await prisma.noteHistory.create({
    data: {
      noteId: note.id,
      action: 'updated',
      oldValue: JSON.stringify(existingNote),
      newValue: JSON.stringify(note),
    }
  });

  // Emit to partner if exists and note is shared
  if (req.user.partnerId && note.isShared) {
    emitToPartner(io, req.user.partnerId, 'note:updated', {
      note,
      updatedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Note updated successfully',
    data: note
  });
}));

// Delete note
router.delete('/:id', [
  param('id').isString().withMessage('Invalid note ID'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;

  const note = await prisma.note.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!note) {
    throw createError('Note not found', 404);
  }

  await prisma.note.delete({
    where: { id }
  });

  // Emit to partner if exists and note was shared
  if (req.user.partnerId && note.isShared) {
    emitToPartner(io, req.user.partnerId, 'note:deleted', {
      noteId: id,
      deletedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Note deleted successfully'
  });
}));

export default router;
