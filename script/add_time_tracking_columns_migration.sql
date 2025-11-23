-- Migration: Add time_spent_seconds columns for per-question time tracking
-- Created: 2025-11-10
-- Purpose: Enable tracking of time spent on each question for analytics

-- 1. Add time_spent_seconds to quiz_session_answers (temporary storage during quiz)
ALTER TABLE quiz_session_answers
ADD COLUMN IF NOT EXISTS time_spent_seconds INT;

-- 2. Add time_spent_seconds to quiz_student_answers (final storage after submission)
ALTER TABLE quiz_student_answers
ADD COLUMN IF NOT EXISTS time_spent_seconds INT;

-- 3. Verify columns were added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quiz_session_answers'
        AND column_name = 'time_spent_seconds'
    ) THEN
        RAISE NOTICE '✅ Column time_spent_seconds added to quiz_session_answers';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quiz_student_answers'
        AND column_name = 'time_spent_seconds'
    ) THEN
        RAISE NOTICE '✅ Column time_spent_seconds added to quiz_student_answers';
    END IF;
END $$;

-- Note: quiz_question_stats already has average_time_spent_seconds column
-- This migration only adds the columns needed for storing individual answer times
