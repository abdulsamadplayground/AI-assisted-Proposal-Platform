# Deploy Backend to Railway

Railway is perfect for Express apps - no serverless complexity!

## Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

## Step 3: Initialize Railway Project

```bash
cd packages/backend
railway init
```

- Project name: `ai-proposal-backend`
- Select: Create new project

## Step 4: Add Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set FRONTEND_URL=https://frontend-psi-swart-m9fuy6vv91.vercel.app
railway variables set AI_SERVICE_URL=https://ai-proposal-ai-service.vercel.app

# JWT
railway variables set JWT_SECRET=super-secret-jwt-key-change-this-to-something-random-123456789
railway variables set JWT_EXPIRES_IN=24h

# Database (Neon PostgreSQL)
railway variables set DB_CLIENT=postgresql
railway variables set DB_HOST=ep-late-heart-ahn3qwwd-pooler.c-3.us-east-1.aws.neon.tech
railway variables set DB_PORT=5432
railway variables set DB_NAME=neondb
railway variables set DB_USER=neondb_owner
railway variables set DB_PASSWORD=npg_fWy8liq7EhUr

# Logging
railway variables set LOG_LEVEL=info
```

## Step 5: Deploy

```bash
railway up
```

## Step 6: Get Your Backend URL

```bash
railway domain
```

This will give you a URL like: `https://ai-proposal-backend-production.up.railway.app`

## Step 7: Update Frontend & AI Service

Update environment variables in Vercel:

### Frontend
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

### AI Service
```
BACKEND_URL=https://your-backend.up.railway.app
```

### Backend (Railway)
```
FRONTEND_URL=https://frontend-psi-swart-m9fuy6vv91.vercel.app
AI_SERVICE_URL=https://ai-proposal-ai-service.vercel.app
```

## That's It!

Your backend will be running on Railway with:
- ✅ Automatic deployments on git push
- ✅ Free tier available
- ✅ Perfect for Express apps
- ✅ Built-in monitoring
- ✅ Easy scaling

## Alternative: Quick Deploy Button

Or use Railway's GitHub integration:
1. Push code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables
6. Deploy!
