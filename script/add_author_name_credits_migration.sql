-- ============================================
-- ADD AUTHOR_NAME AND CREDITS TO NEWS TABLE
-- Migration to support custom author bylines and credits
-- ============================================

-- Add author_name column (optional, overrides user.full_name)
ALTER TABLE news
ADD COLUMN IF NOT EXISTS author_name VARCHAR(255);

COMMENT ON COLUMN news.author_name IS 'Optional custom author byline (overrides user.full_name if provided)';

-- Add credits column (for photographers, contributors, etc.)
ALTER TABLE news
ADD COLUMN IF NOT EXISTS credits TEXT;

COMMENT ON COLUMN news.credits IS 'Additional credits for photographers, contributors, etc.';

-- Create index for searching by author_name
CREATE INDEX IF NOT EXISTS idx_news_author_name ON news(author_name) WHERE author_name IS NOT NULL AND deleted_at IS NULL;

-- ============================================
-- MODIFY NEWS_CO_AUTHORS TABLE
-- Change co_author_user_id to co_author_name (string)
-- ============================================

-- First, add the new co_author_name column
ALTER TABLE news_co_authors
ADD COLUMN IF NOT EXISTS co_author_name VARCHAR(255);

-- Migrate existing data: populate co_author_name from users.full_name
UPDATE news_co_authors 
SET co_author_name = users.full_name
FROM users 
WHERE news_co_authors.user_id = users.id;

-- Make co_author_name NOT NULL after data migration
ALTER TABLE news_co_authors
ALTER COLUMN co_author_name SET NOT NULL;

-- Drop the old user_id column and its foreign key constraint
ALTER TABLE news_co_authors
DROP CONSTRAINT IF EXISTS news_co_authors_user_id_fkey;

ALTER TABLE news_co_authors
DROP COLUMN IF EXISTS user_id;

-- Update the unique constraint to use co_author_name instead of user_id
ALTER TABLE news_co_authors
DROP CONSTRAINT IF EXISTS news_co_authors_news_id_user_id_key;

ALTER TABLE news_co_authors
ADD CONSTRAINT news_co_authors_news_id_co_author_name_key 
UNIQUE (news_id, co_author_name);

-- Add comment for the new column
COMMENT ON COLUMN news_co_authors.co_author_name IS 'Name of the co-author (free text, not linked to users table)';

-- Create index for searching by co-author name
CREATE INDEX IF NOT EXISTS idx_news_co_authors_name ON news_co_authors(co_author_name);

-- ============================================
-- EXPLANATION:
-- ============================================
-- These columns allow articles to have custom author bylines and credits:
--
-- author_name: Optional field that overrides the user.full_name
--   - If provided, display this instead of looking up user.full_name
--   - Useful for guest writers, external contributors, or pen names
--   - If NULL, use users.full_name from author_id join
--
-- credits: Optional text field for additional credits
--   - Photographers, illustrators, contributors
--   - Can be plain text or formatted
--
-- news_co_authors.co_author_name: Changed from user_id reference to free text
--   - Allows external contributors who aren't in the users table
--   - More flexible for guest writers and external collaborators
--   - Maintains data integrity with unique constraint on (news_id, co_author_name)
--
-- ============================================
