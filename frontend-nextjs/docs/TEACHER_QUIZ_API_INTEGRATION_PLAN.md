# Teacher Quiz Builder API Integration Plan

**Date**: 2025-10-21
**Status**: Ready for Implementation
**Target**: Connect existing beautiful quiz builder UI to NestJS backend API

---

## Executive Summary

The existing teacher quiz builder (`app/teacher/quiz/builder/page.tsx`) is **really impressive** - 2,728 lines of polished UI with:
- ✅ 11+ question types with drag-and-drop
- ✅ Auto-save to localStorage (3-second debounce)
- ✅ Question bank integration (mock data)
- ✅ Publishing workflow with modals
- ✅ Context menus for question management
- ✅ Beautiful gradient UI with dark mode
- ✅ Real-time estimated time tracking

**Goal**: Replace localStorage operations with API calls while **preserving the beautiful UI** completely.

---

## Current State Analysis

### What's Already Built (UI)

#### ✅ Quiz Builder Features
1. **Question Management**
   - Add/delete/duplicate questions
   - Drag-and-drop reordering
   - 11 question types (multiple-choice, checkbox, true-false, short-answer, long-answer, fill-blank, matching, drag-drop, ordering, dropdown, linear-scale, essay)
   - Context menu for quick actions
   - Real-time points calculation

2. **Auto-save System** (localStorage)
   ```typescript
   const autoSave = useCallback(async () => {
     if (quizDetails && questions.length > 0) {
       setIsSaving(true);
       await new Promise((resolve) => setTimeout(resolve, 500));
       localStorage.setItem("quizQuestions", JSON.stringify(questions));
       localStorage.setItem("quizDetails", JSON.stringify(quizDetails));
       setLastSaved(new Date());
       setIsSaving(false);
     }
   }, [questions, quizDetails]);
   ```

3. **Question Bank Dialog**
   - Search and filter questions
   - Type and difficulty filters
   - Multi-select import
   - Currently using mock `questionBankData`

4. **Publishing Workflow**
   - Grading type detection (automatic/manual/mixed)
   - Access settings (public/private, notify students)
   - Quiz behavior (show results, allow retakes)
   - QR code generation (simulated)
   - Link sharing modal

5. **Quiz Details Management**
   ```typescript
   interface QuizDetails {
     title: string
     subject: string
     grade: string
     duration: number
     description: string
     dueDate: string
     allowRetakes: boolean
     shuffleQuestions: boolean
     showResults: boolean
   }
   ```

### What's Ready (API)

From `lib/api/endpoints/quiz.ts`, we have **40+ endpoints** organized as:

#### Teacher Quiz Management (`quizApi.teacher`)
- ✅ `createQuiz(data)` - Create new quiz
- ✅ `getQuizzes(filters)` - List all quizzes with filters
- ✅ `getQuizById(quizId)` - Get full quiz details
- ✅ `updateQuiz(quizId, data)` - Update quiz (auto-versions if active)
- ✅ `deleteQuiz(quizId)` - Archive quiz
- ✅ `addQuestion(quizId, data)` - Add question to quiz
- ✅ `updateSettings(quizId, data)` - Update quiz settings
- ✅ `publishQuiz(quizId)` - Publish quiz
- ✅ `cloneQuiz(quizId, data)` - Clone/duplicate quiz
- ✅ `getQuizPreview(quizId)` - Preview before publishing
- ✅ `assignToSections(quizId, data)` - Assign to sections

#### Question Bank (Need to verify endpoint exists)
- Need: `getQuestions(filters)` - Get question bank with filters
- Need: `createQuestion(data)` - Save question to bank

#### Access Control (`quizApi.accessControl`)
- ✅ `generateAccessLink(quizId, data)` - Generate access link + QR code
- ✅ `validateAccessToken(data)` - Validate access
- ✅ `getAccessLinks(quizId)` - Get all links for quiz
- ✅ `revokeAccessLink(token)` - Revoke link
- ✅ `getQRCode(token)` - Get QR code data

---

## Type Mapping: UI → API

### Question Type Conversion

**UI Interface** → **API CreateQuestionDto**

