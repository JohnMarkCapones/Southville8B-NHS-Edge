# Quiz System Implementation Checklist
**Quick Reference for Implementation Progress**

---

## 🔍 Pre-Implementation Verification

### Backend Status
- [ ] Backend server running on `http://localhost:3004`
- [ ] Can access Swagger docs at `http://localhost:3004/api/docs`
- [ ] All 21 database tables created in Supabase
- [ ] Test endpoint responds: `curl http://localhost:3004/api/v1/health`

### Frontend Configuration
- [ ] `.env.local` has correct API URL (port 3004)
- [ ] `npm install` completed successfully
- [ ] Dev server runs on port 3000
- [ ] Can navigate to existing quiz pages

### Authentication Test
- [ ] Can log in as student
- [ ] Can log in as teacher
- [ ] JWT token appears in browser cookies (`sb-access-token`)
- [ ] API client sends Authorization header

### Quick Test Commands
```bash
# Backend health check
curl http://localhost:3004/api/v1/health

# Test authenticated endpoint (replace TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3004/api/v1/users/me

# Start frontend
cd frontend-nextjs && npm run dev
```

---

## 📋 Phase 1: Foundation & Connectivity

### Task 1.1: Test Backend Connection
- [ ] Create test utility: `lib/api/__tests__/connectivity-test.ts`
- [ ] Test GET request to `/health`
- [ ] Test authenticated GET to `/users/me`
- [ ] Verify CORS headers in response
- [ ] Verify cookies are sent with requests
- [ ] Document any connection issues

### Task 1.2: Verify API Client
- [ ] Check `lib/api/client.ts` configuration
- [ ] Verify `buildApiUrl()` generates correct URLs
- [ ] Test error handling (404, 401, 500)
- [ ] Confirm timeout settings (60 seconds)
- [ ] Test with and without auth token

**Success Criteria:**
✅ Frontend connects to backend without errors
✅ Auth headers sent correctly
✅ Error responses handled gracefully

---

## 📋 Phase 2: Student Quiz List

### Task 2.1: Create API Hook
- [ ] Create `hooks/useAvailableQuizzes.ts`
- [ ] Implement loading state
- [ ] Implement error state
- [ ] Implement data fetching
- [ ] Add pagination support
- [ ] Add filter by subject support

### Task 2.2: Integrate with Quiz List Page
**File:** `app/student/quiz/page.tsx`

- [ ] Import `useAvailableQuizzes` hook
- [ ] Replace mock `liveQuizzes` array
- [ ] Handle loading state (skeleton loader)
- [ ] Handle error state (error message)
- [ ] Handle empty state (no quizzes)
- [ ] Keep mock data as fallback
- [ ] Test with real data from backend

### Task 2.3: Test Quiz Filtering
- [ ] Test "Live" tab filter
- [ ] Test "Scheduled" tab filter
- [ ] Test subject filter dropdown
- [ ] Test search functionality
- [ ] Test pagination (page 1, 2, etc.)
- [ ] Verify only assigned quizzes show

**Success Criteria:**
✅ Student sees real quizzes from database
✅ Filtering works correctly
✅ Loading/error states display properly
✅ UI matches existing design

---

## 📋 Phase 3: Student Quiz Taking

### Task 3.1: Start Quiz Attempt
**File:** `app/student/quiz/[id]/page.tsx`

- [ ] Create `hooks/useQuizAttempt.ts`
- [ ] Call `POST /quiz-attempts/start/:quizId` on "Join Quiz"
- [ ] Store `attemptId` in Zustand store
- [ ] Store `sessionId` in Zustand store
- [ ] Load questions from API response
- [ ] Initialize timer with `timeLimit` from response
- [ ] Show quiz instructions modal
- [ ] Disable browser back button during quiz

