-- ============================================
-- LAST LOGIN TRACKING + PBAC HELPER VIEW
-- Simplified version using EXISTING PBAC system
-- ============================================
-- This script:
-- 1. Adds last_login_at to users table
-- 2. Creates view to get user's primary domain role
-- NO redundant position tables - uses existing PBAC!
-- ============================================

-- ============================================
-- PART 1: ADD LAST LOGIN TRACKING
-- ============================================

-- Add last_login_at column to users table
-- This will be synced from Supabase Auth's last_sign_in_at
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Add index for performance on last login queries
CREATE INDEX IF NOT EXISTS idx_users_last_login_at
ON users(last_login_at DESC);

-- Add comment
COMMENT ON COLUMN users.last_login_at IS 'Last successful login timestamp, synced from Supabase Auth';

-- ============================================
-- PART 2: CREATE HELPER VIEW FOR DOMAIN ROLES
-- ============================================

-- View to get primary domain role per user
-- Uses EXISTING PBAC system (user_domain_roles, domain_roles, domains)
CREATE OR REPLACE VIEW user_primary_domain_roles AS
SELECT DISTINCT ON (udr.user_id)
  udr.user_id,
  dr.name AS primary_role,              -- e.g., "Editor-in-Chief", "Treasurer"
  d.type AS domain_type,                -- e.g., "journalism", "club"
  d.name AS domain_name,                -- e.g., "School Newspaper", "Math Club"
  d.id AS domain_id,
  udr.created_at AS assigned_at
FROM user_domain_roles udr
JOIN domain_roles dr ON udr.domain_role_id = dr.id
JOIN domains d ON dr.domain_id = d.id
ORDER BY udr.user_id, udr.created_at DESC;

COMMENT ON VIEW user_primary_domain_roles IS 'Primary domain role per user (most recent assignment from existing PBAC system)';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that last_login_at column was added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'last_login_at';

-- Check that view was created
SELECT
  table_name,
  view_definition IS NOT NULL as has_definition
FROM information_schema.views
WHERE table_schema = 'public' AND table_name = 'user_primary_domain_roles';

-- Check that index was created
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users' AND indexname = 'idx_users_last_login_at';

-- Sample data from view (users with domain roles)
SELECT
  user_id,
  primary_role,
  domain_type,
  domain_name
FROM user_primary_domain_roles
LIMIT 10;

-- Count users with domain roles
SELECT
  domain_type,
  primary_role,
  COUNT(*) as user_count
FROM user_primary_domain_roles
GROUP BY domain_type, primary_role
ORDER BY domain_type, user_count DESC;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Verify column and view created (queries above)
-- 2. Confirm user_primary_domain_roles has data
-- 3. Inform Claude that database setup is complete
-- 4. Claude will implement backend to:
--    - Sync last_login_at from Supabase Auth
--    - Query user_primary_domain_roles for "Sub Role"
--    - Update frontend table to display both
-- ============================================
