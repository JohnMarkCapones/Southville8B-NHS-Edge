-- Sections Management System Migration
-- This script creates the sections table and related functionality

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name VARCHAR(50) NOT NULL,
    grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 7 AND 10),
    adviser_id UUID REFERENCES users(id) ON DELETE SET NULL,
    building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
    floor_id UUID REFERENCES floors(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique section names per grade level
    UNIQUE(section_name, grade_level),
    
    -- Ensure adviser is not assigned to multiple sections
    UNIQUE(adviser_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sections_grade_level ON sections(grade_level);
CREATE INDEX IF NOT EXISTS idx_sections_adviser_id ON sections(adviser_id);
CREATE INDEX IF NOT EXISTS idx_sections_building_id ON sections(building_id);
CREATE INDEX IF NOT EXISTS idx_sections_floor_id ON sections(floor_id);
CREATE INDEX IF NOT EXISTS idx_sections_room_id ON sections(room_id);
CREATE INDEX IF NOT EXISTS idx_sections_status ON sections(status);
CREATE INDEX IF NOT EXISTS idx_sections_created_at ON sections(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE FUNCTION update_sections_updated_at();

-- Create RLS policies (disabled for now as requested)
-- ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Create policy for sections access
-- CREATE POLICY "Sections are viewable by authenticated users" ON sections
--     FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Sections are manageable by admins and teachers" ON sections
--     FOR ALL USING (
--         auth.role() = 'authenticated' AND (
--             EXISTS (
--                 SELECT 1 FROM users 
--                 WHERE users.id = auth.uid() 
--                 AND users.role IN ('admin', 'superadmin', 'teacher')
--             )
--         )
--     );

-- Insert sample data
INSERT INTO sections (section_name, grade_level, status) VALUES
    ('7-A', 7, 'active'),
    ('7-B', 7, 'active'),
    ('7-Einstein', 7, 'active'),
    ('7-Newton', 7, 'active'),
    ('8-A', 8, 'active'),
    ('8-B', 8, 'active'),
    ('8-C', 8, 'active'),
    ('8-Darwin', 8, 'active'),
    ('8-Curie', 8, 'active'),
    ('9-A', 9, 'active'),
    ('9-B', 9, 'active'),
    ('9-C', 9, 'active'),
    ('9-Tesla', 9, 'active'),
    ('9-Galileo', 9, 'active'),
    ('10-A', 10, 'active'),
    ('10-B', 10, 'active'),
    ('10-Hawking', 10, 'active'),
    ('10-Pasteur', 10, 'active')
ON CONFLICT (section_name, grade_level) DO NOTHING;

-- Create a view for sections with related data
CREATE OR REPLACE VIEW sections_with_details AS
SELECT 
    s.id,
    s.section_name,
    s.grade_level,
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

-- Create function to get available teachers (not assigned to any section)
CREATE OR REPLACE FUNCTION get_available_teachers()
RETURNS TABLE (
    id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR,
    full_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        CONCAT(u.first_name, ' ', u.last_name) as full_name
    FROM users u
    WHERE u.role = 'teacher'
    AND u.id NOT IN (
        SELECT COALESCE(adviser_id, '00000000-0000-0000-0000-000000000000'::UUID)
        FROM sections 
        WHERE adviser_id IS NOT NULL
    )
    ORDER BY u.first_name, u.last_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to get sections by grade level
CREATE OR REPLACE FUNCTION get_sections_by_grade(grade INTEGER)
RETURNS TABLE (
    id UUID,
    section_name VARCHAR,
    grade_level INTEGER,
    adviser_first_name VARCHAR,
    adviser_last_name VARCHAR,
    building_name VARCHAR,
    floor_name VARCHAR,
    room_number VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.section_name,
        s.grade_level,
        u.first_name as adviser_first_name,
        u.last_name as adviser_last_name,
        b.building_name,
        f.floor_name,
        r.room_number,
        s.status,
        s.created_at
    FROM sections s
    LEFT JOIN users u ON s.adviser_id = u.id
    LEFT JOIN buildings b ON s.building_id = b.id
    LEFT JOIN floors f ON s.floor_id = f.id
    LEFT JOIN rooms r ON s.room_id = r.id
    WHERE s.grade_level = grade
    ORDER BY s.section_name;
END;
$$ LANGUAGE plpgsql;








