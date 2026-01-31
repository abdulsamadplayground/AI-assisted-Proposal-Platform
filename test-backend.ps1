# Quick Backend Test Script

Write-Host "🧪 Testing Railway Backend" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://aai-proposal-production.up.railway.app"

# Test 1: Health Check
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get
    Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Database: $($health.database)" -ForegroundColor Gray
    Write-Host "   Environment: $($health.environment)" -ForegroundColor Gray
    $healthOk = $true
} catch {
    Write-Host "❌ Health check failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $healthOk = $false
}

Write-Host ""

# Test 2: Database Status
Write-Host "2. Testing database connection..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$backendUrl/api/status" -Method Get
    if ($status.status -eq "configured") {
        Write-Host "✅ Database is configured!" -ForegroundColor Green
        Write-Host "   Client: $($status.database.client)" -ForegroundColor Gray
        Write-Host "   Host: $($status.database.host)" -ForegroundColor Gray
        $dbOk = $true
    } else {
        Write-Host "❌ Database not configured!" -ForegroundColor Red
        Write-Host "   Message: $($status.message)" -ForegroundColor Red
        $dbOk = $false
    }
} catch {
    Write-Host "❌ Database check failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $dbOk = $false
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Summary
if ($healthOk -and $dbOk) {
    Write-Host "🎉 SUCCESS! Backend is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update frontend environment variable:" -ForegroundColor White
    Write-Host "   Go to: https://vercel.com/abdul-samads-projects-818a9123/frontend/settings/environment-variables" -ForegroundColor Gray
    Write-Host "   Add: NEXT_PUBLIC_API_URL = $backendUrl" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Redeploy frontend:" -ForegroundColor White
    Write-Host "   cd packages/frontend" -ForegroundColor Gray
    Write-Host "   vercel --prod" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Test login at:" -ForegroundColor White
    Write-Host "   https://frontend-psi-swart-m9fuy6vv91.vercel.app" -ForegroundColor Cyan
} else {
    Write-Host "❌ Backend has issues!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check Railway logs:" -ForegroundColor White
    Write-Host "   railway logs" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Verify environment variables in Railway dashboard:" -ForegroundColor White
    Write-Host "   https://railway.com/project/73d4e9fe-bcff-4d9b-9cb2-5506ea34f400" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Check if migrations ran:" -ForegroundColor White
    Write-Host "   railway run npm run migrate:latest" -ForegroundColor Gray
}

Write-Host ""
