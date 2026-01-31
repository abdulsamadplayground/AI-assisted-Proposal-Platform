# Implementation Tasks: AI-Assisted Proposal & Document Intelligence Platform

## Phase 1: Core AI Service & LLM Integration (HIGHEST PRIORITY)

### 1. AI Service Foundation
**Validates: Requirements 4, 5, 10**

- [ ] 1.1 Create FastAPI application structure
  - Set up main.py with FastAPI app
  - Configure CORS for backend communication
  - Set up logging with structured JSON
  - Create health check endpoint (/api/ai/health)
  - NO mock connections or placeholder data

- [ ] 1.2 Implement LLM adapter for OpenAI/Groq with REAL user input
  - Create LLM client with API key configuration (use actual keys from .env)
  - Accept REAL survey notes and attachments from user input
  - Implement retry logic with exponential backoff
  - Implement rate limiting and request queuing
  - Track token usage and estimated costs
  - Support multiple models with fallback
  - NO mock LLM responses - all calls must be real

- [ ] 1.3 Implement prompt engineering for proposal generation from REAL survey data
  - Create structured prompts for each section type (executive summary, scope of work, timeline, pricing)
  - Process ACTUAL user survey notes (not mock data)
  - Include rule constraints in prompts
  - Implement prompt compression for token optimization
  - Format responses as structured JSON
  - Handle attachments and multi-modal inputs

- [ ] 1.4 Write unit tests for LLM adapter with REAL API calls
  - Test API call success and failure with actual LLM provider
  - Test retry logic
  - Test token tracking
  - Use REAL survey note examples for testing (not mocks)

### 2. Rule Engine Implementation
**Validates: Requirements 2, 4, 6**

- [ ] 2.1 Implement rule loading and caching
  - Load active rules from backend on startup
  - Cache rules in memory
  - Implement cache invalidation on rule updates
  - Handle rule loading failures gracefully

- [ ] 2.2 Implement rule evaluation engine
  - Parse rule definitions (JSON/YAML)
  - Evaluate conditions against REAL survey data
  - Execute actions when conditions match
  - Track which rules were applied
  - Sort rules by priority

- [ ] 2.3 Implement rule types (validation, transformation, constraint)
  - Validation rules: Check survey data requirements
  - Transformation rules: Modify/enrich survey data
  - Constraint rules: Limit LLM behavior

- [ ] 2.4 Write unit tests for rule engine
  - Test rule parsing and validation
  - Test condition evaluation with REAL survey data
  - Test action execution
  - Test rule priority ordering

- [ ] 2.5 Write property-based tests for rule engine
  - Property: Same inputs + same rules = same outputs (determinism)
  - Property: Rule application is always traceable
  - Property: Invalid rules are rejected

### 3. Draft Generation with REAL User Input
**Validates: Requirements 4, 10, 15, 18**

- [ ] 3.1 Implement draft generation endpoint (POST /api/ai/generate-draft)
  - Receive proposal ID, REAL survey notes from user, attachments
  - Apply rule engine first
  - Invoke LLM for each section type with ACTUAL user data
  - Generate confidence scores based on real data quality
  - Provide rationale and source references
  - Return structured draft with metadata
  - NO placeholder or mock content

- [ ] 3.2 Implement confidence scoring logic based on REAL data
  - Calculate confidence based on survey data specificity
  - Factor in rule coverage
  - Factor in LLM response certainty
  - Return scores in range [0.0, 1.0]

- [ ] 3.3 Implement explainability features
  - Track which survey data influenced each section
  - Record which rules were applied
  - Generate rationale for AI decisions
  - Provide source references from actual survey notes

- [ ] 3.4 Implement multi-modal input processing for REAL attachments
  - Merge text, image, and document inputs from user
  - Correlate references between inputs
  - Resolve conflicts (prioritize explicit text)
  - Track provenance for each input type
  - Process REAL uploaded files (not mock data)

