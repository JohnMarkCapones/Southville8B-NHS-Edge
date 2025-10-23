# ========================================
# PHASE 3: ANNOUNCEMENTS MODULE TEST SCRIPT
# ========================================
# This script tests the announcements API integration
#
# Prerequisites:
# 1. Backend running on http://localhost:3004
# 2. Frontend running on http://localhost:3000
# 3. PowerShell 5.1 or later

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PHASE 3: ANNOUNCEMENTS INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Tests = @()
}

# ========================================
# TEST 1: Backend Health Check
# ========================================
Write-Host "TEST 1: Backend Health Check..." -ForegroundColor Yellow

try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:3004/api/v1/health" `
        -Method Get `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    if ($backendHealth.status -eq "healthy") {
        Write-Host "  ✅ Backend is healthy and running" -ForegroundColor Green
        $results.Tests += @{
            Name = "Backend Health"
            Status = "PASS"
            Details = "Backend responding on port 3004"
        }
    } else {
        Write-Host "  ⚠️ Backend responded but status is: $($backendHealth.status)" -ForegroundColor Yellow
        $results.Tests += @{
            Name = "Backend Health"
            Status = "WARNING"
            Details = "Status: $($backendHealth.status)"
        }
    }
} catch {
    Write-Host "  ❌ Backend is not responding" -ForegroundColor Red
    Write-Host "     Make sure backend is running: npm run start:dev" -ForegroundColor Red
    $results.Tests += @{
        Name = "Backend Health"
        Status = "FAIL"
        Details = $_.Exception.Message
    }
}

# ========================================
# TEST 2: Announcements API Endpoint
# ========================================
Write-Host "`nTEST 2: Announcements API Endpoint..." -ForegroundColor Yellow

try {
    # Note: This may require authentication depending on your setup
    # For public announcements, it should work without auth
    $announcements = Invoke-RestMethod -Uri "http://localhost:3004/api/v1/announcements?page=1&limit=10&visibility=public&includeExpired=false" `
        -Method Get `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    if ($announcements.data) {
        $count = $announcements.data.Count
        Write-Host "  ✅ Announcements API responding" -ForegroundColor Green
        Write-Host "     Found $count announcement(s)" -ForegroundColor Cyan
        
        if ($count -gt 0) {
            Write-Host "     Sample announcement: $($announcements.data[0].title)" -ForegroundColor Cyan
        } else {
            Write-Host "     ⚠️ No announcements in database yet" -ForegroundColor Yellow
        }
        
        $results.Tests += @{
            Name = "Announcements API"
            Status = "PASS"
            Details = "$count announcement(s) found"
        }
    } else {
        Write-Host "  ⚠️ API responded but no data property found" -ForegroundColor Yellow
        $results.Tests += @{
            Name = "Announcements API"
            Status = "WARNING"
            Details = "No data property in response"
        }
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "  ⚠️ Announcements API requires authentication" -ForegroundColor Yellow
        Write-Host "     This is expected for non-public announcements" -ForegroundColor Cyan
        $results.Tests += @{
            Name = "Announcements API"
            Status = "WARNING"
            Details = "401 Unauthorized - May require authentication"
        }
    } else {
        Write-Host "  ❌ Announcements API error" -ForegroundColor Red
        Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Red
        $results.Tests += @{
            Name = "Announcements API"
            Status = "FAIL"
            Details = $_.Exception.Message
        }
    }
}

# ========================================
# TEST 3: Frontend Accessibility
# ========================================
Write-Host "`nTEST 3: Frontend Accessibility..." -ForegroundColor Yellow

