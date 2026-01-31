/**
 * Proposal Service
 * Handles all proposal-related business logic and database operations
 * Coordinates with AI service for content generation
 */
export interface CreateProposalRequest {
    title: string;
    schema_id: string;
    user_id: string;
    survey_notes: string;
    attachments?: string[];
    additional_guidance?: string;
}
export interface UpdateProposalRequest {
    title?: string;
    sections?: any[];
    survey_notes?: string;
    attachments?: string[];
    change_description?: string;
}
export declare class ProposalService {
    /**
     * Create a new proposal and generate content using AI service
     * 1. Validate inputs
     * 2. Send to AI service for generation (AI CANNOT write to DB)
     * 3. Save generated proposal to PostgreSQL database
     */
    createProposal(data: CreateProposalRequest): Promise<any>;
    /**
     * Get proposal by ID
     */
    getProposalById(proposalId: string, userId: string): Promise<any>;
    /**
     * List proposals for a user
     */
    listProposals(userId: string, filters?: any): Promise<any[]>;
    /**
     * Update proposal and create new version
     */
    updateProposal(proposalId: string, userId: string, data: UpdateProposalRequest): Promise<any>;
    /**
     * Regenerate proposal sections using AI
     */
    regenerateProposal(proposalId: string, userId: string, sectionType?: string): Promise<any>;
    /**
     * Submit proposal for approval
     */
    submitForApproval(proposalId: string, userId: string): Promise<any>;
    /**
     * Approve proposal (admin only)
     */
    approveProposal(proposalId: string, adminId: string): Promise<any>;
    /**
     * Reject proposal (admin only)
     */
    rejectProposal(proposalId: string, adminId: string, comments: string): Promise<any>;
    /**
     * Delete proposal
     */
    deleteProposal(proposalId: string, userId: string): Promise<{
        message: string;
    }>;
}
export declare const proposalService: ProposalService;
//# sourceMappingURL=proposal.service.d.ts.map