# AI-Assisted Proposal & Document Intelligence Platform

> **Schema-Driven, Rule-Enforced Proposal Generation from Real User Input**

A comprehensive platform that enables users to create structured business proposals from survey notes with AI assistance, while maintaining strict governance controls through admin-defined schemas and rules.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Part 1: AI System Design & Architecture](#part-1-ai-system-design--architecture)
  - [High-Level Architecture](#high-level-architecture)
  - [Design Philosophy](#design-philosophy)
  - [AI Components and Orchestration](#ai-components-and-orchestration)
  - [Data Storage Strategy](#data-storage-strategy)
  - [Human-in-the-Loop Checkpoints](#human-in-the-loop-checkpoints)
  - [Key Tradeoffs](#key-tradeoffs)
- [Part 2: Implementation Details](#part-2-implementation-details)
  - [Codebase Architecture](#codebase-architecture)
  - [AI Integration](#ai-integration)
- [Part 3: AI Reasoning & Governance](#part-3-ai-reasoning--governance)
  - [AI Authority](#ai-authority)
  - [Explainability](#explainability)
  - [Data Integrity](#data-integrity)
  - [Failure Modes](#failure-modes)

---

## Overview

The AI-Assisted Proposal & Document Intelligence Platform is a **schema-driven, rule-enforced content generation protocol** where:

1. **Admins define schemas** with sections and rules that MUST be followed
2. **Rules are STRICTLY ENFORCED** - not suggestions, but hard constraints
3. **AI generates content** based on REAL user survey notes (no mock data)
4. **Backend validates** all AI outputs against rules before saving
5. **Users maintain control** over all final decisions and edits

---

## Part 1: AI System Design & Architecture

> **Comprehensive architectural analysis and design decisions**

**📊 Visual Resources:**
- [Complete System Architecture](ai_proposal_architecture.png)
- [AI Orchestration Flow](ai_orchestration_flow.png)
- [Data Storage Strategy](data_storage_strategy.png)
- [Human Checkpoints](human_checkpoints.png)
- [Sequence Diagrams](sequence_diagram.py)

**📄 Detailed Documentation:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete architecture with ASCII diagrams
- [ARCHITECTURE_ANALYSIS.md](ARCHITECTURE_ANALYSIS.md) - Component analysis with code
- [ARCHITECTURE_RATIONALE.md](ARCHITECTURE_RATIONALE.md) - Complete rationale
- [DATA_FLOW_ANALYSIS.md](DATA_FLOW_ANALYSIS.md) - Data flow and transformations
- [SEQUENCE_DIAGRAMS.md](SEQUENCE_DIAGRAMS.md) - Text-based sequence diagrams

---

### High-Level Architecture

```
Frontend (Vercel) ←→ Backend (Railway) ←→ AI Service (Vercel)
                           ↓                      ↓
                      PostgreSQL               LLM API
                       (Neon)                  (Groq)
```

**Key Separation:**
- **Frontend**: User interaction, display, client-side validation
- **Backend**: Business logic, authentication, database operations, orchestration
- **AI Service**: Content generation, rule enforcement, prompt engineering (NO database access)
- **Database**: Authoritative data storage with ACID guarantees

---

### Design Philosophy

**Core Principles:**

1. **Multi-Tier Separation of Concerns**: Each layer has single responsibility, easy to test independently, can scale independently

2. **Specialized Service Architecture**: Node.js for API/database, Python for AI/ML - right tool for each job

3. **Schema-Driven AI**: Admins define schemas before generation - ensures consistent, compliant outputs

4. **Rule Enforcement Layer**: Post-generation validation - LLMs are probabilistic, validation is deterministic

5. **Version Control at Data Layer**: Immutable version history - complete audit trail, rollback capability

6. **Managed Services**: Vercel/Railway/Neon - reduce operational burden, focus on features

**Overall Thinking:**
> Treat the LLM as an unreliable but useful text generator, wrap it in deterministic validation layers, optimize for fast iteration and debugging, and keep the architecture simple enough that a small team can operate it confidently.

---

### AI Components and Orchestration

**🔧 Four Core Components:**

1. **LLM Adapter** ([`llm_adapter.py`](packages/ai-service/llm_adapter.py))
   - Interface with Groq LLM API
   - Rate limiting, retries, token tracking
   - Provider abstraction (easy to swap LLMs)

2. **Prompt Engineer** ([`prompt_engineering.py`](packages/ai-service/prompt_engineering.py))
   - Template-based prompt generation
   - Context injection (survey notes + rules)
   - Structured JSON output formatting

3. **Rule Engine** ([`rule_engine.py`](packages/ai-service/rule_engine.py))
   - Enforce admin-defined rules on AI output
   - 6 rule types: LENGTH, PATTERN, REQUIRED_FIELD, VALIDATION, FORMAT, CONSTRAINT
   - 3 enforcement levels: Strict (blocks), Warning (logs), Advisory (suggests)

4. **Schema Manager** ([`schema_manager.py`](packages/ai-service/schema_manager.py))
   - In-memory schema caching
   - Schema versioning and validation
   - Fast rule lookup

**🔄 Orchestration Flow (11 Steps):**

```
1. User submits survey notes
2. Frontend → Backend (POST /api/proposals)
3. Backend creates proposal record (status=draft)
4. Backend → AI Service (POST /api/ai/generate-draft)
5. AI Service → Schema Manager (load schema + rules)
6. For each section:
   a. Prompt Engineer builds prompt
   b. LLM Adapter calls Groq API
   c. Rule Engine validates output
7. AI Service → Backend (return sections + metadata)
8. Backend updates proposal with sections
9. Backend creates version 1 record
10. Backend → Frontend (return complete proposal)
11. Frontend displays to user
```

**Key Decisions:**
- **Post-Generation Validation**: Enforce rules AFTER generation (deterministic vs. probabilistic)
- **In-Memory Schema Caching**: Fast access, schemas change infrequently
- **Section-by-Section Generation**: Simpler error handling, easier debugging
- **Tiered Rule Enforcement**: Balance compliance with flexibility
- **Synchronous Orchestration**: 10-30 second wait, simpler implementation

---

### Data Storage Strategy

**Data Flow Philosophy:**

**End-to-End JSON Transformation Pipeline**: Objects → JSON strings for storage → JSON strings → Objects for use

**Transactional Atomicity**: All related writes in single transaction - all-or-nothing commits

**Complete Data Journey:**
```
User Input → Frontend Object → HTTP (JSON) → Backend Validation
→ AI Generation → Backend JSON.stringify() → PostgreSQL TEXT Column
→ Version Snapshot → Transaction Commit → Later: SELECT → JSON.parse()
→ HTTP Response → Frontend Render
```

**Storage Patterns:**

1. **Immutable Version History**: Version records NEVER updated, only INSERT, complete snapshots
2. **JSON in TEXT Columns**: Flexible schema, portable across databases
3. **Status-Based Access Control**: `draft` (editable) → `pending_approval` (read-only) → `approved` (read-only, exportable) → `rejected` (editable)
4. **Transactional Integrity**: Commit or rollback atomically - no partial data

**Why This Approach?**
- Simplicity: JSON in TEXT is simple and portable
- Flexibility: Store any structure without schema changes
- Auditability: Complete version history for compliance
- Performance: Good enough for <1000 proposals/month

---

### Human-in-the-Loop Checkpoints

**Design Philosophy:**
> AI accelerates draft creation, but humans remain the decision-makers at every critical juncture—defining standards, reviewing outputs, editing content, granting approvals, and controlling distribution.

**The 5 Critical Checkpoints:**

| # | Checkpoint | Actor | Decision | Safeguard | Code |
|---|------------|-------|----------|-----------|------|
| 1 | **Schema Definition** | Admin | What rules to enforce | Role check, validation | [`schema.routes.ts`](packages/backend/src/routes/schema.routes.ts) |
| 2 | **Proposal Submission** | User | Ready for review | Ownership, status check | [`proposal.service.ts`](packages/backend/src/services/proposal.service.ts) |
| 3 | **Approval/Rejection** | Admin | Meets standards | Role check, immutable record | [`proposal.service.ts`](packages/backend/src/services/proposal.service.ts) |
| 4 | **Content Editing** | User/Admin | What to change | Status check, versioning | [`proposal.service.ts`](packages/backend/src/services/proposal.service.ts) |
| 5 | **Export Control** | User/Admin | Ready for distribution | Status check, approval required | [`proposal.service.ts`](packages/backend/src/services/proposal.service.ts) |

**Key Decisions:**
- Schema definition BEFORE generation (prevents "garbage in, garbage out")
- Draft-first, approve-later workflow (mandatory review gate)
- Unrestricted editing after generation (AI is starting point, not oracle)
- Export as final checkpoint (prevents accidental external sharing)
- Audit trails at each checkpoint (accountability and compliance)

---

### Key Tradeoffs

**Design Philosophy:**
> Optimize for team velocity over theoretical scale. Favor determinism over AI autonomy.

**The 8 Major Tradeoffs:**

1. **Latency vs Quality**: 10-30 second wait for complete proposals (synchronous) vs. instant response (async)
   - **Choice**: Synchronous - simpler, immediate feedback, no job queue complexity

2. **Flexibility vs Consistency**: Rigid section structures (schema-driven) vs. freeform AI creativity
   - **Choice**: Schema-driven - regulatory compliance, brand consistency

3. **Cost vs Capability**: Groq/llama-3.3-70b (~10x cheaper) vs. GPT-4 (higher quality)
   - **Choice**: Groq - "good enough" quality, adapter pattern allows easy switching

4. **Simplicity vs Scalability**: Monolithic services vs. decomposed microservices
   - **Choice**: Monolithic - <1000 users initially, vertical scaling handles 10-100x growth

5. **Storage vs Compute**: Full version snapshots vs. diffs between versions
   - **Choice**: Full snapshots - simpler retrieval, storage is cheap

6. **Real-time vs Eventual Consistency**: ACID transactions vs. event sourcing
   - **Choice**: ACID - immediate consistency, simpler to debug

7. **Security vs Convenience**: JWT auth with httpOnly cookies vs. session-based auth
   - **Choice**: JWT - stateless, scales well, prevents XSS

8. **AI Control vs Creativity**: Strict rule enforcement vs. minimal constraints
   - **Choice**: Strict enforcement - compliance requirements, predictable output

**Key Assumptions:**
- Users provide sufficient survey notes and review AI output
- <1000 proposals/month, <100 concurrent users, <10 active schemas
- 99% uptime acceptable, Groq API reliable
- Audit trail meets regulatory requirements

**Validation Triggers:**
- If >500 proposals/day or >5000 users → re-evaluate architecture
- If <70% approval rate or >50% heavy editing → upgrade LLM
- Any data breach → escalate security priority

---

## Part 2: Implementation Details

### Codebase Architecture

```
ai-proposal-platform/
├── packages/
│   ├── frontend/                    # Next.js/React Frontend
│   │   ├── src/app/
│   │   │   ├── admin/              # Admin Portal (dashboard, proposals, schemas, users)
│   │   │   ├── user/               # User Portal (dashboard, proposals)
│   │   │   └── login/              # Unified login
│   │   ├── contexts/               # Auth contexts
│   │   └── lib/                    # Utilities (toast, auth, api)
│   │
│   ├── backend/                     # Node.js/Express Backend
│   │   ├── src/
│   │   │   ├── routes/             # API route handlers (auth, proposal, schema, user)
│   │   │   ├── services/           # Business logic (auth, proposal, ai)
│   │   │   ├── middleware/         # Express middleware (auth, error, logging)
│   │   │   ├── db/                 # Database layer (migrations, seeds)
│   │   │   └── utils/              # Utilities (logger)
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
└── docs/                            # Documentation & diagrams
```

---

### AI Integration

**Prompt & Orchestration Strategy** ([`prompt_engineering.py`](packages/ai-service/prompt_engineering.py))

1. **Schema-Driven Prompts**: Each section type has dedicated template
2. **Rule Injection**: Admin rules injected as MUST-FOLLOW constraints
3. **Real Data Processing**: All prompts use REAL user survey notes
4. **Structured Output**: JSON with content, confidence, rationale, sources, missing_info

**SOPs as Admin-Defined Rules** ([`schema_manager.py`](packages/ai-service/schema_manager.py))

- **Rule Types**: Length, Pattern, Required Field, Validation, Format, Constraint
- **Enforcement Levels**: Strict (blocks), Warning (logs), Advisory (suggests)
- **Process**: LLM Generates → Rule Engine Validates → Pass/Fail → Admin Review

**Quality Metrics** ([`llm_adapter.py`](packages/ai-service/llm_adapter.py))

- ✅ LLM API Calls (Groq/OpenAI)
- ✅ Retry Logic - exponential backoff, 3 attempts
- ✅ Token Tracking - usage and cost estimation
- ✅ Average: 4.06s generation, ~500 tokens/section, $0.0002/proposal

**Structured JSON Response:**

```json
{
  "sections": [{
    "type": "executive_summary",
    "content": "Generated text...",
    "confidence_score": 0.85,
    "rationale": "Based on survey notes...",
    "source_references": ["Quote from survey"],
    "missing_info": ["Budget details"],
    "rule_enforcement": {
      "passed": true,
      "violations": [],
      "warnings": [],
      "advisories": []
    }
  }],
  "all_rules_passed": true,
  "token_usage": 2000,
  "estimated_cost": 0.0002
}
```

**Current Limitations & Next Steps:**

**Limitations**: Single LLM provider, sequential generation, text-only, single-user editing, basic confidence scoring

**Next Steps**: Multi-provider fallback, parallel generation, multi-modal input, real-time collaboration, ML-based confidence scoring, caching layer, A/B testing

---

## Part 3: AI Reasoning & Governance

> **Governance model ensuring AI augments human decision-making rather than replacing it**

**📄 Complete Analysis:** [AI_GOVERNANCE_ANALYSIS.md](AI_GOVERNANCE_ANALYSIS.md)

---

### AI Authority

**Which parts should never be fully automated?**

**Final approval decisions must remain human-controlled.** Strict status workflow (`draft` → `pending_approval` → `approved/rejected`) where only admins can approve/reject. AI generates content but cannot change status or write to database—it only returns sections to backend, which handles all database operations. This ensures humans retain authority over official, binding documentation with legal/financial implications.

**Schema and rule definition must remain admin-controlled.** AI enforces rules but doesn't create them. Admins define schemas via `/api/schemas` with role-based access control. This prevents AI from changing its own rules and ensures business logic remains under human control. System requires explicit user action to submit proposals—users must click "Submit for Approval" rather than automatic submission.

**Key Files:**
- [`proposal.service.ts`](packages/backend/src/services/proposal.service.ts) - Approval/rejection/submission logic
- [`schema.routes.ts`](packages/backend/src/routes/schema.routes.ts) - Admin-only schema endpoints
- [`main.py`](packages/ai-service/main.py) - AI service with no database access

**Design Principle:**
> AI suggests, humans decide—especially for approval, schema definition, and final distribution.

---

### Explainability

**How to make AI outputs understandable and trustworthy?**

**Structured explainability metadata for each section:**

1. **Confidence Score** (0.0-1.0): How well survey notes support content
2. **Rationale**: Which parts of survey notes influenced response
3. **Source References**: Specific quotes from survey notes
4. **Missing Info**: Critical information not found in input

**Rule enforcement transparency:**
- `rule_enforcement` object shows which rules passed/failed
- Violation details with severity levels (strict/warning/advisory)
- `all_rules_passed` boolean for immediate compliance visibility
- Immutable version tracking traces content evolution

**Example:**
```json
{
  "confidence_score": 0.85,
  "rationale": "Based on survey notes indicating...",
  "source_references": ["Quote: '...'"],
  "missing_info": ["Budget details"],
  "rule_enforcement": {
    "passed": true,
    "warnings": ["Could be more concise"]
  }
}
```

**Key Files:**
- [`main.py`](packages/ai-service/main.py) - DraftSection model with metadata
- [`rule_engine.py`](packages/ai-service/rule_engine.py) - Violation tracking
- [`20260131000004_create_proposal_versions_table.ts`](packages/backend/src/db/migrations/20260131000004_create_proposal_versions_table.ts) - Version history

**Design Principle:**
> Every AI decision includes confidence scores, rationale, source references, and rule enforcement results. Transparency builds trust.

---

### Data Integrity

**How to prevent AI pollution of historical data?**

**Immutable version history via `proposal_versions` table:**
- Every change creates new version record with complete snapshot
- `proposals` table maintains `current_version` but never overwrites history
- `UNIQUE(proposal_id, version_number)` prevents duplicates
- Non-admins only see versions up to approved version

**Four protection layers:**

1. **Status-Based Access Control**: Non-admins can only edit `draft` or `rejected` status. Approved = read-only.

2. **Export Restrictions**: Only approved proposals can be exported to Word documents.

3. **AI Service Isolation**: AI service has **zero database access**—only generates content, returns via HTTP. Backend controls all persistence.

4. **Transactional Writes**: If any step fails, entire transaction rolls back. No partial/corrupted data.

**Data Protection Flow:**
```
User Input → Backend Validation → AI Generation → Rule Enforcement
→ Backend Transaction (All or Nothing) → Database (Immutable Versions)
```

**Key Files:**
- [`proposal.service.ts`](packages/backend/src/services/proposal.service.ts) - Transaction handling
- [`20260131000004_create_proposal_versions_table.ts`](packages/backend/src/db/migrations/20260131000004_create_proposal_versions_table.ts) - Version schema
- [`main.py`](packages/ai-service/main.py) - No database imports

**Design Principle:**
> Immutable versions, status-based access, transactional writes, and AI isolation protect data integrity through multiple defensive layers.

---

### Failure Modes

**How should system behave when AI fails?**

**Graceful degradation and human fallback:**

**AI Service Unavailable:**
- Backend catches error in `aiService.generateDraft()`
- Transaction rolls back (no partial data)
- Clear error message to user
- Options: Retry | Manual Edit | Improve Input

**Incomplete/Low-Confidence Output:**

1. **Explicit Gap Identification**: `missing_info` array lists gaps
2. **Confidence Signals**: `confidence_score` (0.0-1.0) signals uncertainty
3. **Tiered Rule Enforcement**:
   - Strict violations → `all_rules_passed: false` (blocks)
   - Warning violations → logged but allows content
   - Advisory violations → guidance without blocking
4. **Multiple Recovery Options**:
   - Regenerate via `regenerateProposal()`
   - Manual edit via `updateProposal()`
   - Retry with improved survey notes

**Failure Flows:**
```
AI Unavailable → Error Caught → Transaction Rollback → User Notified
→ Options: Retry | Manual Edit | Improve Input

Low Confidence → Missing Info Populated → User Sees Warnings
→ Options: Accept | Regenerate | Edit | Add More Notes
```

**Key Files:**
- [`ai.service.ts`](packages/backend/src/services/ai.service.ts) - Error handling
- [`proposal.service.ts`](packages/backend/src/services/proposal.service.ts) - Rollback, regeneration
- [`main.py`](packages/ai-service/main.py) - Confidence/missing_info fields
- [`rule_engine.py`](packages/ai-service/rule_engine.py) - Tiered severity

**Design Principle:**
> Clear errors, transaction rollbacks, confidence signals, tiered enforcement, and manual overrides ensure graceful degradation. Humans can always override AI.

---

## Governance Summary

The AI Proposal Platform's governance model is built on four principles:

1. **Human Authority**: AI suggests, humans decide—especially for approval, schema definition, and distribution
2. **Transparent Explainability**: Every AI decision includes confidence scores, rationale, sources, and rule enforcement
3. **Protected Data Integrity**: Immutable versions, status-based access, transactional writes, AI isolation
4. **Graceful Failure Handling**: Clear errors, rollbacks, confidence signals, tiered enforcement, manual overrides

These principles ensure the system augments human decision-making rather than replacing it, maintaining accountability and trust in AI-generated content.

---
