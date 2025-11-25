-- ============================================================================
-- Migration: Add Image Support to Quiz System
-- Description: Adds Cloudflare Images support to quiz_questions, quiz_choices,
--              and question_bank tables for visual quiz content
-- Author: Claude Code
-- Date: 2025-11-11
-- ============================================================================

-- ============================================================================
-- PART 1: Add Image Columns to quiz_questions Table
-- ============================================================================

ALTER TABLE quiz_questions
ADD COLUMN question_image_id TEXT DEFAULT NULL,
ADD COLUMN question_image_url TEXT DEFAULT NULL,
ADD COLUMN question_image_file_size INTEGER DEFAULT NULL,
ADD COLUMN question_image_mime_type VARCHAR(50) DEFAULT NULL;

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
ADD COLUMN choice_image_id TEXT DEFAULT NULL,
ADD COLUMN choice_image_url TEXT DEFAULT NULL,
ADD COLUMN choice_image_file_size INTEGER DEFAULT NULL,
ADD COLUMN choice_image_mime_type VARCHAR(50) DEFAULT NULL;

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
ADD COLUMN question_image_id TEXT DEFAULT NULL,
ADD COLUMN question_image_url TEXT DEFAULT NULL,
ADD COLUMN question_image_file_size INTEGER DEFAULT NULL,
ADD COLUMN question_image_mime_type VARCHAR(50) DEFAULT NULL,
ADD COLUMN choices_image_data JSONB DEFAULT NULL;

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
-- VERIFICATION QUERIES
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
-- ROLLBACK SCRIPT (USE WITH CAUTION - FOR DEVELOPMENT ONLY)
-- ============================================================================

/*
-- Drop indexes
DROP INDEX IF EXISTS idx_quiz_questions_image_id;
DROP INDEX IF EXISTS idx_quiz_choices_image_id;
DROP INDEX IF EXISTS idx_question_bank_image_id;
DROP INDEX IF EXISTS idx_question_bank_choices_image_data;

-- Drop columns from quiz_questions
ALTER TABLE quiz_questions
DROP COLUMN IF EXISTS question_image_id,
DROP COLUMN IF EXISTS question_image_url,
DROP COLUMN IF EXISTS question_image_file_size,
DROP COLUMN IF EXISTS question_image_mime_type;

-- Drop columns from quiz_choices
ALTER TABLE quiz_choices
DROP COLUMN IF EXISTS choice_image_id,
DROP COLUMN IF EXISTS choice_image_url,
DROP COLUMN IF EXISTS choice_image_file_size,
DROP COLUMN IF EXISTS choice_image_mime_type;

-- Drop columns from question_bank
ALTER TABLE question_bank
DROP COLUMN IF EXISTS question_image_id,
DROP COLUMN IF EXISTS question_image_url,
DROP COLUMN IF EXISTS question_image_file_size,
DROP COLUMN IF EXISTS question_image_mime_type,
DROP COLUMN IF EXISTS choices_image_data;
*/

-- ============================================================================
-- NOTES
-- ============================================================================

/*
IMAGE FIELD USAGE:
- question_image_id: Cloudflare Images ID (e.g., "quiz-q-abc123")
- question_image_url: Full delivery URL (e.g., "https://imagedelivery.net/{account_hash}/{image_id}/public")
- question_image_file_size: File size in bytes for validation and display
- question_image_mime_type: MIME type for proper rendering

SUPPORTED IMAGE TYPES:
- image/jpeg
- image/png
- image/gif
- image/webp
- image/avif

CLOUDFLARE IMAGES VARIANTS:
- thumbnail: 200x200px (for previews)
- card: 800x600px (for quiz display)
- public: Original dimensions, optimized
- original: Unmodified upload

QUESTION TYPES THAT SUPPORT IMAGES:
- Multiple Choice (question + individual choices)
- True/False (question only)
- Fill-in-the-Blank (question only)
- Matching Pairs (question only, not on pairs themselves)
*/
