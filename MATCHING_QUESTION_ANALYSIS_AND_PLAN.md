# Matching Question Type - Analysis & Implementation Plan

## Current Status Analysis

### ✅ What's Already Working:

1. **Frontend Builder** (`frontend-nextjs/app/teacher/quiz/builder/page.tsx`)
   - Lines 3805-3920: Full matching question editor
   - Teachers can add/edit/delete pairs
   - Format: `{ "leftItem": "rightItem", ... }`
   - Example: `{ "Python": "Programming language", "HTML": "Markup language" }`

2. **Frontend Student View** (`frontend-nextjs/components/quiz/matching-pair-quiz.tsx`)
   - Two-column layout (left items vs right items)
   - Right column is shuffled randomly
   - Click-to-match interaction
   - Shows matched count
   - Clear all button

3. **Backend Auto-Grading** (`auto-grading.service.ts` lines 406-446)
   - Reads correct answer from `quiz_choices` metadata
   - Compares student answer object with correct answer
   - Partial credit: `(matchedPairs / totalPairs) * maxPoints`

---

## Current Data Flow

### 1. Teacher Creates Question (Frontend → Backend)

**Frontend** (`builder/page.tsx` line 1408-1412):
```typescript
if (question.type === "matching") {
  metadata = {
    matching_pairs: question.matchingPairs || {}
  }
}
```

**Data sent to backend:**
```json
{
  "questionText": "Match programming languages with their types",
  "questionType": "matching",
  "metadata": {
    "matching_pairs": {
      "Python": "High-level language",
      "C": "Low-level language",
      "HTML": "Markup language"
    }
  }
}
```

### 2. Backend Stores in Database

**Table**: `quiz_question_metadata`
```sql
INSERT INTO quiz_question_metadata (
  question_id,
  metadata_type,
  metadata
) VALUES (
  'question-uuid',
  'matching',
  '{
    "matching_pairs": {
      "Python": "High-level language",
      "C": "Low-level language",
      "HTML": "Markup language"
    }
  }'
);
```

**Table**: `quiz_choices` (ISSUE! ⚠️)
```sql
-- Backend currently tries to save to quiz_choices with is_correct=true
-- But metadata should contain the pairs, NOT quiz_choices
```

### 3. Student Answers (Frontend → Backend)

**Student View Component** (`matching-pair-quiz.tsx`):
```typescript
// Student's answer format:
const value = {
  "Python": "High-level language",  // Correct
  "C": "Markup language",            // Wrong
  "HTML": "Low-level language"       // Wrong
}
```

**Submission** (`useQuizAttempt.ts`):
```typescript
payload.answerJson = answer; // Send as JSON object
```

**Stored in database**:
```sql
INSERT INTO quiz_student_answers (
  attempt_id,
  question_id,
  answer_json  -- {"Python": "High-level language", ...}
) VALUES (...);
```

### 4. Auto-Grading (Backend)

**Current Implementation** (`auto-grading.service.ts` lines 406-446):

```typescript
// ⚠️ PROBLEM: Reads from quiz_choices metadata, but should read from quiz_question_metadata
const { data: choices } = await supabase
  .from('quiz_choices')
  .select('*')
  .eq('question_id', questionId)
  .eq('is_correct', true);

const correctAnswer = choices[0].metadata; // ⚠️ This is wrong!

// Grading logic (THIS IS CORRECT):
let matchedCount = 0;
let totalPairs = 0;

for (const [leftId, rightId] of Object.entries(correctAnswer)) {
  totalPairs++;
  if (studentAnswer[leftId] === rightId) {
    matchedCount++;
  }
}

const isCorrect = matchedCount === totalPairs;
const pointsAwarded = (matchedCount / totalPairs) * maxPoints;
```

---

## Problems Identified

### ✅ VERIFIED: Backend Saves Correctly
**Issue**: Backend tries to save matching pairs to `quiz_choices` but should save ONLY to `quiz_question_metadata`.