### Task 3.2: Answer Submission (Auto-save)
- [ ] Implement debounced auto-save (2 seconds)
- [ ] Call `POST /quiz-attempts/:attemptId/answer`
- [ ] Handle different question types:
  - [ ] Multiple Choice (`choice_id`)
  - [ ] Checkbox (`choice_ids`)
  - [ ] True/False (`choice_id`)
  - [ ] Short Answer (`answer_text`)
  - [ ] Essay (`answer_text`)
  - [ ] Fill in Blank (`answer_text`)
  - [ ] Matching (`answer_json`)
  - [ ] Ordering (`answer_json`)
- [ ] Show "Saving..." indicator
- [ ] Handle save errors (retry logic)
- [ ] Store in Zustand for offline draft

### Task 3.3: Quiz Submission & Results
- [ ] Show confirmation dialog before submit
- [ ] Call `POST /quiz-attempts/:attemptId/submit`
- [ ] Handle auto-grading response
- [ ] Display score immediately
- [ ] Show questions needing manual grading
- [ ] Navigate to results page
- [ ] Clear quiz state from store
- [ ] Prevent double submission

### Task 3.4: Results Page
- [ ] Create results page component
- [ ] Fetch attempt details from API
- [ ] Display final score
- [ ] Show correct/incorrect answers
- [ ] Show question-by-question breakdown
- [ ] Show teacher feedback (if available)
- [ ] Add "Review Quiz" button
- [ ] Add "Retake Quiz" button (if allowed)

**Success Criteria:**
✅ Student can start quiz
✅ Answers auto-save every 2 seconds
✅ Quiz submits successfully
✅ Score displays correctly
✅ Results page shows all details

---

## 📋 Phase 4: Session Management

### Task 4.1: Heartbeat Implementation
- [ ] Create `hooks/useQuizSession.ts`
- [ ] Send heartbeat every 30 seconds
- [ ] Include device fingerprint
- [ ] Include current question index
- [ ] Include answered count
- [ ] Handle heartbeat failure
- [ ] Warn if session invalid

### Task 4.2: Session Validation
- [ ] Validate session on quiz start
- [ ] Check for duplicate sessions
- [ ] Detect device changes
- [ ] Detect IP changes
- [ ] Track tab switches
- [ ] Show warning on tab switch
- [ ] Terminate if too many violations

### Task 4.3: Device Fingerprinting
- [ ] Generate device fingerprint on mount
- [ ] Include browser info
- [ ] Include screen resolution
- [ ] Store in session storage
- [ ] Send with every heartbeat

**Success Criteria:**
✅ Heartbeat sent every 30 seconds
✅ Session tracked correctly
✅ Tab switches detected
✅ Device changes detected
✅ Student warned about violations

---

## 📋 Phase 5: Teacher Quiz Builder

### Task 5.1: Create Quiz API
**File:** `app/teacher/quiz/builder/page.tsx`

- [ ] Call `POST /quizzes` on "Save Draft"
- [ ] Store returned `quiz_id`
- [ ] Implement auto-save (every 3 seconds)
- [ ] Show "Last saved" timestamp
- [ ] Handle save errors
- [ ] Validate quiz data before save

### Task 5.2: Add Questions API
- [ ] Call `POST /quizzes/:id/questions` per question
- [ ] Store returned `question_id`
- [ ] Handle all question types (15+)
- [ ] Save choices for MCQ/Checkbox
- [ ] Save correct answers
- [ ] Support question reordering
- [ ] Support question deletion

### Task 5.3: Update Existing Questions
- [ ] Call `PATCH /quizzes/:id/questions/:questionId`
- [ ] Handle partial updates
- [ ] Debounce update calls
- [ ] Show save status per question

### Task 5.4: Quiz Settings
- [ ] Create settings form
- [ ] Call `POST /quizzes/:id/settings`
- [ ] Configure security settings
- [ ] Configure proctoring settings
- [ ] Configure grading settings
- [ ] Save settings separately

### Task 5.5: Publish Quiz
- [ ] Validate quiz completeness
- [ ] Show validation errors
- [ ] Call `POST /quizzes/:id/publish`
- [ ] Update quiz status to "published"
- [ ] Show success modal

