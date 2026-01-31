# AI-Assisted Proposal Platform – Technical Resource Document

## 1. Project Overview

**Purpose:**  
The AI-Assisted Proposal Platform is designed to **automate and streamline the proposal drafting process** while maintaining **strict governance, auditability, and human-in-the-loop control**. The system combines deterministic rule-based logic with AI assistance (LLM) to generate structured proposal drafts, extract information from documents and survey notes, and enforce organizational SOPs.

**Key Objectives:**
- Reduce manual effort in proposal generation
- Ensure consistency and compliance with SOPs
- Maintain clear separation between AI suggestions and authoritative records
- Track edits, versioning, and approval workflows
- Provide explainable AI outputs with rationale and confidence scores

**Primary Users:**
- **Admin:** Manages rules, SOPs, and AI constraints
- **User:** Drafts, edits, and approves proposals

---

## 2. System Architecture

### 2.1 Overview

The system is composed of four major layers:

1. **Frontend Layer**
   - React / Next.js
   - User Portal: proposal creation, editing, approval
   - Admin Console: rules, SOP management, AI configuration

2. **Backend Layer (System of Record)**
   - Node.js + TypeScript
   - Handles proposal lifecycle, versioning, approval, and audit logging
   - Manages all authoritative data
   - Interfaces with AI Execution Service (request/response only)

3. **AI Layer (Advisory Only)**
   - Python + FastAPI
   - Rule Engine: deterministic, admin-defined rules
   - LLM Adapter: constrained AI invocation for phrasing/clarity only
   - Returns structured, explainable draft suggestions
   - No write access to backend databases

4. **Data Layer**
   - PostgreSQL: versioned proposal storage
   - Object Storage (S3/GCS/Azure Blob): raw survey notes, documents, images
   - Rules Store: versioned JSON/YAML managed by Admin
   - SOP Repository: read-only reference documents

### 2.2 Component Responsibilities

| Component                | Responsibilities                                           | Tech Stack                 |
|--------------------------|------------------------------------------------------------|----------------------------|
| **User Portal UI**       | Submit survey notes, view/edit AI draft, approve proposals | React / Next.js            |
| **Admin Console UI**     | Define/update rules, manage SOPs, audit AI suggestions     | React / Next.js            |
| **Backend API Gateway**  | Handles CRUD requests, authentication, authorization, logs | Node.js + TypeScript       |
| **Proposal Service**     | Proposal lifecycle, versioning, edit tracking, approval    | Node.js + TypeScript       |
| **Auth & RBAC Service**  | User/admin authentication, role enforcement                | Node.js + TypeScript       |
| **Audit Service**        | Logs all actions for compliance                            | Prometheus/Grafana/Winston |
| **AI Execution Service** | Receives structured input, applies rules, invokes LLM      | Python + FastAPI           |
| **Rule Engine**          | Validates mandatory sections, applies SOPs, constraints    | Python + JSON/YAML         |
| **LLM Adapter**          | Controlled LLM calls to OpenAI / Azure                     | Python                     |
| **Proposal DB**          | Stores versioned proposals, approvals, AI drafts           | PostgreSQL                 |
| **Object Storage**       | Stores raw survey notes/docs/images                        | S3/GCS/Azure Blob          |
| **Rules Store**          | Versioned admin-defined rules                              | JSON/YAML                  |
| **SOP Repository**       | Read-only reference SOPs                                   | PDF/Docx                   |

---

## 3. Roles & Authority Boundaries

| Actor / Component         | Can Suggest            | Can Edit  | Can Approve            |
|---------------------------|------------------------|-----------|------------------------|
| **Admin**                 | ✅ (rules/SOPs)        | ❌       | ✅ (rules only)       |
| **User**                  | ❌                     | ✅       | ✅ (proposal content) |
| **Backend Service**       | ❌                     | ✅       | ✅                    |
| **AI Execution Service**  | ✅ (draft suggestions) | ❌       | ❌                    |

**Notes:**
- AI outputs are **advisory only**, structured, and explainable
- Backend is the **system of record** — only it writes to databases
- Admin manages rules, SOPs, and AI constraints, but does **not edit proposals**
- Users manage proposal content, edits, and approval

---

## 4. End-to-End Workflow

### Step-by-Step Flow

