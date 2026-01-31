"use strict";
/**
 * User routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Authentication removed for development
/**
 * GET /api/users
 * List all users
 */
router.get('/', async (req, res, next) => {
    try {
        const users = await (0, db_1.db)('users')
            .where({ is_active: true })
            .select('id', 'email', 'name', 'role', 'assigned_schema_id', 'created_at')
            .orderBy('created_at', 'desc');
        res.json(users);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const user = await (0, db_1.db)('users')
            .where({ id: req.params.id, is_active: true })
            .select('id', 'email', 'name', 'role', 'assigned_schema_id', 'created_at')
            .first();
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/users/:id/assign-schema
 * Assign schema to user
 */
router.put('/:id/assign-schema', async (req, res, next) => {
    try {
        await (0, db_1.db)('users')
            .where({ id: req.params.id })
            .update({ assigned_schema_id: req.body.schema_id });
        res.json({ message: 'Schema assigned successfully' });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/users/:id/stats
 * Get user statistics
 */
router.get('/:id/stats', async (req, res, next) => {
    try {
        const stats = await (0, db_1.db)('proposals')
            .where({ user_id: req.params.id })
            .select(db_1.db.raw('COUNT(*) as total'), db_1.db.raw("COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts"), db_1.db.raw("COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending"), db_1.db.raw("COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved"), db_1.db.raw("COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected"))
            .first();
        res.json(stats);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map