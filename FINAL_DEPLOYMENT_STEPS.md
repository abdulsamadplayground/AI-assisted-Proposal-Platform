# 🚀 FINAL DEPLOYMENT STEPS - SYNC EVERYTHING

## Current Status
- ✅ Frontend: Vercel (https://frontend-psi-swart-m9fuy6vv91.vercel.app)
- ✅ Backend: Railway (https://aai-proposal-production.up.railway.app)
- ✅ AI Service: Vercel (https://ai-proposal-ai-service.vercel.app)
- ✅ Database: Neon PostgreSQL (migrated & seeded)
- ✅ Code: Updated to use API_URL configuration

## What's Left: Add Environment Variables

### Step 1: Add Railway Backend Variables

Go to: https://railway.com/project/73d4e9fe-bcff-4d9b-9cb2-5506ea34f400

Click "Variables" → "Raw Editor" → Paste:

```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://frontend-psi-swart-m9fuy6vv91.vercel.app
AI_SERVICE_URL=https://ai-proposal-ai-service.vercel.app
JWT_SECRET=super-secret-jwt-key-change-this-123456789
JWT_EXPIRES_IN=24h
DB_CLIENT=postgresql
DB_HOST=ep-late-heart-ahn3qwwd-pooler.c-3.us-east-1.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=npg_fWy8liq7EhUr
LOG_LEVEL=info
```

Click "Deploy" - Railway will redeploy automatically.

### Step 2: Add Vercel Frontend Variable

Go to: https://vercel.com/abdul-samads-projects-818a9123/frontend/settings/environment-variables

Add:
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://aai-proposal-production.up.railway.app`
- **Environment**: Production

Then redeploy:
```bash
cd packages/frontend
vercel --prod
```

### Step 3: Update AI Service

Go to: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-ai-service/settings/environment-variables

Update `BACKEND_URL`:
- **Value**: `https://aai-proposal-production.up.railway.app`

Then redeploy:
```bash
cd packages/ai-service
vercel --prod
```

---

## Test Login

1. Visit: https://frontend-psi-swart-m9fuy6vv91.vercel.app
2. Click "Login"
3. Use credentials:
   - **Admin**: admin@example.com / admin123
   - **User**: user@example.com / user123
4. Should successfully login!

---

## Troubleshooting

### If login still doesn't work:

1. **Check Browser Console** (F12):
   - Look for CORS errors
   - Check if API URL is correct
   - See network requests

2. **Test Backend Directly**:
   ```bash
   curl https://aai-proposal-production.up.railway.app/health
   ```
   Should return: `{"status":"healthy"}`

3. **Test Database Connection**:
   ```bash
   curl https://aai-proposal-production.up.railway.app/api/status
   ```
   Should show database is configured

4. **Check Railway Logs**:
   - Go to Railway dashboard
   - Click "Logs" tab
   - Look for errors

---

## Architecture

```
Frontend (Vercel)
  ↓ NEXT_PUBLIC_API_URL
Backend (Railway)
  ↓ DB_HOST, DB_USER, etc.
Database (Neon)

Backend (Railway)
  ↓ AI_SERVICE_URL
AI Service (Vercel)
```

---

## THIS WILL MAKE EVERYTHING WORK!

Just add those environment variables and redeploy. The code is already updated to use them.
