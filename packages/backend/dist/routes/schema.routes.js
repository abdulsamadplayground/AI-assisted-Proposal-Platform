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
        const defaultUserId = '00000000-0000-0000-0000-000000000001'; // Admin user from seeds
        // Ensure sections have IDs (required by AI service)
        const sections = req.body.sections.map((section) => ({
            ...section,
            id: section.id || `section-${(0, uuid_1.v4)()}`,
            rules: (section.rules || []).map((rule) => ({
                ...rule,
                id: rule.id || `rule-${(0, uuid_1.v4)()}`,
            })),
        }));
        // Ensure global rules have IDs
        const globalRules = (req.body.global_rules || []).map((rule) => ({
            ...rule,
            id: rule.id || `rule-${(0, uuid_1.v4)()}`,
        }));
        const schemaData = {
            id: schemaId,
            name: req.body.name,
            version: req.body.version || '1.0.0',
            description: req.body.description || '',
            sections: JSON.stringify(sections),
            global_rules: JSON.stringify(globalRules),
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
                created_by: schema.created_by,
                created_at: schema.created_at,
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
 * PUT /api/schemas/:id
 * Update schema (creates new version)
 */
router.put('/:id', async (req, res, next) => {
    try {
        const schemaId = req.params.id;
        const defaultUserId = '00000000-0000-0000-0000-000000000001';
        // Get current schema
        const currentSchema = await (0, db_1.db)('schemas').where({ id: schemaId }).first();
        if (!currentSchema) {
            throw new errorHandler_1.AppError('Schema not found', 404);
        }
        // Get latest version number
        const latestVersion = await (0, db_1.db)('schema_versions')
            .where({ schema_id: schemaId })
            .orderBy('version_number', 'desc')
            .first();
        const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
        // Save current state as a version before updating
        await (0, db_1.db)('schema_versions').insert({
            id: (0, uuid_1.v4)(),
            schema_id: schemaId,
            version_number: newVersionNumber,
            name: currentSchema.name,
            version: currentSchema.version,
            description: currentSchema.description,
            sections: currentSchema.sections,
            global_rules: currentSchema.global_rules,
            change_summary: req.body.change_summary || 'Schema updated',
            created_by: defaultUserId,
        });
        // Ensure sections have IDs (required by AI service)
        const sections = req.body.sections.map((section) => ({
            ...section,
            id: section.id || `section-${(0, uuid_1.v4)()}`,
            rules: (section.rules || []).map((rule) => ({
                ...rule,
                id: rule.id || `rule-${(0, uuid_1.v4)()}`,
            })),
        }));
        // Ensure global rules have IDs
        const globalRules = (req.body.global_rules || []).map((rule) => ({
            ...rule,
            id: rule.id || `rule-${(0, uuid_1.v4)()}`,
        }));
        // Update the schema
        await (0, db_1.db)('schemas')
            .where({ id: schemaId })
            .update({
            name: req.body.name,
            version: req.body.version || currentSchema.version,
            description: req.body.description || '',
            sections: JSON.stringify(sections),
            global_rules: JSON.stringify(globalRules),
            updated_at: new Date().toISOString(),
        });
        const updatedSchema = await (0, db_1.db)('schemas').where({ id: schemaId }).first();
        // Upload to AI service
        try {
            await ai_service_1.aiService.uploadSchema({
                id: updatedSchema.id,
                name: updatedSchema.name,
                version: updatedSchema.version,
                description: updatedSchema.description,
                created_by: updatedSchema.created_by,
                created_at: updatedSchema.created_at,
                sections: JSON.parse(updatedSchema.sections),
                global_rules: JSON.parse(updatedSchema.global_rules),
            });
        }
        catch (aiError) {
            console.error('Failed to upload schema to AI service:', aiError);
        }
        res.json({
            ...updatedSchema,
            sections: JSON.parse(updatedSchema.sections),
            global_rules: JSON.parse(updatedSchema.global_rules),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/schemas/:id/versions
 * Get version history for a schema
 */
router.get('/:id/versions', async (req, res, next) => {
    try {
        const versions = await (0, db_1.db)('schema_versions')
            .where({ schema_id: req.params.id })
            .orderBy('version_number', 'desc')
            .select('*');
        const parsedVersions = versions.map(version => ({
            ...version,
            sections: JSON.parse(version.sections),
            global_rules: JSON.parse(version.global_rules),
        }));
        res.json(parsedVersions);
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