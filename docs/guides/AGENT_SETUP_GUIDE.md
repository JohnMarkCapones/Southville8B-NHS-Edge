# AI Agent Setup Guide

## ✅ What's Been Set Up

1. **Agent Workflow Code**: Created at `frontend-nextjs/app/api/agent/workflow.ts`
2. **API Route**: Created at `frontend-nextjs/app/api/agent/route.ts`
3. **Function Implementation**: The `getStudentInformation` function is fully implemented with HTTP request to your API

## 📋 What You Need to Do

### Step 1: Install Dependencies

Run this command in the `frontend-nextjs` directory:

```bash
cd frontend-nextjs
npm install @openai/agents openai
```

### Step 2: Set Up Environment Variables

Add these to your `.env.local` file in the `frontend-nextjs` directory:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Student Assistant API URL (use ngrok for local testing)
STUDENT_ASSISTANT_API_URL=https://iva-venerable-lissette.ngrok-free.dev/api/v1/student-assistant/query

# JWT Token (optional - only for testing. In production, JWT comes from user's session)
# STUDENT_ASSISTANT_JWT_TOKEN=your_jwt_token_here
```

**Important**: The JWT token is now passed from the frontend (user's session), not from environment variables. The env variable is only a fallback for testing.

### Step 3: Keep ngrok Running

Make sure ngrok is still running:
```bash
npx ngrok http 3004
```

### Step 4: Test the Agent API

You can test the agent by making a POST request to:
```
http://localhost:3000/api/agent
```

With body (include JWT from user's session):
```json
{
  "input_as_text": "What are the upcoming events?",
  "jwt_token": "user_jwt_token_here"
}
```

Or with Authorization header:
```
Authorization: Bearer user_jwt_token_here
```

**Note**: The JWT should come from the logged-in user's Supabase session, not a hardcoded value.

### Step 5: Connect to AI Builder (Optional)

If you want to use the code from AI Builder's "Agents SDK" tab:
1. Copy the code from AI Builder
2. Replace the `execute` function with the one from `workflow.ts`
3. Deploy your Next.js app
4. Use your deployed URL in AI Builder

## 🔄 When You Deploy to Render

1. Update `STUDENT_ASSISTANT_API_URL` in your environment variables to your Render URL:
   ```
   STUDENT_ASSISTANT_API_URL=https://your-render-app.onrender.com/api/v1/student-assistant/query
   ```

2. Stop using ngrok - you won't need it anymore

## 📝 Files Created

- `frontend-nextjs/app/api/agent/workflow.ts` - Main agent workflow code
- `frontend-nextjs/app/api/agent/route.ts` - API route handler

## 🚀 Next Steps

1. Install dependencies: `npm install @openai/agents openai`
2. Add environment variables to `.env.local`
3. Test the API endpoint
4. Integrate with your frontend chat widget

