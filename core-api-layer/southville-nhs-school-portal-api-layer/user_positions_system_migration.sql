-- ============================================
-- USER MANAGEMENT TABLE INTEGRATION
-- Database Migration Script
-- ============================================
-- This script adds:
-- 1. Last login tracking to users table
-- 2. Comprehensive user positions system
-- 3. Helper views for easy querying
-- 4. RLS policies for security
-- ============================================

-- ============================================
-- PART 1: ADD LAST LOGIN TRACKING
-- ============================================

-- Add last_login_at column to users table
-- This will be synced from Supabase Auth's last_sign_in_at
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Add index for performance on last login queries
CREATE INDEX IF NOT EXISTS idx_users_last_login_at
ON users(last_login_at DESC);

-- Add comment
COMMENT ON COLUMN users.last_login_at IS 'Last successful login timestamp, synced from Supabase Auth';

-- ============================================
-- PART 2: CREATE USER POSITIONS SYSTEM
-- ============================================

-- Drop existing types if they exist (for idempotency)
DO $$ BEGIN
  CREATE TYPE position_category AS ENUM (
    'student_club',        -- Club positions (President, Vice President, etc.)
    'student_class',       -- Class positions (Representative, Peace Officer, etc.)
    'student_organization',-- Organization positions (Secretary, Treasurer, etc.)
    'teacher_department',  -- Teacher department positions (Head, Coordinator, etc.)
    'teacher_club',        -- Teacher club positions (Adviser, Co-Adviser, etc.)
    'teacher_academic',    -- Academic positions (Coordinator, Head, etc.)
    'admin_system'         -- Admin system positions (Super Admin, System Admin, etc.)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create positions lookup table
CREATE TABLE IF NOT EXISTS user_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,                    -- e.g., "Club President", "Department Head"
  category position_category NOT NULL,            -- Category of position
  description TEXT,                               -- Description of the position
  authority_level INTEGER DEFAULT 0,              -- For hierarchy (higher = more authority)
  is_active BOOLEAN DEFAULT TRUE,                 -- Can disable positions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique position names within each category
  UNIQUE(name, category)
);

