# Agent SDK Testing Guide

## Prerequisites

1. **OpenAI API Key** - Get it from https://platform.openai.com/api-keys
2. **NestJS Backend** - Running on port 3004
3. **ngrok** - Running (if testing locally)
4. **Next.js Frontend** - Running on port 3000

## Step 1: Set Up Environment Variables

Add to `.env.local` in `frontend-nextjs` folder:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
STUDENT_ASSISTANT_API_URL=https://your-ngrok-url.ngrok-free.dev/api/v1/student-assistant/query
```

**Note:** If `STUDENT_ASSISTANT_API_URL` is not set, it defaults to the ngrok URL in the code.

## Step 2: Start All Services

### Terminal 1: NestJS Backend
```bash
cd Southville8B-NHS-Edge/core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev
```
✅ Should show: `Nest application successfully started on port 3004`

### Terminal 2: ngrok (if testing locally)
```bash
ngrok http 3004
```
✅ Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.dev`)

### Terminal 3: Next.js Frontend
```bash
cd Southville8B-NHS-Edge/frontend-nextjs
npm run dev
```
✅ Should show: `✓ Ready on http://localhost:3000`

## Step 3: Test Methods

### Method 1: Direct API Test (Recommended First)

Use **Postman**, **curl**, or **Thunder Client** to test the endpoint directly.

#### Using curl (PowerShell):
```powershell
# Get your JWT token from browser cookies (sb-access-token)
$jwt = "your-jwt-token-here"

curl.exe -X POST http://localhost:3000/api/agent `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $jwt" `
  -d '{\"input_as_text\": \"What are the upcoming events?\", \"jwt_token\": \"' + $jwt + '\"}'
```

#### Using Postman:
1. **Method:** POST
2. **URL:** `http://localhost:3000/api/agent`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-jwt-token>`
4. **Body (JSON):**
   ```json
   {
     "input_as_text": "What are the upcoming events?",
     "jwt_token": "<your-jwt-token>"
   }
   ```

#### Expected Response:
```json
{
  "output_text": "I found 3 upcoming events. Next up is Science Fair on Dec 15 at the gymnasium..."
}
```

### Method 2: Test Through Chat Widget (UI)

1. **Login** to your app as a student
2. **Navigate** to any student page (e.g., `/student/dashboard`)
3. **Look for** the chat widget button (floating button with message icon)
4. **Click** the chat button to open it
5. **Type** a question like:
   - "What are the upcoming events?"
   - "Show me my schedule for today"
   - "What are my grades?"
   - "Tell me about the clubs"
6. **Press Enter** or click Send
7. **Wait** for the AI response (may take 5-10 seconds)

### Method 3: Test with Browser DevTools

1. **Open** your app in browser
2. **Open DevTools** (F12)
3. **Go to Console** tab
4. **Run this JavaScript:**
   ```javascript
   // Get JWT from cookie
   const token = document.cookie.match(/sb-access-token=([^;]+)/)?.[1];
   
   // Test the agent
   fetch('/api/agent', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       input_as_text: 'What are the upcoming events?',
       jwt_token: token
     })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error);
   ```

## Step 4: Test Different Query Types

Try these questions to test different features:

| Question | Expected Behavior |
|----------|------------------|
| "What events are coming up?" | Fetches events data |
| "Show me my schedule" | Fetches schedule data |
| "What's the latest news?" | Fetches news data |
| "What subjects am I taking?" | Fetches subjects data |
| "Show me my modules" | Fetches modules data |
| "What quizzes do I have?" | Fetches quizzes data |
| "What are my grades?" | Fetches grades/GWA data |
| "Tell me about clubs" | Fetches clubs data |

## Step 5: Troubleshooting

### Error: "OPENAI_API_KEY is not set"
- ✅ Check `.env.local` file exists
- ✅ Restart Next.js server after adding env variable
- ✅ Verify the key starts with `sk-`

### Error: "JWT token is required"
- ✅ Make sure you're logged in
- ✅ Check browser cookies for `sb-access-token`
- ✅ Token might be expired - try logging out and back in

### Error: "API request failed: 404"
- ✅ Check ngrok is running
- ✅ Update `STUDENT_ASSISTANT_API_URL` in `.env.local`
- ✅ Verify NestJS backend is running on port 3004

### Error: "Failed to run agent workflow"
- ✅ Check Next.js server console for detailed error
- ✅ Verify OpenAI API key is valid
- ✅ Check network tab in browser DevTools

### Agent takes too long to respond
- ✅ Normal: First request can take 10-15 seconds
- ✅ Subsequent requests are usually faster
- ✅ Check OpenAI API status if consistently slow

### Agent returns generic responses
- ✅ Check backend logs to see if data is being fetched
- ✅ Verify the student has data in the database
- ✅ Check ngrok URL is correct

## Step 6: Verify Backend Integration

Check NestJS logs to see if requests are coming through:

```
[StudentAssistantController] Query received: { type: 'events', filters: {} }
[StudentAssistantService] Handling events query for user: <user-id>
```

## Step 7: Monitor OpenAI Usage

- Check your OpenAI dashboard: https://platform.openai.com/usage
- Each request uses GPT-4.1 tokens
- Monitor costs if on a paid plan

## Success Indicators

✅ **API Test:**
- Returns `200 OK` status
- Response has `output_text` field
- Response contains relevant information

✅ **UI Test:**
- Chat widget opens
- Question appears in chat
- AI response appears after 5-10 seconds
- Response is relevant to the question

✅ **Backend Test:**
- NestJS logs show incoming requests
- Data is fetched from database
- Response is returned successfully

## Next Steps After Testing

1. **Monitor** response quality and adjust agent instructions if needed
2. **Add** more query types if needed
3. **Optimize** response formatting
4. **Add** error handling for edge cases
5. **Deploy** to production when ready


