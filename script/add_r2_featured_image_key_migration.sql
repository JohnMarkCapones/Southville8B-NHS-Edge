-- ============================================
-- ADD R2_FEATURED_IMAGE_KEY COLUMN TO NEWS TABLE
-- ============================================
-- This migration adds the missing r2_featured_image_key column
-- to the news table for R2 storage integration

-- Add the r2_featured_image_key column to news table
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS r2_featured_image_key varchar(500);

-- Add comment to document the column purpose
COMMENT ON COLUMN news.r2_featured_image_key IS 'R2 storage key for featured image deletion';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'news' 
AND column_name = 'r2_featured_image_key';

-- Show current news table structure
\d news;

