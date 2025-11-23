# Quiz Session Race Condition - Critical Fix

## 🚨 Critical Issue Identified

**Problem**: Multiple concurrent "Start Quiz" requests cause session deletion race condition

**Impact**:
- Students can't submit answers (404 errors)
- Heartbeat fails (session not found)
- Progress updates fail
- Flags can't be created

---

## Root Cause Analysis

### What's Happening

Looking at the backend logs:

```
1. [SessionManagementService] Deleted old session a1e73b3e for attempt 9504f643
2. [QuizAttemptsService] ⚠️ Duplicate session detected for student e34934b0
3. [QuizAttemptsService] ERROR: Failed to create device session
   Key (session_id)=(5d19a55b) is not present in table "quiz_active_sessions"
4. [QuizAttemptsService] ✅ Active session created (retry): 7159e6de for attempt 0ca2aff1
5. [SessionManagementService] ERROR: Active session not found (404)
```

### The Race Condition

**Scenario**: Student clicks "Start Quiz" twice quickly (or browser retries automatically)

```
TIME    Request A (First Click)                 Request B (Second Click)
----    ----------------------------             ----------------------------
T0      checkDuplicateSessions()
        (finds nothing)

T1      Create session                           checkDuplicateSessions()
        session_id: AAAA                         (finds nothing yet)
        attempt_id: 1111

T2      ✅ Session AAAA created                  Try to create session
                                                 ❌ DUPLICATE KEY ERROR
                                                 (quiz_active_sessions has UNIQUE constraint)

T3      Creating device session...               Delete ALL sessions for this student+quiz
                                                 (INCLUDING session AAAA!)

T4      ❌ ERROR: session_id AAAA               Create new session
        not found!                               session_id: BBBB
                                                 attempt_id: 2222

T5      Frontend still thinks                    ✅ Session BBBB created
        attempt_id: 1111 exists

T6      Send heartbeat with
        attempt_id: 1111
        ❌ ERROR: Active session not found
```

---

## Why Operations Fail

### 1. Heartbeat Fails (404)
```typescript
// Frontend sends heartbeat with OLD attempt_id (1111)
POST /quiz-sessions/1111/heartbeat

// Backend looks for:
SELECT * FROM quiz_active_sessions
WHERE attempt_id = '1111' AND is_active = true

// Result: 0 rows (session was deleted)
// Error: "Active session not found"
```

### 2. Progress Update Fails (404)
```typescript
// Same issue - using deleted attempt_id
POST /quiz-sessions/1111/progress
// Error: "Active session not found"
```

### 3. Answer Submission Fails (404)
```typescript
POST /quiz-attempts/1111/answer
// Error: "Active quiz session not found"
```

---

## Solutions

### Solution 1: Prevent Double-Click (Frontend Fix) ⭐ **RECOMMENDED**

**File**: `frontend-nextjs/app/student/quiz/[id]/page.tsx`

**Add loading state to prevent multiple clicks**:

```typescript
const [isStarting, setIsStarting] = useState(false)

const handleStartQuiz = async () => {
  // ✅ Prevent double-click
  if (isStarting) {
    console.log('[Quiz] Already starting, ignoring duplicate click')
    return
  }

  setIsStarting(true)
  setLoading(true)

  try {
    const response = await startQuiz()
    // ... rest of logic
  } finally {
    setIsStarting(false)
    setLoading(false)
  }
}

// In JSX:
<Button
  onClick={handleStartQuiz}
  disabled={loading || isStarting}  // ✅ Disable during start
>
  {isStarting ? "Starting..." : "Start Quiz"}
</Button>
```

---

### Solution 2: Make Start Quiz Idempotent (Backend Fix)

**File**: `core-api-layer/.../quiz-attempts.service.ts`

**Check for existing in-progress attempt BEFORE creating new one**:

