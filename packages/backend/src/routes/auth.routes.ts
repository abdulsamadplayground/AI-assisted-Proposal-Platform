/**
 * Authentication routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
