# AI-Assisted Proposal & Document Intelligence Platform

> **Schema-Driven, Rule-Enforced Proposal Generation from Real User Input**

A comprehensive platform that enables users to create structured business proposals from survey notes with AI assistance, while maintaining strict governance controls through admin-defined schemas and rules.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Codebase Architecture](#codebase-architecture)
- [AI Approach](#ai-approach)
  - [Prompt & Orchestration Strategy](#prompt--orchestration-strategy)
  - [How SOPs are Incorporated](#how-sops-are-incorporated)
  - [Limitations and Next Steps](#limitations-and-next-steps)
- [Quality of AI Integration](#quality-of-ai-integration)
- [Structure and Clarity of Outputs](#structure-and-clarity-of-outputs)
- [Explainability](#explainability)
- [Workflow Alignment](#workflow-alignment)
- [Safety and Control Design](#safety-and-control-design)
- [Main Routes](#main-routes)
  - [User Routes](#user-routes)
  - [Admin Routes](#admin-routes)
  - [AI Service Routes](#ai-service-routes)
  - [Backend API Routes](#backend-api-routes)
- [Getting Started](#getting-started)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)

---

## Overview

The AI-Assisted Proposal & Document Intelligence Platform is NOT a simple prompting service. It is a **schema-driven, rule-enforced content generation protocol** where:

1. **Admins define schemas** with sections and rules that MUST be followed
2. **Rules are STRICTLY ENFORCED** - not suggestions, but hard constraints
3. **AI generates content** based on REAL user survey notes (no mock data)
4. **Backend validates** all AI outputs against rules before saving
5. **Users maintain control** over all final decisions and edits


---

## Codebase Architecture

```
ai-proposal-platform/
│
├── packages/
│   ├── frontend/                    # Next.js/React Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── admin/          # Admin Portal
│   │   │   │   │   ├── dashboard/  # Admin dashboard
│   │   │   │   │   ├── proposals/  # Proposal review & management
│   │   │   │   │   ├── schemas/    # Schema creation & management
│   │   │   │   │   └── users/      # User management
│   │   │   │   ├── user/           # User Portal
│   │   │   │   │   ├── dashboard/  # User dashboard
│   │   │   │   │   └── proposals/  # Proposal creation & editing
│   │   │   │   └── login/          # Unified login page
│   │   │   ├── contexts/           # Auth contexts (Admin & User)
│   │   │   └── lib/                # Utilities (toast, auth)
│   │   └── public/                 # Static assets
│   │
│   ├── backend/                     # Node.js/Express Backend
│   │   ├── src/
│   │   │   ├── routes/             # API route handlers
│   │   │   │   ├── auth.routes.ts  # Authentication endpoints
│   │   │   │   ├── proposal.routes.ts  # Proposal CRUD
│   │   │   │   ├── schema.routes.ts    # Schema management
│   │   │   │   └── user.routes.ts      # User management
│   │   │   ├── services/           # Business logic
│   │   │   │   ├── auth.service.ts     # Auth logic
│   │   │   │   ├── proposal.service.ts # Proposal logic
│   │   │   │   └── ai.service.ts       # AI service client
│   │   │   ├── middleware/         # Express middleware
│   │   │   │   ├── auth.middleware.ts  # JWT validation
│   │   │   │   └── errorHandler.ts     # Error handling
│   │   │   ├── db/                 # Database layer
│   │   │   │   ├── migrations/     # Database migrations
│   │   │   │   ├── seeds/          # Seed data
│   │   │   │   └── index.ts        # Knex configuration
│   │   │   └── utils/              # Utilities
│   │   │       └── logger.ts       # Winston logger
│   │   └── storage/                # File uploads
│   │
│   └── ai-service/                  # Python/FastAPI AI Service
│       ├── main.py                  # FastAPI application
│       ├── llm_adapter.py           # LLM API client (Groq/OpenAI)
│       ├── rule_engine.py           # Rule enforcement engine
│       ├── prompt_engineering.py    # Prompt creation
│       ├── schema_manager.py        # Schema management
│       └── requirements.txt         # Python dependencies
│
├── .kiro/specs/                     # Specification documents
│   └── ai-proposal-platform/
│       ├── requirements.md          # Requirements specification
│       ├── design.md                # Design document
│       └── tasks.md                 # Implementation tasks
│
└── docs/                            # Documentation
    ├── IMPLEMENTATION_STATUS.md     # Current status
    ├── API_INTEGRATION_GUIDE.md     # API integration guide
    └── [other documentation files]
```


---

## AI Approach

### Prompt & Orchestration Strategy

**Location:** [`packages/ai-service/prompt_engineering.py`](packages/ai-service/prompt_engineering.py)

The platform uses a **structured prompt engineering approach** that:

1. **Schema-Driven Prompts**: Each section type (Executive Summary, Scope of Work, Timeline, Pricing) has a dedicated prompt template
2. **Rule Injection**: Admin-defined rules are injected into system messages as MUST-FOLLOW constraints
3. **Real Data Processing**: All prompts process REAL user survey notes - no mock or placeholder data
4. **Structured Output**: LLM responses are formatted as JSON with:
   - `content`: Generated text
   - `confidence`: Score (0.0-1.0) indicating data quality
   - `rationale`: Explanation of how survey notes support the content
   - `sources`: Specific references from survey notes
   - `missing_info`: List of information not found in survey notes

**Orchestration Flow:**
```
User Survey Notes → Schema Selection → Section-by-Section Generation
                                    ↓
                            Rule Enforcement → Validation → Storage
```

**Key Files:**
- [`packages/ai-service/main.py`](packages/ai-service/main.py) - Main orchestration logic
- [`packages/ai-service/prompt_engineering.py`](packages/ai-service/prompt_engineering.py) - Prompt templates
- [`packages/ai-service/llm_adapter.py`](packages/ai-service/llm_adapter.py) - LLM API client

### How SOPs are Incorporated

**Location:** [`packages/ai-service/schema_manager.py`](packages/ai-service/schema_manager.py)

SOPs (Standard Operating Procedures) are implemented as **admin-defined rules** that are STRICTLY ENFORCED:

1. **Schema Definition**: Admins create schemas with sections and rules
   - File: [`packages/frontend/src/app/admin/schemas/create/page.tsx`](packages/frontend/src/app/admin/schemas/create/page.tsx)

2. **Rule Types**:
   - **Length**: Min/max character constraints
   - **Pattern**: Regex pattern matching
   - **Required Field**: Must contain specific keywords
   - **Validation**: Custom validation logic
   - **Format**: Structured format requirements (list, itemized, phases)
   - **Constraint**: Hard business constraints

3. **Enforcement Levels**:
   - **Strict**: MUST pass - blocks approval if violated
   - **Warning**: Can proceed with warning displayed
   - **Advisory**: Suggestion only - doesn't block

4. **Rule Enforcement Process**:
   ```
   LLM Generates Content → Rule Engine Validates → Pass/Fail Decision
                                                  ↓
                                    Violations Logged → Admin Review
   ```

**Key Files:**
- [`packages/ai-service/rule_engine.py`](packages/ai-service/rule_engine.py) - Rule enforcement logic
- [`packages/ai-service/schema_manager.py`](packages/ai-service/schema_manager.py) - Schema & rule management
- [`packages/backend/src/routes/schema.routes.ts`](packages/backend/src/routes/schema.routes.ts) - Schema API

### Limitations and Next Steps

**Current Limitations:**

1. **Single LLM Provider**: Currently uses Groq/OpenAI - no automatic fallback
2. **Sequential Generation**: Sections generated one-by-one (not parallel)
3. **Limited Multi-Modal**: Text-only processing (images/PDFs not yet integrated)
4. **No Real-Time Collaboration**: Single-user editing only
5. **Basic Confidence Scoring**: Simple heuristics (needs ML-based scoring)

**Next Steps:**

1. **Multi-Provider Fallback**: Implement automatic fallback between OpenAI, Groq, Azure
2. **Parallel Generation**: Generate multiple sections concurrently
3. **Multi-Modal Input**: Process images, PDFs, and documents from survey attachments
4. **Advanced Confidence Scoring**: ML-based scoring using survey note quality metrics
5. **Real-Time Collaboration**: WebSocket-based multi-user editing
6. **Caching Layer**: Cache common rule outputs and schema definitions
7. **A/B Testing**: Test different prompt strategies for better outputs


---

## Quality of AI Integration

### Real API Calls - No Mocks

**Location:** [`packages/ai-service/llm_adapter.py`](packages/ai-service/llm_adapter.py)

- ✅ **100% Real LLM API Calls**: All calls use actual Groq/OpenAI APIs
- ✅ **No Mock Data**: All survey notes come from real user input
- ✅ **Retry Logic**: Exponential backoff with 3 retry attempts
- ✅ **Token Tracking**: Tracks token usage and estimated costs
- ✅ **Timeout Handling**: 30-second timeout with graceful failure
- ✅ **Error Handling**: Comprehensive error handling with logging

**Test Results:**
- Average generation time: 4.06 seconds for 4-section proposal
- Token usage: ~500 tokens per section
- Cost: $0.0002 per generation (Groq)
- Success rate: 100% in testing

### Schema-Driven Architecture

**Location:** [`packages/ai-service/schema_manager.py`](packages/ai-service/schema_manager.py)

- ✅ **Admin-Defined Schemas**: Admins create schemas with sections and rules
- ✅ **Version Control**: Schemas have version numbers for tracking
- ✅ **Validation**: Schemas validated before activation
- ✅ **Multiple Schemas**: Support for multiple schemas per organization
- ✅ **Active Schema**: One active schema at a time per user

### Rule Enforcement

**Location:** [`packages/ai-service/rule_engine.py`](packages/ai-service/rule_engine.py)

- ✅ **Strict Enforcement**: Rules are NOT suggestions - they are enforced
- ✅ **Violation Tracking**: All violations logged with severity
- ✅ **Pass/Fail Logic**: Strict violations block approval
- ✅ **Transformation Support**: Rules can transform content
- ✅ **Detailed Reporting**: Violations include rule ID, message, and details

---

## Structure and Clarity of Outputs

### Structured JSON Responses

**Location:** [`packages/ai-service/main.py`](packages/ai-service/main.py) - `DraftGenerationResponse`

All AI outputs follow a consistent structure:

```json
{
  "draft_id": "uuid",
  "proposal_id": "uuid",
  "schema_id": "uuid",
  "schema_version": "1.0.0",
  "sections": [
    {
      "type": "executive_summary",
      "content": "Generated content...",
      "confidence_score": 0.85,
      "rationale": "Based on survey notes...",
      "source_references": ["Quote from survey"],
      "missing_info": ["Budget details"],
      "order": 1,
      "rule_enforcement": {
        "passed": true,
        "violations": [],
        "warnings": [],
        "advisories": []
      }
    }
  ],
  "model_version": "llama-3.3-70b-versatile",
  "rules_enforced": 15,
  "token_usage": 2000,
  "estimated_cost": 0.0002,
  "processing_time": 4.06,
  "all_rules_passed": true
}
```

### Section-Level Clarity

Each section includes:
- **Content**: The generated text
- **Confidence Score**: How well survey notes support the content
- **Rationale**: Explanation of generation logic
- **Source References**: Specific quotes from survey notes
- **Missing Info**: What information was not found
- **Rule Enforcement**: Pass/fail status with violations

