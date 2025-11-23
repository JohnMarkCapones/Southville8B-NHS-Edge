-- Add case_sensitive and whitespace_sensitive columns to quiz_questions table
-- These settings apply to individual fill-in-blank questions

-- Add columns with default values
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS case_sensitive BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whitespace_sensitive BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN quiz_questions.case_sensitive IS 'For fill-in-blank: Whether answers must match exact capitalization';
COMMENT ON COLUMN quiz_questions.whitespace_sensitive IS 'For fill-in-blank: Whether spacing must match exactly';

-- These columns will be NULL for non-fill-in-blank questions, which is fine
-- Only fill-in-blank questions will use these fields

-- Verify the columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_questions'
AND column_name IN ('case_sensitive', 'whitespace_sensitive');
