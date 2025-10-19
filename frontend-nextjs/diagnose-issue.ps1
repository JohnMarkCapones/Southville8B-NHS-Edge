# Quick Diagnostic Script for Login Issue
# Run this to identify the problem

Write-Host "🔍 Diagnosing Login Issue..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Backend connectivity
Write-Host "1. Testing Backend Connectivity" -ForegroundColor Yellow
Write-Host "   Trying port 3000..." -ForegroundColor Gray
$port3000 = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Backend responding on port 3000" -ForegroundColor Green
    $port3000 = $true
} catch {
    Write-Host "   ❌ Backend NOT responding on port 3000" -ForegroundColor Red
}

Write-Host "   Trying port 3004..." -ForegroundColor Gray
$port3004 = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3004/api/v1/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Backend responding on port 3004" -ForegroundColor Green
    $port3004 = $true
} catch {
    Write-Host "   ❌ Backend NOT responding on port 3004" -ForegroundColor Red
}
Write-Host ""

# Check 2: Read .env.local
Write-Host "2. Checking Frontend Configuration" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $apiUrl = $envContent | Select-String "NEXT_PUBLIC_API_URL" | ForEach-Object { $_.Line }
    
    if ($apiUrl) {
        Write-Host "   Current config: $apiUrl" -ForegroundColor Gray
        
        if ($apiUrl -match "3000" -and $port3000) {
            Write-Host "   ✅ Frontend configured for port 3000 (backend is running there)" -ForegroundColor Green
        } elseif ($apiUrl -match "3004" -and $port3004) {
            Write-Host "   ✅ Frontend configured for port 3004 (backend is running there)" -ForegroundColor Green
        } elseif ($apiUrl -match "3000" -and -not $port3000) {
            Write-Host "   ❌ PORT MISMATCH: Frontend expects 3000 but backend not running there!" -ForegroundColor Red
            Write-Host "   💡 Fix: Update .env.local to use port where backend is running" -ForegroundColor Yellow
        } elseif ($apiUrl -match "3004" -and -not $port3004) {
            Write-Host "   ❌ PORT MISMATCH: Frontend expects 3004 but backend not running there!" -ForegroundColor Red
            Write-Host "   💡 Fix: Update .env.local to use port where backend is running" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  NEXT_PUBLIC_API_URL not found in .env.local" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "   💡 Fix: Create .env.local file with NEXT_PUBLIC_API_URL" -ForegroundColor Yellow
}
Write-Host ""

# Check 3: Test /users/me endpoint
Write-Host "3. Testing /users/me Endpoint" -ForegroundColor Yellow
$backendPort = if ($port3004) { 3004 } elseif ($port3000) { 3000 } else { $null }

if ($backendPort) {
    Write-Host "   Testing GET /users/me (without auth, should return 401)..." -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$backendPort/api/v1/users/me" -UseBasicParsing -ErrorAction Stop
        Write-Host "   ⚠️  Unexpected: Endpoint accessible without auth" -ForegroundColor Yellow
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "   ✅ Endpoint exists and requires authentication (correct)" -ForegroundColor Green
        } elseif ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "   ❌ Endpoint not found (404) - backend might not have /users/me" -ForegroundColor Red
        } else {
            Write-Host "   ⚠️  Got status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ⚠️  Cannot test - backend not running on either port" -ForegroundColor Yellow
}
Write-Host ""

# Diagnosis Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📋 DIAGNOSIS SUMMARY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if (-not $port3000 -and -not $port3004) {
    Write-Host "❌ ISSUE: Backend is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 FIX:" -ForegroundColor Yellow
    Write-Host "   1. Open a new terminal" -ForegroundColor Gray
    Write-Host "   2. cd Southville8B-NHS-Edge/core-api-layer/southville-nhs-school-portal-api-layer" -ForegroundColor Gray
    Write-Host "   3. npm run start:dev" -ForegroundColor Gray
    Write-Host "   4. Wait for the startup message showing the port" -ForegroundColor Gray
    Write-Host "   5. Note the port number" -ForegroundColor Gray
    Write-Host "   6. Update frontend .env.local to match that port" -ForegroundColor Gray
    Write-Host "   7. Restart frontend dev server" -ForegroundColor Gray
} elseif ($port3000 -and -not $port3004) {
    Write-Host "⚠️  Backend is running on port 3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 FIX:" -ForegroundColor Yellow
    Write-Host "   Update frontend-nextjs/.env.local:" -ForegroundColor Gray
    Write-Host "   NEXT_PUBLIC_API_URL=http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   INTERNAL_API_URL=http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Then restart frontend: npm run dev" -ForegroundColor Gray
} elseif ($port3004 -and -not $port3000) {
    Write-Host "✅ Backend is running on port 3004 (correct)" -ForegroundColor Green
    Write-Host ""
    Write-Host "   If still having issues:" -ForegroundColor Yellow
    Write-Host "   1. Clear browser cookies (Ctrl+Shift+Delete)" -ForegroundColor Gray
    Write-Host "   2. Restart frontend dev server" -ForegroundColor Gray
    Write-Host "   3. Login again" -ForegroundColor Gray
    Write-Host "   4. Check browser console for detailed error logs" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Backend is running on BOTH ports?!" -ForegroundColor Yellow
    Write-Host "   This is unusual. You might have two instances running." -ForegroundColor Gray
    Write-Host "   Use port 3004 (recommended)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Need more help? Check TROUBLESHOOTING_LOGIN.md" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

