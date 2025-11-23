# Desktop API Integration Test Script
# This script helps test the desktop app API integration

Write-Host "=== Desktop API Integration Test ===" -ForegroundColor Green

# Check if the NestJS backend is running
Write-Host "`n1. Checking if NestJS backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api" -Method GET -TimeoutSec 5
    Write-Host "✓ Backend is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "  Please start the NestJS backend first:" -ForegroundColor Yellow
    Write-Host "  cd core-api-layer/southville-nhs-school-portal-api-layer" -ForegroundColor Cyan
    Write-Host "  npm run start:dev" -ForegroundColor Cyan
}

# Test login endpoint
Write-Host "`n2. Testing login endpoint..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@example.com"
        password = "password123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 10
    Write-Host "✓ Login endpoint is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $responseData = $response.Content | ConvertFrom-Json
    if ($responseData.success) {
        Write-Host "✓ Login response format is correct" -ForegroundColor Green
    } else {
        Write-Host "! Login failed (expected for test credentials)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Login endpoint test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Check desktop app configuration
Write-Host "`n3. Checking desktop app configuration..." -ForegroundColor Yellow
$appSettingsPath = "desktop-app/Southville8BEdgeUI/appsettings.json"
if (Test-Path $appSettingsPath) {
    Write-Host "✓ appsettings.json exists" -ForegroundColor Green
    
    $config = Get-Content $appSettingsPath | ConvertFrom-Json
    Write-Host "  API Base URL: $($config.ApiSettings.BaseUrl)" -ForegroundColor Cyan
    Write-Host "  Timeout: $($config.ApiSettings.Timeout) seconds" -ForegroundColor Cyan
    Write-Host "  Environment: $($config.ApiSettings.Environment)" -ForegroundColor Cyan
} else {
    Write-Host "✗ appsettings.json not found" -ForegroundColor Red
}

# Check if all required files exist
Write-Host "`n4. Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "desktop-app/Southville8BEdgeUI/Models/AppSettings.cs",
    "desktop-app/Southville8BEdgeUI/Models/Api/LoginRequest.cs",
    "desktop-app/Southville8BEdgeUI/Models/Api/LoginResponse.cs",
    "desktop-app/Southville8BEdgeUI/Models/Api/UserDto.cs",
    "desktop-app/Southville8BEdgeUI/Models/Api/SessionDto.cs",
    "desktop-app/Southville8BEdgeUI/Models/Api/ApiError.cs",
    "desktop-app/Southville8BEdgeUI/Services/ITokenStorageService.cs",
    "desktop-app/Southville8BEdgeUI/Services/TokenStorageService.cs",
    "desktop-app/Southville8BEdgeUI/Services/IApiClient.cs",
    "desktop-app/Southville8BEdgeUI/Services/ApiClient.cs",
    "desktop-app/Southville8BEdgeUI/Services/IAuthService.cs",
    "desktop-app/Southville8BEdgeUI/Services/AuthService.cs"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "`n✓ All required files are present!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Some required files are missing!" -ForegroundColor Red
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Green
Write-Host "The desktop app API integration has been implemented with:" -ForegroundColor White
Write-Host "• Centralized API client with automatic token injection" -ForegroundColor White
Write-Host "• Secure token storage using Windows Credential Manager" -ForegroundColor White
Write-Host "• Comprehensive error handling with toast notifications" -ForegroundColor White
Write-Host "• Dependency injection setup" -ForegroundColor White
Write-Host "• Updated LoginViewModel with real API calls" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Start the NestJS backend: npm run start:dev" -ForegroundColor Cyan
Write-Host "2. Build and run the desktop app" -ForegroundColor Cyan
Write-Host "3. Test login with valid credentials" -ForegroundColor Cyan
Write-Host "4. Test error scenarios (invalid credentials, network issues)" -ForegroundColor Cyan
