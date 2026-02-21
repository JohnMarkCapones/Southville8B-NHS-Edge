# Quiz System Database Schema

Complete schema documentation for all quiz-related tables in Supabase.

## Table Overview

### Core Quiz Tables
1. **quizzes** - Main quiz/assessment table
2. **question_bank** - Reusable question bank for teachers
3. **quiz_questions** - Questions assigned to quizzes
4. **quiz_choices** - Answer choices for questions
5. **quiz_sections** - Quiz-to-section assignments
6. **quiz_section_settings** - Section-specific quiz settings

### Quiz Configuration
7. **quiz_settings** - Security and proctoring settings
8. **quiz_question_metadata** - Additional metadata for questions

### Quiz Execution & Tracking
9. **quiz_attempts** - Student quiz attempts
10. **quiz_active_sessions** - Active quiz sessions
11. **quiz_participants** - Participant tracking during quiz
12. **quiz_session_answers** - Temporary answers during session
13. **quiz_student_answers** - Final submitted answers
14. **quiz_student_summary** - Student performance summary

### Security & Monitoring
15. **quiz_device_sessions** - Device fingerprinting tracking
16. **quiz_flags** - Security flags/incidents
17. **quiz_activity_logs** - Activity event logging

### Analytics & Statistics
18. **quiz_analytics** - Quiz-level analytics
19. **quiz_question_stats** - Question-level statistics

### Access Control
20. **quiz_access_links** - Shareable quiz access links
21. **quiz_access_logs** - Access link usage logs

---

## Detailed Table Schemas

### 1. `quizzes` (Main Quiz Table)
**Primary Key:** `quiz_id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `quiz_id` | uuid | NO | uuid_generate_v4() | Primary key |
| `title` | varchar(255) | NO | - | Quiz title |
| `description` | text | YES | - | Quiz description |
| `subject_id` | uuid | YES | - | FK to subjects table |
| `teacher_id` | uuid | YES | - | FK to teachers/users |
| `type` | varchar(50) | YES | 'form' | Quiz type |
| `grading_type` | varchar(50) | YES | 'auto' | Auto or manual grading |
| `time_limit` | integer | YES | - | Time limit in seconds |
| `start_date` | timestamptz | YES | - | Quiz start date/time |
| `end_date` | timestamptz | YES | - | Quiz end date/time |
| `status` | varchar(20) | YES | 'draft' | draft, published, etc. |
| `version` | integer | YES | 1 | Version number |
| `parent_quiz_id` | uuid | YES | - | Self-referential FK (for versions) |
| `visibility` | varchar(20) | YES | 'section_only' | Visibility setting |
| `question_pool_size` | integer | YES | - | Size of question pool |
| `questions_to_display` | integer | YES | - | Number of questions to show |
| `allow_retakes` | boolean | YES | false | Allow multiple attempts |
| `allow_backtracking` | boolean | YES | true | Allow going back to previous questions |
| `shuffle_questions` | boolean | YES | false | Randomize question order |
| `shuffle_choices` | boolean | YES | false | Randomize answer choices |
| `total_points` | numeric | YES | - | Total possible points |
| `passing_score` | numeric | YES | - | Minimum passing score |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

**Foreign Keys:**
- `parent_quiz_id` → `quizzes.quiz_id` (self-referential for versioning)

---

### 2. `question_bank` (Question Bank)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `teacher_id` | uuid | YES | - | FK to teachers |
| `question_text` | text | NO | - | Question content |
| `question_type` | varchar(50) | NO | - | Type of question |
| `subject_id` | uuid | YES | - | FK to subjects |
| `topic` | varchar(255) | YES | - | Topic/tag |
| `difficulty` | varchar(20) | YES | - | Difficulty level |
| `tags` | text[] | YES | - | Array of tags |
| `default_points` | numeric | YES | 1 | Default point value |
| `choices` | jsonb | YES | - | Answer choices (JSON) |
| `correct_answer` | jsonb | YES | - | Correct answer(s) (JSON) |
| `allow_partial_credit` | boolean | YES | false | Allow partial credit |
| `time_limit_seconds` | integer | YES | - | Per-question time limit |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

**Foreign Keys:**
- None (used as source for quiz_questions)

---

### 3. `quiz_questions` (Quiz Questions)
**Primary Key:** `question_id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `question_id` | uuid | NO | uuid_generate_v4() | Primary key |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `question_text` | text | NO | - | Question content |
| `question_type` | varchar(50) | NO | - | Type of question |
| `order_index` | integer | NO | - | Display order |
| `points` | numeric | NO | 1 | Point value |
| `allow_partial_credit` | boolean | YES | false | Allow partial credit |
| `time_limit_seconds` | integer | YES | - | Per-question time limit |
| `is_pool_question` | boolean | YES | false | Is from question pool |
| `source_question_bank_id` | uuid | YES | - | FK to question_bank |
| `correct_answer` | jsonb | YES | - | Correct answer(s) |
| `settings` | jsonb | YES | - | Additional settings |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

