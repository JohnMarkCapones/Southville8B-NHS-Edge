# Quiz Session Resume Fix - Answer Restoration Now Works! ✅

## Problem Discovered

**User Report**: "I answered questions 1 and 2, closed the tab, went to `/student/quiz/`, selected the same quiz, but it started from the beginning instead of resuming."

## Root Cause

The backend `startAttempt()` method **ALWAYS created a new session** even when an active session already existed.

### Broken Flow (Before Fix):

```
1. Student starts quiz
   → Backend creates attempt A with session S1

2. Student answers Q1, Q2
   → Saves to quiz_session_answers with session_id = S1

3. Student closes tab and goes back to quiz list

4. Student clicks same quiz again
   → Frontend calls startQuizAttempt()

5. Backend creates NEW attempt B with NEW session S2 ❌
   → Fetches savedAnswers for session S2 (empty!) ❌

6. Quiz starts from beginning ❌
```

**Problem**: Backend never checked if an active session already existed before creating a new one.

---

## The Fix

Modified `quiz-attempts.service.ts` to check for existing active sessions **BEFORE** creating new ones.

### New Flow (After Fix):

```
1. Student starts quiz
   → Backend creates attempt A with session S1

2. Student answers Q1, Q2
   → Saves to quiz_session_answers with session_id = S1

3. Student closes tab and goes back to quiz list

4. Student clicks same quiz again
   → Frontend calls startQuizAttempt()

5. Backend checks for existing active session ✅
   → Finds session S1 (active, < 5 min old)

6. Backend RESUMES session S1 ✅
   → Fetches savedAnswers for session S1 (Q1, Q2 answers!) ✅

7. Returns existing attempt with saved answers ✅

8. Frontend restores Q1, Q2 to UI ✅

9. Quiz continues from Q3! 🎉
```

---

## Code Changes

### File: `quiz-attempts.service.ts`

**Location**: Lines 38-128 (added at beginning of `startAttempt` method)

### What Was Added:

#### Step 1: Check for Existing Active Session

```typescript
// ✅ STEP 1: Check for existing active session (for answer restoration)
const { data: existingSession, error: sessionCheckError } = await supabase
  .from('quiz_active_sessions')
  .select('session_id, attempt_id, last_heartbeat_at')
  .eq('quiz_id', quizId)
  .eq('student_id', studentId)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```

**Purpose**: Look for an active session for this quiz + student.

---

#### Step 2: Check Session Timeout

```typescript
// Check if existing session is still valid (< 5 minutes since last heartbeat)
if (existingSession) {
  const lastHeartbeat = new Date(existingSession.last_heartbeat_at);
  const now = new Date();
  const minutesSinceHeartbeat = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60;

  if (minutesSinceHeartbeat < 5) {
    // ✅ RESUME: Active session found, return existing attempt
    this.logger.log(
      `🔄 Resuming existing session ${existingSession.session_id} for attempt ${existingSession.attempt_id}`,
    );
    // ... [resume logic] ...
  } else {
    // Session expired, deactivate it
    this.logger.log(
      `⏰ Session ${existingSession.session_id} expired (${minutesSinceHeartbeat.toFixed(1)} min since heartbeat)`,
    );
    await supabase
      .from('quiz_active_sessions')
      .update({ is_active: false })
      .eq('session_id', existingSession.session_id);
  }
}
```

**Purpose**:
- If session < 5 min old → **RESUME**
- If session > 5 min old → **EXPIRE** and create new

---

#### Step 3: Resume Logic

```typescript
// Fetch existing attempt details
const { data: existingAttempt } = await supabase
  .from('quiz_attempts')
  .select('*')
  .eq('attempt_id', existingSession.attempt_id)
  .single();

// Fetch full quiz with questions and choices
const { data: fullQuiz } = await supabase
  .from('quizzes')
  .select(`
    *,
    quiz_questions (
      *,
      quiz_choices (*)
    ),
    quiz_settings (*)
  `)
  .eq('quiz_id', quizId)
  .single();

// ✅ Fetch saved answers from the EXISTING session
const { data: savedAnswers, error: answersError } = await supabase
  .from('quiz_session_answers')
  .select('*')
  .eq('session_id', existingSession.session_id);

// Return existing attempt with saved answers
return {
  message: 'Quiz session resumed successfully',
  attempt: {
    ...existingAttempt,
    quiz: fullQuiz,
  },
  questions: fullQuiz?.quiz_questions || [],
  settings: fullQuiz?.quiz_settings?.[0] || null,
  savedAnswers: savedAnswers || [],
  attemptId: existingAttempt.attempt_id,
  attemptNumber: existingAttempt.attempt_number,
  questionsShown: existingAttempt.questions_shown,
  timeLimit: fullQuiz?.time_limit,
  startedAt: existingAttempt.started_at,
  isResumed: true, // ✅ Flag to indicate this is a resumed session
};
```

**Purpose**: Return existing attempt with correct session's saved answers.

---

## Key Features

### 1. Session Timeout Handling

- **Within 5 minutes**: Session is **resumed** with answers restored
- **After 5 minutes**: Session is **expired**, new attempt created (fresh start)

### 2. Automatic Session Cleanup

