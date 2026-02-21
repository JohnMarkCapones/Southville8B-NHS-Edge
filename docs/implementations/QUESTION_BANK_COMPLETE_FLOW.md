# Question Bank Complete Flow - Explained 📚

## Overview

The Question Bank is a **reusable template library** where you create questions ONCE and use them in MULTIPLE quizzes. This saves you from re-creating the same questions over and over.

---

## 🎯 The Complete Flow

### PHASE 1: Creating Questions in Question Bank

#### Step 1: Navigate to Question Bank
**URL**: `/teacher/question-bank`

**What You See**:
- List of all your saved questions
- Search bar to find questions
- Filters (type, difficulty, subject)
- "Create Question" button

#### Step 2: Click "Create Question"

**Dialog Opens With Form**:
```
┌─────────────────────────────────────────┐
│  Create Question                        │
├─────────────────────────────────────────┤
│  Question Text: [What is 2 + 2?]       │
│  Type: [Multiple Choice ▼]              │
│  Difficulty: [Medium ▼]                 │
│  Points: [1]                             │
│  Tags: [math, basic]                     │
│                                          │
│  ──── Choices ────                       │
│  ☐ [2]       [✓] [×]                    │
│  ☐ [3]       [✓] [×]                    │
│  ☑ [4]       [✓] [×]  ← Marked correct  │
│  ☐ [5]       [✓] [×]                    │
│  [+ Add Choice]                          │
│                                          │
│  [Cancel]  [Create]                      │
└─────────────────────────────────────────┘
```

#### Step 3: Fill Out the Form

**You Enter**:
- **Question Text**: "What is 2 + 2?"
- **Type**: Multiple Choice
- **Difficulty**: Easy
- **Points**: 1
- **Tags**: ["math", "basic"]
- **Choices**:
  ```javascript
  [
    { text: "2", is_correct: false },
    { text: "3", is_correct: false },
    { text: "4", is_correct: true },   // ← You click the ✓ button
    { text: "5", is_correct: false }
  ]
  ```

**How You Mark Correct Answer**:
- Click the **green checkmark (✓) button** next to the correct choice
- The choice gets highlighted/selected
- **That choice's `is_correct` flag becomes `true`**

#### Step 4: Click "Create"

**Frontend** (`question-bank/page.tsx` line 111):
```typescript
await questionBankApi.createQuestion({
  questionText: "What is 2 + 2?",
  questionType: "multiple_choice",
  difficulty: "easy",
  defaultPoints: 1,
  tags: ["math", "basic"],
  choices: [
    { text: "2", is_correct: false },
    { text: "3", is_correct: false },
    { text: "4", is_correct: true },   // ✅ Correct answer!
    { text: "5", is_correct: false }
  ],
  correctAnswer: "4"  // Also stores as text
})
```

**Backend** (`question-bank.service.ts` line 29-48):
```typescript
await supabase
  .from('question_bank')
  .insert({
    teacher_id: "your-teacher-id",
    question_text: "What is 2 + 2?",
    question_type: "multiple_choice",
    difficulty: "easy",
    default_points: 1,
    tags: ["math", "basic"],
    choices: [
      { text: "2", is_correct: false },
      { text: "3", is_correct: false },
      { text: "4", is_correct: true },   // ✅ Stored as JSONB!
      { text: "5", is_correct: false }
    ],
    correct_answer: "4"  // Also stored separately
  })
```

**Database Table**: `question_bank`
```
┌──────────────────────────────────────────────────────────────┐
│ question_bank                                                 │
├──────────────────────────────────────────────────────────────┤
│ id                  : uuid (auto-generated)                   │
│ teacher_id          : uuid (your ID)                          │
│ question_text       : text = "What is 2 + 2?"                │
│ question_type       : text = "multiple_choice"                │
│ difficulty          : text = "easy"                           │
│ default_points      : numeric = 1                             │
│ tags                : text[] = ["math", "basic"]              │
│ choices             : jsonb = [                               │
│                         { text: "2", is_correct: false },     │
│                         { text: "3", is_correct: false },     │
│                         { text: "4", is_correct: true },  ✅  │
│                         { text: "5", is_correct: false }      │
│                       ]                                        │
│ correct_answer      : jsonb = "4"                             │
│ allow_partial_credit: boolean = false                         │
│ time_limit_seconds  : integer = null                          │
│ explanation         : text = null                             │
│ description         : text = null                             │
│ is_public           : boolean = false                         │
│ created_at          : timestamp                               │
│ updated_at          : timestamp                               │
└──────────────────────────────────────────────────────────────┘
```

