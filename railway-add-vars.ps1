# Railway Environment Variables Setup
Write-Host "Setting up Railway environment variables..." -ForegroundColor Green

Set-Location packages/backend

# Read .env.production and add each variable
$envFile = Get-Content .env.production

foreach ($line in $envFile) {
    if ($line -match '^([^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        if ($key -and $value -and -not $key.StartsWith('#')) {
            Write-Host "Adding $key..." -ForegroundColor Yellow
            railway variables set "$key=$value"
        }
    }
}

Write-Host "`nDone! Railway will redeploy automatically." -ForegroundColor Green
