# Test Deployment Script
# Run this after adding environment variables to Railway

Write-Host "🧪 Testing AI Proposal Platform Deployment" -ForegroundColor Cyan
Write-Host ""

# Test Railway Backend
Write-Host "1️⃣ Testing Railway Backend..." -ForegroundColor Yellow
try {
    $railwayHealth = Invoke-RestMethod -Uri "https://aai-proposal-production.up.railway.app/health" -Method Get
    Write-Host "✅ Railway Backend: HEALTHY" -ForegroundColor Green
    Write-Host "   Database: $($railwayHealth.database)" -ForegroundColor Gray
    Write-Host "   Environment: $($railwayHealth.environment)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Railway Backend: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test Railway Database Status
Write-Host "2️⃣ Testing Railway Database Connection..." -ForegroundColor Yellow
try {
    $railwayStatus = Invoke-RestMethod -Uri "https://aai-proposal-production.up.railway.app/api/status" -Method Get
    if ($railwayStatus.status -eq "configured") {
        Write-Host "✅ Database: CONFIGURED" -ForegroundColor Green
        Write-Host "   Client: $($railwayStatus.database.client)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Database: NOT CONFIGURED" -ForegroundColor Red
        Write-Host "   Message: $($railwayStatus.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Database Status: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test AI Service
Write-Host "3️⃣ Testing AI Service (Vercel)..." -ForegroundColor Yellow
try {
    $aiHealth = Invoke-RestMethod -Uri "https://ai-proposal-ai-service.vercel.app/health" -Method Get
    Write-Host "✅ AI Service: HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "❌ AI Service: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test Frontend
Write-Host "4️⃣ Testing Frontend (Vercel)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://frontend-psi-swart-m9fuy6vv91.vercel.app" -Method Get
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend: ACCESSIBLE" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "📋 SUMMARY" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed:" -ForegroundColor White
Write-Host "  1. Railway backend is working ✅" -ForegroundColor Gray
Write-Host "  2. Database is connected ✅" -ForegroundColor Gray
Write-Host "  3. AI service is working ✅" -ForegroundColor Gray
Write-Host "  4. Frontend is accessible ✅" -ForegroundColor Gray
Write-Host ""
Write-Host "Next step: Update frontend environment variable" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_API_URL=https://aai-proposal-production.up.railway.app" -ForegroundColor Gray
Write-Host ""
Write-Host "Then test login at:" -ForegroundColor White
Write-Host "  https://frontend-psi-swart-m9fuy6vv91.vercel.app" -ForegroundColor Cyan
Write-Host ""