- [ ] 3.5 Write unit tests for draft generation with REAL inputs
  - Test with various REAL survey note formats
  - Test confidence score calculation
  - Test rationale generation
  - Use ACTUAL user data examples

- [ ] 3.6 Write property-based tests for draft generation
  - Property: Confidence scores always in [0.0, 1.0]
  - Property: Every section has rationale
  - Property: Generated drafts match expected structure

### 4. Rule Reload Mechanism
**Validates: Requirement 2**

- [ ] 4.1 Implement rule reload endpoint in AI service (POST /api/ai/reload-rules)
  - Fetch latest rules from backend
  - Invalidate rule cache
  - Reload rules into memory
  - Return success status

## Phase 2: Backend API & Storage (HIGH PRIORITY)

### 5. Backend Foundation & Express Setup
**Validates: Requirements 3, 7, 8, 9**

- [ ] 5.1 Create Express application structure
  - Set up src/index.ts with Express app
  - Configure middleware (cors, helmet, express-rate-limit)
  - Set up Winston logging
  - Create health check endpoint
  - Configure environment variables

- [ ] 5.2 Implement object storage service for REAL user files
  - Create directory structure for uploads
  - Implement file upload with unique naming for REAL survey notes
  - Implement file retrieval
  - Implement file deletion
  - Handle ACTUAL user attachments (images, PDFs)
  - NO mock storage

- [ ] 5.3 Create storage abstraction layer
  - Abstract interface for storage operations
  - Switch between local and cloud based on config
  - Handle storage failures gracefully

### 6. Proposal CRUD Operations (Core Backend)
**Validates: Requirements 3, 7, 8, 9**

- [ ] 6.1 Implement proposal creation endpoint (POST /api/proposals)
  - Validate REAL survey notes from user (non-empty, < 50,000 chars)
  - Create proposal record with status=draft
  - Store ACTUAL survey notes in local storage
  - Generate unique proposal ID
  - Return proposal ID to client
  - NO mock data or placeholder content

- [ ] 6.2 Implement proposal listing endpoint (GET /api/proposals)
  - Filter by user_id and status
  - Implement pagination
  - Return proposal metadata without full content

- [ ] 6.3 Implement proposal detail endpoint (GET /api/proposals/:id)
  - Return complete proposal with sections
  - Include version history
  - Check user authorization (own proposals only for Users)

- [ ] 6.4 Implement proposal update endpoint (PUT /api/proposals/:id)
  - Validate user has permission to edit
  - Track changes with timestamps and user attribution
  - Create new version record with diff
  - Prevent updates if proposal is locked (approved)