```typescript
async startQuizAttempt(/*...*/) {
  const supabase = this.supabaseService.getServiceClient();

  // ✅ CHECK: Does student already have an in-progress attempt?
  const { data: existingAttempt } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quiz_active_sessions!inner (
        session_id,
        is_active,
        started_at,
        last_heartbeat
      )
    `)
    .eq('quiz_id', quizId)
    .eq('student_id', studentId)
    .eq('status', 'in_progress')
    .eq('quiz_active_sessions.is_active', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  // ✅ If active attempt exists less than 5 minutes old, return it
  if (existingAttempt && existingAttempt.quiz_active_sessions) {
    const session = existingAttempt.quiz_active_sessions[0];
    const startedAt = new Date(session.started_at);
    const now = new Date();
    const minutesElapsed = (now.getTime() - startedAt.getTime()) / 60000;

    if (minutesElapsed < 5) {
      this.logger.log(
        `♻️ Returning existing attempt: ${existingAttempt.attempt_id} (started ${minutesElapsed.toFixed(1)} min ago)`
      );

      // Fetch questions and answers
      // ... (same as normal flow)

      return {
        message: 'Quiz resumed (duplicate start prevented)',
        attempt: existingAttempt,
        quiz: fullQuiz,
        questions: questionsToShow,
        savedAnswers: existingAnswers,
        isResumed: true
      };
    }
  }

  // ✅ No active attempt, proceed with normal creation
  // ... rest of existing code
}
```

---

### Solution 3: Add Database Constraint Check

**File**: `core-api-layer/.../quiz-attempts.service.ts`

**Before checkDuplicateSessions, add a lock**:

```typescript
// ✅ Use advisory lock to prevent concurrent creates
const lockKey = `quiz_start_${quizId}_${studentId}`;
const lockHash = this.hashString(lockKey);

const { data: lockAcquired } = await supabase
  .rpc('pg_try_advisory_lock', { key: lockHash });

if (!lockAcquired) {
  this.logger.warn(`⏳ Another quiz start in progress for student ${studentId}`);
  // Wait and retry OR return error
  throw new ConflictException('Quiz start already in progress, please wait');
}

try {
  // ... existing creation logic
} finally {
  // Release lock
  await supabase.rpc('pg_advisory_unlock', { key: lockHash });
}
```

---

### Solution 4: Frontend Retry Logic Fix

**File**: `frontend-nextjs/hooks/useQuizAttempt.ts`

**Remove auto-retry for start quiz**:

```typescript
// ❌ DON'T auto-retry on failure
const startQuiz = async () => {
  try {
    const response = await quizApi.student.startQuizAttempt(quizId, {
      deviceFingerprint: deviceFingerprint,
    });
    return response;
  } catch (error) {
    // ❌ Don't retry automatically - user must click again
    console.error('[startQuiz] Error:', error);
    throw error; // Let UI handle
  }
};
```

---

## Immediate Fix to Apply

### Quick Fix (5 minutes)

**1. Frontend: Prevent double-click**

`app/student/quiz/[id]/page.tsx` - Add to existing code:

```typescript
// At top of component
const [isStarting, setIsStarting] = useState(false)

// In handleStartQuiz (line ~440)
const handleStartQuiz = async () => {
  if (isStarting) return; // ✅ ADD THIS LINE

  setIsStarting(true);    // ✅ ADD THIS LINE

  try {
    const response = await startQuiz()
    // ... existing code
  } finally {
    setIsStarting(false);  // ✅ ADD THIS LINE
  }
}

// In Button JSX (line ~950)
<Button
  onClick={handleStartQuiz}
  disabled={loading || isStarting}  // ✅ ADD isStarting
>
  {isStarting ? "Starting Quiz..." : "Start Quiz"}
