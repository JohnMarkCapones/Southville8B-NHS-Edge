# Quiz System - Complete Documentation

**Version**: 2.0 (Final - Ready for Implementation)
**Last Updated**: 2025-10-17
**Project**: Southville NHS School Portal - Quiz Module
**Status**: ✅ All Architecture Decisions Finalized

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Core Features](#2-core-features)
3. [Database Schema](#3-database-schema)
4. [Data Flow & Business Logic](#4-data-flow--business-logic)
5. [API Endpoints](#5-api-endpoints)
6. [Security & Anti-Cheating](#6-security--anti-cheating)
7. [Real-Time Monitoring](#7-real-time-monitoring)
8. [Security, Caching & Performance](#8-security-caching--performance)
9. [Question Types](#9-question-types)
10. [Grading System](#10-grading-system)
11. [Implementation Phases](#11-implementation-phases)
12. [Final Architecture Decisions](#12-final-architecture-decisions)
13. [Technology Stack & Implementation Readiness](#13-technology-stack--implementation-readiness)

---

## 1. System Overview

### 1.1 Purpose

A comprehensive quiz system for teachers and students with:
- **Teacher Features**: Quiz builder, question bank, live monitoring, grading
- **Student Features**: Secure quiz taking, real-time feedback, progress tracking
- **Admin Features**: Analytics, reporting, anti-cheating detection

### 1.2 Key Capabilities

- **Multiple Quiz Types**: Form (Google Form style), Sequential (one-at-a-time), Mixed
- **Rich Question Types**: MCQ, Checkbox, True/False, Short Answer, Essay, Fill-in-blank, Matching, Drag-drop, Ordering, Dropdown, Linear Scale
- **Security**: Device tracking, IP monitoring, tab switch detection, full-screen enforcement
- **Flexibility**: Question pools, randomization, per-section deadlines, retakes
- **Real-time**: Live student monitoring, instant flagging, remote quiz termination

---

## 2. Core Features

### 2.1 Quiz Creation & Publishing

#### Quiz Modes
1. **Form Mode**: All questions on one page (like Google Forms)
2. **Sequential Mode**: One question at a time
3. **Mixed Mode**: Combination of both

#### Publishing Options
- **Immediate**: Quiz available instantly upon publishing
- **Scheduled**: Quiz available between `start_date` and `end_date`
  - Students see countdown before `start_date`
  - Hard deadline at `end_date` (no access after)
  - No grace period or late submissions

#### Visibility & Access
- **Public**: Any authenticated student can access
- **Section-Only**: Restricted to assigned sections
- Both modes support:
  - Shareable links (expires at quiz `end_date`)
  - QR codes (expires at quiz `end_date`)

#### Quiz Builder Auto-Save
- **Immediate save**: Every new question added → saved as draft
- **Debounce save**: 15 seconds after last keystroke (keystroke-based debounce)
- **Manual save**: Explicit "Save" button
- **Status flow**: `draft` → `published` → `archived`

#### Quiz Versioning
- Teachers can edit published quizzes
- Editing creates **new version** (old version preserved)
- **Version visibility logic**:
  - Students who already started quiz → see old version (version locked on attempt creation)
  - New students → see latest version
  - Version at assignment time is preserved per student's first attempt

---

### 2.2 Question Pool & Randomization

#### Question Pool Configuration
- Teachers create pool of N questions (e.g., 50)
- Quiz shows M questions (e.g., 20)
- **Storage location**:
  - `quizzes` table: `question_pool_size` (50), `questions_to_display` (20)
  - All 50 questions stored in `quiz_questions` with `is_pool_question: true`

#### Randomization Strategy
- **Per attempt**: Each attempt gets different random 20 questions
- **Shuffle questions**: Configurable toggle per quiz
- **Shuffle choices**: Configurable toggle per quiz
- Both shuffles happen per attempt (not per student)

#### Question Bank (Reusable Templates)
- **Separate table**: `question_bank`
- Teachers can import questions from bank into quiz
- Imported questions become **copies** (editing doesn't affect original)
- **Sharing policy**: Teacher-specific only (no cross-teacher sharing)
- Each teacher maintains their own question bank

---

### 2.3 Student Attempt & Retake Logic

#### Attempt Configuration
- **Retakes**: Teacher-controlled toggle
  - **Enabled**: Unlimited attempts
  - **Disabled**: Single attempt only
- **Scoring**: Average of all attempts
- **No cooldown** between attempts
- **No answer reset**: Students don't see previous answers on retake (fresh start)

#### Auto-Save During Quiz
- **Trigger 1**: Every 2 questions answered
- **Trigger 2**: Every 20 seconds (whichever comes first)
- **Storage**: `quiz_session_answers` (temporary table)
- **Final submission**: Moved to `quiz_student_answers`

#### Auto-Submission Rules
1. **Quiz time limit reached**: Auto-submit all answered questions
2. **Per-question time limit reached**: Auto-submit blank for that question, move to next
3. **Quiz end_date reached**: Auto-submit current progress
4. **Teacher remote termination**: Mark as `terminated_by_teacher`, still graded

#### Offline Handling & Auto-Recovery

**Problem**: Student loses internet connection during quiz

**Solution**: localStorage + Auto-Sync

**Implementation**:
```typescript
// Frontend: Save answers to localStorage + server
async function saveAnswer(questionId: string, answer: any) {
  // 1. Save to localStorage immediately (works offline)
  const localAnswers = JSON.parse(localStorage.getItem('quiz_answers') || '{}');
  localAnswers[questionId] = {
    answer,
    timestamp: new Date().toISOString(),
    synced: false
  };
  localStorage.setItem('quiz_answers', JSON.stringify(localAnswers));

  // 2. Try to save to server
  try {
    await fetch('/api/v1/quizzes/:id/answer', {
      method: 'POST',
      body: JSON.stringify({ questionId, answer })
    });
    // Mark as synced
    localAnswers[questionId].synced = true;
    localStorage.setItem('quiz_answers', JSON.stringify(localAnswers));
  } catch (error) {
    // Offline - answer stays in localStorage
    console.log('Offline, will sync later');
  }
}

// On reconnection: Sync unsynced answers
window.addEventListener('online', async () => {
  const localAnswers = JSON.parse(localStorage.getItem('quiz_answers') || '{}');

  for (const [questionId, data] of Object.entries(localAnswers)) {
    if (!data.synced) {
      await saveAnswerToServer(questionId, data.answer);
      data.synced = true;
    }
  }

  localStorage.setItem('quiz_answers', JSON.stringify(localAnswers));
});
```

**Conflict Resolution**: Last-write-wins (server timestamp comparison)

**Edge Cases**:
- **Connection restored during quiz**: Auto-sync unsynced answers
- **Connection lost, then quiz expires**: Sync on reconnection (server validates deadline)
- **Browser crash**: Answers in localStorage persist, sync on reload

---

### 2.4 Time Limits

#### Quiz-Level Time Limit
- `quizzes.time_limit` (minutes)
- Countdown timer shown to student
- Auto-submit when expires

#### Per-Question Time Limit
- `quiz_questions.time_limit_seconds` (nullable)
- If set, question auto-advances to next when expired
- Unanswered question saved as blank/null
- **No whole quiz auto-submit** (just that question)

---

### 2.5 Navigation & Backtracking

#### Backtracking Control
- `quizzes.allow_backtracking` (boolean)
- **Enabled**: Students can navigate back to previous questions
- **Disabled**: Sequential only, answers locked after moving forward

#### Applicable Modes
- **Form mode**: Backtracking always allowed (all questions visible)
- **Sequential mode**: Controlled by `allow_backtracking`
- **Mixed mode**: Per-section setting

---

### 2.6 Section-Based Assignment

#### Multi-Section Support
- Single quiz can be assigned to multiple sections
- Table: `quiz_sections` (quiz_id, section_id)

#### Per-Section Configuration
- **Table**: `quiz_section_settings`
  ```
  id, quiz_id, section_id,
  start_date, end_date, time_limit_override
  ```
- Each section can have different:
  - Start date/time
  - End date/time (deadline)
  - Time limit override (optional)

---

## 3. Database Schema

### 3.1 Core Quiz Tables

#### `quizzes`
```sql
CREATE TABLE quizzes (
  quiz_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES teachers(id),

  -- Quiz behavior
  type VARCHAR(50) DEFAULT 'form', -- 'form', 'sequential', 'mixed'
  grading_type VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual', 'hybrid'

  -- Timing
  time_limit INT, -- minutes, nullable
  start_date TIMESTAMP, -- nullable (null = immediate)
  end_date TIMESTAMP,

  -- Status & versioning
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived', 'scheduled'
  version INT DEFAULT 1,
  parent_quiz_id UUID REFERENCES quizzes(quiz_id), -- for versioning

  -- Visibility
  visibility VARCHAR(20) DEFAULT 'section_only', -- 'public', 'section_only'

  -- Question pool
  question_pool_size INT, -- total questions in pool
  questions_to_display INT, -- questions shown per attempt

  -- Settings
  allow_retakes BOOLEAN DEFAULT false,
  allow_backtracking BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_choices BOOLEAN DEFAULT false,

  -- Points
  total_points DECIMAL(6,2),
  passing_score DECIMAL(6,2), -- optional

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_sections` (Assignment)
```sql
CREATE TABLE quiz_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  section_id BIGINT REFERENCES sections(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(quiz_id, section_id)
);
```

#### `quiz_section_settings` (Per-Section Overrides)
```sql
CREATE TABLE quiz_section_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  section_id BIGINT REFERENCES sections(id),

  -- Override settings
  start_date TIMESTAMP, -- overrides quiz.start_date
  end_date TIMESTAMP, -- overrides quiz.end_date
  time_limit_override INT, -- overrides quiz.time_limit

  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(quiz_id, section_id)
);
```

#### `quiz_settings` (Security & UI Settings)
```sql
CREATE TABLE quiz_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,

  -- Security settings (frontend-enforced, backend-flagged)
  lockdown_browser BOOLEAN DEFAULT false, -- browser-only access
  anti_screenshot BOOLEAN DEFAULT false, -- frontend warning
  disable_copy_paste BOOLEAN DEFAULT false,
  disable_right_click BOOLEAN DEFAULT false,
  require_fullscreen BOOLEAN DEFAULT false,

  -- Monitoring
  track_tab_switches BOOLEAN DEFAULT true,
  track_device_changes BOOLEAN DEFAULT true,
  track_ip_changes BOOLEAN DEFAULT true,
  tab_switch_warning_threshold INT DEFAULT 3, -- warn after X switches

  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(quiz_id)
);
```

---

### 3.2 Question Tables

#### `question_bank` (Reusable Templates)
```sql
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id),

  -- Question content
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'checkbox', etc.

  -- Metadata
  subject_id UUID REFERENCES subjects(id),
  topic VARCHAR(255),
  difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
  tags TEXT[], -- array of tags

  -- Points (default, can be overridden when imported)
  default_points DECIMAL(5,2) DEFAULT 1,

  -- Choices (JSON for flexibility)
  choices JSONB, -- [{text: "...", is_correct: true, order: 1}, ...]
  correct_answer JSONB, -- For complex types (matching, ordering, etc.)

  -- Settings
  allow_partial_credit BOOLEAN DEFAULT false,
  time_limit_seconds INT, -- nullable

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_questions`
```sql
CREATE TABLE quiz_questions (
  question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,

  -- Question content
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,

  -- Ordering
  order_index INT NOT NULL,

  -- Points
  points DECIMAL(5,2) NOT NULL DEFAULT 1,
  allow_partial_credit BOOLEAN DEFAULT false,

  -- Timing
  time_limit_seconds INT, -- nullable, per-question time

  -- Question pool
  is_pool_question BOOLEAN DEFAULT false, -- true if part of randomization pool

  -- Source tracking (if imported from question bank)
  source_question_bank_id UUID REFERENCES question_bank(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_choices`
```sql
CREATE TABLE quiz_choices (
  choice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES quiz_questions(question_id) ON DELETE CASCADE,

  choice_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INT,

  -- For complex types (matching, drag-drop)
  metadata JSONB, -- {pair_id: "A", position: 1, etc.}

  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_question_metadata` (For Complex Question Types)
```sql
-- For complex question types: matching, ordering, drag-drop, fill-in-blank
-- Separate table approach for better organization and type-specific validation

CREATE TABLE quiz_question_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES quiz_questions(question_id) ON DELETE CASCADE,

  -- Metadata type
  metadata_type VARCHAR(50) NOT NULL, -- 'matching_pairs', 'ordering_items', 'drag_drop_zones', 'fill_in_blanks'

  -- Flexible metadata storage
  metadata JSONB NOT NULL,
  -- Examples:
  -- Matching: {pairs: [{left: "A", right: "1", correct_match: "X"}, ...]}
  -- Ordering: {items: [{text: "Step 1", correct_order: 1}, ...]}
  -- Drag-drop: {zones: [{id: "zone1", accepts: ["item1"]}, ...]}
  -- Fill-in-blank: {blanks: [{position: 1, correct_answers: ["..."], case_sensitive: false}, ...]}

  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_id) -- one metadata record per question
);
```

---

### 3.3 Student Attempt Tables

#### `quiz_attempts`
```sql
CREATE TABLE quiz_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID REFERENCES students(student_id),

  attempt_number INT NOT NULL,
  score DECIMAL(6,2),
  max_possible_score DECIMAL(6,2), -- denormalized for historical accuracy

  -- Status
  status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'submitted', 'graded', 'terminated'
  terminated_by_teacher BOOLEAN DEFAULT false,
  termination_reason TEXT,

  -- Timing
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  time_taken_seconds INT, -- calculated on submission

  -- Questions shown (snapshot for question pool randomization)
  questions_shown UUID[], -- array of question_ids

  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_student_answers`
```sql
CREATE TABLE quiz_student_answers (
  answer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
  question_id UUID REFERENCES quiz_questions(question_id),

  -- Answer storage
  choice_id UUID REFERENCES quiz_choices(choice_id), -- for MCQ, True/False
  choice_ids UUID[], -- for checkbox (multiple correct)
  answer_text TEXT, -- for short answer, essay
  answer_json JSONB, -- for complex types (matching, ordering, drag-drop)

  -- Grading
  points_awarded DECIMAL(5,2) DEFAULT 0,
  is_correct BOOLEAN, -- nullable for essay (pending grading)

  -- Manual grading (for essays)
  graded_by UUID REFERENCES teachers(id),
  graded_at TIMESTAMP,
  grader_feedback TEXT,

  -- Timing
  time_spent_seconds INT, -- time spent on this question
  answered_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_student_summary`
```sql
CREATE TABLE quiz_student_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(student_id),
  quiz_id UUID REFERENCES quizzes(quiz_id),

  -- Attempt tracking
  last_attempt_id UUID REFERENCES quiz_attempts(attempt_id),
  attempts_count INT DEFAULT 1,

  -- Scoring (based on average of all attempts)
  highest_score DECIMAL(6,2),
  lowest_score DECIMAL(6,2),
  latest_score DECIMAL(6,2),
  average_score DECIMAL(6,2), -- THIS is the official score

  -- Status
  status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'passed', 'failed'
  passed BOOLEAN, -- based on passing_score

  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, quiz_id)
);
```

---

### 3.4 Session Management (Live Quiz State)

#### `quiz_active_sessions`
```sql
CREATE TABLE quiz_active_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID REFERENCES students(student_id),
  attempt_id UUID REFERENCES quiz_attempts(attempt_id),

  -- Session tracking
  started_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  -- Device tracking (initial)
  initial_device_fingerprint TEXT,
  initial_ip_address INET,
  initial_user_agent TEXT,

  UNIQUE(student_id, quiz_id) -- only one active session per student per quiz
);
```

#### `quiz_session_answers` (Temporary Storage)
```sql
CREATE TABLE quiz_session_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES quiz_active_sessions(session_id) ON DELETE CASCADE,
  question_id UUID REFERENCES quiz_questions(question_id),

  -- Temporary answer storage (same structure as quiz_student_answers)
  temporary_choice_id UUID,
  temporary_choice_ids UUID[],
  temporary_answer_text TEXT,
  temporary_answer_json JSONB,

  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);
```

---

### 3.5 Security & Monitoring Tables

#### `quiz_device_sessions`
```sql
CREATE TABLE quiz_device_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES quiz_active_sessions(session_id) ON DELETE CASCADE,

  -- Device fingerprinting
  device_fingerprint TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  screen_resolution VARCHAR(20), -- "1920x1080"
  browser_info JSONB, -- {name: "Chrome", version: "120", os: "Windows"}

  -- Device type detection
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'

  -- Tracking
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  is_current BOOLEAN DEFAULT true -- only one current device
);
```

#### `quiz_participants` (Live Monitoring)
```sql
CREATE TABLE quiz_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES quiz_active_sessions(session_id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID REFERENCES students(student_id),

  -- Status
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'active', 'idle', 'finished', 'flagged', 'terminated'

  -- Progress tracking
  progress INT DEFAULT 0, -- 0-100 percentage
  current_question_index INT DEFAULT 0,
  questions_answered INT DEFAULT 0,
  total_questions INT NOT NULL,

  -- Timing
  start_time TIMESTAMP,
  end_time TIMESTAMP,

  -- Monitoring
  flag_count INT DEFAULT 0,
  idle_time_seconds INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id)
);
```

#### `quiz_flags`
```sql
CREATE TABLE quiz_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES quiz_participants(id) ON DELETE CASCADE,
  session_id UUID REFERENCES quiz_active_sessions(session_id),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID REFERENCES students(student_id),

  -- Flag details
  flag_type VARCHAR(100) NOT NULL,
  -- Types: 'tab_switch', 'exit_fullscreen', 'device_change', 'ip_change',
  --        'fast_answer', 'idle_timeout', 'copy_paste_attempt',
  --        'right_click_attempt', 'screenshot_attempt', 'suspicious_pattern'

  message TEXT,
  severity VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'critical'

  -- Context
  metadata JSONB, -- {tab_switch_count: 5, question_id: "...", time_spent: 10}

  timestamp TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_activity_logs`
```sql
CREATE TABLE quiz_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES quiz_participants(id) ON DELETE CASCADE,
  session_id UUID REFERENCES quiz_active_sessions(session_id),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID REFERENCES students(student_id),

  -- Event tracking
  event_type VARCHAR(100) NOT NULL,
  -- Types: 'quiz_started', 'question_answered', 'question_skipped',
  --        'quiz_paused', 'quiz_resumed', 'auto_saved', 'quiz_submitted',
  --        'flagged', 'terminated_by_teacher', 'device_logout'

  message TEXT,
  metadata JSONB,

  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

### 3.6 Analytics Tables

#### `quiz_analytics`
```sql
CREATE TABLE quiz_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,

  -- Aggregate stats
  total_attempts INT DEFAULT 0,
  total_students INT DEFAULT 0,
  completed_attempts INT DEFAULT 0,

  -- Score statistics
  average_score DECIMAL(6,2),
  highest_score DECIMAL(6,2),
  lowest_score DECIMAL(6,2),
  median_score DECIMAL(6,2),
  pass_rate DECIMAL(5,2), -- percentage

  -- Time statistics
  average_time_taken_seconds INT,
  fastest_completion_seconds INT,
  slowest_completion_seconds INT,

  -- Last calculated
  last_calculated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(quiz_id)
);
```

#### `quiz_question_stats`
```sql
CREATE TABLE quiz_question_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(quiz_id),

  -- Performance metrics
  total_attempts INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  skipped_count INT DEFAULT 0,

  -- Calculated metrics
  difficulty_score DECIMAL(5,2), -- 0-100 (based on correct rate)
  average_time_spent_seconds INT,

  -- Discrimination index (how well question separates high/low performers)
  discrimination_index DECIMAL(3,2), -- -1 to 1

  last_calculated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(question_id)
);
```

---

### 3.7 Access Control Tables

#### `quiz_access_links`
```sql
CREATE TABLE quiz_access_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,

  -- Link details
  access_token VARCHAR(255) UNIQUE NOT NULL, -- unique URL token
  link_type VARCHAR(20) DEFAULT 'link', -- 'link', 'qr_code'

  -- Access control
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP, -- same as quiz.end_date
  max_uses INT, -- nullable (unlimited if null)
  current_uses INT DEFAULT 0,

  -- Tracking
  created_by UUID REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);
```

#### `quiz_access_logs`
```sql
CREATE TABLE quiz_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_link_id UUID REFERENCES quiz_access_links(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(student_id),

  -- Access details
  accessed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,

  -- Result
  access_granted BOOLEAN DEFAULT true,
  denial_reason TEXT -- if access_granted = false
);
```

---

## 4. Data Flow & Business Logic

### 4.1 Quiz Creation Flow

```
1. Teacher creates quiz (status: 'draft')
   ↓
2. Add questions via builder
   → Auto-save every new question immediately
   → Debounce save 15 seconds after last edit
   → Questions stored in quiz_questions
   ↓
3. Configure settings
   → quiz_settings (security)
   → quiz table (timing, visibility)
   → question_bank import (if applicable)
   ↓
4. Assign to sections
   → quiz_sections table
   → quiz_section_settings (per-section overrides)
   ↓
5. Publish
   → status: 'draft' → 'published' (or 'scheduled')
   → Generate access links/QR codes
   → If editing published quiz → create new version
```

### 4.2 Student Quiz Access Flow

```
1. Student navigates to quiz (via dashboard, link, or QR)
   ↓
2. Access validation
   → Check visibility (public vs section-only)
   → Check section enrollment (if section-only)
   → Check start_date (show countdown if not started)
   → Check end_date (block if expired)
   → Check existing active session (device logout if exists)
   ↓
3. Create new session
   → quiz_active_sessions record
   → Capture device fingerprint, IP, user agent
   → Create quiz_participants record
   → Create quiz_attempts record (attempt_number incremented)
   ↓
4. Load quiz
   → If question pool: randomly select questions_to_display
   → Store questions_shown in quiz_attempts
   → Apply shuffle settings (per attempt)
   → Load quiz_settings (security enforcement)
   ↓
5. Student takes quiz
   → Auto-save to quiz_session_answers:
     - Every 2 questions answered
     - Every 20 seconds
   → Track activity in quiz_activity_logs
   → Monitor for flags in real-time
   ↓
6. Quiz submission
   → Move quiz_session_answers → quiz_student_answers
   → Calculate score (auto-grade where possible)
   → Update quiz_attempts (status: 'submitted' or 'graded')
   → Update quiz_student_summary (average score)
   → Deactivate quiz_active_sessions
   → Update quiz_participants (status: 'finished')
```

### 4.3 Auto-Submission Logic

**Triggers for auto-submission:**

1. **Quiz time limit reached**
   ```
   - Submit all answered questions
   - Unanswered = null
   - Status: 'submitted'
   ```

2. **Per-question time limit reached**
   ```
   - Save current question as blank/null
   - Auto-advance to next question
   - Continue quiz (no full auto-submit)
   ```

3. **Quiz end_date reached**
   ```
   - Hard deadline
   - Auto-submit current progress
   - No access after deadline
   ```

4. **Teacher remote termination**
   ```
   - Mark terminated_by_teacher = true
   - Still grade and count attempt
   - Status: 'terminated'
   ```

---

### 4.4 Retake Logic

```
IF allow_retakes = true:
  1. Check existing attempts count
     → No limit (unlimited retakes)

  2. Create new attempt
     → attempt_number = last_attempt + 1
     → Fresh start (no previous answers shown)

  3. On completion
     → Calculate average of ALL attempts
     → Update quiz_student_summary.average_score
     → This is the official score

ELSE:
  → Single attempt only
  → Block access after first submission
```

---

### 4.5 Grading Flow

#### Auto-Grading (Immediate)
```
Question types auto-graded:
- Multiple Choice (MCQ)
- True/False
- Checkbox (all-or-nothing, no partial credit)
- Fill-in-the-blank (exact match, case-insensitive)
- Dropdown
- Linear Scale

On submission:
  1. Compare student answer with correct answer
  2. Assign points_awarded
  3. Set is_correct = true/false
  4. Calculate total score
  5. Update quiz_attempts.score
```

#### Manual Grading (Teacher Review)
```
Question types requiring manual grading:
- Essay
- Short Answer (optional)
- Long Answer

Flow:
  1. Student submits → is_correct = null
  2. Quiz appears in teacher's grading queue
  3. Teacher reviews answer
  4. Assigns points_awarded (can be partial)
  5. Adds grader_feedback (optional)
  6. Sets graded_by, graded_at
  7. Recalculate total score
  8. Update quiz_attempts.score
  9. Update quiz_student_summary.average_score
```

#### Partial Credit
```
Supported for:
- Essay (teacher discretion)
- Short Answer (teacher discretion)

NOT supported for:
- Checkbox (answered in Q25: automatically wrong if not 100%)
- Other types
```

---

### 4.6 Real-Time Monitoring Flow

**Architecture**: Hybrid WebSocket + Polling (Best of Both Worlds)

#### Why Hybrid Approach?

**Benefits:**
- ✅ **Real-time updates** via WebSocket (instant flags to teachers)
- ✅ **Fault tolerance** via Polling (catches missed WebSocket events)
- ✅ **Scalability** - Only teachers use WebSocket (~10-50 connections)
- ✅ **State consistency** - Polling reconciles any missed events
- ✅ **Reconnection recovery** - Polling fills gaps during WebSocket reconnect

#### Student Communication (HTTP Only)
```
Students do NOT use WebSocket:
  - POST /api/v1/quizzes/:id/session/flag (when tab switch, etc.)
  - POST /api/v1/quizzes/:id/answer (auto-save)
  - POST /api/v1/quizzes/:id/session/heartbeat (every 20s)

This prevents 1000+ student WebSocket connections!
```

#### Teacher Monitoring (WebSocket + Polling)

**WebSocket (Instant Updates)**
```typescript
// Teacher connects to WebSocket
socket = io('/quiz-monitoring');
socket.emit('join-monitoring', { quizId });

// Listen for instant events
socket.on('flag:created', (flag) => {
  // Instant flag notification (< 1 second)
  displayFlagInUI(flag);
});

socket.on('student:finished', (student) => {
  // Instant submission notification
  updateStudentStatus(student);
});
```

**Polling (State Reconciliation - Every 30 seconds)**
```typescript
// GET /api/v1/quizzes/:quizId/monitoring/updates?since=lastPollTimestamp
setInterval(async () => {
  const data = await fetchMonitoringUpdates(quizId, lastPollTimestamp);

  // Reconcile participant states
  reconcileParticipants(data.participants);

  // Add any missed flags (WebSocket delivery failure)
  reconcileMissedFlags(data.new_flags);

  lastPollTimestamp = data.timestamp;
}, 30000);
```

**Response Format:**
```json
{
  "participants": [
    {
      "student_id": "...",
      "student_name": "John Doe",
      "status": "active",
      "progress": 65,
      "current_question_index": 13,
      "questions_answered": 13,
      "total_questions": 20,
      "flag_count": 2,
      "idle_time_seconds": 0,
      "last_activity": "2025-10-17T10:15:23Z"
    }
  ],
  "new_flags": [
    // Flags created since last poll (missed by WebSocket?)
  ],
  "timestamp": "2025-10-17T10:15:30Z"
}
```

#### WebSocket Events

| Event | Direction | Purpose | Trigger |
|-------|-----------|---------|---------|
| `join-monitoring` | Teacher → Server | Join quiz monitoring room | Teacher opens dashboard |
| `flag:created` | Server → Teacher | Instant flag notification | Student POSTs flag |
| `student:finished` | Server → Teacher | Student submitted | Quiz submission |
| `student:terminated` | Teacher → Server | Teacher ends quiz | Teacher clicks "Terminate" |
| `terminate-confirmed` | Server → Student | Quiz terminated | Server processes termination |

#### Backend Flow (Student Flag Creation)
```typescript
// Student POSTs flag
@Post('quizzes/:quizId/session/flag')
async createFlag(@Param('quizId') quizId, @Body() flagDto) {
  // 1. Save flag to database
  const flag = await this.quizService.createFlag(quizId, flagDto);

  // 2. Emit to WebSocket (instant to teachers)
  this.quizMonitoringGateway.emitFlag(quizId, flag);

  // 3. Polling will also fetch this flag as safety net
  // (No extra code needed - polling queries DB)

  return { success: true };
}
```

#### Edge Case Handling

**WebSocket Connection Lost:**
```
1. Student switches tab → POST /flag
2. Backend saves flag, tries WebSocket emit
3. Teacher's WebSocket disconnected → Event lost ❌
4. Polling runs after 30s → Fetches flag from DB ✅
5. Teacher sees flag (delayed but not lost)
```

**WebSocket Reconnection:**
```
1. Teacher's WebSocket disconnects for 2 minutes
2. During disconnect: 5 flags created, 3 students finish
3. WebSocket reconnects
4. Polling runs → Fetches all missed events ✅
5. UI fully synced (no manual refresh)
```

**Performance:**
- 20 teachers monitoring → 20 WebSocket connections
- 1000 students → 0 WebSocket connections (HTTP only)
- Polling: 40 requests/min (20 teachers × 2 polls/min) → Negligible load
- Redis cache: 5-second TTL for polling responses → Ultra-fast

---

### 4.7 Security Enforcement Flow

#### Device Session Management
```
On quiz start:
  1. Generate device fingerprint (frontend)
     - Browser fingerprint library
     - Screen resolution
     - User agent
     - Timezone, language

  2. Check existing active session
     IF EXISTS:
       → Auto-logout old device
       → Create quiz_flags (flag_type: 'device_change')
       → Notify teacher

  3. Store in quiz_device_sessions
     - device_fingerprint
     - ip_address
     - is_current = true

During quiz:
  4. On every answer submission, validate:
     - Device fingerprint matches
     - IP address (flag if changed, don't block)

  5. If mismatch:
     → Create flag (not block)
     → Teacher decides action
```

#### Tab Switch Detection
```
Frontend:
  window.addEventListener('blur', () => {
    // Tab lost focus
    incrementTabSwitchCount();
    sendFlagToBackend({
      flag_type: 'tab_switch',
      metadata: { count: tabSwitchCount }
    });
  });

Backend:
  IF tabSwitchCount >= tab_switch_warning_threshold:
    → Create flag with severity: 'warning'
    → Notify teacher via WebSocket

  (No auto-lock, teacher decides)
```

#### Fullscreen Enforcement
```
IF quiz_settings.require_fullscreen = true:

  Frontend:
    1. Request fullscreen on quiz start
    2. Monitor fullscreen changes:
       document.addEventListener('fullscreenchange', () => {
         if (!document.fullscreenElement) {
           // User exited fullscreen
           sendFlagToBackend({
             flag_type: 'exit_fullscreen'
           });
           showWarning("Return to fullscreen");
         }
       });

  Backend:
    → Create flag (don't reject answers)
    → Teacher sees flag in dashboard
```

#### IP & Device Change Handling
```
On answer submission:
  1. Compare current IP with initial IP
     IF different:
       → Create flag: 'ip_change'
       → metadata: { old_ip, new_ip }
       → Don't block (flag only)

  2. Compare device fingerprint
     IF different:
       → This shouldn't happen (auto-logout on new device)
       → If it does: Critical flag + investigate
```

---

## 5. API Endpoints

### 5.1 Teacher - Quiz Management

#### Quiz CRUD
```
POST   /api/v1/quizzes                    Create quiz (draft)
GET    /api/v1/quizzes                    List teacher's quizzes
GET    /api/v1/quizzes/:id                Get quiz details
PATCH  /api/v1/quizzes/:id                Update quiz (creates version if published)
DELETE /api/v1/quizzes/:id                Delete quiz (soft delete)
POST   /api/v1/quizzes/:id/publish        Publish quiz
POST   /api/v1/quizzes/:id/archive        Archive quiz
POST   /api/v1/quizzes/:id/duplicate      Duplicate quiz
```

#### Quiz Builder
```
POST   /api/v1/quizzes/:id/questions      Add question
PATCH  /api/v1/quizzes/:id/questions/:qid Update question (auto-save)
DELETE /api/v1/quizzes/:id/questions/:qid Delete question
POST   /api/v1/quizzes/:id/questions/reorder Reorder questions
POST   /api/v1/quizzes/:id/questions/import-from-bank Import from question bank
```

#### Quiz Assignment
```
POST   /api/v1/quizzes/:id/assign-sections   Assign to sections
DELETE /api/v1/quizzes/:id/sections/:sectionId Unassign section
PATCH  /api/v1/quizzes/:id/sections/:sectionId/settings Update section settings
```

#### Access Links & QR Codes
```
POST   /api/v1/quizzes/:id/access-links   Generate link/QR
GET    /api/v1/quizzes/:id/access-links   List links
DELETE /api/v1/quizzes/:id/access-links/:linkId Revoke link
```

---

### 5.2 Teacher - Live Monitoring

```
GET    /api/v1/quizzes/:id/live-monitoring  Get live participant data (polling)
WS     /quiz-monitoring                      WebSocket for real-time flags

POST   /api/v1/quizzes/:id/terminate-student/:studentId  Terminate student quiz
GET    /api/v1/quizzes/:id/flags             Get all flags for quiz
GET    /api/v1/quizzes/:id/activity-logs     Get activity logs
```

---

### 5.3 Teacher - Grading

```
GET    /api/v1/quizzes/:id/grading-queue     Get essays pending grading
PATCH  /api/v1/quiz-attempts/:attemptId/grade-answer/:answerId  Grade single answer
POST   /api/v1/quiz-attempts/:attemptId/finalize-grading  Finalize manual grading

GET    /api/v1/quizzes/:id/results           Get all student results
GET    /api/v1/quizzes/:id/results/:studentId Get student result detail
```

---

### 5.4 Teacher - Analytics

```
GET    /api/v1/quizzes/:id/analytics         Quiz performance analytics
GET    /api/v1/quizzes/:id/question-stats    Per-question statistics
GET    /api/v1/quizzes/:id/export-results    Export results (CSV/Excel)
```

---

### 5.5 Student - Quiz Taking

```
GET    /api/v1/quizzes/available             List available quizzes
GET    /api/v1/quizzes/:id                   Get quiz details (if accessible)
POST   /api/v1/quizzes/:id/start             Start quiz (create session/attempt)
GET    /api/v1/quizzes/:id/session           Get current session state

POST   /api/v1/quizzes/:id/answer            Submit/update answer (auto-save)
POST   /api/v1/quizzes/:id/submit            Final submission

GET    /api/v1/quizzes/:id/result            Get result (if graded)
GET    /api/v1/quizzes/:id/attempts          Get attempt history
```

---

### 5.6 Security & Monitoring Endpoints (Student → Backend)

```
POST   /api/v1/quizzes/:id/session/heartbeat   Update session (every 20s)
POST   /api/v1/quizzes/:id/session/flag        Report client-side flag
POST   /api/v1/quizzes/:id/session/logout      Logout session (on new device)
```

---

### 5.7 Question Bank

```
POST   /api/v1/question-bank                 Create question template
GET    /api/v1/question-bank                 List teacher's questions
GET    /api/v1/question-bank/:id             Get question
PATCH  /api/v1/question-bank/:id             Update question
DELETE /api/v1/question-bank/:id             Delete question
GET    /api/v1/question-bank/search          Search questions (by topic, type, tags)
```

---

## 6. Security & Anti-Cheating

### 6.1 Frontend Security Measures (Enforced, Flagged on Backend)

| Feature | Frontend Enforcement | Backend Handling |
|---------|---------------------|------------------|
| **Lockdown Browser** | Detect non-browser access (mobile app) | Flag if detected |
| **Anti-Screenshot** | Display warning, watermark | Flag if clipboard event detected |
| **Disable Copy-Paste** | preventDefault on copy/paste events | Log paste events as flags |
| **Disable Right-Click** | contextmenu.preventDefault() | Log attempts as flags |
| **Require Fullscreen** | Request fullscreen, monitor exit | Flag exits, don't block answers |
| **Tab Switch Detection** | window blur/focus events | Count and flag after threshold |

**Important**: All frontend measures are **bypassable** with dev tools. Backend relies on **flagging patterns**, not hard blocking.

---

### 6.2 Device Fingerprinting

**Frontend Library**: `@fingerprintjs/fingerprintjs` or custom fingerprint
```javascript
const fp = await FingerprintJS.load();
const result = await fp.get();
const fingerprint = result.visitorId;

// Send to backend on quiz start
POST /api/v1/quizzes/:id/start
{
  device_fingerprint: fingerprint,
  screen_resolution: "1920x1080",
  user_agent: navigator.userAgent,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}
```

**Backend Validation**:
- Store in `quiz_device_sessions`
- On each answer submission, compare fingerprint
- If mismatch: Flag (don't block)

---

### 6.3 Single Active Session Enforcement

**Logic**:
```
On quiz start:
  SELECT * FROM quiz_active_sessions
  WHERE student_id = ? AND quiz_id = ? AND is_active = true

  IF exists:
    → UPDATE old session: is_active = false
    → Create flag: 'device_change' (severity: critical)
    → Log activity: 'device_logout'
    → Notify teacher via WebSocket

  THEN:
    → Create new session
    → is_active = true
```

**Frontend**: Old device gets WebSocket message → "You've been logged out from another device"

---

### 6.4 IP Consistency Tracking

**On quiz start**: Capture `initial_ip_address` in `quiz_active_sessions`

**On each heartbeat (every 20s)**:
```
Compare current IP with initial IP
  IF different:
    → Create flag: 'ip_change'
    → metadata: { old_ip, new_ip, reason: 'wifi_to_mobile_data?' }
    → severity: 'warning'
    → Don't block (flag only)
```

**Consideration**: Mobile networks change IPs frequently → **Flag, don't block**

---

### 6.5 Behavioral Anomaly Detection

#### Fast Answering
```
On answer submission:
  Calculate time_spent = answer_timestamp - question_shown_timestamp

  IF time_spent < threshold (e.g., 5 seconds for MCQ):
    → Create flag: 'fast_answer'
    → metadata: { question_id, time_spent, threshold }
    → severity: 'warning'

  IF consecutive fast answers (e.g., 5 in a row):
    → Escalate severity: 'critical'
```

#### Idle Timeout
```
On heartbeat (every 20s):
  Calculate idle_time = now - last_activity

  IF idle_time > threshold (e.g., 5 minutes):
    → Create flag: 'idle_timeout'
    → Update quiz_participants.idle_time_seconds
    → severity: 'info'
```

#### Pattern Anomalies
```
Detect suspicious patterns:
- All answers identical (e.g., all "A")
- Perfect score in record time
- Answering questions out of order (when sequential)

Create flag: 'suspicious_pattern'
```

---

### 6.6 Teacher Actions on Flags

Teachers see flags in real-time dashboard and can:
1. **Review**: View flag details, context, metadata
2. **Ignore**: Mark flag as false positive
3. **Warn**: Send warning message to student
4. **Terminate**: End student's quiz remotely
5. **Invalidate**: Mark attempt as invalid (doesn't count)
6. **Review Later**: Flag for post-quiz investigation

**No automatic blocking** → Teacher has final decision

---

## 7. Real-Time Monitoring

### 7.1 Architecture Overview

**Hybrid WebSocket + Polling Architecture**:
- **Students**: HTTP POST only (no WebSocket) → Scalability
- **Teachers**: WebSocket (instant events) + Polling (state sync) → Reliability
- **Performance**: 20 teacher WebSockets vs. 1000+ student WebSockets ✅
- **Fault Tolerance**: Polling catches missed WebSocket events

---

### 7.2 WebSocket Implementation (NestJS)

#### Gateway Setup
```typescript
// quiz-monitoring.gateway.ts
@WebSocketGateway({ namespace: '/quiz-monitoring' })
export class QuizMonitoringGateway {
  @WebSocketServer() server: Server;

  // Teacher joins monitoring room
  @SubscribeMessage('join-monitoring')
  handleJoinMonitoring(
    @MessageBody() data: { quizId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`quiz-${data.quizId}-teachers`);
  }

  // Emit flag to teachers
  emitFlag(quizId: string, flag: QuizFlag) {
    this.server
      .to(`quiz-${quizId}-teachers`)
      .emit('flag:created', flag);
  }

  // Student finished
  emitStudentFinished(quizId: string, studentData: any) {
    this.server
      .to(`quiz-${quizId}-teachers`)
      .emit('student:finished', studentData);
  }
}
```

#### Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join-monitoring` | Teacher → Server | Join quiz monitoring room |
| `flag:created` | Server → Teacher | New flag detected |
| `flag:tab_switch` | Student → Server | Tab switch detected |
| `flag:exit_fullscreen` | Student → Server | Fullscreen exited |
| `flag:device_change` | Student → Server | Device fingerprint changed |
| `student:finished` | Server → Teacher | Student submitted quiz |
| `student:terminated` | Teacher → Server | Teacher terminates student |
| `terminate-confirmed` | Server → Student | Your quiz was terminated |

---

### 7.3 Polling Endpoint (State Reconciliation)

**Endpoint**: `GET /api/v1/quizzes/:quizId/monitoring/updates?since={timestamp}`

**Purpose**:
- Fetch current participant states
- Get flags created since last poll (WebSocket safety net)
- Reconcile any missed real-time events

**Response**:
```typescript
{
  participants: [
    {
      id: "...",
      student_id: "...",
      student_name: "John Doe",
      status: "active",
      progress: 65,
      current_question_index: 13,
      questions_answered: 13,
      total_questions: 20,
      flag_count: 2,
      idle_time_seconds: 0,
      start_time: "2025-10-17T10:00:00Z",
      last_activity: "2025-10-17T10:15:23Z"
    }
  ],
  new_flags: [
    // Flags created since 'since' timestamp (missed by WebSocket?)
    {
      id: "...",
      student_id: "...",
      flag_type: "tab_switch",
      severity: "warning",
      timestamp: "2025-10-17T10:15:10Z"
    }
  ],
  timestamp: "2025-10-17T10:15:30Z" // For next poll
}
```

**Frontend Reconciliation Logic**:
```typescript
async function pollAndReconcile(quizId: string, lastPollTimestamp: string) {
  const data = await fetch(`/api/v1/quizzes/${quizId}/monitoring/updates?since=${lastPollTimestamp}`);

  // 1. Reconcile participant states
  data.participants.forEach(serverParticipant => {
    const localParticipant = getLocalParticipant(serverParticipant.id);

    if (localParticipant.progress !== serverParticipant.progress) {
      // WebSocket missed update, use server state
      updateParticipantInUI(serverParticipant);
    }
  });

  // 2. Add missed flags
  data.new_flags.forEach(flag => {
    if (!flagExistsLocally(flag.id)) {
      // WebSocket didn't deliver this flag
      addFlagToUI(flag);
    }
  });

  return data.timestamp; // Use for next poll
}

// Poll every 30 seconds
setInterval(() => {
  lastPollTimestamp = await pollAndReconcile(quizId, lastPollTimestamp);
}, 30000);
```

**Polling Frequency**: Every 30 seconds (balance between real-time and server load)

---

### 7.4 Flag Severity & Actions

| Severity | Color | Teacher Action |
|----------|-------|----------------|
| `info` | Blue | Informational (idle, started) |
| `warning` | Yellow | Review (tab switch, fast answer) |
| `critical` | Red | Immediate attention (device change, suspicious pattern) |

**Dashboard Display**:
- Sort by severity (critical first)
- Show count badge on student card
- Real-time toast notification for critical flags

---

## 8. Security, Caching & Performance

### 8.1 Security Layers

#### Layer 1: Authentication & Authorization

**JWT Validation (Every Request)**
```typescript
// SupabaseAuthGuard validates JWT on every request
@UseGuards(SupabaseAuthGuard)
@Controller('quizzes')
export class QuizzesController {
  // All routes protected by JWT
}

// JWT payload structure
interface JWTPayload {
  sub: string; // user_id
  email: string;
  role: string; // 'student', 'teacher', 'admin'
  iat: number;
  exp: number;
}
```

**Role-Based Access Control (RBAC)**
```typescript
// RolesGuard enforces role permissions
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('Teacher', 'Admin')
@Post('quizzes')
async createQuiz() {
  // Only teachers and admins can create quizzes
}
```

**Row-Level Security (RLS) on Supabase**
- All SELECT queries use `getClient()` → RLS enforced
- All INSERT/UPDATE/DELETE use `getServiceClient()` → Bypass RLS with backend validation
- Backend validates permissions before using service client

---

#### Layer 2: Input Validation & Sanitization

**DTO Validation (class-validator)**
```typescript
export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value.trim())
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @Transform(({ value }) => DOMPurify.sanitize(value))
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  timeLimit?: number;
}
```

**SQL Injection Prevention**
- ✅ Use Supabase client (parameterized queries automatically)
- ❌ Never use raw SQL with string concatenation
- ✅ Validate all UUIDs before queries

```typescript
// ✅ SAFE - Parameterized query
const { data } = await supabase
  .from('quizzes')
  .select('*')
  .eq('quiz_id', quizId); // Automatically sanitized

// ❌ UNSAFE - Never do this
const { data } = await supabase.rpc('raw_query', {
  query: `SELECT * FROM quizzes WHERE quiz_id = '${quizId}'`
});
```

**XSS Prevention**
```typescript
// Backend sanitization
import DOMPurify from 'isomorphic-dompurify';

@Transform(({ value }) => DOMPurify.sanitize(value, {
  ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br'],
  ALLOWED_ATTR: []
}))
description: string;

// Frontend sanitization (additional layer)
import DOMPurify from 'dompurify';

function renderQuizDescription(html: string) {
  return DOMPurify.sanitize(html);
}
```

---

#### Layer 3: Rate Limiting & Throttling

**Global Rate Limiting (@nestjs/throttler)**
```typescript
// main.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 60 seconds
      limit: 100, // 100 requests per minute per IP
    }),
  ],
})
export class AppModule {}
```

**Endpoint-Specific Rate Limiting**
```typescript
import { Throttle } from '@nestjs/throttler';

// Quiz creation: 10 per hour for teachers
@Throttle(10, 3600)
@Post('quizzes')
async createQuiz() {}

// Quiz attempt: 5 per quiz per student
@Throttle(5, 3600)
@Post('quizzes/:id/start')
async startQuiz() {}

// Flag reporting: 100 per hour per student
@Throttle(100, 3600)
@Post('quizzes/:id/session/flag')
async createFlag() {}
```

**Custom Throttling Guards (using In-Memory Cache)**
```typescript
// quiz-upload-throttle.guard.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class QuizUploadThrottleGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const cacheKey = `quiz_upload:${userId}`;

    // Check upload count in last hour
    const uploadCount = await this.cacheManager.get<number>(cacheKey) || 0;

    if (uploadCount >= 10) {
      throw new TooManyRequestsException(
        'Maximum 10 quiz uploads per hour exceeded'
      );
    }

    // Increment counter (TTL: 1 hour = 3600 seconds)
    await this.cacheManager.set(cacheKey, uploadCount + 1, 3600 * 1000);

    return true;
  }
}
```



---

#### Layer 4: CSRF & CORS Protection

**CORS Configuration**
```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:3000', // Development
    'https://southville-nhs.vercel.app', // Production frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**CSRF Token Validation (for state-changing operations)**
```typescript
// csrf.guard.ts
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const csrfToken = request.headers['x-csrf-token'];
    const sessionToken = request.cookies['csrf-session'];

    if (!csrfToken || csrfToken !== sessionToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}

// Apply to state-changing endpoints
@UseGuards(CsrfGuard)
@Post('quizzes/:id/submit')
async submitQuiz() {}
```

---

#### Layer 5: Data Encryption & Privacy

**Sensitive Data Encryption**
```typescript
import * as crypto from 'crypto';

// Encrypt student answers (optional for high-security environments)
function encryptAnswer(answer: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(answer, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptAnswer(encrypted: string, key: string): string {
  const [ivHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

**PII Anonymization (for analytics)**
```typescript
// Hash student IDs for analytics (prevent re-identification)
function anonymizeStudentId(studentId: string): string {
  return crypto
    .createHash('sha256')
    .update(studentId + process.env.SALT)
    .digest('hex');
}

// Use in analytics
await this.analyticsService.trackQuizCompletion({
  anonymousStudentId: anonymizeStudentId(studentId),
  quizId,
  score,
});
```

---

### 8.2 Caching Strategy (FREE In-Memory Cache)

**✅ NO EXTERNAL COST - Uses NestJS Built-in Cache**

#### In-Memory Caching Architecture

**Cache Layers**
1. **Hot Data** (TTL: 30 seconds) - Live participants, active sessions
2. **Warm Data** (TTL: 5 minutes) - Quiz details, questions
3. **Cold Data** (TTL: 15 minutes) - Analytics, statistics

**Why In-Memory Cache?**
- ✅ **FREE** - No external service needed
- ✅ **Simple** - Built into NestJS
- ✅ **Fast** - Stored in RAM
- ✅ **Good for single-server deployments**
- ⚠️ **Note**: Cache cleared on server restart (acceptable for MVP)

---

#### Setup

**Step 1: Configure Cache Module**
```typescript
// app.module.ts
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 5 minutes default (in seconds)
      max: 500, // maximum number of items in cache
      isGlobal: true, // available in all modules
    }),
  ],
})
export class AppModule {}
```

**Step 2: Create Cache Service Wrapper**
```typescript
// cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Generic cache wrapper with TTL
  async cacheWrapper<T>(
    key: string,
    ttl: number, // in seconds
    fetchFunction: () => Promise<T>,
  ): Promise<T> {
    // Try cache first
    const cached = await this.cacheManager.get<T>(key);
    if (cached) {
      return cached;
    }

    // Cache miss - fetch from source
    const data = await fetchFunction();

    // Store in cache (ttl in milliseconds for cache-manager)
    await this.cacheManager.set(key, data, ttl * 1000);

    return data;
  }

  // Invalidate single key
  async invalidate(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  // Invalidate all cache
  async invalidateAll(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Manual set
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
  }

  // Manual get
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }
}
```

---

#### Caching Patterns by Entity

**1. Quiz Details (Warm Cache - 5 min)**
```typescript
async getQuizById(quizId: string) {
  return this.cacheService.cacheWrapper(
    `quiz:${quizId}`,
    300, // 5 minutes
    async () => {
      const { data } = await this.supabase
        .from('quizzes')
        .select('*')
        .eq('quiz_id', quizId)
        .single();
      return data;
    },
  );
}

// Invalidate on update
async updateQuiz(quizId: string, updateDto: UpdateQuizDto) {
  const updated = await this.supabase
    .from('quizzes')
    .update(updateDto)
    .eq('quiz_id', quizId);

  // Invalidate cache (single key)
  await this.cacheService.invalidate(`quiz:${quizId}`);

  return updated;
}
```

**2. Live Monitoring (Hot Cache - 30 sec)**
```typescript
async getLiveParticipants(quizId: string) {
  return this.cacheService.cacheWrapper(
    `live:${quizId}:participants`,
    30, // 30 seconds (short TTL for fresh data)
    async () => {
      const { data } = await this.supabase
        .from('quiz_participants')
        .select('*')
        .eq('quiz_id', quizId);
      return data;
    },
  );
}
```

**3. Quiz Questions (Warm Cache - 5 min)**
```typescript
async getQuizQuestions(quizId: string) {
  return this.cacheService.cacheWrapper(
    `quiz:${quizId}:questions`,
    300, // 5 minutes
    async () => {
      const { data } = await this.supabase
        .from('quiz_questions')
        .select('*, quiz_choices(*), quiz_question_metadata(*)')
        .eq('quiz_id', quizId)
        .order('order_index');
      return data;
    },
  );
}
```

**4. Analytics (Cold Cache - 15 min)**
```typescript
async getQuizAnalytics(quizId: string) {
  return this.cacheService.cacheWrapper(
    `analytics:${quizId}`,
    900, // 15 minutes
    async () => {
      // Expensive aggregation query
      const { data } = await this.supabase
        .from('quiz_analytics')
        .select('*')
        .eq('quiz_id', quizId)
        .single();
      return data;
    },
  );
}
```

---

#### Cache Invalidation Strategies

**1. Immediate Invalidation (Write-Through)**
```typescript
async submitQuiz(attemptId: string, studentId: string, quizId: string) {
  // Submit quiz
  await this.submitQuizToDatabase(attemptId);

  // Invalidate related caches immediately
  await Promise.all([
    this.cacheService.invalidate(`attempt:${attemptId}`),
    this.cacheService.invalidate(`student:${studentId}:summary`),
    this.cacheService.invalidate(`analytics:${quizId}`),
  ]);
}
```

**2. TTL Expiration (Lazy Invalidation)**
```typescript
// Set TTL, let cache expire naturally
// Refresh on next request
// Good for: Analytics, read-heavy data
```

**3. Event-Based Invalidation**
```typescript
@OnEvent('quiz.updated')
async handleQuizUpdate(payload: QuizUpdatedEvent) {
  await this.cacheService.invalidate(`quiz:${payload.quizId}`);
  await this.cacheService.invalidate(`quiz:${payload.quizId}:questions`);
}
```

**4. Manual Invalidation (Admin Tools)**
```typescript
// Clear all cache (use sparingly)
async clearAllCache() {
  await this.cacheService.invalidateAll();
}
```

---

#### When to Upgrade to Redis?

**Current Setup (In-Memory Cache) works well for:**
- ✅ Single server deployments
- ✅ < 1000 concurrent users
- ✅ MVP/prototype stage
- ✅ Budget-conscious projects

**Upgrade to Redis when you need:**
- 🔄 **Multiple server instances** (horizontal scaling)
- 🔄 **Shared cache across servers** (load balancing)
- 🔄 **Persistent cache** (survives restarts)
- 🔄 **> 5000 concurrent users**
- 🔄 **WebSocket state sharing** across instances

**Upgrade Path (Optional - Future):**
```typescript
// Step 1: Install Redis package
npm install @nestjs/cache-manager cache-manager-redis-yet

// Step 2: Update cache config
import { redisStore } from 'cache-manager-redis-yet';

CacheModule.registerAsync({
  useFactory: async () => ({
    store: await redisStore({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    ttl: 300,
  }),
});

// No code changes needed - same CacheService interface!
```

**Cost Comparison:**
| Solution | Cost | Best For |
|----------|------|----------|
| **In-Memory** | FREE | Single server, MVP |
| **Upstash Redis** | FREE (10K req/day) | Small scale |
| **Redis Cloud** | $5-10/month | Production scale |

---

### 8.3 Performance Optimizations

#### Database Query Optimization

**1. Efficient Indexes (Already defined in Appendix)**
```sql
-- Critical indexes for performance
CREATE INDEX idx_quiz_attempts_student_quiz ON quiz_attempts(student_id, quiz_id);
CREATE INDEX idx_quiz_flags_timestamp ON quiz_flags(timestamp DESC);
CREATE INDEX idx_quiz_participants_quiz ON quiz_participants(quiz_id);
```

**2. Query Optimization Patterns**

**Use SELECT specific columns (not SELECT *)**
```typescript
// ❌ BAD - Fetches all columns
const { data } = await supabase.from('quizzes').select('*');

// ✅ GOOD - Only fetch needed columns
const { data } = await supabase
  .from('quizzes')
  .select('quiz_id, title, status, created_at');
```

**Paginate large result sets**
```typescript
// Pagination for quiz results
async getQuizResults(quizId: string, page: number = 1, limit: number = 50) {
  const offset = (page - 1) * limit;

  const { data, count } = await this.supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact' })
    .eq('quiz_id', quizId)
    .range(offset, offset + limit - 1);

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}
```

**Use aggregations efficiently**
```typescript
// ❌ BAD - Fetch all, aggregate in app
const attempts = await getAllAttempts(quizId);
const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;

// ✅ GOOD - Aggregate in database
const { data } = await supabase.rpc('get_quiz_stats', { quiz_id: quizId });
// SQL function calculates average in DB
```

---

#### Connection Pooling

**Supabase Client Configuration**
```typescript
// supabase.config.ts
export const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-application-name': 'quiz-system' },
  },
  // Connection pooling (handled by Supabase)
  // Max connections: 100 (Supabase default)
};
```

---

#### Batch Operations

**Bulk Insert for Questions**
```typescript
// ❌ BAD - Insert one by one (N queries)
for (const question of questions) {
  await supabase.from('quiz_questions').insert(question);
}

// ✅ GOOD - Bulk insert (1 query)
await supabase.from('quiz_questions').insert(questions);
```

**Batch Flag Creation**
```typescript
// Batch flags every 5 seconds instead of real-time per flag
private flagQueue: QuizFlag[] = [];

async queueFlag(flag: QuizFlag) {
  this.flagQueue.push(flag);

  if (this.flagQueue.length >= 10) {
    await this.flushFlags();
  }
}

async flushFlags() {
  if (this.flagQueue.length === 0) return;

  const flags = [...this.flagQueue];
  this.flagQueue = [];

  await this.supabase.from('quiz_flags').insert(flags);
}

// Flush every 5 seconds
setInterval(() => this.flushFlags(), 5000);
```

---

#### CDN & Asset Optimization

**Static Assets (Question Images)**
```typescript
// Store images in R2 with CDN
async uploadQuestionImage(file: Buffer, quizId: string) {
  const key = `quiz-images/${quizId}/${uuidv4()}.jpg`;

  // Upload to R2
  await this.r2Service.uploadFile(key, file);

  // Return CDN URL (cached globally)
  return `https://cdn.southville-nhs.com/${key}`;
}

// CDN configuration (Cloudflare)
// - Browser cache: 7 days
// - CDN cache: 30 days
// - Image optimization: WebP conversion, lazy loading
```

---

#### Load Balancing & Horizontal Scaling

**NestJS Clustering (Node.js Cluster Mode)**
```typescript
// main.ts - Enable clustering
import cluster from 'cluster';
import os from 'os';

async function bootstrap() {
  if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;

    console.log(`Primary ${process.pid} is running`);
    console.log(`Forking ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    console.log(`Worker ${process.pid} started`);
  }
}
```

**Stateless Design (Enables Horizontal Scaling)**
- ✅ Session data in cache (in-memory for single server)
- ✅ WebSocket state shared via Socket.io (single server)
- ✅ No local file storage (use R2)

**Current Setup (Single Server - FREE):**
```typescript
// Default Socket.io adapter (single server)
// No additional configuration needed
// Works out of the box for < 1000 concurrent users
```

**Future Upgrade (Multi-Server - When Needed):**
```typescript
// WebSocket Redis adapter (for multi-instance scaling)
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();

    server.adapter(createAdapter(pubClient, subClient));
    return server;
  }
}

// main.ts (only when horizontal scaling)
app.useWebSocketAdapter(new RedisIoAdapter(app));
```

**Note**: Only implement Redis adapter when deploying multiple backend instances.

---

### 8.4 Monitoring & Performance Metrics

#### Application Performance Monitoring (APM)

**1. Request Logging with Timing**
```typescript
// logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        console.log(`${method} ${url} - ${responseTime}ms`);

        // Send to monitoring service (e.g., DataDog, New Relic)
        this.metricsService.recordRequest({
          method,
          url,
          responseTime,
          timestamp: new Date(),
        });
      }),
    );
  }
}
```

**2. Database Query Performance Tracking**
```typescript
// Track slow queries
class SupabaseWrapper {
  async query(query: () => Promise<any>) {
    const start = Date.now();
    const result = await query();
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(`Slow query detected: ${duration}ms`);
      // Alert or log to monitoring
    }

    return result;
  }
}
```

**3. WebSocket Connection Metrics**
```typescript
@WebSocketGateway()
export class QuizMonitoringGateway {
  private connectionCount = 0;

  handleConnection(client: Socket) {
    this.connectionCount++;
    this.metricsService.gauge('websocket.connections', this.connectionCount);
  }

  handleDisconnect(client: Socket) {
    this.connectionCount--;
    this.metricsService.gauge('websocket.connections', this.connectionCount);
  }
}
```

---

#### Health Checks

**NestJS Health Module**
```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private supabaseService: SupabaseService,
    private r2Service: R2StorageService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health (Supabase)
      async () => {
        try {
          const { data, error } = await this.supabaseService
            .getClient()
            .from('quizzes')
            .select('count')
            .limit(1);

          return {
            database: {
              status: error ? 'down' : 'up'
            }
          };
        } catch (e) {
          return { database: { status: 'down' } };
        }
      },

      // Cache health (In-Memory)
      async () => {
        try {
          await this.cacheManager.set('health_check', 'ok', 1000);
          const result = await this.cacheManager.get('health_check');
          return {
            cache: {
              status: result === 'ok' ? 'up' : 'down'
            }
          };
        } catch (e) {
          return { cache: { status: 'down' } };
        }
      },

      // R2 storage health
      async () => {
        const isHealthy = await this.r2Service.healthCheck();
        return {
          r2: {
            status: isHealthy ? 'up' : 'down'
          }
        };
      },
    ]);
  }
}
```

**Response Example:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "cache": { "status": "up" },
    "r2": { "status": "up" }
  }
}
```

---

### 8.5 Security Best Practices Checklist

#### Pre-Production Security Audit

**✅ Authentication & Authorization**
- [ ] JWT tokens validated on every request
- [ ] Role-based access control enforced
- [ ] RLS policies enabled on all Supabase tables
- [ ] Session timeout configured (30 minutes)
- [ ] Refresh token rotation enabled

**✅ Input Validation**
- [ ] All DTOs use class-validator
- [ ] File uploads validated (MIME type, size, extension)
- [ ] UUIDs validated before database queries
- [ ] HTML sanitized with DOMPurify
- [ ] SQL injection prevention via parameterized queries

**✅ Rate Limiting**
- [ ] Global rate limit: 100 req/min per IP
- [ ] Quiz creation: 10/hour per teacher
- [ ] Quiz attempts: 5/hour per student per quiz
- [ ] Flag reporting: 100/hour per student

**✅ Data Protection**
- [ ] HTTPS enforced in production
- [ ] Sensitive data encrypted at rest (optional)
- [ ] PII anonymized in analytics
- [ ] CORS configured for production domain
- [ ] CSRF protection on state-changing endpoints

**✅ Monitoring**
- [ ] APM tool configured (optional: DataDog, New Relic)
- [ ] Error tracking enabled (optional: Sentry)
- [ ] Slow query alerts set up (>1s)
- [ ] Health check endpoint configured (database, cache, R2)
- [ ] Basic logging enabled (console/file logs)
- [ ] Log aggregation configured (optional: ELK, CloudWatch)

**✅ Infrastructure**
- [ ] Environment variables secured (not in code)
- [ ] API keys rotated regularly
- [ ] Database backups automated (daily)
- [ ] Disaster recovery plan documented
- [ ] Load balancing configured

---

### 8.6 Performance Benchmarks (Target Metrics)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time** | < 200ms | 95th percentile |
| **Database Query Time** | < 100ms | Average |
| **WebSocket Latency** | < 50ms | Flag to teacher |
| **Quiz Load Time** | < 1s | Full quiz with 50 questions |
| **Concurrent Users** | 1,000-5,000 | Students taking quizzes (single server) |
| **WebSocket Connections** | 100-500 | Teachers monitoring |
| **Cache Hit Rate** | > 70% | In-memory cache |
| **Database Connection Pool** | < 80% utilized | Peak load |
| **Memory Usage** | < 512MB | Per NestJS instance (includes cache) |
| **CPU Usage** | < 70% | Per instance |

**Notes:**
- Memory usage includes in-memory cache (adjust based on cache size)
- For > 5000 concurrent users, consider Redis upgrade
- Cache hit rate lower than Redis due to server restart cache loss (acceptable)

---

## 9. Question Types

### 9.1 Simple Question Types (Existing Tables)

| Type | Storage | Auto-Grade | Notes |
|------|---------|------------|-------|
| **Multiple Choice** | `quiz_choices` with single `is_correct` | ✅ Yes | Standard MCQ |
| **True/False** | `quiz_choices` (2 choices) | ✅ Yes | Special case of MCQ |
| **Dropdown** | `quiz_choices` | ✅ Yes | Like MCQ, different UI |
| **Linear Scale** | `quiz_choices` (e.g., 1-5) | ✅ Yes | Numeric scale |
| **Checkbox** | `quiz_choices` with multiple `is_correct` | ✅ Yes | All-or-nothing (no partial) |
| **Short Answer** | `quiz_student_answers.answer_text` | ❌ Manual | Teacher grades |
| **Essay** | `quiz_student_answers.answer_text` | ❌ Manual | Teacher grades |

---

### 9.2 Complex Question Types (Metadata Table Approach)

**Approach**: Separate `quiz_question_metadata` table for better organization

#### Storage Strategy
```json
// Fill-in-the-Blank (multiple blanks)
{
  "blanks": [
    { "position": 1, "answer": "photosynthesis" },
    { "position": 2, "answer": "chlorophyll" }
  ]
}

// Matching
{
  "matches": [
    { "left_id": "A", "right_id": "3" },
    { "left_id": "B", "right_id": "1" }
  ]
}

// Ordering
{
  "order": ["item_3", "item_1", "item_4", "item_2"]
}

// Drag-and-Drop
{
  "placements": [
    { "item_id": "item_1", "zone_id": "zone_2" },
    { "item_id": "item_2", "zone_id": "zone_1" }
  ]
}
```

**Question Metadata Storage** (in `quiz_question_metadata` table):
```sql
-- Matching question example
{
  "metadata_type": "matching_pairs",
  "metadata": {
    "pairs": [
      {"left": "Mitochondria", "right": "Powerhouse of the cell", "correct": true},
      {"left": "Nucleus", "right": "Control center", "correct": true}
    ]
  }
}

-- Ordering question example
{
  "metadata_type": "ordering_items",
  "metadata": {
    "items": [
      {"text": "Step 1: Mix ingredients", "correct_order": 1},
      {"text": "Step 2: Bake", "correct_order": 2}
    ]
  }
}

-- Drag-and-drop example
{
  "metadata_type": "drag_drop_zones",
  "metadata": {
    "zones": [
      {"id": "zone1", "label": "Mammals", "accepts": ["item1", "item3"]},
      {"id": "zone2", "label": "Reptiles", "accepts": ["item2", "item4"]}
    ]
  }
}
```

**Student Answer Storage** (in `quiz_student_answers.answer_json`):
- Same JSONB structure as question metadata
- Compared during auto-grading

---

### 9.3 Fill-in-the-Blank Details

**From Q24**: Has definite answer, not case-sensitive

**Question text format**:
```
"The process of _____ converts sunlight into energy using _____."
```

**Correct answer storage** (`quiz_question_metadata`):
```json
{
  "blanks": [
    {
      "position": 1,
      "correct_answers": ["photosynthesis"],
      "case_sensitive": false
    },
    {
      "position": 2,
      "correct_answers": ["chlorophyll"],
      "case_sensitive": false
    }
  ]
}
```

**Student answer** (`quiz_student_answers.answer_json`):
```json
{
  "blanks": [
    { "position": 1, "answer": "Photosynthesis" }, // Matches (case-insensitive)
    { "position": 2, "answer": "chlorophyl" }      // Doesn't match
  ]
}
```

**Auto-grading**: Compare each blank (case-insensitive), all-or-nothing

---

## 10. Grading System

### 10.1 Auto-Grading Logic

```typescript
// Pseudo-code for auto-grading on submission

async autoGradeAttempt(attemptId: string) {
  const answers = await getStudentAnswers(attemptId);
  let totalScore = 0;

  for (const answer of answers) {
    const question = await getQuestion(answer.question_id);

    switch (question.question_type) {
      case 'multiple_choice':
      case 'true_false':
      case 'dropdown':
        const isCorrect = answer.choice_id === getCorrectChoiceId(question);
        answer.points_awarded = isCorrect ? question.points : 0;
        answer.is_correct = isCorrect;
        break;

      case 'checkbox':
        const correctChoiceIds = getCorrectChoiceIds(question);
        const studentChoiceIds = answer.choice_ids;
        const isExactMatch = arraysEqual(correctChoiceIds, studentChoiceIds);
        answer.points_awarded = isExactMatch ? question.points : 0; // All-or-nothing
        answer.is_correct = isExactMatch;
        break;

      case 'fill_in_blank':
        const metadata = await getQuestionMetadata(question.id);
        let allCorrect = true;
        for (const blank of metadata.blanks) {
          const studentAnswer = answer.answer_json.blanks.find(b => b.position === blank.position);
          if (!studentAnswer || !blank.correct_answers.includes(studentAnswer.answer.toLowerCase())) {
            allCorrect = false;
            break;
          }
        }
        answer.points_awarded = allCorrect ? question.points : 0;
        answer.is_correct = allCorrect;
        break;

      case 'essay':
      case 'short_answer':
        // Skip auto-grading
        answer.is_correct = null; // Pending manual grading
        answer.points_awarded = 0;
        break;

      case 'matching':
      case 'ordering':
      case 'drag_drop':
        // Complex types: Compare answer_json with quiz_question_metadata
        const questionMetadata = await getQuestionMetadata(question.id);
        const isCorrectComplex = compareComplexAnswer(
          answer.answer_json,
          questionMetadata.metadata
        );
        answer.points_awarded = isCorrectComplex ? question.points : 0;
        answer.is_correct = isCorrectComplex;
        break;
    }

    await updateStudentAnswer(answer);
    totalScore += answer.points_awarded;
  }

  await updateAttemptScore(attemptId, totalScore);
}
```

---

### 10.2 Manual Grading Flow

#### 1. Teacher Grading Queue
```typescript
GET /api/v1/quizzes/:quizId/grading-queue

Response:
{
  pending_grading: [
    {
      attempt_id: "...",
      student_id: "...",
      student_name: "Jane Doe",
      submitted_at: "...",
      essay_questions: [
        {
          question_id: "...",
          question_text: "Explain photosynthesis",
          answer_text: "Photosynthesis is...",
          max_points: 10
        }
      ]
    }
  ]
}
```

#### 2. Grade Single Answer
```typescript
PATCH /api/v1/quiz-attempts/:attemptId/grade-answer/:answerId

Body:
{
  points_awarded: 8.5,
  grader_feedback: "Good explanation, but missing details on chloroplast structure"
}

Updates:
- quiz_student_answers.points_awarded = 8.5
- quiz_student_answers.is_correct = true (if points > 0)
- quiz_student_answers.graded_by = teacher_id
- quiz_student_answers.graded_at = NOW()
- quiz_student_answers.grader_feedback = "..."
```

#### 3. Finalize Grading
```typescript
POST /api/v1/quiz-attempts/:attemptId/finalize-grading

Actions:
1. Recalculate total score (auto + manual)
2. Update quiz_attempts.score
3. Update quiz_attempts.status = 'graded'
4. Recalculate quiz_student_summary.average_score
5. Notify student (email/notification)
```

---

### 10.3 Score Calculation (Multiple Attempts)

```typescript
async calculateFinalScore(studentId: string, quizId: string) {
  const attempts = await getAttempts(studentId, quizId);

  // Filter out terminated/invalid attempts (if needed)
  const validAttempts = attempts.filter(a => a.status === 'graded');

  // Calculate average (as per Q1)
  const scores = validAttempts.map(a => a.score);
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  // Update summary
  await updateStudentSummary({
    student_id: studentId,
    quiz_id: quizId,
    average_score: averageScore, // THIS is the official score
    highest_score: highestScore,
    lowest_score: lowestScore,
    latest_score: scores[scores.length - 1],
    attempts_count: validAttempts.length
  });
}
```

---

## 11. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Database schema implementation (all tables)
- [ ] Quiz CRUD endpoints (teacher)
- [ ] Question bank CRUD
- [ ] Quiz builder with auto-save
- [ ] Basic question types (MCQ, True/False, Short Answer, Essay)

### Phase 2: Student Quiz Taking (Weeks 3-4)
- [ ] Student quiz access flow
- [ ] Session management (single active session)
- [ ] Auto-save mechanism (every 2 answers / 20s)
- [ ] Quiz submission & auto-grading
- [ ] Retake logic
- [ ] Time limits (quiz-level & per-question)

### Phase 3: Security & Monitoring (Weeks 5-6)
- [ ] Device fingerprinting
- [ ] Tab switch detection
- [ ] Fullscreen enforcement
- [ ] Flag creation system
- [ ] Activity logging
- [ ] WebSocket gateway for real-time events
- [ ] Polling endpoint for progress updates

### Phase 4: Live Monitoring Dashboard (Week 7)
- [ ] Teacher live monitoring UI (frontend)
- [ ] Real-time participant tracking
- [ ] Flag display & severity indicators
- [ ] Remote quiz termination
- [ ] Activity log viewer

### Phase 5: Grading & Analytics (Weeks 8-9)
- [ ] Manual grading interface
- [ ] Grading queue management
- [ ] Score calculation & summary updates
- [ ] Quiz analytics generation
- [ ] Question statistics
- [ ] Export results (CSV/Excel)

### Phase 6: Advanced Features (Weeks 10-11)
- [ ] Complex question types (matching, ordering, drag-drop)
- [ ] Question pool randomization
- [ ] Shuffle questions/choices
- [ ] Section-based settings & deadlines
- [ ] Access links & QR codes
- [ ] Quiz versioning system

### Phase 7: Testing & Optimization (Week 12)
- [ ] End-to-end testing
- [ ] Performance optimization (query indexing)
- [ ] Security audit
- [ ] WebSocket load testing
- [ ] Documentation finalization

---

## 12. Final Architecture Decisions

### 12.1 Design Decisions Summary

All critical architecture questions have been resolved:

**✅ Q32: Quiz Builder Auto-Save**
- **Decision**: Keystroke-based debounce (15 seconds after last keystroke)
- Immediate save on new question creation
- Manual save button available

**✅ Q33: Quiz Versioning**
- **Decision**: Version locked per student attempt
- Students who started quiz → see old version
- New students → see latest version
- Preserves integrity of in-progress attempts

**✅ Q34: Question Bank Sharing**
- **Decision**: Teacher-specific only (no cross-teacher sharing)
- Each teacher maintains their own question bank
- Import creates copies (editing doesn't affect original)

**✅ Q35: Complex Question Types Storage**
- **Decision**: Separate `quiz_question_metadata` table
- Better organization and type-specific validation
- Metadata type field for categorization
- JSONB for flexible structure

**✅ Q36: Real-Time Architecture**
- **Decision**: Hybrid WebSocket + Polling
- Students: HTTP POST only (scalable)
- Teachers: WebSocket (instant) + Polling (state sync)
- Fault-tolerant with event reconciliation

**✅ Q37: Offline Handling**
- **Decision**: localStorage + Auto-Sync
- Answers saved locally first (works offline)
- Auto-sync on reconnection
- Last-write-wins conflict resolution

**✅ Q38: Question Pool Randomization**
- **Decision**: Per-attempt randomization
- Each retake gets different random questions
- Questions stored in `quiz_attempts.questions_shown`
- Prevents memorization, enhances fairness

---

## 13. Technology Stack & Implementation Readiness

### 13.1 Confirmed Technology Stack

**Backend (NestJS)**:
- ✅ **Framework**: NestJS 11 with Fastify adapter
- ✅ **Database**: Supabase PostgreSQL with RLS
- ✅ **Authentication**: Supabase Auth (JWT)
- ✅ **Real-time**: Socket.io with NestJS WebSocket Gateway
- ✅ **Caching**: NestJS In-Memory Cache (FREE, built-in)
- ✅ **File Storage**: Cloudflare R2 (for question images/media)
- 🔄 **Optional**: Redis (only if scaling to multiple servers)

**Frontend Integration**:
- ✅ **Device Fingerprinting**: `@fingerprintjs/fingerprintjs`
- ✅ **Offline Storage**: localStorage API
- ✅ **Real-time Client**: Socket.io client
- ✅ **State Management**: Zustand (already in use)

**Cost Breakdown (Monthly)**:
| Service | Cost | Required |
|---------|------|----------|
| Supabase | FREE tier (500MB) | ✅ Yes |
| Cloudflare R2 | FREE tier (10GB) | ✅ Yes |
| NestJS Cache | FREE (built-in) | ✅ Yes |
| Socket.io | FREE (included) | ✅ Yes |
| Redis | $0-10/month | ❌ Optional |
| **Total (MVP)** | **$0/month** | 🎉 |

### 13.2 Implementation Readiness Checklist

**Architecture Design**:
- ✅ All 17 database tables defined
- ✅ API endpoints mapped (40+ endpoints)
- ✅ Real-time architecture finalized (Hybrid WebSocket + Polling)
- ✅ Security measures documented
- ✅ All critical decisions resolved (Q32-Q38)

**Ready for Development**:
1. ✅ Database schema complete
2. ✅ Data flows documented
3. ✅ Business logic defined
4. ✅ Security strategy confirmed
5. ✅ Performance considerations addressed

### 13.3 Next Steps - Ready to Build

**Immediate Actions**:
1. **Create database migrations** (SQL scripts for all 17 tables)
2. **Set up NestJS module structure** (quiz, question-bank, monitoring modules)
3. **Begin Phase 1 implementation** (Foundation: CRUD + Question Bank)

**Recommended Start**: Phase 1 - Foundation (Weeks 1-2)
- Database schema implementation
- Quiz CRUD endpoints
- Question bank system
- Basic question types

All design decisions are finalized. System is ready for implementation! 🚀

---

## Appendix: Database Indexes (Performance)

**Recommended indexes** (create after schema):

```sql
-- Quizzes
CREATE INDEX idx_quizzes_teacher_id ON quizzes(teacher_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_quizzes_subject_id ON quizzes(subject_id);

-- Quiz Questions
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_order ON quiz_questions(quiz_id, order_index);

-- Quiz Attempts
CREATE INDEX idx_quiz_attempts_student_quiz ON quiz_attempts(student_id, quiz_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);

-- Quiz Student Answers
CREATE INDEX idx_quiz_student_answers_attempt ON quiz_student_answers(attempt_id);
CREATE INDEX idx_quiz_student_answers_question ON quiz_student_answers(question_id);

-- Quiz Active Sessions
CREATE INDEX idx_quiz_active_sessions_student_quiz ON quiz_active_sessions(student_id, quiz_id);
CREATE INDEX idx_quiz_active_sessions_active ON quiz_active_sessions(is_active);

-- Quiz Flags
CREATE INDEX idx_quiz_flags_session ON quiz_flags(session_id);
CREATE INDEX idx_quiz_flags_quiz ON quiz_flags(quiz_id);
CREATE INDEX idx_quiz_flags_severity ON quiz_flags(severity);
CREATE INDEX idx_quiz_flags_timestamp ON quiz_flags(timestamp DESC);

-- Quiz Participants
CREATE INDEX idx_quiz_participants_quiz ON quiz_participants(quiz_id);
CREATE INDEX idx_quiz_participants_status ON quiz_participants(status);
```

---

**END OF DOCUMENTATION**

🎉 **System Design Complete!** All architecture decisions finalized and documented. Ready for Phase 1 implementation.
