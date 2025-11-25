# Fill-in-Blank Case & Whitespace Sensitivity Implementation

## Overview
Added case-sensitive and whitespace-sensitive grading options for fill-in-blank questions. Each question can now have its own sensitivity settings stored in the `quiz_questions` table.

---

## Phase 1: Database Changes ✅

### SQL Migration to Run

```sql
-- Add case_sensitive and whitespace_sensitive columns to quiz_questions table
-- These settings apply to individual fill-in-blank questions

ALTER TABLE quiz_questions
ADD COLUMN case_sensitive BOOLEAN DEFAULT false,
ADD COLUMN whitespace_sensitive BOOLEAN DEFAULT false;

COMMENT ON COLUMN quiz_questions.case_sensitive IS 'For fill-in-blank: Whether answers must match exact capitalization';
COMMENT ON COLUMN quiz_questions.whitespace_sensitive IS 'For fill-in-blank: Whether spacing must match exactly';

-- These columns will be NULL for non-fill-in-blank questions, which is fine
-- Only fill-in-blank questions will use these fields
```

**File Location**: Save as `core-api-layer/southville-nhs-school-portal-api-layer/add_fill_blank_sensitivity_columns.sql`

---

## Phase 2: Backend Changes 🚧 PENDING

### 2.1 Update Quiz Question Entity

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/quiz/entities/quiz-question.entity.ts`

```typescript
export interface QuizQuestion {
  question_id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  order_index: number;
  points: number;
  allow_partial_credit: boolean;
  time_limit_seconds?: number;
  is_pool_question: boolean;
  source_question_bank_id?: string;
  created_at: string;
  updated_at: string;

  // ✅ NEW: Fill-in-blank sensitivity settings
  case_sensitive?: boolean;
  whitespace_sensitive?: boolean;
}
```

### 2.2 Update Create Question DTO

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/quiz/dto/create-quiz-question.dto.ts`

Add after line 170:

```typescript
@IsOptional()
@IsBoolean()
@ApiProperty({
  example: false,
  description: 'Case sensitive matching for fill-in-blank questions',
  default: false,
  required: false,
})
caseSensitive?: boolean;

@IsOptional()
@IsBoolean()
@ApiProperty({
  example: false,
  description: 'Whitespace sensitive matching for fill-in-blank questions',
  default: false,
  required: false,
})
whitespaceSensitive?: boolean;
```

### 2.3 Update Quiz Service - Create Question

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/quiz/services/quiz.service.ts`

**Location**: Line ~660 (inside `addQuestion` method)

Add to INSERT statement:

```typescript
const { data: question, error } = await supabase
  .from('quiz_questions')
  .insert({
    quiz_id: quizId,
    question_text: createQuestionDto.questionText,
    question_type: createQuestionDto.questionType,
    order_index: createQuestionDto.orderIndex,
    points: createQuestionDto.points || 1,
    allow_partial_credit: createQuestionDto.allowPartialCredit || false,
    time_limit_seconds: createQuestionDto.timeLimitSeconds,
    is_pool_question: createQuestionDto.isPoolQuestion || false,
    source_question_bank_id: createQuestionDto.sourceQuestionBankId,
    // ✅ NEW: Add sensitivity settings
    case_sensitive: createQuestionDto.caseSensitive ?? false,
    whitespace_sensitive: createQuestionDto.whitespaceSensitive ?? false,
  })
  .select()
  .single();
```

### 2.4 Update Quiz Service - Update Question

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/quiz/services/quiz.service.ts`

**Location**: Line ~780 (inside `updateQuestion` method)

Add to UPDATE statement:

```typescript
const { data: question, error } = await supabase
  .from('quiz_questions')
  .update({
    question_text: updateQuestionDto.questionText,
    question_type: updateQuestionDto.questionType,
    order_index: updateQuestionDto.orderIndex,
    points: updateQuestionDto.points || 1,
    allow_partial_credit: updateQuestionDto.allowPartialCredit || false,
    time_limit_seconds: updateQuestionDto.timeLimitSeconds,
    updated_at: new Date().toISOString(),
    // ✅ NEW: Add sensitivity settings
    case_sensitive: updateQuestionDto.caseSensitive ?? false,
    whitespace_sensitive: updateQuestionDto.whitespaceSensitive ?? false,
  })
  .eq('question_id', questionId)
  .select()
  .single();
```

