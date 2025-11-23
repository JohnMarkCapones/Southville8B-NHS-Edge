-- Fix missing student record for user e34934b0-d32e-4379-9220-37c56134ddd5
-- This user exists in Supabase Auth but doesn't have a student record

-- Insert the missing student record
INSERT INTO students (
    id,
    user_id,
    first_name,
    last_name,
    student_id,
    lrn_id,
    grade_level,
    birthday,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'e34934b0-d32e-4379-9220-37c56134ddd5',
    'Test',
    'Student',
    'STU-2024-001',
    '123456789092',
    'Grade 10',
    '2000-05-15',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Verify the record was created
SELECT 
    s.id,
    s.user_id,
    s.first_name,
    s.last_name,
    s.student_id,
    s.lrn_id,
    s.grade_level
FROM students s 
WHERE s.user_id = 'e34934b0-d32e-4379-9220-37c56134ddd5';