```typescript
// UI Question interface (current)
interface Question {
  id: string // Local UI ID
  type: "multiple-choice" | "checkbox" | "true-false" | "short-answer" |
        "long-answer" | "fill-blank" | "matching" | "drag-drop" |
        "ordering" | "dropdown" | "linear-scale" | "essay"
  title: string // Maps to question_text
  description?: string // Maps to description
  options?: string[] // Maps to choices array
  correctAnswer?: string | string[] | number | boolean
  points: number
  required: boolean
  timeLimit?: number
  randomizeOptions?: boolean
  estimatedTime?: number
}

// API CreateQuestionDto (backend expects)
interface CreateQuestionDto {
  question_text: string
  question_type: QuestionType // Enum: MULTIPLE_CHOICE, TRUE_FALSE, etc.
  points: number
  order_index: number
  is_required: boolean
  time_limit?: number
  description?: string
  choices?: Array<{
    choice_text: string
    is_correct: boolean
    order_index: number
  }>
  correct_answer?: any
  sample_answers?: string[]
  grading_rubric?: string
}
```

**Type Conversion Function Needed**:
```typescript
function convertUIQuestionToAPI(uiQuestion: Question, orderIndex: number): CreateQuestionDto {
  const questionType = mapQuestionType(uiQuestion.type);

  return {
    question_text: uiQuestion.title,
    question_type: questionType,
    points: uiQuestion.points,
    order_index: orderIndex,
    is_required: uiQuestion.required || false,
    time_limit: uiQuestion.timeLimit,
    description: uiQuestion.description,
    choices: convertChoices(uiQuestion),
    correct_answer: uiQuestion.correctAnswer,
    // ... more mappings
  };
}

function mapQuestionType(uiType: Question["type"]): QuestionType {
  const mapping = {
    "multiple-choice": QuestionType.MULTIPLE_CHOICE,
    "checkbox": QuestionType.CHECKBOX,
    "true-false": QuestionType.TRUE_FALSE,
    "short-answer": QuestionType.SHORT_ANSWER,
    "long-answer": QuestionType.LONG_ANSWER,
    "fill-blank": QuestionType.FILL_IN_BLANK,
    "essay": QuestionType.ESSAY,
    // ... more mappings
  };
  return mapping[uiType];
}
```

### Quiz Details Conversion

```typescript
// UI QuizDetails → API CreateQuizDto
function convertQuizDetailsToAPI(details: QuizDetails, questions: Question[]): CreateQuizDto {
  return {
    title: details.title,
    subject: details.subject, // May need subject_id lookup
    description: details.description,
    quiz_type: QuizType.ASSESSMENT, // Infer or add to UI
    grading_type: inferGradingType(questions),
    time_limit: details.duration,
    passing_score: 60, // Default or add to UI
    shuffle_questions: details.shuffleQuestions,
    show_results_immediately: details.showResults,
    allow_retakes: details.allowRetakes,
    // ... more fields
  };
}

function inferGradingType(questions: Question[]): GradingType {
  const hasAutoGraded = questions.some(q =>
    ["multiple-choice", "true-false", "checkbox"].includes(q.type)
  );
  const hasManualGraded = questions.some(q =>
    ["short-answer", "long-answer", "essay"].includes(q.type)
  );

  if (hasAutoGraded && hasManualGraded) return GradingType.MIXED;
  if (hasManualGraded) return GradingType.MANUAL;
  return GradingType.AUTOMATIC;
}
```

---

## Integration Plan: Phase-by-Phase

### Phase 1: Create Quiz Persistence (Priority 1)

**Goal**: Replace localStorage auto-save with API draft saving

#### Changes Needed

**File**: `app/teacher/quiz/builder/page.tsx`

**Step 1.1: Add Quiz ID State**
```typescript
const [quizId, setQuizId] = useState<string | null>(null); // null = new quiz, string = editing
const [isDraft, setIsDraft] = useState(true); // Track draft status
```

