# Test Flag Endpoint

## Problem
Frontend shows "Tab Switch Detected" but no flags appear in `quiz_flags` table.

## Diagnostic Steps

### 1. Check Browser Console
Open DevTools (F12) → Console tab

Look for:
- `[useQuizFlags] Flag submitted: tab_switch` (success)
- `[useQuizFlags] Failed to submit flag:` (error)

### 2. Check Network Tab
Open DevTools (F12) → Network tab

When you switch tabs, look for:
```
POST /api/quiz-sessions/{attemptId}/flag
```

Check the response:
- **Status 200**: Success (check response body)
- **Status 401**: Authentication issue
- **Status 403**: Permission denied
- **Status 404**: Endpoint not found
- **Status 500**: Server error

### 3. Test Endpoint Directly

#### Using curl:
```bash
curl -X POST http://localhost:3004/api/quiz-sessions/YOUR_ATTEMPT_ID/flag \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flagType": "tab_switch",
    "metadata": {
      "count": 1,
      "timestamp": "2025-01-07T12:00:00Z"
    }
  }'
```

#### Using Thunder Client (VS Code):
1. POST `http://localhost:3004/api/quiz-sessions/{attemptId}/flag`
2. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {your-jwt-token}`
3. Body (JSON):
```json
{
  "flagType": "tab_switch",
  "metadata": {
    "count": 1,
    "timestamp": "2025-01-07T12:00:00Z"
  }
}
```

### 4. Check Backend Logs

Look for:
```
[SessionManagementController] Flag submission for attempt {attemptId}: tab_switch
```

If you DON'T see this, the request isn't reaching the backend.

### 5. Verify attemptId

In your browser console, check if attemptId is defined:
```javascript
// In the quiz page component
console.log('Attempt ID:', attemptId);
```

If `attemptId` is `null` or `undefined`, flags won't be submitted.

---

## Common Issues

### Issue 1: attemptId is null
**Symptom**: Console shows nothing, no network requests
**Fix**: Verify quiz start creates an attemptId

Check:
```typescript
const { attemptId } = useQuizAttempt();
console.log('attemptId:', attemptId);  // Should not be null
```

### Issue 2: API Client Error
**Symptom**: Console shows `Failed to submit flag: {error}`
**Fix**: Check network tab for actual error

Common errors:
- 401: JWT token expired/missing
- 403: User is not a student
- 404: Endpoint URL wrong
- 500: Backend database error

### Issue 3: CORS Error
**Symptom**: `Access-Control-Allow-Origin` error
**Fix**: Verify backend CORS settings in `main.ts`

### Issue 4: Database Connection
**Symptom**: 500 error, backend logs show Supabase error
**Fix**: Check Supabase credentials in `.env`

---

## Expected Flow

### Successful Flag Submission

1. **Frontend**: Student switches tabs
2. **Hook**: `useQuizFlags` detects visibility change
3. **Hook**: Calls `submitFlag('tab_switch', { count: 1 })`
4. **API**: POST to `/api/quiz-sessions/{attemptId}/flag`
5. **Backend**: Controller receives request
6. **Backend**: Service validates attempt ownership
7. **Backend**: Service inserts into `quiz_flags` table
8. **Backend**: Returns `{ success: true, message: 'Flag recorded' }`
9. **Frontend**: Console logs success

### Check Each Step

**Step 1-2**: Visibility change detected
```javascript
// Browser console should show:
[useQuizFlags] Flag submitted: tab_switch { count: 1 }
```

**Step 3-4**: API call made
```javascript
// Network tab should show:
POST /api/quiz-sessions/abc-123/flag
Status: 200 OK
Response: { success: true, message: "Flag recorded successfully" }
```

**Step 5-6**: Backend receives
```
// Backend logs should show:
[SessionManagementController] Flag submission for attempt abc-123: tab_switch
[SessionManagementService] Client flag submitted: tab_switch for attempt abc-123
```

**Step 7**: Database insert
```sql
-- Check manually:
SELECT * FROM quiz_flags
WHERE attempt_id = 'your-attempt-id'
ORDER BY created_at DESC;
```

---

## Quick Test Script

Add this to your quiz page temporarily:

```typescript
// TEST: Manual flag submission
useEffect(() => {
  if (attemptId) {
    console.log('Testing flag submission with attemptId:', attemptId);

    quizApi.student.submitFlag(attemptId, {
      flagType: 'tab_switch',
      metadata: { test: true }
    })
    .then(res => console.log('✅ Flag submitted:', res))
    .catch(err => console.error('❌ Flag failed:', err));
  }
}, [attemptId]);
```

This will submit a test flag as soon as the quiz loads.

---

## Solution Checklist

- [ ] Verify attemptId is not null
- [ ] Check browser console for errors
- [ ] Check network tab for request/response
- [ ] Verify JWT token is valid
- [ ] Check backend logs for request received
- [ ] Check database for inserted flag
- [ ] Test endpoint with curl/Thunder Client

---

## If Still Not Working

Please provide:
1. Browser console output (full error)
2. Network tab response (status code + body)
3. Backend logs (when you switch tabs)
4. Value of attemptId in console
5. SQL query result: `SELECT * FROM quiz_flags WHERE attempt_id = 'your-id'`

This will help identify exactly where the flow is breaking.
