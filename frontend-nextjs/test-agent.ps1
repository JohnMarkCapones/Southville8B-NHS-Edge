# Quick Agent SDK Test Script
# Run this in PowerShell after starting your servers

Write-Host "=== Agent SDK Test ===" -ForegroundColor Cyan
Write-Host ""

# Get JWT token from user
$jwt = Read-Host "Enter your JWT token (or press Enter to get from browser)"

if ([string]::IsNullOrWhiteSpace($jwt)) {
    Write-Host "Please get your JWT token from browser DevTools:" -ForegroundColor Yellow
    Write-Host "1. Open browser DevTools (F12)" -ForegroundColor Yellow
    Write-Host "2. Go to Application/Storage > Cookies" -ForegroundColor Yellow
    Write-Host "3. Copy the value of 'sb-access-token'" -ForegroundColor Yellow
    Write-Host ""
    $jwt = Read-Host "Paste JWT token here"
}

if ([string]::IsNullOrWhiteSpace($jwt)) {
    Write-Host "Error: JWT token is required" -ForegroundColor Red
    exit 1
}

# Test question
$question = Read-Host "Enter your question (or press Enter for default: 'What are the upcoming events?')"
if ([string]::IsNullOrWhiteSpace($question)) {
    $question = "What are the upcoming events?"
}

Write-Host ""
Write-Host "Sending request..." -ForegroundColor Yellow
Write-Host "Question: $question" -ForegroundColor Gray
Write-Host ""

try {
    $body = @{
        input_as_text = $question
        jwt_token = $jwt
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/agent" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $jwt"
        } `
        -Body $body

    Write-Host "=== SUCCESS ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $response.output_text -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "=== ERROR ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Message:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Next.js server is running (npm run dev)" -ForegroundColor Gray
    Write-Host "2. Make sure OPENAI_API_KEY is set in .env.local" -ForegroundColor Gray
    Write-Host "3. Make sure NestJS backend is running on port 3004" -ForegroundColor Gray
    Write-Host "4. Make sure ngrok is running (if testing locally)" -ForegroundColor Gray
    Write-Host "5. Check that JWT token is valid and not expired" -ForegroundColor Gray
}