**Current behavior** (`quiz.service.ts`):
- Metadata is saved correctly to `quiz_question_metadata` ✅
- Backend does NOT create `quiz_choices` for matching questions ✅
- Frontend doesn't send `choices` for matching questions, only `metadata` ✅
- Backend only creates choices if `createQuestionDto.choices` is provided ✅

**Verification**: Lines 682-705 and 882-909 in `quiz.service.ts` show that choices are only created when `createQuestionDto.choices` is provided, which matching questions don't send.

### ✅ FIXED: Auto-Grading Now Reads from Correct Table
**Issue**: `gradeMatching()` was reading from `quiz_choices.metadata` instead of `quiz_question_metadata.metadata`.

**Fix applied** (Lines 406-462 in `auto-grading.service.ts`):
```typescript
// ✅ FIXED: Now reads from quiz_question_metadata
const { data: metadataRecord, error: metadataError } = await supabase
  .from('quiz_question_metadata')
  .select('metadata')
  .eq('question_id', questionId)
  .single();

const correctAnswer = metadataRecord.metadata.matching_pairs || {};
```

**Additional improvements**:
- Added validation for empty `matching_pairs`
- Added logging for debugging
- Added partial credit feedback message
- Improved error handling

### ✅ FIXED: Student View Component Now Handles Object Format
**Issue**: Component expected `pairs` array with `{ id, left, right }`, but backend sends object `{ "left": "right" }`.

**Fix applied** (Lines 17-43 in `matching-pair-quiz.tsx`):
```typescript
// ✅ FIX: Convert matchingPairs object to pairs array
const pairs = useMemo(() => {
  const matchingPairs = (question as any).matchingPairs || {};

  // If pairs already exist (array format), use them
  if (question.pairs && Array.isArray(question.pairs)) {
    return question.pairs;
  }

  // Convert object to array format
  return Object.entries(matchingPairs).map(([left, right], index) => ({
    id: left,  // Use left item as ID for matching
    left,
    right: right as string,
  }));
}, [question]);

// ✅ FIX: Shuffle right items after pairs are computed
const rightItems = useMemo(() => {
  const items = [...pairs];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}, [pairs]);
```

**Additional improvements**:
- Backward compatible with both formats (array and object)
- Uses `useMemo` instead of `useState` to prevent stale data
- All references to `question.pairs` updated to use local `pairs` variable

---

## Implementation Plan

### Phase 1: Fix Backend Auto-Grading ✅ (Priority: Critical)

**File**: `core-api-layer/.../src/quiz/services/auto-grading.service.ts`

**Change gradeMatching method** (lines 406-446):

```typescript
private async gradeMatching(
  questionId: string,
  studentAnswer: any,
  maxPoints: number = 1,
): Promise<GradingResult> {
  if (!studentAnswer || typeof studentAnswer !== 'object') {
    return { isCorrect: false, pointsAwarded: 0 };
  }

  const supabase = this.supabaseService.getServiceClient();

  // ✅ FIX: Read from quiz_question_metadata, not quiz_choices
  const { data: metadataRecord, error: metadataError } = await supabase
    .from('quiz_question_metadata')
    .select('metadata')
    .eq('question_id', questionId)
    .single();

  if (metadataError || !metadataRecord || !metadataRecord.metadata) {
    this.logger.error(`No metadata found for matching question ${questionId}`);
    return { isCorrect: false, pointsAwarded: 0 };
  }

  // ✅ FIX: Access matching_pairs from metadata
  const correctAnswer = metadataRecord.metadata.matching_pairs || {};

  if (Object.keys(correctAnswer).length === 0) {
    this.logger.error(`No matching pairs found in metadata for question ${questionId}`);
    return { isCorrect: false, pointsAwarded: 0 };
  }

  // Grade: Compare student answer with correct answer
  let matchedCount = 0;
  let totalPairs = Object.keys(correctAnswer).length;

  for (const [leftItem, correctRightItem] of Object.entries(correctAnswer)) {
    if (studentAnswer[leftItem] === correctRightItem) {
      matchedCount++;
    }
  }

  // Partial credit grading
  const isCorrect = matchedCount === totalPairs;
  const pointsAwarded = (matchedCount / totalPairs) * maxPoints;

  this.logger.log(
    `Matching grading: ${matchedCount}/${totalPairs} pairs correct, ` +
    `awarded ${Math.round(pointsAwarded * 100) / 100}/${maxPoints} points`
  );

  return {
    isCorrect,
    pointsAwarded: Math.round(pointsAwarded * 100) / 100,
    feedback: isCorrect
      ? undefined
      : `${matchedCount}/${totalPairs} pairs matched correctly`,
  };
}
```