**Foreign Keys:**
- `quiz_id` → `quizzes.quiz_id`
- `source_question_bank_id` → `question_bank.id`

---

### 4. `quiz_choices` (Answer Choices)
**Primary Key:** `choice_id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `choice_id` | uuid | NO | uuid_generate_v4() | Primary key |
| `question_id` | uuid | YES | - | FK to quiz_questions |
| `choice_text` | text | NO | - | Choice text |
| `is_correct` | boolean | YES | false | Is correct answer |
| `order_index` | integer | YES | - | Display order |
| `metadata` | jsonb | YES | - | Additional metadata |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**Foreign Keys:**
- `question_id` → `quiz_questions.question_id`

---

### 5. `quiz_sections` (Quiz-Section Assignment)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `section_id` | uuid | YES | - | FK to sections |
| `assigned_at` | timestamptz | YES | now() | Assignment timestamp |

**Foreign Keys:**
- `quiz_id` → `quizzes.quiz_id`
- `section_id` → `sections.id`

---

### 6. `quiz_section_settings` (Section-Specific Settings)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `section_id` | uuid | YES | - | FK to sections |
| `start_date` | timestamptz | YES | - | Section-specific start date |
| `end_date` | timestamptz | YES | - | Section-specific end date |
| `time_limit_override` | integer | YES | - | Override time limit for section |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**Foreign Keys:**
- `quiz_id` → `quizzes.quiz_id`

---

### 7. `quiz_settings` (Security & Proctoring Settings)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `quiz_id` | uuid | YES | UNIQUE | FK to quizzes (1:1) |
| `lockdown_browser` | boolean | YES | false | Require lockdown browser |
| `anti_screenshot` | boolean | YES | false | Prevent screenshots |
| `disable_copy_paste` | boolean | YES | false | Disable copy/paste |
| `disable_right_click` | boolean | YES | false | Disable right-click |
| `require_fullscreen` | boolean | YES | false | Require fullscreen mode |
| `track_tab_switches` | boolean | YES | true | Track tab switching |
| `track_device_changes` | boolean | YES | true | Track device changes |
| `track_ip_changes` | boolean | YES | true | Track IP address changes |
| `tab_switch_warning_threshold` | integer | YES | 3 | Max tab switches before warning |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**Foreign Keys:**
- `quiz_id` → `quizzes.quiz_id` (unique, one-to-one)

---

### 8. `quiz_question_metadata` (Question Metadata)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `question_id` | uuid | YES | UNIQUE | FK to quiz_questions (1:1) |
| `metadata_type` | varchar(50) | NO | - | Type of metadata |
| `metadata` | jsonb | NO | - | Metadata content |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**Foreign Keys:**
- `question_id` → `quiz_questions.question_id` (unique, one-to-one)

---

### 9. `quiz_attempts` (Student Attempts)
**Primary Key:** `attempt_id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `attempt_id` | uuid | NO | uuid_generate_v4() | Primary key |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `student_id` | uuid | YES | - | FK to students |
| `attempt_number` | integer | NO | - | Attempt sequence number |
| `score` | numeric | YES | - | Final score |
| `max_possible_score` | numeric | YES | - | Maximum possible score |
| `status` | varchar(20) | YES | 'in_progress' | in_progress, completed, etc. |
| `terminated_by_teacher` | boolean | YES | false | Was terminated by teacher |
| `termination_reason` | text | YES | - | Reason for termination |
| `started_at` | timestamptz | YES | now() | Start timestamp |
| `submitted_at` | timestamptz | YES | - | Submission timestamp |
| `time_taken_seconds` | integer | YES | - | Total time taken |
| `questions_shown` | uuid[] | YES | - | Array of question IDs shown |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**Foreign Keys:**
- `quiz_id` → `quizzes.quiz_id`

---

