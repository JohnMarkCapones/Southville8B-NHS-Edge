-- Check what columns domain_roles actually has
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'domain_roles'
ORDER BY ordinal_position;
