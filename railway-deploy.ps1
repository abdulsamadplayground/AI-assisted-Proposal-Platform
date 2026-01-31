# Railway Backend Deployment Script
# This script adds environment variables and deploys to Railway

Write-Host "🚂 Railway Backend Deployment" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "Checking Railway CLI..." -ForegroundColor Yellow
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI installed: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Railway CLI:" -ForegroundColor Yellow
    Write-Host "  npm install -g @railway/cli" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or use the Railway dashboard instead:" -ForegroundColor Yellow
    Write-Host "  https://railway.com/project/73d4e9fe-bcff-4d9b-9cb2-5506ea34f400" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Navigate to backend directory
Write-Host "Navigating to backend directory..." -ForegroundColor Yellow
Set-Location packages/backend

Write-Host ""

# Link to Railway project
Write-Host "Linking to Railway project..." -ForegroundColor Yellow
Write-Host "If prompted, select your backend service" -ForegroundColor Gray
railway link

Write-Host ""

# Add environment variables
Write-Host "Adding environment variables..." -ForegroundColor Yellow

$envVars = @{
    "NODE_ENV" = "production"
    "PORT" = "3001"
    "FRONTEND_URL" = "https://frontend-psi-swart-m9fuy6vv91.vercel.app"
    "AI_SERVICE_URL" = "https://ai-proposal-ai-service.vercel.app"
    "JWT_SECRET" = "super-secret-jwt-key-change-this-123456789"
    "JWT_EXPIRES_IN" = "24h"
    "DB_CLIENT" = "postgresql"
    "DB_HOST" = "ep-late-heart-ahn3qwwd-pooler.c-3.us-east-1.aws.neon.tech"
    "DB_PORT" = "5432"
    "DB_NAME" = "neondb"
    "DB_USER" = "neondb_owner"
    "DB_PASSWORD" = "npg_fWy8liq7EhUr"
    "LOG_LEVEL" = "info"
}

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "  Setting $key..." -ForegroundColor Gray
    railway variables set "$key=$value"
}

Write-Host "✅ Environment variables added" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
railway run npm run migrate:latest

Write-Host ""

# Seed database
Write-Host "Seeding database..." -ForegroundColor Yellow
railway run npm run seed:run

Write-Host ""

# Deploy
Write-Host "Deploying to Railway..." -ForegroundColor Yellow
railway up --detach

Write-Host ""
Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "Check deployment status:" -ForegroundColor Yellow
Write-Host "  railway logs" -ForegroundColor Gray
Write-Host ""
Write-Host "Test backend:" -ForegroundColor Yellow
Write-Host "  https://aai-proposal-production.up.railway.app/health" -ForegroundColor Cyan
Write-Host ""

# Return to root
Set-Location ../..
