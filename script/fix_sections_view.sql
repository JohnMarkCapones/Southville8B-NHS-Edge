-- Fix sections_with_details view to include missing adviser_id and other foreign keys
-- Run this SQL in your Supabase SQL Editor

-- Drop and recreate the view with all necessary columns
CREATE OR REPLACE VIEW sections_with_details AS
SELECT
    s.id,
    s.section_name,
    s.grade_level,
    s.adviser_id,        -- Added missing adviser_id
    s.building_id,       -- Added missing building_id
    s.floor_id,          -- Added missing floor_id
    s.room_id,           -- Added missing room_id
    s.status,
    s.created_at,
    s.updated_at,
    -- Adviser details
    u.first_name as adviser_first_name,
    u.last_name as adviser_last_name,
    u.email as adviser_email,
    -- Building details
    b.building_name,
    b.building_code,
    -- Floor details
    f.floor_name,
    f.floor_number,
    -- Room details
    r.room_number,
    r.room_name,
    r.capacity as room_capacity
FROM sections s
LEFT JOIN users u ON s.adviser_id = u.id
LEFT JOIN buildings b ON s.building_id = b.id
LEFT JOIN floors f ON s.floor_id = f.id
LEFT JOIN rooms r ON s.room_id = r.id;
