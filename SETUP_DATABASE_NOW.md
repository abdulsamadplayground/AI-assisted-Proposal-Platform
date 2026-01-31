# 🚨 SETUP DATABASE NOW - 5 MINUTE FIX

Your backend is crashing because there's NO database. Follow these steps:

## Step 1: Create Free PostgreSQL Database (2 minutes)

### Go to Neon.tech (Easiest & Free Forever)

1. Open: https://console.neon.tech/signup
2. Sign up with GitHub or Email
3. Click "Create Project"
4. Project name: `ai-proposal-platform`
5. Click "Create Project"

## Step 2: Get Connection Details (1 minute)

After creating the project, you'll see a connection string like:

```
postgresql://neondb_owner:npg_xxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Parse it into parts:**
- **Host**: `ep-xxx.us-east-2.aws.neon.tech` (everything between @ and /)
- **Database**: `neondb` (after the last /)
- **User**: `neondb_owner` (between // and :)
- **Password**: `npg_xxx` (between : and @)
- **Port**: `5432` (default)

## Step 3: Add to Vercel (2 minutes)

1. Go to: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-backend/settings/environment-variables

2. Click "Add New" and add these ONE BY ONE:

```
DB_CLIENT
Value: postgresql

DB_HOST
Value: ep-xxx.us-east-2.aws.neon.tech

DB_PORT
Value: 5432

DB_NAME
Value: neondb

DB_USER
Value: neondb_owner

DB_PASSWORD
Value: npg_xxx
```

3. Also add these if not already there:

```
NODE_ENV
Value: production

FRONTEND_URL
Value: https://frontend-psi-swart-m9fuy6vv91.vercel.app

AI_SERVICE_URL
Value: https://ai-proposal-ai-service.vercel.app

JWT_SECRET
Value: super-secret-jwt-key-change-this-123456789

JWT_EXPIRES_IN
Value: 24h

LOG_LEVEL
Value: info
```

## Step 4: Redeploy Backend

```bash
cd packages/backend
vercel --prod
```

## Step 5: Run Migrations

```bash
cd packages/backend

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx knex migrate:latest --knexfile src/db/knexfile.ts

# Seed initial data
npx knex seed:run --knexfile src/db/knexfile.ts
```

## Step 6: Test

Visit: https://ai-proposal-backend-pink.vercel.app/health

Should see:
```json
{
  "status": "healthy",
  "service": "api-gateway",
  "version": "1.0.0"
}
```

## That's It!

Your backend will now work. The entire process takes 5 minutes.

## Alternative: Use Vercel Postgres

If you prefer Vercel's own database:

1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Follow prompts
4. Copy connection details to environment variables
5. Redeploy

---

**The backend CANNOT work without a database. This is the #1 priority to fix.**
