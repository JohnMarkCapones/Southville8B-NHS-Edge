-- ============================================
-- VERIFY JOURNALISM DOMAIN SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Check if domains table exists and what columns it has
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'domains'
ORDER BY ordinal_position;

-- Check if journalism domain exists
SELECT * FROM domains WHERE type = 'journalism';

-- Check users table structure (to see if it's 'role' or 'role_id')
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name LIKE '%role%';

-- Check if there are any domains at all
SELECT * FROM domains LIMIT 5;

-- Check domain_roles table
SELECT * FROM domain_roles LIMIT 5;