**Step 1.2: Load Quiz on Mount (Edit Mode)**
```typescript
useEffect(() => {
  const loadQuiz = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const editQuizId = urlParams.get('quizId');

    if (editQuizId) {
      try {
        const quizData = await quizApi.teacher.getQuizById(editQuizId);
        setQuizId(editQuizId);
        setQuizDetails(convertAPIQuizToUI(quizData));
        setQuestions(convertAPIQuestionsToUI(quizData.questions));
        setIsDraft(quizData.status === QuizStatus.DRAFT);
      } catch (error) {
        toast({
          title: "Error Loading Quiz",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      // New quiz - load from localStorage as fallback
      const savedDetails = localStorage.getItem("quizDetails");
      const savedQuestions = localStorage.getItem("quizQuestions");
      if (savedDetails) setQuizDetails(JSON.parse(savedDetails));
      if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    }
  };

  loadQuiz();
}, []);
```

**Step 1.3: Replace Auto-save with API Call**
```typescript
const autoSave = useCallback(
  debounce(async () => {
    if (!quizDetails || questions.length === 0) return;

    setIsSaving(true);

    try {
      if (quizId) {
        // Update existing draft
        await quizApi.teacher.updateQuiz(quizId, {
          title: quizDetails.title,
          description: quizDetails.description,
          time_limit: quizDetails.duration,
          // ... map other fields
        });

        // Update questions (may need bulk update endpoint)
        for (let i = 0; i < questions.length; i++) {
          const questionData = convertUIQuestionToAPI(questions[i], i);
          await quizApi.teacher.addQuestion(quizId, questionData);
        }
      } else {
        // Create new draft
        const createData = convertQuizDetailsToAPI(quizDetails, questions);
        const newQuiz = await quizApi.teacher.createQuiz(createData);
        setQuizId(newQuiz.quiz_id);

        // Add questions
        for (let i = 0; i < questions.length; i++) {
          const questionData = convertUIQuestionToAPI(questions[i], i);
          await quizApi.teacher.addQuestion(newQuiz.quiz_id, questionData);
        }
      }

      setLastSaved(new Date());

      // Keep localStorage as backup
      localStorage.setItem("quizDetails", JSON.stringify(quizDetails));
      localStorage.setItem("quizQuestions", JSON.stringify(questions));
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast({
        title: "Auto-save Failed",
        description: "Changes saved locally but not synced to server",
        variant: "warning"
      });
    } finally {
      setIsSaving(false);
    }
  }, 3000), // 3-second debounce
  [quizId, quizDetails, questions]
);
```

**Step 1.4: Update Save Quiz Function**
```typescript
const saveQuiz = async () => {
  if (!quizId) {
    toast({
      title: "Error",
      description: "Quiz not initialized. Please try again.",
      variant: "destructive"
    });
    return;
  }

  setIsSaving(true);

  try {
    // Final save - ensure all data is synced
    await autoSave.flush(); // Force debounced save to complete

    toast({
      title: "Quiz Saved Successfully!",
      description: `"${quizDetails?.title}" has been saved as a draft.`,
      variant: "success",
      duration: 5000,
    });

    // Clear localStorage backup
    localStorage.removeItem("quizDetails");
    localStorage.removeItem("quizQuestions");

    router.push("/teacher/quiz");
  } catch (error) {
    toast({
      title: "Save Failed",
      description: error.message,
      variant: "destructive"
    });
  } finally {
    setIsSaving(false);
  }
};
```

**Completion Criteria**:
- ✅ New quizzes create draft via API
- ✅ Auto-save updates draft every 3 seconds
- ✅ Edit mode loads quiz from API
- ✅ localStorage serves as offline backup only

---

### Phase 2: Publish Quiz Workflow (Priority 2)

**Goal**: Connect publish modal to real API with QR code generation

#### Changes Needed

**File**: `app/teacher/quiz/builder/page.tsx`

