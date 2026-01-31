"""
Prompt Engineering - Creates structured prompts for proposal generation from REAL user survey notes.
NO mock data - all prompts process actual user input.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class SectionType(str, Enum):
    """Proposal section types"""
    EXECUTIVE_SUMMARY = "executive_summary"
    SCOPE_OF_WORK = "scope_of_work"
    TIMELINE = "timeline"
    PRICING = "pricing"


class PromptEngineer:
    """
    Creates optimized prompts for proposal generation from REAL survey notes.
    Handles prompt compression and structured output formatting.
    """
    
    def __init__(self):
        self.section_templates = {
            SectionType.EXECUTIVE_SUMMARY: self._executive_summary_template,
            SectionType.SCOPE_OF_WORK: self._scope_of_work_template,
            SectionType.TIMELINE: self._timeline_template,
            SectionType.PRICING: self._pricing_template
        }
    
    def create_generation_prompt(
        self,
        survey_notes: str,
        section_type: SectionType,
        rules: Optional[List[Dict[str, Any]]] = None,
        additional_context: Optional[str] = None
    ) -> tuple[str, str]:
        """
        Create a structured prompt for proposal section generation from REAL survey notes.
        
        Args:
            survey_notes: REAL user survey notes (not mock data)
            section_type: Type of section to generate
            rules: Admin-defined rules to apply
            additional_context: Additional user guidance
        
        Returns:
            Tuple of (system_message, user_prompt)
        """
        if not survey_notes or not survey_notes.strip():
            raise ValueError("Survey notes cannot be empty - REAL user input required")
        
        logger.info(f"Creating prompt for {section_type}", extra={
            "section_type": section_type,
            "survey_notes_length": len(survey_notes),
            "has_rules": bool(rules),
            "mock_data": False
        })
        
        # Get section-specific template
        template_func = self.section_templates.get(section_type)
        if not template_func:
            raise ValueError(f"Unknown section type: {section_type}")
        
        # Build system message with rules
        system_message = self._build_system_message(section_type, rules)
        
        # Build user prompt with survey notes
        user_prompt = template_func(survey_notes, additional_context)
        
        # Compress prompt if needed (token optimization)
        user_prompt = self._compress_prompt(user_prompt)
        
        return system_message, user_prompt
    
    def _build_system_message(
        self,
        section_type: SectionType,
        rules: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """Build system message with role definition and rules"""
        base_message = f"""You are an expert proposal writer generating the {section_type.value.replace('_', ' ')} section of a business proposal.

Your task is to analyze REAL survey notes provided by the user and generate a professional, structured proposal section.

CRITICAL REQUIREMENTS:
1. Base your response ONLY on the actual survey notes provided - do not invent information
2. Be specific and reference actual details from the survey notes
3. If information is missing or unclear, note it explicitly
4. Provide a confidence score (0.0-1.0) indicating how well the survey notes support your response
5. Include rationale explaining which parts of the survey notes influenced your response
6. Format your response as valid JSON

OUTPUT FORMAT:
{{
    "content": "The generated section content",
    "confidence": 0.85,
    "rationale": "Explanation of how survey notes support this content",
    "sources": ["Specific quotes or references from survey notes"],
    "missing_info": ["List any critical information not found in survey notes"]
}}"""
        
        # Add rules if provided
        if rules:
            rules_text = "\n\nADMIN-DEFINED RULES (MUST FOLLOW):\n"
            for i, rule in enumerate(rules, 1):
                rules_text += f"{i}. {rule.get('description', 'No description')}\n"
                if rule.get('constraints'):
                    rules_text += f"   Constraints: {rule['constraints']}\n"
            base_message += rules_text
        
        return base_message
    
    def _executive_summary_template(
        self,
        survey_notes: str,
        additional_context: Optional[str] = None
    ) -> str:
        """Template for executive summary generation"""
        prompt = f"""Based on the following REAL survey notes, generate an executive summary for a business proposal.

SURVEY NOTES:
{survey_notes}
"""
        
        if additional_context:
            prompt += f"\nADDITIONAL CONTEXT:\n{additional_context}\n"
        
        prompt += """
The executive summary should:
- Provide a high-level overview of the project
- Highlight key findings from the survey
- Summarize the proposed solution
- Be concise (2-3 paragraphs)
- Reference specific details from the survey notes

Remember to include confidence score, rationale, sources, and any missing information in your JSON response.
"""
        return prompt
    
    def _scope_of_work_template(
        self,
        survey_notes: str,
        additional_context: Optional[str] = None
    ) -> str:
        """Template for scope of work generation"""
        prompt = f"""Based on the following REAL survey notes, generate a detailed scope of work section.

SURVEY NOTES:
{survey_notes}
"""
        
        if additional_context:
            prompt += f"\nADDITIONAL CONTEXT:\n{additional_context}\n"
        
        prompt += """
