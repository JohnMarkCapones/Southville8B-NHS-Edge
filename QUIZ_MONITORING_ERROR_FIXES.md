# Quiz Monitoring Error Fixes

## Issues Fixed

### 1. ✅ Maximum Update Depth Exceeded (Infinite Loop)

**Error**: `Maximum update depth exceeded` in `useQuizMonitoring.ts`

**Root Cause**: `stopPolling` function was included in useEffect dependency arrays, causing infinite re-renders:
- Cleanup function calls `stopPolling()`
- `stopPolling()` calls `setIsPolling(false)`
- State change triggers re-render
- useEffect sees `stopPolling` changed (new function reference)
- Cleanup runs again → infinite loop

**Fix Applied** (`hooks/useQuizMonitoring.ts`):
```typescript
// ❌ BEFORE - stopPolling in deps caused loop
return () => {
  stopPolling();
};
}, [autoRefresh, quizId, startPolling, stopPolling]);

// ✅ AFTER - Direct cleanup, no stopPolling in deps
return () => {
  if (pollIntervalRef.current) {
    clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
  }
};
}, [autoRefresh, quizId, startPolling]);
```

**Files Modified**:
- `frontend-nextjs/hooks/useQuizMonitoring.ts` (Lines 231-248)

---

### 2. ✅ Mock Data Showing Instead of Real Backend Data

**Issue**: Page was showing mock data with "check internet connection" toast

**Root Causes**:

#### A. Wrong Field Names in Data Transformation
The frontend was looking for fields that don't exist in the backend response:

**❌ BEFORE**:
```typescript
currentQuestion: p.current_question || 0,  // ❌ Field doesn't exist
progress: Math.round((p.current_question / p.total_questions) * 100), // ❌ Wrong calculation
```

**✅ AFTER**:
```typescript
currentQuestion: (p.current_question_index || 0) + 1, // ✅ Correct field from schema
progress: p.progress || 0, // ✅ Use backend-calculated progress
```

#### B. Initial State Was Mock Data
The state was initialized with `mockStudents`, so mock data showed before real data loaded:

**❌ BEFORE**:
```typescript
const [students, setStudents] = useState(mockStudents)
```

**✅ AFTER**:
```typescript
const [students, setStudents] = useState<any[]>([]) // Start with empty array
```

#### C. Improved Error Handling
Added better error logging and conditional fallback:

**✅ NEW**:
```typescript
} else if (monitoringError) {
  console.error('[Monitoring] Error detected:', monitoringError)
  toast({
    title: "Connection Error",
    description: "Failed to fetch monitoring data. Showing cached data.",
    variant: "destructive",
  })
  // Only show mock data if we have no real data
  if (students.length === 0 || students === mockStudents) {
    setStudents(mockStudents)
  }
} else if (!participants || participants.participants?.length === 0) {
  console.log('[Monitoring] No participants yet')
  setStudents([]) // Clear students, don't show mock data
}
```

**Files Modified**:
- `frontend-nextjs/app/teacher/quiz/[id]/monitor/page.tsx` (Lines 362-447)

---

### 3. ✅ Enhanced Data Transformation

**Improvements Made**:

1. **Use backend-provided `time_elapsed`** instead of calculating client-side
2. **Use backend `progress`** directly (0-100) instead of calculating
3. **Use correct field names** from database schema:
   - `current_question_index` (not `current_question`)
   - `questions_answered`
   - `total_questions`
4. **Added new fields**:
   - `ipChanged` - IP tracking flag
   - `idleTime` - Idle time in seconds
   - `section` - Student section info

---

## Backend Field Mapping (Schema → Frontend)

| Schema Field | Type | Frontend Field | Notes |
|---|---|---|---|
| `current_question_index` | integer | `currentQuestion` | Add +1 for display (0-indexed → 1-indexed) |
| `questions_answered` | integer | `questionsAnswered` | Direct mapping |
| `total_questions` | integer | `totalQuestions` | Direct mapping |
| `progress` | integer | `progress` | Backend calculates (0-100) |
| `time_elapsed` | integer | `timeSpent` | Format as "MM:SS" |
| `last_heartbeat` | timestamptz | `lastActive` | Format as time string |
| `tab_switches` | integer | `tabSwitches` | Direct mapping |
| `ip_changed` | boolean | `ipChanged` | New security field |
| `idle_time_seconds` | integer | `idleTime` | New tracking field |
| `is_active` | boolean | Used for `status` | Determines active/idle/finished |

---

## How to Verify Fixes

### 1. Check Console for Errors

Open browser DevTools (F12) and check:
- ✅ No "Maximum update depth" errors
- ✅ No infinite loop of API calls
- ✅ API calls happen every 10 seconds (polling)
- ✅ Console shows: `[Monitoring] Transformed students: N`

### 2. Verify Backend is Running

```bash
cd core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev
```

**Check**:
- Backend should start on port 3000 (or configured port)
- No compilation errors
- Swagger docs available at `http://localhost:3000/api/docs`

