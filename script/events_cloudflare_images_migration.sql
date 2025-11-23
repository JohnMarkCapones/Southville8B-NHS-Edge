-- ========================================
-- Events Table: Cloudflare Images Migration
-- ========================================
-- This migration adds Cloudflare Images support to the events table
--
-- Changes:
-- 1. Add cf_image_id column for storing Cloudflare Images ID
-- 2. Add image_file_size column for storing file size
-- 3. Add image_mime_type column for storing MIME type
-- 4. Add deleted_at and deleted_by columns for soft delete support
-- 5. Add is_featured column for featuring events
--
-- The existing event_image column (varchar 500) will store the Cloudflare Images URL
-- Example: https://imagedelivery.net/<account-hash>/<image-id>/public
--
-- ========================================

-- 1. Add Cloudflare Images metadata columns
ALTER TABLE events
ADD COLUMN IF NOT EXISTS cf_image_id varchar(100),
ADD COLUMN IF NOT EXISTS image_file_size integer,
ADD COLUMN IF NOT EXISTS image_mime_type varchar(50);

-- 2. Add soft delete columns (if not already present)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES users(id);

-- 3. Add featured flag (if not already present)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- 4. Create index on cf_image_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_cf_image_id ON events(cf_image_id);

-- 5. Create index on deleted_at for soft delete queries
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at);

-- 6. Create index on is_featured for featured events queries
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured) WHERE is_featured = true;

-- 7. Add comments to document the new columns
COMMENT ON COLUMN events.cf_image_id IS 'Cloudflare Images ID for the event image';
COMMENT ON COLUMN events.image_file_size IS 'File size in bytes of the event image';
COMMENT ON COLUMN events.image_mime_type IS 'MIME type of the event image (e.g., image/jpeg, image/png)';
COMMENT ON COLUMN events.event_image IS 'Full Cloudflare Images URL for the event image';
COMMENT ON COLUMN events.deleted_at IS 'Timestamp when event was soft deleted (null if active)';
COMMENT ON COLUMN events.deleted_by IS 'User ID who deleted the event';
COMMENT ON COLUMN events.is_featured IS 'Flag to mark event as featured';

-- ========================================
-- Verification Query
-- ========================================
-- Run this to verify the migration was successful:
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
  AND column_name IN ('event_image', 'cf_image_id', 'image_file_size', 'image_mime_type', 'deleted_at', 'deleted_by', 'is_featured')
ORDER BY column_name;

-- ========================================
-- Example Usage After Migration
-- ========================================
/*
-- Insert event with Cloudflare Images
INSERT INTO events (
    title,
    description,
    date,
    time,
    location,
    organizer_id,
    event_image,
    cf_image_id,
    image_file_size,
    image_mime_type,
    status,
    visibility
) VALUES (
    'Science Fair 2025',
    'Annual showcase of student STEM projects',
    '2025-05-15',
    '9:00 AM',
    'Main Gymnasium',
    'your-user-uuid-here',
    'https://imagedelivery.net/abc123xyz/def456uvw/public',
    'def456uvw',
    245680,
    'image/jpeg',
    'published',
    'public'
);

-- Query featured events with images
SELECT
    id,
    title,
    date,
    event_image,
    cf_image_id,
    is_featured
FROM events
WHERE is_featured = true
  AND deleted_at IS NULL
  AND event_image IS NOT NULL
ORDER BY date DESC;

-- Soft delete an event
UPDATE events
SET deleted_at = now(),
    deleted_by = 'admin-user-uuid-here'
WHERE id = 'event-uuid-here';

-- Restore a soft-deleted event
UPDATE events
SET deleted_at = NULL,
    deleted_by = NULL
WHERE id = 'event-uuid-here';
*/

-- ========================================
-- Rollback Script (if needed)
-- ========================================
/*
-- CAUTION: This will remove the new columns and their data
-- Only run this if you need to rollback the migration

ALTER TABLE events
DROP COLUMN IF EXISTS cf_image_id,
DROP COLUMN IF EXISTS image_file_size,
DROP COLUMN IF EXISTS image_mime_type,
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by,
DROP COLUMN IF EXISTS is_featured;

DROP INDEX IF EXISTS idx_events_cf_image_id;
DROP INDEX IF EXISTS idx_events_deleted_at;
DROP INDEX IF EXISTS idx_events_is_featured;
*/
