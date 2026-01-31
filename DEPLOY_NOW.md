# 🚀 DEPLOY BACKEND TO RAILWAY NOW

## Step 1: Add Environment Variables to Railway

Go to: **https://railway.com/project/73d4e9fe-bcff-4d9b-9cb2-5506ea34f400**

1. Click on your backend service
2. Click **"Variables"** tab
3. Click **"RAW Editor"** button
4. **Copy and paste this ENTIRE block:**

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

5. Click **"Deploy"** or **"Save"**
6. Wait 1-2 minutes for deployment

---

## Step 2: Test Railway Backend

Open this URL in your browser:
```
https://aai-proposal-production.up.railway.app/health
```

Should see:
```json
{
  "status": "healthy",
  "database": "postgresql"
}
```

---

## Step 3: Update Frontend Environment Variable

Go to: **https://vercel.com/abdul-samads-projects-818a9123/frontend/settings/environment-variables**

1. Click **"Add New"**
2. Fill in:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://aai-proposal-production.up.railway.app`
   - **Environment:** Check "Production"
3. Click **"Save"**

---

## Step 4: Redeploy Frontend

Run this command:
```powershell
cd packages/frontend
vercel --prod
```

Wait for deployment to complete.

---

## Step 5: Test Login

1. Go to: **https://frontend-psi-swart-m9fuy6vv91.vercel.app**
2. Click **"Login"**
3. Use credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Should successfully login! ✅

---

## If Backend Still Fails

Run migrations on Railway:

```powershell
cd packages/backend

# Link to Railway
railway link

# Run migrations
railway run npm run migrate:latest

# Seed database
railway run npm run seed:run
```

---

## That's It!

Total time: **5 minutes**

Your app will be fully working:
- Frontend on Vercel ✅
- Backend on Railway ✅
- Database on Neon ✅
- AI Service on Vercel ✅
