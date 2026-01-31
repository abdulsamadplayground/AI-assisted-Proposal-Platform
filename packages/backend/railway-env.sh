#!/bin/bash

# Add environment variables to Railway
echo "Adding environment variables to Railway..."

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

echo "✅ Environment variables added!"
echo "Now deploy with: railway up"