The scope of work should:
- List specific tasks and deliverables mentioned in the survey
- Include quantities, measurements, or specifications from the survey notes
- Organize work items logically
- Be specific and actionable
- Note any assumptions made due to missing information

Format the content as a structured list with clear items and descriptions.

Remember to include confidence score, rationale, sources, and any missing information in your JSON response.
"""
        return prompt
    
    def _timeline_template(
        self,
        survey_notes: str,
        additional_context: Optional[str] = None
    ) -> str:
        """Template for timeline generation"""
        prompt = f"""Based on the following REAL survey notes, generate a project timeline section.

SURVEY NOTES:
{survey_notes}
"""
        
        if additional_context:
            prompt += f"\nADDITIONAL CONTEXT:\n{additional_context}\n"
        
        prompt += """
The timeline should:
- Estimate project phases based on the scope described in survey notes
- Provide realistic timeframes for each phase
- Note any time constraints or deadlines mentioned in the survey
- Include milestones and dependencies
- Clearly state if timeline is estimated due to missing information

Remember to include confidence score, rationale, sources, and any missing information in your JSON response.
"""
        return prompt
    
    def _pricing_template(
        self,
        survey_notes: str,
        additional_context: Optional[str] = None
    ) -> str:
        """Template for pricing generation"""
        prompt = f"""Based on the following REAL survey notes, generate a pricing section.

SURVEY NOTES:
{survey_notes}
"""
        
        if additional_context:
            prompt += f"\nADDITIONAL CONTEXT:\n{additional_context}\n"
        
        prompt += """
The pricing section should:
- Break down costs by work items mentioned in the survey
- Include quantities and unit prices where applicable
- Note any pricing information or budget constraints from the survey
- Clearly indicate if pricing is estimated or requires further clarification
- List assumptions made in pricing calculations

IMPORTANT: If the survey notes lack sufficient detail for accurate pricing, state this clearly and provide a range or note that detailed pricing requires additional information.

Remember to include confidence score, rationale, sources, and any missing information in your JSON response.
"""
        return prompt
    
    def _compress_prompt(self, prompt: str) -> str:
        """
        Compress prompt to reduce token usage while maintaining meaning.
        Simple compression - can be enhanced with more sophisticated techniques.
        """
        # Remove excessive whitespace
        lines = [line.strip() for line in prompt.split('\n') if line.strip()]
        compressed = '\n'.join(lines)
        
        # Log compression stats
        original_length = len(prompt)
        compressed_length = len(compressed)
        if original_length > compressed_length:
            logger.debug(f"Prompt compressed: {original_length} -> {compressed_length} chars")
        
        return compressed
    
    def parse_llm_response(self, response_content: str) -> Dict[str, Any]:
        """
        Parse LLM response and extract structured data.
        
        Args:
            response_content: Raw LLM response
        
        Returns:
            Parsed response dict with content, confidence, rationale, etc.
        """
        try:
            # Try to parse as JSON
            parsed = json.loads(response_content)
            
            # Validate required fields
            if "content" not in parsed:
                raise ValueError("Response missing 'content' field")
            
            # Ensure confidence is in valid range
            confidence = parsed.get("confidence", 0.5)
            if not (0.0 <= confidence <= 1.0):
                logger.warning(f"Invalid confidence score: {confidence}, clamping to [0.0, 1.0]")
                confidence = max(0.0, min(1.0, confidence))
                parsed["confidence"] = confidence
            
            # Ensure required fields exist
            parsed.setdefault("rationale", "No rationale provided")
            parsed.setdefault("sources", [])
            parsed.setdefault("missing_info", [])
            
            return parsed
            
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse LLM response as JSON: {str(e)}")
            
            # Fallback: treat entire response as content
            return {
                "content": response_content,
                "confidence": 0.5,
                "rationale": "Response was not in expected JSON format",
                "sources": [],
                "missing_info": ["Structured response format"]
            }
    
    def create_multi_section_prompt(
        self,
        survey_notes: str,
        section_types: List[SectionType],
        rules: Optional[List[Dict[str, Any]]] = None
    ) -> List[tuple[SectionType, str, str]]:
        """
        Create prompts for multiple sections at once.
        
        Args:
            survey_notes: REAL user survey notes
            section_types: List of sections to generate
            rules: Admin-defined rules
        
        Returns:
            List of (section_type, system_message, user_prompt) tuples
        """
        prompts = []
        for section_type in section_types:
            system_msg, user_prompt = self.create_generation_prompt(
                survey_notes, section_type, rules
            )
            prompts.append((section_type, system_msg, user_prompt))
        
        logger.info(f"Created {len(prompts)} section prompts", extra={
            "sections": [s.value for s in section_types],
            "mock_data": False
        })
        
        return prompts


# Global prompt engineer instance
prompt_engineer = PromptEngineer()
