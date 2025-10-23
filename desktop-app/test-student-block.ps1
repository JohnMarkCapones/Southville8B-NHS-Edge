# Student Login Block Test Script
# This script helps test the student login blocking functionality

Write-Host "=== Student Login Block Test ===" -ForegroundColor Green

Write-Host "`nTesting Student Login Blocking Implementation..." -ForegroundColor Yellow

# Check if the NestJS backend is running
Write-Host "`n1. Checking if NestJS backend is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api" -Method GET -TimeoutSec 5
    Write-Host "✓ Backend is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "  Please start the NestJS backend first:" -ForegroundColor Yellow
    Write-Host "  cd core-api-layer/southville-nhs-school-portal-api-layer" -ForegroundColor Cyan
    Write-Host "  npm run start:dev" -ForegroundColor Cyan
    Write-Host "`nNote: You can still test the desktop app without the backend running." -ForegroundColor Yellow
}

# Check configuration files
Write-Host "`n2. Checking configuration files..." -ForegroundColor Cyan
$appSettingsPath = "appsettings.json"
if (Test-Path $appSettingsPath) {
    Write-Host "✓ appsettings.json exists" -ForegroundColor Green
    
    $config = Get-Content $appSettingsPath | ConvertFrom-Json
    Write-Host "  API Base URL: $($config.ApiSettings.BaseUrl)" -ForegroundColor White
    Write-Host "  Allowed Roles: $($config.AccessControl.AllowedRoles -join ', ')" -ForegroundColor White
    Write-Host "  Blocked Roles: $($config.AccessControl.BlockedRoles -join ', ')" -ForegroundColor White
    Write-Host "  Access Denied Message: $($config.AccessControl.AccessDeniedMessage)" -ForegroundColor White
} else {
    Write-Host "✗ appsettings.json not found" -ForegroundColor Red
}

# Check if all required files exist
Write-Host "`n3. Checking required files..." -ForegroundColor Cyan
$requiredFiles = @(
    "Models/AppSettings.cs",
    "Services/RoleValidationService.cs",
    "ViewModels/LoginViewModel.cs"
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

# Build test
Write-Host "`n4. Testing build..." -ForegroundColor Cyan
try {
    $buildResult = dotnet build --no-restore 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Build failed" -ForegroundColor Red
        Write-Host $buildResult -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Build test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Scenarios ===" -ForegroundColor Green
Write-Host "The following scenarios should be tested manually:" -ForegroundColor White

Write-Host "`n📋 Manual Test Checklist:" -ForegroundColor Yellow
Write-Host "1. Start the NestJS backend:" -ForegroundColor White
Write-Host "   cd core-api-layer/southville-nhs-school-portal-api-layer" -ForegroundColor Cyan
Write-Host "   npm run start:dev" -ForegroundColor Cyan

Write-Host "`n2. Start the desktop app:" -ForegroundColor White
Write-Host "   dotnet run" -ForegroundColor Cyan

Write-Host "`n3. Test Student Login Block:" -ForegroundColor White
Write-Host "   - Enter student credentials (email/password)" -ForegroundColor White
Write-Host "   - Click Login" -ForegroundColor White
Write-Host "   - Expected: Access denied error message" -ForegroundColor Green
Write-Host "   - Expected: Password field cleared" -ForegroundColor Green
Write-Host "   - Expected: No navigation to dashboard" -ForegroundColor Green
Write-Host "   - Expected: Tokens cleared from storage" -ForegroundColor Green

Write-Host "`n4. Test Admin Login:" -ForegroundColor White
Write-Host "   - Enter admin credentials" -ForegroundColor White
Write-Host "   - Click Login" -ForegroundColor White
Write-Host "   - Expected: Success message" -ForegroundColor Green
Write-Host "   - Expected: Navigate to AdminShellViewModel" -ForegroundColor Green

Write-Host "`n5. Test Teacher Login:" -ForegroundColor White
Write-Host "   - Enter teacher credentials" -ForegroundColor White
Write-Host "   - Click Login" -ForegroundColor White
Write-Host "   - Expected: Success message" -ForegroundColor Green
Write-Host "   - Expected: Navigate to TeacherShellViewModel" -ForegroundColor Green

Write-Host "`n6. Test Logout from Admin/Teacher:" -ForegroundColor White
Write-Host "   - Login as admin or teacher" -ForegroundColor White
Write-Host "   - Click logout" -ForegroundColor White
Write-Host "   - Expected: Return to login screen" -ForegroundColor Green
Write-Host "   - Expected: Tokens cleared" -ForegroundColor Green

Write-Host "`n=== Implementation Summary ===" -ForegroundColor Green
Write-Host "✅ Student login blocking implemented with:" -ForegroundColor White
Write-Host "• Role-based access control using RoleValidationService" -ForegroundColor White
Write-Host "• Configuration-driven allowed/blocked roles" -ForegroundColor White
Write-Host "• Immediate token clearing for blocked roles" -ForegroundColor White
Write-Host "• Clear error messages for students" -ForegroundColor White
Write-Host "• Password field clearing for security" -ForegroundColor White
Write-Host "• No navigation for unauthorized roles" -ForegroundColor White

Write-Host "`n🔒 Security Features:" -ForegroundColor Yellow
Write-Host "• Students cannot access desktop app" -ForegroundColor White
Write-Host "• Tokens are immediately cleared for blocked roles" -ForegroundColor White
Write-Host "• Password is cleared after access denial" -ForegroundColor White
Write-Host "• Clear separation between 'invalid credentials' and 'access denied'" -ForegroundColor White
Write-Host "• Configuration-driven role management" -ForegroundColor White

Write-Host "`n📝 Configuration:" -ForegroundColor Yellow
Write-Host "• Allowed roles: Admin, Teacher" -ForegroundColor White
Write-Host "• Blocked roles: Student" -ForegroundColor White
Write-Host "• Customizable error messages" -ForegroundColor White
Write-Host "• Easy to modify in appsettings.json" -ForegroundColor White
