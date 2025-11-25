# Get Fresh JWT Token from Supabase
# Usage: .\get-fresh-token.ps1

$SUPABASE_URL = "https://hafuhxmqwealmvvjfgcw.supabase.co"
$SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY" # Get from Supabase dashboard → Settings → API

$email = "superadmin@gmail.com"
$password = "YOUR_PASSWORD"

Write-Host "`n🔐 Getting fresh JWT token from Supabase...`n" -ForegroundColor Cyan

$body = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/token?grant_type=password" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "apikey" = $SUPABASE_ANON_KEY
        } `
        -Body $body

    if ($response.access_token) {
        Write-Host "✅ Fresh JWT Token:" -ForegroundColor Green
        Write-Host ""
        Write-Host $response.access_token -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Copy the token above and use it in your API requests" -ForegroundColor Cyan

        $expiresAt = (Get-Date).AddSeconds($response.expires_in)
        Write-Host "⏰ Token expires at: $expiresAt" -ForegroundColor Cyan
        Write-Host "   (Valid for $($response.expires_in / 60) minutes)`n" -ForegroundColor Cyan

        # Optionally save to clipboard
        $response.access_token | Set-Clipboard
        Write-Host "📋 Token copied to clipboard!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ Error: No access token in response" -ForegroundColor Red
        Write-Host $response
    }
} catch {
    Write-Host "❌ Error getting token: $_" -ForegroundColor Red
}
