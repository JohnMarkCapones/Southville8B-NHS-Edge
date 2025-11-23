-- QUIZ CLEANUP SCRIPT
-- Use this to clean up duplicate questions and choices

-- Step 1: Check current state
SELECT
  'Total Questions' as item,
  COUNT(*) as count
FROM quiz_questions
WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'

UNION ALL

SELECT
  'Total Choices' as item,
  COUNT(*) as count
FROM quiz_choices
WHERE question_id IN (
  SELECT question_id FROM quiz_questions WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
);

-- Step 2: DELETE ALL QUESTIONS AND CHOICES FOR THIS QUIZ
-- WARNING: This will delete everything! Make sure you want to do this.
-- Uncomment the lines below to execute:

-- DELETE FROM quiz_choices
-- WHERE question_id IN (
--   SELECT question_id FROM quiz_questions WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
-- );

-- DELETE FROM quiz_questions
-- WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8';

-- Step 3: Verify cleanup (should show 0 for both)
-- Uncomment to run after deletion:

-- SELECT
--   'Remaining Questions' as item,
--   COUNT(*) as count
-- FROM quiz_questions
-- WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
--
-- UNION ALL
--
-- SELECT
--   'Remaining Choices' as item,
--   COUNT(*) as count
-- FROM quiz_choices
-- WHERE question_id IN (
--   SELECT question_id FROM quiz_questions WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
-- );

-- Step 4: Reset quiz total_points
-- UPDATE quizzes
-- SET total_points = 0
-- WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8';
