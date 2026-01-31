/**
 * AI Service Client
 * Communicates with the AI service for proposal generation
 * NOTE: AI service CANNOT write to database - only generates content
 */

import axios from 'axios';
import { logger } from '../utils/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

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

export class AIService {
  /**
   * Generate proposal draft using AI service
   * Sends structured input with rules and SOPs to AI service
   * AI service enforces rules and returns generated content
   */
  async generateDraft(request: GenerateDraftRequest): Promise<GenerateDraftResponse> {
    try {
      logger.info('Sending generation request to AI service', {
        proposal_id: request.proposal_id,
        schema_id: request.schema_id,
        survey_notes_length: request.survey_notes.length,
      });

      const response = await axios.post<GenerateDraftResponse>(
        `${AI_SERVICE_URL}/api/ai/generate-draft`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minutes timeout for AI generation
        }
      );

      logger.info('AI generation completed', {
        proposal_id: request.proposal_id,
        sections_generated: response.data.sections.length,
        rules_enforced: response.data.rules_enforced,
        all_rules_passed: response.data.all_rules_passed,
        processing_time: response.data.processing_time,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('AI service request failed', {
          status: error.response?.status,
          message: error.response?.data?.detail || error.message,
          proposal_id: request.proposal_id,
        });
        throw new Error(
          error.response?.data?.detail || 'Failed to generate proposal with AI service'
        );
      }
      throw error;
    }
  }

  /**
   * Get available schemas from AI service
   */
  async getSchemas(): Promise<any> {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/api/ai/schemas`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch schemas from AI service', { error });
      throw new Error('Failed to fetch schemas from AI service');
    }
  }

  /**
   * Upload schema to AI service
   */
  async uploadSchema(schemaData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/ai/schemas`,
        { schema_data: schemaData },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to upload schema to AI service', { error });
      throw new Error('Failed to upload schema to AI service');
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/api/ai/health`, {
        timeout: 5000,
      });
      return response.data.status === 'healthy';
    } catch (error) {
      logger.error('AI service health check failed', { error });
      return false;
    }
  }
}

export const aiService = new AIService();
