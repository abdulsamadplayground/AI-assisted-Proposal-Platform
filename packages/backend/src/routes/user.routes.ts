/**
 * User routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { db } from '../db';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Authentication removed for development

/**
 * GET /api/users
 * List all users
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await db('users')
      .where({ is_active: true })
      .select('id', 'email', 'name', 'role', 'assigned_schema_id', 'created_at')
      .orderBy('created_at', 'desc');
    
    res.json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await db('users')
      .where({ id: req.params.id, is_active: true })
      .select('id', 'email', 'name', 'role', 'assigned_schema_id', 'created_at')
      .first();
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:id/assign-schema
 * Assign schema to user
 */
router.put('/:id/assign-schema', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db('users')
      .where({ id: req.params.id })
      .update({ assigned_schema_id: req.body.schema_id });
    
    res.json({ message: 'Schema assigned successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id/stats
 * Get user statistics
 */
router.get('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await db('proposals')
      .where({ user_id: req.params.id })
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts"),
        db.raw("COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending"),
        db.raw("COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved"),
        db.raw("COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected")
      )
      .first();
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
