-- Check if foreign key exists between students.section_id and sections.id
-- Run this in Supabase SQL Editor

-- 1. Check foreign key constraints on students table
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'students';

-- 2. If foreign key doesn't exist, create it
-- UNCOMMENT AND RUN THIS IF QUERY #1 SHOWS NO RESULTS:
-- ALTER TABLE students
-- ADD CONSTRAINT fk_students_section
-- FOREIGN KEY (section_id)
-- REFERENCES sections(id)
-- ON DELETE SET NULL;

-- 3. Test the join manually to verify it works
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.section_id,
    sec.id as section_id_from_join,
    sec.name as section_name
FROM students s
LEFT JOIN sections sec ON s.section_id = sec.id
WHERE s.section_id = '691e041c-ec56-4a47-b379-cc0a4ac21637'
LIMIT 1;
