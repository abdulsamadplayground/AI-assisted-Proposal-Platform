# 🔧 FIX DATABASE CONNECTION NOW

## The Problem
Backend shows: `"database":"not configured"`

This means environment variables are NOT set in Railway.

## Solution: Add Variables in Railway Dashboard

### Step 1: Go to Railway Dashboard
Open: https://railway.com/project/73d4e9fe-bcff-4d9b-9cb2-5506ea34f400

### Step 2: Click on Your Service
You should see a service named "aai-proposal" or similar

### Step 3: Go to Variables Tab
Click on "Variables" in the left sidebar

### Step 4: Add These Variables ONE BY ONE

Click "+ New Variable" for each:

```
Variable Name: NODE_ENV
Value: production

Variable Name: PORT
Value: 3001

Variable Name: DB_CLIENT
Value: postgresql

Variable Name: DB_HOST
Value: ep-late-heart-ahn3qwwd-pooler.c-3.us-east-1.aws.neon.tech

Variable Name: DB_PORT
Value: 5432

Variable Name: DB_NAME
Value: neondb

Variable Name: DB_USER
Value: neondb_owner

Variable Name: DB_PASSWORD
Value: npg_fWy8liq7EhUr

Variable Name: FRONTEND_URL
Value: https://frontend-psi-swart-m9fuy6vv91.vercel.app

Variable Name: AI_SERVICE_URL
Value: https://ai-proposal-ai-service.vercel.app

Variable Name: JWT_SECRET
Value: super-secret-jwt-key-change-this-123456789

Variable Name: JWT_EXPIRES_IN
Value: 24h

Variable Name: LOG_LEVEL
Value: info
```

### Step 5: Redeploy
After adding all variables, Railway will automatically redeploy.

Or click "Deploy" button to trigger a new deployment.

### Step 6: Test
Wait 1-2 minutes, then test:

```bash
curl https://aai-proposal-production.up.railway.app/health
```

Should show:
```json
{
  "status": "healthy",
  "database": "postgresql"
}
```

### Step 7: Test Database Connection
```bash
curl https://aai-proposal-production.up.railway.app/api/status
```

Should show database is configured.

---

## Alternative: Use Railway CLI

If the dashboard doesn't work, use CLI:

```bash
cd packages/backend

# Link to service
railway link

# Add variables
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set DB_CLIENT=postgresql
railway variables set DB_HOST=ep-late-heart-ahn3qwwd-pooler.c-3.us-east-1.aws.neon.tech
railway variables set DB_PORT=5432
railway variables set DB_NAME=neondb
railway variables set DB_USER=neondb_owner
railway variables set DB_PASSWORD=npg_fWy8liq7EhUr
railway variables set FRONTEND_URL=https://frontend-psi-swart-m9fuy6vv91.vercel.app
railway variables set AI_SERVICE_URL=https://ai-proposal-ai-service.vercel.app
railway variables set JWT_SECRET=super-secret-jwt-key-change-this-123456789
railway variables set JWT_EXPIRES_IN=24h
railway variables set LOG_LEVEL=info

# Redeploy
railway up --detach
```

---

## Troubleshooting

### If database still not connecting:

1. **Check Neon database is running**
   - Go to: https://console.neon.tech/app/projects/late-frost-78570282
   - Make sure database is active

2. **Test connection locally**
   ```bash
   cd packages/backend
   $env:NODE_ENV="production"
   $env:DB_CLIENT="postgresql"
   $env:DB_HOST="ep-late-heart-ahn3qwwd-pooler.c-3.us-east-1.aws.neon.tech"
   $env:DB_PORT="5432"
   $env:DB_NAME="neondb"
   $env:DB_USER="neondb_owner"
   $env:DB_PASSWORD="npg_fWy8liq7EhUr"
   npm run start
   ```

3. **Check Railway logs**
   ```bash
   railway logs
   ```

---

## THIS WILL FIX THE DATABASE CONNECTION!

Just add the variables in Railway dashboard and wait for redeploy.
