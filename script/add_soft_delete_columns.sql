-- ============================================
-- ADD SOFT DELETE COLUMNS
-- Database Migration Script
-- ============================================
-- This script adds soft delete functionality to:
-- 1. students table
-- 2. teachers table  
-- 3. events table
-- ============================================

-- ============================================
-- PART 1: ADD SOFT DELETE COLUMNS TO STUDENTS TABLE
-- ============================================

-- Add deleted_at column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_by column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Add index for performance on soft delete queries
CREATE INDEX IF NOT EXISTS idx_students_deleted_at
ON students(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_students_deleted_by
ON students(deleted_by) WHERE deleted_by IS NOT NULL;

-- Add comments
COMMENT ON COLUMN students.deleted_at IS 'Timestamp when the student record was soft deleted (NULL = active)';
COMMENT ON COLUMN students.deleted_by IS 'User ID who performed the soft delete operation';

-- ============================================
-- PART 2: ADD SOFT DELETE COLUMNS TO TEACHERS TABLE
-- ============================================

-- Add deleted_at column to teachers table
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_by column to teachers table
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Add index for performance on soft delete queries
CREATE INDEX IF NOT EXISTS idx_teachers_deleted_at
ON teachers(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_teachers_deleted_by
ON teachers(deleted_by) WHERE deleted_by IS NOT NULL;

-- Add comments
COMMENT ON COLUMN teachers.deleted_at IS 'Timestamp when the teacher record was soft deleted (NULL = active)';
COMMENT ON COLUMN teachers.deleted_by IS 'User ID who performed the soft delete operation';

-- ============================================
-- PART 3: ADD SOFT DELETE COLUMNS TO EVENTS TABLE
-- ============================================

-- Add deleted_at column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_by column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Add index for performance on soft delete queries
CREATE INDEX IF NOT EXISTS idx_events_deleted_at
ON events(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_events_deleted_by
ON events(deleted_by) WHERE deleted_by IS NOT NULL;

-- Add comments
COMMENT ON COLUMN events.deleted_at IS 'Timestamp when the event record was soft deleted (NULL = active)';
COMMENT ON COLUMN events.deleted_by IS 'User ID who performed the soft delete operation';

-- ============================================
-- PART 4: UPDATE ROW-LEVEL SECURITY POLICIES
-- ============================================

-- Update RLS policies to exclude soft-deleted records
-- Students table policies
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Teachers can view their students" ON students;
DROP POLICY IF EXISTS "Admins can view all students" ON students;

-- Recreate students policies with soft delete exclusion
CREATE POLICY "Students can view their own data"
ON students FOR SELECT
USING (
  user_id = auth.uid() 
  AND deleted_at IS NULL
);

CREATE POLICY "Teachers can view their students"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name = 'Teacher'
  )
  AND deleted_at IS NULL
);

CREATE POLICY "Admins can view all students"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name IN ('Admin', 'Super Admin')
  )
  AND deleted_at IS NULL
);

-- Teachers table policies
DROP POLICY IF EXISTS "Teachers can view their own data" ON teachers;
DROP POLICY IF EXISTS "Admins can view all teachers" ON teachers;

-- Recreate teachers policies with soft delete exclusion
CREATE POLICY "Teachers can view their own data"
ON teachers FOR SELECT
USING (
  user_id = auth.uid() 
  AND deleted_at IS NULL
);

CREATE POLICY "Admins can view all teachers"
ON teachers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name IN ('Admin', 'Super Admin')
  )
  AND deleted_at IS NULL
);

-- Events table policies
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;

-- Recreate events policies with soft delete exclusion
CREATE POLICY "Anyone can view events"
ON events FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Admins can manage events"
ON events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name IN ('Admin', 'Super Admin')
  )
  AND deleted_at IS NULL
);

-- ============================================
-- PART 5: CREATE HELPER FUNCTIONS
-- ============================================

-- Function to soft delete a student
CREATE OR REPLACE FUNCTION soft_delete_student(
  student_id UUID,
  deleted_by_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE students 
  SET 
    deleted_at = NOW(),
    deleted_by = deleted_by_user_id
  WHERE id = student_id 
  AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete a teacher
CREATE OR REPLACE FUNCTION soft_delete_teacher(
  teacher_id UUID,
  deleted_by_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE teachers 
  SET 
    deleted_at = NOW(),
    deleted_by = deleted_by_user_id
  WHERE id = teacher_id 
  AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete an event
CREATE OR REPLACE FUNCTION soft_delete_event(
  event_id UUID,
  deleted_by_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE events 
  SET 
    deleted_at = NOW(),
    deleted_by = deleted_by_user_id
  WHERE id = event_id 
  AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a soft-deleted student
CREATE OR REPLACE FUNCTION restore_student(student_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE students 
  SET 
    deleted_at = NULL,
    deleted_by = NULL
  WHERE id = student_id 
  AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a soft-deleted teacher
CREATE OR REPLACE FUNCTION restore_teacher(teacher_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE teachers 
  SET 
    deleted_at = NULL,
    deleted_by = NULL
  WHERE id = teacher_id 
  AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a soft-deleted event
CREATE OR REPLACE FUNCTION restore_event(event_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE events 
  SET 
    deleted_at = NULL,
    deleted_by = NULL
  WHERE id = event_id 
  AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 6: CREATE VIEWS FOR ACTIVE RECORDS
-- ============================================

-- View for active students only
CREATE OR REPLACE VIEW active_students AS
SELECT * FROM students WHERE deleted_at IS NULL;

-- View for active teachers only
CREATE OR REPLACE VIEW active_teachers AS
SELECT * FROM teachers WHERE deleted_at IS NULL;

-- View for active events only
CREATE OR REPLACE VIEW active_events AS
SELECT * FROM events WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON VIEW active_students IS 'View showing only non-deleted student records';
COMMENT ON VIEW active_teachers IS 'View showing only non-deleted teacher records';
COMMENT ON VIEW active_events IS 'View showing only non-deleted event records';

-- ============================================
-- PART 7: VERIFICATION QUERIES
-- ============================================

-- Check that columns were added successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('students', 'teachers', 'events')
AND column_name IN ('deleted_at', 'deleted_by')
ORDER BY table_name, column_name;

-- Check that indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('students', 'teachers', 'events')
AND indexname LIKE '%deleted%'
ORDER BY tablename, indexname;

-- Check that functions were created
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%soft_delete%' 
OR routine_name LIKE '%restore%'
ORDER BY routine_name;

-- Check that views were created
SELECT 
  table_name,
  view_definition IS NOT NULL as has_definition
FROM information_schema.views
WHERE table_name IN ('active_students', 'active_teachers', 'active_events');

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Verify all columns, indexes, and functions were created
-- 2. Update application code to use soft delete functions
-- 3. Update queries to use active_* views or add WHERE deleted_at IS NULL
-- ============================================