**✅ Question is now saved in your Question Bank!**

---

### PHASE 2: Importing from Question Bank to Quiz

#### Step 1: Open Quiz Builder
**URL**: `/teacher/quiz/builder?quizId=1f3b8bf5-b165-473c-9740-aaa4912516f8`

**What You See**:
- Your quiz questions (if any)
- Sidebar with "Import from Question Bank" button

#### Step 2: Click "Import from Question Bank"

**Dialog Opens**:
```
┌──────────────────────────────────────────────────────┐
│  Import from Question Bank                           │
├──────────────────────────────────────────────────────┤
│  Search: [_____________]  🔍                         │
│  Type: [All ▼]  Difficulty: [All ▼]                 │
│                                                       │
│  ──── Available Questions ────                       │
│  ☑ What is 2 + 2?                                    │
│      Multiple Choice · Easy · 1 pt                   │
│                                                       │
│  ☐ What is the capital of France?                   │
│      Multiple Choice · Medium · 1 pt                 │
│                                                       │
│  ☐ True or False: The Earth is flat                 │
│      True/False · Easy · 1 pt                        │
│                                                       │
│  [Cancel]  [Import Questions (1 selected)]           │
└──────────────────────────────────────────────────────┘
```

**The List Shows**:
- All questions from **YOUR** question bank
- Loaded by calling `questionBankApi.getQuestions()` (builder/page.tsx line 676)
- Filtered by:
  - `teacher_id` = your ID (backend automatically filters this)
  - Search query (optional)
  - Question type filter (optional)
  - Difficulty filter (optional)

#### Step 3: Select Questions

**You Can**:
- ✅ Check multiple questions
- ✅ Search for specific questions
- ✅ Filter by type/difficulty
- ✅ Preview question details

**Selected Questions Stored**:
```typescript
const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())

// When you check a question:
setSelectedQuestionIds(new Set([...selectedQuestionIds, questionId]))
```

#### Step 4: Click "Import Questions"

**Frontend** (`builder/page.tsx` line 1841-1848):
```typescript
const importPromises = questionsToImport.map((qbQuestion, index) =>
  quizApi.teacher.importQuestionFromBank(quizId, {
    questionBankId: qbQuestion.id,        // The question bank item ID
    orderIndex: questions.length + index  // Add to end of quiz
  })
)

await Promise.all(importPromises)
```

**Backend** (`quiz.service.ts` line 1731-1824):

**Step 1**: Verify Ownership
```typescript
// Make sure you own the quiz
const quiz = await this.findQuizById(quizId)
if (quiz.teacher_id !== teacherId) {
  throw new ForbiddenException('You can only import to your own quizzes')
}
```

**Step 2**: Fetch Question from Bank
```typescript
const { data: bankQuestion, error } = await supabase
  .from('question_bank')
  .select('*')
  .eq('id', questionBankId)
  .single()

// bankQuestion now contains:
// {
//   id: "abc-123",
//   question_text: "What is 2 + 2?",
//   question_type: "multiple_choice",
//   choices: [
//     { text: "2", is_correct: false },
//     { text: "3", is_correct: false },
//     { text: "4", is_correct: true },  ✅
//     { text: "5", is_correct: false }
//   ],
//   correct_answer: "4",
//   default_points: 1,
//   description: null,
//   // ... other fields
// }
```

