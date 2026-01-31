# Connect Frontend to Railway Backend

Write-Host "🔗 Connecting Frontend to Railway Backend" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://aai-proposal-production.up.railway.app"
$frontendUrl = "https://frontend-psi-swart-m9fuy6vv91.vercel.app"

# Test backend first
Write-Host "1. Testing Railway backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get
    Write-Host "   ✅ Backend is healthy!" -ForegroundColor Green
    Write-Host "   Database: $($health.database)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend is not responding!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Fix backend first before continuing!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Navigate to frontend
Write-Host "2. Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location packages/frontend

Write-Host ""

# Add environment variable to Vercel
Write-Host "3. Adding environment variable to Vercel..." -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_API_URL=$backendUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "   You need to add this manually in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/abdul-samads-projects-818a9123/frontend/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Steps:" -ForegroundColor White
Write-Host "   1. Click 'Add New'" -ForegroundColor Gray
Write-Host "   2. Key: NEXT_PUBLIC_API_URL" -ForegroundColor Gray
Write-Host "   3. Value: $backendUrl" -ForegroundColor Gray
Write-Host "   4. Environment: Production (check the box)" -ForegroundColor Gray
Write-Host "   5. Click 'Save'" -ForegroundColor Gray
Write-Host ""

# Ask user to confirm
$response = Read-Host "Have you added the environment variable in Vercel? (y/n)"

if ($response -ne "y") {
    Write-Host ""
    Write-Host "Please add the environment variable first, then run this script again." -ForegroundColor Yellow
    Set-Location ../..
    exit 0
}

Write-Host ""

# Deploy frontend
Write-Host "4. Deploying frontend to Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host ""
Write-Host "✅ Frontend deployed!" -ForegroundColor Green
Write-Host ""

# Test frontend
Write-Host "5. Testing frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -Method Get
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is accessible!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Frontend might still be deploying..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Test your application:" -ForegroundColor Yellow
Write-Host "1. Go to: $frontendUrl" -ForegroundColor Cyan
Write-Host "2. Click 'Login'" -ForegroundColor White
Write-Host "3. Use credentials:" -ForegroundColor White
Write-Host "   Email: admin@example.com" -ForegroundColor Gray
Write-Host "   Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "If login works, you're done! 🚀" -ForegroundColor Green
Write-Host ""

# Return to root
Set-Location ../..