-- Create user position assignments table
CREATE TABLE IF NOT EXISTS user_position_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES user_positions(id) ON DELETE CASCADE,

  -- Context: What is this position for?
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,              -- If club position
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,  -- If department position
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,        -- If class position

  -- Assignment metadata
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),          -- Who assigned this position
  is_active BOOLEAN DEFAULT TRUE,                 -- Can deactivate without deleting
  effective_from DATE,                            -- When position starts
  effective_until DATE,                           -- When position ends (nullable = indefinite)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure user can't have same position twice in same context
  UNIQUE(user_id, position_id, club_id, department_id, section_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_position_assignments_user_id
ON user_position_assignments(user_id) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_position_assignments_position_id
ON user_position_assignments(position_id);

CREATE INDEX IF NOT EXISTS idx_user_position_assignments_club_id
ON user_position_assignments(club_id) WHERE club_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_position_assignments_department_id
ON user_position_assignments(department_id) WHERE department_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_position_assignments_section_id
ON user_position_assignments(section_id) WHERE section_id IS NOT NULL;

-- Add comments
COMMENT ON TABLE user_positions IS 'Lookup table for all possible user positions across the system';
COMMENT ON TABLE user_position_assignments IS 'Assigns positions to users with context (club, department, section)';
COMMENT ON COLUMN user_positions.authority_level IS 'Higher number = more authority (for sorting)';

-- ============================================
-- PART 3: SEED DEFAULT POSITIONS
-- ============================================

-- Student Club Positions
INSERT INTO user_positions (name, category, description, authority_level) VALUES
('Club President', 'student_club', 'Leads the club and presides over meetings', 10),
('Club Vice President', 'student_club', 'Assists the president and acts in their absence', 9),
('Secretary', 'student_club', 'Records minutes and manages club documentation', 7),
('Treasurer', 'student_club', 'Manages club finances and budgets', 7),
('Auditor', 'student_club', 'Reviews and audits club financial records', 6),
('Public Information Officer', 'student_club', 'Manages club communications and publicity', 6),
('Muse', 'student_club', 'Represents the club in social events', 5),
('Escort', 'student_club', 'Accompanies the Muse in social events', 5),
('Business Manager', 'student_club', 'Manages club business operations', 6),
('Sergeant at Arms', 'student_club', 'Maintains order during club activities', 5)
ON CONFLICT (name, category) DO NOTHING;

-- Student Class Positions
INSERT INTO user_positions (name, category, description, authority_level) VALUES
('Class Representative', 'student_class', 'Represents the class in school matters', 8),
('Peace Officer', 'student_class', 'Maintains peace and order in the classroom', 5),
('Environmental Officer', 'student_class', 'Manages classroom cleanliness and environment', 4),
('Sports Captain', 'student_class', 'Leads class in sports activities', 5),
('IT Officer', 'student_class', 'Manages class technology and digital resources', 4),
('Health Officer', 'student_class', 'Monitors class health and safety', 4)
ON CONFLICT (name, category) DO NOTHING;

-- Student Organization Positions
INSERT INTO user_positions (name, category, description, authority_level) VALUES
('Student Council President', 'student_organization', 'Leads the entire student council', 10),
('Student Council Vice President', 'student_organization', 'Assists the council president', 9),
('Student Council Secretary', 'student_organization', 'Records council proceedings', 7),
('Student Council Treasurer', 'student_organization', 'Manages council finances', 7),
('Regular Student', 'student_organization', 'Standard student with no special position', 1)
ON CONFLICT (name, category) DO NOTHING;

-- Teacher Department Positions
INSERT INTO user_positions (name, category, description, authority_level) VALUES
('Department Head', 'teacher_department', 'Leads the academic department', 10),
('Assistant Department Head', 'teacher_department', 'Assists the department head', 8),
('Regular Teacher', 'teacher_department', 'Standard teaching position', 5)
ON CONFLICT (name, category) DO NOTHING;

-- Teacher Club Positions
INSERT INTO user_positions (name, category, description, authority_level) VALUES
('Club Adviser', 'teacher_club', 'Advises and mentors the club', 8),
('Club Co-Adviser', 'teacher_club', 'Assists the club adviser', 7)
ON CONFLICT (name, category) DO NOTHING;

-- Teacher Academic Positions
INSERT INTO user_positions (name, category, description, authority_level) VALUES
('Academic Coordinator', 'teacher_academic', 'Coordinates academic programs', 9),
('Sports Coordinator', 'teacher_academic', 'Coordinates sports programs', 8),
('Guidance Counselor', 'teacher_academic', 'Provides student guidance and counseling', 7),
('Library Coordinator', 'teacher_academic', 'Manages library operations', 7),
('Research Coordinator', 'teacher_academic', 'Coordinates research activities', 7)
ON CONFLICT (name, category) DO NOTHING;

-- Admin Positions
INSERT INTO user_positions (name, category, description, authority_level) VALUES
('Super Administrator', 'admin_system', 'Full system access and control', 10),
('System Administrator', 'admin_system', 'Manages system operations', 9),
('Content Administrator', 'admin_system', 'Manages content and publications', 7),
('User Administrator', 'admin_system', 'Manages user accounts', 8)
ON CONFLICT (name, category) DO NOTHING;

-- ============================================
-- PART 4: CREATE HELPER VIEWS
-- ============================================

-- View: User positions with full context
CREATE OR REPLACE VIEW user_positions_detailed AS
SELECT
  upa.id AS assignment_id,
  upa.user_id,
  u.full_name AS user_name,
  u.email AS user_email,
  ur.name AS user_role,
  up.id AS position_id,
  up.name AS position_name,
  up.category AS position_category,
  up.authority_level,
  upa.club_id,
  c.name AS club_name,
  upa.department_id,
  d.department_name,
  upa.section_id,
  s.name AS section_name,
  upa.is_active,
  upa.assigned_at,
  upa.effective_from,
  upa.effective_until
FROM user_position_assignments upa
JOIN users u ON upa.user_id = u.id
LEFT JOIN roles ur ON u.role_id = ur.id
JOIN user_positions up ON upa.position_id = up.id
LEFT JOIN clubs c ON upa.club_id = c.id
LEFT JOIN departments d ON upa.department_id = d.id
LEFT JOIN sections s ON upa.section_id = s.id
WHERE upa.is_active = TRUE;

-- View: Primary position per user (highest authority)
CREATE OR REPLACE VIEW user_primary_positions AS
SELECT DISTINCT ON (user_id)
  user_id,
  position_name AS primary_position,
  position_category,
  authority_level,
  club_name,
  department_name,
  section_name
FROM user_positions_detailed
ORDER BY user_id, authority_level DESC, assigned_at DESC;

COMMENT ON VIEW user_positions_detailed IS 'Full details of all user position assignments';
COMMENT ON VIEW user_primary_positions IS 'Primary (highest authority) position per user';

-- ============================================
-- PART 5: ROW-LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE user_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_position_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view user positions" ON user_positions;
DROP POLICY IF EXISTS "Only admins can modify user positions" ON user_positions;
DROP POLICY IF EXISTS "Users can view position assignments" ON user_position_assignments;
DROP POLICY IF EXISTS "Only admins can modify position assignments" ON user_position_assignments;

-- Policy: Anyone can view positions (public data)
CREATE POLICY "Anyone can view user positions"
ON user_positions FOR SELECT
USING (true);

-- Policy: Only admins can modify positions
CREATE POLICY "Only admins can modify user positions"
ON user_positions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name = 'Admin'
  )
);

-- Policy: Users can view their own assignments and admins can view all
CREATE POLICY "Users can view position assignments"
ON user_position_assignments FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name IN ('Admin', 'Teacher')
  )
);

-- Policy: Only admins can create/update/delete assignments
CREATE POLICY "Only admins can modify position assignments"
ON user_position_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name = 'Admin'
  )
);

-- ============================================
-- PART 6: TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_positions
DROP TRIGGER IF EXISTS update_user_positions_updated_at ON user_positions;
CREATE TRIGGER update_user_positions_updated_at
BEFORE UPDATE ON user_positions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_position_assignments
DROP TRIGGER IF EXISTS update_user_position_assignments_updated_at ON user_position_assignments;
CREATE TRIGGER update_user_position_assignments_updated_at
BEFORE UPDATE ON user_position_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that all tables were created
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('user_positions', 'user_position_assignments')
ORDER BY table_name;

-- Check that views were created
SELECT
  table_name,
  view_definition IS NOT NULL as has_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('user_positions_detailed', 'user_primary_positions');

-- Count seeded positions
SELECT
  category,
  COUNT(*) as position_count
FROM user_positions
GROUP BY category
ORDER BY category;

-- Check RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_positions', 'user_position_assignments');

-- Display all seeded positions
SELECT
  category,
  name,
  authority_level,
  description
FROM user_positions
ORDER BY category, authority_level DESC;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Verify all tables and views exist above
-- 2. Inform Claude that database setup is complete
-- 3. Claude will implement backend and frontend code
-- ============================================
