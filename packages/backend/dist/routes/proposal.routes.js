"use strict";
/**
 * Proposal routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proposal_service_1 = require("../services/proposal.service");
const router = (0, express_1.Router)();
// Authentication removed for development
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'; // Default admin user ID from seeds
/**
 * POST /api/proposals
 * Create a new proposal
 */
router.post('/', async (req, res, next) => {
    try {
        const proposal = await proposal_service_1.proposalService.createProposal({
            ...req.body,
            user_id: DEFAULT_USER_ID,
        });
        res.status(201).json(proposal);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/proposals
 * List proposals
 */
router.get('/', async (req, res, next) => {
    try {
        const proposals = await proposal_service_1.proposalService.listProposals(DEFAULT_USER_ID, req.query);
        res.json(proposals);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/proposals/:id
 * Get proposal by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const proposal = await proposal_service_1.proposalService.getProposalById(req.params.id, DEFAULT_USER_ID);
        res.json(proposal);
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/proposals/:id
 * Update proposal
 */
router.put('/:id', async (req, res, next) => {
    try {
        const proposal = await proposal_service_1.proposalService.updateProposal(req.params.id, DEFAULT_USER_ID, req.body);
        res.json(proposal);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/proposals/:id/regenerate
 * Regenerate proposal sections
 */
router.post('/:id/regenerate', async (req, res, next) => {
    try {
        const proposal = await proposal_service_1.proposalService.regenerateProposal(req.params.id, DEFAULT_USER_ID, req.body.section_type);
        res.json(proposal);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/proposals/:id/submit
 * Submit proposal for approval
 */
router.post('/:id/submit', async (req, res, next) => {
    try {
        const proposal = await proposal_service_1.proposalService.submitForApproval(req.params.id, DEFAULT_USER_ID);
        res.json(proposal);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/proposals/:id/approve
 * Approve proposal
 */
router.post('/:id/approve', async (req, res, next) => {
    try {
        const proposal = await proposal_service_1.proposalService.approveProposal(req.params.id, DEFAULT_USER_ID);
        res.json(proposal);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/proposals/:id/reject
 * Reject proposal
 */
router.post('/:id/reject', async (req, res, next) => {
    try {
        const proposal = await proposal_service_1.proposalService.rejectProposal(req.params.id, DEFAULT_USER_ID, req.body.comments);
        res.json(proposal);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/proposals/:id/versions
 * Get version history for a proposal
 */
router.get('/:id/versions', async (req, res, next) => {
    try {
        const versions = await proposal_service_1.proposalService.getProposalVersions(req.params.id, DEFAULT_USER_ID);
        res.json(versions);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/proposals/:id/export
 * Export proposal as Word document
 */
router.get('/:id/export', async (req, res, next) => {
    try {
        const { buffer, filename } = await proposal_service_1.proposalService.exportProposalToWord(req.params.id, DEFAULT_USER_ID);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/proposals/:id
 * Delete proposal
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await proposal_service_1.proposalService.deleteProposal(req.params.id, DEFAULT_USER_ID);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=proposal.routes.js.map