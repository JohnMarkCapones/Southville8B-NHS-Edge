# Quiz Resume Functionality - Implementation Plan

**Date**: November 8, 2025
**Goal**: Ensure quiz answers persist when student closes tab/browser and returns (like Google Forms)

---

## Current Implementation Analysis

### ✅ **What's Already Working**

1. **Auto-save System** (useQuizAttempt.ts lines 186-242):
   - Every answer change saves to backend with 500ms debounce
   - Saves to `quiz_session_answers` table
   - Handles all answer types: single choice, multiple choice, text, JSON

2. **Backend Resume Detection** (quiz-attempts.service.ts lines 38-128):
   - Checks for existing active sessions when student starts quiz
   - Validates session is fresh (< 5 minutes since last heartbeat)
   - Fetches saved answers from `quiz_session_answers` table
   - Returns `savedAnswers` array + `isResumed: true` flag

3. **Frontend Answer Restoration** (page.tsx lines 253-278):
   - Reads `savedAnswers` from backend response
   - Maps answers back to question IDs
   - Restores local state with previous answers

4. **Heartbeat Hook Available** (useHeartbeat.ts):
   - Sends heartbeat every 2 minutes to keep session alive
   - Validates session integrity every 5 minutes
   - Auto-starts when quiz begins

---

## ❌ **What's Missing/Broken**

### Problem 1: Session Expires After 5 Minutes
**Issue**: Backend checks `last_heartbeat` and expires sessions after 5 min of inactivity
**Root Cause**: `useHeartbeat` hook exists but is NOT used in quiz page
**Impact**: If student closes tab for >5 min, session expires and answers are lost

### Problem 2: No Visual Feedback on Resume
**Issue**: Student doesn't know if quiz was resumed or if answers were restored
**Root Cause**: `isResumed` flag from backend is ignored
**Impact**: Confusing UX - student doesn't know what happened

### Problem 3: Timer Doesn't Sync
**Issue**: If quiz has time limit, timer starts from beginning on resume
**Root Cause**: Time spent is not tracked or restored
**Impact**: Student gets extra time or loses time unfairly

### Problem 4: UI State Not Restored
**Issue**: Current question index resets to 0 on resume
**Root Cause**: Question index not saved/restored
**Impact**: Student has to scroll back to where they were

### Problem 5: Progress Not Tracked
**Issue**: Progress percentage resets on resume
**Root Cause**: Progress not saved to backend session
**Impact**: Poor UX, inaccurate monitoring

---

## Implementation Plan

### **Phase 1: Enable Heartbeat** (CRITICAL - Priority 1)

**Goal**: Keep session alive so resume works beyond 5 minutes

**Changes Needed**:

1. **app/student/quiz/[id]/page.tsx**:
   ```typescript
   // Add import
   import { useHeartbeat } from '@/hooks/useHeartbeat';

   // Inside component
   const heartbeat = useHeartbeat({
     interval: 120000, // 2 minutes (keeps session < 5 min threshold)
     autoStart: false, // Don't start until quiz begins
     onSessionInvalid: () => {
       // Session was terminated by teacher or expired
       toast({
         title: "Session Invalid",
         description: "Your quiz session has ended. Please contact your teacher.",
         variant: "destructive"
       });
       router.push('/student/quiz');
     }
   });

   // Start heartbeat when quiz starts
   useEffect(() => {
     if (quizStarted && !quizCompleted && backendAttempt.attempt) {
       heartbeat.start();
     }

     return () => {
       heartbeat.stop();
     };
   }, [quizStarted, quizCompleted, backendAttempt.attempt]);
   ```

**Why This Works**:
- Heartbeat sends request every 2 minutes
- Backend updates `last_heartbeat` timestamp in `quiz_active_sessions`
- Session stays alive indefinitely while quiz is active
- Student can close tab, reopen hours later, and resume

**Testing**:
1. Start quiz
2. Console should show heartbeat requests every 2 minutes
3. Close tab for 10 minutes
4. Reopen quiz - should resume successfully

---

### **Phase 2: Show Resume Notification** (Priority 2)

**Goal**: Give student clear feedback that quiz was resumed

**Changes Needed**:

1. **app/student/quiz/[id]/page.tsx** - handleStartQuiz:
   ```typescript
   const result = await backendAttempt.startAttempt(params.id as string)

   if (result) {
     console.log('[Quiz] Backend start successful!')

     // ✅ Check if quiz was resumed
     if (backendAttempt.attempt?.isResumed) {
       const answersRestored = backendAttempt.attempt.savedAnswers?.length || 0;

       toast({
         title: "Quiz Resumed",
         description: `Welcome back! ${answersRestored} previous answer${answersRestored !== 1 ? 's' : ''} restored.`,
         variant: "default",
         duration: 5000,
       });

       console.log(`[Quiz] 🔄 Quiz RESUMED with ${answersRestored} saved answers`);
     }
   }
   ```

