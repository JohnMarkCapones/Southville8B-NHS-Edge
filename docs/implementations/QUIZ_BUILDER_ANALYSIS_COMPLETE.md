# Quiz Builder Field Mapping - Analysis Complete ✅

## Your Questions Answered

### 1. ✅ Drag & Drop → `order_index` in Database
**Question**: "First about the question being drag and drop and it should change the order_index of that question yes?"

**Answer**: ✅ **YES, IT WORKS CORRECTLY**

**How it works:**
- **UI**: Uses `@hello-pangea/dnd` (react-beautiful-dnd)
- **Handler**: `handleDragEnd()` reorders questions in state (lines 1079-1094)
- **Saving**: Loop index `i` is saved as `orderIndex: i` (lines 1206, 1383)
- **Backend**: Maps `orderIndex` → `quiz_questions.order_index` ✅

**Testing**:
1. Drag question from position 1 to position 3
2. Click "Save Quiz"
3. Reload page
4. ✅ Question stays in new position

---

### 2. ✅ Points UI Input → `points` in Database
**Question**: "Next is the there is point column there and there is Points: number in the UI you can see that confirm it?"

**Answer**: ✅ **YES, CONFIRMED - WORKS CORRECTLY**

**Field Location**: Line 2922-2929
```typescript
<Label className="text-sm">Points:</Label>
<Input
  type="number"
  value={question.points}
  onChange={(e) => onUpdate({ points: Number.parseInt(e.target.value) || 1 })}
/>
```

**Mapping**:
- **UI Field**: `question.points` ✅
- **Save Logic** (lines 1207, 1384): `points: question.points || 1` ✅
- **Backend DTO**: `points` (camelCase) ✅
- **Database Column**: `quiz_questions.points` (snake_case) ✅

**Testing**:
1. Change points from 1 to 5
2. Click "Save Quiz"
3. Reload page
4. ✅ Points shows 5

---

### 3. ❌→✅ Time UI Input → `time_limit_seconds` in Database
**Question**: "Next is the 'Time' inputs or number there is time_limit_question in the column database"

**Answer**: ❌ **WAS BROKEN** → ✅ **NOW FIXED**

**Database Column**: `time_limit_seconds` (integer, in SECONDS)

#### The Bug (BEFORE FIX):
```typescript
// UI was updating estimatedTime
value={question.estimatedTime}  // ❌ Wrong field
onChange={(e) => onUpdate({ estimatedTime: ... })}  // ❌ Wrong field

// But save was reading timeLimit
timeLimitSeconds: question.timeLimit * 60  // ❌ Always undefined!
```

**Result**: Time changes were NEVER saved ❌

#### The Fix (AFTER):
```typescript
// UI now updates BOTH timeLimit (for saving) and estimatedTime (for display)
value={question.timeLimit || question.estimatedTime || getDefaultEstimatedTime(question.type)}
onChange={(e) => {
  const timeValue = Number.parseFloat(e.target.value)
  onUpdate({
    timeLimit: timeValue,      // ✅ Saved to DB
    estimatedTime: timeValue   // ✅ Used for display
  })
}}
```

**Mapping Now**:
- **UI Field**: `question.timeLimit` ✅
- **Loading** (line 416): `timeLimit: q.time_limit_seconds / 60` ✅ (seconds → minutes)
- **Saving** (lines 1208, 1385): `timeLimitSeconds: question.timeLimit * 60` ✅ (minutes → seconds)
- **Backend DTO**: `timeLimitSeconds` (camelCase) ✅
- **Database Column**: `quiz_questions.time_limit_seconds` (snake_case) ✅

**Testing**:
1. Change time from 1 to 5 minutes
2. Click "Save Quiz"
3. Reload page
4. ✅ Time shows 5 minutes (this will NOW work!)

---

## Complete Field Mapping Table

| UI Label | UI State Field | Saved As (camelCase) | DB Column (snake_case) | Conversion | Status |
|----------|---------------|---------------------|----------------------|------------|--------|
| **Question Order** | Array index `i` | `orderIndex` | `order_index` | None | ✅ Working |
| **Points** | `question.points` | `points` | `points` | None | ✅ Working |
| **Time** | `question.timeLimit` | `timeLimitSeconds` | `time_limit_seconds` | × 60 (min→sec) | ✅ **FIXED** |

---

## What Changed

### File Modified:
`frontend-nextjs/app/teacher/quiz/builder/page.tsx` (line 2932-2950)

### Change:
- ✅ Time input now updates `timeLimit` instead of `estimatedTime`
- ✅ Also updates `estimatedTime` to keep displays in sync
- ✅ Reads from `timeLimit` first, falls back to `estimatedTime` for backwards compatibility

---

## Verification SQL

After saving a quiz, verify in Supabase:

```sql
SELECT
  question_text,
  order_index,           -- Should be 0, 1, 2, 3... (drag-drop order)
  points,                -- Should match Points input
  time_limit_seconds     -- Should be Time input × 60
FROM quiz_questions
WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
ORDER BY order_index;
```

**Expected**:
- `order_index`: Sequential (0, 1, 2...) matching visual order
- `points`: Matches UI value
- `time_limit_seconds`: UI minutes × 60 (e.g., 5 min = 300 seconds)

---

## Summary

✅ **Drag & Drop** → `order_index` - **Working**
✅ **Points Field** → `points` - **Working**
✅ **Time Field** → `time_limit_seconds` - **FIXED** (was broken, now working)

All three features are now properly mapped and functional! 🎉