</Button>
```

**2. Add logging to see duplicate starts**

`app/student/quiz/[id]/page.tsx`:

```typescript
const startQuiz = async () => {
  console.log('[Quiz] 🚀 START QUIZ CALLED', {
    timestamp: new Date().toISOString(),
    quizId,
    hasDeviceFingerprint: !!deviceFingerprint
  });

  const response = await startAttempt(quizId);

  console.log('[Quiz] ✅ START QUIZ RESPONSE', {
    attemptId: response.attempt?.attempt_id,
    isResumed: response.isResumed
  });

  return response;
};
```

---

## Testing Steps

### 1. Verify the Fix

**Before Fix**:
1. Open quiz page
2. Rapidly click "Start Quiz" 3-4 times
3. Result: ❌ Errors in console, 404s, session not found

**After Fix**:
1. Open quiz page
2. Rapidly click "Start Quiz" 3-4 times
3. Result: ✅ Button disabled after first click, no duplicate requests

### 2. Check Backend Logs

**Should see**:
```
LOG [QuizAttemptsService] Quiz attempt started: {attempt_id} (attempt #1)
// NO duplicate session warnings
// NO device session errors
```

**Should NOT see**:
```
❌ WARN Duplicate session detected
❌ ERROR Failed to create device session
❌ ERROR Active session not found
```

### 3. Test Normal Flow

1. Start quiz (single click)
2. Answer a question
3. Check console - no 404 errors
4. Switch tabs (should create flag)
5. Submit quiz
6. All operations should succeed

---

## Database Check

### Verify Session State

```sql
-- Check for duplicate active sessions (should be 0)
SELECT quiz_id, student_id, COUNT(*) as session_count
FROM quiz_active_sessions
WHERE is_active = true
GROUP BY quiz_id, student_id
HAVING COUNT(*) > 1;

-- Check for orphaned attempts (should be 0)
SELECT qa.attempt_id, qa.status, qas.session_id
FROM quiz_attempts qa
LEFT JOIN quiz_active_sessions qas ON qa.attempt_id = qas.attempt_id
WHERE qa.status = 'in_progress'
  AND qas.session_id IS NULL;

-- Check for session without device session (should be 0)
SELECT qas.session_id, qas.attempt_id
FROM quiz_active_sessions qas
LEFT JOIN quiz_device_sessions qds ON qas.session_id = qds.session_id
WHERE qas.is_active = true
  AND qds.id IS NULL;
```

---

## Long-Term Improvements

### 1. Add Session Recovery Endpoint

If session gets into bad state, allow recovery:

```typescript
POST /quiz-sessions/recover
{
  "quizId": "...",
  "attemptId": "..."
}

// Backend:
// 1. Check if attempt exists
// 2. Check if session exists
// 3. If session missing, recreate it
// 4. Return session info
```

### 2. Add Health Check

Monitor for orphaned sessions:

```typescript
// Cron job every 5 minutes
async cleanupOrphanedSessions() {
  // Find sessions with no heartbeat for 15+ minutes
  // Mark as inactive
  // Log for monitoring
}
```

### 3. Add Distributed Lock

For high-concurrency scenarios:

```typescript
import { RedisService } from '@nestjs/redis';

// Use Redis for distributed locks
const lock = await redis.set(
  `lock:quiz_start:${studentId}:${quizId}`,
  'locked',
  'NX',
  'EX',
  10 // 10 second expiry
);

if (!lock) {
  throw new ConflictException('Quiz start in progress');
}
```

---

## Summary

### The Problem
- Double-clicking "Start Quiz" causes race condition
- Two sessions try to create simultaneously
- One deletes the other's session
- Frontend uses deleted attempt_id
- All operations fail with 404

### The Fix
1. ✅ **QUICK FIX**: Add `isStarting` state to prevent double-click
2. ✅ **ROBUST FIX**: Make backend idempotent (return existing attempt)
3. ✅ **LONG-TERM**: Add advisory locks or Redis locks

### Priority
1. **Immediate (Now)**: Apply frontend double-click prevention
2. **This Week**: Implement backend idempotency
3. **Next Sprint**: Add session recovery endpoint

---

## Files to Modify

**Quick Fix (Frontend Only)**:
- [ ] `frontend-nextjs/app/student/quiz/[id]/page.tsx` (add `isStarting` state)

**Complete Fix (Frontend + Backend)**:
- [ ] `frontend-nextjs/app/student/quiz/[id]/page.tsx` (prevent double-click)
- [ ] `core-api-layer/.../quiz-attempts.service.ts` (check existing attempt)
- [ ] Add database cleanup job (optional)

---

**Once quick fix is applied, test immediately by rapidly clicking "Start Quiz" multiple times!**
