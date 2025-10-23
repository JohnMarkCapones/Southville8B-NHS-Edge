# Simple Backend Check Script

Write-Host "Checking Backend Status..." -ForegroundColor Cyan
Write-Host ""

# Test port 3000
Write-Host "Testing port 3000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "SUCCESS: Backend is running on port 3000" -ForegroundColor Green
    $port3000 = $true
} catch {
    Write-Host "FAILED: Backend NOT running on port 3000" -ForegroundColor Red
    $port3000 = $false
}

Write-Host ""

# Test port 3004
Write-Host "Testing port 3004..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3004/api/v1/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "SUCCESS: Backend is running on port 3004" -ForegroundColor Green
    $port3004 = $true
} catch {
    Write-Host "FAILED: Backend NOT running on port 3004" -ForegroundColor Red
    $port3004 = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if (-not $port3000 -and -not $port3004) {
    Write-Host "PROBLEM: Backend is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "TO FIX:" -ForegroundColor Yellow
    Write-Host "1. Open terminal in backend directory" -ForegroundColor Gray
    Write-Host "2. Run: npm run start:dev" -ForegroundColor Gray
    Write-Host "3. Wait for it to start" -ForegroundColor Gray
    Write-Host "4. Note the port number from startup message" -ForegroundColor Gray
    Write-Host "5. Update frontend .env.local with that port" -ForegroundColor Gray
} elseif ($port3000 -and -not $port3004) {
    Write-Host "PROBLEM: Backend on port 3000, but frontend expects 3004" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "TO FIX - Update .env.local:" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_API_URL=http://localhost:3000" -ForegroundColor Cyan
    Write-Host "INTERNAL_API_URL=http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then restart frontend dev server" -ForegroundColor Gray
} elseif ($port3004 -and -not $port3000) {
    Write-Host "OK: Backend running on port 3004 (correct)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend should be configured correctly." -ForegroundColor Gray
    Write-Host "If still having issues, try:" -ForegroundColor Yellow
    Write-Host "1. Clear browser cookies" -ForegroundColor Gray
    Write-Host "2. Restart frontend dev server" -ForegroundColor Gray
    Write-Host "3. Login again and check console" -ForegroundColor Gray
}

Write-Host "========================================" -ForegroundColor Cyan

