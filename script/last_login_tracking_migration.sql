-- ============================================
-- LAST LOGIN TRACKING MIGRATION
-- Simplified version - only adds last login tracking
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
-- PART 2: SEED SAMPLE DATA FOR TESTING
-- ============================================

-- Update some existing users with sample last login dates
-- This simulates recent activity for testing purposes

-- Recent logins (last 7 days)
UPDATE users 
SET last_login_at = NOW() - INTERVAL '1 day'
WHERE id IN (
  SELECT id FROM users 
  WHERE role_id IN (SELECT id FROM roles WHERE name IN ('Student', 'Teacher', 'Admin'))
  LIMIT 5
);

-- Some logins from last week
UPDATE users 
SET last_login_at = NOW() - INTERVAL '3 days'
WHERE id IN (
  SELECT id FROM users 
  WHERE role_id IN (SELECT id FROM roles WHERE name IN ('Student', 'Teacher'))
  AND last_login_at IS NULL
  LIMIT 3
);

-- Some logins from last month
UPDATE users 
SET last_login_at = NOW() - INTERVAL '2 weeks'
WHERE id IN (
  SELECT id FROM users 
  WHERE role_id IN (SELECT id FROM roles WHERE name IN ('Student'))
  AND last_login_at IS NULL
  LIMIT 2
);

-- Some very old logins (inactive users)
UPDATE users 
SET last_login_at = NOW() - INTERVAL '2 months'
WHERE id IN (
  SELECT id FROM users 
  WHERE role_id IN (SELECT id FROM roles WHERE name IN ('Student'))
  AND last_login_at IS NULL
  LIMIT 1
);

-- ============================================
-- PART 3: VERIFICATION QUERIES
-- ============================================

-- Check that the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'last_login_at';

-- Check that the index was created
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'users' 
AND indexname = 'idx_users_last_login_at';

-- Show sample of users with last login data
SELECT 
  u.id,
  u.full_name,
  u.email,
  r.name as role_name,
  u.last_login_at,
  CASE 
    WHEN u.last_login_at IS NULL THEN 'Never logged in'
    WHEN u.last_login_at > NOW() - INTERVAL '7 days' THEN 'Active (last 7 days)'
    WHEN u.last_login_at > NOW() - INTERVAL '30 days' THEN 'Recent (last 30 days)'
    WHEN u.last_login_at > NOW() - INTERVAL '90 days' THEN 'Inactive (last 90 days)'
    ELSE 'Very inactive (90+ days)'
  END as login_status
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.last_login_at IS NOT NULL
ORDER BY u.last_login_at DESC
LIMIT 10;

-- Count users by login status
SELECT 
  CASE 
    WHEN last_login_at IS NULL THEN 'Never logged in'
    WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 'Active (last 7 days)'
    WHEN last_login_at > NOW() - INTERVAL '30 days' THEN 'Recent (last 30 days)'
    WHEN last_login_at > NOW() - INTERVAL '90 days' THEN 'Inactive (last 90 days)'
    ELSE 'Very inactive (90+ days)'
  END as login_status,
  COUNT(*) as user_count
FROM users
GROUP BY 
  CASE 
    WHEN last_login_at IS NULL THEN 'Never logged in'
    WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 'Active (last 7 days)'
    WHEN last_login_at > NOW() - INTERVAL '30 days' THEN 'Recent (last 30 days)'
    WHEN last_login_at > NOW() - INTERVAL '90 days' THEN 'Inactive (last 90 days)'
    ELSE 'Very inactive (90+ days)'
  END
ORDER BY 
  CASE 
    WHEN last_login_at IS NULL THEN 1
    WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 2
    WHEN last_login_at > NOW() - INTERVAL '30 days' THEN 3
    WHEN last_login_at > NOW() - INTERVAL '90 days' THEN 4
    ELSE 5
  END;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- ✅ Last login tracking column added
-- ✅ Performance index created
-- ✅ Sample data seeded for testing
-- ✅ Verification queries completed
-- ============================================
