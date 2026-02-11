"""
Schema Manager - Handles proposal schemas defined by admins.
Schemas define sections and rules that MUST be followed by LLM output.
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from enum import Enum

logger = logging.getLogger(__name__)


class RuleType(str, Enum):
    """Types of rules that can be enforced"""
    VALIDATION = "validation"  # Validate LLM output meets criteria
    TRANSFORMATION = "transformation"  # Transform LLM output
    CONSTRAINT = "constraint"  # Hard constraints on content
    FORMAT = "format"  # Format requirements
    REQUIRED_FIELD = "required_field"  # Required information
    LENGTH = "length"  # Length constraints
    PATTERN = "pattern"  # Regex pattern matching


class SectionRule(BaseModel):
    """Rule that must be enforced on a section"""
    id: str
    name: str
    type: RuleType
    description: str
    enforcement: str = "strict"  # strict | warning | advisory
    parameters: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None


class SectionSchema(BaseModel):
    """Schema for a proposal section defined by admin"""
    id: str
    name: str
    display_name: str
    description: str
    required: bool = True
    order: int
    rules: List[SectionRule] = Field(default_factory=list)
    output_format: str = "text"  # text | json | markdown | structured
    max_length: Optional[int] = None
    min_length: Optional[int] = None
    template: Optional[str] = None


class ProposalSchema(BaseModel):
    """Complete proposal schema with all sections and rules"""
    id: str
    name: str
    version: str
    description: str
    created_by: str
    created_at: str
    sections: List[SectionSchema]
    global_rules: List[SectionRule] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SchemaManager:
    """
    Manages proposal schemas and their rules.
    Schemas are created by admins and define the structure and rules for proposals.
    """
    
    def __init__(self):
        self.schemas: Dict[str, ProposalSchema] = {}
        self.active_schema_id: Optional[str] = None
        logger.info("Schema Manager initialized")
    
    def load_schema(self, schema_data: Dict[str, Any]) -> ProposalSchema:
        """
        Load a schema from admin-defined data.
        
        Args:
            schema_data: Schema definition from admin
        
        Returns:
            Loaded ProposalSchema
        """
        try:
            schema = ProposalSchema(**schema_data)
            self.schemas[schema.id] = schema
            
            logger.info(f"Schema loaded: {schema.name}", extra={
                "schema_id": schema.id,
                "version": schema.version,
                "sections": len(schema.sections),
                "global_rules": len(schema.global_rules)
            })
            
            return schema
            
        except Exception as e:
            logger.error(f"Failed to load schema: {str(e)}")
            raise ValueError(f"Invalid schema format: {str(e)}")
    
    def get_schema(self, schema_id: str) -> Optional[ProposalSchema]:
        """Get schema by ID"""
        return self.schemas.get(schema_id)
    
    def get_active_schema(self) -> Optional[ProposalSchema]:
        """Get currently active schema"""
        if self.active_schema_id:
            return self.schemas.get(self.active_schema_id)
        return None
    
    def set_active_schema(self, schema_id: str):
        """Set active schema"""
        if schema_id not in self.schemas:
            raise ValueError(f"Schema {schema_id} not found")
        self.active_schema_id = schema_id
        logger.info(f"Active schema set to: {schema_id}")
    
    def get_section_schema(self, schema_id: str, section_name: str) -> Optional[SectionSchema]:
        """Get specific section schema"""
        schema = self.get_schema(schema_id)
        if not schema:
            return None
        
        for section in schema.sections:
            if section.name == section_name:
                return section
        
        return None
    
    def get_section_rules(self, schema_id: str, section_name: str) -> List[SectionRule]:
        """
        Get all rules for a section (section-specific + global rules).
        
        Args:
            schema_id: Schema ID
            section_name: Section name
        
        Returns:
            List of rules to enforce
        """
        schema = self.get_schema(schema_id)
        if not schema:
            return []
        
        section = self.get_section_schema(schema_id, section_name)
        if not section:
            return []
        
        # Combine section rules and global rules
        all_rules = list(schema.global_rules) + list(section.rules)
        
        logger.debug(f"Retrieved {len(all_rules)} rules for section {section_name}")
        return all_rules
    
    def validate_schema(self, schema: ProposalSchema) -> tuple[bool, List[str]]:
        """
        Validate schema structure and rules.
        
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        
        # Check for duplicate section names
        section_names = [s.name for s in schema.sections]
        if len(section_names) != len(set(section_names)):
            errors.append("Duplicate section names found")
        
        # Check for duplicate rule IDs
        all_rule_ids = [r.id for r in schema.global_rules]
        for section in schema.sections:
            all_rule_ids.extend([r.id for r in section.rules])
        
        if len(all_rule_ids) != len(set(all_rule_ids)):
            errors.append("Duplicate rule IDs found")
        
        # Validate section order
        orders = [s.order for s in schema.sections]
        if len(orders) != len(set(orders)):
            errors.append("Duplicate section order values")
        
        # Validate rules
        for section in schema.sections:
            for rule in section.rules:
                if rule.type == RuleType.LENGTH:
                    if "min" not in rule.parameters and "max" not in rule.parameters:
                        errors.append(f"Length rule {rule.id} missing min/max parameters")
                
                elif rule.type == RuleType.PATTERN:
                    if "pattern" not in rule.parameters:
                        errors.append(f"Pattern rule {rule.id} missing pattern parameter")
                
                elif rule.type == RuleType.REQUIRED_FIELD:
                    if "field" not in rule.parameters:
                        errors.append(f"Required field rule {rule.id} missing field parameter")
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    def create_default_schema(self) -> ProposalSchema:
        """
        Create a default proposal schema with common sections and rules.
        This serves as a template for admins.
        """
        default_schema = ProposalSchema(
            id="default-proposal-schema",
            name="Default Proposal Schema",
            version="1.0.0",
            description="Default schema for business proposals",
            created_by="system",
            created_at="2026-01-31T00:00:00Z",
            sections=[
                SectionSchema(
                    id="exec-summary",
                    name="executive_summary",
                    display_name="Executive Summary",
                    description="High-level overview of the proposal",
                    required=True,
                    order=1,
                    output_format="text",
                    max_length=1000,
                    min_length=200,
                    rules=[
                        SectionRule(
                            id="exec-summary-length",
                            name="Length Constraint",
                            type=RuleType.LENGTH,
                            description="Executive summary must be 200-1000 characters",
                            enforcement="strict",
                            parameters={"min": 200, "max": 1000},
                            error_message="Executive summary must be between 200 and 1000 characters"
                        ),
                        SectionRule(
                            id="exec-summary-required-fields",
                            name="Required Information",
                            type=RuleType.REQUIRED_FIELD,
                            description="Must mention project scope and objectives",
                            enforcement="warning",
                            parameters={"fields": ["scope", "objectives"]},
                            error_message="Executive summary should mention project scope and objectives"
                        )
                    ]
                ),
                SectionSchema(
                    id="scope-of-work",
                    name="scope_of_work",
                    display_name="Scope of Work",
                    description="Detailed breakdown of work to be performed",
                    required=True,
                    order=2,
                    output_format="structured",
                    rules=[
                        SectionRule(
                            id="scope-structured-format",
                            name="Structured Format",
                            type=RuleType.FORMAT,
                            description="Scope must be structured as list of items",
                            enforcement="strict",
                            parameters={"format": "list"},
                            error_message="Scope of work must be formatted as a structured list"
                        ),
                        SectionRule(
                            id="scope-min-items",
                            name="Minimum Items",
                            type=RuleType.VALIDATION,
                            description="Must have at least 3 work items",
                            enforcement="warning",
                            parameters={"min_items": 3},
                            error_message="Scope should include at least 3 work items"
                        )
                    ]
                ),
                SectionSchema(
                    id="timeline",
                    name="timeline",
                    display_name="Project Timeline",
                    description="Estimated timeline and milestones",
                    required=True,
                    order=3,
                    output_format="structured",
                    rules=[
                        SectionRule(
                            id="timeline-format",
                            name="Timeline Format",
                            type=RuleType.FORMAT,
                            description="Timeline must include phases with durations",
                            enforcement="strict",
                            parameters={"format": "phases_with_duration"},
                            error_message="Timeline must be structured with phases and durations"
                        )
                    ]
                ),
                SectionSchema(
                    id="pricing",
                    name="pricing",
                    display_name="Pricing",
                    description="Cost breakdown and pricing information",
                    required=True,
                    order=4,
                    output_format="structured",
                    rules=[
                        SectionRule(
                            id="pricing-format",
                            name="Pricing Format",
                            type=RuleType.FORMAT,
                            description="Pricing must include itemized costs",
                            enforcement="strict",
                            parameters={"format": "itemized"},
                            error_message="Pricing must be itemized with clear cost breakdown"
                        ),
                        SectionRule(
                            id="pricing-disclaimer",
                            name="Pricing Disclaimer",
                            type=RuleType.REQUIRED_FIELD,
                            description="Must include disclaimer if estimates are preliminary",
                            enforcement="strict",
                            parameters={"field": "disclaimer"},
                            error_message="Pricing must include disclaimer for preliminary estimates"
                        )
                    ]
                )
            ],
            global_rules=[
                SectionRule(
                    id="global-no-mock-data",
                    name="No Mock Data",
                    type=RuleType.VALIDATION,
                    description="Content must be based on actual survey notes, not placeholder text",
                    enforcement="strict",
                    parameters={"check_for": ["lorem ipsum", "placeholder", "example", "TODO"]},
                    error_message="Content contains placeholder or mock data"
                ),
                SectionRule(
                    id="global-professional-tone",
                    name="Professional Tone",
                    type=RuleType.VALIDATION,
                    description="Content must maintain professional business tone",
                    enforcement="advisory",
                    parameters={},
                    error_message="Content should maintain professional tone"
                )
            ]
        )
        
        self.load_schema(default_schema.model_dump())
        self.set_active_schema(default_schema.id)
        
        logger.info("Default schema created and activated")
        return default_schema


# Global schema manager instance
schema_manager = SchemaManager()
