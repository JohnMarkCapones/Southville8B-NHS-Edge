# JWT Token Expired - How to Fix

## The Problem

You're getting this error:

```json
{
  "message": "Invalid or expired authentication token",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## Why This Happens

**JWT tokens expire after 1 hour** (3600 seconds). Even if you're logged in, the token in your curl command is old and no longer valid.

---

## Quick Fix: Get a Fresh Token

### Method 1: PowerShell Script (Easiest on Windows)

1. **Update credentials** in `get-fresh-token.ps1`:
   - Line 7: Add your `SUPABASE_ANON_KEY` from [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api)
   - Line 9: Your admin email
   - Line 10: Your admin password

2. **Run the script**:
   ```powershell
   .\get-fresh-token.ps1
   ```

3. **Result**: Token is printed AND copied to clipboard automatically!

---

### Method 2: Browser Console

If you're logged in to your Next.js frontend:

1. Open **Developer Console** (F12)
2. Go to **Console** tab
3. Run:
   ```javascript
   // Get current session
   const { data: { session } } = await supabase.auth.getSession()
   console.log('Token:', session?.access_token)
   console.log('Expires:', new Date(session?.expires_at * 1000))
   ```

4. Copy the token

---

### Method 3: Check LocalStorage

1. Open **Developer Tools** (F12)
2. Go to **Application** tab → **Local Storage**
3. Find your domain
4. Look for `sb-hafuhxmqwealmvvjfgcw-auth-token` or similar
5. The token is inside the JSON structure

---

## How to Check if Token is Expired

Paste your token at [jwt.io](https://jwt.io) and check the `exp` field:

```json
{
  "exp": 1760831449,  // This is Unix timestamp (seconds)
  ...
}
```

**To check expiration**:
```javascript
// In browser console
const exp = 1760831449; // Replace with your 'exp' value
const expiryDate = new Date(exp * 1000);
const now = new Date();

console.log('Token expires at:', expiryDate);
console.log('Current time:', now);
console.log('Is expired?', now > expiryDate);
```

---

## Using the Fresh Token

Once you have a fresh token, update your curl command:

```bash
curl -X 'POST' \
  'http://localhost:3004/api/v1/journalism/members' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_FRESH_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "b4c3204d-1f85-4256-9b9d-cdbc9f768527",
  "position": "Adviser"
}'
```

---

## Testing in Swagger

Alternatively, use Swagger UI (easier than curl):

1. Go to http://localhost:3004/api/docs
2. Click **Authorize** button (top right)
3. Enter: `Bearer YOUR_FRESH_TOKEN`
4. Click **Authorize**
5. Find the `POST /journalism/members` endpoint
6. Click **Try it out**
7. Enter the request body
8. Click **Execute**

---

## Pro Tip: Increase Token Expiration

You can configure longer token expiration in **Supabase Dashboard**:

1. Go to [Authentication → Settings](https://supabase.com/dashboard/project/_/settings/auth)
2. Find **JWT Expiry** (default is 3600 seconds = 1 hour)
3. Change to longer duration (e.g., 86400 = 24 hours)

⚠️ **Security Note**: Longer tokens are less secure. Use with caution.

---

## Files Created

- ✅ `get-fresh-token.ps1` - PowerShell script to get fresh token (Windows)
- ✅ `get-fresh-token.js` - Node.js script to get fresh token (cross-platform)
- ✅ `TOKEN_EXPIRED_FIX.md` - This guide

---

## Next Steps

1. Get a fresh token using one of the methods above
2. Update your curl command with the new token
3. Retry the API request to add journalism members

Your token will be valid for 1 hour from when you get it.
