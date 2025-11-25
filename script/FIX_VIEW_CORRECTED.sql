-- ============================================
-- FIX VIEW TO INCLUDE teacher_id COLUMN
-- Corrected version without rooms.number
-- Run this in Supabase SQL Editor RIGHT NOW
-- ============================================

-- First, let's check what columns rooms table actually has
-- Uncomment this to see the structure:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'rooms'
--   AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Drop the old view
DROP VIEW IF EXISTS sections_with_details;

-- Create the corrected view with teacher_id column
-- Removing r.number since it doesn't exist in rooms table
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
    -- Teacher/Adviser details (from users table)
    u.full_name as adviser_name,
    u.email as adviser_email,
    -- Building details
    b.building_name,
    b.code as building_code,
    -- Floor details
    f.name as floor_name,
    f.number as floor_number,
    -- Room details (without room.number since it doesn't exist)
    r.room_number,       -- Using room_number if it exists
    r.name as room_name,
    r.capacity as room_capacity
FROM sections s
LEFT JOIN users u ON s.teacher_id = u.id
LEFT JOIN buildings b ON s.building_id = b.id
LEFT JOIN floors f ON s.floor_id = f.id
LEFT JOIN rooms r ON s.room_id = r.id;

-- Verify the view was created successfully
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'sections_with_details'
  AND table_schema = 'public'
ORDER BY ordinal_position;
