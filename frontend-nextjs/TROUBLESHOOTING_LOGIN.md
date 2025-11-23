# 🔧 Troubleshooting Login Issues

## Current Issue
Getting empty error `{}` when trying to access `/users/me` after login.

## Potential Causes & Solutions

### 1. **Backend Not Running** ⚠️
**Check**: Is your backend running?

```powershell
# Navigate to backend directory
cd Southville8B-NHS-Edge/core-api-layer/southville-nhs-school-portal-api-layer

# Check if it's running
# You should see: "🚀 Application is running on: http://localhost:XXXX"
```

**Fix**: Start the backend if not running
```powershell
npm run start:dev
```

---

### 2. **Port Mismatch** ⚠️⚠️ **MOST LIKELY**
**Check**: What port is your backend running on?

The frontend is configured to use **port 3004**:
```env
# frontend-nextjs/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3004
```

But the backend `main.ts` (line 98) says:
```typescript
const port = configService.get<number>('PORT') || 3000;  // Defaults to 3000!
```

**Fix Option 1**: Change frontend to use port 3000
```env
# frontend-nextjs/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
INTERNAL_API_URL=http://localhost:3000
```

**Fix Option 2**: Set backend to use port 3004
```powershell
# In backend directory, create or update .env
echo PORT=3004 > .env
```

Then restart backend.

---

### 3. **CORS Issue** (Less Likely)
**Check**: Are you seeing CORS errors in browser console?

Look for:
```
Access to fetch at 'http://localhost:XXXX/api/v1/users/me' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Fix**: CORS should already be configured correctly in `main.ts`, but verify:
```typescript
// backend/src/main.ts line 62
app.enableCors({
  origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
  credentials: true,
});
```

---

### 4. **Network/Timeout Error**
**Check**: Is the request timing out?

The enhanced logging I just added will show:
```
[API Client] Request failed: {
  endpoint: "/users/me",
  url: "http://localhost:XXXX/api/v1/users/me",
  error: "TimeoutError: The operation timed out",
  errorType: "TimeoutError"
}
```

**Fix**: 
- Check firewall isn't blocking
- Verify backend is actually responding (`curl http://localhost:3004/api/v1/health`)
- Increase timeout in `frontend-nextjs/lib/api/config.ts`:
  ```typescript
  timeout: 60000, // 60 seconds instead of 30
  ```

---

### 5. **Token Not Being Sent**
**Check**: Look for the new debug logs I added:
```
[API Client] Making request: {
  method: "GET",
  url: "http://localhost:XXXX/api/v1/users/me",
  requiresAuth: true,
  hasToken: false,  // ❌ Should be true!
}
```

If `hasToken: false`, the token isn't being read from cookies.

**Fix**: Clear all cookies and login again:
```javascript
// In browser console
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
// Then refresh and login again
```

---

## 🔍 Step-by-Step Debugging

### Step 1: Verify Backend is Running
```powershell
curl http://localhost:3004/api/v1/health
# OR
curl http://localhost:3000/api/v1/health
```

**Expected**: JSON response `{"status": "ok"}` or similar

**If fails**: Backend isn't running on that port

---

### Step 2: Check Backend Port
```powershell
# In backend directory
cd Southville8B-NHS-Edge/core-api-layer/southville-nhs-school-portal-api-layer

# Look for this line when backend starts:
# "🚀 Application is running on: http://localhost:XXXX"
```

Note the port number!

---

### Step 3: Update Frontend `.env.local`
```env
# Use the port from Step 2
NEXT_PUBLIC_API_URL=http://localhost:YOUR_BACKEND_PORT
INTERNAL_API_URL=http://localhost:YOUR_BACKEND_PORT
```

---

### Step 4: Restart Frontend
```powershell
# In frontend directory
cd Southville8B-NHS-Edge/frontend-nextjs

# Stop dev server (Ctrl+C) and restart
npm run dev
```

---

### Step 5: Clear Browser Data & Login
1. Open DevTools (F12)
2. Go to Application tab > Storage > Clear site data
3. Refresh page
4. Login again with student credentials
5. Watch the console for new debug logs

---

## 🧪 Quick Test

Run this in PowerShell to test backend connectivity:

```powershell
# Test backend health (try both ports)
Write-Host "Testing port 3000..."
try { (Invoke-WebRequest http://localhost:3000/api/v1/health).StatusCode } catch { "Not responding" }

Write-Host "Testing port 3004..."
try { (Invoke-WebRequest http://localhost:3004/api/v1/health).StatusCode } catch { "Not responding" }

# Check Swagger docs
Write-Host "Testing Swagger on 3000..."
try { (Invoke-WebRequest http://localhost:3000/api/docs).StatusCode } catch { "Not responding" }

Write-Host "Testing Swagger on 3004..."
try { (Invoke-WebRequest http://localhost:3004/api/docs).StatusCode } catch { "Not responding" }
```

---

## 📋 Expected Console Output After Fix

After logging in, you should see:

```
[Login] ✅ Login successful, redirecting to: /student
[ApiClient] ✅ Token found in cookie
[API Client] Making request: {
  method: "GET",
  url: "http://localhost:XXXX/api/v1/users/me",
  requiresAuth: true,
  hasToken: true,  // ✅ Should be true
  hasCsrf: "N/A"
}
[RequireAuth] ✅ User authenticated: 123456789092@student.local Role: Student
```

**No** errors or empty `{}` objects.

---

## 🆘 Still Not Working?

If you've tried everything above, gather this info:

1. **Backend console output** (what port it's running on)
2. **Frontend console output** (all the new debug logs)
3. **Network tab** (check if request to `/users/me` is being made)
   - Right-click the request
   - Copy as cURL
   - Share the cURL command

4. **Cookie values** (DevTools > Application > Cookies)
   - `sb-access-token`: Should have a value (long JWT string)
   - `sb-refresh-token`: Should show "HttpOnly"
   - `csrf-token`: Should have a value
   - `user-role`: Should say "Student", "Teacher", or "Admin"

---

## 🎯 Most Likely Fix

**99% chance it's the port mismatch!**

1. Check what port backend is running on (look for the startup message)
2. Update `frontend-nextjs/.env.local` to match that port
3. Restart frontend dev server
4. Clear cookies and login again

Done! 🎉

