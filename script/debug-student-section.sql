-- Debug: Check student section data
-- Run this in Supabase SQL Editor to see what's in the database

-- 1. Check if your student record has a section_id
SELECT
    id,
    first_name,
    last_name,
    student_id,
    grade_level,
    section_id
FROM students
LIMIT 5;

-- 2. Check if sections table has data
SELECT
    id,
    name,
    grade_level,
    created_at
FROM sections
LIMIT 10;

-- 3. Check foreign key relationship
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'students'
  AND kcu.column_name = 'section_id';

-- 4. Test the join manually
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.section_id,
    sec.name as section_name,
    sec.grade_level as section_grade
FROM students s
LEFT JOIN sections sec ON s.section_id = sec.id
LIMIT 5;
