-- CLEANUP DUPLICATE CHOICES
-- For quiz: 1f3b8bf5-b165-473c-9740-aaa4912516f8

-- Step 1: First, let's see what we're dealing with
SELECT
  qq.question_id,
  qq.question_text,
  qq.question_type,
  COUNT(qc.choice_id) as total_choices,
  COUNT(DISTINCT qc.choice_text) as unique_choice_texts
FROM quiz_questions qq
LEFT JOIN quiz_choices qc ON qq.question_id = qc.question_id
WHERE qq.quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
GROUP BY qq.question_id, qq.question_text, qq.question_type
ORDER BY total_choices DESC;

-- Step 2: Find duplicate choices (same question_id + same choice_text appearing multiple times)
WITH duplicate_choices AS (
  SELECT
    qc.question_id,
    qc.choice_text,
    qc.is_correct,
    qc.order_index,
    COUNT(*) as duplicate_count,
    MIN(qc.choice_id) as keep_this_choice_id  -- Keep the oldest one
  FROM quiz_choices qc
  JOIN quiz_questions qq ON qc.question_id = qq.question_id
  WHERE qq.quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
  GROUP BY qc.question_id, qc.choice_text, qc.is_correct, qc.order_index
  HAVING COUNT(*) > 1
)
SELECT * FROM duplicate_choices;

-- Step 3: DELETE DUPLICATE CHOICES (keep only the oldest)
-- WARNING: Uncomment to execute!
-- WITH duplicate_choices AS (
--   SELECT
--     qc.choice_id,
--     qc.question_id,
--     qc.choice_text,
--     ROW_NUMBER() OVER (
--       PARTITION BY qc.question_id, qc.choice_text, qc.is_correct, qc.order_index
--       ORDER BY qc.choice_id ASC
--     ) as row_num
--   FROM quiz_choices qc
--   JOIN quiz_questions qq ON qc.question_id = qq.question_id
--   WHERE qq.quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
-- )
-- DELETE FROM quiz_choices
-- WHERE choice_id IN (
--   SELECT choice_id FROM duplicate_choices WHERE row_num > 1
-- );

-- Step 4: Verify cleanup (run after deletion)
-- SELECT
--   qq.question_id,
--   qq.question_text,
--   qq.question_type,
--   COUNT(qc.choice_id) as remaining_choices
-- FROM quiz_questions qq
-- LEFT JOIN quiz_choices qc ON qq.question_id = qc.question_id
-- WHERE qq.quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
-- GROUP BY qq.question_id, qq.question_text, qq.question_type
-- ORDER BY remaining_choices DESC;
