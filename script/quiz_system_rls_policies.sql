-- ============================================================
-- QUIZ SYSTEM - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- Created: 2025-10-18
-- Purpose: Comprehensive RLS policies for all quiz-related tables
-- Security Model:
--   - Teachers: Manage their own quizzes
--   - Admins: Full access to all quizzes
--   - Students: View published quizzes, submit attempts
-- ============================================================

-- ============================================================
-- HELPER FUNCTION: Get User Role
-- ============================================================
-- This function gets the user's role from the user_roles table
-- Used in RLS policies to determine access rights
-- ============================================================

CREATE OR REPLACE FUNCTION auth.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = $1
  LIMIT 1;

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TABLE: quizzes
-- ============================================================

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view their own quizzes
CREATE POLICY "Teachers can view their own quizzes"
ON public.quizzes
FOR SELECT
USING (
  auth.uid() = teacher_id
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Students can view published quizzes assigned to their sections
CREATE POLICY "Students can view published quizzes"
ON public.quizzes
FOR SELECT
USING (
  auth.get_user_role(auth.uid()) = 'Student'
  AND status = 'published'
  AND is_deleted = false
  AND quiz_id IN (
    SELECT qs.quiz_id
    FROM public.quiz_section_assignments qs
    INNER JOIN public.students s ON s.section_id = qs.section_id
    WHERE s.student_user_id = auth.uid()
  )
);

-- Policy: Teachers can insert their own quizzes
CREATE POLICY "Teachers can insert quizzes"
ON public.quizzes
FOR INSERT
WITH CHECK (
  auth.uid() = teacher_id
  AND (auth.get_user_role(auth.uid()) = 'Teacher' OR auth.get_user_role(auth.uid()) = 'Admin')
);

-- Policy: Teachers can update their own quizzes
CREATE POLICY "Teachers can update their own quizzes"
ON public.quizzes
FOR UPDATE
USING (
  auth.uid() = teacher_id
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Teachers can delete (soft delete) their own quizzes
CREATE POLICY "Teachers can delete their own quizzes"
ON public.quizzes
FOR DELETE
USING (
  auth.uid() = teacher_id
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_questions
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view questions for their own quizzes
CREATE POLICY "Teachers can view their quiz questions"
ON public.quiz_questions
FOR SELECT
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Students can view questions for published quizzes (but not correct answers - handled at application level)
CREATE POLICY "Students can view quiz questions"
ON public.quiz_questions
FOR SELECT
USING (
  auth.get_user_role(auth.uid()) = 'Student'
  AND quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE status = 'published' AND is_deleted = false
  )
  AND quiz_id IN (
    SELECT qs.quiz_id
    FROM public.quiz_section_assignments qs
    INNER JOIN public.students s ON s.section_id = qs.section_id
    WHERE s.student_user_id = auth.uid()
  )
);

-- Policy: Teachers can insert questions for their own quizzes
CREATE POLICY "Teachers can insert quiz questions"
ON public.quiz_questions
FOR INSERT
WITH CHECK (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Teachers can update questions for their own quizzes
CREATE POLICY "Teachers can update quiz questions"
ON public.quiz_questions
FOR UPDATE
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Teachers can delete questions for their own quizzes
CREATE POLICY "Teachers can delete quiz questions"
ON public.quiz_questions
FOR DELETE
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_choices
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_choices ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view choices for their quiz questions
CREATE POLICY "Teachers can view quiz choices"
ON public.quiz_choices
FOR SELECT
USING (
  question_id IN (
    SELECT question_id FROM public.quiz_questions
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Students can view choices (but not is_correct flag - handled at application level)
CREATE POLICY "Students can view quiz choices"
ON public.quiz_choices
FOR SELECT
USING (
  auth.get_user_role(auth.uid()) = 'Student'
  AND question_id IN (
    SELECT question_id FROM public.quiz_questions
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE status = 'published' AND is_deleted = false
    )
  )
);

-- Policy: Teachers can insert choices for their quiz questions
CREATE POLICY "Teachers can insert quiz choices"
ON public.quiz_choices
FOR INSERT
WITH CHECK (
  question_id IN (
    SELECT question_id FROM public.quiz_questions
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Teachers can update choices for their quiz questions
CREATE POLICY "Teachers can update quiz choices"
ON public.quiz_choices
FOR UPDATE
USING (
  question_id IN (
    SELECT question_id FROM public.quiz_questions
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Teachers can delete choices for their quiz questions
CREATE POLICY "Teachers can delete quiz choices"
ON public.quiz_choices
FOR DELETE
USING (
  question_id IN (
    SELECT question_id FROM public.quiz_questions
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_question_metadata
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_question_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can manage metadata for their quiz questions
CREATE POLICY "Teachers can manage quiz question metadata"
ON public.quiz_question_metadata
FOR ALL
USING (
  question_id IN (
    SELECT question_id FROM public.quiz_questions
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_settings
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can manage settings for their own quizzes
CREATE POLICY "Teachers can manage quiz settings"
ON public.quiz_settings
FOR ALL
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Students can view settings for published quizzes
CREATE POLICY "Students can view quiz settings"
ON public.quiz_settings
FOR SELECT
USING (
  auth.get_user_role(auth.uid()) = 'Student'
  AND quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE status = 'published' AND is_deleted = false
  )
);

-- ============================================================
-- TABLE: quiz_section_assignments
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_section_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can manage section assignments for their quizzes
CREATE POLICY "Teachers can manage quiz section assignments"
ON public.quiz_section_assignments
FOR ALL
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Students can view section assignments for their section
CREATE POLICY "Students can view quiz section assignments"
ON public.quiz_section_assignments
FOR SELECT
USING (
  auth.get_user_role(auth.uid()) = 'Student'
  AND section_id IN (
    SELECT section_id FROM public.students
    WHERE student_user_id = auth.uid()
  )
);

-- ============================================================
-- TABLE: quiz_attempts
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view and create their own attempts
CREATE POLICY "Students can manage their own attempts"
ON public.quiz_attempts
FOR ALL
USING (
  student_id = auth.uid()
);

-- Policy: Teachers can view attempts for their quizzes
CREATE POLICY "Teachers can view attempts for their quizzes"
ON public.quiz_attempts
FOR SELECT
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_responses
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Students can manage their own responses
CREATE POLICY "Students can manage their own responses"
ON public.quiz_responses
FOR ALL
USING (
  attempt_id IN (
    SELECT attempt_id FROM public.quiz_attempts
    WHERE student_id = auth.uid()
  )
);

-- Policy: Teachers can view responses for their quizzes
CREATE POLICY "Teachers can view responses for their quizzes"
ON public.quiz_responses
FOR SELECT
USING (
  attempt_id IN (
    SELECT attempt_id FROM public.quiz_attempts
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_grades
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_grades ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own grades
CREATE POLICY "Students can view their own grades"
ON public.quiz_grades
FOR SELECT
USING (
  attempt_id IN (
    SELECT attempt_id FROM public.quiz_attempts
    WHERE student_id = auth.uid()
  )
);

-- Policy: Teachers can manage grades for their quizzes
CREATE POLICY "Teachers can manage grades for their quizzes"
ON public.quiz_grades
FOR ALL
USING (
  attempt_id IN (
    SELECT attempt_id FROM public.quiz_attempts
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_manual_grades
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_manual_grades ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can manage manual grades for their quizzes
CREATE POLICY "Teachers can manage manual grades"
ON public.quiz_manual_grades
FOR ALL
USING (
  response_id IN (
    SELECT response_id FROM public.quiz_responses
    WHERE attempt_id IN (
      SELECT attempt_id FROM public.quiz_attempts
      WHERE quiz_id IN (
        SELECT quiz_id FROM public.quizzes
        WHERE teacher_id = auth.uid()
      )
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Students can view their own manual grades
CREATE POLICY "Students can view their own manual grades"
ON public.quiz_manual_grades
FOR SELECT
USING (
  response_id IN (
    SELECT response_id FROM public.quiz_responses
    WHERE attempt_id IN (
      SELECT attempt_id FROM public.quiz_attempts
      WHERE student_id = auth.uid()
    )
  )
);

-- ============================================================
-- TABLE: quiz_sessions
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can manage their own sessions
CREATE POLICY "Students can manage their own sessions"
ON public.quiz_sessions
FOR ALL
USING (
  student_id = auth.uid()
);

-- Policy: Teachers can view sessions for their quizzes
CREATE POLICY "Teachers can view sessions for their quizzes"
ON public.quiz_sessions
FOR SELECT
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_monitoring_logs
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_monitoring_logs ENABLE ROW LEVEL SECURITY;

-- Policy: System can insert monitoring logs (service role)
CREATE POLICY "System can insert monitoring logs"
ON public.quiz_monitoring_logs
FOR INSERT
WITH CHECK (true);

-- Policy: Teachers can view monitoring logs for their quizzes
CREATE POLICY "Teachers can view monitoring logs"
ON public.quiz_monitoring_logs
FOR SELECT
USING (
  session_id IN (
    SELECT session_id FROM public.quiz_sessions
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_monitoring_flags
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_monitoring_flags ENABLE ROW LEVEL SECURITY;

-- Policy: System can insert flags (service role)
CREATE POLICY "System can insert monitoring flags"
ON public.quiz_monitoring_flags
FOR INSERT
WITH CHECK (true);

-- Policy: Teachers can manage flags for their quizzes
CREATE POLICY "Teachers can manage monitoring flags"
ON public.quiz_monitoring_flags
FOR ALL
USING (
  session_id IN (
    SELECT session_id FROM public.quiz_sessions
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_versions
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view versions of their quizzes
CREATE POLICY "Teachers can view quiz versions"
ON public.quiz_versions
FOR SELECT
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: System can insert versions (handled by service role)
CREATE POLICY "System can insert quiz versions"
ON public.quiz_versions
FOR INSERT
WITH CHECK (true);

-- ============================================================
-- TABLE: quiz_analytics_summary
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view analytics for their quizzes
CREATE POLICY "Teachers can view quiz analytics"
ON public.quiz_analytics_summary
FOR SELECT
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_question_analytics
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_question_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view question analytics for their quizzes
CREATE POLICY "Teachers can view question analytics"
ON public.quiz_question_analytics
FOR SELECT
USING (
  question_id IN (
    SELECT question_id FROM public.quiz_questions
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: student_quiz_progress
-- ============================================================

-- Enable RLS
ALTER TABLE public.student_quiz_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own progress
CREATE POLICY "Students can view their own progress"
ON public.student_quiz_progress
FOR SELECT
USING (
  student_id = auth.uid()
);

-- Policy: Teachers can view progress for their quizzes
CREATE POLICY "Teachers can view student progress"
ON public.student_quiz_progress
FOR SELECT
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- TABLE: quiz_question_bank
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_question_bank ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can manage their own question bank questions
CREATE POLICY "Teachers can manage question bank"
ON public.quiz_question_bank
FOR ALL
USING (
  created_by = auth.uid()
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Teachers can view public question bank questions
CREATE POLICY "Teachers can view public question bank"
ON public.quiz_question_bank
FOR SELECT
USING (
  is_public = true
  AND auth.get_user_role(auth.uid()) IN ('Teacher', 'Admin')
);

-- ============================================================
-- TABLE: quiz_question_bank_tags
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_question_bank_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to view tags
CREATE POLICY "Authenticated users can view question bank tags"
ON public.quiz_question_bank_tags
FOR SELECT
USING (
  auth.get_user_role(auth.uid()) IN ('Teacher', 'Admin')
);

-- Policy: Teachers can manage tags
CREATE POLICY "Teachers can manage question bank tags"
ON public.quiz_question_bank_tags
FOR ALL
USING (
  auth.get_user_role(auth.uid()) IN ('Teacher', 'Admin')
);

-- ============================================================
-- TABLE: quiz_access_links (Phase 2)
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_access_links ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can manage access links for their quizzes
CREATE POLICY "Teachers can manage quiz access links"
ON public.quiz_access_links
FOR ALL
USING (
  quiz_id IN (
    SELECT quiz_id FROM public.quizzes
    WHERE teacher_id = auth.uid()
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- Policy: Public can validate access links (for token validation)
CREATE POLICY "Public can validate access links"
ON public.quiz_access_links
FOR SELECT
USING (
  is_active = true
  AND is_revoked = false
);

-- ============================================================
-- TABLE: quiz_access_logs (Phase 2)
-- ============================================================

-- Enable RLS
ALTER TABLE public.quiz_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: System can insert access logs (service role)
CREATE POLICY "System can insert access logs"
ON public.quiz_access_logs
FOR INSERT
WITH CHECK (true);

-- Policy: Teachers can view access logs for their quizzes
CREATE POLICY "Teachers can view access logs"
ON public.quiz_access_logs
FOR SELECT
USING (
  access_link_id IN (
    SELECT access_link_id FROM public.quiz_access_links
    WHERE quiz_id IN (
      SELECT quiz_id FROM public.quizzes
      WHERE teacher_id = auth.uid()
    )
  )
  OR auth.get_user_role(auth.uid()) = 'Admin'
);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these queries to verify RLS is enabled on all tables
-- ============================================================

-- Check RLS status for all quiz tables
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'quiz%'
ORDER BY tablename;

-- List all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'quiz%'
ORDER BY tablename, policyname;

-- ============================================================
-- NOTES
-- ============================================================
-- 1. Service Role Key: The backend uses service role key which bypasses RLS
--    This is intentional for INSERT/UPDATE/DELETE operations
--
-- 2. Application-Level Security: Some security checks are handled at
--    application level (e.g., hiding correct answers before quiz completion)
--
-- 3. Testing: Test RLS policies by switching between different user roles
--    and attempting various operations
--
-- 4. Performance: RLS policies may impact query performance on large datasets
--    Monitor and optimize as needed
--
-- 5. Helper Function: The auth.get_user_role() function must exist and
--    return the correct role for the authenticated user
-- ============================================================
