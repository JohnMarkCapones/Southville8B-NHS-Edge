-- Check the actual columns in user_domain_roles table
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_domain_roles'
ORDER BY ordinal_position;