---

### Phase 2: Fix Student View Component (Priority: High)

**File**: `frontend-nextjs/components/quiz/matching-pair-quiz.tsx`

**Problem**: Component expects `pairs` array but receives object.

**Solution**: Transform object to array in component or fix data from backend.

**Option A: Fix in Component** (Recommended - no backend change needed)

```typescript
export default function MatchingPairQuiz({ question, value = {}, onChange, disabled = false }: MatchingPairQuizProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)

  // ✅ FIX: Convert matchingPairs object to pairs array
  const pairs = useMemo(() => {
    const pairsObj = question.matchingPairs || {};
    return Object.entries(pairsObj).map(([left, right], index) => ({
      id: `pair-${index}`,
      left,
      right,
    }));
  }, [question.matchingPairs]);

  // Shuffle right items for display
  const [rightItems] = useState(() => {
    const items = [...pairs];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  });

  // Rest of the component stays the same...
  // Use pairs instead of question.pairs
}
```

**Option B: Fix in Backend** (More work, but cleaner)

Transform data in `quiz.service.ts` when loading:
```typescript
if (q.question_type === "matching") {
  const matchingPairs = metadata.matching_pairs || {};
  additionalFields = {
    pairs: Object.entries(matchingPairs).map(([left, right], idx) => ({
      id: `pair-${idx}`,
      left,
      right,
    }))
  }
}
```

---

### Phase 3: Verify Save Logic (Priority: Medium)

**Check**: Ensure backend doesn't try to create unnecessary `quiz_choices` for matching questions.

**File**: `quiz.service.ts` (addQuestion and updateQuestion methods)

**Current code** (line 1338-1365):
```typescript
} else if (question.options && question.options.length > 0 && question.type !== "fill-blank") {
  // Multiple choice, checkbox, etc. (but NOT fill-blank!)
  // ✅ SHOULD ALSO EXCLUDE MATCHING!
  choices = ...
}
```

**Fix**:
```typescript
} else if (
  question.options &&
  question.options.length > 0 &&
  question.type !== "fill-blank" &&
  question.type !== "matching"  // ✅ ADD THIS
) {
  // Create choices only for MCQ, checkbox, dropdown, etc.
  choices = ...
}
```

---

### Phase 4: Fix Data Loading (Priority: Medium)

**File**: `frontend-nextjs/app/teacher/quiz/builder/page.tsx`

**Location**: Line 475-478

**Current**:
```typescript
} else if (q.question_type === "matching") {
  additionalFields = {
    matchingPairs: metadata.matching_pairs || {}
  }
}
```

**Status**: ✅ Already correct! No change needed.

---

### Phase 5: Test End-to-End (Priority: High)

#### Test Scenario 1: Create & Save
1. Teacher creates matching question with 3 pairs
2. Save quiz
3. **Verify**: Check `quiz_question_metadata` table contains correct data
4. **Verify**: `quiz_choices` table should NOT have matching data

