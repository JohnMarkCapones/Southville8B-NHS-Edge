# Test Modules API Endpoints
# This script tests the modules system functionality

Write-Host "=== Testing Modules System ===" -ForegroundColor Green

# Test 1: Check if application is running
Write-Host "`n1. Testing Application Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api" -Method GET -UseBasicParsing
    Write-Host "✅ Application is running: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Application Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test R2 Health Endpoint
Write-Host "`n2. Testing R2 Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/r2-health/status" -Method GET -UseBasicParsing
    Write-Host "✅ R2 Health Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ R2 Health Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test Modules Endpoint (should require auth)
Write-Host "`n3. Testing Modules Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/modules" -Method GET -UseBasicParsing
    Write-Host "✅ Modules Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Modules requires authentication (expected): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 4: Test File Upload (without auth - should fail)
Write-Host "`n4. Testing File Upload..." -ForegroundColor Yellow
try {
    $filePath = "test-module.pdf"
    if (Test-Path $filePath) {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"title`"",
            "",
            "Test Module",
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"test-module.pdf`"",
            "Content-Type: application/pdf",
            "",
            [System.IO.File]::ReadAllText($filePath),
            "--$boundary--",
            ""
        ) -join $LF
        
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/modules" -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary" -UseBasicParsing
        Write-Host "✅ File Upload Status: $($response.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ Test file not found: $filePath" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ File Upload requires authentication (expected): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 5: Check Swagger Documentation
Write-Host "`n5. Testing Swagger Documentation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/docs" -Method GET -UseBasicParsing
    Write-Host "✅ Swagger Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Swagger Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Green
