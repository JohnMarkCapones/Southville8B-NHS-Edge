-- Fix section_id type mismatch in quiz tables
-- Change from BIGINT to UUID to match the sections table

-- Fix quiz_sections table
ALTER TABLE quiz_sections
  ALTER COLUMN section_id TYPE UUID USING section_id::text::uuid;

-- Fix quiz_section_settings table
ALTER TABLE quiz_section_settings
  ALTER COLUMN section_id TYPE UUID USING section_id::text::uuid;

-- Verify the changes
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('quiz_sections', 'quiz_section_settings')
  AND column_name = 'section_id';
