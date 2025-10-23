# Debug script for GradeEntry ArgumentOutOfRangeException
Write-Host "Starting GradeEntry Debug Session..." -ForegroundColor Green

# Build the project first
Write-Host "Building project..." -ForegroundColor Yellow
dotnet build --no-restore

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful. Starting application..." -ForegroundColor Green
    Write-Host ""
    Write-Host "=== DEBUGGING INSTRUCTIONS ===" -ForegroundColor Cyan
    Write-Host "1. Navigate to GradeEntryView in the application" -ForegroundColor White
    Write-Host "2. Watch the Debug Output window for detailed logging" -ForegroundColor White
    Write-Host "3. Look for these debug messages:" -ForegroundColor White
    Write-Host "   - 'RefreshThemeColors: Starting'" -ForegroundColor Gray
    Write-Host "   - 'HookStudentGradesCollection: Starting'" -ForegroundColor Gray
    Write-Host "   - 'LoadStudentsAsync: UI Thread - Starting UI update'" -ForegroundColor Gray
    Write-Host "   - 'ApplyResponsiveLayout: Width = X'" -ForegroundColor Gray
    Write-Host "4. When the exception occurs, check which method was the last one logged" -ForegroundColor White
    Write-Host "5. Look for any ERROR messages with stack traces" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to start the application..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Start the application
    dotnet run --project Southville8BEdgeUI
} else {
    Write-Host "Build failed. Please fix compilation errors first." -ForegroundColor Red
}
