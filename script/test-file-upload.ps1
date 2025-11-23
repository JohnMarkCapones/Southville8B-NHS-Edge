# Test file upload to modules endpoint
$uri = "http://localhost:3000/api/v1/modules"
$token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkIxQ0pQd0JrL0o1S3pSeDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2hhZnVoeG1xd2VhbG12dmpmZ2N3LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJiNGMzMjA0ZC0xZjg1LTQyNTYtOWI5ZC1jZGJjOWY3Njg1MjciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYwNjAwNTc1LCJpYXQiOjE3NjA1OTY5NzUsImVtYWlsIjoiam9obm1hcmtjYXBvbmVzOTNAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicm9sZSI6IlRlYWNoZXIifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2MDU5Njk3NX1dLCJzZXNzaW9uX2lkIjoiOWVmYTI2OTItYjhjMC00NzY2LWFlMTctMjFkZWE2YzU5MWVlIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.XTCUNiF6_KZrQyNcONPfoDlU_lG48Lp97hECHWalBR0"

# Create a test PDF file
$testContent = "This is a test PDF content for module upload testing."
$testFile = "test-module.pdf"
$testContent | Out-File -FilePath $testFile -Encoding UTF8

try {
    # Test the file upload
    $form = @{
        title = "Test Biology Module"
        description = "Test module for file upload testing"
        isGlobal = "true"
        subjectId = "635fe7a9-bda5-4c80-91a8-8c89cf01ef47"
        file = Get-Item $testFile
    }

    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers @{
        "Authorization" = "Bearer $token"
    } -Form $form

    Write-Host "✅ File upload successful!"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "❌ File upload failed:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
} finally {
    # Clean up test file
    if (Test-Path $testFile) {
        Remove-Item $testFile
    }
}