### Task 5.6: Assign to Sections
- [ ] Fetch available sections
- [ ] Create section selection dialog
- [ ] Call `POST /quizzes/:id/assign-sections`
- [ ] Set custom start/end dates per section
- [ ] Set custom time limit per section
- [ ] Generate access link
- [ ] Generate QR code
- [ ] Show link/QR in modal

**Success Criteria:**
✅ Teacher can create quiz
✅ Questions save correctly
✅ Auto-save works
✅ Quiz publishes successfully
✅ Sections assigned correctly
✅ Access link generated

---

## 📋 Phase 6: Teacher Monitoring

### Task 6.1: Active Participants Dashboard
**File:** `app/teacher/quiz/[id]/monitor/page.tsx`

- [ ] Poll `GET /quiz-monitoring/quiz/:id/participants` every 5s
- [ ] Display live participant count
- [ ] Show student list with:
  - [ ] Name
  - [ ] Progress percentage
  - [ ] Current question
  - [ ] Time remaining
  - [ ] Flag count
  - [ ] Status (in_progress, completed)
- [ ] Update UI in real-time
- [ ] Add refresh button

### Task 6.2: Security Flags Dashboard
- [ ] Fetch `GET /quiz-monitoring/quiz/:id/flags`
- [ ] Display flags per student:
  - [ ] Tab switches
  - [ ] Device changes
  - [ ] IP changes
  - [ ] Idle time
- [ ] Color-code by severity
- [ ] Add filter by flag type

### Task 6.3: Terminate Attempts
- [ ] Add "Terminate" button per student
- [ ] Show confirmation dialog
- [ ] Call `POST /quiz-monitoring/attempt/:id/terminate`
- [ ] Provide termination reason
- [ ] Update UI immediately
- [ ] Log termination event

**Success Criteria:**
✅ Teacher sees active participants
✅ Data updates every 5 seconds
✅ Security flags visible
✅ Can terminate suspicious attempts
✅ UI is responsive and fast

---

## 📋 Phase 7: Teacher Grading

### Task 7.1: Pending Grading List
**File:** `app/teacher/quiz/[id]/grade/page.tsx`

- [ ] Fetch pending answers
- [ ] Group by student
- [ ] Show question requiring grading
- [ ] Display student answer
- [ ] Show question details

### Task 7.2: Manual Grading Interface
- [ ] Display student answer (text/file)
- [ ] Show max points for question
- [ ] Add points input field
- [ ] Add feedback textarea
- [ ] Add "Grade" button
- [ ] Add "Skip" button
- [ ] Call `POST /grading/grade-answer`

### Task 7.3: Bulk Grading
- [ ] Add "Grade All as [X] points" option
- [ ] Show batch grading confirmation
- [ ] Call `POST /grading/bulk-grade`
- [ ] Update UI for all graded answers

### Task 7.4: Grading Progress
- [ ] Show graded count / total count
- [ ] Show progress bar
- [ ] Filter by graded/ungraded
- [ ] Navigate to next ungraded answer

**Success Criteria:**
✅ Teacher sees pending answers
✅ Can grade individual answers
✅ Bulk grading works
✅ Feedback saves correctly
✅ Student sees updated score

---

## 📋 Phase 8: Analytics & Reports

### Task 8.1: Quiz Analytics Overview
**File:** `app/teacher/quiz/[id]/results/page.tsx`

- [ ] Fetch `GET /analytics/quiz/:id`
- [ ] Display overview cards:
  - [ ] Total attempts
  - [ ] Average score
  - [ ] Highest score
  - [ ] Lowest score
  - [ ] Pass rate
  - [ ] Average time
- [ ] Add date range filter

### Task 8.2: Score Distribution Chart
- [ ] Prepare data for chart
- [ ] Use Recharts library
- [ ] Show bar chart of score ranges
- [ ] Add tooltip with count
- [ ] Make chart responsive

