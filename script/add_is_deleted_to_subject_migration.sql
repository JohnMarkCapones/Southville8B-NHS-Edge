-- ============================================
-- ADD IS_DELETED TO SUBJECT TABLE
-- Migration to support soft delete functionality
-- ============================================

-- Add is_deleted column for soft delete functionality
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN subjects.is_deleted IS 'Soft delete flag - marks subject as deleted without permanent removal';

-- Create index for filtering active subjects
CREATE INDEX IF NOT EXISTS idx_subjects_is_deleted ON subjects(is_deleted) WHERE is_deleted = FALSE;

-- ============================================
-- EXPLANATION:
-- ============================================
-- This column enables soft delete functionality for subjects:
--
-- is_deleted: Boolean flag (default FALSE)
--   - FALSE = Active subject (default state)
--   - TRUE = Soft deleted subject
--   - Allows for data recovery and audit trails
--   - Maintains referential integrity with related records
--
-- Index created for efficient filtering of active subjects
-- in queries that need to exclude deleted records
--
-- ============================================