### 2.5 Update Auto-Grading Service ✅ COMPLETED

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/quiz/services/auto-grading.service.ts`

**Changes Made**:
- Fetch `case_sensitive` and `whitespace_sensitive` from `quiz_questions` table
- Apply normalization based on settings before comparison
- Whitespace handling:
  - NOT sensitive: Trim + collapse multiple spaces to single space
  - SENSITIVE: Only trim leading/trailing
- Case handling:
  - NOT sensitive: Convert both to lowercase
  - SENSITIVE: Keep original case

---

## Phase 3: Frontend Changes ✅ COMPLETED

### 3.1 Update Question Interface

**File**: `frontend-nextjs/app/teacher/quiz/builder/page.tsx` (Lines 103-104)

```typescript
interface Question {
  // ... existing fields ...
  // ✅ NEW: Fill-in-blank sensitivity settings
  caseSensitive?: boolean
  whitespaceSensitive?: boolean
}
```

### 3.2 Add UI Controls in Fill-Blank Editor ✅ COMPLETED

**File**: `frontend-nextjs/app/teacher/quiz/builder/page.tsx` (Lines 3330-3424)

Added Card with:
- Case Sensitive toggle with examples
- Whitespace Sensitive toggle with examples
- Visual indicators (Aa badge, ␣ badge)
- Live examples showing what's accepted

### 3.3 Update Save Logic ✅ COMPLETED

**File**: `frontend-nextjs/app/teacher/quiz/builder/page.tsx` (Lines 1429-1430)

```typescript
const questionData = {
  // ... existing fields ...
  // ✅ NEW: Fill-in-blank sensitivity settings
  caseSensitive: question.type === "fill-blank" ? (question.caseSensitive ?? false) : undefined,
  whitespaceSensitive: question.type === "fill-blank" ? (question.whitespaceSensitive ?? false) : undefined,
}
```

### 3.4 Update Load Logic ✅ COMPLETED

**File**: `frontend-nextjs/app/teacher/quiz/builder/page.tsx` (Lines 449-453)

```typescript
if (q.question_type === "fill_in_blank") {
  // Load answers from metadata
  if (metadata.blank_positions) {
    options = metadata.blank_positions.map((bp: any) => bp.answer || "")
  }
  // ✅ NEW: Load sensitivity settings from quiz_questions table
  additionalFields = {
    caseSensitive: q.case_sensitive ?? false,
    whitespaceSensitive: q.whitespace_sensitive ?? false,
  }
}
```

### 3.5 Add Student View Hints ✅ COMPLETED

**File**: `frontend-nextjs/components/quiz/fill-in-blank-quiz.tsx` (Lines 28-60)

Added blue alert box showing:
- "Grading Notes:" header
- "Capitalization matters" if case-sensitive
- "Spacing must be exact" if whitespace-sensitive

---

## How It Works

### Teacher Creates Question:

1. Teacher selects "Fill in the Blank" question type
2. Creates blanks in the visual editor
3. Enters correct answers for each blank
4. **NEW**: Toggles "Case Sensitive" and/or "Strict Whitespace" switches
5. Saves quiz

### Backend Stores Settings:

```sql
INSERT INTO quiz_questions (
  question_text,
  question_type,
  case_sensitive,        -- NEW: true/false
  whitespace_sensitive,  -- NEW: true/false
  ...
) VALUES (
  'What is the capital of {{blank_0}}?',
  'fill_in_blank',
  true,   -- Case matters!
  false,  -- Whitespace doesn't matter
  ...
);
```

### Student Sees Hints:

If sensitivity settings are enabled, students see:
```
ℹ️ Grading Notes:
  • Capitalization matters (e.g., "Paris" not "paris")
  • Spacing must be exact (no extra spaces)