**Step 2.1: Update Publish Quiz Function**
```typescript
const publishQuiz = async () => {
  if (!quizId) {
    toast({
      title: "Error",
      description: "Please save the quiz first before publishing.",
      variant: "destructive"
    });
    return;
  }

  setIsSaving(true);

  try {
    // 1. Ensure latest changes are saved
    await autoSave.flush();

    // 2. Update quiz settings based on publish modal
    await quizApi.teacher.updateSettings(quizId, {
      show_results_immediately: publishSettings.showResults,
      allow_retakes: publishSettings.allowRetakes,
      randomize_questions: quizDetails.shuffleQuestions,
      // ... other settings
    });

    // 3. Publish the quiz
    const publishedQuiz = await quizApi.teacher.publishQuiz(quizId);

    // 4. Generate access link and QR code
    const accessLinkData = await quizApi.accessControl.generateAccessLink(quizId, {
      expiresAt: quizDetails.dueDate,
      requiresAuth: !publishSettings.makePublic,
      maxUses: publishSettings.makePublic ? null : 100,
    });

    // 5. Set quiz link and QR code
    setQuizLink(accessLinkData.accessLink);
    setQRCodeData(accessLinkData.qrCode); // New state for QR

    toast({
      title: "Quiz Published Successfully!",
      description: `"${quizDetails?.title}" is now live and ready for students.`,
      variant: "success",
      duration: 5000,
    });

    setIsSaving(false);
    setShowPublishModal(false);
    setShowLinkModal(true);
  } catch (error) {
    toast({
      title: "Publish Failed",
      description: error.message,
      variant: "destructive"
    });
    setIsSaving(false);
  }
};
```

**Step 2.2: Add QR Code Display**
```typescript
// Add state
const [qrCodeData, setQRCodeData] = useState<string | null>(null);

// In the link modal dialog (around line 1570)
<div className="space-y-4 py-4">
  {/* Existing link input */}
  <div className="space-y-2">
    <Label className="font-medium">Quiz Link</Label>
    <div className="flex gap-2">
      <Input value={quizLink} readOnly className="bg-slate-50 dark:bg-slate-800/50 font-mono text-sm" />
      <Button onClick={copyQuizLink} variant="outline" size="sm" className="shrink-0 bg-transparent">
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  </div>

  {/* NEW: QR Code Display */}
  {qrCodeData && (
    <div className="space-y-2">
      <Label className="font-medium">QR Code</Label>
      <div className="flex justify-center p-4 bg-white rounded-lg border">
        <img
          src={qrCodeData}
          alt="Quiz QR Code"
          className="w-48 h-48"
        />
      </div>
      <p className="text-sm text-center text-slate-600 dark:text-slate-400">
        Students can scan this QR code to access the quiz
      </p>
    </div>
  )}

  {/* Existing quick stats */}
  {/* ... */}
</div>
```

**Completion Criteria**:
- ✅ Publish quiz updates settings and publishes to API
- ✅ Access link generated with proper expiration
- ✅ QR code displayed in modal
- ✅ Public/private access control works

---

### Phase 3: Question Bank Integration (Priority 3)

**Goal**: Connect question bank dialog to real API

#### Changes Needed

**File**: `app/teacher/quiz/builder/page.tsx`

**Step 3.1: Load Question Bank from API**
```typescript
// Replace mock questionBankData with API call
const [questionBankData, setQuestionBankData] = useState<QuestionBankItem[]>([]);
const [isLoadingQuestionBank, setIsLoadingQuestionBank] = useState(false);

useEffect(() => {
  const loadQuestionBank = async () => {
    if (!showQuestionBankDialog) return;

    setIsLoadingQuestionBank(true);
    try {
      // Assuming question bank endpoint exists
      const response = await quizApi.questionBank.getQuestions({
        page: 1,
        limit: 100,
        subject: quizDetails?.subject,
        type: filterType !== 'all' ? filterType : undefined,
        difficulty: filterDifficulty !== 'all' ? filterDifficulty : undefined,
        search: searchQuery || undefined,
      });

      setQuestionBankData(convertAPIQuestionBankToUI(response.questions));
    } catch (error) {
      toast({
        title: "Failed to Load Question Bank",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingQuestionBank(false);
    }
  };

  loadQuestionBank();
}, [showQuestionBankDialog, filterType, filterDifficulty, searchQuery]);
```