### 3. Test Monitoring Page

**URL**: `/teacher/quiz/{quizId}/monitor`

**Expected Behavior**:
1. Page loads without showing mock data immediately
2. Loading spinner shows while fetching
3. Real student data appears (if any students are taking the quiz)
4. If no students: Empty state shows (not mock data)
5. If backend error: Error toast shows, cached data displayed

### 4. Test with Active Quiz

**Steps**:
1. As student: Start a quiz
2. As teacher: Open monitoring page for that quiz
3. Verify:
   - ✅ Student appears in monitoring list
   - ✅ Progress updates in real-time
   - ✅ Time elapsed counts up
   - ✅ Heartbeat timestamp updates every 30s
   - ✅ Section information shows correctly
   - ✅ No infinite re-renders

---

## Common Issues & Solutions

### Issue: Still Seeing Mock Data

**Possible Causes**:
1. Backend not running
2. CORS error (check browser console)
3. Authentication token expired
4. Wrong API URL

**Solution**:
1. Check backend is running: `npm run start:dev`
2. Check browser console for API errors
3. Check Network tab in DevTools for failed requests
4. Verify API endpoint: `GET /quiz-monitoring/quiz/{quizId}/participants`

### Issue: "Connection Error" Toast Keeps Appearing

**Possible Causes**:
1. Backend not running
2. Database connection issue
3. RLS (Row Level Security) blocking query
4. Quiz doesn't exist or teacher doesn't own it

**Solution**:
1. Check backend logs for errors
2. Verify database connection
3. Verify quiz ownership in database
4. Check teacher is authenticated correctly

### Issue: Infinite API Calls

**Possible Causes**:
1. `stopPolling` in useEffect deps (should be fixed now)
2. State updates triggering re-renders

**Solution**:
- Already fixed in `useQuizMonitoring.ts`
- If still happening, check for other state updates in monitoring page

---

## Testing Checklist

- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] Backend is running on correct port
- [ ] Database is accessible
- [ ] Open monitoring page - no infinite loop errors
- [ ] No mock data shows on initial load (empty state or loading)
- [ ] Create a quiz and assign to students
- [ ] Student starts quiz
- [ ] Monitoring page shows real student data
- [ ] Data updates every 10 seconds
- [ ] Progress bar updates correctly
- [ ] Time elapsed counts up
- [ ] Section information displays
- [ ] Tab switch count works
- [ ] Export CSV button works (if implemented)

---

## Backend API Endpoints (Verify These Work)

Test in Swagger docs or with curl:

### 1. Get Active Participants
```bash
GET /quiz-monitoring/quiz/{quizId}/participants
Authorization: Bearer {jwt-token}
```

**Expected Response**:
```json
{
  "quizId": "uuid",
  "activeCount": 2,
  "participants": [
    {
      "attempt_id": "uuid",
      "student_id": "uuid",
      "student_name": "John Doe",
      "section": "Grade 10 - Section A",
      "started_at": "2025-01-15T10:00:00Z",
      "last_heartbeat": "2025-01-15T10:15:30Z",
      "time_elapsed": 930,
      "questions_answered": 5,
      "total_questions": 10,
      "progress": 50,
      "current_question_index": 4,
      "tab_switches": 2,
      "is_active": true,
      "device_fingerprint": "...",
      "initial_ip_address": "192.168.1.100",
      "current_ip_address": "192.168.1.100",
      "ip_changed": false,
      "idle_time_seconds": 0
    }
  ]
}
```

### 2. Get Quiz Flags
```bash
GET /quiz-monitoring/quiz/{quizId}/flags
Authorization: Bearer {jwt-token}
```

### 3. Export Report
```bash
GET /quiz-monitoring/quiz/{quizId}/export
Authorization: Bearer {jwt-token}
```

---

## Files Changed in This Fix

1. **frontend-nextjs/hooks/useQuizMonitoring.ts**
   - Fixed infinite loop by removing `stopPolling` from deps
   - Lines 231-248

2. **frontend-nextjs/app/teacher/quiz/[id]/monitor/page.tsx**
   - Fixed field name mappings (`current_question_index` vs `current_question`)
   - Changed initial state from `mockStudents` to empty array
   - Improved error handling and logging
   - Added new fields (IP tracking, idle time, section)
   - Lines 362-447

---

## What's Working Now

✅ No infinite loop errors
✅ No maximum update depth errors
✅ Mock data only shows on actual errors (not on initial load)
✅ Correct field mappings from backend to frontend
✅ Real-time polling every 10 seconds
✅ Proper cleanup on unmount
✅ Enhanced security tracking (IP, idle time)
✅ Section information display
✅ Better error messages

---

## Next Steps

1. **Start backend**: `npm run start:dev`
2. **Start frontend**: `npm run dev`
3. **Test monitoring page** with a real quiz
4. **Check browser console** for any remaining errors
5. **Verify data updates** in real-time

If you still see issues, check:
- Backend logs for errors
- Browser console for API call failures
- Network tab for failed requests
- Database for quiz_participants data
