-- Simplify Soft Delete Migration
-- Remove deleted_by columns to eliminate foreign key relationship issues
-- Keep only deleted_at for simple soft delete functionality

-- Remove deleted_by columns
ALTER TABLE students DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE teachers DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE events DROP COLUMN IF EXISTS deleted_by;

-- Keep deleted_at columns (they should already exist)
-- ALTER TABLE students ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- ALTER TABLE teachers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Update soft delete functions to only use deleted_at
CREATE OR REPLACE FUNCTION soft_delete_student(p_student_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE students 
  SET deleted_at = NOW()
  WHERE id = p_student_id AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_teacher(p_teacher_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE teachers 
  SET deleted_at = NOW()
  WHERE id = p_teacher_id AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_event(p_event_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE events 
  SET deleted_at = NOW()
  WHERE id = p_event_id AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Restore functions remain the same
CREATE OR REPLACE FUNCTION restore_student(p_student_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE students 
  SET deleted_at = NULL
  WHERE id = p_student_id AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_teacher(p_teacher_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE teachers 
  SET deleted_at = NULL
  WHERE id = p_teacher_id AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_event(p_event_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE events 
  SET deleted_at = NULL
  WHERE id = p_event_id AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Views for active records remain the same
CREATE OR REPLACE VIEW active_students AS SELECT * FROM students WHERE deleted_at IS NULL;
CREATE OR REPLACE VIEW active_teachers AS SELECT * FROM teachers WHERE deleted_at IS NULL;
CREATE OR REPLACE VIEW active_events AS SELECT * FROM events WHERE deleted_at IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON students(deleted_at);
CREATE INDEX IF NOT EXISTS idx_teachers_deleted_at ON teachers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at);
