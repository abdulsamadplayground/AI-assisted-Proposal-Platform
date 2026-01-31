"use strict";
/**
 * Schema routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_1 = require("../db");
const ai_service_1 = require("../services/ai.service");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Authentication removed for development
/**
 * GET /api/schemas/debug-auth
 * Debug endpoint to check authentication
 */
router.get('/debug-auth', (req, res) => {
    res.json({
        user: req.user,
        hasUser: !!req.user,
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
    });
});
/**
 * GET /api/schemas
 * List all schemas
 */
router.get('/', async (req, res, next) => {
    try {
        const schemas = await (0, db_1.db)('schemas')
            .where({ is_active: true })
            .select('*')
            .orderBy('created_at', 'desc');
        // Parse JSON fields
        const parsedSchemas = schemas.map(schema => ({
            ...schema,
            sections: JSON.parse(schema.sections),
            global_rules: JSON.parse(schema.global_rules),
        }));
        res.json(parsedSchemas);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/schemas/:id
 * Get schema by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const schema = await (0, db_1.db)('schemas')
            .where({ id: req.params.id })
            .first();
        if (!schema) {
            throw new errorHandler_1.AppError('Schema not found', 404);
        }
        res.json({
            ...schema,
            sections: JSON.parse(schema.sections),
            global_rules: JSON.parse(schema.global_rules),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/schemas
 * Create new schema
 */
router.post('/', async (req, res, next) => {
    try {
        const schemaId = (0, uuid_1.v4)();
        // Use a default user ID for development (admin user)
        const defaultUserId = '1'; // This should be the admin user's ID from seeds
        const schemaData = {
            id: schemaId,
            name: req.body.name,
            version: req.body.version || '1.0.0',
            description: req.body.description || '',
            sections: JSON.stringify(req.body.sections),
            global_rules: JSON.stringify(req.body.global_rules || []),
            created_by: defaultUserId,
        };
        await (0, db_1.db)('schemas').insert(schemaData);
        const schema = await (0, db_1.db)('schemas').where({ id: schemaId }).first();
        // Upload to AI service
        try {
            await ai_service_1.aiService.uploadSchema({
                id: schema.id,
                name: schema.name,
                version: schema.version,
                description: schema.description,
                sections: JSON.parse(schema.sections),
                global_rules: JSON.parse(schema.global_rules),
            });
        }
        catch (aiError) {
            console.error('Failed to upload schema to AI service:', aiError);
            // Continue even if AI service upload fails
        }
        res.status(201).json({
            ...schema,
            sections: JSON.parse(schema.sections),
            global_rules: JSON.parse(schema.global_rules),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/schemas/:id
 * Delete schema
 */
router.delete('/:id', async (req, res, next) => {
    try {
        await (0, db_1.db)('schemas')
            .where({ id: req.params.id })
            .update({ is_active: false });
        res.json({ message: 'Schema deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=schema.routes.js.map