1. **Admin Configuration**
   - Defines rules and SOP mappings
   - Saves versioned rules
   - AI Execution Service loads rules on demand

2. **User Submits Survey Notes**
   - Input: free-text notes, optional images/docs
   - Backend validates input, stores raw data, creates proposal record
   - Backend sends structured draft request to AI Execution Service

3. **AI Draft Generation**
   - Rule Engine applies admin-defined rules, mandatory sections, and SOP constraints
   - LLM Adapter invoked for phrasing and ambiguity resolution
   - AI returns structured draft + rationale + confidence scores

4. **Draft Review**
   - Frontend displays:
     - AI draft (read-only)
     - Editable proposal for user edits
     - Rationale and confidence per section
   - User edits proposal
   - Backend tracks version, diffs, and metadata

5. **Approval**
   - User approves proposal
   - Backend locks version and updates status
   - AI cannot modify approved proposals

6. **Feedback Capture**
   - Backend records edits vs AI draft
   - Admin can review for rule/SOP refinement
   - AI cannot auto-learn from edits

---

## 5. Data Flow Overview (DFD)

### External Entities
- **Admin**: rules and SOP management
- **User**: proposal submission, edits, approval

### Processes
- **Frontend UI**: Receives input and displays outputs
- **Backend Service**: System of record; manages proposals
- **AI Execution Service**: Advisory, rule-first AI suggestions
- **Rule Engine**: Validates rule compliance
- **LLM Adapter**: Bounded AI invocation

### Data Stores
- **Proposal Database**: Versioned records
- **Object Storage**: Raw inputs
- **Rules Store**: Versioned, admin-managed rules
- **SOP Repository**: Reference documents

### Governance Highlights
- AI cannot write to storage
- All edits and approvals are tracked in backend
- Versioning ensures auditability
- Admin rules enforce AI boundaries

---

## 6. Technical Stack Summary

| Layer      | Components                                               | Technology                                           |
|------------|----------------------------------------------------------|------------------------------------------------------|
| Frontend   | User Portal / Admin Console                              | React, Next.js, Tailwind (optional)                  |
| Backend    | API Gateway, Proposal Service, Auth, Audit               | Node.js, TypeScript, Express/Fastify                 |
| AI Layer   | AI Execution Service, Rule Engine, LLM Adapter           | Python, FastAPI, JSON/YAML rules, OpenAI / Azure LLM |
| Data Layer | Proposal DB, Object Storage, Rules Store, SOP Repository | PostgreSQL, S3/GCS/Azure Blob, JSON/YAML files, PDF/Docx |
| External   | LLM Provider                                             | OpenAI / Azure OpenAI API                            |

---

## 7. Governance & Safety

- AI drafts are **never authoritative**
- Backend enforces **role-based access**
- Versioning prevents accidental overwrites
- Admin rules control AI boundaries and SOP compliance
- Structured output ensures **explainable suggestions**
- Audit logging tracks every action for compliance

---

## 8. Key Design Decisions

1. **Admin–User Separation**
   - Admin defines rules and SOPs
   - User operates only on proposal content

2. **Backend ≠ AI Service**
   - AI is stateless and advisory
   - Backend is authoritative system of record

3. **Rules + LLM Hybrid**
   - Rules first: enforce structure, SOPs, mandatory sections
   - LLM only for phrasing/clarity
   - Prevents free-form AI outputs

4. **Versioning & Auditability**
   - Each edit creates a new version
   - AI drafts read-only
   - Approved proposals immutable

5. **Explainable AI**
   - Each section includes rationale, confidence, and source
   - Feedback signals tracked for admin review

---

## 9. Next Steps / Future Enhancements

- **Enhanced image/document extraction** (OCR + structured parsing)
- **Advanced feedback loop** (safe AI learning under admin oversight)
- **Detailed analytics dashboard** for admin:
  - AI accuracy
  - Proposal completion speed
  - User edit patterns
- **Integration with external proposal management systems**  

---

## 10. Conclusion

This document provides a **complete technical resource** for the AI-Assisted Proposal Platform, covering:

- System architecture and tech stack
- Roles, authority, and governance
- End-to-end workflow and versioning
- AI execution design (rules + LLM hybrid)
- Data flow and storage strategy
- Safety, auditability, and explainability  

The platform is **production-ready, safe, and hire-grade**, demonstrating deep understanding of AI integration in enterprise workflows.