**Step 3**: Create Quiz Question (Copy from Bank)
```typescript
const { data: quizQuestion } = await supabase
  .from('quiz_questions')
  .insert({
    quiz_id: quizId,
    question_text: bankQuestion.question_text,      // ← Copy
    question_type: bankQuestion.question_type,      // ← Copy
    description: bankQuestion.description,          // ← Copy
    order_index: finalOrderIndex,                   // ← New position
    points: bankQuestion.default_points,            // ← Copy
    allow_partial_credit: bankQuestion.allow_partial_credit, // ← Copy
    time_limit_seconds: bankQuestion.time_limit_seconds,     // ← Copy
    correct_answer: bankQuestion.correct_answer,    // ← Copy ✅
    source_question_bank_id: questionBankId,        // ← Track source
  })
  .select()
  .single()

// quizQuestion now has a NEW UUID in quiz_questions table
```

**Step 4**: Copy Choices to `quiz_choices` Table
```typescript
if (bankQuestion.choices && Array.isArray(bankQuestion.choices)) {
  const choicesToInsert = bankQuestion.choices.map((choice, index) => ({
    question_id: quizQuestion.question_id,  // NEW quiz question ID
    choice_text: choice.text || choice.choice_text,
    is_correct: choice.is_correct || false,  // ✅ Copied!
    order_index: index,
    metadata: choice.metadata || null,
  }))

  await supabase
    .from('quiz_choices')
    .insert(choicesToInsert)
}
```

**Database After Import**:

**Table**: `quiz_questions`
```
┌──────────────────────────────────────────────────────────────┐
│ quiz_questions                                                │
├──────────────────────────────────────────────────────────────┤
│ question_id         : uuid (NEW, auto-generated)              │
│ quiz_id             : uuid (your quiz ID)                     │
│ question_text       : text = "What is 2 + 2?"  ✅ COPIED     │
│ question_type       : text = "multiple_choice"  ✅ COPIED     │
│ description         : text = null               ✅ COPIED     │
│ order_index         : integer = 0                             │
│ points              : numeric = 1               ✅ COPIED     │
│ correct_answer      : jsonb = "4"               ✅ COPIED     │
│ source_question_bank_id: uuid (original QB ID)  ✅ TRACKED    │
│ created_at          : timestamp                               │
└──────────────────────────────────────────────────────────────┘
```

**Table**: `quiz_choices`
```
┌──────────────────────────────────────────────────────────────┐
│ quiz_choices                                                  │
├──────────────────────────────────────────────────────────────┤
│ choice_id    : uuid (auto-generated)                          │
│ question_id  : uuid (NEW quiz question ID)                    │
│ choice_text  : text = "2"                                     │
│ is_correct   : boolean = false              ✅ COPIED         │
│ order_index  : integer = 0                                    │
├──────────────────────────────────────────────────────────────┤
│ choice_id    : uuid (auto-generated)                          │
│ question_id  : uuid (NEW quiz question ID)                    │
│ choice_text  : text = "3"                                     │
│ is_correct   : boolean = false              ✅ COPIED         │
│ order_index  : integer = 1                                    │
├──────────────────────────────────────────────────────────────┤
│ choice_id    : uuid (auto-generated)                          │
│ question_id  : uuid (NEW quiz question ID)                    │
│ choice_text  : text = "4"                                     │
│ is_correct   : boolean = true               ✅ COPIED ✅✅     │
│ order_index  : integer = 2                                    │
├──────────────────────────────────────────────────────────────┤
│ choice_id    : uuid (auto-generated)                          │
│ question_id  : uuid (NEW quiz question ID)                    │
│ choice_text  : text = "5"                                     │
│ is_correct   : boolean = false              ✅ COPIED         │
│ order_index  : integer = 3                                    │
└──────────────────────────────────────────────────────────────┘
```

**Step 5**: Update Quiz Builder UI
```typescript
// Reload quiz data from backend
const updatedQuizData = await getQuiz(quizId)

// Transform and update local state
const transformedQuestions = updatedQuizData.questions.map((q) => {
  const choices = q.quiz_choices || []
  return {
    id: q.question_id,
    title: q.question_text,
    description: q.description || "",
    type: mapBackendQuestionTypeToUI(q.question_type),
    points: q.points || 1,
    options: choices.map((c) => c.choice_text),
    correctAnswer: determineCorrectAnswer(q, choices),  // ✅ Extracted
  }
})

setQuestions(transformedQuestions)
```

**✅ Question now appears in your quiz builder!**

---

## 🎯 How Correct Answer Works

### In Question Bank:

**Two places store correct answer**:

1. **`choices` JSONB field** (Array format):
   ```json
   [
     { "text": "2", "is_correct": false },
     { "text": "3", "is_correct": false },
     { "text": "4", "is_correct": true },   ← The flag!
     { "text": "5", "is_correct": false }
   ]
   ```

2. **`correct_answer` JSONB field** (Value format):
   ```json
   "4"
   ```

**You mark correct answer by**:
- Clicking the **green checkmark (✓)** button next to a choice
- This sets `is_correct: true` for that choice
- The `correct_answer` field is also set to the choice text

### During Import:

**Backend copies BOTH**:
1. ✅ `correct_answer` field → `quiz_questions.correct_answer`
2. ✅ Each choice with `is_correct` flag → `quiz_choices.is_correct`

### When Students Take Quiz:

**Answer checking uses**:
```typescript
// Check if student's answer matches the correct choice
const correctChoice = quiz_choices.find(c => c.is_correct === true)
const isCorrect = (studentAnswer === correctChoice.choice_text)
```

**OR**:
```typescript
// Check against correct_answer field
const isCorrect = (studentAnswer === quiz_questions.correct_answer)
```

Both methods work because both are copied during import!

---

## 🔍 Troubleshooting: If Correct Answer Is Missing

### Check Question Bank Data:

Run this SQL in Supabase:
```sql
SELECT
  id,
  question_text,
  choices,
  correct_answer
FROM question_bank
WHERE teacher_id = 'your-teacher-id'
LIMIT 5;
```

**Expected `choices` format**:
```json
[
  { "text": "Paris", "is_correct": true },
  { "text": "London", "is_correct": false },
  { "text": "Berlin", "is_correct": false }
]
```

**If you see**:
```json
[
  { "text": "Paris", "is_correct": false },  ← All false!
  { "text": "London", "is_correct": false },
  { "text": "Berlin", "is_correct": false }
]
```

**Then**: You didn't click the ✓ button when creating the question!

### Fix Missing Correct Answer:

**Option 1**: Edit the question in Question Bank
1. Go to `/teacher/question-bank`
2. Click edit button on the question
3. Click the ✓ button next to the correct choice
4. Click "Update"

**Option 2**: Fix directly in database
```sql
UPDATE question_bank
SET
  choices = '[
    { "text": "Paris", "is_correct": true },
    { "text": "London", "is_correct": false },
    { "text": "Berlin", "is_correct": false }
  ]'::jsonb,
  correct_answer = '"Paris"'::jsonb
WHERE id = 'your-question-id';
```

---

## 📊 Summary Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: CREATE IN QUESTION BANK                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Navigate to /teacher/question-bank                       │
│ 2. Click "Create Question"                                  │
│ 3. Fill form:                                               │
│    - Question text                                          │
│    - Add choices                                            │
│    - Click ✓ on correct choice ← MARKS is_correct=true    │
│ 4. Click "Create"                                           │
│ 5. Saved to question_bank table with:                       │
│    - choices: [{ text, is_correct }] ← JSONB array         │
│    - correct_answer: "text" ← JSONB value                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: IMPORT TO QUIZ                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Open quiz builder                                        │
│ 2. Click "Import from Question Bank"                        │
│ 3. Select questions (checkbox)                              │
│ 4. Click "Import Questions"                                 │
│ 5. Backend:                                                 │
│    a. Fetch question from question_bank                     │
│    b. Create NEW row in quiz_questions (COPY all fields)    │
│    c. Create NEW rows in quiz_choices (COPY is_correct!)    │
│ 6. Frontend: Reload quiz, update UI                         │
│ 7. ✅ Question appears in builder with correct answer!      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Key Takeaways

1. **Question Bank** = Template library of reusable questions
2. **Choices** are stored as JSONB array with `is_correct` flags
3. **Correct Answer** is marked by clicking ✓ button (sets `is_correct: true`)
4. **Import** creates NEW records in quiz tables (doesn't reference originals)
5. **Both** `correct_answer` field and `is_correct` flags are copied
6. **Tracking**: `source_question_bank_id` links back to original

If correct answers are missing, the problem is in **Question Bank data**, not the import logic!
