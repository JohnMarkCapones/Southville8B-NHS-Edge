# Quiz System Implementation Guide
**Comprehensive Integration Plan for Frontend ↔ Backend**

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Analysis](#architecture-analysis)
3. [Prerequisites Checklist](#prerequisites-checklist)
4. [Implementation Phases](#implementation-phases)
5. [Detailed Implementation Steps](#detailed-implementation-steps)
6. [Testing Strategy](#testing-strategy)
7. [Rollout Plan](#rollout-plan)

---

## 🎯 System Overview

### Current State
- **Frontend**: Next.js 15 with mock/dummy data
- **Backend**: NestJS API with 40+ endpoints (Port 3004)
- **Database**: Supabase with 21 quiz-related tables
- **Authentication**: JWT-based auth with cookie storage

### Goal
Connect frontend to backend while preserving existing UI/UX and adding real data flow.

### Key Principle
**"Don't break what works, enhance what exists"**
- Keep all existing UI components
- Keep mock data as fallback
- Add real API integration layer by layer
- Test each integration independently

---

## 🏗️ Architecture Analysis

### Frontend Architecture
```
frontend-nextjs/
├── app/
│   ├── student/quiz/          # Student quiz pages
│   │   ├── page.tsx            # Quiz list (mock data)
│   │   ├── [id]/page.tsx       # Quiz taking (mock data)
│   │   └── 1,2,3/page.tsx      # Different quiz formats
│   └── teacher/quiz/          # Teacher quiz pages
│       ├── page.tsx            # Quiz management list
│       ├── builder/page.tsx    # Quiz builder
│       ├── [id]/edit/          # Edit quiz
│       ├── [id]/monitor/       # Monitor active quiz
│       ├── [id]/grade/         # Grading interface
│       └── [id]/results/       # Results view
│
├── components/quiz/           # Quiz UI components
│   ├── multiple-choice-quiz.tsx
│   ├── true-false-quiz.tsx
│   ├── quiz-renderer.tsx
│   └── ... (15+ question type components)
│
├── lib/
│   ├── api/
│   │   ├── client.ts          # API HTTP client
│   │   ├── config.ts          # API configuration (port 3004)
│   │   ├── endpoints/
│   │   │   ├── quiz.ts        # Quiz endpoints
│   │   │   ├── question-bank.ts
│   │   │   └── auth.ts
│   │   └── types/             # TypeScript types
│   ├── stores/
│   │   ├── quiz-store.ts      # Teacher quiz builder state
│   │   └── quiz-attempt-store.ts  # Student quiz state
│   └── hooks/
│       └── useQuizBuilderAPI.ts
```

### Backend API Structure (Port 3004)
```
/api/v1/
├── quizzes/
│   ├── GET /available              # Student: Available quizzes
│   ├── POST /                      # Teacher: Create quiz
│   ├── GET /:id                    # Get quiz details
│   ├── PATCH /:id                  # Update quiz
│   ├── POST /:id/publish           # Publish quiz
│   ├── POST /:id/assign-sections   # Assign to sections
│   └── GET /:id/sections           # Get assigned sections
│
├── quiz-attempts/
│   ├── POST /start/:quizId         # Start quiz attempt
│   ├── POST /:attemptId/answer     # Submit answer
│   ├── POST /:attemptId/submit     # Submit quiz
│   └── GET /:attemptId             # Get attempt details
│
├── quiz-sessions/
│   ├── POST /:attemptId/heartbeat  # Session heartbeat
│   └── POST /:attemptId/validate   # Validate session
│
├── grading/
│   ├── POST /grade-answer          # Manual grade
│   └── POST /bulk-grade            # Bulk grading
│
├── quiz-monitoring/
│   ├── GET /quiz/:id/participants  # Active participants
│   ├── GET /quiz/:id/flags         # Security flags
│   └── POST /attempt/:id/terminate # Terminate attempt
│
├── analytics/
│   ├── GET /quiz/:id               # Quiz analytics
│   ├── GET /quiz/:id/questions     # Question stats
│   └── GET /quiz/:id/students      # Student performance
│
└── question-bank/
    ├── POST /                      # Create question
    ├── GET /                       # List questions
    ├── GET /:id                    # Get question
    └── PATCH /:id                  # Update question
```

### Database Schema (21 Tables)
**Core Tables:**
1. `quizzes` - Main quiz table
2. `quiz_questions` - Questions
3. `quiz_choices` - Answer choices
4. `quiz_attempts` - Student attempts
5. `quiz_student_answers` - Final answers
6. `quiz_active_sessions` - Live sessions
7. `quiz_sections` - Section assignments

**See:** `quiz_schema_documentation.md` for full schema

---

## ✅ Prerequisites Checklist

### Before Starting Implementation

#### 1. Backend Verification
- [ ] Backend is running on `http://localhost:3004`
- [ ] Swagger docs accessible at `http://localhost:3004/api/docs`
- [ ] Database tables created in Supabase
- [ ] Test endpoints respond correctly

#### 2. Frontend Configuration
- [ ] `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3004`
- [ ] API client configured (`lib/api/client.ts`)
- [ ] API endpoints defined (`lib/api/endpoints/quiz.ts`)
- [ ] TypeScript types defined (`lib/api/types/quiz.ts`)

#### 3. Authentication
- [ ] JWT tokens stored in cookies (`sb-access-token`)
- [ ] Users can log in as student/teacher
- [ ] API client includes auth headers automatically
- [ ] Test authenticated endpoint (e.g., `GET /users/me`)

#### 4. Development Environment
- [ ] Node.js 18+ installed
- [ ] npm/pnpm dependencies installed
- [ ] Both frontend (3000) and backend (3004) ports available
- [ ] Supabase project accessible

---

## 🚀 Implementation Phases

### **Phase 1: Foundation & Connectivity** (Day 1)
**Goal:** Verify system connectivity and test basic API calls

1. Test backend API connectivity
2. Verify authentication flow
3. Test one simple endpoint (GET /users/me)
4. Ensure CORS is configured
5. Verify cookies are being sent

**Success Criteria:**
- ✅ Frontend can reach backend
- ✅ Auth headers are sent correctly
- ✅ API client handles errors gracefully

---

### **Phase 2: Student Quiz List** (Day 1-2)
**Goal:** Replace mock quiz list with real data from backend

**Files to Modify:**
- `app/student/quiz/page.tsx`

**API Endpoint:**
- `GET /api/v1/quizzes/available?page=1&limit=10`

**Implementation Steps:**
1. Create a hook `useAvailableQuizzes()` that fetches from API
2. Implement loading state (show skeleton)
3. Implement error state (show error message)
4. Implement data state (show quiz cards)
5. Add pagination support
6. Add filtering by subject
7. Keep mock data as fallback if API fails

**Success Criteria:**
- ✅ Student sees real quizzes from database
- ✅ Only quizzes assigned to their section appear
- ✅ Date filtering works (start/end dates)
- ✅ Loading and error states work

---

### **Phase 3: Student Quiz Taking Flow** (Day 2-4)
**Goal:** Complete student quiz-taking experience with backend

#### 3.1 Start Quiz Attempt
**Files:**
- `app/student/quiz/[id]/page.tsx`

**API Endpoint:**
- `POST /api/v1/quiz-attempts/start/:quizId`

**Response:**
```json
{
  "attemptId": "uuid",
  "sessionId": "uuid",
  "quiz": { ... },
  "questions": [ ... ],
  "questionsShown": ["q1", "q2", ...],
  "timeLimit": 3600,
  "startedAt": "2025-01-05T10:00:00Z"
}
```

**Implementation:**
1. When student clicks "Join Quiz", call start endpoint
2. Store `attemptId` and `sessionId` in state/store
3. Initialize quiz state with questions
4. Start timer countdown
5. Disable browser back button
6. Show quiz instructions modal

#### 3.2 Answer Submission (Auto-save)
**API Endpoint:**
- `POST /api/v1/quiz-attempts/:attemptId/answer`

**Request:**
```json
{
  "questionId": "uuid",
  "choiceId": "uuid",           // For MCQ/True-False
  "choiceIds": ["uuid1", ...],  // For Checkbox
  "answerText": "answer",       // For Short Answer
  "answerJson": { ... }         // For complex types
}
```

**Implementation:**
1. Debounce answer changes (save after 2 seconds of inactivity)
2. Show "Saving..." indicator
3. Handle network errors gracefully (retry logic)
4. Store answers in Zustand store
5. Sync to backend periodically

#### 3.3 Quiz Submission & Results
**API Endpoint:**
- `POST /api/v1/quiz-attempts/:attemptId/submit`

**Response:**
```json
{
  "attemptId": "uuid",
  "score": 85,
  "maxScore": 100,
  "percentage": 85,
  "gradedCount": 18,
  "manualGradingRequired": 2,
  "totalTimeSeconds": 1235,
  "submittedAt": "2025-01-05T10:35:00Z"
}
```

**Implementation:**
1. Show confirmation dialog before submit
2. Call submit endpoint
3. Display auto-grading results immediately
4. Show which questions need manual grading
5. Navigate to results page
6. Clear quiz state from store

**Success Criteria:**
- ✅ Student can start quiz attempt
- ✅ Answers auto-save to backend
- ✅ Quiz submits successfully
- ✅ Auto-graded results shown immediately
- ✅ Timer works correctly

---

### **Phase 4: Session Management** (Day 4)
**Goal:** Implement heartbeat and security monitoring

**API Endpoints:**
- `POST /api/v1/quiz-sessions/:attemptId/heartbeat`
- `POST /api/v1/quiz-sessions/:attemptId/validate`

**Implementation:**
1. Send heartbeat every 30 seconds during quiz
2. Include device fingerprint in heartbeat
3. Detect if session becomes invalid
4. Show warning if student switches tabs
5. Handle session termination gracefully

**Heartbeat Payload:**
```json
{
  "deviceFingerprint": "abc123",
  "currentQuestionIndex": 5,
  "questionsAnswered": 3
}
```

**Success Criteria:**
- ✅ Heartbeat sent every 30 seconds
- ✅ Session invalidation detected
- ✅ Tab switch tracking works
- ✅ Device change detection works

---

### **Phase 5: Teacher Quiz Builder** (Day 5-7)
**Goal:** Enable teachers to create quizzes via backend

#### 5.1 Create Quiz
**API Endpoint:**
- `POST /api/v1/quizzes`

**Request:**
```json
{
  "title": "Math Midterm Exam",
  "description": "Covers chapters 1-5",
  "subject_id": "uuid",
  "type": "assessment",
  "grading_type": "auto",
  "time_limit": 3600,
  "total_points": 100,
  "status": "draft"
}
```

**Files:**
- `app/teacher/quiz/builder/page.tsx`
- `lib/hooks/useQuizBuilderAPI.ts`

**Implementation:**
1. Use existing quiz builder UI
2. On "Save Draft", call create endpoint
3. Store returned `quiz_id`
4. Auto-save changes every 3 seconds
5. Show "Last saved" timestamp

#### 5.2 Add Questions
**API Endpoint:**
- `POST /api/v1/quizzes/:id/questions`

**Request:**
```json
{
  "question_text": "What is 2+2?",
  "question_type": "multiple_choice",
  "points": 5,
  "order_index": 0,
  "choices": [
    { "choice_text": "3", "is_correct": false },
    { "choice_text": "4", "is_correct": true }
  ]
}
```

**Implementation:**
1. When teacher adds question, call endpoint
2. Store returned `question_id`
3. Support all 15+ question types
4. Handle choices for MCQ/Checkbox
5. Handle correct answers for auto-grading

#### 5.3 Publish & Assign
**API Endpoints:**
- `POST /api/v1/quizzes/:id/publish`
- `POST /api/v1/quizzes/:id/assign-sections`

**Assign Payload:**
```json
{
  "sectionIds": ["uuid1", "uuid2"],
  "startDate": "2025-01-10T08:00:00Z",
  "endDate": "2025-01-15T23:59:59Z",
  "timeLimit": 3600
}
```

**Implementation:**
1. Validate quiz before publishing
2. Call publish endpoint
3. Show section selection dialog
4. Call assign endpoint with selected sections
5. Generate access link/QR code
6. Show success modal with quiz link

**Success Criteria:**
- ✅ Teacher can create quiz
- ✅ Questions save to backend
- ✅ Quiz publishes successfully
- ✅ Section assignment works
- ✅ Students can see assigned quizzes

---

### **Phase 6: Teacher Monitoring** (Day 8)
**Goal:** Real-time monitoring of active quiz sessions

**API Endpoints:**
- `GET /api/v1/quiz-monitoring/quiz/:id/participants`
- `GET /api/v1/quiz-monitoring/quiz/:id/flags`

**Files:**
- `app/teacher/quiz/[id]/monitor/page.tsx`

**Implementation:**
1. Fetch active participants every 5 seconds (polling)
2. Display live participant count
3. Show progress for each student
4. Display security flags (tab switches, device changes)
5. Allow teacher to terminate suspicious attempts

**Monitoring Data:**
```json
{
  "participants": [
    {
      "studentId": "uuid",
      "studentName": "John Doe",
      "status": "in_progress",
      "progress": 65,
      "currentQuestion": 13,
      "totalQuestions": 20,
      "timeRemaining": 1234,
      "flagCount": 0
    }
  ]
}
```

**Success Criteria:**
- ✅ Teacher sees active participants
- ✅ Progress updates in real-time
- ✅ Security flags are visible
- ✅ Teacher can terminate attempts

---

### **Phase 7: Teacher Grading** (Day 9-10)
**Goal:** Manual grading interface for essay/subjective questions

**API Endpoints:**
- `GET /api/v1/grading/quiz/:quizId/pending`
- `POST /api/v1/grading/grade-answer`

**Files:**
- `app/teacher/quiz/[id]/grade/page.tsx`

**Implementation:**
1. Fetch pending manual grading submissions
2. Display student answer + question
3. Provide points input field
4. Provide feedback text area
5. Call grade endpoint on submit
6. Move to next answer automatically

**Grading Payload:**
```json
{
  "answerId": "uuid",
  "pointsAwarded": 8.5,
  "feedback": "Good answer, but missed key concept X"
}
```

**Success Criteria:**
- ✅ Teacher sees pending answers
- ✅ Can grade and provide feedback
- ✅ Bulk grading works
- ✅ Student sees updated score

---

### **Phase 8: Analytics & Reports** (Day 11-12)
**Goal:** Comprehensive analytics dashboards

**API Endpoints:**
- `GET /api/v1/analytics/quiz/:id`
- `GET /api/v1/analytics/quiz/:id/questions`
- `GET /api/v1/analytics/quiz/:id/students`

**Files:**
- `app/teacher/quiz/[id]/results/page.tsx`

**Analytics Data:**
```json
{
  "totalAttempts": 45,
  "completedAttempts": 42,
  "averageScore": 78.5,
  "highestScore": 98,
  "lowestScore": 45,
  "passRate": 85.7,
  "averageTimeMinutes": 34.2,
  "questionStats": [
    {
      "questionId": "uuid",
      "questionText": "What is...?",
      "correctCount": 38,
      "incorrectCount": 7,
      "difficultyScore": 0.84
    }
  ]
}
```

**Implementation:**
1. Fetch analytics data
2. Display overview statistics (cards)
3. Show bar chart for score distribution
4. Show question difficulty analysis
5. Show student performance table
6. Export to CSV/Excel

**Success Criteria:**
- ✅ Analytics display correctly
- ✅ Charts render properly
- ✅ Question difficulty calculated
- ✅ Export works

---

## 🧪 Testing Strategy

### Unit Testing
- Test API client methods
- Test data transformation functions
- Test Zustand store actions

### Integration Testing
1. **Student Flow Test**
   - Login as student
   - View available quizzes
   - Start quiz
   - Answer questions
   - Submit quiz
   - View results

2. **Teacher Flow Test**
   - Login as teacher
   - Create quiz
   - Add questions
   - Publish quiz
   - Assign to section
   - Monitor live quiz
   - Grade submissions
   - View analytics

### Error Handling Tests
- Test network failure scenarios
- Test invalid token scenarios
- Test concurrent session detection
- Test timeout scenarios

---

## 📊 Rollout Plan

### Stage 1: Internal Testing (Week 1-2)
- Implement Phases 1-4 (Student flow)
- Test with 5-10 test accounts
- Fix critical bugs
- Optimize performance

### Stage 2: Teacher Testing (Week 3)
- Implement Phases 5-6 (Teacher builder + monitoring)
- Test with 2-3 teachers
- Gather feedback
- Refine UI/UX

### Stage 3: Pilot (Week 4)
- Implement Phases 7-8 (Grading + analytics)
- Run pilot with 1 class (30 students)
- Monitor system performance
- Fix any issues

### Stage 4: Full Rollout (Week 5+)
- Deploy to all students/teachers
- Monitor system health
- Provide support
- Iterate based on feedback

---

## 🔧 Technical Implementation Notes

### API Client Pattern
```typescript
// lib/api/endpoints/quiz.ts
export const quizApi = {
  student: {
    getAvailableQuizzes: async (filters) => {
      return apiClient.get('/quizzes/available', { params: filters });
    },
    startAttempt: async (quizId) => {
      return apiClient.post(`/quiz-attempts/start/${quizId}`);
    },
    submitAnswer: async (attemptId, data) => {
      return apiClient.post(`/quiz-attempts/${attemptId}/answer`, data);
    },
    submitQuiz: async (attemptId) => {
      return apiClient.post(`/quiz-attempts/${attemptId}/submit`);
    }
  },
  teacher: {
    createQuiz: async (data) => {
      return apiClient.post('/quizzes', data);
    },
    publishQuiz: async (quizId) => {
      return apiClient.post(`/quizzes/${quizId}/publish`);
    }
  }
};
```

### Hook Pattern
```typescript
// hooks/useAvailableQuizzes.ts
export function useAvailableQuizzes(filters?: QuizFilters) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setLoading(true);
        const data = await quizApi.student.getAvailableQuizzes(filters);
        setQuizzes(data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, [filters]);

  return { quizzes, loading, error };
}
```

### Error Handling Pattern
```typescript
try {
  const result = await quizApi.student.startAttempt(quizId);
  // Success
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Redirect to login
      router.push('/guess/portal?role=student');
    } else if (error.status === 403) {
      // Show error: Quiz not available
      toast.error('This quiz is not available to you');
    } else {
      // Generic error
      toast.error(error.message);
    }
  } else {
    // Network error
    toast.error('Network error. Please check your connection.');
  }
}
```

---

## 📝 Key Decisions & Rationale

### 1. Keep Mock Data as Fallback
**Rationale:** If backend is down, app should still be usable for demo purposes.

### 2. Implement Student Flow First
**Rationale:** Students are the primary users. Their experience is critical.

### 3. Use Polling for Monitoring (Not WebSockets)
**Rationale:** Simpler implementation for MVP. WebSockets can be added later.

### 4. Auto-save Every 3 Seconds
**Rationale:** Prevents data loss without overwhelming the server.

### 5. Debounce Answer Submissions
**Rationale:** Reduce API calls while student is still typing.

---

## 🚨 Common Pitfalls to Avoid

1. **Don't break existing UI components**
   - Test each page after changes
   - Use feature flags if needed

2. **Don't assume backend is always available**
   - Always handle loading states
   - Always handle error states

3. **Don't forget authentication**
   - Every API call needs auth token
   - Handle 401 gracefully

4. **Don't ignore TypeScript errors**
   - Fix type mismatches immediately
   - Keep types in sync with backend

5. **Don't skip testing**
   - Test each feature thoroughly
   - Test edge cases

---

## 📞 Support & Resources

- **Backend API Docs:** `http://localhost:3004/api/docs`
- **Database Schema:** `quiz_schema_documentation.md`
- **Backend Implementation:** `QUIZ_MVP_IMPLEMENTATION_SUMMARY.md`
- **Frontend Docs:** `CLAUDE.md`

---

**Last Updated:** 2025-01-05
**Version:** 1.0
**Status:** Ready for Implementation 🚀