### 10. `quiz_active_sessions` (Active Quiz Sessions)
**Primary Key:** `session_id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `session_id` | uuid | NO | uuid_generate_v4() | Primary key |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `student_id` | uuid | YES | - | FK to students |
| `attempt_id` | uuid | YES | - | FK to quiz_attempts |
| `started_at` | timestamptz | YES | now() | Session start time |
| `last_synced_at` | timestamptz | YES | now() | Last sync time |
| `is_active` | boolean | YES | true | Is session active |
| `initial_device_fingerprint` | text | YES | - | Initial device fingerprint |
| `initial_ip_address` | inet | YES | - | Initial IP address |
| `initial_user_agent` | text | YES | - | Initial user agent |
| `last_heartbeat` | timestamptz | YES | - | Last heartbeat timestamp |
| `current_device_fingerprint` | text | YES | - | Current device fingerprint |
| `current_ip_address` | inet | YES | - | Current IP address |
| `current_user_agent` | text | YES | - | Current user agent |
| `terminated_reason` | text | YES | - | Termination reason |

**Foreign Keys:**
- `quiz_id` → `quizzes.quiz_id`
- `attempt_id` → `quiz_attempts.attempt_id`

---

### 11. `quiz_participants` (Participant Tracking)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `session_id` | uuid | YES | UNIQUE | FK to quiz_active_sessions |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `student_id` | uuid | YES | - | FK to students |
| `status` | varchar(50) | YES | 'not_started' | Participant status |
| `progress` | integer | YES | 0 | Progress percentage |
| `current_question_index` | integer | YES | 0 | Current question index |
| `questions_answered` | integer | YES | 0 | Number answered |
| `total_questions` | integer | NO | - | Total questions |
| `start_time` | timestamptz | YES | - | Start time |
| `end_time` | timestamptz | YES | - | End time |
| `flag_count` | integer | YES | 0 | Number of security flags |
| `idle_time_seconds` | integer | YES | 0 | Total idle time |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

**Foreign Keys:**
- `session_id` → `quiz_active_sessions.session_id` (unique)
- `quiz_id` → `quizzes.quiz_id`

---

### 12. `quiz_session_answers` (Temporary Session Answers)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `session_id` | uuid | YES | - | FK to quiz_active_sessions |
| `question_id` | uuid | YES | - | FK to quiz_questions |
| `temporary_choice_id` | uuid | YES | - | Temporary choice selection |
| `temporary_choice_ids` | uuid[] | YES | - | Multiple choice selections |
| `temporary_answer_text` | text | YES | - | Text answer |
| `temporary_answer_json` | jsonb | YES | - | JSON answer data |
| `last_updated` | timestamptz | YES | now() | Last update timestamp |

**Foreign Keys:**
- `session_id` → `quiz_active_sessions.session_id`
- `question_id` → `quiz_questions.question_id`

---

### 13. `quiz_student_answers` (Final Submitted Answers)
**Primary Key:** `answer_id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `answer_id` | uuid | NO | uuid_generate_v4() | Primary key |
| `attempt_id` | uuid | YES | - | FK to quiz_attempts |
| `question_id` | uuid | YES | - | FK to quiz_questions |
| `choice_id` | uuid | YES | - | FK to quiz_choices (single) |
| `choice_ids` | uuid[] | YES | - | Multiple choice selections |
| `answer_text` | text | YES | - | Text answer |
| `answer_json` | jsonb | YES | - | JSON answer data |
| `points_awarded` | numeric | YES | 0 | Points awarded |
| `is_correct` | boolean | YES | - | Is answer correct |
| `graded_by` | uuid | YES | - | FK to users (manual grader) |
| `graded_at` | timestamptz | YES | - | Grading timestamp |
| `grader_feedback` | text | YES | - | Grader feedback |
| `time_spent_seconds` | integer | YES | - | Time spent on question |
| `answered_at` | timestamptz | YES | now() | Answer timestamp |

**Foreign Keys:**
- `attempt_id` → `quiz_attempts.attempt_id`
- `question_id` → `quiz_questions.question_id`
- `choice_id` → `quiz_choices.choice_id`

---

