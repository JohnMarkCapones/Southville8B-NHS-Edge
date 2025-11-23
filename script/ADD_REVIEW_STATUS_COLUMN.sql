-- ============================================
-- ADD REVIEW_STATUS COLUMN TO NEWS TABLE
-- Safe migration with backward compatibility
-- ============================================
-- Run this in Supabase SQL Editor
-- This migration adds a review_status column to track article review states

-- ============================================
-- STEP 1: ADD THE NEW COLUMN
-- ============================================

-- Add review_status column as nullable with default value
-- This ensures existing records won't break
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS review_status VARCHAR(50) DEFAULT 'pending' 
CHECK (review_status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_revision'));

-- ============================================
-- STEP 2: UPDATE EXISTING RECORDS
-- ============================================

-- Set review_status based on current status for existing articles
UPDATE news 
SET review_status = CASE 
  WHEN status = 'draft' THEN 'pending'
  WHEN status = 'pending_approval' THEN 'in_review'
  WHEN status = 'approved' THEN 'approved'
  WHEN status = 'published' THEN 'approved'
  WHEN status = 'rejected' THEN 'rejected'
  WHEN status = 'archived' THEN 'rejected'
  ELSE 'pending'
END
WHERE review_status IS NULL;

-- ============================================
-- STEP 3: ADD INDEX FOR PERFORMANCE
-- ============================================

-- Create index for efficient filtering by review_status
CREATE INDEX IF NOT EXISTS idx_news_review_status ON news(review_status);

-- ============================================
-- STEP 4: ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN news.review_status IS 'Review status of the article: pending, in_review, approved, rejected, needs_revision';

-- ============================================
-- STEP 5: VERIFY THE MIGRATION
-- ============================================

-- Check that the column was added successfully
SELECT 
  'Migration completed successfully!' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'news' 
  AND column_name = 'review_status'
  AND table_schema = 'public';

-- Show sample data with new column
SELECT 
  id,
  title,
  status,
  review_status,
  created_at
FROM news 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================
-- STEP 6: UPDATE RLS POLICIES (if needed)
-- ============================================

-- Note: RLS policies will automatically include the new column
-- No additional RLS policy changes needed unless you want specific
-- review_status-based access control

-- ============================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================

-- To rollback this migration, run:
-- ALTER TABLE news DROP COLUMN IF EXISTS review_status;
-- DROP INDEX IF EXISTS idx_news_review_status;