#### Test Scenario 2: Load & Edit
1. Load saved quiz
2. **Verify**: Matching pairs appear in editor
3. Edit pairs (add/remove/modify)
4. Save again
5. **Verify**: Changes reflected in database

#### Test Scenario 3: Student Takes Quiz
1. Student opens quiz
2. **Verify**: Left and right columns display correctly
3. **Verify**: Right column is shuffled
4. Student makes matches
5. Submit quiz
6. **Verify**: `quiz_student_answers.answer_json` contains answer object

#### Test Scenario 4: Auto-Grading
1. Backend grades matching question
2. **Verify**: Reads from `quiz_question_metadata` (not `quiz_choices`)
3. **Verify**: Partial credit calculated correctly
4. Example:
   - 3 pairs total
   - Student matches 2 correctly
   - Score: `(2/3) * maxPoints = 0.67 * maxPoints`

---

## Data Structure Reference

### Teacher Creates (Frontend):
```javascript
question.matchingPairs = {
  "Python": "High-level interpreted language",
  "C": "Low-level compiled language",
  "HTML": "Markup language for web pages"
}
```

### Stored in Database:
```json
// Table: quiz_question_metadata
{
  "question_id": "uuid",
  "metadata_type": "matching",
  "metadata": {
    "matching_pairs": {
      "Python": "High-level interpreted language",
      "C": "Low-level compiled language",
      "HTML": "Markup language for web pages"
    }
  }
}
```

### Student Answers:
```json
// Table: quiz_student_answers
{
  "answer_json": {
    "Python": "High-level interpreted language",  // Correct
    "C": "Markup language for web pages",         // Wrong
    "HTML": "Low-level compiled language"         // Wrong
  }
}
```

### Grading Result:
```
Total pairs: 3
Matched correctly: 1 (Python)
Is correct: false
Points awarded: (1/3) * 5 = 1.67 points (if maxPoints = 5)
```

---

## Summary Checklist

### Backend Fixes:
- [x] ✅ Fix `gradeMatching()` to read from `quiz_question_metadata` instead of `quiz_choices`
- [x] ✅ Ensure `addQuestion()` and `updateQuestion()` don't create unnecessary `quiz_choices` for matching
- [x] ✅ Verify metadata is saved correctly to `quiz_question_metadata`

### Frontend Fixes:
- [x] ✅ Fix `matching-pair-quiz.tsx` to handle object-to-array transformation
- [x] ✅ Verify builder save/load works correctly (verified in code review)
- [ ] 🧪 Test student view renders correctly (needs manual testing)

### Testing:
- [ ] 🧪 End-to-end test: Create → Save → Load → Edit → Save
- [ ] 🧪 End-to-end test: Student takes quiz → Submit → Auto-grade
- [ ] 🧪 Verify partial credit calculation
- [ ] 🧪 Verify shuffle works correctly

---

## ✅ IMPLEMENTATION COMPLETE

All code fixes have been applied. The matching question type should now work correctly end-to-end:

1. **Auto-grading**: Now reads from `quiz_question_metadata` ✅
2. **Student component**: Now converts object format to array format ✅
3. **Backend save logic**: Already correctly excludes matching from `quiz_choices` ✅

**Next step**: Manual end-to-end testing to verify all functionality works as expected.

---

## Files Modified

1. **Backend** ✅:
   - `src/quiz/services/auto-grading.service.ts` - Fixed `gradeMatching()` method (lines 406-462)
   - `src/quiz/services/quiz.service.ts` - Verified matching is excluded from choices creation (lines 682-705, 882-909)

2. **Frontend** ✅:
   - `components/quiz/matching-pair-quiz.tsx` - Added object-to-array transformation (lines 1-43, 99, 148)

3. **Documentation** ✅:
   - `MATCHING_QUESTION_ANALYSIS_AND_PLAN.md` - Updated with implementation results

4. **Testing** 🧪:
   - Awaiting manual end-to-end testing