### 14. `quiz_student_summary` (Student Performance Summary)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `student_id` | uuid | YES | - | FK to students |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `last_attempt_id` | uuid | YES | - | FK to quiz_attempts |
| `attempts_count` | integer | YES | 1 | Total attempts |
| `highest_score` | numeric | YES | - | Highest score achieved |
| `lowest_score` | numeric | YES | - | Lowest score |
| `latest_score` | numeric | YES | - | Most recent score |
| `average_score` | numeric | YES | - | Average score |
| `status` | varchar(20) | YES | 'in_progress' | Overall status |
| `passed` | boolean | YES | - | Has passed quiz |
| `last_updated` | timestamptz | YES | now() | Last update timestamp |

**Foreign Keys:**
- `quiz_id` → `quizzes.quiz_id`
- `last_attempt_id` → `quiz_attempts.attempt_id`

---

### 15. `quiz_device_sessions` (Device Fingerprinting)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `session_id` | uuid | YES | - | FK to quiz_active_sessions |
| `device_fingerprint` | text | NO | - | Device fingerprint |
| `ip_address` | inet | YES | - | IP address |
| `user_agent` | text | YES | - | User agent string |
| `screen_resolution` | varchar(20) | YES | - | Screen resolution |
| `browser_info` | jsonb | YES | - | Browser information |
| `device_type` | varchar(20) | YES | - | Device type |
| `first_seen_at` | timestamptz | YES | now() | First seen timestamp |
| `last_seen_at` | timestamptz | YES | now() | Last seen timestamp |
| `is_current` | boolean | YES | true | Is current device |

**Foreign Keys:**
- `session_id` → `quiz_active_sessions.session_id`

---

### 16. `quiz_flags` (Security Flags/Incidents)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `participant_id` | uuid | YES | - | FK to quiz_participants |
| `session_id` | uuid | YES | - | FK to quiz_active_sessions |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `student_id` | uuid | YES | - | FK to students |
| `flag_type` | varchar(100) | NO | - | Type of flag |
| `message` | text | YES | - | Flag message |
| `severity` | varchar(50) | YES | 'info' | Flag severity |
| `metadata` | jsonb | YES | - | Additional flag data |
| `timestamp` | timestamptz | YES | now() | Flag timestamp |

**Foreign Keys:**
- `participant_id` → `quiz_participants.id`
- `session_id` → `quiz_active_sessions.session_id`
- `quiz_id` → `quizzes.quiz_id`

---

### 17. `quiz_activity_logs` (Activity Event Logging)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `participant_id` | uuid | YES | - | FK to quiz_participants |
| `session_id` | uuid | YES | - | FK to quiz_active_sessions |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `student_id` | uuid | YES | - | FK to students |
| `event_type` | varchar(100) | NO | - | Type of event |
| `message` | text | YES | - | Event message |
| `metadata` | jsonb | YES | - | Event metadata |
| `timestamp` | timestamptz | YES | now() | Event timestamp |

**Foreign Keys:**
- `participant_id` → `quiz_participants.id`
- `session_id` → `quiz_active_sessions.session_id`
- `quiz_id` → `quizzes.quiz_id`

---

### 18. `quiz_analytics` (Quiz-Level Analytics)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `quiz_id` | uuid | YES | UNIQUE | FK to quizzes (1:1) |
| `total_attempts` | integer | YES | 0 | Total attempts |
| `total_students` | integer | YES | 0 | Total students |
| `completed_attempts` | integer | YES | 0 | Completed attempts |
| `average_score` | numeric | YES | - | Average score |
| `highest_score` | numeric | YES | - | Highest score |
| `lowest_score` | numeric | YES | - | Lowest score |
| `median_score` | numeric | YES | - | Median score |
| `pass_rate` | numeric | YES | - | Pass rate percentage |
| `average_time_taken_seconds` | integer | YES | - | Average time |
| `fastest_completion_seconds` | integer | YES | - | Fastest completion |
| `slowest_completion_seconds` | integer | YES | - | Slowest completion |
| `last_calculated_at` | timestamptz | YES | now() | Last calculation timestamp |

**Foreign Keys:**
- `quiz_id` → `quizzes.quiz_id` (unique, one-to-one)

---

### 19. `quiz_question_stats` (Question-Level Statistics)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `question_id` | uuid | YES | UNIQUE | FK to quiz_questions (1:1) |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `total_attempts` | integer | YES | 0 | Total attempts |
| `correct_count` | integer | YES | 0 | Correct answers |
| `incorrect_count` | integer | YES | 0 | Incorrect answers |
| `skipped_count` | integer | YES | 0 | Skipped count |
| `difficulty_score` | numeric | YES | - | Difficulty score |
| `average_time_spent_seconds` | integer | YES | - | Average time spent |
| `discrimination_index` | numeric | YES | - | Discrimination index |
| `last_calculated_at` | timestamptz | YES | now() | Last calculation timestamp |

