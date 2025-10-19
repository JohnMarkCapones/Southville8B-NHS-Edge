# Security Testing Script
# Run this to verify all security measures are working

Write-Host "🔒 Security Testing Suite" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiUrl = "http://localhost:3004"

# Test 1: CSRF Protection
Write-Host "Test 1: CSRF Protection" -ForegroundColor Yellow
Write-Host "Testing mutation without CSRF token..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/test" -Method POST -UseBasicParsing -ErrorAction Stop
    Write-Host "❌ FAIL: Should have been blocked by CSRF protection" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ PASS: CSRF protection is active (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  UNEXPECTED: Got status code $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 2: Rate Limiting (Visual test)
Write-Host "Test 2: Rate Limiting" -ForegroundColor Yellow
Write-Host "Making 102 requests to test rate limit (100/min)..." -ForegroundColor Gray
Write-Host "This will take a moment..." -ForegroundColor Gray

$rateLimitTriggered = $false
for ($i = 1; $i -le 102; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/test" -Method GET -UseBasicParsing -ErrorAction Stop -TimeoutSec 2
        if ($i % 20 -eq 0) {
            Write-Host "  - Request $i : OK" -ForegroundColor Gray
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "✅ PASS: Rate limiting triggered at request $i (429 Too Many Requests)" -ForegroundColor Green
            $rateLimitTriggered = $true
            break
        }
    }
}

if (-not $rateLimitTriggered) {
    Write-Host "⚠️  WARNING: Rate limit not triggered after 102 requests" -ForegroundColor Yellow
    Write-Host "   This might be because requests are too slow or rate limit is higher" -ForegroundColor Gray
}
Write-Host ""

# Test 3: Protected Routes Without Token
Write-Host "Test 3: Protected Routes Authentication" -ForegroundColor Yellow
Write-Host "Accessing protected route without token..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/student" -Method GET -UseBasicParsing -ErrorAction Stop -MaximumRedirection 0
    Write-Host "❌ FAIL: Should have been redirected" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 302 -or $_.Exception.Response.StatusCode -eq 307) {
        $redirectUrl = $_.Exception.Response.Headers["Location"]
        if ($redirectUrl -like "*login*") {
            Write-Host "✅ PASS: Redirected to login page" -ForegroundColor Green
        } else {
            Write-Host "⚠️  PARTIAL: Redirected but not to login ($redirectUrl)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  UNEXPECTED: Got status code $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 4: Security Headers
Write-Host "Test 4: Security Headers" -ForegroundColor Yellow
Write-Host "Checking for security headers..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl" -Method GET -UseBasicParsing -ErrorAction Stop
    
    $securityHeaders = @{
        'X-Content-Type-Options' = 'nosniff'
        'X-Frame-Options' = 'DENY'
        'X-XSS-Protection' = '1; mode=block'
        'Referrer-Policy' = 'strict-origin-when-cross-origin'
    }
    
    $allPresent = $true
    foreach ($header in $securityHeaders.Keys) {
        if ($response.Headers[$header]) {
            Write-Host "  ✅ $header : Present" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $header : Missing" -ForegroundColor Red
            $allPresent = $false
        }
    }
    
    if ($allPresent) {
        Write-Host "✅ PASS: All security headers present" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Some security headers missing" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: Could not test security headers" -ForegroundColor Red
}
Write-Host ""

# Test 5: Public Routes Accessible
Write-Host "Test 5: Public Routes Accessibility" -ForegroundColor Yellow
Write-Host "Testing public routes are accessible..." -ForegroundColor Gray

$publicRoutes = @("/guess", "/guess/portal", "/api/test")
$allAccessible = $true

foreach ($route in $publicRoutes) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$route" -Method GET -UseBasicParsing -ErrorAction Stop -TimeoutSec 5
        Write-Host "  ✅ $route : Accessible" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $route : Not accessible ($($_.Exception.Message))" -ForegroundColor Red
        $allAccessible = $false
    }
}

if ($allAccessible) {
    Write-Host "✅ PASS: All public routes accessible" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Some public routes not accessible" -ForegroundColor Red
}
Write-Host ""

# Test 6: Backend Health Check
Write-Host "Test 6: Backend Connectivity" -ForegroundColor Yellow
Write-Host "Checking backend health..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$apiUrl/api/v1/health" -Method GET -UseBasicParsing -ErrorAction Stop -TimeoutSec 5
    Write-Host "✅ PASS: Backend is responding" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: Backend is not responding" -ForegroundColor Red
    Write-Host "   Make sure backend is running on port 3004" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Security Test Complete!" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Manual Tests Required:" -ForegroundColor Yellow
Write-Host "1. Login and check browser cookies (DevTools > Application > Cookies)" -ForegroundColor Gray
Write-Host "   - Verify sb-refresh-token shows HttpOnly: Yes" -ForegroundColor Gray
Write-Host "   - Verify sb-access-token shows HttpOnly: No" -ForegroundColor Gray
Write-Host "2. Open Console and type: document.cookie" -ForegroundColor Gray
Write-Host "   - Should see: sb-access-token (readable)" -ForegroundColor Gray
Write-Host "   - Should NOT see: sb-refresh-token" -ForegroundColor Gray
Write-Host "3. Test role-based access control:" -ForegroundColor Gray
Write-Host "   - Login as Student, try to access /teacher (should fail)" -ForegroundColor Gray
Write-Host "   - Login as Teacher, try to access /admin (should fail)" -ForegroundColor Gray
Write-Host ""

