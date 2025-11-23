# Quiz System - File Tree Structure

**Complete visual representation of all quiz-related files**

---

## 📁 Complete File Tree

```
Southville8B-NHS-Edge/
│
├── 📚 DOCUMENTATION (71 files)
│   ├── QUIZ_SYSTEM_COMPLETE_DOCUMENTATION.md
│   ├── QUIZ_SYSTEM_IMPLEMENTATION_GUIDE.md
│   ├── QUIZ_IMPLEMENTATION_CHECKLIST.md
│   ├── QUIZ_MVP_IMPLEMENTATION_SUMMARY.md
│   ├── quiz_schema_documentation.md
│   ├── QUIZ_MONITORING_SYSTEM_PLAN.md
│   ├── QUIZ_MONITORING_RECOMMENDATIONS.md
│   ├── QUIZ_SECURITY_FLAGS_COMPLETE_GUIDE.md
│   ├── QUIZ_MIGRATION_COMPLETE.md
│   ├── QUIZ_MIGRATION_VERIFICATION.md
│   ├── QUIZ_PHASE1_COMPLETE.md
│   ├── QUIZ_PHASE2_COMPLETE.md
│   ├── QUIZ_PHASE3A_TEACHER_LIST_COMPLETE.md
│   ├── QUIZ_PHASE3B_TEACHER_MONITOR_COMPLETE.md
│   ├── QUIZ_PHASE3C_BUILDER_COMPLETE.md
│   ├── QUIZ_PHASE3D_GRADING_COMPLETE.md
│   ├── QUIZ_PHASE3E_ANALYTICS_COMPLETE.md
│   └── [50+ more fix/integration docs]
│
├── 🔧 BACKEND API (core-api-layer/southville-nhs-school-portal-api-layer/)
│   │
│   ├── src/quiz/
│   │   │
│   │   ├── 📁 controllers/ (8 files)
│   │   │   ├── quiz.controller.ts
│   │   │   ├── quiz-attempts.controller.ts
│   │   │   ├── session-management.controller.ts
│   │   │   ├── monitoring.controller.ts
│   │   │   ├── grading.controller.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── question-bank.controller.ts
│   │   │   └── access-control.controller.ts
│   │   │
│   │   ├── 📁 services/ (10 files)
│   │   │   ├── quiz.service.ts
│   │   │   ├── quiz-attempts.service.ts
│   │   │   ├── auto-grading.service.ts
│   │   │   ├── session-management.service.ts
│   │   │   ├── monitoring.service.ts
│   │   │   ├── grading.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── question-bank.service.ts
│   │   │   ├── quiz-cache.service.ts
│   │   │   └── access-control.service.ts
│   │   │
│   │   ├── 📁 dto/ (17 files)
│   │   │   ├── create-quiz.dto.ts
│   │   │   ├── update-quiz.dto.ts
│   │   │   ├── publish-quiz.dto.ts
│   │   │   ├── create-quiz-question.dto.ts
│   │   │   ├── create-quiz-choice.dto.ts
│   │   │   ├── create-quiz-settings.dto.ts
│   │   │   ├── start-quiz-attempt.dto.ts
│   │   │   ├── submit-answer.dto.ts
│   │   │   ├── update-progress.dto.ts
│   │   │   ├── grade-answer.dto.ts
│   │   │   ├── create-flag.dto.ts
│   │   │   ├── assign-quiz-to-sections.dto.ts
│   │   │   ├── create-question-bank.dto.ts
│   │   │   ├── update-question-bank.dto.ts
│   │   │   ├── import-question.dto.ts
│   │   │   ├── generate-access-link.dto.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 entities/ (6 files)
│   │   │   ├── quiz.entity.ts
│   │   │   ├── quiz-question.entity.ts
│   │   │   ├── quiz-choice.entity.ts
│   │   │   ├── quiz-settings.entity.ts
│   │   │   ├── quiz-attempt.entity.ts
│   │   │   └── question-bank.entity.ts
│   │   │
│   │   ├── 📁 gateways/ (empty - for WebSocket future)
│   │   ├── 📁 guards/ (empty - uses shared guards)
│   │   │
│   │   └── quiz.module.ts
│   │
│   └── quiz_system_tables.sql
│
├── 🎨 FRONTEND (frontend-nextjs/)
│   │
│   ├── app/
│   │   │
│   │   ├── 📁 student/quiz/
│   │   │   ├── page.tsx                    ✅ API Integrated
│   │   │   ├── loading.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx                ✅ API Integrated
│   │   │   └── [attemptId]/results/
│   │   │       └── page.tsx                ✅ API Integrated
│   │   │
│   │   └── 📁 teacher/quiz/
│   │       ├── page.tsx                    ✅ API Integrated
│   │       ├── loading.tsx
│   │       ├── builder/
│   │       │   └── page.tsx               ✅ API Integrated
│   │       ├── create/
│   │       │   └── page.tsx
│   │       └── [id]/
│   │           ├── edit/
│   │           │   └── page.tsx            ✅ API Integrated
│   │           ├── monitor/
│   │           │   └── page.tsx            ✅ API Integrated
│   │           ├── grade/
│   │           │   └── page.tsx            ✅ API Integrated
│   │           └── results/
│   │               └── page.tsx            ✅ API Integrated
│   │
│   ├── components/
│   │   └── 📁 quiz/ (25+ files)
│   │       ├── quiz-renderer.tsx
│   │       ├── form-mode-renderer.tsx
│   │       ├── sequential-mode-renderer.tsx
│   │       ├── hybrid-mode-renderer.tsx
│   │       ├── multiple-choice-quiz.tsx
│   │       ├── multiple-choice-question.tsx
│   │       ├── checkbox-quiz.tsx
│   │       ├── true-false-quiz.tsx
│   │       ├── true-false-question.tsx
│   │       ├── short-answer-quiz.tsx
│   │       ├── short-answer-question.tsx
│   │       ├── paragraph-quiz.tsx
│   │       ├── essay-question.tsx
│   │       ├── fill-in-blank-quiz.tsx
│   │       ├── dropdown-quiz.tsx
│   │       ├── linear-scale-quiz.tsx
│   │       ├── matching-pair-quiz.tsx
│   │       ├── ordering-quiz.tsx
│   │       ├── drag-and-drop-quiz.tsx
│   │       ├── multiple-choice-grid-quiz.tsx
│   │       ├── checkbox-grid-quiz.tsx
│   │       ├── quiz-submission-dialog.tsx
│   │       ├── fullscreen-warning-dialog.tsx
│   │       ├── time-up-dialog.tsx
│   │       └── SectionAssignmentModal.tsx
│   │
│   ├── hooks/
│   │   ├── useQuiz.ts
│   │   ├── useQuizAttempt.ts              ✅ Core hook
│   │   ├── useQuizSession.ts
│   │   ├── useQuizProgress.ts
│   │   ├── useQuizFlags.ts
│   │   ├── useQuizMonitoring.ts
│   │   ├── useAvailableQuizzes.ts         ✅ Core hook
│   │   └── useHeartbeat.ts                ✅ Core hook
│   │
│   ├── lib/
│   │   │
│   │   ├── 📁 api/
│   │   │   ├── 📁 endpoints/
│   │   │   │   └── quiz.ts                ✅ API client
│   │   │   ├── 📁 types/
│   │   │   │   └── quiz.ts                ✅ Types
│   │   │   └── 📁 helpers/
│   │   │       └── quiz-converters.ts      ✅ Data transformers
│   │   │
│   │   ├── 📁 stores/
│   │   │   ├── quiz-store.ts              ✅ Zustand store
│   │   │   └── quiz-attempt-store.ts      ✅ Zustand store
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── quiz-type-mapper.ts
│   │   │   └── quiz-validation.ts
│   │   │
│   │   ├── 📁 hooks/
│   │   │   └── useQuizBuilderAPI.ts
│   │   │
│   │   ├── quizData.ts                    (Mock data fallback)
│   │   └── quizRenderer.ts
│   │
│   ├── types/
│   │   ├── quiz.ts                        ✅ Main types
│   │   └── quiz.d.ts                      ✅ Additional types
│   │
│   └── constants/
│       └── quizTypes.ts
│
└── 🗄️ DATABASE (Supabase)
    │
    └── Tables (21 total)
        ├── Core: quizzes, question_bank, quiz_questions, quiz_choices
        ├── Config: quiz_settings, quiz_section_settings
        ├── Execution: quiz_attempts, quiz_active_sessions, quiz_participants
        ├── Answers: quiz_session_answers, quiz_student_answers
        ├── Security: quiz_device_sessions, quiz_flags, quiz_activity_logs
        ├── Analytics: quiz_analytics, quiz_question_stats
        └── Access: quiz_access_links, quiz_access_logs
```

