"""
AI Service - FastAPI Application
Schema-driven, rule-enforced proposal generation from real user survey notes.
Admins define schemas with sections and rules that MUST be followed.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from pythonjsonlogger import jsonlogger
import os
from dotenv import load_dotenv

# Load environment variables FIRST before importing other modules
load_dotenv()

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
import uuid

# Import our modules AFTER loading env vars
from llm_adapter import llm_adapter
from schema_manager import schema_manager, ProposalSchema, SectionSchema
from rule_engine import rule_engine

# Configure structured JSON logging
logger = logging.getLogger(__name__)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    fmt='%(asctime)s %(name)s %(levelname)s %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(os.getenv('LOG_LEVEL', 'INFO'))


# Request/Response Models
class DraftGenerationRequest(BaseModel):
    """Request model for schema-based draft generation"""
    proposal_id: str = Field(..., description="Unique proposal ID")
    survey_notes: str = Field(..., min_length=1, max_length=50000, description="REAL user survey notes")
    schema_id: str = Field(..., description="Schema ID defining sections and rules")
    attachments: Optional[List[str]] = Field(default=None, description="References to uploaded attachments")
    additional_guidance: Optional[str] = Field(default=None, description="Additional user guidance")


class DraftSection(BaseModel):
    """Generated draft section with rule enforcement results"""
    type: str
    content: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    rationale: str
    source_references: List[str]
    missing_info: List[str]
    order: int
    rule_enforcement: Dict[str, Any]  # Results of rule enforcement


class DraftGenerationResponse(BaseModel):
    """Response model for schema-based draft generation"""
    draft_id: str
    proposal_id: str
    schema_id: str
    schema_version: str
    sections: List[DraftSection]
    model_version: str
    rules_enforced: int
    token_usage: int
    estimated_cost: float
    processing_time: float
    all_rules_passed: bool


class SchemaUploadRequest(BaseModel):
    """Request to upload/update a schema"""
    schema_data: Dict[str, Any]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events"""
    # Startup
    logger.info("AI Service starting up", extra={
        "environment": os.getenv("ENVIRONMENT", "development"),
        "llm_provider": os.getenv("LLM_PROVIDER", "groq")
    })
    
    # Load default schema
    schema_manager.create_default_schema()
    
    yield
    
    # Shutdown
    logger.info("AI Service shutting down")


