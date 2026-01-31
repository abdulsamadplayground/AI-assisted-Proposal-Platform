"use strict";
/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user to request
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAdmin = exports.authenticate = void 0;
const auth_service_1 = require("../services/auth.service");
const errorHandler_1 = require("./errorHandler");
/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('No token provided', 401);
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = auth_service_1.authService.verifyToken(token);
        // Attach user to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new errorHandler_1.AppError('Authentication required', 401));
    }
    if (req.user.role !== 'admin') {
        return next(new errorHandler_1.AppError('Admin access required', 403));
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Optional authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = auth_service_1.authService.verifyToken(token);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            };
        }
        next();
    }
    catch (error) {
        // Continue without authentication
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map