### Task 8.3: Question Analytics
- [ ] Fetch `GET /analytics/quiz/:id/questions`
- [ ] Display table with:
  - [ ] Question text
  - [ ] Correct count
  - [ ] Incorrect count
  - [ ] Difficulty score
  - [ ] Discrimination index
- [ ] Sort by difficulty
- [ ] Highlight problematic questions

### Task 8.4: Student Performance Table
- [ ] Fetch `GET /analytics/quiz/:id/students`
- [ ] Display table with:
  - [ ] Student name
  - [ ] Score
  - [ ] Percentage
  - [ ] Time taken
  - [ ] Attempt count
  - [ ] Status
- [ ] Add sorting by column
- [ ] Add search/filter

### Task 8.5: Export Functionality
- [ ] Add "Export to CSV" button
- [ ] Generate CSV from analytics data
- [ ] Include all student results
- [ ] Include question statistics
- [ ] Download file automatically

**Success Criteria:**
✅ Analytics display correctly
✅ Charts render properly
✅ Data is accurate
✅ Export works
✅ UI is informative

---

## 🧪 Testing Checklist

### Student Flow Testing
- [ ] Login as student works
- [ ] Can see available quizzes
- [ ] Can start quiz
- [ ] Can answer all question types
- [ ] Answers auto-save
- [ ] Can submit quiz
- [ ] Results display correctly
- [ ] Can review quiz (if allowed)

### Teacher Flow Testing
- [ ] Login as teacher works
- [ ] Can create quiz
- [ ] Can add all question types
- [ ] Can edit questions
- [ ] Can configure settings
- [ ] Can publish quiz
- [ ] Can assign to sections
- [ ] Can monitor live quiz
- [ ] Can grade submissions
- [ ] Can view analytics

### Error Handling Testing
- [ ] Backend offline (show error)
- [ ] Network timeout (retry)
- [ ] Invalid token (redirect to login)
- [ ] Quiz not found (404)
- [ ] Permission denied (403)
- [ ] Validation errors (show message)

### Edge Cases Testing
- [ ] Quiz with no questions
- [ ] Quiz with 100+ questions
- [ ] Multiple concurrent sessions
- [ ] Browser refresh during quiz
- [ ] Tab close during quiz
- [ ] Network drop during quiz
- [ ] Timer expiration during submission

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Bundle size acceptable
- [ ] Lighthouse score > 90
- [ ] Accessibility checked
- [ ] Mobile responsive

### Backend Verification
- [ ] Database migrations applied
- [ ] Indexes created
- [ ] RLS policies configured
- [ ] API rate limits set
- [ ] CORS configured
- [ ] Environment variables set

### Production Deployment
- [ ] Build frontend (`npm run build`)
- [ ] Test production build locally
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Monitor logs for errors
- [ ] Verify key features work

---

## 📊 Progress Tracking

### Overall Progress: 0% Complete

**Phase 1:** [ ] Foundation (0/2 tasks)
**Phase 2:** [ ] Student List (0/3 tasks)
**Phase 3:** [ ] Quiz Taking (0/4 tasks)
**Phase 4:** [ ] Session Mgmt (0/3 tasks)
**Phase 5:** [ ] Teacher Builder (0/6 tasks)
**Phase 6:** [ ] Monitoring (0/3 tasks)
**Phase 7:** [ ] Grading (0/4 tasks)
**Phase 8:** [ ] Analytics (0/5 tasks)

**Total:** 0/30 major tasks complete

---

## 📝 Daily Progress Log

### Day 1: ___________
- [ ] Task completed:
- [ ] Blockers:
- [ ] Notes:

### Day 2: ___________
- [ ] Task completed:
- [ ] Blockers:
- [ ] Notes:

### Day 3: ___________
- [ ] Task completed:
- [ ] Blockers:
- [ ] Notes:

---

**Last Updated:** 2025-01-05
**Version:** 1.0
**Status:** Ready to Start ✅