# Create FastAPI application
app = FastAPI(
    title="AI Proposal Generation Service",
    description="Schema-driven, rule-enforced proposal generation from real user survey notes",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3001")
CORS_ORIGINS = [
    BACKEND_URL,
    "http://localhost:3000",  # Frontend
    "http://localhost:3001",  # Backend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/ai/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-proposal-generation",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "llm_provider": os.getenv("LLM_PROVIDER", "groq"),
        "features": {
            "real_llm_calls": True,
            "mock_data": False,
            "schema_driven": True,
            "rule_enforcement": True
        },
        "active_schema": schema_manager.active_schema_id
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Proposal Generation Service - Schema-Driven, Rule-Enforced",
        "docs": "/docs",
        "health": "/api/ai/health"
    }


@app.post("/api/ai/generate-draft", response_model=DraftGenerationResponse)
async def generate_draft(request: DraftGenerationRequest):
    """
    Generate proposal draft using schema-defined sections and enforced rules.
    
    Process:
    1. Load schema with sections and rules
    2. Generate content for each section using LLM
    3. ENFORCE rules on generated content
    4. Return draft with rule enforcement results
    
    Args:
        request: Draft generation request with REAL survey notes and schema ID
    
    Returns:
        Generated draft with rule enforcement results
    """
    start_time = time.time()
    
    logger.info("Received schema-based draft generation request", extra={
        "proposal_id": request.proposal_id,
        "schema_id": request.schema_id,
        "survey_notes_length": len(request.survey_notes),
        "mock_data": False,
        "real_user_input": True
    })
    
    try:
        # Validate survey notes
        if not request.survey_notes.strip():
            raise HTTPException(
                status_code=400,
                detail="Survey notes cannot be empty - REAL user input required"
            )
        
        # Load schema
        schema = schema_manager.get_schema(request.schema_id)
        if not schema:
            raise HTTPException(
                status_code=404,
                detail=f"Schema {request.schema_id} not found"
            )
        
        logger.info(f"Using schema: {schema.name} v{schema.version}", extra={
            "schema_id": schema.id,
            "sections": len(schema.sections)
        })
        
        # Generate sections based on schema
        generated_sections = []
        total_tokens = 0
        total_cost = 0.0
        total_rules_enforced = 0
        all_rules_passed = True
        
        # Sort sections by order
        sorted_sections = sorted(schema.sections, key=lambda s: s.order)
        
        for section_schema in sorted_sections:
            logger.info(f"Generating section: {section_schema.display_name}", extra={
                "section": section_schema.name,
                "required": section_schema.required,
                "rules": len(section_schema.rules)
            })
            
            # Create prompt for this section
            system_msg = _create_system_message(section_schema, schema.global_rules)
            user_prompt = _create_user_prompt(
                request.survey_notes,
                section_schema,
                request.additional_guidance
            )
            
            # Make REAL LLM API call
            llm_response = await llm_adapter.generate_completion(
                prompt=user_prompt,
                system_message=system_msg
            )
            
            # Parse LLM response
            content = llm_response["content"]
            
            # ENFORCE RULES on generated content
            section_rules = schema_manager.get_section_rules(schema.id, section_schema.name)
            enforcement_result = rule_engine.enforce_rules(
                content=content,
                rules=section_rules,
                section_name=section_schema.name,
                survey_notes=request.survey_notes
            )
            
            total_rules_enforced += len(section_rules)
            
            # Check if rules passed
            if not enforcement_result.passed:
                all_rules_passed = False
                logger.warning(f"Section {section_schema.name} failed rule enforcement", extra={
                    "violations": len(enforcement_result.violations),
                    "strict_violations": enforcement_result.to_dict()["strict_violations"]
                })
            
            # Apply transformations if any
            content = rule_engine.apply_transformations(content, section_rules)
            
            # Track tokens and cost
            total_tokens += llm_response["tokens_used"]
            total_cost += llm_response["estimated_cost"]
            
            # Create section object
            section = DraftSection(
                type=section_schema.name,
                content=content,
                confidence_score=0.8,  # TODO: Calculate based on survey notes quality
                rationale=f"Generated based on survey notes for {section_schema.display_name}",
                source_references=[],  # TODO: Extract references from survey notes
                missing_info=[],  # TODO: Identify missing information
                order=section_schema.order,
                rule_enforcement=enforcement_result.to_dict()
            )
            
            generated_sections.append(section)
            
            logger.info(f"Section generated and rules enforced", extra={
                "section": section_schema.name,
                "rules_passed": enforcement_result.passed,
                "tokens_used": llm_response["tokens_used"]
            })
        
        processing_time = time.time() - start_time
        
        # Create response
        response = DraftGenerationResponse(
            draft_id=str(uuid.uuid4()),
            proposal_id=request.proposal_id,
            schema_id=schema.id,
            schema_version=schema.version,
            sections=generated_sections,
            model_version=llm_adapter.model,
            rules_enforced=total_rules_enforced,
            token_usage=total_tokens,
            estimated_cost=round(total_cost, 4),
            processing_time=round(processing_time, 2),
            all_rules_passed=all_rules_passed
        )
        
        logger.info("Schema-based draft generation completed", extra={
            "proposal_id": request.proposal_id,
            "sections_generated": len(generated_sections),
            "rules_enforced": total_rules_enforced,
            "all_rules_passed": all_rules_passed,
            "total_tokens": total_tokens,
            "processing_time": processing_time
        })
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Draft generation failed", extra={
            "error": str(e),
            "proposal_id": request.proposal_id
        })
        raise HTTPException(
            status_code=500,
            detail=f"Draft generation failed: {str(e)}"
        )


