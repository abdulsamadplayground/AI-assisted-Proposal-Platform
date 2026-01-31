"use strict";
/**
 * Authentication routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.register(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.login(req.body);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const user = await auth_service_1.authService.getUserById(req.user.id);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map