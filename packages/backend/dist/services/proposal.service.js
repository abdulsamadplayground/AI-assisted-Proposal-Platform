"use strict";
/**
 * Proposal Service
 * Handles all proposal-related business logic and database operations
 * Coordinates with AI service for content generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalService = exports.ProposalService = void 0;
const db_1 = require("../db");
const ai_service_1 = require("./ai.service");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
class ProposalService {
    /**
     * Create a new proposal and generate content using AI service
     * 1. Validate inputs
     * 2. Send to AI service for generation (AI CANNOT write to DB)
     * 3. Save generated proposal to PostgreSQL database
     */
    async createProposal(data) {
        const trx = await db_1.db.transaction();
        try {
            // Validate schema exists
            const schema = await trx('schemas')
                .where({ id: data.schema_id, is_active: true })
                .first();
            if (!schema) {
                throw new errorHandler_1.AppError('Schema not found or inactive', 404);
            }
            // Validate user exists
            const user = await trx('users').where({ id: data.user_id }).first();
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            // Create proposal record (initial state)
            const proposalId = require('uuid').v4();
            const [proposal] = await trx('proposals')
                .insert({
                id: proposalId,
                title: data.title,
                schema_id: data.schema_id,
                user_id: data.user_id,
                survey_notes: data.survey_notes,
                sections: JSON.stringify([]), // Empty initially
                attachments: JSON.stringify(data.attachments || []),
                status: 'draft',
                current_version: 1,
            })
                .returning('*');
            logger_1.logger.info('Proposal created in database', { proposal_id: proposal.id });
            // Generate content using AI service
            const aiRequest = {
                proposal_id: proposal.id,
                schema_id: data.schema_id,
                survey_notes: data.survey_notes,
                attachments: data.attachments,
                additional_guidance: data.additional_guidance,
            };
            const aiResponse = await ai_service_1.aiService.generateDraft(aiRequest);
            // Update proposal with generated sections
            await trx('proposals')
                .where({ id: proposal.id })
                .update({
                sections: JSON.stringify(aiResponse.sections),
                updated_at: trx.fn.now(),
            });
            // Create initial version record
            const versionId = require('uuid').v4();
            await trx('proposal_versions').insert({
                id: versionId,
                proposal_id: proposal.id,
                version_number: 1,
                sections: JSON.stringify(aiResponse.sections),
                change_description: 'Initial draft created',
                created_by: data.user_id,
            });
            await trx.commit();
            logger_1.logger.info('Proposal created successfully', {
                proposal_id: proposal.id,
                sections_count: aiResponse.sections.length,
                rules_passed: aiResponse.all_rules_passed,
            });
            // Fetch complete proposal with relations
            return this.getProposalById(proposal.id, data.user_id);
        }
        catch (error) {
            await trx.rollback();
            logger_1.logger.error('Failed to create proposal', { error });
            throw error;
        }
    }
    /**
     * Get proposal by ID
     */
    async getProposalById(proposalId, userId) {
        const proposal = await (0, db_1.db)('proposals')
            .where({ 'proposals.id': proposalId })
            .leftJoin('users as creator', 'proposals.user_id', 'creator.id')
            .leftJoin('users as reviewer', 'proposals.reviewed_by', 'reviewer.id')
            .leftJoin('schemas', 'proposals.schema_id', 'schemas.id')
            .select('proposals.*', 'creator.name as creator_name', 'creator.email as creator_email', 'reviewer.name as reviewer_name', 'schemas.name as schema_name')
            .first();
        if (!proposal) {
            throw new errorHandler_1.AppError('Proposal not found', 404);
        }
        // Check access permissions
        const user = await (0, db_1.db)('users').where({ id: userId }).first();
        if (user.role !== 'admin' && proposal.user_id !== userId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        // Get version history
        const versions = await (0, db_1.db)('proposal_versions')
            .where({ proposal_id: proposalId })
            .leftJoin('users', 'proposal_versions.created_by', 'users.id')
            .select('proposal_versions.*', 'users.name as created_by_name')
            .orderBy('version_number', 'desc');
        return {
            ...proposal,
            sections: JSON.parse(proposal.sections),
            attachments: JSON.parse(proposal.attachments),
            versions,
        };
    }
    /**
     * List proposals for a user
     */
    async listProposals(userId, filters) {
        const user = await (0, db_1.db)('users').where({ id: userId }).first();
        let query = (0, db_1.db)('proposals')
            .leftJoin('schemas', 'proposals.schema_id', 'schemas.id')
            .select('proposals.id', 'proposals.title', 'proposals.status', 'proposals.current_version', 'proposals.created_at', 'proposals.updated_at', 'schemas.name as schema_name');
        // Filter by user role
        if (user.role !== 'admin') {
            query = query.where({ 'proposals.user_id': userId });
        }
        // Apply filters
        if (filters?.status) {
            query = query.where({ 'proposals.status': filters.status });
        }
        if (filters?.search) {
            query = query.where('proposals.title', 'ilike', `%${filters.search}%`);
        }
        const proposals = await query.orderBy('proposals.updated_at', 'desc');
        return proposals.map(p => ({
            ...p,
            sections: undefined, // Don't include full sections in list view
        }));
    }
    /**
     * Update proposal and create new version
     */
    async updateProposal(proposalId, userId, data) {
        const trx = await db_1.db.transaction();
        try {
            const proposal = await trx('proposals').where({ id: proposalId }).first();
            if (!proposal) {
                throw new errorHandler_1.AppError('Proposal not found', 404);
            }
            // Check permissions
            const user = await trx('users').where({ id: userId }).first();
            if (user.role !== 'admin' && proposal.user_id !== userId) {
                throw new errorHandler_1.AppError('Access denied', 403);
            }
            // Enforce status restrictions for non-admin users
            if (user.role !== 'admin') {
                if (proposal.status !== 'draft' && proposal.status !== 'rejected') {
                    throw new errorHandler_1.AppError('Only draft and rejected proposals can be edited', 400);
                }
            }
            // Increment version
            const newVersion = proposal.current_version + 1;
            // Update proposal
            const updates = {
                current_version: newVersion,
                updated_at: trx.fn.now(),
            };
            if (data.title)
                updates.title = data.title;
            if (data.sections)
                updates.sections = JSON.stringify(data.sections);
            if (data.survey_notes)
                updates.survey_notes = data.survey_notes;
            if (data.attachments)
                updates.attachments = JSON.stringify(data.attachments);
            await trx('proposals').where({ id: proposalId }).update(updates);
            // Create version record
            await trx('proposal_versions').insert({
                proposal_id: proposalId,
                version_number: newVersion,
                sections: JSON.stringify(data.sections || JSON.parse(proposal.sections)),
                change_description: data.change_description || 'Content updated',
                created_by: userId,
            });
            await trx.commit();
            logger_1.logger.info('Proposal updated', {
                proposal_id: proposalId,
                new_version: newVersion,
            });
            return this.getProposalById(proposalId, userId);
        }
        catch (error) {
            await trx.rollback();
            throw error;
        }
    }
    /**
     * Regenerate proposal sections using AI
     */
    async regenerateProposal(proposalId, userId, sectionType) {
        const proposal = await (0, db_1.db)('proposals').where({ id: proposalId }).first();
        if (!proposal) {
            throw new errorHandler_1.AppError('Proposal not found', 404);
        }
        // Check permissions
        const user = await (0, db_1.db)('users').where({ id: userId }).first();
        if (user.role !== 'admin' && proposal.user_id !== userId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        // Enforce status restrictions for non-admin users
        if (user.role !== 'admin') {
            if (proposal.status !== 'draft' && proposal.status !== 'rejected') {
                throw new errorHandler_1.AppError('Only draft and rejected proposals can be regenerated', 400);
            }
        }
        // Generate new content
        const aiRequest = {
            proposal_id: proposalId,
            schema_id: proposal.schema_id,
            survey_notes: proposal.survey_notes,
            attachments: JSON.parse(proposal.attachments),
        };
        const aiResponse = await ai_service_1.aiService.generateDraft(aiRequest);
        // Update with new sections
        return this.updateProposal(proposalId, userId, {
            sections: aiResponse.sections,
            change_description: sectionType
                ? `Regenerated section: ${sectionType}`
                : 'Regenerated entire proposal',
        });
    }
    /**
     * Submit proposal for approval
     */
    async submitForApproval(proposalId, userId) {
        const proposal = await (0, db_1.db)('proposals').where({ id: proposalId }).first();
        if (!proposal) {
            throw new errorHandler_1.AppError('Proposal not found', 404);
        }
        if (proposal.user_id !== userId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        if (proposal.status !== 'draft' && proposal.status !== 'rejected') {
            throw new errorHandler_1.AppError('Only draft and rejected proposals can be submitted', 400);
        }
        await (0, db_1.db)('proposals')
            .where({ id: proposalId })
            .update({
            status: 'pending_approval',
            submitted_at: db_1.db.fn.now(),
            updated_at: db_1.db.fn.now(),
            admin_comments: null, // Clear previous rejection comments
            reviewed_by: null, // Clear previous reviewer
            reviewed_at: null, // Clear previous review date
        });
        logger_1.logger.info('Proposal submitted for approval', { proposal_id: proposalId });
        return this.getProposalById(proposalId, userId);
    }
    /**
     * Approve proposal (admin only)
     */
    async approveProposal(proposalId, adminId) {
        const admin = await (0, db_1.db)('users').where({ id: adminId }).first();
        if (admin.role !== 'admin') {
            throw new errorHandler_1.AppError('Only admins can approve proposals', 403);
        }
        await (0, db_1.db)('proposals')
            .where({ id: proposalId })
            .update({
            status: 'approved',
            reviewed_by: adminId,
            reviewed_at: db_1.db.fn.now(),
            updated_at: db_1.db.fn.now(),
        });
        logger_1.logger.info('Proposal approved', { proposal_id: proposalId, admin_id: adminId });
        return this.getProposalById(proposalId, adminId);
    }
    /**
     * Reject proposal (admin only)
     */
    async rejectProposal(proposalId, adminId, comments) {
        const admin = await (0, db_1.db)('users').where({ id: adminId }).first();
        if (admin.role !== 'admin') {
            throw new errorHandler_1.AppError('Only admins can reject proposals', 403);
        }
        await (0, db_1.db)('proposals')
            .where({ id: proposalId })
            .update({
            status: 'rejected',
            reviewed_by: adminId,
            reviewed_at: db_1.db.fn.now(),
            admin_comments: comments,
            updated_at: db_1.db.fn.now(),
        });
        logger_1.logger.info('Proposal rejected', { proposal_id: proposalId, admin_id: adminId });
        return this.getProposalById(proposalId, adminId);
    }
    /**
     * Delete proposal
     */
    async deleteProposal(proposalId, userId) {
        const proposal = await (0, db_1.db)('proposals').where({ id: proposalId }).first();
        if (!proposal) {
            throw new errorHandler_1.AppError('Proposal not found', 404);
        }
        const user = await (0, db_1.db)('users').where({ id: userId }).first();
        if (user.role !== 'admin' && proposal.user_id !== userId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        if (proposal.status !== 'draft') {
            throw new errorHandler_1.AppError('Only draft proposals can be deleted', 400);
        }
        await (0, db_1.db)('proposals').where({ id: proposalId }).delete();
        logger_1.logger.info('Proposal deleted', { proposal_id: proposalId });
        return { message: 'Proposal deleted successfully' };
    }
    /**
     * Get version history for a proposal
     * Users can only see versions up to approved version
     * Admins can see all versions
     */
    async getProposalVersions(proposalId, userId) {
        const proposal = await (0, db_1.db)('proposals').where({ id: proposalId }).first();
        if (!proposal) {
            throw new errorHandler_1.AppError('Proposal not found', 404);
        }
        // Check permissions
        const user = await (0, db_1.db)('users').where({ id: userId }).first();
        if (user.role !== 'admin' && proposal.user_id !== userId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        // Get all versions
        let versions = await (0, db_1.db)('proposal_versions')
            .where({ proposal_id: proposalId })
            .leftJoin('users', 'proposal_versions.created_by', 'users.id')
            .select('proposal_versions.id', 'proposal_versions.version_number', 'proposal_versions.sections', 'proposal_versions.change_description', 'proposal_versions.created_at', 'users.name as created_by_name', 'users.email as created_by_email')
            .orderBy('version_number', 'desc');
        // For non-admin users, only show versions up to approved version
        if (user.role !== 'admin') {
            // Find the version when proposal was approved
            const approvedVersion = proposal.status === 'approved' ? proposal.current_version : null;
            if (approvedVersion) {
                versions = versions.filter(v => v.version_number <= approvedVersion);
            }
        }
        return versions.map(v => ({
            ...v,
            sections: JSON.parse(v.sections),
        }));
    }
    /**
     * Export proposal as Word document
     * Users can only export approved proposals
     * Admins can export any approved proposal
     */
    async exportProposalToWord(proposalId, userId) {
        const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
        const { Packer } = require('docx');
        const proposal = await this.getProposalById(proposalId, userId);
        if (!proposal) {
            throw new errorHandler_1.AppError('Proposal not found', 404);
        }
        // Check permissions
        const user = await (0, db_1.db)('users').where({ id: userId }).first();
        // Users can only export approved proposals
        if (user.role !== 'admin' && proposal.status !== 'approved') {
            throw new errorHandler_1.AppError('Only approved proposals can be exported', 403);
        }
        // Admins can export any approved proposal
        if (user.role === 'admin' && proposal.status !== 'approved') {
            throw new errorHandler_1.AppError('Only approved proposals can be exported', 400);
        }
        // Create document
        const doc = new Document({
            sections: [{
                    properties: {},
                    children: [
                        // Title
                        new Paragraph({
                            text: proposal.title,
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                        }),
                        // Metadata
                        new Paragraph({
                            children: [
                                new TextRun({ text: 'Status: ', bold: true }),
                                new TextRun({ text: proposal.status }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: 'Schema: ', bold: true }),
                                new TextRun({ text: proposal.schema_name || 'N/A' }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: 'Version: ', bold: true }),
                                new TextRun({ text: `${proposal.current_version}` }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: 'Created: ', bold: true }),
                                new TextRun({ text: new Date(proposal.created_at).toLocaleDateString() }),
                            ],
                            spacing: { after: 400 },
                        }),
                        // Survey Notes (if available)
                        ...(proposal.survey_notes ? [
                            new Paragraph({
                                text: 'Survey Notes',
                                heading: HeadingLevel.HEADING_2,
                                spacing: { before: 400, after: 200 },
                            }),
                            new Paragraph({
                                text: proposal.survey_notes,
                                spacing: { after: 400 },
                            }),
                        ] : []),
                        // Sections
                        ...proposal.sections.flatMap((section) => [
                            new Paragraph({
                                text: section.name,
                                heading: HeadingLevel.HEADING_2,
                                spacing: { before: 400, after: 200 },
                            }),
                            new Paragraph({
                                text: section.content,
                                spacing: { after: 400 },
                            }),
                        ]),
                    ],
                }],
        });
        // Generate buffer
        const buffer = await Packer.toBuffer(doc);
        // Generate filename
        const filename = `${proposal.title.replace(/[^a-z0-9]/gi, '_')}_v${proposal.current_version}.docx`;
        logger_1.logger.info('Proposal exported to Word', { proposal_id: proposalId, filename });
        return { buffer, filename };
    }
}
exports.ProposalService = ProposalService;
exports.proposalService = new ProposalService();
//# sourceMappingURL=proposal.service.js.map