```

### Auto-Grading Applies Settings:

```typescript
// Example: Case-sensitive ON, Whitespace-sensitive OFF

Student Answer: "  paris  "
Correct Answer: "Paris"

// Process whitespace (OFF = normalize)
Student: "paris" (trimmed & collapsed)
Correct: "Paris" (trimmed & collapsed)

// Process case (ON = keep original)
Student: "paris"
Correct: "Paris"

// Compare
"paris" === "Paris" → FALSE ❌

Result: Incorrect
```

---

## Testing Scenarios

### Scenario 1: Both OFF (Default)
- Question: "What is the capital of France?"
- Correct: "Paris"
- Student enters: "  paris  " → ✅ PASS
- Student enters: "PARIS" → ✅ PASS
- Reason: Trimmed, normalized, lowercased

### Scenario 2: Case ON, Whitespace OFF
- Correct: "Paris"
- Student enters: "  Paris  " → ✅ PASS (spaces ignored)
- Student enters: "paris" → ❌ FAIL (wrong case)
- Student enters: "PARIS" → ❌ FAIL (wrong case)

### Scenario 3: Case OFF, Whitespace ON
- Correct: "New York"
- Student enters: "new york" → ✅ PASS (case ignored)
- Student enters: "New  York" → ❌ FAIL (extra space)
- Student enters: " New York " → ✅ PASS (leading/trailing trimmed)

### Scenario 4: Both ON (Strict)
- Correct: "San Fernando"
- Student enters: "san fernando" → ❌ FAIL (wrong case)
- Student enters: "San  Fernando" → ❌ FAIL (extra space)
- Student enters: "San Fernando" → ✅ PASS (exact match)

---

## Deployment Checklist

- [ ] Run SQL migration (add columns to quiz_questions)
- [ ] Update backend DTO (add caseSensitive, whitespaceSensitive fields)
- [ ] Update backend quiz.service.ts (addQuestion and updateQuestion methods)
- [ ] Update backend auto-grading.service.ts (fetch settings from quiz_questions)
- [ ] Test backend API endpoints
- [x] Update frontend Question interface
- [x] Add UI controls in quiz builder
- [x] Update save logic (send to backend)
- [x] Update load logic (restore from backend)
- [x] Add student view hints
- [ ] End-to-end testing with all combinations
- [ ] Update API documentation

---

## Files Modified

### Frontend (✅ COMPLETED):
1. `frontend-nextjs/app/teacher/quiz/builder/page.tsx`
   - Added caseSensitive and whitespaceSensitive fields to Question interface
   - Added UI controls in fill-blank editor (Card with toggles)
   - Updated save logic to send settings to backend
   - Updated load logic to restore settings from backend

2. `frontend-nextjs/components/quiz/fill-in-blank-quiz.tsx`
   - Added hint alert for students showing sensitivity requirements

### Backend (🚧 PENDING):
1. `core-api-layer/.../src/quiz/entities/quiz-question.entity.ts`
   - Add case_sensitive and whitespace_sensitive fields

2. `core-api-layer/.../src/quiz/dto/create-quiz-question.dto.ts`
   - Add validation for caseSensitive and whitespaceSensitive

3. `core-api-layer/.../src/quiz/services/quiz.service.ts`
   - Update addQuestion method INSERT
   - Update updateQuestion method UPDATE

4. `core-api-layer/.../src/quiz/services/auto-grading.service.ts`
   - ✅ COMPLETED: Updated gradeFillInBlank to fetch and apply settings

### Database (🚧 PENDING):
1. SQL Migration file to create
   - Add case_sensitive column
   - Add whitespace_sensitive column

---

## Summary

This implementation allows teachers to control grading strictness per question:
- **Case Sensitive**: Require exact capitalization matching
- **Strict Whitespace**: Require exact spacing (no extra/missing spaces)

Settings are stored in `quiz_questions` table (not metadata) for:
- Easy querying
- Direct access during grading
- Better performance (no JSONB parsing)

Default: Both OFF (lenient grading, student-friendly)
