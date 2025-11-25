-- Check your user's role in the database
-- Run this in Supabase SQL Editor

-- 1. Check what columns the users table has
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name LIKE '%role%'
ORDER BY ordinal_position;

-- 2. Check your specific user record
SELECT
  id,
  email,
  role,
  role_id,
  created_at
FROM users
WHERE email = 'superadmin@gmail.com';

-- 3. If you have a roles table, check what roles exist
SELECT * FROM roles;

-- 4. If using role_id, join to get the role name
SELECT
  u.id,
  u.email,
  u.role_id,
  r.name as role_name,
  r.id as role_table_id
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'superadmin@gmail.com';
