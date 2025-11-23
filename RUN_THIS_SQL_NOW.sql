-- =====================================================
-- FIX EXISTING TRUE/FALSE QUESTIONS
-- Run this ONCE to add choices to existing T/F questions
-- =====================================================

-- Step 1: Insert True/False choices for all T/F questions that have no choices
INSERT INTO quiz_choices (question_id, choice_text, is_correct, order_index, metadata)
SELECT
  qq.question_id,
  choices.choice_text,
  false as is_correct,
  choices.order_index,
  null as metadata
FROM quiz_questions qq
CROSS JOIN (
  VALUES ('True', 0), ('False', 1)
) AS choices(choice_text, order_index)
WHERE qq.question_type = 'true_false'
  AND NOT EXISTS (
    SELECT 1 FROM quiz_choices qc WHERE qc.question_id = qq.question_id
  );

-- Step 2: Verify the fix worked
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
