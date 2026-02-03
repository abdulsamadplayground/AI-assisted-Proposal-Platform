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
 * GET /api/schemas/sync-status
 * Check if database schemas are synced with AI service
 */
router.get('/sync-status', async (req, res, next) => {
    try {
        // Get schemas from database
        const dbSchemas = await (0, db_1.db)('schemas')
            .where({ is_active: true })
            .select('id', 'name', 'version');
        // Get schemas from AI service
        const aiSchemas = await ai_service_1.aiService.getSchemas();
        const aiSchemaIds = new Set(aiSchemas.schemas.map((s) => s.id));
        // Check sync status
        const syncStatus = dbSchemas.map(schema => ({
            id: schema.id,
            name: schema.name,
            version: schema.version,
            synced: aiSchemaIds.has(schema.id),
        }));
        const allSynced = syncStatus.every(s => s.synced);
        const unsyncedCount = syncStatus.filter(s => !s.synced).length;
        res.json({
            allSynced,
            totalSchemas: dbSchemas.length,
            syncedSchemas: dbSchemas.length - unsyncedCount,
            unsyncedSchemas: unsyncedCount,
            schemas: syncStatus,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/schemas/sync-all
 * Manually sync all database schemas to AI service
 * Useful for fixing schemas that were created before auto-sync was implemented
 */
router.post('/sync-all', async (req, res, next) => {
    try {
        // Get all active schemas from database
        const schemas = await (0, db_1.db)('schemas')
            .where({ is_active: true })
            .select('*');
        const results = [];
        for (const schema of schemas) {
            try {
                const aiSchemaData = {
                    id: schema.id,
                    name: schema.name,
                    version: schema.version,
                    description: schema.description,
                    created_by: schema.created_by,
                    created_at: schema.created_at,
                    sections: JSON.parse(schema.sections),
                    global_rules: JSON.parse(schema.global_rules),
                    metadata: {}
                };
                await ai_service_1.aiService.uploadSchema(aiSchemaData);
                results.push({
                    id: schema.id,
                    name: schema.name,
                    status: 'success',
                });
            }
            catch (error) {
                results.push({
                    id: schema.id,
                    name: schema.name,
                    status: 'failed',
                    error: error.message,
                });
            }
        }
        const successCount = results.filter(r => r.status === 'success').length;
        const failedCount = results.filter(r => r.status === 'failed').length;
        res.json({
            message: `Synced ${successCount} schemas, ${failedCount} failed`,
            totalSchemas: schemas.length,
            successCount,
            failedCount,
            results,
        });
    }
    catch (error) {
        next(error);
    }
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
        // Upload to AI service (CRITICAL: Must succeed for proposals to work)
        try {
            const aiSchemaData = {
                id: schema.id,
                name: schema.name,
                version: schema.version,
                description: schema.description,
                created_by: schema.created_by,
                created_at: schema.created_at,
                sections: JSON.parse(schema.sections),
                global_rules: JSON.parse(schema.global_rules),
                metadata: {}
            };
            await ai_service_1.aiService.uploadSchema(aiSchemaData);
            console.log(`✓ Schema ${schema.name} synced to AI service`);
        }
        catch (aiError) {
            console.error('Failed to upload schema to AI service:', aiError.message);
            // Rollback database insert if AI service upload fails
            await (0, db_1.db)('schemas').where({ id: schemaId }).delete();
            throw new errorHandler_1.AppError(`Schema created in database but failed to sync with AI service: ${aiError.message}. Please try again.`, 500);
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
        // Upload to AI service (CRITICAL: Must succeed for proposals to work)
        try {
            const aiSchemaData = {
                id: updatedSchema.id,
                name: updatedSchema.name,
                version: updatedSchema.version,
                description: updatedSchema.description,
                created_by: updatedSchema.created_by,
                created_at: updatedSchema.created_at,
                sections: JSON.parse(updatedSchema.sections),
                global_rules: JSON.parse(updatedSchema.global_rules),
                metadata: {}
            };
            await ai_service_1.aiService.uploadSchema(aiSchemaData);
            console.log(`✓ Schema ${updatedSchema.name} synced to AI service`);
        }
        catch (aiError) {
            console.error('Failed to upload schema to AI service:', aiError.message);
            throw new errorHandler_1.AppError(`Schema updated in database but failed to sync with AI service: ${aiError.message}. The schema may not work for proposals until synced.`, 500);
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