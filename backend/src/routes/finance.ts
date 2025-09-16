import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient, FinanceType } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { emitToPartner } from '../services/socketService';
import { io } from '../index';

const router = express.Router();
const prisma = new PrismaClient();

// Get all finance entries
router.get('/', [
  query('type').optional().isIn(['INCOME', 'EXPENSE', 'SAVINGS', 'INVESTMENT']).withMessage('Invalid type'),
  query('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Invalid category'),
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

  const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    userId: req.user.id,
  };

  if (type) where.type = type;
  if (category) where.category = category;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  const [entries, total] = await Promise.all([
    prisma.financeEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.financeEntry.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      entries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Get finance summary
router.get('/summary', [
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

  const { startDate, endDate } = req.query;

  const where: any = {
    userId: req.user.id,
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  const [totalIncome, totalExpenses, totalSavings, totalInvestment] = await Promise.all([
    prisma.financeEntry.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true }
    }),
    prisma.financeEntry.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true }
    }),
    prisma.financeEntry.aggregate({
      where: { ...where, type: 'SAVINGS' },
      _sum: { amount: true }
    }),
    prisma.financeEntry.aggregate({
      where: { ...where, type: 'INVESTMENT' },
      _sum: { amount: true }
    })
  ]);

  const summary = {
    totalIncome: totalIncome._sum.amount || 0,
    totalExpenses: totalExpenses._sum.amount || 0,
    totalSavings: totalSavings._sum.amount || 0,
    totalInvestment: totalInvestment._sum.amount || 0,
    netIncome: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
  };

  res.json({
    success: true,
    data: summary
  });
}));

// Create finance entry
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category is required and must be less than 50 characters'),
  body('type').isIn(['INCOME', 'EXPENSE', 'SAVINGS', 'INVESTMENT']).withMessage('Invalid type'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  body('recurrence').optional().trim().isLength({ max: 100 }).withMessage('Recurrence must be less than 100 characters'),
  body('assignedTo').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid assigned to value'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { title, description, amount, currency = 'USD', category, type, date, isRecurring = false, recurrence, assignedTo } = req.body;

  const entry = await prisma.financeEntry.create({
    data: {
      title,
      description,
      amount,
      currency,
      category,
      type: type as FinanceType,
      date: new Date(date),
      isRecurring,
      recurrence,
      assignedTo,
      userId: req.user.id,
    }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'finance:created', {
      entry,
      createdBy: req.user.name,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Finance entry created successfully',
    data: entry
  });
}));

// Update finance entry
router.put('/:id', [
  param('id').isString().withMessage('Invalid entry ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be less than 50 characters'),
  body('type').optional().isIn(['INCOME', 'EXPENSE', 'SAVINGS', 'INVESTMENT']).withMessage('Invalid type'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  body('recurrence').optional().trim().isLength({ max: 100 }).withMessage('Recurrence must be less than 100 characters'),
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
  const { title, description, amount, currency, category, type, date, isRecurring, recurrence, assignedTo } = req.body;

  // Get existing entry
  const existingEntry = await prisma.financeEntry.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!existingEntry) {
    throw createError('Finance entry not found', 404);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (amount !== undefined) updateData.amount = amount;
  if (currency !== undefined) updateData.currency = currency;
  if (category !== undefined) updateData.category = category;
  if (type !== undefined) updateData.type = type as FinanceType;
  if (date !== undefined) updateData.date = new Date(date);
  if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
  if (recurrence !== undefined) updateData.recurrence = recurrence;
  if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

  const entry = await prisma.financeEntry.update({
    where: { id },
    data: updateData
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'finance:updated', {
      entry,
      updatedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Finance entry updated successfully',
    data: entry
  });
}));

// Delete finance entry
router.delete('/:id', [
  param('id').isString().withMessage('Invalid entry ID'),
], asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;

  const entry = await prisma.financeEntry.findFirst({
    where: {
      id,
      userId: req.user.id,
    }
  });

  if (!entry) {
    throw createError('Finance entry not found', 404);
  }

  await prisma.financeEntry.delete({
    where: { id }
  });

  // Emit to partner if exists
  if (req.user.partnerId) {
    emitToPartner(io, req.user.partnerId, 'finance:deleted', {
      entryId: id,
      deletedBy: req.user.name,
    });
  }

  res.json({
    success: true,
    message: 'Finance entry deleted successfully'
  });
}));

export default router;
