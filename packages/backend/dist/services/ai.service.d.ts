/**
 * AI Service Client
 * Communicates with the AI service for proposal generation
 * NOTE: AI service CANNOT write to database - only generates content
 */
export interface GenerateDraftRequest {
    proposal_id: string;
    schema_id: string;
    survey_notes: string;
    attachments?: string[];
    additional_guidance?: string;
}
export interface DraftSection {
    type: string;
    content: string;
    confidence_score: number;
    rationale: string;
    source_references: string[];
    missing_info: string[];
    order: number;
    rule_enforcement: {
        passed: boolean;
        violations: any[];
        warnings: any[];
        strict_violations: number;
    };
}
export interface GenerateDraftResponse {
    draft_id: string;
    proposal_id: string;
    schema_id: string;
    schema_version: string;
    sections: DraftSection[];
    model_version: string;
    rules_enforced: number;
    token_usage: number;
    estimated_cost: number;
    processing_time: number;
    all_rules_passed: boolean;
}
export declare class AIService {
    /**
     * Generate proposal draft using AI service
     * Sends structured input with rules and SOPs to AI service
     * AI service enforces rules and returns generated content
     */
    generateDraft(request: GenerateDraftRequest): Promise<GenerateDraftResponse>;
    /**
     * Get available schemas from AI service
     */
    getSchemas(): Promise<any>;
    /**
     * Upload schema to AI service
     */
    uploadSchema(schemaData: any): Promise<any>;
    /**
     * Health check for AI service
     */
    healthCheck(): Promise<boolean>;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.service.d.ts.map