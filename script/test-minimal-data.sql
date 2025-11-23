-- Minimal test data - insert just one student and ranking
-- Run this in Supabase SQL Editor to test the structure

-- Insert one test student
INSERT INTO students (
    id,
    first_name,
    last_name,
    student_id,
    grade_level,
    email,
    created_at,
    updated_at
) VALUES (
    'test-student-001',
    'Test',
    'Student',
    'TEST-001',
    'Grade 10',
    'test@student.southville.edu',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert one test ranking
INSERT INTO student_rankings (
    id,
    student_id,
    rank,
    grade_level,
    quarter,
    school_year,
    honor_status,
    created_at,
    updated_at
) VALUES (
    'test-ranking-001',
    'test-student-001',
    1,
    'Grade 10',
    'Q1',
    '2024-2025',
    'With Highest Honors',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert one test GWA
INSERT INTO students_gwa (
    id,
    student_id,
    gwa,
    grading_period,
    school_year,
    honor_status,
    created_at,
    updated_at
) VALUES (
    'test-gwa-001',
    'test-student-001',
    98.5,
    'Q1',
    '2024-2025',
    'With Highest Honors',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 
    sr.id,
    sr.rank,
    sr.grade_level,
    sr.honor_status,
    s.first_name,
    s.last_name,
    s.student_id,
    g.gwa
FROM student_rankings sr
JOIN students s ON sr.student_id = s.id
LEFT JOIN students_gwa g ON sr.student_id = g.student_id AND g.grading_period = sr.quarter AND g.school_year = sr.school_year
WHERE sr.id = 'test-ranking-001';
