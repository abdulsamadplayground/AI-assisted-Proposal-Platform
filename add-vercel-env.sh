#!/bin/bash

# Add environment variables to Vercel Backend
echo "Adding environment variables to Vercel backend..."

cd packages/backend

# Database
vercel env add DB_CLIENT production <<< "postgresql"
vercel env add DB_HOST production <<< "ep-late-heart-ahn3qwwd-pooler.c-3.us-east-1.aws.neon.tech"
vercel env add DB_PORT production <<< "5432"
vercel env add DB_NAME production <<< "neondb"
vercel env add DB_USER production <<< "neondb_owner"
vercel env add DB_PASSWORD production <<< "npg_fWy8liq7EhUr"

# Server
vercel env add NODE_ENV production <<< "production"
vercel env add PORT production <<< "3001"
vercel env add FRONTEND_URL production <<< "https://frontend-psi-swart-m9fuy6vv91.vercel.app"
vercel env add AI_SERVICE_URL production <<< "https://ai-proposal-ai-service.vercel.app"

# JWT
vercel env add JWT_SECRET production <<< "super-secret-jwt-key-change-this-to-something-random-123456789"
vercel env add JWT_EXPIRES_IN production <<< "24h"

# Logging
vercel env add LOG_LEVEL production <<< "info"

echo "✅ Environment variables added!"
echo "Now redeploy: vercel --prod"