**Why This Helps**:
- Clear user feedback about what happened
- Shows how many answers were restored
- Builds trust in the system

**Testing**:
1. Answer 3 questions
2. Close tab
3. Reopen quiz
4. Should see: "Quiz Resumed - 3 previous answers restored"

---

### **Phase 3: Restore UI State** (Priority 3)

**Goal**: Return student to the question they were working on

**Changes Needed**:

1. **Update backend to save current question index**:

Backend already has `updateProgress` endpoint (quiz.ts line 248). We need to use it.

2. **app/student/quiz/[id]/page.tsx** - Track current question:
   ```typescript
   // Save progress when question changes
   useEffect(() => {
     if (!quizStarted || quizCompleted || !backendAttempt.attempt) return;

     // Debounce progress updates
     const timer = setTimeout(() => {
       const questionsAnswered = Object.keys(responses).length;
       const progress = (questionsAnswered / totalQuestions) * 100;

       quizApi.student.updateProgress(backendAttempt.attempt.attempt_id, {
         currentQuestionIndex: currentQuestionIndex, // ✅ SAVE CURRENT QUESTION
         questionsAnswered: questionsAnswered,
         progress: Math.round(progress),
         idleTimeSeconds: 0
       }).catch(err => {
         console.warn('[Quiz] Failed to save progress:', err);
       });
     }, 2000); // Save after 2 seconds of inactivity

     return () => clearTimeout(timer);
   }, [currentQuestionIndex, responses, quizStarted, quizCompleted]);

   // Restore question index on resume
   useEffect(() => {
     if (backendAttempt.attempt?.isResumed && backendAttempt.attempt.currentQuestionIndex !== undefined) {
       setCurrentQuestionIndex(backendAttempt.attempt.currentQuestionIndex);
       console.log(`[Quiz] 📍 Restored question index: ${backendAttempt.attempt.currentQuestionIndex}`);
     }
   }, [backendAttempt.attempt?.isResumed]);
   ```

**Why This Helps**:
- Student doesn't have to scroll to find where they left off
- Better UX especially for long quizzes

**Testing**:
1. Navigate to question 5
2. Close tab
3. Reopen quiz
4. Should be on question 5

---

### **Phase 4: Timer Synchronization** (Priority 4)

**Goal**: Track elapsed time correctly across sessions

**Changes Needed**:

Backend already tracks `time_spent` in `quiz_attempts` table. We need to:

1. **Calculate remaining time on resume**:
   ```typescript
   // In handleStartQuiz
   if (quizData.time_limit && backendAttempt.attempt) {
     const timeSpentSeconds = backendAttempt.attempt.time_spent || 0;
     const timeLimitMinutes = quizData.time_limit;
     const remainingSeconds = (timeLimitMinutes * 60) - timeSpentSeconds;

     if (remainingSeconds <= 0) {
       // Time expired
       toast({
         title: "Time Expired",
         description: "Your time limit has been reached. Submitting quiz...",
         variant: "destructive"
       });
       handleSubmitQuiz();
     } else {
       // Start timer with remaining time
       setTimeRemaining(remainingSeconds);
       setTimerStarted(true);
     }
   }
   ```

2. **Update time_spent periodically**:
   ```typescript
   // Track elapsed time
   useEffect(() => {
     if (!timerStarted || quizCompleted) return;

     const interval = setInterval(() => {
       setTimeRemaining(prev => {
         if (prev <= 1) {
           handleSubmitQuiz();
           return 0;
         }
         return prev - 1;
       });

       // Update backend every 30 seconds
       if (Date.now() % 30000 < 1000) {
         const timeSpent = (quizData.time_limit * 60) - timeRemaining;
         // Send to backend via heartbeat or separate API call
       }
     }, 1000);

     return () => clearInterval(interval);
   }, [timerStarted, quizCompleted]);
   ```

**Why This Matters**:
- Fair time tracking across sessions
- Prevents cheating by closing/reopening tab
- Accurate time limits

**Testing**:
1. Start quiz with 10 minute limit
2. Answer questions for 3 minutes
3. Close tab
4. Reopen quiz
5. Timer should show 7 minutes remaining

---

### **Phase 5: Progress Tracking** (Priority 5)

**Goal**: Show accurate progress percentage on resume

**Implementation**: Already covered in Phase 3's `updateProgress` call

