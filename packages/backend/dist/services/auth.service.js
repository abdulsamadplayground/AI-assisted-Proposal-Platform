"use strict";
/**
 * Authentication Service
 * Handles user authentication and authorization
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
class AuthService {
    /**
     * Register a new user
     */
    async register(data) {
        // Check if user already exists
        const existingUser = await (0, db_1.db)('users').where({ email: data.email }).first();
        if (existingUser) {
            throw new errorHandler_1.AppError('User with this email already exists', 400);
        }
        // Hash password
        const password_hash = await bcrypt_1.default.hash(data.password, 10);
        // Create user
        const [user] = await (0, db_1.db)('users')
            .insert({
            email: data.email,
            password_hash,
            name: data.name,
            role: data.role || 'user',
        })
            .returning(['id', 'email', 'name', 'role', 'created_at']);
        logger_1.logger.info('User registered', { user_id: user.id, email: user.email });
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
    async login(data) {
        // Find user
        const user = await (0, db_1.db)('users')
            .where({ email: data.email, is_active: true })
            .first();
        if (!user) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        // Verify password
        const isValidPassword = await bcrypt_1.default.compare(data.password, user.password_hash);
        if (!isValidPassword) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        logger_1.logger.info('User logged in', { user_id: user.id, email: user.email });
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
    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    }
    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            throw new errorHandler_1.AppError('Invalid or expired token', 401);
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const user = await (0, db_1.db)('users')
            .where({ id: userId, is_active: true })
            .select('id', 'email', 'name', 'role', 'assigned_schema_id', 'created_at')
            .first();
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        return user;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map