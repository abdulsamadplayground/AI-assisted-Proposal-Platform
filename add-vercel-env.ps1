# Add environment variables to Vercel Backend
Write-Host "Adding environment variables to Vercel backend..." -ForegroundColor Green

Set-Location packages/backend

# Database
Write-Host "Adding DB_CLIENT..." -ForegroundColor Yellow
"postgresql" | vercel env add DB_CLIENT production

Write-Host "Adding DB_HOST..." -ForegroundColor Yellow
"ep-late-heart-ahn3qwwd-pooler.c-3.us-east-1.aws.neon.tech" | vercel env add DB_HOST production

Write-Host "Adding DB_PORT..." -ForegroundColor Yellow
"5432" | vercel env add DB_PORT production

Write-Host "Adding DB_NAME..." -ForegroundColor Yellow
"neondb" | vercel env add DB_NAME production

Write-Host "Adding DB_USER..." -ForegroundColor Yellow
"neondb_owner" | vercel env add DB_USER production

Write-Host "Adding DB_PASSWORD..." -ForegroundColor Yellow
"npg_fWy8liq7EhUr" | vercel env add DB_PASSWORD production

# Server
Write-Host "Adding NODE_ENV..." -ForegroundColor Yellow
"production" | vercel env add NODE_ENV production

Write-Host "Adding PORT..." -ForegroundColor Yellow
"3001" | vercel env add PORT production

Write-Host "Adding FRONTEND_URL..." -ForegroundColor Yellow
"https://frontend-psi-swart-m9fuy6vv91.vercel.app" | vercel env add FRONTEND_URL production

Write-Host "Adding AI_SERVICE_URL..." -ForegroundColor Yellow
"https://ai-proposal-ai-service.vercel.app" | vercel env add AI_SERVICE_URL production

# JWT
Write-Host "Adding JWT_SECRET..." -ForegroundColor Yellow
"super-secret-jwt-key-change-this-to-something-random-123456789" | vercel env add JWT_SECRET production

Write-Host "Adding JWT_EXPIRES_IN..." -ForegroundColor Yellow
"24h" | vercel env add JWT_EXPIRES_IN production

# Logging
Write-Host "Adding LOG_LEVEL..." -ForegroundColor Yellow
"info" | vercel env add LOG_LEVEL production

Set-Location ../..

Write-Host "`n✅ Environment variables added!" -ForegroundColor Green
Write-Host "Now redeploy with: cd packages/backend; vercel --prod" -ForegroundColor Cyan
