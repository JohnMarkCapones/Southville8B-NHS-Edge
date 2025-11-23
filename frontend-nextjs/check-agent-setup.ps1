# Quick Agent Setup Checker
Write-Host "=== CampusConnect AI Setup Checker ===" -ForegroundColor Cyan
Write-Host ""

$issues = @()

# Check 1: .env.local file exists
Write-Host "Checking .env.local file..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
    
    # Check for OPENAI_API_KEY
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "OPENAI_API_KEY\s*=") {
        $keyMatch = $envContent -match "OPENAI_API_KEY\s*=\s*(.+)"
        if ($matches[1] -and $matches[1].Trim() -ne "" -and $matches[1].Trim() -notmatch "your.*key|sk-.*here") {
            Write-Host "✅ OPENAI_API_KEY is set" -ForegroundColor Green
        } else {
            Write-Host "❌ OPENAI_API_KEY is empty or placeholder" -ForegroundColor Red
            $issues += "OPENAI_API_KEY not set in .env.local"
        }
    } else {
        Write-Host "❌ OPENAI_API_KEY not found in .env.local" -ForegroundColor Red
        $issues += "OPENAI_API_KEY missing from .env.local"
    }
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
    $issues += ".env.local file missing"
}

Write-Host ""

# Check 2: Node modules
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules/@openai/agents") {
    Write-Host "✅ @openai/agents installed" -ForegroundColor Green
} else {
    Write-Host "❌ @openai/agents not installed" -ForegroundColor Red
    $issues += "Run: npm install @openai/agents openai zod"
}

if (Test-Path "node_modules/openai") {
    Write-Host "✅ openai installed" -ForegroundColor Green
} else {
    Write-Host "❌ openai not installed" -ForegroundColor Red
    $issues += "Run: npm install openai"
}

Write-Host ""

# Check 3: Services running
Write-Host "Checking if services are running..." -ForegroundColor Yellow

# Check Next.js (port 3000)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Next.js server is running (port 3000)" -ForegroundColor Green
} catch {
    Write-Host "❌ Next.js server not running on port 3000" -ForegroundColor Red
    $issues += "Start Next.js: npm run dev"
}

# Check NestJS (port 3004)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3004/api/v1/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ NestJS backend is running (port 3004)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  NestJS backend not responding on port 3004" -ForegroundColor Yellow
    $issues += "Start NestJS backend: npm run start:dev"
}

Write-Host ""

# Summary
if ($issues.Count -eq 0) {
    Write-Host "=== ✅ All checks passed! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "If you're still getting errors:" -ForegroundColor Yellow
    Write-Host "1. Check Next.js server console for detailed error messages" -ForegroundColor Gray
    Write-Host "2. Make sure you restarted Next.js after adding OPENAI_API_KEY" -ForegroundColor Gray
    Write-Host "3. Check browser console (F12) for error details" -ForegroundColor Gray
} else {
    Write-Host "=== ❌ Issues Found ===" -ForegroundColor Red
    Write-Host ""
    foreach ($issue in $issues) {
        Write-Host "  • $issue" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Fix these issues and try again!" -ForegroundColor Yellow
}