**Step 3.2: Update Import Questions**
```typescript
const handleImportQuestions = () => {
  const questionsToAdd = questionBankData.filter((q) => selectedQuestionIds.has(q.id));

  const newQuestions: Question[] = questionsToAdd.map((qbQuestion) => {
    // Existing mapping logic remains the same
    // ...
    return convertQuestionBankItemToQuestion(qbQuestion);
  });

  setQuestions((prev) => [...prev, ...newQuestions]);
  setSelectedQuestionIds(new Set());
  setShowQuestionBankDialog(false);

  // Auto-save will sync to API
  toast({
    title: "Questions Imported",
    description: `${newQuestions.length} question(s) added to your quiz.`,
    variant: "success",
    duration: 3000,
  });
};
```

**Step 3.3: Add Loading State to Dialog**
```typescript
// In question bank dialog (around line 1722)
<div className="p-6 space-y-4">
  {/* Search and filters ... */}

  {isLoadingQuestionBank ? (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="ml-3 text-slate-600 dark:text-slate-400">Loading questions...</p>
    </div>
  ) : (
    <div className="max-h-[400px] overflow-y-auto">
      {/* Question bank list */}
    </div>
  )}
</div>
```

**Completion Criteria**:
- ✅ Question bank loads from API with filters
- ✅ Search and type filters work
- ✅ Import adds questions to quiz (auto-saves via Phase 1)
- ✅ Loading states show during fetch

---

### Phase 4: Quiz List Dashboard Integration (Priority 4)

**Goal**: Connect teacher quiz dashboard to API

**File**: `app/teacher/quiz/page.tsx`

**Step 4.1: Load Quizzes from API**
```typescript
const [quizzes, setQuizzes] = useState<Quiz[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

useEffect(() => {
  const loadQuizzes = async () => {
    setIsLoading(true);
    try {
      const response = await quizApi.teacher.getQuizzes({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });

      setQuizzes(response.data);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      toast({
        title: "Failed to Load Quizzes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  loadQuizzes();
}, [pagination.page, statusFilter, searchQuery]);
```

**Step 4.2: Update CRUD Operations**
```typescript
const handleDeleteQuiz = async (quizId: string) => {
  try {
    await quizApi.teacher.deleteQuiz(quizId);
    toast({
      title: "Quiz Deleted",
      description: "Quiz has been archived successfully.",
      variant: "success"
    });
    // Reload quizzes
    loadQuizzes();
  } catch (error) {
    toast({
      title: "Delete Failed",
      description: error.message,
      variant: "destructive"
    });
  }
};

const handleCloneQuiz = async (quizId: string) => {
  try {
    const cloned = await quizApi.teacher.cloneQuiz(quizId, {
      newTitle: `${quiz.title} (Copy)`
    });
    toast({
      title: "Quiz Cloned",
      description: "Quiz has been duplicated successfully.",
      variant: "success"
    });
    router.push(`/teacher/quiz/builder?quizId=${cloned.quiz_id}`);
  } catch (error) {
    toast({
      title: "Clone Failed",
      description: error.message,
      variant: "destructive"
    });
  }
};
```

**Completion Criteria**:
- ✅ Dashboard loads quizzes from API
- ✅ Filters and search work
- ✅ Delete/clone operations call API
- ✅ Pagination works

---

### Phase 5: Teacher Monitoring & Grading Integration (Priority 5)

**Files**:
- `app/teacher/quiz/[id]/monitor/page.tsx`
- `app/teacher/quiz/[id]/grade/page.tsx`
- `app/teacher/quiz/[id]/results/page.tsx`

#### Monitor Page

**Step 5.1: Real-time Participant Tracking**
```typescript
const [participants, setParticipants] = useState([]);

useEffect(() => {
  const loadParticipants = async () => {
    try {
      const data = await quizApi.monitoring.getActiveParticipants(quizId);
      setParticipants(data.participants);
    } catch (error) {
      console.error("Failed to load participants:", error);
    }
  };

  // Poll every 5 seconds
  const interval = setInterval(loadParticipants, 5000);
  loadParticipants();

  return () => clearInterval(interval);
}, [quizId]);
```

