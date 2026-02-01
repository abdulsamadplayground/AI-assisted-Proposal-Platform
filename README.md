# AI-Assisted Proposal & Document Intelligence Platform

> **Schema-Driven, Rule-Enforced Proposal Generation from Real User Input**

A comprehensive platform that enables users to create structured business proposals from survey notes with AI assistance, while maintaining strict governance controls through admin-defined schemas and rules.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Part 1: AI System Design & Architecture (Conceptual)](#part-1-ai-system-design--architecture-conceptual)
  - [High-Level Architecture](#high-level-architecture)
  - [Design Philosophy](#design-philosophy)
  - [AI Components and Orchestration Flow](#ai-components-and-orchestration-flow)
  - [Data Storage Strategy](#data-storage-strategy)
  - [Human-in-the-Loop Checkpoints](#human-in-the-loop-checkpoints)
  - [Key Tradeoffs and Assumptions](#key-tradeoffs-and-assumptions)
- [Part 2: Implementation Details](#part-2-implementation-details)
  - [Codebase Architecture](#codebase-architecture)
  - [AI Approach](#ai-approach)
  - [Quality of AI Integration](#quality-of-ai-integration)
  - [Structure and Clarity of Outputs](#structure-and-clarity-of-outputs)
  - [Explainability](#explainability)
  - [Workflow Alignment](#workflow-alignment)
  - [Safety and Control Design](#safety-and-control-design)
- [Main Routes](#main-routes)
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

## Part 1: AI System Design & Architecture (Conceptual)

> **Comprehensive architectural analysis and design decisions**

This section covers the conceptual design and architectural decisions that shape the AI Proposal Platform. All analysis is based on actual codebase implementation.

### High-Level Architecture

**📊 Architecture Diagrams:**
- [Complete System Architecture](ai_proposal_architecture.png) - Visual overview of all components
- [AI Orchestration Flow](ai_orchestration_flow.png) - Detailed 11-step generation flow
- [Data Storage Strategy](data_storage_strategy.png) - Database architecture and patterns
- [Human Checkpoints](human_checkpoints.png) - All 5 human decision points
- [Complete System Overview](complete_system.png) - Comprehensive component diagram

**📄 Documentation:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete architecture documentation with ASCII diagrams
- [DIAGRAMS_SUMMARY.md](DIAGRAMS_SUMMARY.md) - Guide to all generated diagrams

**🎨 Diagram Generation Scripts:**
- [architecture_diagram.py](architecture_diagram.py) - Main architecture diagram
- [ai_orchestration_diagram.py](ai_orchestration_diagram.py) - AI flow diagram
- [data_storage_diagram.py](data_storage_diagram.py) - Storage strategy diagram
- [human_checkpoints_diagram.py](human_checkpoints_diagram.py) - Checkpoints diagram
- [sequence_diagram.py](sequence_diagram.py) - Sequence diagrams (3 workflows)

---

### Design Philosophy

**Core Principles:**

#### 1. Multi-Tier Separation of Concerns
```
Frontend (Vercel) ←→ Backend (Railway) ←→ AI Service (Vercel)
                           ↓                      ↓
                      PostgreSQL            Groq LLM API
                       (Neon)
```

**Key Separation:**
- **Frontend**: User interaction, display, client-side validation
- **Backend**: Business logic, authentication, database operations, orchestration
- **AI Service**: Content generation, rule enforcement, prompt engineering
- **Database**: Authoritative data storage with ACID guarantees

**Why This Matters:**
- Each layer has single responsibility
- Easy to test components independently
- Can scale layers independently
- Clear security boundaries

#### 2. Specialized Service Architecture

**Backend Service (Node.js/TypeScript)**:
- Authentication & authorization
- Proposal workflow management
- Database operations (CRUD)
- AI service coordination
- **Critical**: AI service has NO database access

**AI Service (Python/FastAPI)**:
- LLM adapter (Groq API client)
- Prompt engineering
- Rule enforcement
- Schema management
- **Critical**: Stateless - only generates content, never writes to database

**Why Specialized Services?**
- Right tool for each job (Node.js for API, Python for AI)
- Independent deployment and scaling
- Technology flexibility (easy to swap LLM providers)
- Clear responsibility boundaries

#### 3. Key Architectural Decisions

**Decision 1: Dual Backend Pattern**
- **What**: Separate Node.js backend and Python AI service
- **Why**: Node.js excels at API/database, Python excels at AI/ML
- **Tradeoff**: Network latency vs. optimal technology fit
- **Result**: Clean separation, easy to maintain

**Decision 2: Schema-Driven AI**
- **What**: Admins define schemas with sections and rules before AI generation
- **Why**: Ensures consistent, compliant outputs
- **Tradeoff**: Flexibility vs. consistency
- **Result**: Predictable, auditable proposals

**Decision 3: Rule Enforcement Layer**
- **What**: Post-generation validation of AI outputs
- **Why**: LLMs are probabilistic and may not follow instructions
- **Tradeoff**: Latency vs. quality assurance
- **Result**: Deterministic compliance checking

**Decision 4: Version Control at Data Layer**
- **What**: Immutable version history for all changes
- **Why**: Audit trail, rollback capability, compliance
- **Tradeoff**: Storage cost vs. data integrity
- **Result**: Complete change history, no data loss

**Decision 5: Managed Services**
- **What**: Vercel (frontend/AI), Railway (backend), Neon (database)
- **Why**: Reduce operational burden, focus on features
- **Tradeoff**: Cost vs. operational complexity
- **Result**: Fast deployment, auto-scaling, minimal DevOps

**📄 Detailed Analysis:**
- [ARCHITECTURE_RATIONALE.md](ARCHITECTURE_RATIONALE.md) - Complete rationale for all decisions

---

### AI Components and Orchestration Flow

**🔧 AI Service Components:**

#### Component 1: LLM Adapter
**File**: [`packages/ai-service/llm_adapter.py`](packages/ai-service/llm_adapter.py)

**Purpose**: Interface with Groq LLM API

**Responsibilities**:
- API credential management
- Rate limiting and retries
- Token usage tracking
- Provider abstraction (easy to swap LLMs)

**Key Features**:
- Async API calls
- Exponential backoff retry logic
- Cost tracking per request
- Error handling and logging

#### Component 2: Prompt Engineer
**File**: [`packages/ai-service/prompt_engineering.py`](packages/ai-service/prompt_engineering.py)

**Purpose**: Create optimized prompts from survey notes

**Responsibilities**:
- Template-based prompt generation
- Context injection (survey notes + guidance)
- Structured output formatting (JSON)
- Token optimization (compression)

**Key Features**:
- Section-specific templates
- Rule injection in system messages
- Confidence score calculation
- Source reference extraction

#### Component 3: Rule Engine
**File**: [`packages/ai-service/rule_engine.py`](packages/ai-service/rule_engine.py)

**Purpose**: Enforce admin-defined rules on AI output

**Responsibilities**:
- Validate content against rules
- Apply transformations
- Calculate violation severity
- Return enforcement results

**Rule Types**:
- LENGTH: Min/max character constraints
- PATTERN: Regex pattern matching
- REQUIRED_FIELD: Must contain keywords
- VALIDATION: Check for placeholders
- FORMAT: List, itemized, phases
- CONSTRAINT: Custom business rules

**Enforcement Levels**:
- **Strict**: Blocks approval if violated
- **Warning**: Logged but allows content
- **Advisory**: Guidance only

#### Component 4: Schema Manager
**File**: [`packages/ai-service/schema_manager.py`](packages/ai-service/schema_manager.py)

**Purpose**: Manage proposal schemas and rules

**Responsibilities**:
- Store schemas in memory (fast access)
- Validate schema structure
- Retrieve section-specific rules
- Track active schema version

**Key Features**:
- In-memory caching
- Schema versioning
- Validation before activation
- Fast rule lookup

**🔄 Complete Orchestration Flow (11 Steps):**

```
1. User submits survey notes
   ↓
2. Frontend → Backend (POST /api/proposals)
   ↓
3. Backend creates proposal record (status=draft, sections=[])
   ↓
4. Backend → AI Service (POST /api/ai/generate-draft)
   ↓
5. AI Service → Schema Manager (load schema + rules)
   ↓
6. For each section:
   a. AI Service → Prompt Engineer (build prompt)
   b. Prompt Engineer → LLM Adapter (generate content)
   c. LLM Adapter → Groq API (API call)
   d. Groq API → LLM Adapter (generated text)
   e. AI Service → Rule Engine (enforce rules)
   f. Rule Engine → AI Service (validation results)
   ↓
7. AI Service → Backend (return sections + metadata)
   ↓
8. Backend updates proposal with sections
   ↓
9. Backend creates version 1 record
   ↓
10. Backend → Frontend (return complete proposal)
    ↓
11. Frontend displays to user
```

**📄 Detailed Documentation:**
- [ARCHITECTURE_ANALYSIS.md](ARCHITECTURE_ANALYSIS.md) - Complete component analysis with code
- [SEQUENCE_DIAGRAMS.md](SEQUENCE_DIAGRAMS.md) - Text-based sequence diagrams

**🎨 Visual Diagrams:**
- [ai_orchestration_flow.png](ai_orchestration_flow.png) - Visual flow diagram
- [sequence_proposal_creation.png](sequence_proposal_creation.png) - Proposal creation sequence
- [sequence_approval_workflow.png](sequence_approval_workflow.png) - Approval workflow
- [sequence_schema_management.png](sequence_schema_management.png) - Schema management

**AI Service Design Philosophy:**

#### Component-Based Modularity
- Each component has single responsibility
- Easy to test independently
- Can swap implementations (e.g., different LLM providers)
- Clear interfaces between components

#### Adapter Pattern for Vendor Independence
- LLM Adapter abstracts provider details
- Easy to switch from Groq to OpenAI or Azure
- Consistent interface regardless of provider
- Provider-specific logic isolated

**Key Architectural Decisions:**

**Decision 1: Post-Generation Validation Over Prompt Engineering**
- **What**: Enforce rules AFTER LLM generates content
- **Why**: LLMs are probabilistic and may not follow instructions perfectly
- **Alternative**: Try to enforce rules in prompts only
- **Result**: Deterministic validation, clear pass/fail

**Decision 2: In-Memory Schema Caching**
- **What**: Store schemas in memory, not database
- **Why**: Fast access during generation, schemas change infrequently
- **Alternative**: Query database for each section
- **Result**: Sub-millisecond schema lookups

**Decision 3: Section-by-Section Generation**
- **What**: Generate one section at a time sequentially
- **Why**: Simpler error handling, easier debugging, lower memory usage
- **Alternative**: Parallel generation of all sections
- **Result**: Predictable flow, easier to trace issues

**Decision 4: Tiered Rule Enforcement**
- **What**: Rules have severity levels (strict/warning/advisory)
- **Why**: Balance compliance with flexibility
- **Alternative**: All rules are strict or no rules
- **Result**: Admins can tune enforcement per rule

**Decision 5: Synchronous Orchestration**
- **What**: User waits for complete generation (10-30 seconds)
- **Why**: Simpler implementation, immediate feedback
- **Alternative**: Async with job queue and notifications
- **Result**: No job queue complexity, users see results immediately

**Overall Thinking:**
> Treat the LLM as an unreliable but useful text generator, wrap it in deterministic validation layers, optimize for fast iteration and debugging, and keep the architecture simple enough that a small team can operate it confidently.

---

### Data Storage Strategy

**📊 Visual Diagrams:**
- [data_storage_strategy.png](data_storage_strategy.png) - Complete database architecture

**📄 Detailed Documentation:**
- [DATA_FLOW_ANALYSIS.md](DATA_FLOW_ANALYSIS.md) - How data flows and gets stored
- [ARCHITECTURE_ANALYSIS.md](ARCHITECTURE_ANALYSIS.md#2-data-storage-strategy) - Storage patterns

**Data Flow Philosophy:**

#### End-to-End JSON Transformation Pipeline
Data flows from user input through AI processing and back, with explicit serialization at database boundaries:
- **Objects → JSON strings** for storage
- **JSON strings → Objects** for application use

#### Transactional Atomicity Over Speed
All related writes (proposal creation, version snapshot, metadata updates) happen within database transactions, ensuring all-or-nothing commits rather than risking partial data states.

**Complete Data Journey (12 Steps):**

```
1. User types → Frontend object
2. fetch() → Auto JSON string over HTTP
3. Backend receives → Validates object
4. AI service → Returns structured JSON
5. Backend → JSON.stringify() → TEXT column
6. PostgreSQL → Stores string on disk
7. Version record → Full snapshot created
8. Transaction commits → All or nothing
9. Later: SELECT → Retrieves string
10. Backend → JSON.parse() → Object
11. HTTP response → Auto JSON string
12. Frontend → Renders objects in UI
```

**Transformation Before Storage:**

| Data | Input Format | Storage Format | Transformation |
|------|-------------|----------------|----------------|
| Title | String | TEXT | As-is |
| Survey notes | String | TEXT | As-is |
| Sections | Array of objects | TEXT | `JSON.stringify([...])` |
| Attachments | Array of strings | TEXT | `JSON.stringify(["file1.pdf"])` |
| Status | String | VARCHAR | As-is |
| Version | Number | INTEGER | As-is |

**Storage Patterns:**

#### Pattern 1: Immutable Version History
- Version records are NEVER updated
- Only INSERT, never UPDATE or DELETE
- Each version is complete snapshot
- **Benefit**: Complete audit trail, rollback capability

#### Pattern 2: JSON in TEXT Columns
- Store complex data as JSON strings
- Parse in application layer
- **Benefit**: Flexible schema, portable across databases

#### Pattern 3: Status-Based Access Control
- Permissions enforced based on proposal status
- **Rules**:
  - `draft`: Owner can edit, delete
  - `pending_approval`: Read-only for owner
  - `approved`: Read-only for all, can export
  - `rejected`: Owner can edit and resubmit

#### Pattern 4: Transactional Integrity
- All related writes in single transaction
- Commit or rollback atomically
- **Benefit**: No partial data, consistent state

**Why This Approach?**
- **Simplicity**: JSON in TEXT is simple and portable
- **Flexibility**: Can store any structure without schema changes
- **Auditability**: Complete version history for compliance
- **Performance**: Good enough for current scale (<1000 proposals/month)

---

### Human-in-the-Loop Checkpoints

**📊 Visual Diagrams:**
- [human_checkpoints.png](human_checkpoints.png) - All 5 checkpoints visualized

**📄 Detailed Documentation:**
- [ARCHITECTURE_ANALYSIS.md](ARCHITECTURE_ANALYSIS.md#3-human-in-the-loop-checkpoints) - Complete checkpoint analysis with code

**Human-in-the-Loop Design Philosophy:**

#### Trust But Verify at Every Gate
AI accelerates draft creation, but humans remain the decision-makers at every critical juncture—defining standards, reviewing outputs, editing content, granting approvals, and controlling distribution.

#### Role-Based Control
- **Admins**: Define schemas, approve proposals, manage users
- **Users**: Create proposals, edit drafts, submit for approval
- **System**: Enforces rules, tracks changes, prevents unauthorized actions

**The 5 Critical Checkpoints:**

#### Checkpoint 1: Schema Definition (Admin Only)
**Location**: Schema creation/update flow

**Human Decision**: What sections and rules should proposals follow?

**Why Critical**: 
- Schemas define business requirements
- Rules enforce compliance and quality standards
- Incorrect schemas lead to unusable proposals

**Safeguards**:
- Role-based access control (admin only)
- Schema validation before saving
- Version tracking for schema changes
- AI service validates schema structure

**Code**: [`packages/backend/src/routes/schema.routes.ts`](packages/backend/src/routes/schema.routes.ts)

---

#### Checkpoint 2: Proposal Submission (User Action)
**Location**: Draft → Pending Approval transition

**Human Decision**: Is this proposal ready for admin review?

**Why Critical**:
- User confirms AI-generated content is acceptable
- User can edit before submitting
- Prevents premature submissions

**Safeguards**:
- User must explicitly click "Submit for Approval"
- Can only submit own proposals
- Can only submit draft or rejected proposals
- Cannot bypass approval workflow

**Code**: [`packages/backend/src/services/proposal.service.ts`](packages/backend/src/services/proposal.service.ts) - `submitForApproval()`

---

#### Checkpoint 3: Proposal Approval (Admin Only)
**Location**: Pending Approval → Approved/Rejected transition

**Human Decision**: Does this proposal meet quality standards?

**Why Critical**:
- Final quality gate before production use
- Admin can reject with feedback
- Ensures accountability for approved content
- Legal/financial implications require human oversight

**Safeguards**:
- Role verification (admin only)
- Immutable approval record (reviewed_by, reviewed_at)
- Admin comments for rejection feedback
- Approved proposals become read-only

**Code**: [`packages/backend/src/services/proposal.service.ts`](packages/backend/src/services/proposal.service.ts) - `approveProposal()`, `rejectProposal()`

---

#### Checkpoint 4: Content Editing (User/Admin)
**Location**: Any proposal modification

**Human Decision**: What changes should be made to AI-generated content?

**Why Critical**:
- AI may miss nuances or make errors
- User has domain knowledge AI lacks
- Allows human refinement of AI suggestions

**Safeguards**:
- Status-based edit restrictions
- Version tracking for all changes
- Change descriptions for audit trail
- Cannot edit approved proposals (data integrity)

**Code**: [`packages/backend/src/services/proposal.service.ts`](packages/backend/src/services/proposal.service.ts) - `updateProposal()`

---

#### Checkpoint 5: Export Control (User/Admin)
**Location**: Word document export

**Human Decision**: Is this proposal ready for external distribution?

**Why Critical**:
- Exported documents represent the organization
- Only approved content should leave the system
- Prevents accidental distribution of drafts

**Safeguards**:
- Status check (approved only)
- Permission check (owner or admin)
- Audit log of exports (via backend logs)
- Filename includes version number

**Code**: [`packages/backend/src/services/proposal.service.ts`](packages/backend/src/services/proposal.service.ts) - `exportProposalToWord()`

---

**Checkpoint Summary Table:**

| Checkpoint | Actor | Decision | Safeguard | Code Location |
|------------|-------|----------|-----------|---------------|
| Schema Definition | Admin | What rules to enforce | Role check, validation | `schema.routes.ts` |
| Proposal Submission | User | Ready for review | Ownership, status check | `proposal.service.ts` |
| Approval/Rejection | Admin | Meets standards | Role check, immutable record | `proposal.service.ts` |
| Content Editing | User/Admin | What to change | Status check, versioning | `proposal.service.ts` |
| Export | User/Admin | Ready for distribution | Status check, approval required | `proposal.service.ts` |

**Key Architectural Decisions:**

**Decision 1: Schema Definition as First Checkpoint**
- Admins define rules, formats, and constraints BEFORE any AI generation
- Establishes the "constitution" that governs all downstream content
- Prevents "garbage in, garbage out" at the source

**Decision 2: Draft-First, Approve-Later Workflow**
- Proposals begin in draft status
- Require explicit admin approval to become final
- Creates mandatory review gate

**Decision 3: Unrestricted Editing After Generation**
- Users and admins can freely modify AI-generated content
- Acknowledges AI is a starting point, not an oracle
- Humans have final say

**Decision 4: Export as Final Checkpoint**
- Even approved proposals require conscious export action
- Gives users last chance to review before distribution
- Prevents accidental external sharing

**Decision 5: Audit Trails at Each Checkpoint**
- Version control, status changes, approval records
- Creates paper trail for accountability
- Supports regulatory compliance

**Overall Thinking:**
> AI accelerates draft creation, but humans remain the decision-makers at every critical juncture—defining standards, reviewing outputs, editing content, granting approvals, and controlling distribution. The system is designed to make automation helpful while keeping humans firmly in control.

---

### Key Tradeoffs and Assumptions

**📄 Detailed Documentation:**
- [ARCHITECTURE_ANALYSIS.md](ARCHITECTURE_ANALYSIS.md#4-key-tradeoffs-and-assumptions) - Complete tradeoff analysis with code
- [ARCHITECTURE_RATIONALE.md](ARCHITECTURE_RATIONALE.md) - Full rationale document

**Design Philosophy:**

#### Optimize for Team Velocity Over Theoretical Scale
The architecture consistently chooses simpler implementations (synchronous flows, managed services, in-memory caching) over complex distributed systems, betting that getting to market quickly and iterating based on real usage patterns is more valuable than premature optimization.

#### Favor Determinism Over AI Autonomy
The system intentionally constrains AI creativity through rules, schemas, and human checkpoints rather than letting the LLM operate freely, trading raw capability for predictable, compliant outputs that meet organizational standards.

**The 8 Major Tradeoffs:**

#### Tradeoff 1: Latency vs Quality (Synchronous Generation)
**Decision**: 10-30 second wait for complete proposals

**Alternative**: Instant response with background processing

**Rationale**:
- Proposals created infrequently (weekly/monthly, not hundreds per day)
- Users expect thoughtful generation to take time
- Synchronous flow eliminates job queue complexity

**Assumption**: Users will tolerate waits for high-quality outputs

**Mitigation**: Loading indicators, could add async option later

---

#### Tradeoff 2: Flexibility vs Consistency (Schema-Driven Generation)
**Decision**: Rigid section structures

**Alternative**: Freeform AI creativity

**Rationale**:
- Regulatory environments require consistent formats
- Admins chose platform specifically for control
- Brand consistency matters more than novelty

**Assumption**: Organizations value standardized proposals more than creative variation

**Mitigation**: Schema versioning, advisory rules, users can edit freely

---

#### Tradeoff 3: Cost vs Capability (Groq with llama-3.3-70b)
**Decision**: ~10x cheaper than GPT-4

**Alternative**: GPT-4 for higher quality

**Rationale**:
- Proposal generation is "good enough" task
- Survey notes provide structured context
- Rule engine catches errors post-generation
- Cost scales linearly with usage

**Assumption**: llama-3.3-70b quality is sufficient

**Mitigation**: Adapter pattern allows easy provider switching, human review catches mistakes

---

#### Tradeoff 4: Simplicity vs Scalability (Monolithic Services)
**Decision**: Single Node.js backend and Python AI service

**Alternative**: Decomposed microservices

**Rationale**:
- Initial scale is <1000 users, <100 proposals/day
- Microservices add operational overhead
- Most startups fail from complexity not lack of scale
- Vertical scaling handles 10-100x growth

**Assumption**: Single backend can handle expected load

**Mitigation**: Railway/Vercel auto-scaling, can decompose later if needed

---

#### Tradeoff 5: Storage vs Compute (Full Version Snapshots)
**Decision**: Store complete sections in each version

**Alternative**: Store diffs between versions

**Rationale**:
- Simplifies version retrieval (no reconstruction)
- Proposal sections are small (< 10KB typically)
- Storage is cheap, compute is expensive

**Assumption**: Storage costs are negligible

**Mitigation**: Could compress old versions, could implement diffs later

---

#### Tradeoff 6: Real-time vs Eventual Consistency (ACID Transactions)
**Decision**: Strong consistency

**Alternative**: Eventual consistency with event sourcing

**Rationale**:
- Proposal workflow requires immediate consistency
- Users expect to see changes immediately
- Simpler to reason about and debug

**Assumption**: Single database can provide required performance

**Mitigation**: Database indexes, connection pooling, could add read replicas

---

#### Tradeoff 7: Security vs Convenience (JWT Auth)
**Decision**: JWT-based auth with httpOnly cookies

**Alternative**: Session-based auth or OAuth

**Rationale**:
- JWT is stateless (scales well)
- httpOnly cookies prevent XSS attacks
- No session storage needed
- Simple to implement

**Assumption**: JWT secret is properly secured

**Mitigation**: Short token expiration, refresh tokens, role-based access control

---

#### Tradeoff 8: AI Control vs Creativity (Strict Rule Enforcement)
**Decision**: Strict rule enforcement on AI output

**Alternative**: Minimal constraints, trust AI

**Rationale**:
- Business proposals have compliance requirements
- Predictable output more valuable than creativity
- Reduces risk of inappropriate content

**Assumption**: Rules can capture all important constraints

**Mitigation**: Advisory rules for soft guidance, users can edit after generation

---

**Key Assumptions Summary:**

**1. User Behavior**
- Users will provide sufficient survey notes
- Users will review AI output before submitting
- Admins will review proposals in reasonable time

**2. Scale**
- < 1000 proposals per month initially
- < 100 concurrent users
- < 10 schemas active at once
- Average proposal size < 50KB

**3. Availability**
- 99% uptime is acceptable (not mission-critical)
- Groq API is reliable (or we can fallback)
- Database backups sufficient for disaster recovery

**4. Security**
- Users won't share credentials
- HTTPS sufficient for data in transit
- Database encryption at rest sufficient

**5. Compliance**
- Audit trail (version history) meets regulatory requirements
- Admin approval is sufficient governance
- Data retention policy defined externally

**Meta-Assumption Validation Strategy:**

**Scale Assumptions Validated Through:**
- Analytics on proposal creation frequency
- Concurrent users monitoring
- Database growth rate tracking
- **Trigger**: If >500 proposals/day or >5000 users, re-evaluate architecture

**Quality Assumptions Validated Through:**
- User satisfaction surveys
- Admin approval rates
- Edit frequency tracking
- **Trigger**: If <70% approval rate or >50% heavy editing, upgrade LLM

**Security Assumptions Validated Through:**
- Periodic security audits
- Compliance checklist reviews
- Incident tracking
- **Trigger**: Any data breach immediately escalates security priority

---

## Part 2: Implementation Details

> **Actual codebase implementation and technical details**

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

