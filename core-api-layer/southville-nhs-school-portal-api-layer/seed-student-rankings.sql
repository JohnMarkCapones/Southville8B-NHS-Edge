-- Seed Student Rankings Data for Leaderboard
-- This script adds sample student rankings data to test the leaderboard

-- First, let's check if we have students in the database
-- If not, we'll create some sample students

-- Insert sample students if they don't exist
INSERT INTO students (
    id,
    first_name,
    last_name,
    middle_name,
    student_id,
    lrn_id,
    grade_level,
    section_id,
    email,
    phone_number,
    address,
    birth_date,
    gender,
    created_at,
    updated_at
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Maria', 'Santos', 'Cruz', 'STU-2024-001', 'LRN-001', 'Grade 10', NULL, 'maria.santos@student.southville.edu', '+639171234567', '123 Main St, Quezon City', '2008-03-15', 'Female', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Juan', 'Dela Cruz', 'Miguel', 'STU-2024-002', 'LRN-002', 'Grade 10', NULL, 'juan.delacruz@student.southville.edu', '+639171234568', '456 Oak Ave, Manila', '2008-07-22', 'Male', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Ana', 'Garcia', 'Luna', 'STU-2024-003', 'LRN-003', 'Grade 10', NULL, 'ana.garcia@student.southville.edu', '+639171234569', '789 Pine St, Makati', '2008-01-10', 'Female', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'Carlos', 'Rodriguez', 'Antonio', 'STU-2024-004', 'LRN-004', 'Grade 10', NULL, 'carlos.rodriguez@student.southville.edu', '+639171234570', '321 Elm St, Taguig', '2008-05-18', 'Male', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'Sofia', 'Martinez', 'Isabella', 'STU-2024-005', 'LRN-005', 'Grade 10', NULL, 'sofia.martinez@student.southville.edu', '+639171234571', '654 Maple Ave, Pasig', '2008-09-03', 'Female', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', 'Diego', 'Lopez', 'Fernando', 'STU-2024-006', 'LRN-006', 'Grade 9', NULL, 'diego.lopez@student.southville.edu', '+639171234572', '987 Cedar St, Mandaluyong', '2009-02-14', 'Male', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440007', 'Isabella', 'Hernandez', 'Carmen', 'STU-2024-007', 'LRN-007', 'Grade 9', NULL, 'isabella.hernandez@student.southville.edu', '+639171234573', '147 Birch Ave, San Juan', '2009-06-28', 'Female', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440008', 'Miguel', 'Gonzalez', 'Rafael', 'STU-2024-008', 'LRN-008', 'Grade 9', NULL, 'miguel.gonzalez@student.southville.edu', '+639171234574', '258 Spruce St, Marikina', '2009-11-12', 'Male', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440009', 'Valentina', 'Perez', 'Elena', 'STU-2024-009', 'LRN-009', 'Grade 8', NULL, 'valentina.perez@student.southville.edu', '+639171234575', '369 Willow Ave, Caloocan', '2010-04-25', 'Female', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440010', 'Sebastian', 'Sanchez', 'Alejandro', 'STU-2024-010', 'LRN-010', 'Grade 8', NULL, 'sebastian.sanchez@student.southville.edu', '+639171234576', '741 Poplar St, Las Pinas', '2010-08-07', 'Male', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample student rankings data
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
) VALUES 
    -- Grade 10 Top Students
    ('rank-001', '550e8400-e29b-41d4-a716-446655440001', 1, 'Grade 10', 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('rank-002', '550e8400-e29b-41d4-a716-446655440002', 2, 'Grade 10', 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('rank-003', '550e8400-e29b-41d4-a716-446655440003', 3, 'Grade 10', 'Q1', '2024-2025', 'With High Honors', NOW(), NOW()),
    ('rank-004', '550e8400-e29b-41d4-a716-446655440004', 4, 'Grade 10', 'Q1', '2024-2025', 'With High Honors', NOW(), NOW()),
    ('rank-005', '550e8400-e29b-41d4-a716-446655440005', 5, 'Grade 10', 'Q1', '2024-2025', 'With High Honors', NOW(), NOW()),
    
    -- Grade 9 Top Students
    ('rank-006', '550e8400-e29b-41d4-a716-446655440006', 1, 'Grade 9', 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('rank-007', '550e8400-e29b-41d4-a716-446655440007', 2, 'Grade 9', 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('rank-008', '550e8400-e29b-41d4-a716-446655440008', 3, 'Grade 9', 'Q1', '2024-2025', 'With High Honors', NOW(), NOW()),
    
    -- Grade 8 Top Students
    ('rank-009', '550e8400-e29b-41d4-a716-446655440009', 1, 'Grade 8', 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('rank-010', '550e8400-e29b-41d4-a716-446655440010', 2, 'Grade 8', 'Q1', '2024-2025', 'With High Honors', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample GWA data
INSERT INTO students_gwa (
    id,
    student_id,
    gwa,
    grading_period,
    school_year,
    honor_status,
    created_at,
    updated_at
) VALUES 
    -- Grade 10 GWA Data
    ('gwa-001', '550e8400-e29b-41d4-a716-446655440001', 98.5, 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('gwa-002', '550e8400-e29b-41d4-a716-446655440002', 97.8, 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('gwa-003', '550e8400-e29b-41d4-a716-446655440003', 96.2, 'Q1', '2024-2025', 'With High Honors', NOW(), NOW()),
    ('gwa-004', '550e8400-e29b-41d4-a716-446655440004', 95.7, 'Q1', '2024-2025', 'With High Honors', NOW(), NOW()),
    ('gwa-005', '550e8400-e29b-41d4-a716-446655440005', 94.9, 'Q1', '2024-2025', 'With High Honors', NOW(), NOW()),
    
    -- Grade 9 GWA Data
    ('gwa-006', '550e8400-e29b-41d4-a716-446655440006', 97.3, 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('gwa-007', '550e8400-e29b-41d4-a716-446655440007', 96.8, 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('gwa-008', '550e8400-e29b-41d4-a716-446655440008', 95.4, 'Q1', '2024-2025', 'With High Honors', NOW(), NOW()),
    
    -- Grade 8 GWA Data
    ('gwa-009', '550e8400-e29b-41d4-a716-446655440009', 98.1, 'Q1', '2024-2025', 'With Highest Honors', NOW(), NOW()),
    ('gwa-010', '550e8400-e29b-41d4-a716-446655440010', 96.5, 'Q1', '2024-2025', 'With High Honors', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

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
ORDER BY sr.grade_level, sr.rank;
