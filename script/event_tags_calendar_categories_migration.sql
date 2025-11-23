-- ========================================
-- Event Tags: Calendar Categories Migration
-- ========================================
-- This migration creates the event tags system and adds
-- predefined tags for calendar event categories
--
-- Tables Created:
-- 1. event_tags - Stores tag definitions
-- 2. event_tag_associations - Many-to-many relationship between events and tags
--
-- Predefined Categories for Academic Calendar:
-- - School Holiday
-- - Academic Event
-- - School Event
-- - Professional Development
-- - No Class Day
-- - Important Deadline
-- ========================================

-- 1. Create event_tags table
CREATE TABLE IF NOT EXISTS event_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE,
  description text,
  color varchar(50) DEFAULT 'blue',
  icon varchar(50),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create event_tag_associations table (many-to-many)
CREATE TABLE IF NOT EXISTS event_tag_associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES event_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, tag_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_tags_name ON event_tags(name);
CREATE INDEX IF NOT EXISTS idx_event_tag_assoc_event_id ON event_tag_associations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tag_assoc_tag_id ON event_tag_associations(tag_id);

-- 4. Add comments to document the tables
COMMENT ON TABLE event_tags IS 'Stores event tag definitions for categorization';
COMMENT ON TABLE event_tag_associations IS 'Many-to-many relationship between events and tags';
COMMENT ON COLUMN event_tags.color IS 'Color for UI display (e.g., red, blue, green, or hex #FF0000)';
COMMENT ON COLUMN event_tags.icon IS 'Icon identifier for UI display';

-- 5. Insert predefined calendar category tags
INSERT INTO event_tags (name, description, color, icon) VALUES
  ('School Holiday', 'Official school holidays and breaks', 'red', 'calendar-x'),
  ('Academic Event', 'Academic-related events like exams, enrollment, grading periods', 'green', 'book-open'),
  ('School Event', 'General school events like foundation day, celebrations', 'blue', 'calendar-check'),
  ('Professional Development', 'Teacher training and professional development activities', 'yellow', 'graduation-cap'),
  ('No Class Day', 'Days when regular classes are suspended', 'purple', 'x-circle'),
  ('Important Deadline', 'Critical deadlines for submissions, enrollment, etc.', 'orange', 'alert-circle')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- Verification Queries
-- ========================================
-- Check that tags were created
SELECT id, name, color, icon FROM event_tags ORDER BY name;

-- Count tags
SELECT COUNT(*) as tag_count FROM event_tags;

-- ========================================
-- Example Usage
-- ========================================
/*
-- Add a tag to an event
INSERT INTO event_tag_associations (event_id, tag_id)
SELECT
  'your-event-uuid-here',
  id
FROM event_tags
WHERE name = 'School Holiday';

-- Get all events with a specific tag
SELECT e.*, t.name as tag_name, t.color as tag_color
FROM events e
JOIN event_tag_associations eta ON e.id = eta.event_id
JOIN event_tags t ON eta.tag_id = t.id
WHERE t.name = 'School Holiday'
  AND e.deleted_at IS NULL
ORDER BY e.date;

-- Get an event with all its tags
SELECT
  e.id,
  e.title,
  e.date,
  json_agg(
    json_build_object(
      'id', t.id,
      'name', t.name,
      'color', t.color,
      'icon', t.icon
    )
  ) as tags
FROM events e
LEFT JOIN event_tag_associations eta ON e.id = eta.event_id
LEFT JOIN event_tags t ON eta.tag_id = t.id
WHERE e.id = 'your-event-uuid-here'
GROUP BY e.id, e.title, e.date;

-- Get events for a specific date range with tags (for calendar display)
SELECT
  e.id,
  e.title,
  e.description,
  e.date,
  e.time,
  e.location,
  e.event_image,
  json_agg(
    DISTINCT jsonb_build_object(
      'id', t.id,
      'name', t.name,
      'color', t.color,
      'icon', t.icon
    )
  ) FILTER (WHERE t.id IS NOT NULL) as tags
FROM events e
LEFT JOIN event_tag_associations eta ON e.id = eta.event_id
LEFT JOIN event_tags t ON eta.tag_id = t.id
WHERE e.date BETWEEN '2025-11-01' AND '2025-11-30'
  AND e.deleted_at IS NULL
  AND e.status = 'published'
GROUP BY e.id
ORDER BY e.date, e.time;
*/

-- ========================================
-- Rollback Script (if needed)
-- ========================================
/*
-- CAUTION: This will remove all tags and associations
-- Only run this if you need to rollback the migration

DROP TABLE IF EXISTS event_tag_associations CASCADE;
DROP TABLE IF EXISTS event_tags CASCADE;
*/