def _create_system_message(section_schema: SectionSchema, global_rules: List) -> str:
    """Create system message for LLM based on section schema"""
    message = f"""You are generating the {section_schema.display_name} section of a business proposal.

Section Description: {section_schema.description}

CRITICAL: Your output will be ENFORCED against strict rules. You MUST:
1. Base content ONLY on the actual survey notes provided
2. Follow the required output format: {section_schema.output_format}
3. Comply with all section rules

"""
    
    # Add section rules
    if section_schema.rules:
        message += "\nSECTION RULES (STRICTLY ENFORCED):\n"
        for rule in section_schema.rules:
            message += f"- {rule.name}: {rule.description}\n"
    
    # Add global rules
    if global_rules:
        message += "\nGLOBAL RULES (STRICTLY ENFORCED):\n"
        for rule in global_rules:
            message += f"- {rule.name}: {rule.description}\n"
    
    return message


def _create_user_prompt(
    survey_notes: str,
    section_schema: SectionSchema,
    additional_guidance: Optional[str]
) -> str:
    """Create user prompt for LLM"""
    prompt = f"""Generate the {section_schema.display_name} section based on these REAL survey notes:

SURVEY NOTES:
{survey_notes}
"""
    
    if additional_guidance:
        prompt += f"\nADDITIONAL GUIDANCE:\n{additional_guidance}\n"
    
    if section_schema.template:
        prompt += f"\nTEMPLATE:\n{section_schema.template}\n"
    
    prompt += f"\nOutput Format: {section_schema.output_format}\n"
    
    if section_schema.min_length:
        prompt += f"Minimum Length: {section_schema.min_length} characters\n"
    if section_schema.max_length:
        prompt += f"Maximum Length: {section_schema.max_length} characters\n"
    
    return prompt


@app.post("/api/ai/schemas")
async def upload_schema(request: SchemaUploadRequest):
    """
    Upload or update a proposal schema (Admin only).
    Schemas define sections and rules for proposals.
    """
    try:
        schema = schema_manager.load_schema(request.schema_data)
        
        # Validate schema
        is_valid, errors = schema_manager.validate_schema(schema)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid schema: {', '.join(errors)}"
            )
        
        logger.info(f"Schema uploaded: {schema.name}", extra={
            "schema_id": schema.id,
            "version": schema.version
        })
        
        return {
            "message": "Schema uploaded successfully",
            "schema_id": schema.id,
            "schema_name": schema.name,
            "version": schema.version,
            "sections": len(schema.sections),
            "global_rules": len(schema.global_rules)
        }
        
    except Exception as e:
        logger.error(f"Schema upload failed: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Schema upload failed: {str(e)}"
        )


@app.get("/api/ai/schemas")
async def list_schemas():
    """List all available schemas"""
    schemas = []
    for schema_id, schema in schema_manager.schemas.items():
        schemas.append({
            "id": schema.id,
            "name": schema.name,
            "version": schema.version,
            "description": schema.description,
            "sections": len(schema.sections),
            "global_rules": len(schema.global_rules),
            "is_active": schema_id == schema_manager.active_schema_id
        })
    
    return {"schemas": schemas}


@app.get("/api/ai/schemas/{schema_id}")
async def get_schema(schema_id: str):
    """Get specific schema details"""
    schema = schema_manager.get_schema(schema_id)
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")
    
    return schema.model_dump()


@app.post("/api/ai/schemas/{schema_id}/activate")
async def activate_schema(schema_id: str):
    """Set a schema as active"""
    try:
        schema_manager.set_active_schema(schema_id)
        return {"message": f"Schema {schema_id} activated"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/ai/usage-stats")
async def get_usage_stats():
    """Get LLM usage statistics"""
    return llm_adapter.get_usage_stats()


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting AI Service on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )
