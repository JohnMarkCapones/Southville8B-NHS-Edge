-- =====================================================
-- QUICK FIX: Assign Published Quizzes to Sections
-- =====================================================
-- Date: 2025-01-06
-- Purpose: Manually assign published quizzes to sections
--          so students can see them immediately
-- =====================================================

-- STEP 1: Check your available sections
-- Copy the section_id you want to use
SELECT
  section_id,
  name as section_name,
  grade_level,
  school_year
FROM sections
ORDER BY grade_level, name;

-- STEP 2: Check your published quizzes
-- These are the quizzes that need section assignments
SELECT
  quiz_id,
  title,
  status,
  created_at,
  subject_id
FROM quizzes
WHERE status = 'published'
  AND deleted_at IS NULL
ORDER BY created_at DESC;

-- STEP 3: Check which quizzes already have assignments
-- This shows if any quizzes are already assigned
SELECT
  q.quiz_id,
  q.title,
  q.status,
  s.section_id,
  s.name as section_name
FROM quizzes q
LEFT JOIN quiz_sections qs ON q.quiz_id = qs.quiz_id
LEFT JOIN sections s ON qs.section_id = s.section_id
WHERE q.status = 'published'
  AND q.deleted_at IS NULL
ORDER BY q.title;

-- If section_id is NULL, the quiz is NOT assigned to any sections!

-- =====================================================
-- STEP 4: ASSIGN QUIZZES TO SECTIONS
-- =====================================================
-- IMPORTANT: Replace 'YOUR-SECTION-ID-HERE' with an actual section_id from STEP 1
-- IMPORTANT: Update quiz_id values if needed based on STEP 2

-- Example: Assign 3 published quizzes to a section
INSERT INTO quiz_sections (quiz_id, section_id)
VALUES
  ('b66c519b-41eb-4b3d-9cff-d7c15f37b8da', 'YOUR-SECTION-ID-HERE'),
  ('bf0414cb-9f52-4275-a422-5c5781aefeb6', 'YOUR-SECTION-ID-HERE'),
  ('69896e51-ed19-45b0-bd4d-e621d9439d46', 'YOUR-SECTION-ID-HERE')
ON CONFLICT (quiz_id, section_id) DO NOTHING; -- Prevent duplicates

-- ✅ If you want to assign to MULTIPLE sections, repeat with different section IDs:
-- INSERT INTO quiz_sections (quiz_id, section_id)
-- VALUES
--   ('b66c519b-41eb-4b3d-9cff-d7c15f37b8da', 'ANOTHER-SECTION-ID'),
--   ('bf0414cb-9f52-4275-a422-5c5781aefeb6', 'ANOTHER-SECTION-ID'),
--   ('69896e51-ed19-45b0-bd4d-e621d9439d46', 'ANOTHER-SECTION-ID')
-- ON CONFLICT (quiz_id, section_id) DO NOTHING;

-- =====================================================
-- STEP 5: VERIFY THE ASSIGNMENTS
-- =====================================================

-- Check all quiz-section assignments
SELECT
  q.title as quiz_title,
  q.status,
  s.name as section_name,
  s.grade_level,
  qs.created_at as assigned_at
FROM quiz_sections qs
JOIN quizzes q ON qs.quiz_id = q.quiz_id
JOIN sections s ON qs.section_id = s.section_id
WHERE q.status = 'published'
ORDER BY q.title, s.name;

-- ✅ You should see rows with your quiz titles and section names

-- =====================================================
-- STEP 6: TEST WITH STUDENT
-- =====================================================

-- Check which students are in the section you assigned to
SELECT
  s.student_id,
  s.user_id,
  s.first_name,
  s.last_name,
  sec.name as section_name
FROM students s
JOIN sections sec ON s.section_id = sec.section_id
WHERE sec.section_id = 'YOUR-SECTION-ID-HERE';

-- =====================================================
-- VERIFICATION: Simulate Student Query
-- =====================================================
-- This is what the backend does when a student opens /student/quiz
-- Replace 'STUDENT-USER-ID' with a real student user_id from STEP 6

-- Get student's section
WITH student_section AS (
  SELECT section_id
  FROM students
  WHERE user_id = 'STUDENT-USER-ID'
  LIMIT 1
),
-- Get quiz IDs assigned to that section
assigned_quiz_ids AS (
  SELECT quiz_id
  FROM quiz_sections
  WHERE section_id = (SELECT section_id FROM student_section)
)
-- Get published quizzes that match
SELECT
  q.quiz_id,
  q.title,
  q.status,
  q.subject_id,
  q.time_limit,
  q.total_points
FROM quizzes q
WHERE q.quiz_id IN (SELECT quiz_id FROM assigned_quiz_ids)
  AND q.status = 'published'
  AND q.deleted_at IS NULL;

-- ✅ This should return your published quizzes!
-- If this returns rows, students will see them in the frontend!

-- =====================================================
-- CLEANUP (if you made mistakes)
-- =====================================================

-- Remove a specific assignment
-- DELETE FROM quiz_sections
-- WHERE quiz_id = 'quiz-id-here'
--   AND section_id = 'section-id-here';

-- Remove ALL assignments for a quiz (use with caution!)
-- DELETE FROM quiz_sections
-- WHERE quiz_id = 'quiz-id-here';

-- =====================================================
-- SUMMARY
-- =====================================================
-- After running this script:
-- 1. Your published quizzes are now assigned to section(s)
-- 2. Students in those sections can see the quizzes
-- 3. The frontend will show: "3 real quizzes loaded" with REAL badges
-- 4. Students can start taking the quizzes!
-- =====================================================
