# Quiz Per-Question Time Tracking - Implementation Complete

## Overview

Per-question time tracking has been fully implemented across the frontend and backend. This allows the system to:
- Track how long students spend on each question
- Calculate average time spent per question across all attempts
- Store this data in `quiz_question_stats` for teacher analytics

---

## Backend Implementation ✅

### 1. DTO Updated (`submit-answer.dto.ts`)
Added `timeSpentSeconds` field (optional):
```typescript
@IsOptional()
@IsNumber()
@Min(0)
timeSpentSeconds?: number;
```

### 2. Service Updated (`quiz-attempts.service.ts`)
**Line 568**: Store time in `quiz_session_answers` (temporary storage)
```typescript
time_spent_seconds: submitDto.timeSpentSeconds || null,
```

**Line 639**: Transfer time to `quiz_student_answers` (final storage)
```typescript
time_spent_seconds: ans.time_spent_seconds,
```

### 3. Analytics Calculation (`quiz-analytics.service.ts`)
**Lines 222-232**: Calculate average time spent
```typescript
const timesSpent = relevantAnswers
  .map((a) => a.time_spent_seconds)
  .filter((t) => t !== null && t !== undefined) as number[];

let averageTimeSpent: number | null = null;
if (timesSpent.length > 0) {
  averageTimeSpent = Math.floor(
    timesSpent.reduce((sum, time) => sum + time, 0) / timesSpent.length,
  );
}
```

**Line 262**: Store in `quiz_question_stats`
```typescript
average_time_spent_seconds: averageTimeSpent,
```

---

## Frontend Implementation ✅

### Hook Updated (`useQuizAttempt.ts`)

#### 1. Add Time Tracking State (Line 95)
```typescript
const questionStartTimes = useRef<Map<string, number>>(new Map());
```

#### 2. Mark Question Viewed (Lines 342-347)
```typescript
const markQuestionViewed = useCallback((questionId: string) => {
  if (!questionStartTimes.current.has(questionId)) {
    questionStartTimes.current.set(questionId, Date.now());
    console.log(`[QuizAttempt] Started tracking time for question ${questionId}`);
  }
}, []);
```

#### 3. Calculate Time on Submit (Lines 217-222)
```typescript
const startTime = questionStartTimes.current.get(questionId);
if (startTime) {
  const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
  payload.timeSpentSeconds = timeSpentSeconds;
  console.log(`[QuizAttempt] Question ${questionId}: ${timeSpentSeconds}s spent`);
}
```

---

## How to Use in Quiz Components

### Step 1: Get the Hook
```typescript
import { useQuizAttempt } from '@/hooks/useQuizAttempt';

const { markQuestionViewed, submitAnswer } = useQuizAttempt();
```

### Step 2: Call markQuestionViewed When Question is Displayed

**Option A: In useEffect (when question changes)**
```typescript
useEffect(() => {
  if (currentQuestion?.question_id) {
    markQuestionViewed(currentQuestion.question_id);
  }
}, [currentQuestion?.question_id, markQuestionViewed]);
```

**Option B: When rendering question**
```typescript
{questions.map((question) => {
  // Mark question as viewed when it's rendered
  markQuestionViewed(question.question_id);

  return (
    <QuestionCard key={question.question_id} question={question} />
  );
})}
```

**Option C: On question navigation**
```typescript
const goToQuestion = (index: number) => {
  setCurrentQuestionIndex(index);
  const question = questions[index];
  markQuestionViewed(question.question_id); // ✅ Track time from now
};
```

### Step 3: Answer Question (Time Auto-Tracked)
```typescript
// When student answers, time is automatically calculated and sent
await submitAnswer(attemptId, questionId, answer);
// Backend receives: { questionId, choiceId, timeSpentSeconds: 45 }
```

---

## Example Integration

### Sequential Quiz Mode (page.tsx)

```typescript
export default function QuizPage() {
  const { attempt, submitAnswer, markQuestionViewed } = useQuizAttempt();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];

  // Track time when question changes
  useEffect(() => {
    if (currentQuestion) {
      markQuestionViewed(currentQuestion.question_id);
    }
  }, [currentQuestion?.question_id, markQuestionViewed]);

  const handleNext = async () => {
    // Answer is auto-saved with time tracking
    await submitAnswer(attemptId, currentQuestion.question_id, selectedAnswer);
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div>
      <QuestionCard question={currentQuestion} />
      <Button onClick={handleNext}>Next</Button>
    </div>
  );
}
```

---

## Database Schema

### quiz_session_answers (Temporary)
```sql
time_spent_seconds INT  -- Stored when answer is submitted
```

### quiz_student_answers (Final)
```sql
time_spent_seconds INT  -- Transferred when quiz is submitted
```

### quiz_question_stats (Analytics)
```sql
average_time_spent_seconds INT  -- Calculated from all attempts
```

---

## Testing

### 1. Frontend Console Logs
When taking a quiz, you should see:
```
[QuizAttempt] Started tracking time for question abc-123
[QuizAttempt] Question abc-123: 45s spent
```

### 2. Backend Logs
When submitting quiz:
```
[QuizAnalyticsService] Calculating question stats for quiz...
[QuizAnalyticsService] Question q1: 5 attempts, 3 correct (60.0%), difficulty=40.0
[QuizAnalyticsService] ✅ Question stats updated successfully for 3 questions
```

### 3. Database Verification
```sql
-- Check if time was stored
SELECT question_id, time_spent_seconds
FROM quiz_student_answers
WHERE attempt_id = 'your-attempt-id';

-- Check analytics
SELECT question_id, average_time_spent_seconds
FROM quiz_question_stats
WHERE quiz_id = 'your-quiz-id';
```

---

## Notes

- Time tracking starts when `markQuestionViewed()` is called
- Time is calculated when `submitAnswer()` is called
- Time is stored in **seconds** (integer)
- If student doesn't answer a question, no time is recorded (null)
- Average time is calculated only from questions that have time data

---

## Status: ✅ COMPLETE

All three analytics tables now fully populated:
- ✅ `quiz_student_summary` - Student aggregate stats
- ✅ `quiz_analytics` - Class-level statistics
- ✅ `quiz_question_stats` - Per-question analysis with time tracking

Last Updated: 2025-11-10
