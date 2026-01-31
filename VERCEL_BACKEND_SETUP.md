# Deploy Backend to Vercel (Alternative Option)

## ⚠️ Warning
Railway is better for this backend, but if you want to use Vercel, here's how.

---

## Prerequisites

Your backend needs these changes for Vercel serverless:

1. **Database connection pooling** (PostgreSQL connections are limited)
2. **Serverless-friendly code** (no persistent connections)
3. **Environment variables in Vercel**

---

## Step 1: Add Environment Variables to Vercel Backend

Go to: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-backend/settings/environment-variables

Add these variables:

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

---

## Step 2: Update Database Configuration for Serverless

The current database config needs connection pooling for Vercel.

**Current issue:** Knex creates persistent connections, but Vercel serverless functions are stateless.

**Solution:** Use Neon's serverless driver or configure connection pooling properly.

---

## Step 3: Set Root Directory in Vercel

1. Go to: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-backend/settings
2. Navigate to **General** → **Root Directory**
3. Click **Edit**
4. Set to: `packages/backend`
5. Click **Save**

---

## Step 4: Deploy Backend to Vercel

```powershell
cd packages/backend
vercel --prod
```

---

## Step 5: Update Frontend to Use Vercel Backend

Go to: https://vercel.com/abdul-samads-projects-818a9123/frontend/settings/environment-variables

Update `NEXT_PUBLIC_API_URL`:
- Value: `https://ai-proposal-backend-pink.vercel.app`

Redeploy frontend:
```powershell
cd packages/frontend
vercel --prod
```

---

## Issues You Might Face

### 1. Cold Starts
- First request after inactivity will be slow (3-5 seconds)
- Railway doesn't have this problem

### 2. Database Connection Limits
- Vercel serverless creates many connections
- Neon free tier has connection limits
- Need proper connection pooling

### 3. Debugging
- Harder to see logs in Vercel
- Railway has better log viewing

---

## Recommendation

**Stick with Railway for backend!** It's:
- Already working ✅
- Better for Express apps ✅
- Easier to manage ✅
- No cold starts ✅

Just connect your frontend to Railway backend and you're done!

---

## If You Insist on Vercel Backend

You'll need to:
1. Fix database connection pooling
2. Handle serverless limitations
3. Deal with cold starts
4. Reconfigure everything

**Estimated time:** 30-60 minutes  
**vs Railway:** 2 minutes to connect frontend

**Your choice!** But Railway is the better option here.
