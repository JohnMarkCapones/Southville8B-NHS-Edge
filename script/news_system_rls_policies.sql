-- ============================================
-- NEWS SYSTEM - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- This file contains RLS policies for the news/journalism system
-- Ensures proper access control at the database level
-- Execute after news_system_migration.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_co_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_approval ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is an Adviser or Co-Adviser
CREATE OR REPLACE FUNCTION is_journalism_adviser(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_domain_roles udr
    JOIN domains d ON udr.domain_id = d.id
    JOIN domain_roles dr ON udr.domain_role_id = dr.id
    WHERE udr.user_id = user_id
      AND d.name = 'Journalism'
      AND dr.name IN ('Adviser', 'Co-Adviser')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has publishing position (Writer, Publisher, EIC, Co-EIC)
CREATE OR REPLACE FUNCTION can_publish_news(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_domain_roles udr
    JOIN domains d ON udr.domain_id = d.id
    JOIN domain_roles dr ON udr.domain_role_id = dr.id
    WHERE udr.user_id = user_id
      AND d.name = 'Journalism'
      AND dr.name IN ('Editor-in-Chief', 'Co-Editor-in-Chief', 'Publisher', 'Writer', 'Adviser', 'Co-Adviser')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is journalism member (any position)
CREATE OR REPLACE FUNCTION is_journalism_member(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_domain_roles udr
    JOIN domains d ON udr.domain_id = d.id
    WHERE udr.user_id = user_id
      AND d.name = 'Journalism'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NEWS CATEGORIES - RLS POLICIES
-- ============================================
-- Public read access for everyone
-- Only Advisers can create/update/delete

-- SELECT: Everyone can view categories
CREATE POLICY "news_categories_select_all"
ON news_categories
FOR SELECT
USING (true);

-- INSERT: Only Advisers can create categories
CREATE POLICY "news_categories_insert_advisers"
ON news_categories
FOR INSERT
WITH CHECK (is_journalism_adviser(auth.uid()));

-- UPDATE: Only Advisers can update categories
CREATE POLICY "news_categories_update_advisers"
ON news_categories
FOR UPDATE
USING (is_journalism_adviser(auth.uid()))
WITH CHECK (is_journalism_adviser(auth.uid()));

-- DELETE: Only Advisers can delete categories
CREATE POLICY "news_categories_delete_advisers"
ON news_categories
FOR DELETE
USING (is_journalism_adviser(auth.uid()));

-- ============================================
-- TAGS - RLS POLICIES
-- ============================================
-- Public read access
-- Anyone with publishing rights can create tags (auto-created)

-- SELECT: Everyone can view tags
CREATE POLICY "tags_select_all"
ON tags
FOR SELECT
USING (true);

-- INSERT: Anyone with publishing rights can create tags
CREATE POLICY "tags_insert_publishers"
ON tags
FOR INSERT
WITH CHECK (can_publish_news(auth.uid()));

-- UPDATE: Only Advisers can update tags
CREATE POLICY "tags_update_advisers"
ON tags
FOR UPDATE
USING (is_journalism_adviser(auth.uid()))
WITH CHECK (is_journalism_adviser(auth.uid()));

-- DELETE: Only Advisers can delete tags
CREATE POLICY "tags_delete_advisers"
ON tags
FOR DELETE
USING (is_journalism_adviser(auth.uid()));

-- ============================================
-- NEWS - RLS POLICIES
-- ============================================
-- Complex policies based on article status and user role

-- SELECT:
-- - Published articles with public visibility: everyone can view
-- - Published articles with journalism visibility: journalism members only
-- - Draft/pending/approved/rejected articles: author, co-authors, or advisers
CREATE POLICY "news_select_policy"
ON news
FOR SELECT
USING (
  -- Published public articles - everyone
  (status = 'published' AND visibility = 'public' AND deleted_at IS NULL)
  OR
  -- Published journalism articles - journalism members only
  (status = 'published' AND visibility = 'journalism' AND is_journalism_member(auth.uid()) AND deleted_at IS NULL)
  OR
  -- Non-published articles - author, co-authors, or advisers
  (
    (
      author_id = auth.uid()
      OR is_journalism_adviser(auth.uid())
      OR EXISTS (
        SELECT 1 FROM news_co_authors
        WHERE news_id = news.id AND user_id = auth.uid()
      )
    )
    AND deleted_at IS NULL
  )
);

-- INSERT: Only users with publishing rights can create articles
CREATE POLICY "news_insert_publishers"
ON news
FOR INSERT
WITH CHECK (
  can_publish_news(auth.uid())
  AND author_id = auth.uid()
);

-- UPDATE:
-- - Author can update own draft/pending articles
-- - Advisers can update any draft/pending/approved article
-- - Published articles cannot be updated (enforced in service layer)
CREATE POLICY "news_update_policy"
ON news
FOR UPDATE
USING (
  (
    author_id = auth.uid()
    AND status IN ('draft', 'pending_approval')
  )
  OR
  (
    is_journalism_adviser(auth.uid())
    AND status IN ('draft', 'pending_approval', 'approved')
  )
)
WITH CHECK (
  (
    author_id = auth.uid()
    AND status IN ('draft', 'pending_approval')
  )
  OR
  (
    is_journalism_adviser(auth.uid())
    AND status IN ('draft', 'pending_approval', 'approved')
  )
);

-- DELETE:
-- - Author can soft-delete own drafts
-- - Advisers can soft-delete any drafts
CREATE POLICY "news_delete_policy"
ON news
FOR DELETE
USING (
  (
    author_id = auth.uid()
    AND status = 'draft'
  )
  OR
  (
    is_journalism_adviser(auth.uid())
    AND status = 'draft'
  )
);

-- ============================================
-- NEWS_TAGS (Junction Table) - RLS POLICIES
-- ============================================
-- Follows same rules as news articles

-- SELECT: Same as news articles
CREATE POLICY "news_tags_select_policy"
ON news_tags
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM news
    WHERE news.id = news_tags.news_id
    AND (
      (news.status = 'published' AND news.visibility = 'public' AND news.deleted_at IS NULL)
      OR (news.status = 'published' AND news.visibility = 'journalism' AND is_journalism_member(auth.uid()) AND news.deleted_at IS NULL)
      OR (
        (news.author_id = auth.uid() OR is_journalism_adviser(auth.uid()))
        AND news.deleted_at IS NULL
      )
    )
  )
);

-- INSERT: Author or advisers can add tags to articles
CREATE POLICY "news_tags_insert_policy"
ON news_tags
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM news
    WHERE news.id = news_tags.news_id
    AND (news.author_id = auth.uid() OR is_journalism_adviser(auth.uid()))
    AND news.deleted_at IS NULL
  )
);

