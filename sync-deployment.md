# 🔄 Sync Frontend (Vercel) with Backend (Railway)

## Current Setup
- **Frontend**: https://frontend-psi-swart-m9fuy6vv91.vercel.app (Vercel)
- **Backend**: https://aai-proposal-production.up.railway.app (Railway)
- **AI Service**: https://ai-proposal-ai-service.vercel.app (Vercel)
- **Database**: Neon PostgreSQL

## Issues to Fix
1. Frontend doesn't know Railway backend URL
2. Backend CORS not allowing Vercel frontend
3. Railway backend needs environment variables

---

## Fix 1: Update Frontend Environment Variable

### Option A: Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/abdul-samads-projects-818a9123/frontend/settings/environment-variables
2. Add new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://aai-proposal-production.up.railway.app`
   - **Environment**: Production
3. Click "Save"
4. Redeploy frontend:
   ```bash
   cd packages/frontend
   vercel --prod
   ```

### Option B: CLI
```bash
cd packages/frontend
echo "https://aai-proposal-production.up.railway.app" | vercel env add NEXT_PUBLIC_API_URL production
vercel --prod
```

---

## Fix 2: Update Backend CORS to Allow Vercel Frontend

### Railway Dashboard
1. Go to: https://railway.com/project/73d4e9fe-bcff-4d9b-9cb2-5506ea34f400
2. Click your service
3. Go to "Variables"
4. Click "Raw Editor"
5. Add/Update:

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

6. Click "Deploy" or wait for auto-deploy

---

## Fix 3: Update AI Service to Point to Railway Backend

1. Go to: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-ai-service/settings/environment-variables
2. Update `BACKEND_URL`:
   - **Value**: `https://aai-proposal-production.up.railway.app`
3. Redeploy:
   ```bash
   cd packages/ai-service
   vercel --prod
   ```

---

## Test Everything

### 1. Test Backend Health
```bash
curl https://aai-proposal-production.up.railway.app/health
```
Should return: `{"status":"healthy",...}`

### 2. Test Backend Database
```bash
curl https://aai-proposal-production.up.railway.app/api/status
```
Should show database is configured

### 3. Test Frontend
1. Visit: https://frontend-psi-swart-m9fuy6vv91.vercel.app
2. Open browser console (F12)
3. Try to login with: admin@example.com / admin123
4. Check Network tab - should see requests to Railway backend

### 4. Check CORS
If you see CORS errors in browser console:
- Make sure `FRONTEND_URL` in Railway matches exactly
- No trailing slashes
- Include https://

---

## Quick Fix Commands

```bash
# Update Frontend
cd packages/frontend
vercel env rm NEXT_PUBLIC_API_URL production
echo "https://aai-proposal-production.up.railway.app" | vercel env add NEXT_PUBLIC_API_URL production
vercel --prod

# Update AI Service  
cd ../ai-service
vercel env rm BACKEND_URL production
echo "https://aai-proposal-production.up.railway.app" | vercel env add BACKEND_URL production
vercel --prod
```

---

## Architecture After Sync

```
┌─────────────────────────────────────────┐
│  Frontend (Next.js) - VERCEL            │
│  https://frontend-psi-swart...          │
│  Env: NEXT_PUBLIC_API_URL=Railway      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend (Express) - RAILWAY            │
│  https://aai-proposal-production...     │
│  Env: FRONTEND_URL=Vercel Frontend     │
│       DB_*=Neon PostgreSQL             │
└──────────────┬──────────────────────────┘
               │
               ├──────────────┐
               │              │
               ▼              ▼
┌──────────────────┐  ┌──────────────────┐
│  AI Service      │  │  PostgreSQL DB   │
│  VERCEL          │  │  NEON            │
│  Env: BACKEND_   │  │                  │
│  URL=Railway     │  │                  │
└──────────────────┘  └──────────────────┘
```

---

## This Will Make Login Work!

The key is:
1. Frontend knows where backend is (NEXT_PUBLIC_API_URL)
2. Backend allows frontend origin (FRONTEND_URL in CORS)
3. Database is connected (DB_* variables)