try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" `
        -Method Get `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    if ($frontend.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend is accessible" -ForegroundColor Green
        
        # Check if announcements section exists
        if ($frontend.Content -match "School Announcements" -or $frontend.Content -match "announcements") {
            Write-Host "     Found announcements section on homepage" -ForegroundColor Cyan
            $results.Tests += @{
                Name = "Frontend Accessibility"
                Status = "PASS"
                Details = "Homepage accessible with announcements section"
            }
        } else {
            Write-Host "     ⚠️ Could not verify announcements section" -ForegroundColor Yellow
            $results.Tests += @{
                Name = "Frontend Accessibility"
                Status = "WARNING"
                Details = "Announcements section not found in HTML"
            }
        }
    }
} catch {
    Write-Host "  ❌ Frontend is not responding" -ForegroundColor Red
    Write-Host "     Make sure frontend is running: npm run dev" -ForegroundColor Red
    $results.Tests += @{
        Name = "Frontend Accessibility"
        Status = "FAIL"
        Details = $_.Exception.Message
    }
}

# ========================================
# TEST 4: Check Frontend Files
# ========================================
Write-Host "`nTEST 4: Verifying Frontend Files..." -ForegroundColor Yellow

$requiredFiles = @(
    "lib\api\types\announcements.ts",
    "lib\api\endpoints\announcements.ts",
    "hooks\useAnnouncements.ts",
    "components\homepage\announcements-section.tsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

$results.Tests += @{
    Name = "Frontend Files"
    Status = $(if ($allFilesExist) { "PASS" } else { "FAIL" })
    Details = "$(if ($allFilesExist) { 'All required files present' } else { 'Some files missing' })"
}

# ========================================
# SUMMARY
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = ($results.Tests | Where-Object { $_.Status -eq "PASS" }).Count
$warnCount = ($results.Tests | Where-Object { $_.Status -eq "WARNING" }).Count
$failCount = ($results.Tests | Where-Object { $_.Status -eq "FAIL" }).Count
$totalTests = $results.Tests.Count

Write-Host "Total Tests: $totalTests" -ForegroundColor Cyan
Write-Host "  ✅ Passed: $passCount" -ForegroundColor Green
Write-Host "  ⚠️ Warnings: $warnCount" -ForegroundColor Yellow
Write-Host "  ❌ Failed: $failCount" -ForegroundColor Red

# Print detailed results
Write-Host "`nDetailed Results:" -ForegroundColor Cyan
foreach ($test in $results.Tests) {
    $color = switch ($test.Status) {
        "PASS" { "Green" }
        "WARNING" { "Yellow" }
        "FAIL" { "Red" }
    }
    Write-Host "`n  $($test.Name):" -ForegroundColor White
    Write-Host "    Status: $($test.Status)" -ForegroundColor $color
    Write-Host "    Details: $($test.Details)" -ForegroundColor Cyan
}

# Overall status
Write-Host "`n========================================" -ForegroundColor Cyan
if ($failCount -eq 0 -and $warnCount -eq 0) {
    Write-Host "✅ PHASE 3: ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "Announcements integration is working perfectly!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Visit http://localhost:3000 to see the integration" -ForegroundColor White
    Write-Host "  2. Look for 'Live Data' or 'Demo Data' badge" -ForegroundColor White
    Write-Host "  3. Open DevTools Network tab to see API calls" -ForegroundColor White
} elseif ($failCount -eq 0) {
    Write-Host "⚠️ PHASE 3: TESTS PASSED WITH WARNINGS" -ForegroundColor Yellow
    Write-Host "Integration is working but some issues detected." -ForegroundColor Yellow
    Write-Host "`nReview warnings above and address if needed." -ForegroundColor Cyan
} else {
    Write-Host "❌ PHASE 3: SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "Please fix the failed tests above." -ForegroundColor Red
    Write-Host "`nCommon issues:" -ForegroundColor Cyan
    Write-Host "  • Backend not running: cd core-api-layer/... && npm run start:dev" -ForegroundColor White
    Write-Host "  • Frontend not running: cd frontend-nextjs && npm run dev" -ForegroundColor White
    Write-Host "  • Files missing: Check PHASE3_ANNOUNCEMENTS_COMPLETE.md" -ForegroundColor White
}

Write-Host "========================================`n" -ForegroundColor Cyan

# Save results to JSON for further analysis
$jsonResults = $results | ConvertTo-Json -Depth 3
$jsonResults | Out-File "test-phase3-results.json" -Encoding UTF8
Write-Host "Results saved to: test-phase3-results.json`n" -ForegroundColor Gray

