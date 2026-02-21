-- ============================================================================
-- Migration: Add Image Support to Quiz System
-- Description: Adds Cloudflare Images support to quiz_questions, quiz_choices,
--              and question_bank tables for visual quiz content
-- Author: Claude Code
-- Date: 2025-11-11
-- Status: READY TO RUN
-- ============================================================================

-- ============================================================================
-- PART 1: Add Image Columns to quiz_questions Table
-- ============================================================================

ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS question_image_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS question_image_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS question_image_file_size INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS question_image_mime_type VARCHAR(50) DEFAULT NULL;

COMMENT ON COLUMN quiz_questions.question_image_id IS 'Cloudflare Images ID for question image';
COMMENT ON COLUMN quiz_questions.question_image_url IS 'Full Cloudflare Images URL for question image';
COMMENT ON COLUMN quiz_questions.question_image_file_size IS 'File size in bytes of question image';
COMMENT ON COLUMN quiz_questions.question_image_mime_type IS 'MIME type of question image (e.g., image/jpeg, image/png)';

-- Create index for faster image queries
CREATE INDEX IF NOT EXISTS idx_quiz_questions_image_id
ON quiz_questions(question_image_id)
WHERE question_image_id IS NOT NULL;

-- ============================================================================
-- PART 2: Add Image Columns to quiz_choices Table
-- ============================================================================

ALTER TABLE quiz_choices
ADD COLUMN IF NOT EXISTS choice_image_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS choice_image_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS choice_image_file_size INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS choice_image_mime_type VARCHAR(50) DEFAULT NULL;

COMMENT ON COLUMN quiz_choices.choice_image_id IS 'Cloudflare Images ID for choice image';
COMMENT ON COLUMN quiz_choices.choice_image_url IS 'Full Cloudflare Images URL for choice image';
COMMENT ON COLUMN quiz_choices.choice_image_file_size IS 'File size in bytes of choice image';
COMMENT ON COLUMN quiz_choices.choice_image_mime_type IS 'MIME type of choice image (e.g., image/jpeg, image/png)';

-- Create index for faster image queries
CREATE INDEX IF NOT EXISTS idx_quiz_choices_image_id
ON quiz_choices(choice_image_id)
WHERE choice_image_id IS NOT NULL;

-- ============================================================================
-- PART 3: Add Image Columns to question_bank Table
-- ============================================================================

ALTER TABLE question_bank
ADD COLUMN IF NOT EXISTS question_image_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS question_image_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS question_image_file_size INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS question_image_mime_type VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS choices_image_data JSONB DEFAULT NULL;

COMMENT ON COLUMN question_bank.question_image_id IS 'Cloudflare Images ID for question image';
COMMENT ON COLUMN question_bank.question_image_url IS 'Full Cloudflare Images URL for question image';
COMMENT ON COLUMN question_bank.question_image_file_size IS 'File size in bytes of question image';
COMMENT ON COLUMN question_bank.question_image_mime_type IS 'MIME type of question image (e.g., image/jpeg, image/png)';
COMMENT ON COLUMN question_bank.choices_image_data IS 'JSONB array storing image data for each choice (for question bank only)';

-- Create index for faster image queries
CREATE INDEX IF NOT EXISTS idx_question_bank_image_id
ON question_bank(question_image_id)
WHERE question_image_id IS NOT NULL;

-- Create GIN index for JSONB choices_image_data queries
CREATE INDEX IF NOT EXISTS idx_question_bank_choices_image_data
ON question_bank USING GIN(choices_image_data)
WHERE choices_image_data IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES (Check results after running migration)
-- ============================================================================

-- Verify columns were added to quiz_questions
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'quiz_questions'
AND column_name IN ('question_image_id', 'question_image_url', 'question_image_file_size', 'question_image_mime_type')
ORDER BY column_name;

-- Verify columns were added to quiz_choices
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'quiz_choices'
AND column_name IN ('choice_image_id', 'choice_image_url', 'choice_image_file_size', 'choice_image_mime_type')
ORDER BY column_name;

-- Verify columns were added to question_bank
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'question_bank'
AND column_name IN ('question_image_id', 'question_image_url', 'question_image_file_size', 'question_image_mime_type', 'choices_image_data')
ORDER BY column_name;

-- Verify indexes were created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname IN (
    'idx_quiz_questions_image_id',
    'idx_quiz_choices_image_id',
    'idx_question_bank_image_id',
    'idx_question_bank_choices_image_data'
)
ORDER BY tablename, indexname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Quiz Image Support Migration Complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'Added columns:';
    RAISE NOTICE '  - quiz_questions: 4 image columns';
    RAISE NOTICE '  - quiz_choices: 4 image columns';
    RAISE NOTICE '  - question_bank: 5 image columns (includes JSONB)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Verify backend server is running';
    RAISE NOTICE '  2. Verify frontend server is running';
    RAISE NOTICE '  3. Start testing quiz image upload/display';
    RAISE NOTICE '';
    RAISE NOTICE 'See QUIZ_IMAGE_TESTING_GUIDE.md for testing checklist';
END $$;
