-- =====================================================
-- Quiz System - All Tables
-- Copy and paste this entire script into Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. quizzes
-- =====================================================
CREATE TABLE quizzes (
  quiz_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id UUID,
  teacher_id UUID,

  type VARCHAR(50) DEFAULT 'form',
  grading_type VARCHAR(50) DEFAULT 'auto',

  time_limit INT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  status VARCHAR(20) DEFAULT 'draft',
  version INT DEFAULT 1,
  parent_quiz_id UUID REFERENCES quizzes(quiz_id),

  visibility VARCHAR(20) DEFAULT 'section_only',

  question_pool_size INT,
  questions_to_display INT,

  allow_retakes BOOLEAN DEFAULT false,
  allow_backtracking BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_choices BOOLEAN DEFAULT false,

  total_points DECIMAL(6,2),
  passing_score DECIMAL(6,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. quiz_sections
-- =====================================================
CREATE TABLE quiz_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  section_id UUID,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, section_id)
);

-- =====================================================
-- 3. quiz_section_settings
-- =====================================================
CREATE TABLE quiz_section_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  section_id UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  time_limit_override INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, section_id)
);

-- =====================================================
-- 4. quiz_settings
-- =====================================================
CREATE TABLE quiz_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  lockdown_browser BOOLEAN DEFAULT false,
  anti_screenshot BOOLEAN DEFAULT false,
  disable_copy_paste BOOLEAN DEFAULT false,
  disable_right_click BOOLEAN DEFAULT false,
  require_fullscreen BOOLEAN DEFAULT false,
  track_tab_switches BOOLEAN DEFAULT true,
  track_device_changes BOOLEAN DEFAULT true,
  track_ip_changes BOOLEAN DEFAULT true,
  tab_switch_warning_threshold INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id)
);

-- =====================================================
-- 5. question_bank
-- =====================================================
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  subject_id UUID,
  topic VARCHAR(255),
  difficulty VARCHAR(20),
  tags TEXT[],
  default_points DECIMAL(5,2) DEFAULT 1,
  choices JSONB,
  correct_answer JSONB,
  allow_partial_credit BOOLEAN DEFAULT false,
  time_limit_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. quiz_questions
-- =====================================================
CREATE TABLE quiz_questions (
  question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  order_index INT NOT NULL,
  points DECIMAL(5,2) NOT NULL DEFAULT 1,
  allow_partial_credit BOOLEAN DEFAULT false,
  time_limit_seconds INT,
  is_pool_question BOOLEAN DEFAULT false,
  source_question_bank_id UUID REFERENCES question_bank(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. quiz_choices
-- =====================================================
CREATE TABLE quiz_choices (
  choice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. quiz_question_metadata
-- =====================================================
CREATE TABLE quiz_question_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
  metadata_type VARCHAR(50) NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id)
);

-- =====================================================
-- 9. quiz_attempts
-- =====================================================
CREATE TABLE quiz_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID,
  attempt_number INT NOT NULL,
  score DECIMAL(6,2),
  max_possible_score DECIMAL(6,2),
  status VARCHAR(20) DEFAULT 'in_progress',
  terminated_by_teacher BOOLEAN DEFAULT false,
  termination_reason TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INT,
  questions_shown UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. quiz_student_answers
-- =====================================================
CREATE TABLE quiz_student_answers (
  answer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
  question_id UUID REFERENCES quiz_questions(question_id),
  choice_id UUID REFERENCES quiz_choices(choice_id),
  choice_ids UUID[],
  answer_text TEXT,
  answer_json JSONB,
  points_awarded DECIMAL(5,2) DEFAULT 0,
  is_correct BOOLEAN,
  graded_by UUID,
  graded_at TIMESTAMPTZ,
  grader_feedback TEXT,
  time_spent_seconds INT,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. quiz_student_summary
-- =====================================================
CREATE TABLE quiz_student_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID,
  quiz_id UUID REFERENCES quizzes(quiz_id),
  last_attempt_id UUID REFERENCES quiz_attempts(attempt_id),
  attempts_count INT DEFAULT 1,
  highest_score DECIMAL(6,2),
  lowest_score DECIMAL(6,2),
  latest_score DECIMAL(6,2),
  average_score DECIMAL(6,2),
  status VARCHAR(20) DEFAULT 'in_progress',
  passed BOOLEAN,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, quiz_id)
);

