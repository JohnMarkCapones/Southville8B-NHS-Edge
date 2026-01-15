-- Fix for True/False Questions Missing Choices
-- This script adds True/False choices to existing true_false questions that have no choices
-- Run this ONCE to fix existing data

-- Step 1: Find all true_false questions without choices
WITH questions_needing_choices AS (
  SELECT
    qq.question_id,
    qq.question_text,
    qq.quiz_id
  FROM quiz_questions qq
  WHERE qq.question_type = 'true_false'
    AND NOT EXISTS (
      SELECT 1
      FROM quiz_choices qc
      WHERE qc.question_id = qq.question_id
    )
)
-- Step 2: Insert True/False choices for each question
INSERT INTO quiz_choices (question_id, choice_text, is_correct, order_index, metadata)
SELECT
  question_id,
  choice_text,
  false as is_correct,  -- Default to false, teacher needs to set correct answer
  order_index,
  null as metadata
FROM questions_needing_choices
CROSS JOIN (
  VALUES
    ('True', 0),
    ('False', 1)
) AS choices(choice_text, order_index);

-- Verify the fix
SELECT
  qq.question_id,
  qq.question_text,
  qq.question_type,
  COUNT(qc.choice_id) as choice_count,
  STRING_AGG(qc.choice_text, ', ' ORDER BY qc.order_index) as choices
FROM quiz_questions qq
LEFT JOIN quiz_choices qc ON qc.question_id = qq.question_id
WHERE qq.question_type = 'true_false'
GROUP BY qq.question_id, qq.question_text, qq.question_type
ORDER BY choice_count ASC, qq.question_text;
