# User Portal Features

## Overview
The user portal allows users to create, edit, and manage proposals with AI-powered content generation based on schema-defined rules and SOPs.

---

## Features

### 1. Dashboard (`/user/dashboard`)
- **Statistics Overview**: View total proposals, drafts, pending approvals, approved, and rejected counts
- **Quick Actions**: 
  - Create new proposal
  - Continue working on drafts
  - View pending approvals
- **Recent Proposals**: Table showing recent proposals with status, version, and last modified date

### 2. Proposals List (`/user/proposals`)
- **Filter by Status**: All, Drafts, Pending Approval, Approved, Rejected
- **Search**: Search proposals by title or schema
- **Proposal Cards**: Grid view with:
  - Title and status badge
  - Schema type
  - Version number
  - Last modified date
  - Quick actions (View/Edit, Delete for drafts)

### 3. Create Proposal (`/user/proposals/create`)

#### Step-by-Step Workflow:

**Step 1: Enter Title**
- User enters a clear, descriptive title for the proposal
- Example: "Office Building Construction Proposal"

**Step 2: Select Schema**
- User selects the schema type that fits their proposal
- Available schemas:
  - Construction Proposal Schema
  - IT Services Schema
  - Marketing Schema
  - Consulting Schema
- Each schema has sections and rules defined by admin

**Step 3: Enter Survey Notes**
- User provides detailed notes about the proposal
- These notes are used as REAL input for AI generation
- Example format:
  ```
  Project: Office Building Construction
  Location: Downtown Seattle
  Budget: $2.5M
  Timeline: 18 months
  Key Requirements: LEED certification, 5 floors, parking garage
  Client: ABC Corporation
  ```

**Step 4: Add Attachments (Optional)**
- User can upload supporting documents, images, or files
- Supported formats: Images, PDF, Word, Excel
- Drag-and-drop or click to upload
- View and remove attached files

**Generate Proposal**
- Clicking "Generate Proposal" triggers AI generation
- Survey notes are sent to AI service
- Rules and SOPs from the schema are STRICTLY ENFORCED
- Generated proposal includes all sections defined in the schema

### 4. View/Edit Proposal (`/user/proposals/[id]`)

#### Initial Status: Draft (Version 0)
- When first created, proposal status is "Draft"
- Version starts at 1

#### Available Actions:

**Edit Mode**
- Toggle between Edit and Preview modes
- Edit any section content directly
- Changes are tracked but not saved until "Save Changes" is clicked

**Save Changes**
- Saves all edits to the proposal
- **Automatic Versioning**: Every save increments the version number
- Version history is tracked with:
  - Version number
  - Timestamp
  - User who made changes
  - Description of changes

**Regenerate Section**
- Regenerate a specific section using AI
- Uses original survey notes
- Applies schema rules and SOPs
- Replaces section content with newly generated content

**Regenerate All**
- Regenerate the entire proposal using AI
- Uses original survey notes
- Applies schema rules and SOPs to all sections
- Replaces all section content

**Submit for Approval**
- When user is satisfied with the proposal, they submit it for approval
- Status changes from "Draft" to "Pending Approval"
- Proposal is sent to admin for review
- User can no longer edit after submission

#### Status Flow:
1. **Draft** → User can edit, regenerate, save, submit
2. **Pending Approval** → Awaiting admin review (read-only for user)
3. **Approved** → Admin approved (read-only for user)
4. **Rejected** → Admin rejected with comments (user can view and resubmit)

### 5. Version Tracking

Every time a user clicks "Save Changes":
- Version number increments (v1 → v2 → v3, etc.)
- Timestamp is recorded
- Change description is logged
- Full version history is displayed at the bottom of the proposal page

**Version History Display:**
```
Version 3 [Current]
Content updated • User • 2026-01-31 14:30

Version 2
Section regenerated • User • 2026-01-31 12:15

Version 1
Initial draft created • User • 2026-01-31 10:00
```

---

## Admin Interaction

When a user submits a proposal for approval:
1. Proposal appears in admin's proposals list
2. Admin can:
   - **Review**: Edit and regenerate sections/whole proposal
   - **Save**: When admin saves, proposal is auto-approved
   - **Reject**: Leave comments and send back to user
   - **Accept**: Approve without changes

When admin saves a proposal:
- Status automatically changes to "Approved"
- Status is updated throughout the frontend
- User can view the approved proposal (read-only)

---

## AI Integration

### Schema-Driven Generation
- Admin creates schemas with sections and rules
- Rules define:
  - Required fields
  - Length constraints
  - Format requirements
  - Content patterns
  - SOPs (Standard Operating Procedures)

### Rule Enforcement
- Rules are STRICTLY ENFORCED during generation
- AI output must comply with all rules
- If rules are violated, generation fails or warnings are shown
- No mock data - all content based on real survey notes

### Generation Process
1. User provides survey notes
2. AI service receives notes and schema ID
3. For each section in schema:
   - Generate content based on survey notes
   - Apply section-specific rules
   - Apply global rules
   - Enforce SOPs
4. Return generated proposal with all sections
5. Display to user for review and editing

---

## Toast Notifications

All user actions trigger professional toast notifications:
- ✅ **Success**: "Proposal generated successfully!"
- ❌ **Error**: "Failed to generate proposal. Please try again."
- ⚠️ **Warning**: "Please enter survey notes"
- ℹ️ **Info**: "File removed"
- ⏳ **Loading**: "Generating proposal with AI..."

No `alert()` calls anywhere - all notifications use the toast system.

---

## Technical Details

### Routes
- `/user/dashboard` - User dashboard
- `/user/proposals` - Proposals list
- `/user/proposals/create` - Create new proposal
- `/user/proposals/[id]` - View/edit specific proposal

### API Endpoints (To be implemented)
- `GET /api/proposals` - List user's proposals
- `GET /api/proposals/:id` - Get specific proposal
- `POST /api/proposals` - Create new proposal
- `PUT /api/proposals/:id` - Update proposal
- `DELETE /api/proposals/:id` - Delete proposal
- `POST /api/proposals/:id/submit` - Submit for approval
- `POST /api/proposals/:id/regenerate` - Regenerate sections

### AI Service Integration
- `POST http://localhost:8000/api/ai/generate-draft` - Generate proposal
  - Request body:
    ```json
    {
      "proposal_id": "string",
      "schema_id": "string",
      "survey_notes": "string",
      "attachments": ["string"],
      "section_filter": "string (optional)"
    }
    ```
  - Response includes all generated sections with rule enforcement results

---

## Future Enhancements

1. **Collaborative Editing**: Multiple users can work on the same proposal
2. **Comments**: Add comments to specific sections
3. **Templates**: Save proposals as templates for reuse
4. **Export**: Export proposals to PDF, Word, etc.
5. **Analytics**: Track proposal success rates, time to approval, etc.
6. **Notifications**: Email/push notifications for status changes
7. **Comparison**: Compare different versions side-by-side

---

**Created**: January 31, 2026  
**Last Updated**: January 31, 2026
