-- ============================================
-- MINIMAL VIEW FIX - Only essential columns
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the old view
DROP VIEW IF EXISTS sections_with_details;

-- Create minimal view with only sections and teacher info
CREATE VIEW sections_with_details AS
SELECT
    s.id,
    s.name,
    s.grade_level,
    s.teacher_id,        -- ✅ CRITICAL: Adding this column!
    s.building_id,
    s.floor_id,
    s.room_id,
    s.status,
    s.created_at,
    s.updated_at,
    -- Teacher/Adviser details only
    u.full_name as adviser_name,
    u.email as adviser_email
FROM sections s
LEFT JOIN users u ON s.teacher_id = u.id;

-- Verify the view was created successfully
SELECT
    'View created successfully!' as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'sections_with_details'
  AND table_schema = 'public';

-- Show all columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sections_with_details'
  AND table_schema = 'public'
ORDER BY ordinal_position;
