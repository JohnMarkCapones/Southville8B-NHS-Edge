-- Test if RLS is blocking the joins

-- 1. First, let's see if we can query with the service role (bypasses RLS)
-- This should work and show the data

SELECT
    m.id,
    m.title,
    m.subject_id,
    m.uploaded_by,
    -- Manually join
    s.subject_name,
    u.full_name
FROM modules m
LEFT JOIN subjects s ON m.subject_id = s.id
LEFT JOIN users u ON m.uploaded_by = u.id
WHERE m.is_deleted = false
LIMIT 3;

-- 2. Check RLS policies on users table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('users', 'subjects')
ORDER BY tablename, policyname;

-- 3. Check if RLS is enabled
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'subjects', 'modules');
