# Question Bank Field Mapping Fix - Explanation → Description ✅

## The Problem

You pointed out a field naming inconsistency:

> "the question bank have this explanation and in the question builder its description"

### The Mismatch:

**Question Bank Table** uses:
- `explanation` field - "Optional explanation or rationale for the correct answer"

**Quiz Builder** uses:
- `description` field - Shown under the question text in the builder

**Result**: When importing questions from question bank, the `explanation` wasn't being mapped to `description`, so imported questions had no description/explanation text in the builder.

## The Root Cause

### Question Bank DTO (create-question-bank.dto.ts):

```typescript
@IsOptional()
@IsString()
@ApiProperty({
  description: 'Optional explanation or rationale for the correct answer',
  required: false,
  example: 'Because 2+2 equals 4 by basic arithmetic rules.',
})
explanation?: string;  // ← Question bank uses "explanation"
```

### Import Logic (quiz.service.ts - BEFORE):

```typescript
// ❌ WRONG - Looking for "description" field that doesn't exist
description: bankQuestion.description || null,
```

**Problem**: Question bank has `explanation`, but code was looking for `description`!

### Backend Logs (BEFORE):

```
[IMPORT] Importing question from bank abc-123:
  - Question: "What is 2+2?"
  - Type: multiple_choice
  - Points: 1
  - Time limit: 60s
  - Has description: false  ← Always false! (field doesn't exist)
```

## The Fix ✅

### 1. Updated Import Logic

**File**: `core-api-layer/.../quiz.service.ts` (Line 1794)

**AFTER (FIXED)**:
```typescript
const { data: quizQuestion, error: insertError } = await supabase
  .from('quiz_questions')
  .insert({
    quiz_id: quizId,
    question_text: bankQuestion.question_text,
    question_type: bankQuestion.question_type,
    description: bankQuestion.explanation || null, // ✅ Map explanation → description
    order_index: finalOrderIndex,
    points: bankQuestion.default_points,
    allow_partial_credit: bankQuestion.allow_partial_credit,
    time_limit_seconds: bankQuestion.time_limit_seconds,
    correct_answer: bankQuestion.correct_answer,
    source_question_bank_id: questionBankId,
  })
```

**Key Change**: `bankQuestion.explanation` → mapped to → `description` field in quiz_questions

### 2. Updated Diagnostic Logging

**File**: `core-api-layer/.../quiz.service.ts` (Line 1780)

**AFTER (FIXED)**:
```typescript
this.logger.log(`  - Has explanation: ${!!bankQuestion.explanation}`);
```

**Now logs the correct field** so you can verify if explanation exists in the question bank.

### 3. Updated QuestionBank Entity

**File**: `core-api-layer/.../entities/question-bank.entity.ts` (Lines 65-75)

**AFTER (FIXED)**:
```typescript
@ApiProperty({
  description: 'Explanation or rationale for the correct answer',
  required: false,
})
explanation?: string;

@ApiProperty({
  description: 'Make this question available publicly to other teachers',
  required: false,
})
is_public?: boolean;
```

**Added missing fields** to the entity definition for proper documentation.

## Field Mapping Flow

### Question Bank → Quiz Questions:

| Question Bank Field | Quiz Questions Field | Purpose |
|---------------------|---------------------|---------|
| `explanation` | `description` | Explanation/rationale shown under question |
| `question_text` | `question_text` | Main question text |
| `question_type` | `question_type` | Question type (multiple_choice, etc.) |
| `default_points` | `points` | Points awarded for correct answer |
| `time_limit_seconds` | `time_limit_seconds` | Time limit in seconds |
| `allow_partial_credit` | `allow_partial_credit` | Allow partial credit flag |
| `correct_answer` | `correct_answer` | Correct answer data |
| `choices` | → `quiz_choices` table | Choices with is_correct flags |

**Key Mapping**: `explanation` → `description`

## Why Different Names?

### Design Context:

1. **Question Bank** is a **template library**:
   - Teachers create reusable questions
   - `explanation` provides **rationale for the correct answer**
   - Used for educational purposes (why this answer is correct)

2. **Quiz Builder** is an **active quiz editor**:
   - Teachers build actual quizzes from templates
   - `description` provides **additional context for the question**
   - Can be edited/customized per quiz

3. **Same purpose, different contexts**:
   - Both fields show additional text under the question
   - `explanation` (source) → `description` (destination)
   - Mapping happens during import

## Testing the Fix

### Test 1: Create Question with Explanation

1. **Go to Question Bank**: `/teacher/question-bank` (or wherever question bank UI is)
2. **Create a new question**:
   - Question: "What is the capital of France?"
   - Type: Multiple-choice
   - Choices: "Paris" (✓), "London", "Berlin"
   - **Explanation**: "Paris has been the capital of France since 987 AD."
3. **Save to question bank**

### Test 2: Import to Quiz

1. **Open quiz builder**: `/teacher/quiz/builder?quizId=...`
2. **Click "Import from Question Bank"**
3. **Select the France question**
4. **Click "Import Questions"**

