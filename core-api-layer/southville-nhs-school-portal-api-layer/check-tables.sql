-- Check if the required tables exist and their structure
-- Run this in Supabase SQL Editor first

-- Check if students table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Check if student_rankings table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_rankings' 
ORDER BY ordinal_position;

-- Check if students_gwa table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'students_gwa' 
ORDER BY ordinal_position;

-- Check current data in tables
SELECT 'students' as table_name, COUNT(*) as row_count FROM students
UNION ALL
SELECT 'student_rankings' as table_name, COUNT(*) as row_count FROM student_rankings
UNION ALL
SELECT 'students_gwa' as table_name, COUNT(*) as row_count FROM students_gwa;
