# Fullscreen Detection - Diagnostic Plan

**Issue**: `exitCount: 0` when pressing ESC - event handler not firing

---

## What I Added

I added **diagnostic logging** to help us find the exact problem. Now we'll see EXACTLY where it's failing.

### New Logs Added:

1. **Hook Initialization Log**:
```javascript
[useQuizFlags] 🔧 Fullscreen effect initializing: {
  detectFullscreenExit: true/false,
  attemptId: "..." or null,
  currentFullscreenElement: <element> or null,
  willAttachListeners: true/false
}
```

2. **Event Listener Attachment Log**:
```javascript
[useQuizFlags] ✅ Attaching fullscreen event listeners NOW
```

3. **Initial State Log**:
```javascript
[useQuizFlags] Initial fullscreen state: true/false
```

4. **Raw Browser Event Test**:
```javascript
[useQuizFlags] 🎯 RAW fullscreenchange event fired!
```

5. **Cleanup Log**:
```javascript
[useQuizFlags] 🧹 Cleaning up fullscreen event listeners
```

---

## Testing Steps

### Step 1: Restart Frontend
```bash
cd frontend-nextjs
npm run dev
```

### Step 2: Open Console (F12)

### Step 3: Start Quiz

Navigate to quiz and click "Start Quiz". **Look for these logs:**

#### ✅ Good Scenario:
```javascript
// When quiz page loads:
[useQuizFlags] 🔧 Fullscreen effect initializing: {
  detectFullscreenExit: true,
  attemptId: "abc-123-...",  // ← Should have ID
  currentFullscreenElement: null,
  willAttachListeners: true  // ← Should be true
}
[useQuizFlags] ✅ Attaching fullscreen event listeners NOW
[useQuizFlags] Initial fullscreen state: false

// When fullscreen is requested:
[Quiz] Requesting fullscreen mode...

// When you accept fullscreen:
[useQuizFlags] 🎯 RAW fullscreenchange event fired! { fullscreenElement: <div>, ... }
[useQuizFlags] Fullscreen change detected: { wasFullscreen: false, isNowFullscreen: true, ... }
[useQuizFlags] ✅ Fullscreen ENTERED
```

#### ❌ Bad Scenarios:

**Scenario A: No attemptId**
```javascript
[useQuizFlags] 🔧 Fullscreen effect initializing: {
  detectFullscreenExit: true,
  attemptId: null,  // ← PROBLEM!
  willAttachListeners: false
}
[useQuizFlags] ❌ No attemptId - fullscreen detection will not work
```
**Fix**: Backend not creating quiz attempt. Check `/quiz-attempts/start` endpoint.

**Scenario B: Detection disabled**
```javascript
[useQuizFlags] 🔧 Fullscreen effect initializing: {
  detectFullscreenExit: false,  // ← PROBLEM!
  attemptId: "abc-123",
  willAttachListeners: false
}
[useQuizFlags] ❌ Fullscreen detection is DISABLED
```
**Fix**: Check page.tsx line 59 - should be `detectFullscreenExit: true`

**Scenario C: Browser events not firing**
```javascript
// Event listeners attached:
[useQuizFlags] ✅ Attaching fullscreen event listeners NOW

// But when you press ESC... nothing happens!
// No "RAW fullscreenchange event fired!" log
```
**Fix**: Browser not supporting fullscreen API or security blocking it.

---

### Step 4: Press ESC to Exit Fullscreen

**What you should see:**

```javascript
// 1. Raw browser event fires
[useQuizFlags] 🎯 RAW fullscreenchange event fired! {
  fullscreenElement: null,  // ← null means exited
  timestamp: "2025-11-08T..."
}

// 2. Handler processes the event
[useQuizFlags] Fullscreen change detected: {
  wasFullscreen: true,   // ← WAS in fullscreen
  isNowFullscreen: false,  // ← NOW not in fullscreen
  attemptId: "abc-123",
  detectFullscreenExit: true
}

// 3. Exit detected
[useQuizFlags] 🚨 Fullscreen EXIT detected - submitting flag
[useQuizFlags] Fullscreen exit count: 1

// 4. Flag submitted
[useQuizFlags] ✅ Submitting flag: fullscreen_exit { attemptId: "...", metadata: {...} }
[useQuizFlags] ✅ Flag submitted successfully: fullscreen_exit

// 5. Quiz page reacts
[Quiz] Fullscreen monitor effect: {
  requireFullscreen: true,
  quizStarted: true,
  quizCompleted: false,
  isFullscreen: false,
  exitCount: 1  // ← Should be 1 now!
}
[Quiz] 🚨 Student exited fullscreen mode - showing warnings
[Quiz] Toast notification shown
[Quiz] Warning dialog opened
```

---

## Diagnostic Tree

Use this to identify the exact problem:

