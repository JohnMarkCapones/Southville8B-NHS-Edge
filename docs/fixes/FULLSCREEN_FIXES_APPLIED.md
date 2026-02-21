# Fullscreen Exit Detection - Bugs Fixed

**Date**: November 8, 2025
**Status**: ✅ FIXED - Ready for Testing

---

## Issues Reported

1. ❌ **No toast when pressing ESC to exit fullscreen**
2. ❌ **No flag in database after exiting fullscreen**

---

## Root Causes Found

### Bug #1: First Exit Never Detected
**File**: `frontend-nextjs/hooks/useQuizFlags.ts` (line 211)

**Original Code**:
```typescript
if (!isNowFullscreen && fullscreenExitCount > 0) {
  // Only fires AFTER first exit
}
```

**Problem**: The condition `fullscreenExitCount > 0` prevented the first exit from being detected because the counter starts at 0.

**Fix Applied**:
```typescript
const wasFullscreen = isFullscreen; // Track previous state
if (wasFullscreen && !isNowFullscreen) {
  // Now fires on EVERY exit
}
```

---

### Bug #2: No Debugging Information
**Problem**: Impossible to see what's happening in the code

**Fix Applied**: Added comprehensive console logging:
- ✅ Log fullscreen state changes
- ✅ Log flag submission attempts
- ✅ Log flag submission results
- ✅ Log toast/dialog display
- ✅ Log all conditions being checked

---

## Changes Made

### 1. Fixed Fullscreen Detection Logic
**File**: `frontend-nextjs/hooks/useQuizFlags.ts`
- **Lines 218-245**: Complete rewrite of fullscreen change handler
- **Logic**: Now checks "was fullscreen → now not fullscreen" instead of exit count

### 2. Enhanced Flag Submission Logging
**File**: `frontend-nextjs/hooks/useQuizFlags.ts`
- **Lines 111-147**: Added detailed logging to submitFlag function
- **Logs**: attemptId, flag type, metadata, success/failure

### 3. Added Quiz Page Logging
**File**: `frontend-nextjs/app/student/quiz/[id]/page.tsx`
- **Lines 197-229**: Added logging to fullscreen monitor effect
- **Logs**: All state variables, conditions, toast/dialog actions

---

## What Changed in Behavior

### Before (Broken):
```
1. Student presses ESC
2. Nothing happens (first exit ignored)
3. Student presses ESC again
4. Toast/dialog appear (but only on 2nd+ exit)
5. Flag logged (but only for 2nd+ exit)
```

### After (Fixed):
```
1. Student presses ESC
2. Fullscreen exit detected immediately ✅
3. Flag submitted to backend ✅
4. Toast appears (red, 6 seconds) ✅
5. Dialog appears (modal) ✅
6. Flag saved to database ✅
7. Console shows detailed logs ✅
```

---

## How to Test

### Step 1: Restart Frontend
```bash
cd frontend-nextjs
npm run dev
```

### Step 2: Set Quiz to Require Fullscreen
```sql
UPDATE quiz_settings
SET require_fullscreen = true
WHERE quiz_id = 'your-quiz-id';
```

### Step 3: Open Browser Console
- Press F12
- Go to Console tab

### Step 4: Start Quiz
1. Navigate to quiz page
2. Click "Start Quiz"
3. Browser should request fullscreen
4. Accept fullscreen

**Expected Console Output**:
```
[Quiz] Requesting fullscreen mode...
[Quiz] Fullscreen mode activated
[useQuizFlags] ✅ Fullscreen ENTERED
```

### Step 5: Press ESC
1. Press ESC key to exit fullscreen

**Expected Console Output**:
```
[useQuizFlags] Fullscreen change detected: { wasFullscreen: true, isNowFullscreen: false, ... }
[useQuizFlags] 🚨 Fullscreen EXIT detected - submitting flag
[useQuizFlags] Fullscreen exit count: 1
[useQuizFlags] ✅ Submitting flag: fullscreen_exit { attemptId: "...", metadata: {...} }
[useQuizFlags] ✅ Flag submitted successfully: fullscreen_exit
[Quiz] Fullscreen monitor effect: { requireFullscreen: true, isFullscreen: false, exitCount: 1 }
[Quiz] 🚨 Student exited fullscreen mode - showing warnings
[Quiz] Toast notification shown
[Quiz] Warning dialog opened
```

**Expected Visual Result**:
- ✅ Red toast appears in top-right corner
- ✅ Modal dialog appears in center
- ✅ Toast message: "⚠️ Fullscreen Exit Detected - You exited fullscreen mode. This has been logged. Exit count: 1"

### Step 6: Verify Database
```sql
SELECT * FROM quiz_flags
WHERE flag_type = 'fullscreen_exit'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected**:
- 1 row with flag_type = 'fullscreen_exit'
- severity = 'warning'
- metadata contains: `{"count": 1, "timestamp": "...", "userAgent": "..."}`

---

## If Still Not Working

### Check These First:

1. **Backend Running?**
```bash
curl http://localhost:3004/health
```

2. **Attempt ID Created?**
   - Look for console log: `[Quiz] Backend start successful!`
   - Check for `attemptId` in logs

3. **Fullscreen Detection Enabled?**
   - Look for: `detectFullscreenExit: true` in console
   - Check page.tsx line 59

4. **Quiz Has Setting?**
```sql
SELECT require_fullscreen FROM quiz_settings WHERE quiz_id = 'your-quiz-id';
```

### Share Debug Info:

If still broken, share:
1. **All console logs** from starting quiz to pressing ESC
2. **Network tab** filtered for "flag"
3. **Database query results** for quiz_flags table
4. **Backend logs** if any errors

---

## Files to Check After Update

1. ✅ `frontend-nextjs/hooks/useQuizFlags.ts` - Fixed detection logic
2. ✅ `frontend-nextjs/app/student/quiz/[id]/page.tsx` - Added logging
3. ✅ `FULLSCREEN_DEBUG_GUIDE.md` - Complete debugging instructions

---

## Summary

**What was broken**: First fullscreen exit was never detected or logged

**Why it was broken**: Condition checked `fullscreenExitCount > 0` which is false on first exit

**How it's fixed**: Now checks `wasFullscreen && !isNowFullscreen` instead

**Status**: ✅ Ready for testing with comprehensive logging

**Next**: Restart frontend, try pressing ESC, check console logs