**UI Update**:
```typescript
// Calculate and display progress
const progress = (Object.keys(responses).length / totalQuestions) * 100;

<Progress value={progress} className="w-full" />
<p>{Math.round(progress)}% Complete</p>
```

---

## Testing Scenarios

### Scenario 1: Normal Resume (< 5 minutes)
1. Start quiz
2. Answer 3 questions
3. Close tab
4. Wait 2 minutes
5. Reopen quiz URL
6. **Expected**:
   - Toast: "Quiz Resumed - 3 previous answers restored"
   - All 3 answers visible
   - Same question index
   - Timer continues from where it left off

### Scenario 2: Long Resume (> 5 minutes, with heartbeat)
1. Start quiz
2. Answer 5 questions
3. Close tab (heartbeat stops)
4. Wait 10 minutes
5. Reopen quiz URL
6. **Expected**:
   - Backend finds session but it expired (> 5 min since heartbeat)
   - Creates NEW attempt
   - Answers are LOST (expected behavior - session expired)

**Solution**: Heartbeat keeps session alive while tab is open

### Scenario 3: Browser Crash
1. Start quiz
2. Answer questions
3. Simulate crash (kill browser process)
4. Restart browser
5. Navigate to quiz URL
6. **Expected**:
   - If < 5 min: Session resumes
   - If > 5 min: Session expired, new attempt

### Scenario 4: Network Disconnect
1. Start quiz
2. Disconnect WiFi
3. Answer questions (saves locally)
4. Reconnect WiFi
5. Answers auto-save when connection restores
6. **Expected**: Debounced saves queue up and send when online

### Scenario 5: Multiple Tabs
1. Open quiz in 2 tabs
2. Answer in Tab 1
3. Switch to Tab 2
4. **Expected**:
   - Tab 2 shows same session
   - Answers sync (may need refresh)
   - Heartbeat from both tabs (harmless)

---

## Database Tables Used

### `quiz_active_sessions`
```sql
session_id          UUID
attempt_id          UUID
quiz_id             UUID
student_id          UUID
device_fingerprint  TEXT
is_active           BOOLEAN
started_at          TIMESTAMP
last_heartbeat      TIMESTAMP  -- ✅ CRITICAL for 5-min check
current_question    INTEGER    -- ✅ For UI restoration
```

### `quiz_session_answers`
```sql
session_id              UUID
question_id             UUID
temporary_choice_id     UUID      -- Single choice
temporary_choice_ids    UUID[]    -- Multiple choice
temporary_answer_text   TEXT      -- Text answer
temporary_answer_json   JSONB     -- Complex answer
answered_at             TIMESTAMP
```

### `quiz_attempts`
```sql
attempt_id      UUID
quiz_id         UUID
student_id      UUID
time_spent      INTEGER  -- ✅ For timer sync
score           DECIMAL
submitted_at    TIMESTAMP
```

---

## Implementation Order

1. **Phase 1: Enable Heartbeat** ← START HERE (most critical)
2. **Phase 2: Resume Notification** ← Quick win
3. **Phase 3: Restore UI State** ← Better UX
4. **Phase 4: Timer Sync** ← Important for timed quizzes
5. **Phase 5: Progress Tracking** ← Nice to have

---

## Potential Issues

### Issue 1: Debounce Conflicts
**Problem**: Answer auto-save has 500ms debounce, progress has 2s debounce
**Solution**: Use different debounce timers, don't cancel each other

### Issue 2: Stale State on Resume
**Problem**: React state might not update correctly
**Solution**: Use `setResponses()` in a separate effect after resume detection

### Issue 3: Heartbeat During Development
**Problem**: Development hot-reload kills heartbeat interval
**Solution**: Use proper cleanup in useEffect, restart on component mount

### Issue 4: Timer Drift
**Problem**: JavaScript timers aren't perfectly accurate
**Solution**: Use server time for authoritative time tracking, client timer is just UI

---

## Success Criteria

✅ Student can close tab and reopen quiz anytime
✅ All answers are preserved across sessions
✅ Session stays alive with active heartbeat
✅ Student sees clear "Quiz Resumed" message
✅ Question position is restored
✅ Timer shows correct remaining time
✅ Progress bar shows correct percentage
✅ Works across browser restarts
✅ Works after network reconnect
✅ Session expires after 5 min of inactivity (no heartbeat)

---

## Next Steps

1. Implement Phase 1 (heartbeat) immediately
2. Test with different scenarios
3. Implement Phases 2-3 together
4. Test timer synchronization thoroughly
5. Final integration testing with all features

**Ready to implement!** 🚀
