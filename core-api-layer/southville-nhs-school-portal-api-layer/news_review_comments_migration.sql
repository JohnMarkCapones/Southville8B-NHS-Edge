-- ============================================
-- News Review Comments System Migration
-- ============================================
-- Purpose: Add review/feedback comments system for news articles
-- Date: 2025-01-28

-- Create table
CREATE TABLE IF NOT EXISTS news_review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_review_comments_news_id ON news_review_comments(news_id);
CREATE INDEX IF NOT EXISTS idx_news_review_comments_reviewer_id ON news_review_comments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_news_review_comments_deleted_at ON news_review_comments(deleted_at);

-- Enable RLS
ALTER TABLE news_review_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read review comments for accessible articles" ON news_review_comments;
DROP POLICY IF EXISTS "Teachers and Admins can create review comments" ON news_review_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON news_review_comments;

-- RLS Policy: Anyone authenticated can read review comments for articles they can access
CREATE POLICY "Users can read review comments for accessible articles"
ON news_review_comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM news
    WHERE news.id = news_review_comments.news_id
    AND news.deleted_at IS NULL
  )
);

-- RLS Policy: Teachers and Admins can create review comments
CREATE POLICY "Teachers and Admins can create review comments"
ON news_review_comments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('teacher', 'admin', 'superadmin')
  )
);

-- RLS Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON news_review_comments FOR UPDATE
TO authenticated
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS news_review_comments_updated_at ON news_review_comments;
DROP FUNCTION IF EXISTS update_news_review_comments_updated_at();

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_news_review_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER news_review_comments_updated_at
BEFORE UPDATE ON news_review_comments
FOR EACH ROW
EXECUTE FUNCTION update_news_review_comments_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'News review comments table created successfully!';
END $$;
