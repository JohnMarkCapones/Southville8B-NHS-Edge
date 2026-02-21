# Fullscreen Exit Detection - Debugging Guide

**Date**: November 8, 2025
**Issue**: Toast not showing and flags not being logged when pressing ESC to exit fullscreen

---

## Bugs Fixed

### Bug 1: First Exit Not Detected ❌ → ✅ FIXED

**Original Code** (useQuizFlags.ts line 211):
```typescript
if (!isNowFullscreen && fullscreenExitCount > 0) {
  // This ONLY fires AFTER the first exit (count starts at 0)
```

**Problem**: The condition `fullscreenExitCount > 0` meant the first exit was never flagged because the count starts at 0.

**Fix Applied**:
```typescript
const wasFullscreen = isFullscreen; // Track previous state
if (wasFullscreen && !isNowFullscreen) {
  // Now fires on EVERY exit (checks previous state instead of count)
```

**Impact**: First fullscreen exit now properly detected and flagged ✅

---

### Bug 2: Insufficient Logging ❌ → ✅ FIXED

**Problem**: Hard to debug what's happening when student exits fullscreen

**Fix Applied**: Added comprehensive logging at every step:

**useQuizFlags.ts**:
- ✅ Log when fullscreen change detected
- ✅ Log previous and current fullscreen state
- ✅ Log when exit is detected
- ✅ Log when flag submission starts
- ✅ Log when flag submission succeeds/fails

**page.tsx**:
- ✅ Log fullscreen monitor state on every render
- ✅ Log when toast is shown
- ✅ Log when dialog is opened

---

## How to Debug

### Step 1: Open Browser Console

**Chrome/Edge**: F12 → Console tab
**Firefox**: F12 → Console tab

### Step 2: Start Quiz with Fullscreen Required

1. Make sure quiz has `require_fullscreen = true` in database:
```sql
UPDATE quiz_settings
SET require_fullscreen = true
WHERE quiz_id = 'your-quiz-id';
```

2. Start the quiz
3. Watch console for:
```
[Quiz] Requesting fullscreen mode...
[Quiz] Fullscreen mode activated
[useQuizFlags] ✅ Fullscreen ENTERED
```

### Step 3: Press ESC to Exit Fullscreen

Watch console for this sequence:

#### Expected Console Output:

```javascript
// 1. Fullscreen change detected
[useQuizFlags] Fullscreen change detected: {
  wasFullscreen: true,
  isNowFullscreen: false,
  attemptId: "abc-123",
  detectFullscreenExit: true
}

// 2. Exit detected, incrementing count
[useQuizFlags] 🚨 Fullscreen EXIT detected - submitting flag
[useQuizFlags] Fullscreen exit count: 1

// 3. Flag submission starting
[useQuizFlags] ✅ Submitting flag: fullscreen_exit {
  attemptId: "abc-123",
  metadata: { count: 1 }
}

// 4. Flag submitted to backend
[useQuizFlags] ✅ Flag submitted successfully: fullscreen_exit { success: true, message: "..." }

// 5. Quiz page detects exit
[Quiz] Fullscreen monitor effect: {
  requireFullscreen: true,
  quizStarted: true,
  quizCompleted: false,
  isFullscreen: false,
  exitCount: 1
}

// 6. Warnings shown
[Quiz] 🚨 Student exited fullscreen mode - showing warnings
[Quiz] Toast notification shown
[Quiz] Warning dialog opened
```

---

## Common Issues & Solutions

### Issue 1: No console logs at all

**Diagnosis**: useQuizFlags hook not initialized

**Check**:
```javascript
// Look for this in console when quiz starts:
[useQuizFlags] Hook initialized
```

**Solution**:
- Verify `detectFullscreenExit: true` in page.tsx line 59
- Verify `attemptId` is not null (check console logs)

---

### Issue 2: "Cannot submit flag - no attemptId"

**Console Output**:
```
[useQuizFlags] Cannot submit flag - no attemptId: fullscreen_exit
```

**Diagnosis**: Quiz attempt not created by backend