### Test 3: Verify Description Appears

1. ✅ **Question appears** in builder immediately (no refresh)
2. ✅ **Description shows**: "Paris has been the capital of France since 987 AD."
3. ✅ **Description is editable** in the question editor
4. ✅ **Save quiz** - description persists

### Test 4: Check Backend Logs

After importing, check backend terminal:

```
[IMPORT] Importing question from bank abc-123:
  - Question: "What is the capital of France?"
  - Type: multiple_choice
  - Points: 1
  - Time limit: 60s
  - Has explanation: true  ← Should be true now!
  - Correct answer: "Paris"
  - Has choices: true
  - Number of choices: 3
[IMPORT] Inserting 3 choices:
  - Choice 0: "Paris" is_correct=true
  - Choice 1: "London" is_correct=false
  - Choice 2: "Berlin" is_correct=false
[IMPORT] ✅ Successfully imported 3 choices
```

**Key**: `Has explanation: true` confirms the field is being read correctly!

## Example: Complete Question Flow

### Step 1: Question Bank Creation

**UI**: Question Bank Form

```typescript
{
  questionText: "What is the capital of France?",
  questionType: "multiple_choice",
  choices: [
    { text: "Paris", is_correct: true },
    { text: "London", is_correct: false },
    { text: "Berlin", is_correct: false }
  ],
  explanation: "Paris has been the capital of France since 987 AD.",  ← Written to question_bank.explanation
  defaultPoints: 1,
  difficulty: "easy"
}
```

### Step 2: Import to Quiz

**Backend Processing**:

```typescript
// Read from question bank
const bankQuestion = {
  question_text: "What is the capital of France?",
  question_type: "multiple_choice",
  explanation: "Paris has been the capital of France since 987 AD.",  ← Read from question_bank
  default_points: 1,
  choices: [ ... ]
}

// Map to quiz question
await supabase.from('quiz_questions').insert({
  quiz_id: quizId,
  question_text: bankQuestion.question_text,
  question_type: bankQuestion.question_type,
  description: bankQuestion.explanation,  ← Mapped to description!
  points: bankQuestion.default_points,
  // ...
})
```

### Step 3: Display in Builder

**UI**: Quiz Builder

```typescript
const question = {
  id: "question-uuid",
  title: "What is the capital of France?",
  type: "multiple-choice",
  description: "Paris has been the capital of France since 987 AD.",  ← Shows as description
  options: ["Paris", "London", "Berlin"],
  correctAnswer: 0,
  points: 1
}
```

**Rendered as**:
```
┌────────────────────────────────────────────────┐
│ Question 1                                     │
│ What is the capital of France?                 │
│                                                │
│ Paris has been the capital of France since     │ ← Description/Explanation
│ 987 AD.                                        │
│                                                │
│ ○ Paris                                        │
│ ○ London                                       │
│ ○ Berlin                                       │
└────────────────────────────────────────────────┘
```

## Summary

### Problem:
- ❌ Question bank has `explanation` field
- ❌ Quiz builder expects `description` field
- ❌ Import was looking for `bankQuestion.description` (doesn't exist)
- ❌ Explanations lost during import

### Fix:
- ✅ Changed line 1794: `bankQuestion.description` → `bankQuestion.explanation`
- ✅ Updated logging line 1780: Check for `explanation` instead of `description`
- ✅ Updated QuestionBank entity: Added `explanation` and `is_public` fields
- ✅ Explanations now mapped correctly: `explanation` → `description`

### Files Changed:
1. `core-api-layer/.../quiz.service.ts` (Lines 1780, 1794)
2. `core-api-layer/.../entities/question-bank.entity.ts` (Lines 65-75)

### Result:
- ✅ Question bank explanations import to quiz builder as descriptions
- ✅ Field mapping clearly documented in code
- ✅ Diagnostic logging shows correct field
- ✅ Teachers can see rationale/explanation in imported questions

### Testing:
Test at: `/teacher/quiz/builder?quizId=...`
1. Create question with explanation in question bank
2. Import to quiz
3. ✅ Explanation appears as description in builder
4. ✅ Backend logs show "Has explanation: true"
5. ✅ Can edit description in builder
6. ✅ Description saves with quiz

Your question bank explanations will now import correctly! 🎉

## Additional Notes

### Future Enhancement: Reverse Sync

If you want to add a feature where teachers can **save quiz questions back to question bank**, you'll need the reverse mapping:

```typescript
// Quiz question → Question bank
{
  question_text: quizQuestion.question_text,
  question_type: quizQuestion.question_type,
  explanation: quizQuestion.description,  // description → explanation
  default_points: quizQuestion.points,
  // ...
}
```

### Database Schema Note

If you need to verify the actual database schema, run this SQL in Supabase:

```sql
-- Check question_bank columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'question_bank'
ORDER BY ordinal_position;

-- Check quiz_questions columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_questions'
ORDER BY ordinal_position;
```

You should see:
- `question_bank.explanation` (text, nullable)
- `quiz_questions.description` (text, nullable)

Both serving the same purpose with different names! ✅
