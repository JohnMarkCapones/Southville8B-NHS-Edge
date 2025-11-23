# Agent SDK Setup Checklist

## ✅ Code Setup (DONE)

- [x] Agent SDK endpoint created (`/api/agent/route.ts`)
- [x] Agent workflow created (`/api/agent/workflow.ts`)
- [x] BotChat component updated to use Agent SDK
- [x] JWT token handling implemented
- [x] Error handling added
- [x] Packages installed (`@openai/agents`, `openai`, `zod`)

## ⚠️ REQUIRED: Environment Variables

**You MUST set these before testing:**

1. **Create/Edit `.env.local` file** in `frontend-nextjs` folder:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

2. **Optional** (if ngrok URL changed):
   ```env
   STUDENT_ASSISTANT_API_URL=https://your-new-ngrok-url.ngrok-free.dev/api/v1/student-assistant/query
   ```

## ⚠️ REQUIRED: Services Running

**All 3 services must be running:**

1. **NestJS Backend** (port 3004)
   ```bash
   cd core-api-layer/southville-nhs-school-portal-api-layer
   npm run start:dev
   ```
   ✅ Should show: `Nest application successfully started on port 3004`

2. **ngrok** (if testing locally)
   ```bash
   ngrok http 3004
   ```
   ✅ Copy the HTTPS URL

3. **Next.js Frontend** (port 3000)
   ```bash
   cd frontend-nextjs
   npm run dev
   ```
   ✅ Should show: `✓ Ready on http://localhost:3000`

## ⚠️ REQUIRED: Backend Endpoint

**Verify your NestJS backend has the student-assistant endpoint:**

- Endpoint: `POST /api/v1/student-assistant/query`
- Should accept: `{ type: string, filters: object }`
- Should return: `{ type: string, data: any, metadata: any }`

## 🧪 Quick Test

**Before testing in UI, test the API directly:**

```powershell
# In PowerShell, after logging in to your app
$token = (Get-Content -Path $env:TEMP\jwt.txt -ErrorAction SilentlyContinue)
# OR get from browser DevTools > Application > Cookies > sb-access-token

curl.exe -X POST http://localhost:3000/api/agent `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d "{\"input_as_text\": \"What are the upcoming events?\", \"jwt_token\": \"$token\"}"
```

**Expected:** JSON response with `output_text` field

## 🐛 Common Issues

### Issue 1: "OPENAI_API_KEY is not set"
- ✅ Check `.env.local` exists
- ✅ Restart Next.js server after adding env var
- ✅ Verify key starts with `sk-`

### Issue 2: "JWT token is required"
- ✅ Make sure you're logged in
- ✅ Check browser cookies for `sb-access-token`
- ✅ Token might be expired - try logging out/in

### Issue 3: "API request failed: 404"
- ✅ Check ngrok is running
- ✅ Update `STUDENT_ASSISTANT_API_URL` in `.env.local`
- ✅ Verify NestJS backend is running

### Issue 4: Agent returns error
- ✅ Check Next.js console for detailed error
- ✅ Check NestJS console for backend errors
- ✅ Verify OpenAI API key is valid (check OpenAI dashboard)

### Issue 5: Slow response (10+ seconds)
- ✅ Normal for first request
- ✅ Subsequent requests should be faster
- ✅ Check OpenAI API status if consistently slow

## ✅ Final Verification

Before testing in UI, verify:

1. [ ] `.env.local` has `OPENAI_API_KEY`
2. [ ] Next.js server restarted after adding env var
3. [ ] NestJS backend running on port 3004
4. [ ] ngrok running (if testing locally)
5. [ ] You're logged in as a student
6. [ ] Direct API test works (see Quick Test above)

## 🎯 Ready to Test?

Once all checkboxes above are ✅, you can:

1. Open your app in browser
2. Log in as student
3. Click the purple bot button (bottom right)
4. Ask: "What are the upcoming events?"
5. Wait 5-10 seconds for response

**If it works:** You'll see a real AI response with actual data from your backend!

**If it doesn't:** Check the error message and refer to Common Issues above.