---

## 🎯 Key File Locations by Feature

### Student Quiz Taking
```
frontend-nextjs/
├── app/student/quiz/
│   ├── page.tsx                    # Dashboard
│   └── [id]/page.tsx              # Quiz taking
│
├── hooks/
│   ├── useQuizAttempt.ts          # Start/submit quiz
│   └── useHeartbeat.ts            # Session management
│
└── lib/stores/
    └── quiz-attempt-store.ts      # Quiz state
```

### Teacher Quiz Builder
```
frontend-nextjs/
├── app/teacher/quiz/
│   ├── builder/page.tsx           # Builder UI
│   └── [id]/edit/page.tsx        # Edit quiz
│
├── lib/stores/
│   └── quiz-store.ts              # Builder state
│
└── lib/hooks/
    └── useQuizBuilderAPI.ts       # Builder API
```

### Teacher Monitoring
```
frontend-nextjs/
├── app/teacher/quiz/[id]/monitor/page.tsx
│
├── hooks/
│   └── useQuizMonitoring.ts      # Monitoring data
│
└── backend/
    └── services/monitoring.service.ts
```

### Grading System
```
frontend-nextjs/
├── app/teacher/quiz/[id]/grade/page.tsx
│
└── backend/
    ├── services/auto-grading.service.ts
    └── services/grading.service.ts
```