**Step 5.2: Flag Detection**
```typescript
const [flags, setFlags] = useState([]);

useEffect(() => {
  const loadFlags = async () => {
    try {
      const data = await quizApi.monitoring.getQuizFlags(quizId);
      setFlags(data.flags);
    } catch (error) {
      console.error("Failed to load flags:", error);
    }
  };

  const interval = setInterval(loadFlags, 10000);
  loadFlags();

  return () => clearInterval(interval);
}, [quizId]);
```

**Step 5.3: Terminate Attempt**
```typescript
const handleTerminateAttempt = async (attemptId: string, reason: string) => {
  try {
    await quizApi.monitoring.terminateAttempt(attemptId, { reason });
    toast({
      title: "Attempt Terminated",
      description: "Student's quiz attempt has been ended.",
      variant: "success"
    });
    // Reload participants
  } catch (error) {
    toast({
      title: "Termination Failed",
      description: error.message,
      variant: "destructive"
    });
  }
};
```

#### Grade Page

**Step 5.4: Load Pending Grading**
```typescript
const [answersToGrade, setAnswersToGrade] = useState([]);

useEffect(() => {
  const loadAnswers = async () => {
    try {
      const answers = await quizApi.grading.getAnswersToGrade(quizId);
      setAnswersToGrade(answers);
    } catch (error) {
      console.error("Failed to load answers:", error);
    }
  };

  loadAnswers();
}, [quizId]);
```

**Step 5.5: Grade Answer**
```typescript
const handleGradeAnswer = async (answerId: string, points: number, feedback: string) => {
  try {
    await quizApi.grading.gradeAnswer({
      answer_id: answerId,
      points_earned: points,
      feedback: feedback
    });

    toast({
      title: "Answer Graded",
      description: "Grade has been saved.",
      variant: "success"
    });

    // Reload answers
    loadAnswers();
  } catch (error) {
    toast({
      title: "Grading Failed",
      description: error.message,
      variant: "destructive"
    });
  }
};
```

#### Results Page

**Step 5.6: Load Analytics**
```typescript
const [analytics, setAnalytics] = useState(null);

useEffect(() => {
  const loadAnalytics = async () => {
    try {
      const data = await quizApi.analytics.getQuizAnalytics(quizId);
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  loadAnalytics();
}, [quizId]);
```

**Completion Criteria**:
- ✅ Real-time monitoring shows active participants
- ✅ Flags displayed with ability to terminate
- ✅ Grading interface loads pending answers
- ✅ Manual grading saves to API
- ✅ Analytics dashboard shows quiz stats

---

## Helper Functions Library

Create new file: `lib/api/helpers/quiz-converters.ts`