**Solution**:
1. Check backend is running (port 3004)
2. Check network tab for `/quiz-attempts/start/{quizId}` request
3. Verify it returns `attempt_id` in response
4. Check for authentication errors in backend logs

**Backend Check**:
```bash
curl http://localhost:3004/health
```

---

### Issue 3: Flag submitted but not in database

**Console Output**:
```
[useQuizFlags] ✅ Flag submitted successfully: fullscreen_exit
```

**But**: No record in `quiz_flags` table

**Diagnosis**: Backend accepted request but failed to save

**Check Backend Logs** for:
```
[QuizSessionsController] POST /quiz-sessions/{attemptId}/flag
```

**Common Causes**:
1. **No session_id**: Backend can't find active session for attempt
   - Check `quiz_active_sessions` table for matching `attempt_id`

2. **No participant_id**: Backend can't find participant record
   - Check `quiz_participants` table for matching `session_id`

3. **Foreign key violation**: Invalid quiz_id or student_id
   - Check `quiz_attempts` table has valid `quiz_id` and `student_id`

**Database Verification**:
```sql
-- Check if session exists
SELECT * FROM quiz_active_sessions
WHERE session_id = (
  SELECT attempt_id FROM quiz_attempts WHERE attempt_id = 'your-attempt-id'
);

-- Check if participant exists
SELECT * FROM quiz_participants
WHERE session_id = 'your-session-id';

-- Check for flags
SELECT * FROM quiz_flags
WHERE session_id = 'your-session-id'
ORDER BY created_at DESC;
```

---

### Issue 4: Toast not showing but dialog appears

**Diagnosis**: Toaster component not rendering

**Check**:
1. Look for `<Toaster />` in page.tsx line 931
2. Check browser console for toast-related errors
3. Verify toast function is called (check logs)

**Solution**:
```typescript
// Verify this exists in page.tsx:
import { Toaster } from "@/components/ui/toaster"

// And at the end of JSX:
<Toaster />
```

---

### Issue 5: Dialog not showing but toast appears

**Diagnosis**: Dialog state not updating

**Check**:
```javascript
// Should see this in console:
[Quiz] Warning dialog opened
```

**Verify**:
1. `showFullscreenWarning` state updates (line 226)
2. `FullscreenWarningDialog` component exists
3. No errors in browser console

---

## Testing Checklist

Use this checklist to verify fullscreen enforcement is working:

### Pre-Test Setup
- [ ] Backend running on port 3004
- [ ] Frontend running on port 3000/3001
- [ ] Quiz has `require_fullscreen = true` in database
- [ ] Browser console open (F12)

### Test 1: Quiz Start
- [ ] Click "Start Quiz" button
- [ ] Browser requests fullscreen permission
- [ ] Accept fullscreen
- [ ] Console shows: `[Quiz] Fullscreen mode activated`
- [ ] Quiz loads in fullscreen

### Test 2: First Exit
- [ ] Press ESC key
- [ ] Browser exits fullscreen
- [ ] Console shows: `[useQuizFlags] 🚨 Fullscreen EXIT detected`
- [ ] Console shows: `[useQuizFlags] ✅ Submitting flag`
- [ ] Console shows: `[Quiz] Toast notification shown`
- [ ] **Toast appears** in top-right corner (red, 6 seconds)
- [ ] **Dialog appears** in center of screen
- [ ] Toast shows: "Exit count: 1"

### Test 3: Database Verification
- [ ] Check `quiz_flags` table has new record:
```sql
SELECT * FROM quiz_flags
WHERE flag_type = 'fullscreen_exit'
ORDER BY created_at DESC LIMIT 1;
```
- [ ] Verify `metadata` column contains: `{"count": 1, "timestamp": "...", "userAgent": "..."}`
- [ ] Verify `severity = 'warning'`

### Test 4: Multiple Exits
- [ ] Click "Return to Fullscreen" button in dialog
- [ ] Press ESC again
- [ ] Toast shows: "Exit count: 2"
- [ ] New flag created in database
- [ ] Repeat 3 times total
- [ ] Verify 3 flags in database

