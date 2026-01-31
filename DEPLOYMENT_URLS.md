# Deployment URLs

## ✅ Successfully Deployed Services

### Frontend (Next.js)
- **Production URL**: https://frontend-7l4gdejza-abdul-samads-projects-818a9123.vercel.app
- **Alias URL**: https://frontend-psi-swart-m9fuy6vv91.vercel.app
- **Dashboard**: https://vercel.com/abdul-samads-projects-818a9123/frontend/settings

### Backend (Node.js/Express)
- **Production URL**: https://ai-proposal-backend-nzszjbyrk-abdul-samads-projects-818a9123.vercel.app
- **Alias URL**: https://ai-proposal-backend-pink.vercel.app
- **Dashboard**: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-backend/settings

### AI Service (Python/FastAPI)
- **Production URL**: https://ai-proposal-ai-service-4f8h14qu6-abdul-samads-projects-818a9123.vercel.app
- **Alias URL**: https://ai-proposal-ai-service.vercel.app
- **Dashboard**: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-ai-service/settings

---

## 🔧 Next Steps - CRITICAL

### 1. Setup PostgreSQL Database

**SQLite won't work on Vercel!** You need to setup PostgreSQL:

#### Option A: Vercel Postgres (Recommended)
1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Copy the connection details

#### Option B: Neon (Free tier)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string

### 2. Add Environment Variables

Go to each service's dashboard and add these environment variables:

#### Frontend Environment Variables
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://ai-proposal-backend-pink.vercel.app
```

#### Backend Environment Variables
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://frontend-psi-swart-m9fuy6vv91.vercel.app

# JWT
JWT_SECRET=<generate-a-strong-random-secret>
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

#### AI Service Environment Variables
```
ENVIRONMENT=production
PORT=8000
HOST=0.0.0.0

# Backend URL
BACKEND_URL=https://ai-proposal-backend-pink.vercel.app

# LLM Configuration (Groq API key already added ✓)
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

### 3. Run Database Migrations

After setting up PostgreSQL and adding environment variables:

```bash
cd packages/backend
vercel env pull .env.production
npm run migrate:latest
npm run seed:run
```

### 4. Redeploy All Services

After adding environment variables, redeploy to apply changes:

```bash
# Frontend
cd packages/frontend
vercel --prod

# Backend
cd packages/backend
vercel --prod

# AI Service
cd packages/ai-service
vercel --prod
```

### 5. Test the Application

1. Visit: https://frontend-psi-swart-m9fuy6vv91.vercel.app
2. Try logging in with default credentials:
   - Admin: admin@example.com / admin123
   - User: user@example.com / user123
3. Create a test proposal
4. Verify AI generation works

---

## 📋 Quick Commands

### View Logs
```bash
vercel logs <deployment-url>
```

### List All Deployments
```bash
vercel ls
```

### Pull Environment Variables
```bash
vercel env pull
```

### Redeploy
```bash
vercel --prod
```

---

## ⚠️ Important Notes

1. **Database is REQUIRED**: The backend will not work without PostgreSQL
2. **Environment Variables**: Must be set in Vercel dashboard for each service
3. **CORS**: Make sure URLs match exactly (no trailing slashes)
4. **API Keys**: Groq API key must be valid and have sufficient credits
5. **Migrations**: Must be run after database setup

---

## 🐛 Troubleshooting

### Backend Not Connecting to Database
- Check PostgreSQL credentials in environment variables
- Verify database allows connections from Vercel
- Check logs: `vercel logs <backend-url>`

### Frontend Can't Reach Backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend is deployed and running

### AI Service Not Responding
- Verify `GROQ_API_KEY` is valid
- Check `BACKEND_URL` is correct
- Review function logs in Vercel dashboard

### CORS Errors
- Ensure all URLs match exactly
- No trailing slashes in URLs
- Check `FRONTEND_URL` in backend env vars

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- PostgreSQL Setup: https://vercel.com/docs/storage/vercel-postgres
- Deployment Issues: Check logs in Vercel dashboard
