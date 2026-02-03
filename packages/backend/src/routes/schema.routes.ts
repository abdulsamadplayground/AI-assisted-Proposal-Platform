/**
 * Schema routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { db } from '../db';
import { aiService } from '../services/ai.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Authentication removed for development

/**
 * GET /api/schemas/debug-auth
 * Debug endpoint to check authentication
 */
router.get('/debug-auth', (req: Request, res: Response) => {
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
router.get('/sync-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get schemas from database
    const dbSchemas = await db('schemas')
      .where({ is_active: true })
      .select('id', 'name', 'version');
    
    // Get schemas from AI service
    const aiSchemas = await aiService.getSchemas();
    const aiSchemaIds = new Set(aiSchemas.schemas.map((s: any) => s.id));
    
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
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/schemas/sync-all
 * Manually sync all database schemas to AI service
 * Useful for fixing schemas that were created before auto-sync was implemented
 */
router.post('/sync-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all active schemas from database
    const schemas = await db('schemas')
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
        
        await aiService.uploadSchema(aiSchemaData);
        
        results.push({
          id: schema.id,
          name: schema.name,
          status: 'success',
        });
      } catch (error: any) {
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
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/schemas
 * List all schemas
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schemas = await db('schemas')
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
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/schemas/:id
 * Get schema by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = await db('schemas')
      .where({ id: req.params.id })
      .first();
    
    if (!schema) {
      throw new AppError('Schema not found', 404);
    }

    res.json({
      ...schema,
      sections: JSON.parse(schema.sections),
      global_rules: JSON.parse(schema.global_rules),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/schemas
 * Create new schema
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schemaId = uuidv4();
    
    // Use a default user ID for development (admin user)
    const defaultUserId = '00000000-0000-0000-0000-000000000001'; // Admin user from seeds
    
    // Ensure sections have IDs (required by AI service)
    const sections = req.body.sections.map((section: any) => ({
      ...section,
      id: section.id || `section-${uuidv4()}`,
      rules: (section.rules || []).map((rule: any) => ({
        ...rule,
        id: rule.id || `rule-${uuidv4()}`,
      })),
    }));
    
    // Ensure global rules have IDs
    const globalRules = (req.body.global_rules || []).map((rule: any) => ({
      ...rule,
      id: rule.id || `rule-${uuidv4()}`,
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

    await db('schemas').insert(schemaData);
    
    const schema = await db('schemas').where({ id: schemaId }).first();

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
      
      await aiService.uploadSchema(aiSchemaData);
      console.log(`✓ Schema ${schema.name} synced to AI service`);
    } catch (aiError: any) {
      console.error('Failed to upload schema to AI service:', aiError.message);
      // Rollback database insert if AI service upload fails
      await db('schemas').where({ id: schemaId }).delete();
      throw new AppError(
        `Schema created in database but failed to sync with AI service: ${aiError.message}. Please try again.`,
        500
      );
    }

    res.status(201).json({
      ...schema,
      sections: JSON.parse(schema.sections),
      global_rules: JSON.parse(schema.global_rules),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/schemas/:id
 * Update schema (creates new version)
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schemaId = req.params.id;
    const defaultUserId = '00000000-0000-0000-0000-000000000001';
    
    // Get current schema
    const currentSchema = await db('schemas').where({ id: schemaId }).first();
    if (!currentSchema) {
      throw new AppError('Schema not found', 404);
    }
    
    // Get latest version number
    const latestVersion = await db('schema_versions')
      .where({ schema_id: schemaId })
      .orderBy('version_number', 'desc')
      .first();
    
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    
    // Save current state as a version before updating
    await db('schema_versions').insert({
      id: uuidv4(),
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
    const sections = req.body.sections.map((section: any) => ({
      ...section,
      id: section.id || `section-${uuidv4()}`,
      rules: (section.rules || []).map((rule: any) => ({
        ...rule,
        id: rule.id || `rule-${uuidv4()}`,
      })),
    }));
    
    // Ensure global rules have IDs
    const globalRules = (req.body.global_rules || []).map((rule: any) => ({
      ...rule,
      id: rule.id || `rule-${uuidv4()}`,
    }));
    
    // Update the schema
    await db('schemas')
      .where({ id: schemaId })
      .update({
        name: req.body.name,
        version: req.body.version || currentSchema.version,
        description: req.body.description || '',
        sections: JSON.stringify(sections),
        global_rules: JSON.stringify(globalRules),
        updated_at: new Date().toISOString(),
      });
    
    const updatedSchema = await db('schemas').where({ id: schemaId }).first();
    
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
      
      await aiService.uploadSchema(aiSchemaData);
      console.log(`✓ Schema ${updatedSchema.name} synced to AI service`);
    } catch (aiError: any) {
      console.error('Failed to upload schema to AI service:', aiError.message);
      throw new AppError(
        `Schema updated in database but failed to sync with AI service: ${aiError.message}. The schema may not work for proposals until synced.`,
        500
      );
    }
    
    res.json({
      ...updatedSchema,
      sections: JSON.parse(updatedSchema.sections),
      global_rules: JSON.parse(updatedSchema.global_rules),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/schemas/:id/versions
 * Get version history for a schema
 */
router.get('/:id/versions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const versions = await db('schema_versions')
      .where({ schema_id: req.params.id })
      .orderBy('version_number', 'desc')
      .select('*');
    
    const parsedVersions = versions.map(version => ({
      ...version,
      sections: JSON.parse(version.sections),
      global_rules: JSON.parse(version.global_rules),
    }));
    
    res.json(parsedVersions);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/schemas/:id
 * Delete schema
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db('schemas')
      .where({ id: req.params.id })
      .update({ is_active: false });
    
    res.json({ message: 'Schema deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
