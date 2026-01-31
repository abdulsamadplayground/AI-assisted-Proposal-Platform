"use strict";
/**
 * AI Service Client
 * Communicates with the AI service for proposal generation
 * NOTE: AI service CANNOT write to database - only generates content
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
class AIService {
    /**
     * Generate proposal draft using AI service
     * Sends structured input with rules and SOPs to AI service
     * AI service enforces rules and returns generated content
     */
    async generateDraft(request) {
        try {
            logger_1.logger.info('Sending generation request to AI service', {
                proposal_id: request.proposal_id,
                schema_id: request.schema_id,
                survey_notes_length: request.survey_notes.length,
            });
            const response = await axios_1.default.post(`${AI_SERVICE_URL}/api/ai/generate-draft`, request, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 120000, // 2 minutes timeout for AI generation
            });
            logger_1.logger.info('AI generation completed', {
                proposal_id: request.proposal_id,
                sections_generated: response.data.sections.length,
                rules_enforced: response.data.rules_enforced,
                all_rules_passed: response.data.all_rules_passed,
                processing_time: response.data.processing_time,
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                logger_1.logger.error('AI service request failed', {
                    status: error.response?.status,
                    message: error.response?.data?.detail || error.message,
                    proposal_id: request.proposal_id,
                });
                throw new Error(error.response?.data?.detail || 'Failed to generate proposal with AI service');
            }
            throw error;
        }
    }
    /**
     * Get available schemas from AI service
     */
    async getSchemas() {
        try {
            const response = await axios_1.default.get(`${AI_SERVICE_URL}/api/ai/schemas`);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch schemas from AI service', { error });
            throw new Error('Failed to fetch schemas from AI service');
        }
    }
    /**
     * Upload schema to AI service
     */
    async uploadSchema(schemaData) {
        try {
            const response = await axios_1.default.post(`${AI_SERVICE_URL}/api/ai/schemas`, { schema_data: schemaData }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Failed to upload schema to AI service', { error });
            throw new Error('Failed to upload schema to AI service');
        }
    }
    /**
     * Health check for AI service
     */
    async healthCheck() {
        try {
            const response = await axios_1.default.get(`${AI_SERVICE_URL}/api/ai/health`, {
                timeout: 5000,
            });
            return response.data.status === 'healthy';
        }
        catch (error) {
            logger_1.logger.error('AI service health check failed', { error });
            return false;
        }
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
//# sourceMappingURL=ai.service.js.map