- [ ] 6.5 Implement proposal deletion endpoint (DELETE /api/proposals/:id)
  - Soft delete (mark as deleted, don't remove from DB)
  - Check user authorization
  - Create audit log entry

- [ ] 6.6 Write unit tests for proposal CRUD with REAL data
  - Test creation with valid and invalid REAL inputs
  - Test authorization checks
  - Test locked proposal update prevention
  - Test soft deletion

- [ ] 6.7 Write property-based tests for proposals
  - Property: Survey notes > 50,000 chars always rejected
  - Property: Locked proposals cannot be modified
  - Property: Every proposal operation creates audit log

### 7. AI Service Integration with Backend
**Validates: Requirements 4, 5, 6**

- [ ] 7.1 Implement backend-to-AI-service communication with REAL data
  - Create API client in backend for AI service
  - Send generation requests with REAL proposal data from users
  - Handle AI service responses
  - Store AI drafts in separate table
  - Handle AI service failures gracefully
  - NO mock API calls

- [ ] 7.2 Implement AI draft retrieval endpoint (GET /api/proposals/:id/draft)
  - Return AI draft for proposal
  - Include confidence scores and rationale
  - Ensure drafts are marked as advisory only

- [ ] 7.3 Implement draft regeneration endpoint (POST /api/proposals/:id/regenerate)
  - Allow user to provide additional guidance
  - Send new generation request to AI service with REAL user input
  - Store new draft (keep old draft for comparison)

- [ ] 7.4 Write integration tests for AI service communication
  - Test successful draft generation flow with REAL data
  - Test AI service failure handling
  - Test draft storage and retrieval

- [ ] 7.5 Write property-based tests for AI integration
  - Property: AI service never writes to database directly
  - Property: AI drafts are always separate from proposals
  - Property: AI failures don't prevent manual proposal creation

### 8. Approval Workflow
**Validates: Requirement 9**

- [ ] 8.1 Implement submit for approval endpoint (POST /api/proposals/:id/submit)
  - Transition status from draft to pending_approval
  - Create version record
  - Create audit log entry

- [ ] 8.2 Implement approve proposal endpoint (POST /api/proposals/:id/approve)
  - Check user has approval authority
  - Transition status to approved
  - Lock proposal (prevent further edits)
  - Create final version record
  - Create audit log entry

- [ ] 8.3 Implement request changes endpoint (POST /api/proposals/:id/request-changes)
  - Transition status to revision_requested
  - Allow user to edit and resubmit
  - Create audit log entry

- [ ] 8.4 Write unit tests for approval workflow
  - Test state transitions
  - Test authorization for approval
  - Test locked proposal behavior

- [ ] 8.5 Write property-based tests for approval workflow
  - Property: Only authorized users can approve
  - Property: Approved proposals are always locked
  - Property: All status transitions create audit logs

### 9. Version Control and History
**Validates: Requirement 8**

- [ ] 9.1 Implement version creation logic
  - Create version on proposal creation
  - Create version on proposal update
  - Create version on status transitions
  - Store complete proposal snapshot
  - Calculate and store diffs

- [ ] 9.2 Implement version history endpoint (GET /api/proposals/:id/versions)
  - Return all versions in chronological order
  - Include metadata (timestamp, user, change description)

- [ ] 9.3 Implement specific version endpoint (GET /api/proposals/:id/versions/:versionId)
  - Return complete version snapshot
  - Include diff from previous version

- [ ] 9.4 Write unit tests for versioning
  - Test version creation on various triggers
  - Test version immutability
  - Test diff calculation

- [ ] 9.5 Write property-based tests for versioning
  - Property: Version records are immutable (updates fail)
  - Property: Every proposal modification creates a version
  - Property: Version snapshots are complete and valid

### 10. Rules Management API
**Validates: Requirement 2, 17**

- [ ] 10.1 Implement rule listing endpoint (GET /api/rules)
  - Return all rules with metadata
  - Filter by active/inactive status
  - Restrict to Admin role only

- [ ] 10.2 Implement rule creation endpoint (POST /api/rules)
  - Validate rule syntax and structure
  - Store rule with version metadata
  - Create audit log entry
  - Restrict to Admin role only

- [ ] 10.3 Implement rule update endpoint (PUT /api/rules/:id)
  - Create new version (preserve old version)
  - Validate rule syntax
  - Create audit log entry
  - Restrict to Admin role only

- [ ] 10.4 Implement rule deletion endpoint (DELETE /api/rules/:id)
  - Mark as inactive (don't delete from DB)
  - Create audit log entry
  - Restrict to Admin role only

- [ ] 10.5 Implement rule publish endpoint (POST /api/rules/publish)
  - Notify AI service to reload rules
  - Create audit log entry
  - Return success/failure status

- [ ] 10.6 Implement rule version history endpoint (GET /api/rules/:id/versions)
  - Return all versions with timestamps
  - Show change descriptions

- [ ] 10.7 Write unit tests for rules management
  - Test CRUD operations
  - Test authorization (Admin only)
  - Test version creation
  - Test rule validation

- [ ] 10.8 Write property-based tests for rules management
  - Property: Only Admins can modify rules
  - Property: Rule updates create new versions
  - Property: Inactive rules are never deleted

- [ ] 10.9 Implement backend notification to AI service
  - Call AI service reload endpoint on rule publish
  - Handle AI service unavailability
  - Retry with backoff if needed

- [ ] 10.10 Write integration tests for rule reload
  - Test rule update propagation
  - Test cache invalidation
  - Test AI service unavailability handling

### 11. Audit Logging
**Validates: Requirement 14**

- [ ] 11.1 Implement audit logging middleware
  - Capture all state-changing operations
  - Record user, timestamp, action, entity, changes
  - Store metadata (IP address, user agent)
  - Ensure append-only (no updates or deletes)

- [ ] 11.2 Implement audit log query endpoint (GET /api/audit-logs)
  - Filter by user, date range, action type
  - Implement pagination
  - Restrict access to Admin role only

- [ ] 11.3 Write unit tests for audit logging
  - Test log creation on various operations
  - Test immutability (update/delete attempts fail)
  - Test query filtering

- [ ] 11.4 Write property-based tests for audit logging
  - Property: Every state change creates audit log
  - Property: Audit logs are immutable
  - Property: Audit logs contain complete change information

## Phase 3: Frontend Implementation

### 12. Frontend Foundation
**Validates: Requirements 1, 16**

- [ ] 12.1 Create Next.js app structure
  - Set up app directory with layout
  - Configure Tailwind CSS
  - Set up global styles
  - Create reusable UI components

- [ ] 12.2 Implement API client for backend
  - Create axios instance with base URL
  - Add authentication token to requests
  - Handle 401/403 errors (redirect to login)
  - Implement request/response interceptors

### 13. Proposal Creation and Editing UI
**Validates: Requirements 3, 7, 15**

- [ ] 13.1 Create proposal creation page with REAL user input
  - Form for survey notes input (accept REAL user text)
  - File upload for attachments (handle REAL files)
  - Character count display (max 50,000)
  - Submit button to create proposal
  - NO placeholder or mock data in forms

- [ ] 13.2 Create proposal detail page
  - Display proposal metadata
  - Show AI draft alongside editable content
  - Visual distinction between draft and editable sections
  - Confidence score visualization
  - Rationale and source references display

- [ ] 13.3 Implement proposal editing interface
  - Inline editing for all sections
  - Rich text editor (Tiptap or Lexical)
  - Save changes with user attribution
  - Show save status (saving, saved, error)

- [ ] 13.4 Implement proposal listing page
  - Display all user proposals
  - Filter by status
  - Pagination
  - Click to view/edit proposal

- [ ] 13.5 Write unit tests for proposal UI
  - Test form validation with REAL inputs
  - Test character count
  - Test file upload with REAL files
  - Test editing interface

### 14. Approval Workflow UI
**Validates: Requirement 9**

- [ ] 14.1 Implement submit for approval button
  - Show confirmation dialog
  - Call backend API
  - Update proposal status in UI
  - Show success/error message

- [ ] 14.2 Implement approval interface
  - Show proposals pending approval
  - Approve button (for authorized users)
  - Request changes button with comment field
  - Show approval status and history

- [ ] 14.3 Write unit tests for approval UI
  - Test button visibility based on role
  - Test confirmation dialogs
  - Test status updates

### 15. Version History and Comparison
**Validates: Requirement 8**

- [ ] 15.1 Create version history page
  - Display all versions in timeline
  - Show metadata (timestamp, user, description)
  - Click to view specific version

- [ ] 15.2 Implement version comparison view
  - Side-by-side comparison of two versions
  - Highlight added content (green)
  - Highlight removed content (red strikethrough)
  - Highlight modified content (yellow)

- [ ] 15.3 Write unit tests for version UI
  - Test version list rendering
  - Test comparison highlighting

### 16. Admin Console
**Validates: Requirement 17**

- [ ] 16.1 Create admin dashboard page
  - Overview of system metrics
  - Quick links to rules management
  - Recent audit logs

- [ ] 16.2 Create rules management page
  - List all rules with status
  - Create new rule form
  - Edit rule form
  - Activate/deactivate toggle
  - View rule version history

- [ ] 16.3 Create rule editor component
  - JSON/YAML editor with syntax highlighting
  - Rule validation on save
  - Preview rule structure

- [ ] 16.4 Create audit log viewer
  - Filterable table of audit logs
  - Date range picker
  - User filter
  - Action type filter
  - Export to CSV

- [ ] 16.5 Write unit tests for admin console
  - Test rule CRUD operations
  - Test authorization (Admin only)
  - Test audit log filtering

## Phase 4: Integration Testing

### 17. End-to-End Integration Tests
**Validates: All Requirements**

- [ ] 17.1 Write end-to-end tests for proposal workflow with REAL data
  - Test complete flow: create → edit → submit → approve
  - Test AI draft generation integration with REAL survey notes
  - Test version creation at each step
  - NO mock data in integration tests

- [ ] 17.2 Write end-to-end tests for rules management
  - Test rule creation and publishing
  - Test rule application in draft generation
  - Test rule reload in AI service

- [ ] 17.3 Write integration tests for failure scenarios
  - Test AI service downtime (manual mode)
  - Test database connection loss
  - Test object storage failures

### 18. Property-Based Testing for Correctness
**Validates: Design Correctness Properties**

- [ ] 18.1 Write property test for AI authority boundary
  - Property: AI service never writes to database
  - Monitor database connections
  - Verify all writes come from backend only

- [ ] 18.2 Write property test for draft-approval separation
  - Property: AI drafts never queryable as authoritative
  - Test all proposal queries exclude drafts
  - Verify separate table access

- [ ] 18.3 Write property test for version immutability
  - Property: Version records cannot be modified
  - Test update operations fail
  - Verify audit logs show no version modifications

- [ ] 18.4 Write property test for approval authority
  - Property: Only authorized users can approve
  - Test approval attempts by various roles
  - Verify audit logs for all approvals

- [ ] 18.5 Write property test for audit trail completeness
  - Property: Every state change creates audit log
  - Test all CRUD operations
  - Verify audit log entries exist

- [ ] 18.6 Write property test for rule determinism
  - Property: Same inputs + rules = same outputs
  - Generate drafts multiple times with REAL data
  - Compare outputs for equality

- [ ] 18.7 Write property test for graceful degradation
  - Property: System works without AI service
  - Simulate AI failures
  - Verify manual mode activates

- [ ] 18.8 Write property test for confidence scores
  - Property: Scores always in [0.0, 1.0]
  - Test all generated sections
  - Verify rationale exists

- [ ] 18.9 Write property test for survey notes limit
  - Property: Notes > 50,000 chars rejected
  - Generate notes of varying sizes
  - Test boundary conditions

## Phase 5: Database & Authentication (LOWER PRIORITY - Implement Last)

### 19. Database Schema and Migrations
**Validates: Requirements 1, 3, 6, 8, 9, 14**

- [ ] 19.1 Create database schema for Users and Roles tables
  - Implement user authentication fields (id, email, password_hash, role, created_at, updated_at)
  - Add indexes for email lookup
  - Create seed data for initial admin user

- [ ] 19.2 Create database schema for Proposals table
  - Implement proposal fields (id, user_id, status, survey_notes_ref, created_at, updated_at, approved_at, approved_by, locked)
  - Add foreign key constraints to users table
  - Add indexes for user_id and status

- [ ] 19.3 Create database schema for AI_Drafts table (separate from Proposals)
  - Implement draft fields (id, proposal_id, model_version, generated_at, rules_applied, token_usage, estimated_cost)
  - Add foreign key to proposals table
  - Ensure no direct queries can mix drafts with approved proposals

- [ ] 19.4 Create database schema for Versions table
  - Implement version fields (id, proposal_id, version_number, snapshot, change_description, changed_by, created_at)
  - Add constraints to prevent version updates (immutability)
  - Add indexes for proposal_id and version_number

- [ ] 19.5 Create database schema for Rules table
  - Implement rule fields (id, name, description, rule_type, definition, active, version, created_by, created_at, updated_at)
  - Add validation for rule definition JSON structure

- [ ] 19.6 Create database schema for Audit_Logs table
  - Implement audit fields (id, timestamp, user_id, action, entity_type, entity_id, changes, metadata)
  - Add append-only constraints
  - Add indexes for timestamp, user_id, and entity_type

- [ ] 19.7 Create Knex migration files for all schemas
  - Write up migrations for all tables
  - Write down migrations for rollback capability
  - Test migration and rollback locally

### 20. Authentication and Authorization
**Validates: Requirements 1, 16**

- [ ] 20.1 Implement user authentication middleware
  - Create JWT token generation and validation
  - Implement password hashing with bcrypt
  - Create login endpoint (/api/auth/login)
  - Create logout endpoint (/api/auth/logout)
  - Create session validation endpoint (/api/auth/session)

- [ ] 20.2 Implement role-based authorization middleware
  - Create RBAC middleware to check user roles
  - Implement permission checks for Admin vs User roles
  - Add authorization to all protected routes
  - Return appropriate 401/403 errors

- [ ] 20.3 Implement authentication pages in frontend
  - Create login page with form validation
  - Implement JWT token storage (HTTP-only cookies)
  - Create session management logic
  - Implement logout functionality
  - Create protected route wrapper

- [ ] 20.4 Write unit tests for authentication
  - Test JWT token generation and validation
  - Test password hashing and comparison
  - Test login success and failure cases
  - Test session expiration
  - Test login form validation
  - Test token storage and retrieval
  - Test protected route access

- [ ] 20.5 Write property-based tests for authorization
  - Property: Admin role can access all admin endpoints
  - Property: User role cannot access admin endpoints
  - Property: Expired tokens always require re-authentication

- [ ] 20.6 Write end-to-end tests for authentication
  - Test login and logout
  - Test role-based access control
  - Test session expiration

- [ ] 20.7 Write property test for session timeout
  - Property: Expired tokens require re-auth
  - Test with expired tokens
  - Verify authentication required

## Phase 6: Performance, Security & Deployment

### 21. Performance Optimization
**Validates: Requirement 12**

- [ ] 21.1 Implement caching strategy
  - Cache active rules in AI service
  - Cache user sessions in Redis (optional)
  - Cache frequently accessed proposals (5-min TTL)
  - Implement cache invalidation

- [ ] 21.2 Optimize database queries
  - Add indexes for common queries
  - Implement query result pagination
  - Use database connection pooling
  - Optimize version diff calculation

- [ ] 21.3 Implement cost tracking
  - Log token usage per request
  - Calculate estimated costs
  - Aggregate costs by user/project/time
  - Create cost alert thresholds

- [ ] 21.4 Optimize LLM token usage
  - Implement prompt compression
  - Use smaller models for simple sections
  - Cache common rule outputs
  - Implement prompt templates

- [ ] 21.5 Write performance tests
  - Test API response times
  - Test database query performance
  - Test AI generation latency
  - Test concurrent user load

### 22. Security Hardening
**Validates: Requirements 1, 5, 16**

- [ ] 22.1 Implement input sanitization
  - Sanitize all user inputs
  - Prevent SQL injection
  - Prevent XSS attacks
  - Validate file uploads

- [ ] 22.2 Implement rate limiting
  - Add rate limiting to all API endpoints
  - Configure limits per endpoint
  - Return 429 Too Many Requests

- [ ] 22.3 Implement data encryption
  - Encrypt survey notes at rest (AES-256)
  - Encrypt data in transit (TLS 1.3)
  - Secure JWT secret management
  - Secure API key storage

- [ ] 22.4 Implement AI service isolation
  - Ensure AI service has no DB write access
  - Ensure AI service cannot write to storage
  - Validate all AI outputs in backend
  - Run AI service in isolated network

- [ ] 22.5 Write security tests
  - Test SQL injection prevention
  - Test XSS prevention
  - Test authorization bypass attempts
  - Test rate limiting

### 23. Monitoring and Observability
**Validates: Requirement 12**

- [ ] 23.1 Implement structured logging
  - Use Winston for backend logging
  - Use Python JSON logger for AI service
  - Include correlation IDs for tracing
  - Log all errors with stack traces

- [ ] 23.2 Implement metrics collection
  - Track request latency (p50, p95, p99)
  - Track error rates by endpoint
  - Track AI generation success rate
  - Track token usage and costs

- [ ] 23.3 Implement health checks
  - Backend health endpoint
  - AI service health endpoint
  - Database connection check
  - Object storage check

- [ ] 23.4 Set up alerting (optional)
  - Alert on AI service downtime
  - Alert on high error rates
  - Alert on cost thresholds
  - Alert on unusual audit patterns

### 24. Deployment Preparation
**Validates: All Requirements**

- [ ] 24.1 Create Docker containers
  - Dockerfile for backend
  - Dockerfile for AI service
  - Dockerfile for frontend
  - Docker Compose for local development

- [ ] 24.2 Create deployment documentation
  - Environment variable documentation
  - Database setup instructions
  - Deployment steps
  - Troubleshooting guide

- [ ] 24.3 Create CI/CD pipeline (optional)
  - Automated testing on commit
  - Automated build and deploy
  - Environment-specific configurations

- [ ] 24.4 Perform final testing
  - Test all features end-to-end
  - Test with production-like data
  - Test failure scenarios
  - Verify all requirements met

### 25. Documentation
**Validates: All Requirements**

- [ ] 25.1 Create API documentation
  - Document all backend endpoints
  - Document all AI service endpoints
  - Include request/response examples
  - Document error codes

- [ ] 25.2 Create user documentation
  - User guide for proposal creation
  - User guide for approval workflow
  - Admin guide for rules management
  - FAQ and troubleshooting

- [ ] 25.3 Create developer documentation
  - Architecture overview
  - Database schema documentation
  - Code structure and conventions
  - Testing guidelines

- [ ] 25.4 Create deployment guide
  - Production deployment steps
  - Environment configuration
  - Backup and recovery procedures
  - Monitoring setup

---

## CRITICAL IMPLEMENTATION NOTES

### NO MOCK DATA OR CONNECTIONS
- **ALL LLM calls must use REAL API connections** (OpenAI/Groq with actual API keys)
- **ALL survey notes must come from REAL user input** (no placeholder text)
- **ALL file uploads must handle REAL user files** (no mock attachments)
- **ALL tests should use REAL data examples** (not synthetic mock data)
- **NO mock API clients or stub responses** in production code

### Priority Order
1. **Phase 1**: AI Service & LLM Integration (Tasks 1-4) - Build this FIRST
2. **Phase 2**: Backend API & Storage (Tasks 5-11) - Build this SECOND
3. **Phase 3**: Frontend Implementation (Tasks 12-16) - Build this THIRD
4. **Phase 4**: Integration Testing (Tasks 17-18) - Test as you build
5. **Phase 5**: Database & Authentication (Tasks 19-20) - Build this LAST
6. **Phase 6**: Performance, Security & Deployment (Tasks 21-25) - Final polish

### Development Approach
- Start with AI service to validate LLM integration works with REAL user data
- Build backend API to handle REAL proposal data and storage
- Create frontend to accept REAL user input and display results
- Implement database and auth last (can use in-memory storage initially)
- Test continuously with REAL data throughout development