### Test 5: Resume After Dialog Close
- [ ] Click "Continue Without Fullscreen" button
- [ ] Dialog closes
- [ ] Quiz continues (not in fullscreen)
- [ ] Can still answer questions
- [ ] Press F11 to enter fullscreen manually
- [ ] Console shows: `[useQuizFlags] ✅ Fullscreen ENTERED`
- [ ] Press ESC again
- [ ] New toast and dialog appear
- [ ] Exit count increments correctly

---

## API Endpoint Verification

### Submit Flag Endpoint

**Endpoint**: `POST /quiz-sessions/{attemptId}/flag`

**Request**:
```json
{
  "flagType": "fullscreen_exit",
  "metadata": {
    "count": 1,
    "timestamp": "2025-11-08T20:00:00.000Z",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Flag submitted successfully"
}
```

**Test with curl**:
```bash
curl -X POST http://localhost:3004/quiz-sessions/YOUR-ATTEMPT-ID/flag \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-TOKEN" \
  -d '{
    "flagType": "fullscreen_exit",
    "metadata": {"count": 1, "timestamp": "2025-11-08T20:00:00Z"}
  }'
```

---

## Database Schema Check

Verify all required tables exist:

```sql
-- 1. Quiz settings table
SELECT require_fullscreen FROM quiz_settings WHERE quiz_id = 'your-quiz-id';
-- Expected: true

-- 2. Quiz attempts table
SELECT attempt_id, quiz_id, student_id FROM quiz_attempts WHERE attempt_id = 'your-attempt-id';
-- Expected: 1 row with valid IDs

-- 3. Active sessions table
SELECT session_id, quiz_id, student_id FROM quiz_active_sessions WHERE session_id = 'your-attempt-id';
-- Expected: 1 row

-- 4. Participants table
SELECT id, session_id, quiz_id, student_id FROM quiz_participants WHERE session_id = 'your-attempt-id';
-- Expected: 1 row

-- 5. Flags table (after pressing ESC)
SELECT flag_type, severity, metadata, created_at
FROM quiz_flags
WHERE session_id = 'your-attempt-id'
ORDER BY created_at DESC;
-- Expected: 1 row per exit with flag_type = 'fullscreen_exit'
```

---

## Files Modified (for reference)

1. **frontend-nextjs/hooks/useQuizFlags.ts**
   - Lines 207-245: Fixed fullscreen detection logic
   - Lines 111-147: Added comprehensive logging to submitFlag

2. **frontend-nextjs/app/student/quiz/[id]/page.tsx**
   - Lines 196-229: Added logging to fullscreen monitor effect
   - Line 18: Added Toaster import
   - Line 33: Added useToast hook
   - Line 931: Added Toaster component

---

## What to Report

If still not working, provide:

1. **Console logs** from when you:
   - Start the quiz
   - Press ESC to exit fullscreen

2. **Database queries**:
```sql
-- Check quiz settings
SELECT * FROM quiz_settings WHERE quiz_id = 'your-quiz-id';

-- Check if attempt was created
SELECT * FROM quiz_attempts ORDER BY created_at DESC LIMIT 1;

-- Check for active session
SELECT * FROM quiz_active_sessions ORDER BY created_at DESC LIMIT 1;

-- Check for flags
SELECT * FROM quiz_flags ORDER BY created_at DESC LIMIT 5;
```

3. **Network tab** in browser:
   - Filter for "flag"
   - Check if POST request to `/quiz-sessions/{id}/flag` is made
   - Check request payload
   - Check response status

4. **Backend logs**:
   - Any errors when flag endpoint is called
   - Supabase connection issues

---

## Summary

**Bugs Fixed**:
1. ✅ First exit now properly detected (fixed condition logic)
2. ✅ Comprehensive logging added for debugging
3. ✅ Better error handling in flag submission

**Next Steps**:
1. Restart frontend dev server
2. Open browser console
3. Start a quiz with `require_fullscreen = true`
4. Press ESC
5. Check console logs and share output

**Expected Behavior**:
- ✅ Toast appears (red, top-right, 6 seconds)
- ✅ Dialog appears (center, modal)
- ✅ Flag logged to database
- ✅ Console shows detailed logs of entire flow