```
Start Quiz
  ↓
Do you see: "[useQuizFlags] 🔧 Fullscreen effect initializing"?
  ├─ NO → Hook not running at all
  │        Check: Is useQuizFlags imported and used in page.tsx?
  │
  └─ YES → What does it show?
           ↓
      Is "attemptId" null?
      ├─ YES → Backend not creating attempt
      │         Check: Network tab for /quiz-attempts/start
      │         Check: Backend logs for errors
      │
      └─ NO (has attemptId) → Continue
                ↓
           Is "detectFullscreenExit" false?
           ├─ YES → Detection disabled
           │         Fix: page.tsx line 59
           │
           └─ NO (true) → Continue
                    ↓
               Do you see: "✅ Attaching fullscreen event listeners NOW"?
               ├─ NO → Early return somewhere
               │        Check logs for error messages
               │
               └─ YES → Listeners attached!
                        ↓
                   Accept fullscreen and press ESC
                        ↓
                   Do you see: "🎯 RAW fullscreenchange event fired"?
                   ├─ NO → Browser not firing events
                   │        • Try different browser
                   │        • Check browser console for errors
                   │        • Browser might block fullscreen API
                   │
                   └─ YES → Event fires!
                            ↓
                       Do you see: "Fullscreen change detected"?
                       ├─ NO → handleFullscreenChange not called
                       │        • Event listener not attached properly
                       │        • Check for JavaScript errors
                       │
                       └─ YES → What's "wasFullscreen"?
                                ↓
                           Is "wasFullscreen" false?
                           ├─ YES → State not tracking fullscreen entry
                           │        • Check logs when accepting fullscreen
                           │        • Should see "✅ Fullscreen ENTERED"
                           │        • If missing, state not updating
                           │
                           └─ NO (true) → Should work!
                                          Check: "🚨 Fullscreen EXIT detected"
                                          If missing: Condition logic broken
```

---

## Most Likely Problems

Based on your log showing `exitCount: 0`:

### Problem 1: attemptId is null (80% likely)
**Your log shows**: `{requireFullscreen: true, ...}`
**But missing**: Any `[useQuizFlags]` logs

**Diagnosis**: Effect not running because `attemptId` is null

**Check**: Look for this log when page loads:
```javascript
[useQuizFlags] ❌ No attemptId - fullscreen detection will not work
```

**Fix**: Backend must create attempt successfully
- Check: `[Quiz] Backend start successful!` in console
- Check: Network tab for `/quiz-attempts/start/{quizId}` - should return 200 with `attempt_id`

### Problem 2: Effect dependencies causing re-runs (15% likely)
**Issue**: The effect might be cleaning up and re-running, removing listeners

**Check**: Count how many times you see:
```javascript
[useQuizFlags] 🔧 Fullscreen effect initializing
```

**Should see**: Once or twice (initial + after attemptId set)
**Problem if**: Seeing it loop infinitely

**Fix**: Dependency array issue - already fixed with `isFullscreen` in deps

### Problem 3: Browser not supporting fullscreen (5% likely)
**Check**: After accepting fullscreen, do you see:
```javascript
[useQuizFlags] 🎯 RAW fullscreenchange event fired!
```

**If NO**: Browser doesn't fire the event
**Try**: Different browser (Chrome, Edge, Firefox)

---

## What to Share

After testing, please share:

### 1. All console logs from page load to ESC press
Copy everything from:
- Opening the quiz page
- Starting the quiz
- Accepting fullscreen
- Pressing ESC

### 2. Specific Questions to Answer:

1. **Do you see**: `[useQuizFlags] 🔧 Fullscreen effect initializing`?
   - If YES: What's the `attemptId` value?
   - If NO: Hook not running at all

2. **Do you see**: `[useQuizFlags] ✅ Attaching fullscreen event listeners NOW`?
   - If YES: Listeners attached
   - If NO: Check why early return

3. **When you accept fullscreen, do you see**: `[useQuizFlags] 🎯 RAW fullscreenchange event fired!`?
   - If YES: Browser events work
   - If NO: Browser doesn't fire events

4. **When you press ESC, do you see**: `[useQuizFlags] 🎯 RAW fullscreenchange event fired!`?
   - If YES: Browser fires exit event
   - If NO: Browser issue

5. **What's the value of `wasFullscreen`** in the "Fullscreen change detected" log?
   - Should be `true` when exiting
   - If `false`: State not tracking entry

---

## Summary

**What I did**:
- ✅ Added initialization logs to track effect setup
- ✅ Added raw event listener to verify browser events fire
- ✅ Added state logging to see why condition fails
- ✅ Added cleanup logs to detect unexpected re-runs
- ✅ Fixed dependency array (added `isFullscreen`)

**What you need to do**:
1. Restart frontend
2. Open console (F12)
3. Start quiz
4. Copy ALL console logs
5. Share them with me

**This will tell us EXACTLY where it's failing!** 🎯
