# Phase 1 Verification Script
# Tests that all Phase 1 components are working correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 1: Security Foundation Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "[Test 1] Checking backend connection..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:3004" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Backend is running (Status: $($backend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
    Write-Host "   Make sure backend is running on port 3004" -ForegroundColor Red
    Write-Host "   Run: cd backend && npm run start:dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Check if frontend is running
Write-Host "[Test 2] Checking frontend connection..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Frontend is running (Status: $($frontend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend is not responding" -ForegroundColor Red
    Write-Host "   Make sure frontend is running on port 3000" -ForegroundColor Red
    Write-Host "   Run: cd frontend-nextjs && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 3: Test endpoint functionality
Write-Host "[Test 3] Testing Phase 1 test endpoint..." -ForegroundColor Yellow
try {
    $test = Invoke-RestMethod -Uri "http://localhost:3000/api/test" -Method Get
    if ($test.success) {
        Write-Host "✅ Test endpoint working" -ForegroundColor Green
        Write-Host "   Backend connection: $($test.results.backendConnection.status)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Test endpoint returned but with issues" -ForegroundColor Yellow
        Write-Host "   Message: $($test.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Test endpoint failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: CSRF Protection
Write-Host "[Test 4] Testing CSRF protection..." -ForegroundColor Yellow
try {
    $csrf = Invoke-RestMethod -Uri "http://localhost:3000/api/test" -Method Post -ErrorAction Stop
    Write-Host "❌ CSRF protection NOT working - POST succeeded without token" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ CSRF protection working (got 403 as expected)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Got unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 5: Rate Limiting
Write-Host "[Test 5] Testing rate limiting (making 101 requests)..." -ForegroundColor Yellow
$rateLimitHit = $false
for ($i = 1; $i -le 101; $i++) {
    try {
        Invoke-WebRequest -Uri "http://localhost:3000/api/test" -Method Get -UseBasicParsing -ErrorAction Stop | Out-Null
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "✅ Rate limiting working (hit limit at request $i)" -ForegroundColor Green
            $rateLimitHit = $true
            break
        }
    }
}

if (-not $rateLimitHit) {
    Write-Host "⚠️ Rate limit not hit (made 101 requests without 429)" -ForegroundColor Yellow
    Write-Host "   This might be OK if limits are higher than 100" -ForegroundColor Yellow
}

Write-Host ""

# Test 6: Environment variables
Write-Host "[Test 6] Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file exists" -ForegroundColor Green
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_API_URL") {
        Write-Host "✅ NEXT_PUBLIC_API_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "❌ NEXT_PUBLIC_API_URL not found in .env.local" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
}

Write-Host ""

# Test 7: File structure
Write-Host "[Test 7] Checking created files..." -ForegroundColor Yellow
$files = @(
    "lib/api/config.ts",
    "lib/api/errors.ts",
    "lib/api/client.ts",
    "middleware.ts",
    "app/api/test/route.ts"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 1 VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allFilesExist) {
    Write-Host "✅ All Phase 1 components are in place!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review PHASE1_COMPLETE.md for detailed documentation" -ForegroundColor White
    Write-Host "2. Test manually by visiting http://localhost:3000/api/test" -ForegroundColor White
    Write-Host "3. Ready to proceed to Phase 2: Authentication Flow" -ForegroundColor White
} else {
    Write-Host "⚠️ Some files are missing. Review implementation." -ForegroundColor Yellow
}

Write-Host ""