-- DELETE: Author or advisers can remove tags from articles
CREATE POLICY "news_tags_delete_policy"
ON news_tags
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM news
    WHERE news.id = news_tags.news_id
    AND (news.author_id = auth.uid() OR is_journalism_adviser(auth.uid()))
    AND news.deleted_at IS NULL
  )
);

-- ============================================
-- NEWS_CO_AUTHORS (Junction Table) - RLS POLICIES
-- ============================================

-- SELECT: Same as news articles
CREATE POLICY "news_co_authors_select_policy"
ON news_co_authors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM news
    WHERE news.id = news_co_authors.news_id
    AND (
      (news.status = 'published' AND news.deleted_at IS NULL)
      OR (news.author_id = auth.uid() OR is_journalism_adviser(auth.uid()))
    )
  )
);

-- INSERT: Author or advisers can add co-authors
CREATE POLICY "news_co_authors_insert_policy"
ON news_co_authors
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM news
    WHERE news.id = news_co_authors.news_id
    AND (news.author_id = auth.uid() OR is_journalism_adviser(auth.uid()))
    AND news.deleted_at IS NULL
  )
);

-- DELETE: Author or advisers can remove co-authors
CREATE POLICY "news_co_authors_delete_policy"
ON news_co_authors
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM news
    WHERE news.id = news_co_authors.news_id
    AND (news.author_id = auth.uid() OR is_journalism_adviser(auth.uid()))
    AND news.deleted_at IS NULL
  )
);

