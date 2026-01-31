# Vercel Deployment Guide

This guide will help you deploy the AI Proposal Platform to Vercel.

## Architecture

The platform consists of 3 separate services that need to be deployed:

1. **Frontend** (Next.js) - User interface
2. **Backend** (Node.js/Express) - API Gateway
3. **AI Service** (Python/FastAPI) - LLM integration

## Prerequisites

1. Vercel account (https://vercel.com)
2. Vercel CLI installed: `npm install -g vercel`
3. PostgreSQL database (SQLite won't work on Vercel)
   - Recommended: Vercel Postgres, Neon, Supabase, or Railway

## Step 1: Setup PostgreSQL Database

Choose one of these providers:

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to Storage > Create Database > Postgres
3. Copy the connection details

### Option B: Neon (Free tier available)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string

### Option C: Supabase
1. Sign up at https://supabase.com
2. Create a new project
3. Get connection details from Settings > Database

## Step 2: Deploy Frontend

```bash
cd packages/frontend
vercel
```

Follow the prompts:
- Link to existing project or create new
- Set build command: `npm run build`
- Set output directory: `.next`

### Frontend Environment Variables (Vercel Dashboard)
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

## Step 3: Deploy Backend

```bash
cd packages/backend
vercel
```

### Backend Environment Variables (Vercel Dashboard)
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app

# JWT
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=24h

# AI Service
AI_SERVICE_URL=https://your-ai-service.vercel.app

# PostgreSQL Database
DB_CLIENT=postgresql
DB_HOST=<your-postgres-host>
DB_PORT=5432
DB_NAME=<your-database-name>
DB_USER=<your-database-user>
DB_PASSWORD=<your-database-password>

# Logging
LOG_LEVEL=info
```

### Run Database Migrations

After deploying backend, run migrations:

```bash
# Install Vercel CLI if not already
npm install -g vercel

# Link to your backend project
cd packages/backend
vercel link

# Run migrations
vercel env pull .env.production
npm run migrate:latest
```

## Step 4: Deploy AI Service

```bash
cd packages/ai-service
vercel
```

### AI Service Environment Variables (Vercel Dashboard)
```
ENVIRONMENT=production
PORT=8000
HOST=0.0.0.0

# Backend URL
BACKEND_URL=https://your-backend.vercel.app

# LLM Configuration
LLM_PROVIDER=groq
GROQ_API_KEY=<your-groq-api-key>
GROQ_MODEL=llama-3.3-70b-versatile

# LLM Settings
LLM_MAX_RETRIES=3
LLM_TIMEOUT=30
LLM_MAX_TOKENS=500
LLM_TEMPERATURE=0.7

# Logging
LOG_LEVEL=INFO
```

## Step 5: Update URLs

After all services are deployed, update the environment variables with the actual URLs:

1. **Frontend** → Update `NEXT_PUBLIC_API_URL` with backend URL
2. **Backend** → Update `FRONTEND_URL` and `AI_SERVICE_URL`
3. **AI Service** → Update `BACKEND_URL`

Redeploy each service after updating URLs:
```bash
vercel --prod
```

## Step 6: Verify Deployment

1. Visit your frontend URL
2. Try logging in (default admin: admin@example.com / admin123)
3. Create a test proposal
4. Check that AI generation works

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL credentials
- Check if database allows connections from Vercel IPs
- Ensure SSL is enabled if required

### AI Service Not Responding
- Check GROQ_API_KEY is valid
- Verify BACKEND_URL is correct
- Check Vercel function logs

### CORS Errors
- Verify FRONTEND_URL in backend matches actual frontend URL
- Check BACKEND_URL in AI service

### Build Failures
- Check Node.js version (>=18.0.0)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

## Monitoring

- View logs: Vercel Dashboard > Your Project > Logs
- Monitor performance: Vercel Dashboard > Analytics
- Check function execution: Vercel Dashboard > Functions

## Cost Optimization

- Use Vercel's free tier for hobby projects
- Consider Neon's free tier for PostgreSQL
- Monitor API usage to stay within limits

## Security Checklist

- ✅ All .env files are in .gitignore
- ✅ Strong JWT_SECRET generated
- ✅ Database credentials secured
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ HTTPS enforced (automatic on Vercel)

## Useful Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>

# Pull environment variables
vercel env pull
```

## Support

For issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Review deployment logs
3. Check GitHub repository issues