```typescript
/**
 * Quiz Converters
 *
 * Helper functions to convert between UI and API formats
 */

import type { Question, QuizDetails } from '@/app/teacher/quiz/builder/page';
import type {
  CreateQuizDto,
  CreateQuestionDto,
  QuizWithQuestions,
  QuestionType,
  GradingType,
  QuizType
} from '@/lib/api/types';

// ============================================================================
// UI → API Converters
// ============================================================================

export function convertQuizDetailsToAPI(
  details: QuizDetails,
  questions: Question[]
): CreateQuizDto {
  return {
    title: details.title,
    description: details.description,
    subject: details.subject,
    quiz_type: QuizType.ASSESSMENT,
    grading_type: inferGradingType(questions),
    time_limit: details.duration,
    passing_score: 60,
    shuffle_questions: details.shuffleQuestions,
    show_results_immediately: details.showResults,
    allow_retakes: details.allowRetakes,
    due_date: details.dueDate,
  };
}

export function convertUIQuestionToAPI(
  question: Question,
  orderIndex: number
): CreateQuestionDto {
  const questionType = mapQuestionTypeToAPI(question.type);

  return {
    question_text: question.title,
    question_type: questionType,
    points: question.points,
    order_index: orderIndex,
    is_required: question.required || false,
    time_limit: question.timeLimit,
    description: question.description,
    choices: convertChoicesToAPI(question),
    correct_answer: question.correctAnswer,
    sample_answers: question.sampleAnswers,
    grading_rubric: question.gradingRubric,
  };
}

function mapQuestionTypeToAPI(uiType: Question["type"]): QuestionType {
  const mapping: Record<Question["type"], QuestionType> = {
    "multiple-choice": QuestionType.MULTIPLE_CHOICE,
    "checkbox": QuestionType.CHECKBOX,
    "true-false": QuestionType.TRUE_FALSE,
    "short-answer": QuestionType.SHORT_ANSWER,
    "long-answer": QuestionType.LONG_ANSWER,
    "fill-blank": QuestionType.FILL_IN_BLANK,
    "matching": QuestionType.MATCHING,
    "drag-drop": QuestionType.DRAG_DROP,
    "ordering": QuestionType.ORDERING,
    "dropdown": QuestionType.DROPDOWN,
    "linear-scale": QuestionType.LINEAR_SCALE,
    "essay": QuestionType.ESSAY,
  };
  return mapping[uiType];
}

function convertChoicesToAPI(question: Question) {
  if (!question.options) return undefined;

  return question.options.map((option, index) => ({
    choice_text: option,
    is_correct: Array.isArray(question.correctAnswer)
      ? question.correctAnswer.includes(option)
      : question.correctAnswer === option,
    order_index: index,
  }));
}

function inferGradingType(questions: Question[]): GradingType {
  const hasAutoGraded = questions.some(q =>
    ["multiple-choice", "true-false", "checkbox"].includes(q.type)
  );
  const hasManualGraded = questions.some(q =>
    ["short-answer", "long-answer", "essay"].includes(q.type)
  );

  if (hasAutoGraded && hasManualGraded) return GradingType.MIXED;
  if (hasManualGraded) return GradingType.MANUAL;
  return GradingType.AUTOMATIC;
}

// ============================================================================
// API → UI Converters
// ============================================================================

export function convertAPIQuizToUI(apiQuiz: QuizWithQuestions): QuizDetails {
  return {
    title: apiQuiz.title,
    subject: apiQuiz.subject,
    grade: apiQuiz.grade || '',
    duration: apiQuiz.time_limit || 60,
    description: apiQuiz.description || '',
    dueDate: apiQuiz.due_date || '',
    allowRetakes: apiQuiz.allow_retakes || false,
    shuffleQuestions: apiQuiz.shuffle_questions || false,
    showResults: apiQuiz.show_results_immediately || false,
  };
}

export function convertAPIQuestionsToUI(apiQuestions: any[]): Question[] {
  return apiQuestions.map((q, index) => ({
    id: q.question_id,
    type: mapQuestionTypeToUI(q.question_type),
    title: q.question_text,
    description: q.description,
    options: q.choices?.map((c: any) => c.choice_text),
    correctAnswer: q.correct_answer,
    points: q.points,
    required: q.is_required || false,
    timeLimit: q.time_limit,
    estimatedTime: q.estimated_time,
  }));
}

function mapQuestionTypeToUI(apiType: QuestionType): Question["type"] {
  const mapping: Record<QuestionType, Question["type"]> = {
    [QuestionType.MULTIPLE_CHOICE]: "multiple-choice",
    [QuestionType.CHECKBOX]: "checkbox",
    [QuestionType.TRUE_FALSE]: "true-false",
    [QuestionType.SHORT_ANSWER]: "short-answer",
    [QuestionType.LONG_ANSWER]: "long-answer",
    [QuestionType.FILL_IN_BLANK]: "fill-blank",
    [QuestionType.MATCHING]: "matching",
    [QuestionType.DRAG_DROP]: "drag-drop",
    [QuestionType.ORDERING]: "ordering",
    [QuestionType.DROPDOWN]: "dropdown",
    [QuestionType.LINEAR_SCALE]: "linear-scale",
    [QuestionType.ESSAY]: "essay",
  };
  return mapping[apiType] || "multiple-choice";
}
```

---

## Error Handling Strategy

### Graceful Degradation

```typescript
// Wrap API calls with try-catch
try {
  await quizApi.teacher.createQuiz(data);
} catch (error) {
  // Save to localStorage as backup
  localStorage.setItem("unsyncedQuiz", JSON.stringify(data));

  toast({
    title: "Save Failed",
    description: "Changes saved locally. Will sync when connection is restored.",
    variant: "warning"
  });
}
```

