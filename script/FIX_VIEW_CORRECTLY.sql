-- CORRECT VIEW DEFINITION - Run this in Supabase SQL Editor NOW
-- This matches your actual database schema

DROP VIEW IF EXISTS sections_with_details;

CREATE VIEW sections_with_details AS
SELECT
    s.id,
    s.name,
    s.grade_level,
    s.teacher_id,        -- ✅ CRITICAL: This column was missing!
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
    -- Room details
    r.number as room_number,
    r.name as room_name,
    r.capacity as room_capacity
FROM sections s
LEFT JOIN users u ON s.teacher_id = u.id
LEFT JOIN buildings b ON s.building_id = b.id
LEFT JOIN floors f ON s.floor_id = f.id
LEFT JOIN rooms r ON s.room_id = r.id;