-- =====================================================
-- 12. quiz_active_sessions
-- =====================================================
CREATE TABLE quiz_active_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID,
  attempt_id UUID REFERENCES quiz_attempts(attempt_id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  initial_device_fingerprint TEXT,
  initial_ip_address INET,
  initial_user_agent TEXT,
  UNIQUE(student_id, quiz_id)
);

-- =====================================================
-- 13. quiz_session_answers
-- =====================================================
CREATE TABLE quiz_session_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES quiz_active_sessions(session_id) ON DELETE CASCADE,
  question_id UUID REFERENCES quiz_questions(question_id),
  temporary_choice_id UUID,
  temporary_choice_ids UUID[],
  temporary_answer_text TEXT,
  temporary_answer_json JSONB,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

-- =====================================================
-- 14. quiz_device_sessions
-- =====================================================
CREATE TABLE quiz_device_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES quiz_active_sessions(session_id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  screen_resolution VARCHAR(20),
  browser_info JSONB,
  device_type VARCHAR(20),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_current BOOLEAN DEFAULT true
);

-- =====================================================
-- 15. quiz_participants
-- =====================================================
CREATE TABLE quiz_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES quiz_active_sessions(session_id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID,
  status VARCHAR(50) DEFAULT 'not_started',
  progress INT DEFAULT 0,
  current_question_index INT DEFAULT 0,
  questions_answered INT DEFAULT 0,
  total_questions INT NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  flag_count INT DEFAULT 0,
  idle_time_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id)
);

-- =====================================================
-- 16. quiz_flags
-- =====================================================
CREATE TABLE quiz_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES quiz_participants(id) ON DELETE CASCADE,
  session_id UUID REFERENCES quiz_active_sessions(session_id),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID,
  flag_type VARCHAR(100) NOT NULL,
  message TEXT,
  severity VARCHAR(50) DEFAULT 'info',
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. quiz_activity_logs
-- =====================================================
CREATE TABLE quiz_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES quiz_participants(id) ON DELETE CASCADE,
  session_id UUID REFERENCES quiz_active_sessions(session_id),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  student_id UUID,
  event_type VARCHAR(100) NOT NULL,
  message TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 18. quiz_analytics
-- =====================================================
CREATE TABLE quiz_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  total_attempts INT DEFAULT 0,
  total_students INT DEFAULT 0,
  completed_attempts INT DEFAULT 0,
  average_score DECIMAL(6,2),
  highest_score DECIMAL(6,2),
  lowest_score DECIMAL(6,2),
  median_score DECIMAL(6,2),
  pass_rate DECIMAL(5,2),
  average_time_taken_seconds INT,
  fastest_completion_seconds INT,
  slowest_completion_seconds INT,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id)
);

-- =====================================================
-- 19. quiz_question_stats
-- =====================================================
CREATE TABLE quiz_question_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(quiz_id),
  total_attempts INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  skipped_count INT DEFAULT 0,
  difficulty_score DECIMAL(5,2),
  average_time_spent_seconds INT,
  discrimination_index DECIMAL(3,2),
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id)
);

-- =====================================================
-- 20. quiz_access_links
-- =====================================================
CREATE TABLE quiz_access_links (
  link_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  access_token VARCHAR(255) UNIQUE NOT NULL,
  link_type VARCHAR(20) DEFAULT 'link',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  access_code VARCHAR(50),
  max_uses INT,
  use_count INT DEFAULT 0,
  requires_auth BOOLEAN DEFAULT true,
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- =====================================================
-- 21. quiz_access_logs
-- =====================================================
CREATE TABLE quiz_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES quiz_access_links(link_id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  student_id UUID,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  access_granted BOOLEAN DEFAULT true,
  denial_reason TEXT,
  metadata JSONB
);

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX idx_quizzes_teacher_id ON quizzes(teacher_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_student_answers_attempt_id ON quiz_student_answers(attempt_id);
CREATE INDEX idx_quiz_active_sessions_student_id ON quiz_active_sessions(student_id);
CREATE INDEX idx_quiz_flags_student_id ON quiz_flags(student_id);
CREATE INDEX idx_quiz_flags_quiz_id ON quiz_flags(quiz_id);
