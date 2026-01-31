# Backend API - AI Proposal Platform

## Overview
Node.js/Express backend API with PostgreSQL database for the AI Proposal Platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│                   (Express.js)                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes (Controllers)                                 │  │
│  │  - Auth Routes                                        │  │
│  │  - Proposal Routes                                    │  │
│  │  - Schema Routes                                      │  │
│  │  - User Routes                                        │  │
│  │  - File Routes                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services (Business Logic)                            │  │
│  │  - Auth Service                                       │  │
│  │  - Proposal Service ←→ AI Service Client             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Layer (Knex.js)                            │  │
│  │  - PostgreSQL Connection                              │  │
│  │  - Migrations & Seeds                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │   PostgreSQL Database   │
              │                         │
              │  - users                │
              │  - schemas              │
              │  - proposals            │
              │  - proposal_versions    │
              └────────────────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │    AI Service          │
              │  (Python/FastAPI)      │
              │                         │
              │  - Generate Content     │
              │  - Enforce Rules        │
              │  - NO DB Access         │
              └────────────────────────┘
```

## Key Features

### 1. API Gateway
- Express.js REST API
- CORS configuration
- Rate limiting
- Request logging
- Error handling
- JWT authentication

### 2. Proposal Service
- **Creates proposals** in database
- **Sends structured input** to AI service (survey notes + schema)
- **Receives generated content** from AI service
- **Saves generated proposals** to PostgreSQL
- **Manages versions** - every save creates new version
- **Handles approval workflow** - draft → pending → approved/rejected

### 3. AI Service Integration
- **AI service CANNOT write to database**
- Backend sends: proposal_id, schema_id, survey_notes, attachments
- AI service returns: generated sections with rule enforcement results
- Backend saves the generated content to database

### 4. Database (PostgreSQL)
- **users** - User accounts (admin/user roles)
- **schemas** - Schema definitions with sections and rules
- **proposals** - Proposal data with generated content
- **proposal_versions** - Version history tracking

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- AI Service running on port 8000

### Setup

1. **Install dependencies**
```bash
cd packages/backend
npm install
```

2. **Configure environment**
```bash
# Edit .env file
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_proposal_platform
DB_USER=postgres
DB_PASSWORD=postgres
```

3. **Create PostgreSQL database**
```bash
createdb ai_proposal_platform
```

4. **Run migrations**
```bash
npm run migrate:latest
```

5. **Seed database**
```bash
npm run seed:run
```

6. **Start server**
```bash
npm run dev
```

Server will start on http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Proposals
- `POST /api/proposals` - Create proposal (generates with AI)
- `GET /api/proposals` - List proposals
- `GET /api/proposals/:id` - Get proposal details
- `PUT /api/proposals/:id` - Update proposal (creates new version)
- `POST /api/proposals/:id/regenerate` - Regenerate with AI
- `POST /api/proposals/:id/submit` - Submit for approval
- `POST /api/proposals/:id/approve` - Approve (admin only)
- `POST /api/proposals/:id/reject` - Reject (admin only)
- `DELETE /api/proposals/:id` - Delete proposal

### Schemas
- `GET /api/schemas` - List schemas
- `GET /api/schemas/:id` - Get schema details
- `POST /api/schemas` - Create schema (admin only)
- `DELETE /api/schemas/:id` - Delete schema (admin only)

### Users
- `GET /api/users` - List users (admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id/assign-schema` - Assign schema (admin only)
- `GET /api/users/:id/stats` - Get user statistics

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:filename` - Download file

## Proposal Creation Flow

1. **User submits proposal creation request**
   ```json
   POST /api/proposals
   {
     "title": "Office Building Construction",
     "schema_id": "uuid",
     "survey_notes": "Project details...",
     "attachments": ["file1.pdf"]
   }
   ```

2. **Backend creates proposal record** (status: draft, version: 1)

3. **Backend sends to AI service**
   ```json
   POST http://localhost:8000/api/ai/generate-draft
   {
     "proposal_id": "uuid",
     "schema_id": "uuid",
     "survey_notes": "Project details...",
     "attachments": ["file1.pdf"]
   }
   ```

4. **AI service generates content**
   - Loads schema with sections and rules
   - Generates content for each section
   - Enforces rules strictly
   - Returns generated sections

5. **Backend saves generated content**
   - Updates proposal with sections
   - Creates version 1 record
   - Returns complete proposal to user

## Version Tracking

Every time a proposal is updated:
1. `current_version` increments
2. New record created in `proposal_versions` table
3. Snapshot of sections saved
4. Change description recorded
5. User who made change recorded

## Database Schema

### users
```sql
id              UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
name            VARCHAR(255) NOT NULL
role            ENUM('user', 'admin') DEFAULT 'user'
assigned_schema_id VARCHAR(255)
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### schemas
```sql
id              UUID PRIMARY KEY
name            VARCHAR(255) NOT NULL
version         VARCHAR(50) DEFAULT '1.0.0'
description     TEXT
sections        JSONB NOT NULL
global_rules    JSONB DEFAULT '[]'
is_active       BOOLEAN DEFAULT true
created_by      UUID REFERENCES users(id)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### proposals
```sql
id              UUID PRIMARY KEY
title           VARCHAR(500) NOT NULL
schema_id       UUID REFERENCES schemas(id)
user_id         UUID REFERENCES users(id)
status          ENUM('draft', 'pending_approval', 'approved', 'rejected')
current_version INTEGER DEFAULT 1
survey_notes    TEXT NOT NULL
sections        JSONB NOT NULL
attachments     JSONB DEFAULT '[]'
admin_comments  TEXT
reviewed_by     UUID REFERENCES users(id)
submitted_at    TIMESTAMP
reviewed_at     TIMESTAMP
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### proposal_versions
```sql
id                  UUID PRIMARY KEY
proposal_id         UUID REFERENCES proposals(id)
version_number      INTEGER NOT NULL
sections            JSONB NOT NULL
change_description  TEXT
created_by          UUID REFERENCES users(id)
created_at          TIMESTAMP
UNIQUE(proposal_id, version_number)
```

## Default Users

After running seeds:

**Admin Account**
- Email: admin@example.com
- Password: admin123
- Role: admin

**User Account**
- Email: user@example.com
- Password: user123
- Role: user

## Development

### Run in development mode
```bash
npm run dev
```

### Run migrations
```bash
npm run migrate:latest
```

### Rollback migrations
```bash
npm run migrate:rollback
```

### Create new migration
```bash
npm run migrate:make migration_name
```

### Run seeds
```bash
npm run seed:run
```

### Build for production
```bash
npm run build
npm start
```

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_proposal_platform
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Role-based access control
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation

## Logging

- Winston logger with JSON format
- Request/response logging
- Error logging with stack traces
- Logs stored in `logs/` directory

## Error Handling

- Global error handler middleware
- Custom AppError class
- Proper HTTP status codes
- Detailed error messages in development
- Sanitized errors in production

## Notes

- **AI service CANNOT write to database** - only generates content
- Backend is responsible for all database operations
- Proposal service coordinates between database and AI service
- Every proposal update creates a new version
- Version history is immutable

---

**Created**: January 31, 2026  
**Status**: Complete and ready for testing