-- ============================================
-- NEWS_APPROVAL (Approval History) - RLS POLICIES
-- ============================================
-- Author, co-authors, and advisers can view approval history

-- SELECT: Author or advisers (co-authors can't be verified since they're now free text)
CREATE POLICY "news_approval_select_policy"
ON news_approval
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM news
    WHERE news.id = news_approval.news_id
    AND (
      news.author_id = auth.uid()
      OR is_journalism_adviser(auth.uid())
    )
  )
);

-- INSERT: Only advisers can create approval records
CREATE POLICY "news_approval_insert_advisers"
ON news_approval
FOR INSERT
WITH CHECK (
  is_journalism_adviser(auth.uid())
  AND approver_id = auth.uid()
);

-- UPDATE: Not allowed (approval history is immutable)
-- No UPDATE policy means no one can update

-- DELETE: Not allowed (approval history is immutable)
-- No DELETE policy means no one can delete

-- ============================================
-- GRANT PERMISSIONS TO SERVICE ROLE
-- ============================================
-- Service role bypasses RLS for backend operations

GRANT ALL ON news TO service_role;
GRANT ALL ON news_categories TO service_role;
GRANT ALL ON tags TO service_role;
GRANT ALL ON news_tags TO service_role;
GRANT ALL ON news_co_authors TO service_role;
GRANT ALL ON news_approval TO service_role;

-- ============================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================
-- Authenticated users can read/write based on RLS policies

GRANT SELECT, INSERT, UPDATE, DELETE ON news TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON news_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tags TO authenticated;
GRANT SELECT, INSERT, DELETE ON news_tags TO authenticated;
GRANT SELECT, INSERT, DELETE ON news_co_authors TO authenticated;
GRANT SELECT, INSERT ON news_approval TO authenticated;

-- ============================================
-- GRANT PERMISSIONS TO ANONYMOUS USERS
-- ============================================
-- Anonymous users can only read published public content

GRANT SELECT ON news TO anon;
GRANT SELECT ON news_categories TO anon;
GRANT SELECT ON tags TO anon;
GRANT SELECT ON news_tags TO anon;
GRANT SELECT ON news_co_authors TO anon;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON POLICY "news_categories_select_all" ON news_categories IS
'Allow everyone to view all news categories';

COMMENT ON POLICY "news_select_policy" ON news IS
'Published public articles visible to all; Published journalism articles visible to journalism members; Non-published articles visible to author, co-authors, and advisers';

COMMENT ON POLICY "news_insert_publishers" ON news IS
'Only journalism members with publishing positions (Writer, Publisher, EIC, Co-EIC, Adviser, Co-Adviser) can create articles';

COMMENT ON POLICY "news_update_policy" ON news IS
'Authors can update their own draft/pending articles; Advisers can update any draft/pending/approved article';

COMMENT ON POLICY "news_delete_policy" ON news IS
'Authors can soft-delete their own drafts; Advisers can soft-delete any drafts';

COMMENT ON FUNCTION is_journalism_adviser(UUID) IS
'Helper function to check if user is Adviser or Co-Adviser in Journalism domain';

COMMENT ON FUNCTION can_publish_news(UUID) IS
'Helper function to check if user has publishing rights (Writer, Publisher, EIC, Co-EIC, Adviser, Co-Adviser)';

COMMENT ON FUNCTION is_journalism_member(UUID) IS
'Helper function to check if user is a member of Journalism domain (any position)';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify RLS policies are working correctly

-- Check RLS is enabled on all tables
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('news', 'news_categories', 'tags', 'news_tags', 'news_co_authors', 'news_approval');

-- List all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('news', 'news_categories', 'tags', 'news_tags', 'news_co_authors', 'news_approval')
-- ORDER BY tablename, policyname;

-- Test helper functions (replace with actual user UUID)
-- SELECT is_journalism_adviser('your-user-uuid-here');
-- SELECT can_publish_news('your-user-uuid-here');
-- SELECT is_journalism_member('your-user-uuid-here');