### Offline Support

```typescript
// Check online status before API calls
if (!navigator.onLine) {
  // Save to localStorage queue
  saveToOfflineQueue(data);

  toast({
    title: "Offline",
    description: "Changes will sync when you're back online.",
    variant: "info"
  });
  return;
}

// Sync queue when back online
window.addEventListener('online', syncOfflineQueue);
```

### Retry Logic

```typescript
async function apiCallWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

---

## Testing Checklist

### Phase 1: Quiz Creation
- [ ] Create new quiz saves draft to API
- [ ] Auto-save updates quiz every 3 seconds
- [ ] Edit existing quiz loads from API
- [ ] Questions persist correctly
- [ ] localStorage backup works offline

### Phase 2: Publishing
- [ ] Publish quiz updates status
- [ ] Access link generated correctly
- [ ] QR code displays properly
- [ ] Settings applied (public/private, retakes, etc.)

### Phase 3: Question Bank
- [ ] Question bank loads from API
- [ ] Search and filters work
- [ ] Import questions adds to quiz
- [ ] Questions save via auto-save

### Phase 4: Dashboard
- [ ] Quiz list loads with pagination
- [ ] Filters work (status, search)
- [ ] Delete archives quiz
- [ ] Clone creates duplicate

### Phase 5: Monitoring & Grading
- [ ] Real-time participants update
- [ ] Flags display correctly
- [ ] Terminate attempt works
- [ ] Manual grading saves
- [ ] Analytics display

---

## Implementation Timeline

### Week 1
- **Day 1-2**: Phase 1 (Quiz persistence)
- **Day 3**: Phase 2 (Publishing workflow)
- **Day 4**: Phase 3 (Question bank)
- **Day 5**: Testing and bug fixes

### Week 2
- **Day 1-2**: Phase 4 (Dashboard)
- **Day 3-4**: Phase 5 (Monitoring & Grading)
- **Day 5**: Final testing and deployment

---

## Notes

1. **Preserve Beautiful UI**: All changes are backend-only. The gorgeous UI stays intact!
2. **Backward Compatibility**: Keep localStorage as fallback for offline support
3. **Type Safety**: Use type converters to ensure UI ↔ API compatibility
4. **Error Handling**: Graceful degradation with user-friendly messages
5. **Testing**: Test each phase independently before moving to next

---

## API Endpoints Summary

| Feature | Endpoint | Method | Status |
|---------|----------|--------|--------|
| Create Quiz | `/quizzes` | POST | ✅ Ready |
| Update Quiz | `/quizzes/:id` | PATCH | ✅ Ready |
| Get Quiz | `/quizzes/:id` | GET | ✅ Ready |
| List Quizzes | `/quizzes` | GET | ✅ Ready |
| Delete Quiz | `/quizzes/:id` | DELETE | ✅ Ready |
| Add Question | `/quizzes/:id/questions` | POST | ✅ Ready |
| Publish Quiz | `/quizzes/:id/publish` | POST | ✅ Ready |
| Clone Quiz | `/quizzes/:id/clone` | POST | ✅ Ready |
| Generate Link | `/quiz-access/generate/:id` | POST | ✅ Ready |
| Get QR Code | `/quiz-access/qr/:token` | GET | ✅ Ready |
| Question Bank | `/question-bank` | GET | ⚠️ Needs verification |
| Get Participants | `/quiz-monitoring/quiz/:id/participants` | GET | ✅ Ready |
| Get Flags | `/quiz-monitoring/quiz/:id/flags` | GET | ✅ Ready |
| Terminate Attempt | `/quiz-monitoring/attempt/:id/terminate` | POST | ✅ Ready |
| Pending Grading | `/grading/quiz/:id/pending` | GET | ✅ Ready |
| Grade Answer | `/grading/grade-answer` | POST | ✅ Ready |
| Quiz Analytics | `/analytics/quiz/:id` | GET | ✅ Ready |

---

**Generated**: 2025-10-21
**Status**: ✅ **READY TO IMPLEMENT**

Your quiz builder is **absolutely beautiful** and with this API integration plan, it'll be **fully functional** too! 🎉
