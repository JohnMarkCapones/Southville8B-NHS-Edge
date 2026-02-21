-- Diagnostic: Check choice duplication for quiz 1f3b8bf5-b165-473c-9740-aaa4912516f8

-- Step 1: How many questions does this quiz have?
SELECT
  'Total Questions' as metric,
  COUNT(*) as count
FROM quiz_questions
WHERE quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8';

-- Step 2: How many choices per question?
SELECT
  qq.question_id,
  qq.question_text,
  qq.question_type,
  COUNT(qc.choice_id) as choice_count
FROM quiz_questions qq
LEFT JOIN quiz_choices qc ON qq.question_id = qc.question_id
WHERE qq.quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
GROUP BY qq.question_id, qq.question_text, qq.question_type
ORDER BY choice_count DESC;

-- Step 3: Show duplicate choices (same question, same choice_text)
SELECT
  qc.question_id,
  qq.question_text,
  qc.choice_text,
  COUNT(*) as duplicate_count
FROM quiz_choices qc
JOIN quiz_questions qq ON qc.question_id = qq.question_id
WHERE qq.quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8'
GROUP BY qc.question_id, qq.question_text, qc.choice_text
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 4: Total choices in this quiz
SELECT
  'Total Choices' as metric,
  COUNT(*) as count
FROM quiz_choices qc
JOIN quiz_questions qq ON qc.question_id = qq.question_id
WHERE qq.quiz_id = '1f3b8bf5-b165-473c-9740-aaa4912516f8';
