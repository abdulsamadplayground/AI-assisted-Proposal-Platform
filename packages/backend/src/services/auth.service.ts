/**
 * Authentication Service
 * Handles user authentication and authorization
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest) {
    // Check if user already exists
    const existingUser = await db('users').where({ email: data.email }).first();
    
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 10);

    // Create user
    const [user] = await db('users')
      .insert({
        email: data.email,
        password_hash,
        name: data.name,
        role: data.role || 'user',
      })
      .returning(['id', 'email', 'name', 'role', 'created_at']);

    logger.info('User registered', { user_id: user.id, email: user.email });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginRequest) {
    // Find user
    const user = await db('users')
      .where({ email: data.email, is_active: true })
      .first();

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
    
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    logger.info('User logged in', { user_id: user.id, email: user.email });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: any): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await db('users')
      .where({ id: userId, is_active: true })
      .select('id', 'email', 'name', 'role', 'assigned_schema_id', 'created_at')
      .first();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

export const authService = new AuthService();
