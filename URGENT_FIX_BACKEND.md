# 🚨 URGENT: Fix Backend 500 Error

## Problem
Backend is crashing with `FUNCTION_INVOCATION_FAILED` because:
- SQLite database doesn't work on Vercel serverless functions
- PostgreSQL environment variables are not set

## Quick Fix: Setup Free PostgreSQL Database

### Option 1: Neon (Recommended - Free Forever)

1. **Sign up**: Go to https://neon.tech
2. **Create Project**: Click "Create Project"
3. **Get Connection String**: Copy the connection string that looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

4. **Parse the connection string** into these parts:
   - Host: `ep-xxx.us-east-2.aws.neon.tech`
   - Database: `neondb`
   - User: `user`
   - Password: `password`
   - Port: `5432`

### Option 2: Vercel Postgres

1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Follow the prompts
4. Copy the connection details

### Option 3: Supabase

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy connection details

## Add Environment Variables to Vercel

1. Go to: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-backend/settings/environment-variables

2. Add these variables:

```
NODE_ENV=production
PORT=3001

# Frontend URL
FRONTEND_URL=https://frontend-psi-swart-m9fuy6vv91.vercel.app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
JWT_EXPIRES_IN=24h

# AI Service
AI_SERVICE_URL=https://ai-proposal-ai-service.vercel.app

# PostgreSQL Database (REQUIRED!)
DB_CLIENT=postgresql
DB_HOST=<your-postgres-host>
DB_PORT=5432
DB_NAME=<your-database-name>
DB_USER=<your-database-user>
DB_PASSWORD=<your-database-password>

# Logging
LOG_LEVEL=info
```

3. Click "Save" for each variable

## Run Database Migrations

After adding environment variables:

```bash
cd packages/backend

# Pull environment variables from Vercel
vercel env pull .env.production

# Run migrations
npx knex migrate:latest --knexfile src/db/knexfile.ts --env production

# Seed initial data
npx knex seed:run --knexfile src/db/knexfile.ts --env production
```

## Redeploy Backend

```bash
cd packages/backend
vercel --prod
```

## Verify Fix

1. Visit: https://ai-proposal-backend-pink.vercel.app/health
2. Should see:
   ```json
   {
     "status": "healthy",
     "service": "api-gateway",
     "version": "1.0.0",
     "timestamp": "..."
   }
   ```

## If Still Failing

Check logs:
```bash
vercel logs https://ai-proposal-backend-pink.vercel.app
```

Common issues:
- Database credentials incorrect
- Database doesn't allow connections from Vercel IPs
- SSL mode not configured (add `?sslmode=require` to connection string)
- Migrations not run

## Quick Test with Neon (5 minutes)

1. Go to https://neon.tech → Sign up (free)
2. Create project → Copy connection string
3. Parse connection string:
   ```
   postgresql://user:pass@host/db
   ```
4. Add to Vercel environment variables:
   - DB_CLIENT=postgresql
   - DB_HOST=host
   - DB_NAME=db
   - DB_USER=user
   - DB_PASSWORD=pass
   - DB_PORT=5432
5. Redeploy: `vercel --prod`

## Need Help?

The backend CANNOT work without PostgreSQL on Vercel. SQLite only works locally.

**Priority**: Set up PostgreSQL database NOW - this is blocking the entire application.
