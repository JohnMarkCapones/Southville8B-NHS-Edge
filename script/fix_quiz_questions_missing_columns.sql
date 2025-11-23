-- Fix quiz_questions table - Add missing columns
-- Run this in Supabase SQL Editor

ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS correct_answer JSONB;

ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS settings JSONB;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'quiz_questions'
AND column_name IN ('correct_answer', 'settings');
