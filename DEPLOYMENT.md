# Vercel Deployment Guide

## Prerequisites
- Vercel account connected to your GitHub repository
- Groq API key (or OpenAI/Azure API key)

## Environment Variables to Set in Vercel

### Frontend Environment Variables
Go to your Vercel project settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

### Backend Environment Variables
Add these in Vercel:

```
# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://ai-assisted-proposal-platform-ntd5r2ucr.vercel.app

# JWT Configuration
JWT_SECRET=your-strong-secret-key-here-change-this
JWT_EXPIRES_IN=24h

# AI Service Configuration
AI_SERVICE_URL=https://your-ai-service-url.vercel.app

# Database Configuration (PostgreSQL for production)
DB_CLIENT=postgresql
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password

# Logging
LOG_LEVEL=info
```

### AI Service Environment Variables
Add these in Vercel (or deploy separately):

```
# Server Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production

# Backend URL
BACKEND_URL=https://your-backend-url.vercel.app

# LLM Provider Configuration
LLM_PROVIDER=groq

# LLM Settings
LLM_MAX_RETRIES=3
LLM_TIMEOUT=30
LLM_MAX_TOKENS=500
LLM_TEMPERATURE=0.7

# Groq Configuration
GROQ_API_KEY=your-actual-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile

# Logging
LOG_LEVEL=INFO
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `packages/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add all environment variables listed above
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Post-Deployment

1. **Set up Database**: 
   - Create a PostgreSQL database (recommended: Vercel Postgres, Supabase, or Neon)
   - Run migrations: `npm run migrate` in backend

2. **Test the deployment**:
   - Visit your frontend URL
   - Try logging in
   - Create a test proposal

3. **Update CORS settings**:
   - Make sure backend CORS allows your frontend URL

## Separate Service Deployments

Since this is a monorepo with 3 services, you may need to deploy them separately:

### Frontend (Next.js)
- Root Directory: `packages/frontend`
- Build Command: `npm run build`
- Output Directory: `.next`

### Backend (Express API)
- Root Directory: `packages/backend`
- Build Command: `npm run build` (if you have one)
- Output Directory: `dist`

### AI Service (Python FastAPI)
- Deploy to a Python-compatible platform (Railway, Render, or separate Vercel project)
- Or use Vercel with Python runtime

## Troubleshooting

### Build Fails
- Check that all dependencies are in package.json
- Verify Node version (>=18.0.0)

### Environment Variables Not Working
- Make sure they're set in Vercel dashboard
- Redeploy after adding new variables

### Database Connection Issues
- Verify PostgreSQL credentials
- Check that database allows connections from Vercel IPs
- Enable SSL for database connection

## Important Notes

⚠️ **Never commit .env files to git**
✅ Always use Vercel's environment variables dashboard
✅ Keep your repository private if it contains sensitive data
✅ Use different API keys for development and production
