-- ========================================
-- Add club_id to Events Table Migration
-- ========================================
-- This migration adds club_id targeting to the events table
-- allowing events to be associated with specific clubs
--
-- Date: 2025-01-21
-- Author: Claude Code
--
-- ========================================

-- 1. Add club_id column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS club_id uuid;

-- 2. Add foreign key constraint to clubs table
ALTER TABLE events
ADD CONSTRAINT IF NOT EXISTS events_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);

-- 4. Create partial index for active events with club_id
CREATE INDEX IF NOT EXISTS idx_events_club_id_active 
ON events(club_id) 
WHERE deleted_at IS NULL;

-- 5. Add comment for documentation
COMMENT ON COLUMN events.club_id IS 'Optional club ID - if set, event is targeted to specific club members';

-- 6. Update the active_events view to include club_id
DROP VIEW IF EXISTS active_events;
CREATE VIEW active_events AS
  SELECT * FROM events WHERE deleted_at IS NULL;

-- 7. Create a view for club-specific events
CREATE OR REPLACE VIEW club_events AS
  SELECT 
    e.*,
    c.name as club_name,
    c.description as club_description
  FROM events e
  LEFT JOIN clubs c ON e.club_id = c.id
  WHERE e.deleted_at IS NULL;

-- 8. Add comment for the new view
COMMENT ON VIEW club_events IS 'Events with club information - includes all active events with optional club details';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name = 'club_id';

-- Check foreign key constraint
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'events'
AND kcu.column_name = 'club_id';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'events' 
AND indexname LIKE '%club_id%';