### Analytics
```
frontend-nextjs/
├── app/teacher/quiz/[id]/results/page.tsx
│
└── backend/
    └── services/analytics.service.ts
```

---

## 📊 File Count by Category

| Category | Count | Status |
|----------|-------|--------|
| Documentation | 71 | ✅ Complete |
| Backend Controllers | 8 | ✅ Complete |
| Backend Services | 10 | ✅ Complete |
| Backend DTOs | 17 | ✅ Complete |
| Backend Entities | 6 | ✅ Complete |
| Frontend Pages | 12 | ✅ 85% Complete |
| Frontend Components | 25+ | ✅ Complete |
| Frontend Hooks | 8 | ✅ Complete |
| Database Tables | 21 | ✅ Complete |
| **TOTAL** | **~193** | **✅ 85% Complete** |

---

## 🔍 Quick File Finder

### Need to find...

**Quiz creation logic?**
→ `backend/services/quiz.service.ts`

**Auto-grading?**
→ `backend/services/auto-grading.service.ts`

**Student quiz page?**
→ `frontend/app/student/quiz/[id]/page.tsx`

**Quiz builder?**
→ `frontend/app/teacher/quiz/builder/page.tsx`

**Monitoring dashboard?**
→ `frontend/app/teacher/quiz/[id]/monitor/page.tsx`

**Database schema?**
→ `quiz_schema_documentation.md`

**API endpoints?**
→ `backend/controllers/quiz.controller.ts`

**Question components?**
→ `frontend/components/quiz/`

**State management?**
→ `frontend/lib/stores/quiz-*.ts`

**API client?**
→ `frontend/lib/api/endpoints/quiz.ts`

---

## 🚀 Development Workflow

### Adding a New Question Type

1. **Backend**: Add to `auto-grading.service.ts`
2. **Frontend**: Create component in `components/quiz/`
3. **Frontend**: Add to `quiz-renderer.tsx`
4. **Types**: Update `types/quiz.ts`
5. **Documentation**: Update schema docs

### Adding a New Feature

1. **Backend**: Create service in `services/`
2. **Backend**: Create controller in `controllers/`
3. **Backend**: Create DTOs in `dto/`
4. **Frontend**: Create page/component
5. **Frontend**: Create hook in `hooks/`
6. **Frontend**: Add API endpoint in `lib/api/endpoints/quiz.ts`
7. **Documentation**: Update relevant docs

---

**Last Updated**: 2025-01-15  
**Use this as a navigation guide for the entire quiz system**