**Foreign Keys:**
- `question_id` → `quiz_questions.question_id` (unique, one-to-one)
- `quiz_id` → `quizzes.quiz_id`

---

### 20. `quiz_access_links` (Shareable Access Links)
**Primary Key:** `link_id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `link_id` | uuid | NO | uuid_generate_v4() | Primary key |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `access_token` | varchar(255) | NO | UNIQUE | Unique access token |
| `link_type` | varchar(20) | YES | 'link' | Type of link |
| `is_active` | boolean | YES | true | Is link active |
| `expires_at` | timestamptz | YES | - | Expiration timestamp |
| `access_code` | varchar(50) | YES | - | Access code |
| `max_uses` | integer | YES | - | Maximum uses |
| `use_count` | integer | YES | 0 | Current use count |
| `requires_auth` | boolean | YES | true | Requires authentication |
| `is_revoked` | boolean | YES | false | Is revoked |
| `revoked_at` | timestamptz | YES | - | Revocation timestamp |
| `created_by` | uuid | YES | - | FK to users |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `last_used_at` | timestamptz | YES | - | Last usage timestamp |

**Foreign Keys:**
- `quiz_id` → `quizzes.quiz_id`

---

### 21. `quiz_access_logs` (Access Link Usage Logs)
**Primary Key:** `id` (uuid)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `link_id` | uuid | YES | - | FK to quiz_access_links |
| `quiz_id` | uuid | YES | - | FK to quizzes |
| `student_id` | uuid | YES | - | FK to students |
| `accessed_at` | timestamptz | YES | now() | Access timestamp |
| `ip_address` | inet | YES | - | IP address |
| `user_agent` | text | YES | - | User agent |
| `access_granted` | boolean | YES | true | Was access granted |
| `denial_reason` | text | YES | - | Denial reason if denied |
| `metadata` | jsonb | YES | - | Additional metadata |

**Foreign Keys:**
- `link_id` → `quiz_access_links.link_id`
- `quiz_id` → `quizzes.quiz_id`

---

## Table Relationships Diagram

```
quizzes (main table)
├── quiz_settings (1:1)
├── quiz_analytics (1:1)
├── quiz_sections (1:many) → sections
├── quiz_section_settings (1:many) → sections
├── quiz_questions (1:many)
│   ├── quiz_choices (1:many)
│   ├── quiz_question_metadata (1:1)
│   └── quiz_question_stats (1:1)
├── quiz_attempts (1:many)
│   └── quiz_student_answers (1:many)
│       ├── quiz_questions
│       └── quiz_choices
├── quiz_active_sessions (1:many)
│   ├── quiz_participants (1:1)
│   ├── quiz_session_answers (1:many)
│   ├── quiz_device_sessions (1:many)
│   ├── quiz_flags (1:many)
│   └── quiz_activity_logs (1:many)
├── quiz_student_summary (1:many per student)
└── quiz_access_links (1:many)
    └── quiz_access_logs (1:many)

question_bank (standalone)
└── quiz_questions (source reference)
```

---

## Key Features

### Security & Proctoring
- Device fingerprinting
- IP address tracking
- Tab switch detection
- Screenshot prevention
- Copy/paste disabling
- Fullscreen requirement
- Real-time flagging system

### Question Management
- Question bank for reusable questions
- Question pools for random selection
- Question metadata support
- Multiple question types
- Partial credit support
- Per-question time limits

### Quiz Execution
- Multiple attempts support
- Question shuffling
- Choice shuffling
- Backtracking control
- Real-time session tracking
- Temporary answer storage
- Automatic time tracking

### Analytics
- Quiz-level analytics
- Question-level statistics
- Student performance summaries
- Difficulty scoring
- Discrimination index
- Completion time tracking

### Access Control
- Section-based assignment
- Section-specific settings
- Shareable access links
- Access code support
- Usage limits
- Expiration dates

---

## Notes

- All timestamps use `timestamptz` (timezone-aware)
- UUIDs are used for all primary keys
- JSONB is used for flexible data storage (choices, answers, metadata)
- Arrays are used for tags, question IDs, and choice IDs
- Foreign key constraints ensure referential integrity
- Some tables have unique constraints for one-to-one relationships

