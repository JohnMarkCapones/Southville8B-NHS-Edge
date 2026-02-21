# Quiz Builder Field Mapping Analysis & Plan

## Database Schema (from quiz_schema_documentation.md)

### `quiz_questions` table columns:
- ✅ `order_index` (integer, NOT NULL) - Display order
- ✅ `points` (numeric, NOT NULL, default: 1) - Point value
- ✅ `time_limit_seconds` (integer, NULLABLE) - Per-question time limit **in SECONDS**

---

## Current Status Analysis

### ✅ Issue 1: Drag & Drop - Order Index
**Status**: WORKS CORRECTLY ✅

**How it works:**
1. **Drag & Drop**: `DragDropContext` with `handleDragEnd` (line 1079-1094)
   - Reorders questions in state when dragged
   - Shows toast notification

2. **Saving**: When `saveQuiz()` or `publishQuiz()` is called (lines 1206, 1383)
   ```typescript
   orderIndex: i  // Loop index = array position
   ```

3. **Backend**: Receives `orderIndex` and saves to `quiz_questions.order_index` ✅

**Conclusion**: ✅ WORKING - Drag-and-drop updates local order, saved as `orderIndex: i`

---

### ✅ Issue 2: Points Field
**Status**: WORKS CORRECTLY ✅

**UI Location**: Line 2922-2929
```typescript
<Label className="text-sm">Points:</Label>
<Input
  type="number"
  min="1"
  max="100"
  value={question.points}
  onChange={(e) => onUpdate({ points: Number.parseInt(e.target.value) || 1 })}
/>
```

**Flow:**
1. **UI Input**: Updates `question.points` ✅
2. **Loading from DB** (line 413): `points: q.points || 1` ✅
3. **Saving to DB** (lines 1207, 1384): `points: question.points || 1` ✅
4. **Backend**: Receives as `points` (camelCase), saves to `quiz_questions.points` ✅

**Conclusion**: ✅ WORKING - Direct mapping, no conversion needed

---

### ❌ Issue 3: Time Limit Field
**Status**: BROKEN ❌

**Problem Found:**

**UI Input** (line 2933-2944):
```typescript
<Label className="text-sm">Time:</Label>
<Input
  type="number"
  value={question.estimatedTime || getDefaultEstimatedTime(question.type)}  // ❌ WRONG FIELD
  onChange={(e) => onUpdate({
    estimatedTime: Number.parseFloat(e.target.value)  // ❌ Updates estimatedTime
  })}
/>
```

**Loading from DB** (line 416):
```typescript
timeLimit: q.time_limit_seconds ? q.time_limit_seconds / 60 : undefined  // ✅ Loads into timeLimit
```

**Saving to DB** (lines 1208, 1385):
```typescript
timeLimitSeconds: question.timeLimit ? question.timeLimit * 60 : undefined  // ❌ Reads from timeLimit
```

**The Bug:**
- UI updates `question.estimatedTime` (line 2942)
- Save reads `question.timeLimit` (lines 1208, 1385)
- **Result**: Time input changes are NOT saved! ❌

---

## Fix Required

### Change 1: Update Time Input to use `timeLimit` instead of `estimatedTime`

**File**: `frontend-nextjs/app/teacher/quiz/builder/page.tsx` (line 2933-2945)

**BEFORE (BROKEN):**
```typescript
<Label className="text-sm">Time:</Label>
<Input
  type="number"
  min="0.5"
  max="60"
  step="0.5"
  value={question.estimatedTime || getDefaultEstimatedTime(question.type)}  // ❌
  onChange={(e) => onUpdate({
    estimatedTime: Number.parseFloat(e.target.value)  // ❌
  })}
/>
```

**AFTER (FIXED):**
```typescript
<Label className="text-sm">Time:</Label>
<Input
  type="number"
  min="0.5"
  max="60"
  step="0.5"
  value={question.timeLimit || getDefaultEstimatedTime(question.type)}  // ✅ Use timeLimit
  onChange={(e) => onUpdate({
    timeLimit: Number.parseFloat(e.target.value)  // ✅ Update timeLimit
  })}
/>
```

### Change 2: Keep `estimatedTime` for display-only purposes

**Note**: `estimatedTime` is used for the sidebar preview (line 1705) and total time calculation (line 307). We should keep it but make it computed from `timeLimit`:

**Add a helper** (after line 2942):
```typescript
// Sync estimatedTime with timeLimit for display
onUpdate({
  timeLimit: Number.parseFloat(e.target.value),
  estimatedTime: Number.parseFloat(e.target.value)  // Keep in sync
})
```

**OR** Better approach - compute `estimatedTime` from `timeLimit`:
```typescript
// Use timeLimit as source of truth, display it as estimatedTime
const displayTime = question.timeLimit || getDefaultEstimatedTime(question.type)
```

---

## Summary Table

| Feature | UI Field | DB Column | Status | Fix Needed |
|---------|----------|-----------|--------|------------|
| **Drag & Drop Order** | Array index `i` | `order_index` | ✅ Works | None |
| **Points** | `question.points` | `points` | ✅ Works | None |
| **Time Limit** | `estimatedTime` ❌ | `time_limit_seconds` | ❌ Broken | Update to use `timeLimit` |

---

## Testing After Fix

1. **Order Index**:
   - Drag a question from position 1 to position 3
   - Click Save
   - Reload page
   - ✅ Verify question stays in position 3

2. **Points**:
   - Change a question's points from 1 to 5
   - Click Save
   - Reload page
   - ✅ Verify points shows 5

3. **Time Limit**:
   - Change a question's time from 1 to 5 minutes
   - Click Save
   - Reload page
   - ✅ Verify time shows 5 minutes (currently this fails ❌)

---

## Database Verification

After fixing and saving, check Supabase:

```sql
SELECT
  question_id,
  question_text,
  order_index,    -- Should match visual order (0, 1, 2...)
  points,         -- Should match Points input
  time_limit_seconds  -- Should be Time input × 60
FROM quiz_questions
WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
ORDER BY order_index;
```

Expected result:
- `order_index`: 0, 1, 2, 3... (matches drag-drop order)
- `points`: Matches UI input
- `time_limit_seconds`: UI time input × 60 (e.g., 5 min = 300 seconds)