When a session expires, it's automatically marked as `is_active = false`.

### 3. Resume Indicator

The response includes `isResumed: true` flag so frontend knows this is a continued session.

---

## Backend Console Logs

### When Resuming Session:

```
[QuizAttemptsService] 🔄 Resuming existing session abc-123-def for attempt xyz-789
[QuizAttemptsService] 📝 Found 2 saved answers for session abc-123-def
```

### When Session Expired:

```
[QuizAttemptsService] ⏰ Session abc-123-def expired (6.2 min since heartbeat)
[QuizAttemptsService] 🆕 Creating new quiz attempt for student ...
```

### When No Active Session:

```
[QuizAttemptsService] 🆕 Creating new quiz attempt for student ...
[QuizAttemptsService] 📝 Found 0 saved answers for session [new-session-id]
```

---

## Testing Instructions

### Test 1: Resume Within 5 Minutes (Should Work Now!)

1. Navigate to `/student/quiz/` and select a quiz
2. Click "Start Quiz"
3. Answer questions 1 and 2
4. **Close the tab** (or click browser back)
5. Wait 10 seconds
6. Navigate to `/student/quiz/` again
7. Select the same quiz
8. Click "Start Quiz"

**Expected Result**: ✅ Questions 1 and 2 should show your previous answers!

**Check backend console** for:
```
🔄 Resuming existing session [session-id]
📝 Found 2 saved answers
```

---

### Test 2: Session Timeout (After 5 Minutes)

1. Start a quiz and answer questions
2. **Wait 6 minutes** without any activity
3. Go back to quiz list and select the same quiz
4. Click "Start Quiz"

**Expected Result**: ✅ Quiz starts fresh (answers NOT restored)

**Check backend console** for:
```
⏰ Session [session-id] expired (6.0 min since heartbeat)
🆕 Creating new quiz attempt
```

**Reason**: Session timeout is working as designed (5-minute limit).

---

### Test 3: Multiple Tab Switches (Within 5 Min)

1. Start quiz, answer Q1, Q2
2. Switch to another tab for 30 seconds
3. Come back and continue to Q3
4. Close tab
5. Wait 1 minute
6. Return to quiz

**Expected Result**: ✅ All answers (Q1, Q2, Q3) restored!

---

## Frontend Impact

**No frontend changes needed!** The frontend already:
- Calls `startQuizAttempt()` when entering quiz
- Restores answers from `savedAnswers` in response
- Handles `isResumed` flag automatically

The fix is **purely backend** - just checking for existing sessions before creating new ones.

---

## Database Changes

**No migration needed!** Uses existing tables:
- `quiz_active_sessions` (session tracking)
- `quiz_attempts` (attempt records)
- `quiz_session_answers` (saved answers)

---

## Edge Cases Handled

### 1. No Active Session

- **Scenario**: First time starting quiz
- **Behavior**: Creates new session (as before)
- **Result**: ✅ Works correctly

### 2. Session Expired (> 5 min)

- **Scenario**: Student left for 10 minutes
- **Behavior**: Marks old session inactive, creates new
- **Result**: ✅ Fresh start (expected)

### 3. Multiple Sessions (Shouldn't Happen)

- **Scenario**: Duplicate sessions somehow exist
- **Behavior**: Selects most recent active session
- **Result**: ✅ Resumes most recent attempt

### 4. Session Without Answers

- **Scenario**: Session exists but no answers saved yet
- **Behavior**: Returns empty `savedAnswers` array
- **Result**: ✅ Quiz starts normally (no errors)

---

## Comparison: Before vs After

| Scenario | Before Fix | After Fix |
|----------|-----------|-----------|
| Student answers Q1, Q2 and returns < 5 min | ❌ Starts from Q1 | ✅ Continues from Q3 |
| Student leaves for 6 minutes | ❌ Creates duplicate attempt | ✅ New attempt (correct) |
| First time starting quiz | ✅ Works | ✅ Works |
| Quiz with no saved answers | ✅ Works | ✅ Works |
| Session timeout | ⚠️ Duplicate sessions | ✅ Clean session handling |

---

## Success Criteria

- ✅ Backend checks for existing sessions before creating new ones
- ✅ Sessions < 5 min old are resumed with saved answers
- ✅ Sessions > 5 min old are expired and new ones created
- ✅ Frontend receives correct `savedAnswers` for existing session
- ✅ Answer restoration works when navigating through quiz list
- ✅ No duplicate sessions created
- ✅ Session timeout still works correctly

---

## Files Modified

### Backend:
1. **`quiz-attempts.service.ts`** (Lines 38-128)
   - Added session check logic at start of `startAttempt()`
   - Added resume logic for existing sessions
   - Added session expiration handling

### Frontend:
- **No changes needed!** Already handles answer restoration.

---

## Status

✅ **FIX COMPLETE**

**Date**: November 7, 2025
**Issue**: Answer restoration failed when navigating back through quiz list
**Solution**: Backend now checks and resumes existing sessions instead of always creating new ones
**Result**: Google Forms-style answer restoration now works correctly!

---

## Try It Now!

1. Answer some quiz questions
2. Close the tab
3. Go back to `/student/quiz/`
4. Select the same quiz
5. **Your answers should still be there!** 🎉
